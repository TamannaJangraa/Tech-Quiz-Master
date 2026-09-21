import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Home,
  Medal,
  Crown,
  Target,
  Users,
  Award,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";

const normalize = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const Leaderboard = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================
  // LOAD DATA
  // =====================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        // LOAD QUIZZES
        const quizData = await apiRequest(
          "/admin/public-quizzes",
          "GET",
          null,
          token
        );

        const availableQuizzes =
          quizData?.quizzes ||
          (Array.isArray(quizData)
            ? quizData
            : []);

        // LOAD LEADERBOARD
        const leaderboardData =
          await apiRequest(
            "/results/leaderboard",
            "GET",
            null,
            token
          );

        const results =
          leaderboardData?.results ||
          (Array.isArray(leaderboardData)
            ? leaderboardData
            : []);

        const quizMap = new Map();

        availableQuizzes.forEach((quiz) => {
          const technology = String(
            quiz.technology || ""
          ).trim();

          const level = String(
            quiz.level || ""
          ).trim();

          if (!technology) return;

          const key = `${normalize(
            technology
          )}-${normalize(level)}`;

          quizMap.set(key, {
            id: quiz._id || key,
            technology,
            level,
          });
        });

        results.forEach((result) => {
          const technology = String(
            result.technology || ""
          ).trim();

          const level = String(
            result.level || ""
          ).trim();

          if (!technology) return;

          const key = `${normalize(
            technology
          )}-${normalize(level)}`;

          if (!quizMap.has(key)) {
            quizMap.set(key, {
              id: key,
              technology,
              level,
            });
          }
        });

        const finalQuizzes = Array.from(
          quizMap.values()
        );

        setQuizzes(finalQuizzes);
        setLeaderboard(results);

        if (finalQuizzes.length > 0) {
          setSelectedQuiz(
            finalQuizzes[0].id
          );
        }
      } catch (err) {
        console.error(
          "LEADERBOARD ERROR:",
          err
        );

        setError(
          err.message ||
            "Failed to load leaderboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getToken]);

  // =====================================
  // CURRENT QUIZ
  // =====================================

  const currentQuiz = quizzes.find(
    (quiz) =>
      quiz.id === selectedQuiz
  );

  // =====================================
  // SELECTED LEADERBOARD
  // =====================================

  const selectedLeaderboard =
    currentQuiz
      ? leaderboard
          .filter((item) => {
            return (
              normalize(
                item.technology
              ) ===
                normalize(
                  currentQuiz.technology
                ) &&
              normalize(item.level) ===
                normalize(
                  currentQuiz.level
                )
            );
          })
          .sort((a, b) => {
            if (
              b.percentage !==
              a.percentage
            ) {
              return (
                b.percentage -
                a.percentage
              );
            }

            if (
              b.correct !== a.correct
            ) {
              return (
                b.correct - a.correct
              );
            }

            return (
              new Date(a.createdAt) -
              new Date(b.createdAt)
            );
          })
      : [];

  // =====================================
  // CURRENT USER
  // =====================================

  const currentUserIndex =
    selectedLeaderboard.findIndex(
      (item) =>
        item.userId === user?.id
    );

  const currentUser =
    currentUserIndex >= 0
      ? selectedLeaderboard[
          currentUserIndex
        ]
      : null;

  // =====================================
  // RANK ICON
  // =====================================

  const getRankIcon = (index) => {
    if (index === 0) {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <Crown
            className="h-6 w-6"
            strokeWidth={2.5}
          />
        </div>
      );
    }

    if (index === 1) {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Medal
            className="h-6 w-6"
            strokeWidth={2.5}
          />
        </div>
      );
    }

    if (index === 2) {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <Medal
            className="h-6 w-6"
            strokeWidth={2.5}
          />
        </div>
      );
    }

    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
        <span className="text-sm font-bold text-slate-500">
          #{index + 1}
        </span>
      </div>
    );
  };

  // =====================================
  // TOP PLAYER CARD
  // =====================================

  const getTopCard = (
    item,
    index
  ) => {
    if (!item) return null;

    const isCurrentUser =
      item.userId === user?.id;

    const medal =
      index === 0
        ? "🥇"
        : index === 1
        ? "🥈"
        : "🥉";

    const position =
      index === 0
        ? "1st Place"
        : index === 1
        ? "2nd Place"
        : "3rd Place";

    const playerName =
      isCurrentUser
        ? "You"
        : item.userName ||
          item.playerName ||
          "Unknown Player";

    return (
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 text-center transition-all duration-200 ${
          isCurrentUser
            ? "border-indigo-200 bg-indigo-50 shadow-md"
            : "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md"
        }`}
      >
        {/* Top decoration */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

        {isCurrentUser && (
          <div className="absolute right-3 top-4 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
            YOU
          </div>
        )}

        <div className="mt-1 text-3xl">
          {medal}
        </div>

        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          {position}
        </p>

        <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
          {playerName
            .charAt(0)
            .toUpperCase()}
        </div>

        <h3 className="mt-3 truncate text-lg font-bold text-slate-900">
          {playerName}
        </h3>

        <p className="mt-3 text-3xl font-extrabold text-indigo-600">
          {Math.round(
            item.percentage
          )}
          %
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {item.correct} /{" "}
          {item.totalQuestions} correct
        </p>
      </div>
    );
  };

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Trophy
                size={28}
                className="animate-pulse"
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Loading Leaderboard
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Finding the top performers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Trophy size={30} />
          </div>

          <p className="font-semibold text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <section className="mb-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
                <Trophy size={14} />
                Compete & Climb
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Leaderboard
              </h1>

              <p className="mt-2 max-w-xl text-slate-500">
                See how you rank against other
                participants and aim for the
                top spot.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/")
              }
              className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Home size={17} />
              Home
            </button>

          </div>
        </section>

        {/* ================= QUIZ SELECTOR ================= */}
        {quizzes.length > 0 && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-3 flex items-center gap-2">
              <Target
                size={18}
                className="text-indigo-600"
              />

              <label className="text-sm font-bold text-slate-800">
                Select Quiz
              </label>
            </div>

            <div className="relative">
              <select
                value={selectedQuiz}
                onChange={(e) =>
                  setSelectedQuiz(
                    e.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                {quizzes.map((quiz) => (
                  <option
                    key={quiz.id}
                    value={quiz.id}
                  >
                    {quiz.technology?.toUpperCase()}{" "}
                    Quiz — {quiz.level}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </section>
        )}

        {/* ================= QUIZ INFO ================= */}
        {currentQuiz && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Current Quiz
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                {currentQuiz.technology?.toUpperCase()}{" "}
                Quiz
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {currentQuiz.level} Level
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm">
              <Users
                size={17}
                className="text-indigo-600"
              />

              {selectedLeaderboard.length}{" "}
              {selectedLeaderboard.length === 1
                ? "Participant"
                : "Participants"}
            </div>

          </div>
        )}

        {/* ================= NO QUIZZES ================= */}
        {quizzes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Trophy size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No quizzes available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No quizzes or quiz attempts are
              available yet.
            </p>

          </div>
        )}

        {/* ================= LEADERBOARD ================= */}
        {selectedLeaderboard.length > 0 && (
          <>
            {/* TOP THREE */}
            {selectedLeaderboard.length >= 3 && (
              <section className="mb-8 grid gap-5 md:grid-cols-3">

                {getTopCard(
                  selectedLeaderboard[0],
                  0
                )}

                {getTopCard(
                  selectedLeaderboard[1],
                  1
                )}

                {getTopCard(
                  selectedLeaderboard[2],
                  2
                )}

              </section>
            )}

            {/* ================= CURRENT USER ================= */}
            {currentUser && (
              <section className="mb-8 overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50">

                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                      <Award size={23} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Your Ranking
                      </p>

                      <p className="mt-1 text-xl font-extrabold text-slate-900">
                        #{currentUserIndex + 1}
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-8 sm:flex sm:items-center sm:gap-10">

                    <div>
                      <p className="text-xs text-slate-500">
                        Score
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {currentUser.correct}/
                        {
                          currentUser.totalQuestions
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Percentage
                      </p>

                      <p className="mt-1 font-bold text-indigo-600">
                        {Math.round(
                          currentUser.percentage
                        )}
                        %
                      </p>
                    </div>

                  </div>

                </div>
              </section>
            )}

            {/* ================= FULL LIST ================= */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* Header */}
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <Users
                    size={18}
                    className="text-indigo-600"
                  />

                  <h3 className="font-bold text-slate-900">
                    All Participants
                  </h3>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden grid-cols-12 gap-4 border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">

                <div className="col-span-2">
                  Rank
                </div>

                <div className="col-span-4">
                  Player
                </div>

                <div className="col-span-3">
                  Quiz
                </div>

                <div className="col-span-3 text-right">
                  Score
                </div>

              </div>

              {selectedLeaderboard.map(
                (item, index) => {
                  const isCurrentUser =
                    item.userId === user?.id;

                  const playerName =
                    isCurrentUser
                      ? "You"
                      : item.userName ||
                        item.playerName ||
                        "Unknown Player";

                  return (
                    <div
                      key={`${item.userId}-${item.technology}-${item.level}`}
                      className={`border-b border-slate-100 last:border-b-0 ${
                        isCurrentUser
                          ? "bg-indigo-50/70"
                          : "bg-white hover:bg-slate-50"
                      } transition-colors`}
                    >

                      {/* DESKTOP */}
                      <div className="hidden grid-cols-12 items-center gap-4 px-6 py-4 md:grid">

                        <div className="col-span-2">
                          {getRankIcon(index)}
                        </div>

                        <div className="col-span-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                              {playerName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900">
                                  {playerName}
                                </p>

                                {isCurrentUser && (
                                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white">
                                    YOU
                                  </span>
                                )}
                              </div>

                              {isCurrentUser && (
                                <p className="mt-0.5 text-xs text-indigo-600">
                                  That's you!
                                </p>
                              )}
                            </div>

                          </div>
                        </div>

                        <div className="col-span-3">
                          <p className="font-semibold text-slate-800">
                            {item.technology?.toUpperCase()}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.level}
                          </p>
                        </div>

                        <div className="col-span-3 text-right">

                          <p className="text-lg font-extrabold text-indigo-600">
                            {Math.round(
                              item.percentage
                            )}
                            %
                          </p>

                          <p className="text-xs text-slate-500">
                            {item.correct} /{" "}
                            {
                              item.totalQuestions
                            }{" "}
                            correct
                          </p>

                        </div>

                      </div>

                      {/* MOBILE */}
                      <div className="flex items-center gap-4 px-5 py-4 md:hidden">

                        {getRankIcon(index)}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">
                            <p className="truncate font-bold text-slate-900">
                              {playerName}
                            </p>

                            {isCurrentUser && (
                              <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white">
                                YOU
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.technology?.toUpperCase()}{" "}
                            • {item.level}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.correct}/
                            {
                              item.totalQuestions
                            }{" "}
                            correct
                          </p>

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-lg font-extrabold text-indigo-600">
                            {Math.round(
                              item.percentage
                            )}
                            %
                          </p>

                          <p className="text-[11px] text-slate-400">
                            Score
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </section>
          </>
        )}

        {/* ================= NO ATTEMPTS ================= */}
        {quizzes.length > 0 &&
          selectedLeaderboard.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                <Trophy size={28} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                No attempts yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Be the first one to complete
                this quiz and claim the top spot! 🚀
              </p>

              <button
                onClick={() =>
                  navigate("/quiz")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
              >
                Take Quiz
                <ArrowRight size={17} />
              </button>

            </div>
          )}

      </main>
    </div>
  );
};

export default Leaderboard;