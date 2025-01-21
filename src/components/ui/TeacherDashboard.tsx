import React, { useEffect, useState, useRef } from "react";
import { SupervisionRequest } from "@/interface/SupervisionRequest";
import { toast } from "sonner";

const TeacherDashboard: React.FC = () => {
  const [requests, setRequests] = useState<SupervisionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupervisionRequest | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const savedUser = sessionStorage.getItem("user");
  const teacherId = savedUser ? JSON.parse(savedUser).id : null;

  useEffect(() => {
    const fetchRequests = async () => {
      const response = await fetch(`http://localhost:3000/requests?teacherId=${teacherId}`);
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
      // Fetch the teacher's data (only necessary for "approved" status)
      let supervisor = null;
      if (status === "approved") {
        const teacherResponse = await fetch(`http://localhost:3000/teachers/${teacherId}`);
        if (!teacherResponse.ok) {
          throw new Error(`Failed to fetch teacher data. HTTP ${teacherResponse.status}`);
        }
        const teacher = await teacherResponse.json();
        supervisor = teacher.name;
      }
  
      // Prepare the update payload
      const updatePayload = {
        status,
        supervisor,
      };
  
      // Send PATCH request to update the backend
      const updateResponse = await fetch(`http://localhost:3000/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
  
      if (!updateResponse.ok) {
        throw new Error(`Failed to update request. HTTP ${updateResponse.status}`);
      }
  
      // Update the local state optimistically
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          String(request.id) === requestId ? { ...request, ...updatePayload } : request
        )
      );
  
      toast.success(
        `Request successfully ${status === "approved" ? "approved" : "denied"}!`
      );
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update the request. Please try again.");
    }
  };
  const renderStatus = (status: "pending" | "approved" | "denied") => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-gray-700">Pending</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                width="16"
                height="16"
              >
                <path d="M9 16.2l-3.5-3.6 1.4-1.4L9 13.4l8.2-8.2 1.4 1.4L9 16.2z" />
              </svg>
            </div>
            <span className="text-gray-700">Approved</span>
          </div>
        );
      case "denied":
        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                width="16"
                height="16"
              >
                <path d="M18.3 5.7l-1.4-1.4L12 9.2 7.1 4.3 5.7 5.7 10.6 10.6 5.7 15.5l1.4 1.4L12 12 16.9 16.9l1.4-1.4L13.4 10.6 18.3 5.7z" />
              </svg>
            </div>
            <span className="text-gray-700">Denied</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Supervision Requests</h1>

        <ul className="space-y-4">
          {requests.map((request) => (
            <li
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className="p-4 border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">{request.title}</h2>
                {renderStatus(request.status)}
              </div>
            </li>
          ))}
        </ul>

        {selectedRequest && (
          <div
            ref={detailsRef} // Attach the ref to the details section
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
              <strong>Status:</strong> {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
            </p>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => handleUpdateStatus(String(selectedRequest.id), "approved", teacherId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(String(selectedRequest.id), "denied", teacherId)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Deny
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
