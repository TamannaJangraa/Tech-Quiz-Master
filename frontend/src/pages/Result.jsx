import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  Trophy,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  Target,
  BarChart3,
  Award,
  ArrowRight,
  CircleHelp,
} from "lucide-react";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const {
    quiz,
    answers,
    playerName,
    attemptId,
  } = location.state || {};

  const [saved, setSaved] = useState(false);

  // ========================================
  // SCORE CALCULATION
  // ========================================

  const correctAnswers =
    quiz?.questions?.filter((question, index) => {
      const selectedAnswer = answers?.[index];

      if (question.answerText) {
        return selectedAnswer === question.answerText;
      }

      const answerIndex = ["A", "B", "C", "D"].indexOf(
        question.answerKey
      );

      return (
        selectedAnswer ===
        question.options?.[answerIndex]
      );
    }) || [];

  const score = correctAnswers.length;

  const totalQuestions =
    quiz?.questions?.length || 0;

  const wrongAnswers =
    totalQuestions - score;

  const percentage =
    totalQuestions > 0
      ? Math.round(
          (score / totalQuestions) * 100
        )
      : 0;

  // ========================================
  // PERFORMANCE MESSAGE
  // ========================================

  const getPerformanceMessage = () => {
    if (percentage >= 80) {
      return "Excellent performance! Keep up the great work.";
    }

    if (percentage >= 60) {
      return "Good job! A little more practice can take you even higher.";
    }

    if (percentage >= 40) {
      return "Nice attempt! Review the concepts and try again.";
    }

    return "Keep practicing. Every attempt helps you improve.";
  };

  // ========================================
  // SCORE COLOR
  // ========================================

  const getScoreStyle = () => {
    if (percentage >= 80) {
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
      };
    }

    if (percentage >= 60) {
      return {
        text: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-100",
      };
    }

    if (percentage >= 40) {
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
      };
    }

    return {
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    };
  };

  const scoreStyle = getScoreStyle();

  // ========================================
  // SAVE RESULT
  // ========================================

  useEffect(() => {
    if (!quiz || !answers || !playerName) return;

    const saveResult = async () => {
      try {
        const token = await getToken();

        const answerReview =
          quiz.questions.map(
            (question, index) => {
              const selectedAnswer =
                answers?.[index] || "";

              let correctAnswer = "";

              if (question.answerText) {
                correctAnswer =
                  question.answerText;
              } else if (
                question.answerKey
              ) {
                const answerIndex = [
                  "A",
                  "B",
                  "C",
                  "D",
                ].indexOf(
                  question.answerKey
                );

                correctAnswer =
                  question.options?.[
                    answerIndex
                  ] || "";
              }

              const isCorrect =
                selectedAnswer ===
                correctAnswer;

              return {
                question:
                  question.question,
                selectedAnswer,
                correctAnswer,
                isCorrect,
                explanation:
                  question.explanation ||
                  `The correct answer is "${correctAnswer}". Review this concept and try the question again.`,
              };
            }
          );

        const resultData = {
          attemptId: attemptId,
          playerName: playerName,
          technology: quiz.technology,
          level: quiz.level,
          totalQuestions: totalQuestions,
          correct: score,
          wrong: wrongAnswers,
          timeTaken: 0,
          startDate: new Date(),
          answerReview,
        };

        console.log(
          "SENDING RESULT:",
          resultData
        );

        const response = await apiRequest(
          "/results/save-result",
          "POST",
          resultData,
          token
        );

        console.log(
          "RESULT SAVED:",
          response
        );

        setSaved(true);
      } catch (error) {
        console.error(
          "SAVE RESULT ERROR:",
          error
        );
      }
    };

    if (!saved) {
      saveResult();
    }
  }, [
    getToken,
    quiz,
    answers,
    playerName,
    totalQuestions,
    score,
    wrongAnswers,
    saved,
    attemptId,
  ]);

  // ========================================
  // DIRECT RESULT PAGE OPEN
  // ========================================

  if (!quiz || !answers || !playerName) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Trophy size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            No quiz result found
          </h2>

          <p className="mt-2 text-slate-500">
            Complete a quiz to view your result.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
          >
            Go Home
            <ArrowRight size={17} />
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10">

        {/* ========================================
            RESULT HERO
        ======================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Top gradient area */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-10 text-center sm:px-10">

            <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                <Trophy size={32} />
              </div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-indigo-100">
                Quiz Completed
              </p>

              <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                Great job, {playerName}! 🎉
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                You have completed the{" "}
                <span className="font-semibold text-white">
                  {quiz.technology}
                </span>{" "}
                quiz.
              </p>

            </div>
          </div>

          {/* Score section */}
          <div className="px-5 py-8 sm:px-8">

            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">

              {/* SCORE */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center">

                <div
                  className={`flex h-36 w-36 items-center justify-center rounded-full border-[10px] ${scoreStyle.border} ${scoreStyle.bg}`}
                >
                  <div>
                    <p
                      className={`text-4xl font-extrabold ${scoreStyle.text}`}
                    >
                      {percentage}%
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      SCORE
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-2xl font-bold text-slate-900">
                  {score} / {totalQuestions}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {getPerformanceMessage()}
                </p>

              </div>

              {/* STATS */}
              <div className="flex flex-col justify-center">

                <div className="grid grid-cols-2 gap-4">

                  {/* Correct */}
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
                      <CheckCircle size={22} />
                    </div>

                    <p className="mt-4 text-sm font-medium text-emerald-700">
                      Correct Answers
                    </p>

                    <p className="mt-1 text-3xl font-extrabold text-emerald-700">
                      {score}
                    </p>
                  </div>

                  {/* Wrong */}
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
                      <XCircle size={22} />
                    </div>

                    <p className="mt-4 text-sm font-medium text-red-700">
                      Wrong Answers
                    </p>

                    <p className="mt-1 text-3xl font-extrabold text-red-700">
                      {wrongAnswers}
                    </p>
                  </div>

                </div>

                {/* Quiz details */}
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex flex-wrap items-center justify-between gap-4">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Quiz
                      </p>

                      <p className="mt-1 text-lg font-bold capitalize text-slate-900">
                        {quiz.technology}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Difficulty
                      </p>

                      <p className="mt-1 text-lg font-bold capitalize text-indigo-600">
                        {quiz.level}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Questions
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {totalQuestions}
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            </div>

            {/* Save status */}
            <div className="mt-6 flex items-center justify-center">

              {saved ? (
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
                  <CheckCircle size={17} />
                  Result saved successfully
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                  Saving your result...
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
              >
                <Home size={18} />
                Back to Home
              </button>

              <button
                onClick={() => navigate("/quiz")}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw size={18} />
                Try Again
              </button>

              <button
                onClick={() =>
                  navigate("/my-results")
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                <BarChart3 size={18} />
                My Results
              </button>

            </div>

          </div>
        </div>

        {/* ========================================
            ANSWER REVIEW
        ======================================== */}

        <section className="mt-10">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <CircleHelp size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Answer Review
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your answers and learn from
                your mistakes.
              </p>
            </div>

          </div>

          <div className="space-y-4">

            {quiz.questions.map(
              (question, index) => {
                const selectedAnswer =
                  answers[index];

                let correctAnswer =
                  question.answerText;

                if (
                  !correctAnswer &&
                  question.answerKey
                ) {
                  const answerIndex = [
                    "A",
                    "B",
                    "C",
                    "D",
                  ].indexOf(
                    question.answerKey
                  );

                  correctAnswer =
                    question.options?.[
                      answerIndex
                    ];
                }

                const isCorrect =
                  selectedAnswer ===
                  correctAnswer;

                return (
                  <div
                    key={index}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                      isCorrect
                        ? "border-emerald-100"
                        : "border-red-100"
                    }`}
                  >

                    {/* Question top */}
                    <div className="flex gap-4 p-5 sm:p-6">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isCorrect
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle size={20} />
                        ) : (
                          <XCircle size={20} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Question{" "}
                            {index + 1}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              isCorrect
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {isCorrect
                              ? "Correct"
                              : "Incorrect"}
                          </span>
                        </div>

                        <h3 className="mt-2 text-base font-semibold leading-6 text-slate-900 sm:text-lg">
                          {question.question}
                        </h3>

                        {/* Answer boxes */}
                        <div className="mt-5 grid gap-3">

                          <div
                            className={`rounded-xl border p-4 ${
                              isCorrect
                                ? "border-emerald-100 bg-emerald-50/60"
                                : "border-red-100 bg-red-50/60"
                            }`}
                          >
                            <p
                              className={`text-xs font-bold uppercase tracking-wide ${
                                isCorrect
                                  ? "text-emerald-600"
                                  : "text-red-500"
                              }`}
                            >
                              Your Answer
                            </p>

                            <p
                              className={`mt-1 font-semibold ${
                                isCorrect
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              {selectedAnswer ||
                                "Not answered"}
                            </p>
                          </div>

                          {!isCorrect && (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                Correct Answer
                              </p>

                              <p className="mt-1 font-semibold text-emerald-700">
                                {correctAnswer}
                              </p>
                            </div>
                          )}

                        </div>

                        {/* Explanation */}
                        {!isCorrect &&
                          question.explanation && (
                            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                                Explanation
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-700">
                                {
                                  question.explanation
                                }
                              </p>
                            </div>
                          )}

                      </div>

                    </div>
                  </div>
                );
              }
            )}

          </div>
        </section>

        {/* ========================================
            FINAL CTA
        ======================================== */}

        <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <Award size={24} />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900">
            Want to improve your score?
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Review your mistakes and attempt another
            quiz to improve your performance.
          </p>

          <button
            onClick={() => navigate("/quiz")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
          >
            Try Another Quiz
            <ArrowRight size={17} />
          </button>

        </div>

      </main>
    </div>
  );
};

export default Result;