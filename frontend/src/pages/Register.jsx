import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser, SignInButton } from "@clerk/react";
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
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress || user?.primaryEmailAddress || "";

  const [fullName, setFullName] = useState(clerkFullName || "");
  const [email, setEmail] = useState(clerkEmail || "");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const digits = mobileNumber.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
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

      alert("Registration completed successfully!");
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to complete registration");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sign In to Register
          </h2>
          <p className="text-gray-600 mb-5">
            Please sign in or create an account before registering.
          </p>
          <SignInButton mode="modal">
            <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Sign In / Sign Up
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Student Registration 📝
          </h1>

          <p className="text-center text-gray-500 mt-3 mb-8">
            Complete your registration details below
          </p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Complete Registration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
