import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
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

        <button
          onClick={handleStartQuiz}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Start Quiz
        </button>
      </main>
    </div>
  );
};

export default Home;