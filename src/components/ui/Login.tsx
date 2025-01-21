import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const teacherResponse = await fetch(
        `http://localhost:3000/teachers?email=${email}&password=${password}`
      );
      const studentResponse = await fetch(
        `http://localhost:3000/students?email=${email}&password=${password}`
      );

      const teacher = await teacherResponse.json();
      const student = await studentResponse.json();

      if (teacher.length > 0) {
        login({ id: teacher[0].id, name: teacher[0].name, email: teacher[0].email, type: "teacher" });
        navigate(`/teacher/${teacher[0].id}`);
      } else if (student.length > 0) {
        login({ id: student[0].id, name: student[0].name, email: student[0].email, type: "student" });
        navigate(`/student/${student[0].id}`);
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="border w-full p-2 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border w-full p-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded w-full"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
