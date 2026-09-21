import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Eye,
  X,
  Trophy,
  ArrowRight,
  Target,
  CalendarDays,
  BarChart3,
  FileQuestion,
} from "lucide-react";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";

const MyResults = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedResult, setSelectedResult] = useState(null);

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
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[75vh] flex-col items-center justify-center">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
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
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <XCircle size={28} />
          </div>

          <p className="mt-4 font-semibold text-red-600">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Go Home
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // SUMMARY
  // ========================================

  const totalAttempts = results.length;

  const averageScore =
    totalAttempts > 0
      ? Math.round(
          results.reduce((sum, result) => {
            const percentage =
              result.totalQuestions > 0
                ? (result.correct / result.totalQuestions) * 100
                : 0;

            return sum + percentage;
          }, 0) / totalAttempts
        )
      : 0;

  const bestScore =
    totalAttempts > 0
      ? Math.max(
          ...results.map((result) =>
            result.totalQuestions > 0
              ? Math.round(
                  (result.correct /
                    result.totalQuestions) *
                    100
                )
              : 0
          )
        )
      : 0;

  const totalCorrect = results.reduce(
    (sum, result) =>
      sum + (result.correct || 0),
    0
  );

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
              <BarChart3 size={14} />
              Performance
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              My Quiz Results
            </h1>

            <p className="mt-2 text-slate-500">
              Track your attempts and monitor your
              progress over time.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
          >
            Back to Home
            <ArrowRight size={17} />
          </button>

        </div>

        {/* ================= SUMMARY CARDS ================= */}
        {results.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Attempts
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {totalAttempts}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileQuestion size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Average Score
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-indigo-600">
                    {averageScore}%
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <BarChart3 size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Best Score
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                    {bestScore}%
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Trophy size={22} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= RESULTS ================= */}
        <div className="mt-8">

          {results.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Target size={30} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No quiz attempts yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Complete your first quiz and your
                performance will appear here.
              </p>

              <button
                onClick={() => navigate("/quiz")}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
              >
                Take Your First Quiz
              </button>

            </div>
          ) : (
            <div className="space-y-5">

              {results.map((result, index) => {
                const percentage =
                  result.totalQuestions > 0
                    ? Math.round(
                        (result.correct /
                          result.totalQuestions) *
                          100
                      )
                    : 0;

                const hasReview =
                  Array.isArray(
                    result.answerReview
                  ) &&
                  result.answerReview.length > 0;

                return (
                  <div
                    key={result._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >

                    {/* TOP AREA */}
                    <div className="p-5 sm:p-6">

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex items-start gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Target size={22} />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-xl font-bold text-slate-900">
                                {result.technology
                                  ?.toUpperCase()}{" "}
                                Quiz
                              </h2>

                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                                {result.level}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                              <CalendarDays size={15} />

                              <span>
                                {result.createdAt
                                  ? new Date(
                                      result.createdAt
                                    ).toLocaleString()
                                  : "Date unavailable"}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* SCORE */}
                        <div className="sm:text-right">
                          <p className="text-3xl font-extrabold text-indigo-600">
                            {result.correct} /{" "}
                            {result.totalQuestions}
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {percentage}% Score
                          </p>
                        </div>

                      </div>

                      {/* SCORE BAR */}
                      <div className="mt-6">

                        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                          <span>Performance</span>

                          <span>
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                      </div>

                      {/* STATS */}
                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-emerald-50 p-4">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle size={18} />

                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Correct
                            </span>
                          </div>

                          <p className="mt-1 text-xl font-bold text-emerald-700">
                            {result.correct}
                          </p>
                        </div>

                        <div className="rounded-xl bg-red-50 p-4">
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle size={18} />

                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Wrong
                            </span>
                          </div>

                          <p className="mt-1 text-xl font-bold text-red-700">
                            {result.wrong}
                          </p>
                        </div>

                      </div>

                      {/* REVIEW */}
                      {hasReview && (
                        <button
                          onClick={() =>
                            setSelectedResult(
                              result
                            )
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-100"
                        >
                          <Eye size={18} />
                          Review Incorrect Answers
                        </button>
                      )}

                    </div>

                    {/* ATTEMPT NUMBER */}
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-400 sm:px-6">
                      Attempt #{results.length - index}
                    </div>

                  </div>
                );
              })}

            </div>
          )}
        </div>
      </main>

      {/* ========================================
          REVIEW MODAL
      ======================================== */}

      {selectedResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedResult(null);
            }
          }}
        >

          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-6">

              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Eye size={18} />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Review Incorrect Answers
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedResult.technology?.toUpperCase()}{" "}
                  • {selectedResult.level}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedResult(null)
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={22} />
              </button>

            </div>

            {/* QUESTIONS */}
            <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-5 sm:p-6">

              <div className="space-y-5">

                {selectedResult.answerReview
                  .filter(
                    (item) =>
                      item.isCorrect === false
                  )
                  .map((item, index) => (

                    <div
                      key={index}
                      className="rounded-2xl border border-red-100 bg-red-50/40 p-5"
                    >

                      <div className="flex gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                          <XCircle size={19} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="font-semibold leading-6 text-slate-900">
                            {index + 1}.{" "}
                            {item.question}
                          </p>

                          {/* YOUR ANSWER */}
                          <div className="mt-4 rounded-xl border border-red-100 bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                              Your Answer
                            </p>

                            <p className="mt-1 font-medium text-red-700">
                              {item.selectedAnswer ||
                                "Not answered"}
                            </p>
                          </div>

                          {/* CORRECT ANSWER */}
                          <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle
                                size={17}
                                className="text-emerald-600"
                              />

                              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                Correct Answer
                              </p>
                            </div>

                            <p className="mt-1 font-medium text-emerald-700">
                              {item.correctAnswer}
                            </p>
                          </div>

                          {/* EXPLANATION */}
                          {item.explanation && (
                            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                                Explanation
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-700">
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
                (item) =>
                  item.isCorrect === false
              ).length === 0 && (
                <div className="py-10 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <CheckCircle size={36} />
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    Perfect Score! 🎉
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
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