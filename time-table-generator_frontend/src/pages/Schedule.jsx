// src/pages/Schedule.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getCourses,
  addCourse,
  deleteAllCourses,
  deleteCoursesBySection,
} from "../api/courseApi";
import { getLecturers } from "../api/lecturerApi";
import { getSections } from "../api/sectionApi";
import { getRooms } from "../api/roomApi";
import WeeklyTable from "../components/WeeklyTable";
import { generateWeeklyTimetable } from "../utils/generateWeeklyTimetable";

const hours = [9, 10, 11, 13, 14, 15, 16];
const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Schedule() {
  const location = useLocation();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [weeklyData, setWeeklyData] = useState({});

  const coursesRef = useRef([]);
  const generationInProgress = useRef(false);

  useEffect(() => {
    coursesRef.current = courses;
  }, [courses]);

  async function loadCourses() {
    try {
      const all = await getCourses();
      setCourses(Array.isArray(all) ? all : []);
    } catch (err) {
      console.error("loadCourses error:", err);
      setMessage("❌ Failed to load courses");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const dataBySection = {};

    courses.forEach((c) => {
      const secName =
        c.sectionName ||
        (c.section &&
          (typeof c.section === "string" ? c.section : c.section.name)) ||
        "Unknown Section";

      const day = c.date || "Unknown";
      const startHour = parseInt((c.startTime || "0:00").split(":")[0], 10);

      if (!dataBySection[secName]) dataBySection[secName] = {};
      if (!dataBySection[secName][day]) dataBySection[secName][day] = {};
      dataBySection[secName][day][startHour] = c;
    });

    setWeeklyData(dataBySection);
  }, [courses]);

  // core generate wrapper
  async function runGenerateWeekly(subjectsArray) {
    if (!subjectsArray || !subjectsArray.length) return;
    if (generationInProgress.current) return;
    generationInProgress.current = true;
    setMessage("⏳ Generating weekly timetable...");
    try {
      const [lecturers, sections, rooms] = await Promise.all([
        getLecturers(),
        getSections(),
        getRooms(),
      ]);

      await generateWeeklyTimetable({
        subjects: subjectsArray,
        sections,
        lecturers,
        rooms,
        hours,
        addCourse,
      });

      await loadCourses();
      setMessage("✅ Schedule generated successfully!");
      navigate("/schedule", { replace: true });
    } catch (err) {
      console.error("Weekly generate failed", err);
      setMessage("❌ Weekly generation failed: " + (err?.message || err));
    } finally {
      generationInProgress.current = false;
    }
  }

  useEffect(() => {
    const subjects = location?.state?.subjects;
    if (subjects && Array.isArray(subjects) && subjects.length) {
      runGenerateWeekly(subjects);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state]);

  async function handleGenerateWeeklyFromServer() {
    try {
      await Promise.all([getSections(), getLecturers(), getRooms()]);

      const uniqueSubjects = Array.from(
        new Set(courses.map((c) => c.courseName))
      ).filter(Boolean);

      if (uniqueSubjects.length === 0) {
        setMessage(
          "No subjects available to generate weekly timetable. Please add subjects first."
        );
        return;
      }
      await runGenerateWeekly(uniqueSubjects);
    } catch (err) {
      console.error(err);
      setMessage("Failed to start weekly generation.");
    }
  }

  async function handleDeleteAllSchedules() {
    if (!window.confirm("Are you sure you want to delete ALL schedules?"))
      return;
    try {
      await deleteAllCourses();
      await loadCourses();
      setMessage("✅ All schedules deleted.");
    } catch (err) {
      console.error("Delete all schedules failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to delete all schedules.";
      setMessage("❌ " + msg);
    }
  }

  async function handleDeleteSectionSchedules(sectionName) {
    if (
      !window.confirm(
        `Delete ALL classes for section "${sectionName}"? This cannot be undone.`
      )
    )
      return;

    try {
      await deleteCoursesBySection(sectionName);
      await loadCourses();
      setMessage(`✅ All schedules deleted for section ${sectionName}.`);
    } catch (err) {
      console.error("Delete section schedules failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to delete section schedules.";
      setMessage("❌ " + msg);
    }
  }

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: 16, color: "#111827" }}>Weekly Timetable</h2>

      {message && (
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fefce8",
            color: "#854d0e",
            marginBottom: 16,
            fontSize: "0.9rem",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginBottom: 18,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleGenerateWeeklyFromServer}
          style={{
            padding: "9px 14px",
            background:
              "linear-gradient(135deg, rgba(239,68,68,1) 0%, rgba(248,113,113,1) 100%)",
            color: "white",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Generate Weekly Timetable
        </button>

        <button
          onClick={handleDeleteAllSchedules}
          style={{
            padding: "9px 14px",
            background:
              "linear-gradient(135deg, rgba(107,114,128,1) 0%, rgba(31,41,55,1) 100%)",
            color: "white",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Delete All Schedules
        </button>
      </div>

      {Object.keys(weeklyData).length === 0 ? (
        <p style={{ color: "#6b7280" }}>No timetable generated yet.</p>
      ) : (
        <WeeklyTable
          weeklyData={weeklyData}
          hours={hours}
          days={WEEK_DAYS}
          onDeleteSection={handleDeleteSectionSchedules}
        />
      )}
    </div>
  );
}
