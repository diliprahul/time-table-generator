import api from "./index"; // your existing API helper

// Save schedule — backend expects JSON object
export const saveSchedule = (schedule) =>
  api.request("/schedule/save", { // make sure this matches your backend endpoint
    method: "POST",
    body: schedule, // send object directly
  });
