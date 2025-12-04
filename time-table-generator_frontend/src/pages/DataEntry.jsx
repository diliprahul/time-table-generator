// src/pages/DataEntry.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLecturers, addLecturer, deleteLecturer } from "../api/lecturerApi";
import { getSections, addSection, deleteSection } from "../api/sectionApi";
import { getRooms, addRoom, deleteRoom } from "../api/roomApi";
import { generateWeeklyTimetable } from "../utils/generateWeeklyTimetable";
import { addCourse, deleteAllCourses } from "../api/courseApi";

// ---------- common styles ----------
const cardStyle = {
  flex: 1,
  background: "#ffffff",
  borderRadius: "12px",
  padding: "14px 16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  border: "1px solid #e5e7eb",
};

const cardHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const titleStyle = {
  margin: 0,
  fontSize: "1.05rem",
  fontWeight: 600,
  color: "#111827",
};

const inputStyle = {
  width: "100%",
  fontSize: "0.95rem",
  padding: "7px 9px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
};

const chipListItem = {
  fontSize: "0.95rem",
  marginBottom: 4,
};

const smallButtonBase = {
  padding: "5px 12px",
  fontSize: "0.8rem",
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
};

const smallButton = {
  ...smallButtonBase,
  background: "#e5f0ff",
  color: "#0b5ed7",
};

const smallDangerButton = {
  ...smallButtonBase,
  background: "#fee2e2",
  color: "#b91c1c",
};

const smallNeutralButton = {
  ...smallButtonBase,
  background: "#f3f4f6",
  color: "#374151",
};

const primaryButton = {
  padding: "10px 18px",
  fontSize: "0.95rem",
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
};

export default function DataEntry() {
  const [lecturers, setLecturers] = useState([]);
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [message, setMessage] = useState("");

  // Inputs
  const [lecturerBulk, setLecturerBulk] = useState(""); // multi-line "name,dept"
  const [sectionName, setSectionName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [subjectBulk, setSubjectBulk] = useState(""); // multi-line "sub,dept1,dept2"

  const navigate = useNavigate();

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    try {
      const [l, s, r] = await Promise.all([
        getLecturers(),
        getSections(),
        getRooms(),
      ]);

      setLecturers(Array.isArray(l) ? l : []);
      setSections(Array.isArray(s) ? s : []);
      setRooms(Array.isArray(r) ? r : []);
    } catch (err) {
      console.error("refreshAll error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Could not fetch lists.";
      setMessage("Could not fetch lists: " + msg);
    }
  }

  // -------------------- LECTURERS (bulk: "name,dept") --------------------
  async function handleAddLect(e) {
    e.preventDefault();
    const text = lecturerBulk.trim();
    if (!text) return;

    const lines = text.split(/\r?\n/);

    try {
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length === 0) continue;

        const name = parts[0];
        if (!name) continue;

        await addLecturer({ lecturerName: name }); // dept ignored in backend
      }

      setLecturerBulk("");
      refreshAll();
    } catch (err) {
      console.error("Add lecturer failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Add lecturer failed";
      alert(msg);
    }
  }

  async function handleDeleteLect(id) {
    if (!window.confirm("Delete this lecturer?")) return;
    try {
      await deleteLecturer(id);
      refreshAll();
    } catch (err) {
      console.error("Delete lecturer failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Delete lecturer failed";
      alert(msg);
    }
  }

  async function handleDeleteAllLecturers() {
    if (!lecturers.length) return;
    if (!window.confirm("Delete ALL lecturers?")) return;

    try {
      for (const l of lecturers) {
        await deleteLecturer(l.id);
      }
      await refreshAll();
      setMessage("✅ All lecturers deleted.");
    } catch (err) {
      console.error("Delete all lecturers failed:", err);
      alert("Delete all lecturers failed");
    }
  }

  // -------------------- SECTIONS --------------------
  async function handleAddSection(e) {
    e.preventDefault();
    if (!sectionName.trim()) return;

    try {
      await addSection({ sectionName });
      setSectionName("");
      refreshAll();
    } catch (err) {
      console.error("Add section failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Add section failed";
      alert(msg);
    }
  }

  async function handleDeleteSection(id) {
    if (!window.confirm("Delete this section?")) return;
    try {
      await deleteSection(id);
      refreshAll();
    } catch (err) {
      console.error("Delete section failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Delete section failed";
      alert(msg);
    }
  }

  async function handleDeleteAllSections() {
    if (!sections.length) return;
    if (!window.confirm("Delete ALL sections?")) return;

    try {
      for (const s of sections) {
        await deleteSection(s.id);
      }
      await refreshAll();
      setMessage("✅ All sections deleted.");
    } catch (err) {
      console.error("Delete all sections failed:", err);
      alert("Delete all sections failed");
    }
  }

  // -------------------- ROOMS --------------------
  async function handleAddRoom(e) {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    try {
      await addRoom({ roomNumber });
      setRoomNumber("");
      refreshAll();
    } catch (err) {
      console.error("Add room failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Add room failed";
      alert(msg);
    }
  }

  async function handleDeleteRoom(id) {
    if (!window.confirm("Delete this room?")) return;
    try {
      await deleteRoom(id);
      refreshAll();
    } catch (err) {
      console.error("Delete room failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Delete room failed";
      alert(msg);
    }
  }

  async function handleDeleteAllRooms() {
    if (!rooms.length) return;
    if (!window.confirm("Delete ALL rooms?")) return;

    try {
      for (const r of rooms) {
        await deleteRoom(r.id);
      }
      await refreshAll();
      setMessage("✅ All rooms deleted.");
    } catch (err) {
      console.error("Delete all rooms failed:", err);
      alert("Delete all rooms failed");
    }
  }

  // -------------------- SUBJECTS (bulk: "sub,dept1,dept2") --------------------
  function handleAddSubject(e) {
    e.preventDefault();
    const text = subjectBulk.trim();
    if (!text) return;

    const lines = text.split(/\r?\n/);
    const newSubjects = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 2) continue;

      const subName = parts[0];
      const depts = parts.slice(1);

      depts.forEach((d) => {
        if (!d) return;
        newSubjects.push({
          subjectName: subName,
          department: d.toUpperCase(),
        });
      });
    }

    if (!newSubjects.length) return;

    setSubjects((prev) => [...prev, ...newSubjects]);
    setSubjectBulk("");
  }

  function removeSubject(i) {
    setSubjects((s) => s.filter((_, idx) => idx !== i));
  }

  function handleDeleteAllSubjects() {
    if (!subjects.length) return;
    if (!window.confirm("Clear ALL subjects from list?")) return;
    setSubjects([]);
  }

  // -------------------- TIMETABLE --------------------
  async function handleGenerate() {
    if (subjects.length === 0) {
      setMessage("Add at least one subject before generating.");
      return;
    }

    setMessage("⏳ Generating weekly timetable...");

    try {
      await deleteAllCourses();

      await generateWeeklyTimetable({
        subjects,
        sections,
        lecturers,
        rooms,
        addCourse,
      });

      setMessage("✅ Weekly timetable generated. Go to Weekly Timetable page.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Generation failed: " + err.message);
    }
  }

  async function handleDeleteAllSchedules() {
    if (!window.confirm("Delete ALL schedules for all sections?")) return;

    try {
      await deleteAllCourses();
      setMessage("✅ All schedules deleted from database.");
    } catch (err) {
      console.error("Delete all schedules failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to delete schedules.";
      setMessage("❌ " + msg);
    }
  }

  return (
    <div style={{ padding: 24, background: "#f3f4f6", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: 16, color: "#111827" }}>Data Entry</h2>

      {message && (
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            color: "#1d4ed8",
            marginBottom: 16,
            fontSize: "0.9rem",
          }}
        >
          {message}
        </div>
      )}

      {/* Top Flex Layout */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
          alignItems: "flex-start",
        }}
      >
        {/* LECTURERS */}
        <form onSubmit={handleAddLect} style={cardStyle}>
          <div style={cardHeaderRow}>
            <h4 style={titleStyle}>Lecturers (bulk)</h4>
            <button
              type="button"
              style={smallDangerButton}
              onClick={handleDeleteAllLecturers}
            >
              Delete All
            </button>
          </div>

          <textarea
            value={lecturerBulk}
            onChange={(e) => setLecturerBulk(e.target.value)}
            rows={5}
            style={textareaStyle}
            placeholder={`Enter one per line: name,dept
Example:
dilip,cse
rahul,ece
keerthi,aiml`}
          />
          <button type="submit" style={{ ...smallButton, marginTop: 10 }}>
            Add Lecturers
          </button>

          <ul style={{ marginTop: 10 }}>
            {lecturers.map((l) => (
              <li key={l.id} style={chipListItem}>
                {l.lecturerName}
                <button
                  type="button"
                  style={{ ...smallNeutralButton, marginLeft: 8 }}
                  onClick={() => handleDeleteLect(l.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </form>

        {/* SECTIONS */}
        <form onSubmit={handleAddSection} style={cardStyle}>
          <div style={cardHeaderRow}>
            <h4 style={titleStyle}>Sections</h4>
            <button
              type="button"
              style={smallDangerButton}
              onClick={handleDeleteAllSections}
            >
              Delete All
            </button>
          </div>

          <input
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="Section Name (e.g. CSE-A, AIML-A, ECE-A)"
            style={inputStyle}
          />
          <button type="submit" style={{ ...smallButton, marginTop: 10 }}>
            Add Section
          </button>

          <ul style={{ marginTop: 10 }}>
            {sections.map((s) => (
              <li key={s.id} style={chipListItem}>
                {s.name || s.sectionName}
                <button
                  type="button"
                  style={{ ...smallNeutralButton, marginLeft: 8 }}
                  onClick={() => handleDeleteSection(s.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </form>

        {/* ROOMS */}
        <form onSubmit={handleAddRoom} style={cardStyle}>
          <div style={cardHeaderRow}>
            <h4 style={titleStyle}>Rooms</h4>
            <button
              type="button"
              style={smallDangerButton}
              onClick={handleDeleteAllRooms}
            >
              Delete All
            </button>
          </div>

          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="Room Number (e.g. 101, LAB1)"
            style={inputStyle}
          />
          <button type="submit" style={{ ...smallButton, marginTop: 10 }}>
            Add Room
          </button>

          <ul style={{ marginTop: 10 }}>
            {rooms.map((r) => (
              <li key={r.id} style={chipListItem}>
                {r.roomNumber}
                <button
                  type="button"
                  style={{ ...smallNeutralButton, marginLeft: 8 }}
                  onClick={() => handleDeleteRoom(r.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </form>
      </div>

      {/* SUBJECTS */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={cardHeaderRow}>
          <h4 style={titleStyle}>Subjects (bulk with departments)</h4>
          <button
            type="button"
            style={smallDangerButton}
            onClick={handleDeleteAllSubjects}
          >
            Delete All
          </button>
        </div>

        <form onSubmit={handleAddSubject}>
          <textarea
            value={subjectBulk}
            onChange={(e) => setSubjectBulk(e.target.value)}
            rows={5}
            style={textareaStyle}
            placeholder={`Enter one per line: subject,dept1,dept2,...
Example:
java,cse
python,cse,ece
ds lab,cse
circuits lab,ece`}
          />
          <button type="submit" style={{ ...smallButton, marginTop: 10 }}>
            Add Subjects
          </button>
        </form>

        <ul style={{ marginTop: 10 }}>
          {subjects.map((s, i) => (
            <li key={i} style={chipListItem}>
              {s.subjectName} ({s.department})
              <button
                type="button"
                onClick={() => removeSubject(i)}
                style={{ ...smallNeutralButton, marginLeft: 8 }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <button
          onClick={handleGenerate}
          style={{
            ...primaryButton,
            background:
              "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(59,130,246,1) 100%)",
            color: "white",
          }}
        >
          Generate Weekly Timetable
        </button>

        <button
          onClick={handleDeleteAllSchedules}
          style={{
            ...primaryButton,
            background:
              "linear-gradient(135deg, rgba(107,114,128,1) 0%, rgba(75,85,99,1) 100%)",
            color: "white",
          }}
        >
          Delete All Schedules
        </button>

        <button
          onClick={() => navigate("/schedule")}
          style={{
            ...primaryButton,
            background:
              "linear-gradient(135deg, rgba(16,185,129,1) 0%, rgba(34,197,94,1) 100%)",
            color: "white",
          }}
        >
          Go to Weekly Timetable
        </button>
      </div>
    </div>
  );
}
