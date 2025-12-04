import React from "react";
import CourseTable from "../components/CourseTable";
import SectionTable from "../components/SectionTable";
import RoomTable from "../components/RoomTable";
import LecturerTable from "../components/LecturerTable";
import NotificationTable from "../components/NotificationTable";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">College Scheduler Dashboard</h1>
      <CourseTable />
      <SectionTable />
      <RoomTable />
      <LecturerTable />
      <NotificationTable />
    </div>
  );
};

export default Dashboard;


