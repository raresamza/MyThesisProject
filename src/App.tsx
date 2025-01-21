import React from "react";
import './index.css'; // Path to your Tailwind CSS file
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProposeThesis from "./components/ui/ProposeThesis";
// import SupervisionRequests from "./components/ui/SupervisionRequests";
import SupervisedTheses from "./components/ui/SupervisedTheses";
import Navbar from "./components/ui/Navbar";
import { Toaster } from "sonner"; // Import the Toaster
import { AuthProvider } from "./components/ui/AuthContext";
import Login from "./components/ui/Login";
import StudentDashboard from "./components/ui/StudentDashboard";
import TeacherDashboard from "./components/ui/TeacherDashboard";


const App: React.FC = () => {
  return (
    <AuthProvider>
    <Router>
      <div className="bg-gray-50 min-h-screen">
        {/* Navbar */}
        <Navbar />

        <Toaster expand={true}/>


        {/* Main Content */}
        <main className="py-10">
          <Routes>
          <Route path="/" element={<ProposeThesis />} />
          {/* <Route path="/requests" element={<SupervisionRequests />} /> */}
          <Route path="/theses" element={<SupervisedTheses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/:id" element={<StudentDashboard />} />
          <Route path="/teacher/:id" element={<TeacherDashboard />} />
            {/* <Route path="/create-request" element={<CreateRequest />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
    </AuthProvider>
  );
};

export default App;