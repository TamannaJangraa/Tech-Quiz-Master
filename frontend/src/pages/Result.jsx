import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  Trophy,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
} from "lucide-react";
import { apiRequest } from "../services/api";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { quiz, answers } = location.state || {};

  const [saved, setSaved] = useState(false);

  // Directly Result page open hone par
  if (!quiz || !answers) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-800">
          No quiz result found
        </h2>

        <button
          onClick={() => navigate("/")}
          className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  // Score calculate
  const correctAnswers = quiz.questions.filter((question, index) => {
    const selectedAnswer = answers[index];

    if (question.answerText) {
      return selectedAnswer === question.answerText;
    }

    const answerIndex = ["A", "B", "C", "D"].indexOf(
      question.answerKey
    );

    return selectedAnswer === question.options?.[answerIndex];
  });

  const score = correctAnswers.length;
  const totalQuestions = quiz.questions.length;
  const wrongAnswers = totalQuestions - score;

  const percentage = Math.round(
    (score / totalQuestions) * 100
  );

  // Result backend + MongoDB me save
  useEffect(() => {
    const saveResult = async () => {
      try {
        const token = await getToken();

        const resultData = {
          technology: quiz.technology,
          level: quiz.level,
          totalQuestions: totalQuestions,
          correct: score,
          wrong: wrongAnswers,
          timeTaken: 0,
          startDate: new Date(),
        };

        console.log("SENDING RESULT:", resultData);

        const response = await apiRequest(
          "/results/save-result",
          "POST",
          resultData,
          token
        );

        console.log("RESULT SAVED:", response);

        setSaved(true);
      } catch (error) {
        console.error(
          "SAVE RESULT ERROR:",
          error
        );
      }
    };

    // Duplicate save prevent karne ke liye
    if (!saved) {
      saveResult();
    }
  }, [
    getToken,
    quiz,
    totalQuestions,
    score,
    wrongAnswers,
    saved,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Result Summary */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <Trophy
              size={42}
              className="text-yellow-600"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Quiz Completed! 🎉
          </h1>

          <p className="mt-2 text-gray-500">
            Here is your result for the {quiz.technology} quiz
          </p>

          <div className="my-8">
            <p className="text-5xl font-bold text-indigo-600">
              {score} / {totalQuestions}
            </p>

            <p className="mt-2 text-lg text-gray-500">
              {percentage}% Score
            </p>
          </div>

          {/* Optional save status */}
          {saved && (
            <p className="mb-5 text-sm font-medium text-green-600">
              ✓ Result saved successfully
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              <Home size={18} />
              Back to Home
            </button>

            <button
              onClick={() => navigate("/quiz")}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw size={18} />
              Try Again
            </button>
          </div>
        </div>

        {/* Answer Review */}
        <div className="mt-8">
          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            Answer Review
          </h2>

          <div className="space-y-5">
            {quiz.questions.map((question, index) => {
              const selectedAnswer = answers[index];

              let correctAnswer = question.answerText;

              if (!correctAnswer && question.answerKey) {
                const answerIndex = ["A", "B", "C", "D"].indexOf(
                  question.answerKey
                );

                correctAnswer =
                  question.options?.[answerIndex];
              }

              const isCorrect =
                selectedAnswer === correctAnswer;

              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex gap-3">
                    {isCorrect ? (
                      <CheckCircle className="shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="shrink-0 text-red-500" />
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {index + 1}. {question.question}
                      </h3>

                      <div className="mt-4 space-y-2 text-sm">
                        <p>
                          <span className="font-semibold text-gray-600">
                            Your answer:
                          </span>{" "}

                          <span
                            className={
                              isCorrect
                                ? "font-medium text-green-600"
                                : "font-medium text-red-600"
                            }
                          >
                            {selectedAnswer || "Not answered"}
                          </span>
                        </p>

                        {!isCorrect && (
                          <p>
                            <span className="font-semibold text-gray-600">
                              Correct answer:
                            </span>{" "}

                            <span className="font-medium text-green-600">
                              {correctAnswer}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;