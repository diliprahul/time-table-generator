// src/utils/generateWeeklyTimetable.js
// Generates weekly timetable entries avoiding lecturer/room overlaps,
// respecting department -> section mapping, and handling 3-hour labs.

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getSectionName(s) {
  return typeof s === "string"
    ? s
    : s.sectionName || s.name || "Section-?";
}
function getLecturerName(l) {
  return typeof l === "string"
    ? l
    : l.lecturerName || l.name || "Lecturer-?";
}
function getRoomNumber(r) {
  return typeof r === "string"
    ? r
    : r.roomNumber || r.roomNo || r.number || "Room-?";
}

// Infer department from section name: "CSE-A" -> "CSE", "ECE-A" -> "ECE", etc.
function getSectionDept(secName) {
  if (!secName) return null;
  const up = secName.toUpperCase();
  if (up.includes("CSE")) return "CSE";
  if (up.includes("AIML") || up.includes("AI ML") || up.includes("AI-ML"))
    return "AIML";
  if (up.includes("ECE")) return "ECE";
  if (up.includes("EEE")) return "EEE";
  if (up.includes("MECH")) return "MECH";
  if (up.includes("CIVIL")) return "CIVIL";
  return null;
}

/**
 * params:
 *  - subjects: array of subject strings OR objects { subjectName, department }
 *  - sections: array of section objects/strings
 *  - lecturers: array of lecturer objects/strings
 *  - rooms: array of room objects/strings
 *  - hours: array of start hours integers (e.g. [9,10,11,13,14,15,16])
 *  - addCourse: async function(course) -> posts to backend (optional)
 */
export async function generateWeeklyTimetable({
  subjects,
  sections,
  lecturers,
  rooms,
  hours = [9, 10, 11, 13, 14, 15, 16],
  addCourse,
}) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new Error("No subjects provided");
  }

  // fallback defaults
  sections =
    Array.isArray(sections) && sections.length
      ? sections
      : [{ sectionName: "Section-1" }];
  lecturers =
    Array.isArray(lecturers) && lecturers.length
      ? lecturers
      : [{ lecturerName: "Lecturer-1" }];
  rooms =
    Array.isArray(rooms) && rooms.length
      ? rooms
      : [{ roomNumber: "Room-1" }];

  // --- Canonical subjects: { name, dept } ---
  const canonSubjects = subjects
    .map((s) => {
      if (typeof s === "string") {
        return { name: s, dept: null }; // no dept restriction
      }
      const name = s.subjectName || s.name;
      if (!name) return null;
      const dept = s.department ? String(s.department).toUpperCase() : null;
      return { name, dept };
    })
    .filter(Boolean);

  if (canonSubjects.length === 0) {
    throw new Error("No valid subjects after normalization");
  }

  // --- Section meta: each section gets its own filtered subject list + index ---
  const sectionMeta = sections.map((sec) => {
    const secName = getSectionName(sec);
    const dept = getSectionDept(secName);
    // If subject has dept -> must match section dept
    // If subject.dept is null -> allowed for all
    const subjList = canonSubjects.filter((cs) => {
      if (!cs.dept || !dept) return true;
      return cs.dept === dept;
    });

    return {
      sec,
      secName,
      dept,
      subjList,
      subjIdx: 0, // round-robin index
    };
  });

  // occupancy maps: key = `${day}#${hour}`
  const occLect = new Map();
  const occRoom = new Map();
  const occSection = new Map(); // ensure section doesn't double-book
  const labScheduledForSection = new Map(); // secName -> Set(subject)

  const key = (d, h) => `${d}#${h}`;
  const isLectFree = (name, d, h) => {
    const s = occLect.get(key(d, h));
    return !s || !s.has(name);
  };
  const isRoomFree = (r, d, h) => {
    const s = occRoom.get(key(d, h));
    return !s || !s.has(r);
  };
  const isSecFree = (sec, d, h) => {
    const s = occSection.get(key(d, h));
    return !s || !s.has(sec);
  };
  const markLect = (name, d, h) => {
    const k = key(d, h);
    const s = occLect.get(k) || new Set();
    s.add(name);
    occLect.set(k, s);
  };
  const markRoom = (r, d, h) => {
    const k = key(d, h);
    const s = occRoom.get(k) || new Set();
    s.add(r);
    occRoom.set(k, s);
  };
  const markSec = (sec, d, h) => {
    const k = key(d, h);
    const s = occSection.get(k) || new Set();
    s.add(sec);
    occSection.set(k, s);
  };

  // find 3-hour consecutive starts for labs
  const threeStart = [];
  for (let i = 0; i <= hours.length - 3; i++) {
    if (
      hours[i + 1] === hours[i] + 1 &&
      hours[i + 2] === hours[i] + 2
    ) {
      threeStart.push(hours[i]);
    }
  }
  threeStart.sort((a, b) => a - b);

  const created = [];
  let lectIdx = 0;
  let roomIdx = 0;
  let secStart = 0; // round-robin starting section index

  for (const day of WEEK_DAYS) {
    for (let hIndex = 0; hIndex < hours.length; hIndex++) {
      const hour = hours[hIndex];

      // schedule for each section (round-robin)
      for (let si = 0; si < sectionMeta.length; si++) {
        const meta = sectionMeta[(secStart + si) % sectionMeta.length];
        const secName = meta.secName;

        // If section has no subjects at all (by dept filter), skip it
        if (!meta.subjList.length) continue;

        // skip if section is already occupied at this time
        if (!isSecFree(secName, day, hour)) continue;

        // pick next subject for THIS section
        let attempts = 0;
        let chosenSubj = meta.subjList[meta.subjIdx % meta.subjList.length];
        while (attempts < meta.subjList.length) {
          const candidate = meta.subjList[meta.subjIdx % meta.subjList.length];
          const subjName = candidate.name;
          const isLab = /lab/i.test(subjName);

          if (isLab) {
            // ensure this lab not already scheduled for this section
            const set = labScheduledForSection.get(secName) || new Set();
            if (set.has(subjName.toLowerCase())) {
              meta.subjIdx++;
              attempts++;
              continue;
            }
          }

          chosenSubj = candidate;
          break;
        }

        const subject = chosenSubj.name;
        const isLab = /lab/i.test(subject);

        if (isLab) {
          // try to find a 3-hour slot starting at or after this hour
          const candidates = [
            ...threeStart.filter((s) => s >= hour),
            ...threeStart.filter((s) => s < hour),
          ];
          let placed = false;

          for (const startH of candidates) {
            const slotHours = [startH, startH + 1, startH + 2];

            // ensure all slot hours exist and section free in all
            let conflict = false;
            for (const hh of slotHours) {
              if (!hours.includes(hh) || !isSecFree(secName, day, hh)) {
                conflict = true;
                break;
              }
            }
            if (conflict) continue;

            // find lecturer free in all 3 hours
            let pickedLect = null;
            for (let li = 0; li < lecturers.length; li++) {
              const L = lecturers[(lectIdx + li) % lecturers.length];
              const Lname = getLecturerName(L);
              let ok = true;
              for (const hh of slotHours) {
                if (!isLectFree(Lname, day, hh)) {
                  ok = false;
                  break;
                }
              }
              if (ok) {
                pickedLect = L;
                lectIdx = (lectIdx + li) % lecturers.length;
                break;
              }
            }
            if (!pickedLect) continue;

            // find room free in all 3 hours
            let pickedRoom = null;
            for (let ri = 0; ri < rooms.length; ri++) {
              const R = rooms[(roomIdx + ri) % rooms.length];
              const Rn = getRoomNumber(R);
              let ok = true;
              for (const hh of slotHours) {
                if (!isRoomFree(Rn, day, hh)) {
                  ok = false;
                  break;
                }
              }
              if (ok) {
                pickedRoom = R;
                roomIdx = (roomIdx + ri) % rooms.length;
                break;
              }
            }
            if (!pickedRoom) continue;

            // mark occupancy
            const Lname = getLecturerName(pickedLect);
            const Rn = getRoomNumber(pickedRoom);
            for (const hh of slotHours) {
              markLect(Lname, day, hh);
              markRoom(Rn, day, hh);
              markSec(secName, day, hh);
            }

            // record lab scheduled for this section
            const set =
              labScheduledForSection.get(secName) || new Set();
            set.add(subject.toLowerCase());
            labScheduledForSection.set(secName, set);

            const courseObj = {
              courseName: subject,
              lecturerName: Lname,
              sectionName: secName,
              roomNumber: Rn,
              startTime: `${startH}:00`,
              endTime: `${startH + 3}:00`,
              date: day,
            };

            if (typeof addCourse === "function") {
              try {
                const res = await addCourse(courseObj);
                created.push(res || courseObj);
              } catch (err) {
                console.error("addCourse lab failed", err, courseObj);
                created.push(courseObj);
              }
            } else {
              created.push(courseObj);
            }

            meta.subjIdx++;
            secStart = (secStart + 1) % sectionMeta.length;
            placed = true;
            break;
          }

          if (placed) continue; // next section
          // couldn't place lab -> skip at this hour
          continue;
        }

        // Non-lab course: find free lecturer and room at this (day,hour)
        let pickedLect = null;
        for (let li = 0; li < lecturers.length; li++) {
          const L = lecturers[(lectIdx + li) % lecturers.length];
          const Lname = getLecturerName(L);
          if (isLectFree(Lname, day, hour)) {
            pickedLect = L;
            lectIdx = (lectIdx + li) % lecturers.length;
            break;
          }
        }
        if (!pickedLect) continue;

        let pickedRoom = null;
        for (let ri = 0; ri < rooms.length; ri++) {
          const R = rooms[(roomIdx + ri) % rooms.length];
          const Rn = getRoomNumber(R);
          if (isRoomFree(Rn, day, hour)) {
            pickedRoom = R;
            roomIdx = (roomIdx + ri) % rooms.length;
            break;
          }
        }
        if (!pickedRoom) continue;

        const Lname = getLecturerName(pickedLect);
        const Rn = getRoomNumber(pickedRoom);
        markLect(Lname, day, hour);
        markRoom(Rn, day, hour);
        markSec(secName, day, hour);

        const courseObj = {
          courseName: subject,
          lecturerName: Lname,
          sectionName: secName,
          roomNumber: Rn,
          startTime: `${hour}:00`,
          endTime: `${hour + 1}:00`,
          date: day,
        };

        if (typeof addCourse === "function") {
          try {
            const res = await addCourse(courseObj);
            created.push(res || courseObj);
          } catch (err) {
            console.error("addCourse failed", err, courseObj);
            created.push(courseObj);
          }
        } else {
          created.push(courseObj);
        }

        meta.subjIdx++;
        secStart = (secStart + 1) % sectionMeta.length;
      }
    }
  }

  return created;
}
