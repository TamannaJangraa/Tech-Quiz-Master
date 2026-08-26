import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Question from "../components/Question";

const Quiz = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // सभी quizzes store करने के लिए
  const [quizzes, setQuizzes] = useState([]);

  // Selected quiz
  const [quiz, setQuiz] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // सभी quizzes load करना
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

        // सभी quizzes save करो
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

  // User quiz select करेगा
  const handleSelectQuiz = (selectedQuiz) => {
    console.log("SELECTED QUIZ:", selectedQuiz);

    setQuiz(selectedQuiz);

    // नया quiz शुरू होने पर सब reset
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

  // Next Question
  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      navigate("/result", {
        state: {
          quiz,
          answers,
        },
      });
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading quizzes...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">
          {error}
        </h2>

        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  // =========================
  // QUIZ SELECTION SCREEN
  // =========================

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl font-bold text-center mb-3">
            Choose Your Quiz
          </h1>

          <p className="text-gray-500 text-center mb-10">
            Select a technology and start your quiz
          </p>

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
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {quiz.technology} Quiz
            </h1>

            <p className="text-gray-500">
              Question {currentQuestion + 1} of{" "}
              {quiz.questions.length}
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