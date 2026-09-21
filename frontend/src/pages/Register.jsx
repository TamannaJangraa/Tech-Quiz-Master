import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAuth,
  useUser,
  SignInButton,
} from "@clerk/react";
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { registerStudent } from "../services/api.js";

const Register = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();

  const clerkFullName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const clerkEmail =
    user?.emailAddresses?.find(
      (e) =>
        e.id === user.primaryEmailAddressId
    )?.emailAddress ||
    user?.primaryEmailAddress ||
    "";

  const [fullName, setFullName] =
    useState(clerkFullName || "");

  const [email, setEmail] =
    useState(clerkEmail || "");

  const [mobileNumber, setMobileNumber] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Full Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const digits =
      mobileNumber.replace(/\D/g, "");

    if (digits.length < 10) {
      setError(
        "Please enter a valid 10-digit mobile number"
      );
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();

      await registerStudent(
        {
          fullName: fullName.trim(),
          email: email.trim(),
          mobileNumber: digits,
        },
        token
      );

      alert(
        "Registration completed successfully!"
      );

      navigate("/");
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err.message ||
          "Failed to complete registration"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  // ========================================
  // SIGN IN REQUIRED
  // ========================================

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <UserPlus size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Sign In to Register
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Please sign in or create an account
            before completing your student
            registration.
          </p>

          <SignInButton mode="modal">
            <button className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700">
              Sign In / Sign Up
              <ArrowRight size={17} />
            </button>
          </SignInButton>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl items-center justify-center px-5 py-10 sm:px-8">

        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 lg:grid-cols-[0.85fr_1.15fr]">

          {/* ================= LEFT INFO ================= */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white lg:block">

            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">

              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <UserPlus size={24} />
                </div>

                <h2 className="mt-7 text-3xl font-extrabold leading-tight">
                  Complete your
                  <br />
                  student profile
                </h2>

                <p className="mt-4 text-sm leading-6 text-indigo-100">
                  Register once and start
                  participating in quizzes,
                  tracking your scores, and
                  competing on the leaderboard.
                </p>
              </div>

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-indigo-100"
                  />

                  <span className="text-sm text-indigo-50">
                    Track your quiz performance
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-indigo-100"
                  />

                  <span className="text-sm text-indigo-50">
                    View your previous attempts
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-indigo-100"
                  />

                  <span className="text-sm text-indigo-50">
                    Compete on the leaderboard
                  </span>
                </div>

              </div>

              <div className="mt-10 flex items-center gap-2 text-xs text-indigo-200">
                <ShieldCheck size={16} />
                Your registration details are
                securely submitted.
              </div>

            </div>
          </div>

          {/* ================= FORM ================= */}
          <div className="p-6 sm:p-9">

            {/* Mobile heading */}
            <div className="mb-7 lg:hidden">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <UserPlus size={24} />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                Student Registration
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Complete your details to get
                started.
              </p>

            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block">
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Registration
              </p>

              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                Student Registration
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Complete your details to continue.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-7"
            >

              {/* FULL NAME */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* MOBILE */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mobile Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(
                        e.target.value
                      )
                    }
                    placeholder="Enter 10-digit mobile number"
                    maxLength={15}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading
                  ? "Submitting..."
                  : "Complete Registration"}

                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

            </form>

            {/* Footer note */}
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-emerald-500"
              />

              <p className="text-xs leading-5 text-slate-500">
                Your details are used to identify
                your quiz attempts and display
                your performance.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;