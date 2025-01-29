import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Request {
  id: number;
  title: string;
  description: string;
  status: "pending" | "approved" | "denied";
  teacherId: number;
  comments: { author: string; text: string }[]; // ✅ Ensure comments are part of the request
}

interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  timestamp: string;
}

interface User {
  id: number;
  name: string;
}

const StudentDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Request[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Fetch logged-in student from sessionStorage
  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch the student's submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `http://localhost:3000/requests?studentId=${user.id}`
        );
        const data: Request[] = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, [user]);

  // ✅ Function to add a comment as a student
  const handleAddComment = async (requestId: number) => {
    if (!user) {
      toast.error("User not logged in.");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/requests/${requestId}`
      );
      if (!response.ok) throw new Error("Failed to fetch request data.");
      const request = await response.json();

      const updatedComments = request.comments
        ? [...request.comments, { text: newComment, author: user.name }]
        : [{ text: newComment, author: user.name }];

      const updateResponse = await fetch(
        `http://localhost:3000/requests/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comments: updatedComments }),
        }
      );

      if (!updateResponse.ok) throw new Error("Failed to add comment.");

      // ✅ Force fetch the latest data from the server
      const updatedRequestResponse = await fetch(
        `http://localhost:3000/requests/${requestId}`
      );
      const updatedRequest = await updatedRequestResponse.json();

      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((req) =>
          req.id === requestId ? updatedRequest : req
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
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const response = await fetch(`http://localhost:3000/notifications?userId=${user.id}`);
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  // ✅ Function to mark a notification as read
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const updateResponse = await fetch(`http://localhost:3000/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (!updateResponse.ok) throw new Error("Failed to mark notification as read.");

      // ✅ Update state immediately
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-8">
        {user && (
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome, {user.name}
          </h1>
        )}


        {/* ✅ Notifications Section */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-600">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-3 border rounded-md shadow-sm ${
                  notification.read ? "bg-gray-200" : "bg-blue-100"
                } cursor-pointer`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <span className="text-gray-800">{notification.message}</span>
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          My Submissions
        </h2>
        {submissions.length === 0 ? (
          <p className="text-gray-600">
            You have not submitted any thesis proposals yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {submissions.map((submission) => (
              <li
                key={submission.id}
                onClick={() => setSelectedRequest(submission)}
                className="p-4 border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">{submission.title}</h3>
                  <span
                    className={`px-4 py-2 rounded-full text-white font-medium ${
                      submission.status === "pending"
                        ? "bg-blue-500"
                        : submission.status === "approved"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {submission.status.charAt(0).toUpperCase() +
                      submission.status.slice(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ✅ Display selected request details and comments */}
        {selectedRequest && (
          <div className="mt-8 p-4 border rounded-md bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">{selectedRequest.title}</h2>
            <p className="text-gray-700 mb-2">
              <strong>Description:</strong> {selectedRequest.description}
            </p>
            <p className="text-gray-700">
              <strong>Status:</strong>{" "}
              {selectedRequest.status.charAt(0).toUpperCase() +
                selectedRequest.status.slice(1)}
            </p>

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

            {/* ✅ Student Can Add a Comment */}
            <input
              type="text"
              placeholder="Write a comment..."
              className="border p-2 w-full mt-2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
              onClick={() => handleAddComment(selectedRequest.id)}
            >
              Add Comment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
