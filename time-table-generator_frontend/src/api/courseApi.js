// src/api/courseApi.js
import axios from "axios";

const API_BASE = "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Get all courses (uses /courses/allCourses from CourseController)
export async function getCourses() {
  const res = await api.get("/courses/allCourses");
  return res.data;
}

// ✅ Add a single course
export async function addCourse(course) {
  const res = await api.post("/courses/add", course);
  return res.data;
}

// ✅ Delete ALL courses (for all sections)
export async function deleteAllCourses() {
  await api.delete("/courses/deleteAll");
}

// ✅ Delete all courses for ONE section
// e.g. deleteCoursesBySection("CSE-A")
export async function deleteCoursesBySection(sectionName) {
  await api.delete(
    `/courses/deleteSection/${encodeURIComponent(sectionName)}`
  );
}

// (optional) delete single course if you need it anywhere else
export async function deleteCourse(id) {
  await api.delete(`/courses/delete/${id}`);
}
