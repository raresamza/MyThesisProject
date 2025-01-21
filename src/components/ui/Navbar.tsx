import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Button } from "../ui/button";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className=" mx-10 px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          MyThesis
        </Link>

        {/* Links */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              {/* Student-Specific Links */}
              {user.type === "student" && (
                <>
                  <Link
                    to={`/student/${user.id}`}
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Propose Thesis
                  </Link>
                  {/* <Link
                    to="/requests"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Supervision Requests
                  </Link> */}
                  <Link
                    to="/theses"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Supervised Theses
                  </Link>
                </>
              )}

              {/* Teacher-Specific Links */}
              {user.type === "teacher" && (
                <>
                  <Link
                    to={`/teacher/${user.id}`}
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Dashboard
                  </Link>
                  {/* <Link
                    to="/requests"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Supervision Requests
                  </Link> */}
                  <Link
                    to="/theses"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Supervised Theses
                  </Link>
                </>
              )}

              {/* Logout Button */}
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              {/* Links for Unauthenticated Users */}
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
