import React from "react";
import {
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trophy, BarChart3 } from "lucide-react";

const ADMIN_USER_ID = "user_3GzMxeTh7XrwPpPOEL0ybOpvvYN";

// Production Admin URL
const ADMIN_URL = "https://tech-quiz-master-admin.vercel.app";

const Navbar = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminRedirect = () => {
    // Local development
    if (window.location.hostname === "localhost") {
      const currentPort = window.location.port;

      if (currentPort === "5173") {
        window.location.href = "http://localhost:5174/";
      } else {
        window.location.href = "http://localhost:5173/";
      }
    }
    // Vercel production
    else {
      window.location.href = ADMIN_URL;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* ================= LOGO / BRAND ================= */}
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 text-left"
        >
          {/* Website Logo */}
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200 transition-transform duration-200 group-hover:scale-105">
            <img
              src="/logoquiz.png"
              alt="Tech Quiz Master"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Brand Name */}
          <div className="hidden sm:block">
            <h1 className="text-[19px] font-extrabold leading-tight tracking-tight text-slate-900">
              Tech Quiz <span className="text-indigo-600">Master</span>
            </h1>

            <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-500">
              Test • Learn • Improve
            </p>
          </div>
        </button>

        {/* ================= NAVIGATION ================= */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* My Results */}
          {isLoaded && isSignedIn && (
            <button
              onClick={() => navigate("/my-results")}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 sm:px-4 ${
                isActive("/my-results")
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              }`}
            >
              <BarChart3
                size={18}
                strokeWidth={2}
                className="transition-transform group-hover:scale-110"
              />

              <span className="hidden md:inline">
                My Results
              </span>
            </button>
          )}

          {/* Leaderboard */}
          <button
            onClick={() => navigate("/leaderboard")}
            className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 sm:px-4 ${
              isActive("/leaderboard")
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            }`}
          >
            <Trophy
              size={18}
              strokeWidth={2}
              className="transition-transform group-hover:scale-110"
            />

            <span className="hidden md:inline">
              Leaderboard
            </span>
          </button>

          {/* ================= ADMIN PANEL ================= */}
          {isLoaded &&
            isSignedIn &&
            user?.id === ADMIN_USER_ID && (
              <button
                onClick={handleAdminRedirect}
                className="ml-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300 sm:px-5"
              >
                <span className="hidden sm:inline">
                  Admin Panel
                </span>

                <span className="sm:hidden">
                  Admin
                </span>
              </button>
            )}

          {/* ================= REGISTER ================= */}
          {isLoaded && !isSignedIn && (
            <button
              onClick={() => navigate("/register")}
              className="ml-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300 sm:px-5"
            >
              Register
            </button>
          )}

          {/* ================= LOGIN / USER ================= */}
          {!isLoaded ? (
            <div className="ml-2 h-9 w-9 animate-pulse rounded-full bg-slate-200" />
          ) : !isSignedIn ? (
            <SignInButton mode="modal">
              <button className="ml-1 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 sm:px-5">
                Login
              </button>
            </SignInButton>
          ) : (
            <div className="ml-1 flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;