import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser, SignInButton } from "@clerk/react";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();

  const handleStartQuiz = () => {
    if (!isLoaded || !isSignedIn) return;
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Tech Quiz Master
        </h1>

        <p className="text-lg text-gray-600 max-w-xl mb-6">
          Test your technical knowledge and challenge yourself with quizzes.
        </p>

        {!isLoaded ? (
          <p className="text-gray-500">Loading...</p>
        ) : isSignedIn ? (
          <button
            onClick={handleStartQuiz}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Start Quiz
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Register Now
            </button>
            <SignInButton mode="modal">
              <button className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                Login
              </button>
            </SignInButton>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;