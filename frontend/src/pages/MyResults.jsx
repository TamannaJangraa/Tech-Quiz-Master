import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";

const MyResults = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedResult, setSelectedResult] =
    useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const token = await getToken();

        const data = await apiRequest(
          "/results/my-results",
          "GET",
          null,
          token
        );

        console.log("MY RESULTS:", data);

        setResults(data.results || data || []);
      } catch (err) {
        console.error("MY RESULTS ERROR:", err);

        setError(
          err.message || "Failed to load results"
        );
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [getToken]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="min-h-[80vh] flex items-center justify-center">
          <p className="text-gray-600">
            Loading your results...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-red-600 font-semibold">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <Navbar />

      <div className="mx-auto max-w-4xl mt-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Quiz Results
            </h1>

            <p className="mt-2 text-gray-500">
              Track your previous quiz attempts
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
          >
            Back to Home
          </button>
        </div>

        {/* NO RESULTS */}
        {results.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No quiz attempts yet
            </h2>

            <p className="mt-2 text-gray-500">
              Complete a quiz to see your results here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {results.map((result) => {
              const percentage =
                result.totalQuestions > 0
                  ? Math.round(
                      (result.correct /
                        result.totalQuestions) *
                        100
                    )
                  : 0;

              const hasReview =
                Array.isArray(result.answerReview) &&
                result.answerReview.length > 0;

              return (
                <div
                  key={result._id}
                  className="rounded-2xl bg-white p-6 shadow-md"
                >

                  {/* TOP */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {result.technology?.toUpperCase()} Quiz
                      </h2>

                      <p className="mt-1 text-gray-500">
                        Level: {result.level}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        {result.correct} /{" "}
                        {result.totalQuestions}
                      </p>

                      <p className="text-sm text-gray-500">
                        {percentage}% Score
                      </p>
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Correct Answers
                      </p>

                      <p className="text-lg font-bold text-green-600">
                        {result.correct}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Wrong Answers
                      </p>

                      <p className="text-lg font-bold text-red-600">
                        {result.wrong}
                      </p>
                    </div>
                  </div>

                  {/* DATE */}
                  <p className="mt-5 text-sm text-gray-400">
                    Attempted on:{" "}
                    {result.createdAt
                      ? new Date(
                          result.createdAt
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  {/* REVIEW BUTTON */}
                  {hasReview && (
                    <button
                      onClick={() =>
                        setSelectedResult(result)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                    >
                      <Eye size={18} />
                      Review Incorrect Answers
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================
          REVIEW MODAL
      ======================================== */}

      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Review Incorrect Answers
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedResult.technology?.toUpperCase()} •{" "}
                  {selectedResult.level}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedResult(null)
                }
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={22} />
              </button>

            </div>

            {/* QUESTIONS */}
            <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">

              <div className="space-y-5">

                {selectedResult.answerReview
                  .filter(
                    (item) => item.isCorrect === false
                  )
                  .map((item, index) => (

                    <div
                      key={index}
                      className="rounded-2xl border border-red-100 bg-red-50/40 p-5"
                    >

                      {/* QUESTION */}
                      <div className="flex gap-3">

                        <XCircle
                          size={22}
                          className="mt-0.5 shrink-0 text-red-500"
                        />

                        <div className="flex-1">

                          <p className="font-semibold text-gray-900">
                            {index + 1}.{" "}
                            {item.question}
                          </p>

                          {/* YOUR ANSWER */}
                          <div className="mt-4 rounded-lg bg-red-50 p-3">
                            <p className="text-xs font-semibold uppercase text-red-500">
                              Your Answer
                            </p>

                            <p className="mt-1 font-medium text-red-700">
                              {item.selectedAnswer ||
                                "Not answered"}
                            </p>
                          </div>

                          {/* CORRECT ANSWER */}
                          <div className="mt-3 rounded-lg bg-green-50 p-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle
                                size={17}
                                className="text-green-600"
                              />

                              <p className="text-xs font-semibold uppercase text-green-600">
                                Correct Answer
                              </p>
                            </div>

                            <p className="mt-1 font-medium text-green-700">
                              {item.correctAnswer}
                            </p>
                          </div>

                          {/* EXPLANATION */}
                          {item.explanation && (
                            <div className="mt-3 rounded-lg bg-indigo-50 p-3">
                              <p className="text-xs font-semibold uppercase text-indigo-600">
                                Explanation
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-700">
                                {item.explanation}
                              </p>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  ))}

              </div>

              {/* ALL CORRECT */}
              {selectedResult.answerReview.filter(
                (item) => item.isCorrect === false
              ).length === 0 && (
                <div className="py-10 text-center">
                  <CheckCircle
                    size={55}
                    className="mx-auto text-green-500"
                  />

                  <h3 className="mt-4 text-xl font-bold text-gray-800">
                    Perfect Score! 🎉
                  </h3>

                  <p className="mt-2 text-gray-500">
                    You didn't get any question wrong.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResults;