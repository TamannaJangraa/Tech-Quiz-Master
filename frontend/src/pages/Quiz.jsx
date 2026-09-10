import React, { useEffect, useState } from "react";
import { useAuth, useUser, SignInButton } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Question from "../components/Question";
import Navbar from "../components/Navbar";

const Quiz = () => {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);

  const [playerName, setPlayerName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load quizzes
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const token = await getToken();

        const data = await apiRequest(
          "/admin/public-quizzes",
          "GET",
          null,
          token
        );

        console.log("FULL API RESPONSE:", data);

        const availableQuizzes = data.quizzes || [];

        console.log("AVAILABLE QUIZZES:", availableQuizzes);

        if (availableQuizzes.length === 0) {
          setError("No quiz available right now.");
          return;
        }

        setQuizzes(availableQuizzes);
      } catch (err) {
        console.error("QUIZ ERROR:", err);
        setError(err.message || "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [getToken]);

  // Name submit
  const handleNameSubmit = () => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      alert("Please enter your name before starting the quiz.");
      return;
    }

    setPlayerName(trimmedName);
    setNameSubmitted(true);
  };

  // Select quiz
  const handleSelectQuiz = (selectedQuiz) => {
    console.log("SELECTED QUIZ:", selectedQuiz);

    setQuiz(selectedQuiz);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  // Answer select
  const handleAnswer = (answer) => {
    const updatedAnswers = [...answers];

    updatedAnswers[currentQuestion] = answer;

    setAnswers(updatedAnswers);

    console.log("SELECTED ANSWER:", answer);
  };

  // Next question
  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      navigate("/result", {
        state: {
          quiz,
          answers,
          playerName,
        },
      });
    }
  };

  // Auth guard
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
            Login Required
          </h2>
          <p className="text-gray-600 mb-5">
            Please sign in before starting the quiz.
          </p>
          <SignInButton mode="modal">
            <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Login
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center">
          Loading quizzes...
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4">
          <h2 className="text-xl font-semibold">{error}</h2>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // NAME SCREEN
  // =========================

  if (!nameSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900">
              Welcome to Tech Quiz Master 🎯
            </h1>

            <p className="text-center text-gray-500 mt-3 mb-8">
              Enter your name before starting the quiz
            </p>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name
          </label>

          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleNameSubmit();
              }
            }}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleNameSubmit}
            className="w-full mt-5 px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
          >
            Continue to Quiz
          </button>
        </div>
        </div>
      </div>
    );
  }

  // =========================
  // QUIZ SELECTION SCREEN
  // =========================

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <Navbar />
        <div className="max-w-4xl mx-auto mt-6">

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold">
              Choose Your Quiz
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome,{" "}
              <span className="font-semibold text-indigo-600">
                {playerName}
              </span>
            </p>

            <p className="text-gray-500 mt-1">
              Select a technology and start your quiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {quizzes.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-md p-6 border hover:border-indigo-500 transition-all"
              >
                <h2 className="text-2xl font-bold mb-2">
                  {item.technology} Quiz
                </h2>

                <p className="text-gray-500 mb-2">
                  Level: {item.level}
                </p>

                <p className="text-gray-500 mb-5">
                  {item.questions?.length || 0} Questions
                </p>

                <button
                  onClick={() => handleSelectQuiz(item)}
                  className="w-full px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Start {item.technology} Quiz
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // =========================
  // QUIZ QUESTIONS SCREEN
  // =========================

  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-6">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {quiz.technology} Quiz
            </h1>

            <p className="text-gray-500">
              Question {currentQuestion + 1} of{" "}
              {quiz.questions.length}
            </p>

            <p className="text-sm text-indigo-600 font-medium mt-1">
              Player: {playerName}
            </p>
          </div>

          <div className="font-semibold text-indigo-600">
            Level: {quiz.level}
          </div>
        </div>

        <Question
          question={question}
          selectedAnswer={answers[currentQuestion]}
          onAnswer={handleAnswer}
        />

        <div className="flex justify-between mt-8">

          <button
            onClick={() => setQuiz(null)}
            className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Change Quiz
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:bg-gray-400"
          >
            {currentQuestion === quiz.questions.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default Quiz;