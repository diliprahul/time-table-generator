// src/components/WeeklyTable.jsx
import React from "react";

// little color palette for sections
const sectionColors = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#0ea5e9",
];

function getSectionColor(index) {
  return sectionColors[index % sectionColors.length];
}

export default function WeeklyTable({ weeklyData, hours, days, onDeleteSection }) {
  const sectionNames = Object.keys(weeklyData || {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {sectionNames.map((sectionName, idx) => {
        const color = getSectionColor(idx);
        const sectionSchedule = weeklyData[sectionName] || {};

        return (
          <div
            key={sectionName}
            style={{
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px",
                background: color,
                color: "white",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    opacity: 0.9,
                    letterSpacing: "0.05em",
                  }}
                >
                  Section
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  {sectionName}
                </div>
              </div>

              {onDeleteSection && (
                <button
                  onClick={() => onDeleteSection(sectionName)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: "rgba(248,250,252,0.2)",
                    color: "white",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  Delete Section Schedule
                </button>
              )}
            </div>

            {/* Table */}
            <div style={{ padding: 12, overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  minWidth: 800,
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        padding: "8px 6px",
                        textAlign: "left",
                        background: "#f9fafb",
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                      }}
                    >
                      Time
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        style={{
                          borderBottom: "1px solid #e5e7eb",
                          padding: "8px 6px",
                          textAlign: "left",
                          background: "#f9fafb",
                        }}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((h) => (
                    <tr key={h}>
                      {/* time slot */}
                      <td
                        style={{
                          borderTop: "1px solid #f3f4f6",
                          padding: "6px",
                          fontWeight: 500,
                          background: "#f9fafb",
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                        }}
                      >
                        {h}:00 - {h + 1}:00
                      </td>

                      {days.map((day) => {
                        const courseForSlot =
                          (sectionSchedule[day] &&
                            sectionSchedule[day][h]) ||
                          null;

                        if (!courseForSlot) {
                          return (
                            <td
                              key={day}
                              style={{
                                borderTop: "1px solid #f3f4f6",
                                padding: "6px",
                                color: "#9ca3af",
                                fontStyle: "italic",
                              }}
                            >
                              -
                            </td>
                          );
                        }

                        return (
                          <td
                            key={day}
                            style={{
                              borderTop: "1px solid #f3f4f6",
                              padding: "6px 8px",
                              verticalAlign: "top",
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>
                              {courseForSlot.courseName}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#4b5563" }}>
                              {courseForSlot.lecturerName ||
                                (courseForSlot.lecturer &&
                                  courseForSlot.lecturer.lecturerName)}
                            </div>
                            <div
                              style={{
                                marginTop: 2,
                                fontSize: "0.78rem",
                                color: "#2563eb",
                              }}
                            >
                              Room{" "}
                              {courseForSlot.roomNumber ||
                                (courseForSlot.room &&
                                  courseForSlot.room.roomNumber)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
