import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { SupervisionRequest } from "../../interface/SupervisionRequest";

interface TeacherRequestsProps {
  teacher: string; // Name of the teacher whose requests to display
}

const TeacherRequests: React.FC<TeacherRequestsProps> = ({ teacher }) => {
  const [requests, setRequests] = useState<SupervisionRequest[]>([]);

  useEffect(() => {
    // Fetch requests for the specific teacher
    const fetchRequests = async () => {
      const response = await fetch(`http://localhost:3000/requests?teacher=${teacher}`);
      const data: SupervisionRequest[] = await response.json();
      setRequests(data);
    };

    fetchRequests();
  }, [teacher]);

  const handleApprove = async (id: number) => {
    await fetch(`http://localhost:3000/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });

    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req)));
  };

  const handleDeny = async (id: number) => {
    await fetch(`http://localhost:3000/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "denied" }),
    });

    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "denied" } : req)));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto max-w-3xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Requests for {teacher}
        </h1>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex justify-between items-center p-4 border rounded-md shadow-sm"
            >
              <div>
                <h2 className="text-lg font-bold">{request.title}</h2>
                <p className="text-sm text-gray-600">{request.description}</p>
                <p className="text-sm text-gray-500">Student: {request.student}</p>
                <p className={`text-sm font-medium ${request.status === "approved" ? "text-green-600" : request.status === "denied" ? "text-red-600" : "text-gray-600"}`}>
                  Status: {request.status}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  onClick={() => handleApprove(request.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
                >
                  <span>✔</span> Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeny(request.id)}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1"
                >
                  <span>✖</span> Deny
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherRequests;
