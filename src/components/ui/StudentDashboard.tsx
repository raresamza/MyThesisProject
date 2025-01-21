import React, { useEffect, useState } from "react";

interface Request {
  id: number;
  title: string;
  description: string;
  status: "pending" | "approved" | "denied";
  teacherId: number;
}

interface User {
  id: number;
  name: string;
}

const StudentDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Request[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Simulate fetching the logged-in student from context or session
  useEffect(() => {
    const loggedInUser = {
      id: 1, // Example user ID
      name: "Rares Amza",
    };
    setUser(loggedInUser);
  }, []);

  // Fetch the student's submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      try {
        const response = await fetch(`http://localhost:3000/requests?studentId=${user.id}`);
        const data: Request[] = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, [user]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-8">
        {user && <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.name}</h1>}

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-gray-600">You have not submitted any thesis proposals yet.</p>
        ) : (
          <ul className="space-y-4">
            {submissions.map((submission) => (
              <li
                key={submission.id}
                className="p-4 border rounded-md shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold">{submission.title}</h3>
                  <p className="text-gray-600">{submission.description}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-white font-medium ${
                    submission.status === "pending"
                      ? "bg-blue-500"
                      : submission.status === "approved"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
