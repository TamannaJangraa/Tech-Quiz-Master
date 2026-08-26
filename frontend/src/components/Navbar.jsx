import React from "react";
import {
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/react";
import { useNavigate } from "react-router-dom";

const ADMIN_USER_ID = "user_3GzMxeTh7XrwPpPOEL0ybOpvvYN";

const Navbar = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const navigate = useNavigate();

  const handleAdminRedirect = () => {
    window.location.href = "http://localhost:5174/";
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between">
      
      <h1
        onClick={() => navigate("/")}
        className="text-xl font-bold text-indigo-600 cursor-pointer"
      >
        Tech Quiz Master
      </h1>

      <div className="flex items-center gap-4">

        {/* My Results - Logged in user */}
        {isLoaded && isSignedIn && (
          <button
            onClick={() => navigate("/results")}
            className="text-gray-700 font-medium hover:text-indigo-600"
          >
            My Results
          </button>
        )}

        {/* Leaderboard */}
        <button
          onClick={() => navigate("/leaderboard")}
          className="text-gray-700 font-medium hover:text-indigo-600"
        >
          Leaderboard
        </button>

        {/* Admin Panel - Only your admin account */}
        {isLoaded &&
          isSignedIn &&
          user?.id === ADMIN_USER_ID && (
            <button
              onClick={handleAdminRedirect}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Admin Panel
            </button>
          )}

        {/* Login / User */}
        {!isLoaded ? (
          <p className="text-gray-500">Loading...</p>
        ) : !isSignedIn ? (
          <SignInButton mode="modal">
            <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg">
              Login
            </button>
          </SignInButton>
        ) : (
          <UserButton />
        )}

      </div>
    </nav>
  );
};

export default Navbar;