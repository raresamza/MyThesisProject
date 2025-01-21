import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {SupervisionRequest} from "../../interface/SupervisionRequest"


const SupervisionRequests: React.FC = () => {
  const [requests, setRequests] = useState<SupervisionRequest[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/requests")
      .then((res) => res.json())
      .then((data: SupervisionRequest[]) => setRequests(data));
  }, []);

  const handleAccept = async (id: number) => {
    await fetch(`http://localhost:3000/requests/${id}`, { method: "DELETE" });
    alert("Request accepted!");
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  return (
    <>
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Supervision Requests</h2>
      <ul className="space-y-2">
        {requests.map((request) => (
          <li key={request.id} className="flex items-center justify-between p-4 border rounded">
            <span>
              {request.title} - {request.student}
            </span>
            <Button variant="default" onClick={() => handleAccept(request.id)}>
              Accept
            </Button>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default SupervisionRequests;
