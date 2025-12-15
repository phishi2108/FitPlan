import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold">
        FitPlanHub
      </Link>

      <div className="flex gap-4">
        <Link to="/" className="hover:text-blue-200">
          All Plans
        </Link>

        {user ? (
          <>
            {/* Show Feed only to regular users */}
            {user.role === "user" && (
              <Link to="/feed" className="hover:text-blue-200">
                My Feed
              </Link>
            )}

            {/* Show Dashboard only to Trainers */}
            {user.role === "trainer" && (
              <Link
                to="/dashboard"
                className="bg-white text-blue-600 px-3 py-1 rounded font-bold"
              >
                Trainer Dashboard
              </Link>
            )}

            <span className="font-light opacity-80">Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-200">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
