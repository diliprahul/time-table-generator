import React, { useState } from "react";
import { deleteCourse } from "../api/courseApi";

export default function CourseTable({ courses=[] }){
  const [loading,setLoading] = useState(false);

  const handleDelete = async id => {
    try { await deleteCourse(id); window.location.reload(); }
    catch(err){ alert("Delete failed: "+err.message); }
  };

  const handleDeleteAll = async () => {
    if(!window.confirm("Delete all courses?")) return;
    try{ setLoading(true); for(const c of courses) await deleteCourse(c.id); window.location.reload(); }
    catch(err){ alert("Delete all failed: "+err.message); }
    finally{ setLoading(false); }
  };

  return (
    <div>
      <table border={1} cellPadding={6} cellSpacing={0} style={{width:"100%",marginBottom:10}}>
        <thead>
          <tr><th>Subject</th><th>Lecturer</th><th>Section</th><th>Room</th><th>Start</th><th>End</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {courses.map(c=>(
            <tr key={c.id}>
              <td>{c.courseName}</td>
              <td>{c.lecturerName}</td>
              <td>{c.section}</td>
              <td>{c.roomNumber}</td>
              <td>{c.startTime}</td>
              <td>{c.endTime}</td>
              <td><button onClick={()=>handleDelete(c.id)} disabled={loading}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {courses.length>0 && <button onClick={handleDeleteAll} disabled={loading} style={{background:"#ff4d4f",color:"white"}}>Delete All Classes</button>}
    </div>
  );
}
