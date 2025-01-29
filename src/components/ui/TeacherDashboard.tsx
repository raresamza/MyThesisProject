import React, { useEffect, useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { SupervisionRequest } from "@/interface/SupervisionRequest";
import { toast } from "sonner";

const TeacherDashboard: React.FC = () => {
  const [requests, setRequests] = useState<SupervisionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<SupervisionRequest | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const savedUser = sessionStorage.getItem("user");
  const teacherId = savedUser ? JSON.parse(savedUser).id : null;
  const [newComment, setNewComment] = useState<string>("");

  const sendEmailNotification = (
    studentEmail: string,
    studentName: string,
    thesisTitle: string,
    status: string,
    teacherName: string
  ) => {
    const emailParams = {
      student_name: studentName,  // ✅ Matches EmailJS template
      thesis_title: thesisTitle,    
      status: status,               
      teacher_name: teacherName,     
      email: studentEmail  // ✅ Optional: Use this if EmailJS needs it
    };
  
    console.log("Sending Email with Params:", emailParams); // ✅ Debugging log
  
    emailjs.send(
      "service_951q5np",  // Replace with your actual EmailJS service ID
      "template_2v4hwzo", // Replace with your actual EmailJS template ID
      emailParams,        // ✅ Correct email parameters
      "Zy0B4onkI03Mfq48g" // Replace with your EmailJS public key (User ID)
    )
    .then((response) => {
      console.log("Email sent successfully!", response);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
  };

  useEffect(() => {
    const fetchRequests = async () => {
      if (!teacherId) return;
      const response = await fetch(
        `http://localhost:3000/requests?teacherId=${teacherId}`
      );
      const data: SupervisionRequest[] = await response.json();
      setRequests(data);
    };

    fetchRequests();
  }, [teacherId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        setSelectedRequest(null); // Clear the selected request if clicked outside
      }
    };

    if (selectedRequest) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedRequest]);

  const sendNotification = async (studentId: string, message: string) => {
    try {
      const response = await fetch("http://localhost:3000/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: studentId,
          message,
          read: false, // Marks it as unread initially
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification. HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleAddComment = async () => {
    if (!teacherId) {
      toast.error("Teacher is not logged in.");
      return;
    }

    if (!selectedRequest) {
      toast.error("No request selected.");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      const requestIdStr = String(selectedRequest.id);

      const response = await fetch(
        `http://localhost:3000/requests/${requestIdStr}`
      );
      if (!response.ok) throw new Error("Failed to fetch request data.");
      const request = await response.json();

      const updatedComments = request.comments
        ? [...request.comments, { text: newComment, author: "Teacher" }]
        : [{ text: newComment, author: "Teacher" }];

      const updateResponse = await fetch(
        `http://localhost:3000/requests/${requestIdStr}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comments: updatedComments }),
        }
      );

      if (!updateResponse.ok) throw new Error("Failed to add comment.");

      // ✅ Fetch the updated request and update state
      const updatedRequestResponse = await fetch(
        `http://localhost:3000/requests/${requestIdStr}`
      );
      const updatedRequest = await updatedRequestResponse.json();

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === selectedRequest.id ? updatedRequest : req
        )
      );

      setSelectedRequest(updatedRequest); // ✅ Force UI update
      setNewComment(""); // ✅ Clear input field
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment.");
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    status: "approved" | "denied",
    teacherId: number | null
  ) => {
    if (!teacherId) {
      toast.error("Teacher is not logged in.");
      return;
    }

    try {
      // Fetch the request data
      const requestResponse = await fetch(
        `http://localhost:3000/requests/${requestId}`
      );
      if (!requestResponse.ok) throw new Error("Failed to fetch request data.");
      const request = await requestResponse.json();

      const studentName = request.student; // We now use student name instead of studentId
      if (!studentName) {
        console.error("Error: student name is missing!", request);
        toast.error("Error: The request does not have a student name.");
        return;
      }

      // ✅ Fetch all students to find the one that matches the name
      const studentsResponse = await fetch(`http://localhost:3000/students`);
      if (!studentsResponse.ok)
        throw new Error("Failed to fetch students list.");
      const students = await studentsResponse.json();

      // ✅ Find the student object by name
      const student = students.find(
        (s: { name: string }) => s.name === studentName
      );
      if (!student) {
        console.error(
          "Error: No matching student found in database!",
          students
        );
        toast.error("Error: No matching student found.");
        return;
      }

      let supervisor = null;
      if (status === "approved") {
        // Fetch teacher details
        const teacherResponse = await fetch(
          `http://localhost:3000/teachers/${teacherId}`
        );
        if (!teacherResponse.ok)
          throw new Error("Failed to fetch teacher data.");
        const teacher = await teacherResponse.json();
        supervisor = teacher.name;
        sendEmailNotification(student.email, student.name, request.title, status, teacher.name);
      }

      // Update the request status in the backend
      const updateResponse = await fetch(
        `http://localhost:3000/requests/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, supervisor }),
        }
      );

      if (!updateResponse.ok) throw new Error("Failed to update request.");

      // ✅ Update the local state immediately
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === Number(requestId) ? { ...req, status, supervisor } : req
        )
      );

      sendNotification(
        request.studentId,
        `Your thesis request "${request.title}" has been ${status} by ${
          status === "approved" ? supervisor : "your teacher"
        }.`
      );

      toast.success(`Request successfully ${status}!`);
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update the request.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Supervision Requests
        </h1>

        <ul className="space-y-4">
          {requests.map((request) => (
            <li
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className="p-4 border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">{request.title}</h2>
              </div>
            </li>
          ))}
        </ul>

        {/* Expanded request details */}
        {selectedRequest && (
          <div
            ref={detailsRef}
            className="mt-8 p-4 border rounded-md bg-gray-50"
          >
            <h2 className="text-2xl font-bold mb-4">{selectedRequest.title}</h2>
            <p className="text-gray-700 mb-2">
              <strong>Student:</strong> {selectedRequest.student}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Description:</strong> {selectedRequest.description}
            </p>
            <p className="text-gray-700">
              <strong>Status:</strong>{" "}
              {selectedRequest.status.charAt(0).toUpperCase() +
                selectedRequest.status.slice(1)}
            </p>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={() =>
                  handleUpdateStatus(
                    String(selectedRequest.id),
                    "approved",
                    teacherId
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Approve
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(
                    String(selectedRequest.id),
                    "denied",
                    teacherId
                  )
                }
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Deny
              </button>
            </div>

            {/* ✅ Show Comments Section */}
            <h3 className="text-lg font-semibold mt-6">Comments</h3>
            {selectedRequest?.comments &&
            selectedRequest.comments.length > 0 ? (
              <ul className="space-y-2">
                {selectedRequest.comments.map((comment, index) => (
                  <li key={index} className="p-2 border rounded-md bg-gray-100">
                    <strong>{comment.author}:</strong> {comment.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}

            {/* ✅ Add Comment Input */}
            <input
              type="text"
              placeholder="Add a comment..."
              className="border p-2 w-full mt-2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
              onClick={handleAddComment}
            >
              Add Comment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
