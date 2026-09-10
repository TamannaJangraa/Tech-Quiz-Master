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
  const [selectedQuiz, setSelectedQuiz] = useState("");

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
          (Array.isArray(quizData) ? quizData : []);

        // LOAD LEADERBOARD
        const leaderboardData = await apiRequest(
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
    (quiz) => quiz.id === selectedQuiz
  );

  // =====================================
  // SELECTED LEADERBOARD
  // =====================================
  const selectedLeaderboard = currentQuiz
    ? leaderboard
        .filter((item) => {
          return (
            normalize(item.technology) ===
              normalize(
                currentQuiz.technology
              ) &&
            normalize(item.level) ===
              normalize(currentQuiz.level)
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

          if (b.correct !== a.correct) {
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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Crown className="h-7 w-7 text-yellow-600" />
        </div>
      );
    }

    if (index === 1) {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
          <Medal className="h-6 w-6 text-slate-500" />
        </div>
      );
    }

    if (index === 2) {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100">
          <Medal className="h-6 w-6 text-orange-600" />
        </div>
      );
    }

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
        <span className="font-bold text-slate-500">
          #{index + 1}
        </span>
      </div>
    );
  };

  // =====================================
  // TOP 3 CARD
  // =====================================
  const getTopCard = (
    item,
    index
  ) => {
    if (!item) return null;

    const isCurrentUser =
      item.userId === user?.id;

    const position =
      index === 0
        ? "1st"
        : index === 1
        ? "2nd"
        : "3rd";

    const medal =
      index === 0
        ? "🥇"
        : index === 1
        ? "🥈"
        : "🥉";

    return (
      <div
        className={`relative rounded-2xl border p-5 text-center transition ${
          isCurrentUser
            ? "border-indigo-300 bg-indigo-50 shadow-md"
            : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        {isCurrentUser && (
          <div className="absolute right-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white">
            YOU
          </div>
        )}

        <div className="mb-2 text-3xl">
          {medal}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {position}
        </p>

        <h3 className="mt-1 truncate text-lg font-bold text-slate-900">
          {isCurrentUser
            ? "You"
            : item.userName ||
              item.playerName ||
              "Unknown Player"}
        </h3>

        <div className="mt-4">
          <p className="text-2xl font-extrabold text-indigo-600">
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

        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
              <Trophy
                size={42}
                className="text-indigo-600 animate-bounce"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
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

        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Trophy className="h-8 w-8 text-red-500" />
          </div>

          <p className="text-center font-semibold text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =====================================
            HERO HEADER
        ===================================== */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 shadow-lg sm:px-10">

          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
                <Trophy className="h-4 w-4 text-yellow-400" />
                COMPETE & CLIMB
              </div>

              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                Leaderboard 🏆
              </h1>

              <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
                See how you rank against other
                quiz participants and aim for
                the top spot.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              <Home size={18} />
              Home
            </button>

          </div>
        </section>

        {/* =====================================
            QUIZ SELECTOR
        ===================================== */}
        {quizzes.length > 0 && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />

              <label className="text-sm font-bold text-slate-800">
                Choose a Quiz
              </label>
            </div>

            <select
              value={selectedQuiz}
              onChange={(e) =>
                setSelectedQuiz(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {quizzes.map((quiz) => (
                <option
                  key={quiz.id}
                  value={quiz.id}
                >
                  {quiz.technology?.toUpperCase()} Quiz —{" "}
                  {quiz.level}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* =====================================
            QUIZ INFO
        ===================================== */}
        {currentQuiz && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-indigo-600">
                CURRENT QUIZ
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                {currentQuiz.technology?.toUpperCase()} Quiz
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {currentQuiz.level} Level
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200">
              <Users className="h-4 w-4 text-indigo-600" />

              <span className="text-sm font-semibold text-slate-700">
                {selectedLeaderboard.length}{" "}
                Participants
              </span>
            </div>

          </div>
        )}

        {/* =====================================
            NO QUIZZES
        ===================================== */}
        {quizzes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Trophy className="h-10 w-10 text-slate-300" />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              No quizzes available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No quizzes or quiz attempts are
              available yet.
            </p>

          </div>
        )}

        {/* =====================================
            TOP 3
        ===================================== */}
        {selectedLeaderboard.length > 0 && (
          <>
            {selectedLeaderboard.length >= 3 && (
              <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

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

            {/* =====================================
                CURRENT USER SUMMARY
            ===================================== */}
            {currentUser && (
              <section className="mb-8 overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50">

                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Award className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Your Ranking
                      </p>

                      <p className="text-lg font-extrabold text-slate-900">
                        You're ranked #
                        {currentUserIndex + 1}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-6">

                    <div>
                      <p className="text-xs text-slate-500">
                        Score
                      </p>

                      <p className="font-bold text-slate-900">
                        {currentUser.correct}/
                        {currentUser.totalQuestions}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Percentage
                      </p>

                      <p className="font-bold text-indigo-600">
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

            {/* =====================================
                FULL LEADERBOARD
            ===================================== */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* TABLE HEADER */}
              <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">

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

              {/* ROWS */}
              {selectedLeaderboard.map(
                (item, index) => {
                  const isCurrentUser =
                    item.userId ===
                    user?.id;

                  return (
                    <div
                      key={`${item.userId}-${item.technology}-${item.level}`}
                      className={`border-b border-slate-100 p-5 last:border-b-0 transition ${
                        isCurrentUser
                          ? "bg-indigo-50"
                          : "hover:bg-slate-50"
                      }`}
                    >

                      {/* DESKTOP */}
                      <div className="hidden grid-cols-12 items-center gap-4 md:grid">

                        <div className="col-span-2">
                          {getRankIcon(index)}
                        </div>

                        <div className="col-span-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                              {(
                                item.userName ||
                                item.playerName ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-bold text-slate-900">
                                {isCurrentUser
                                  ? "You"
                                  : item.userName ||
                                    item.playerName ||
                                    "Unknown Player"}
                              </p>

                              {isCurrentUser && (
                                <p className="text-xs font-medium text-indigo-600">
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

                          <p className="text-xs text-slate-500">
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
                      <div className="flex items-center gap-4 md:hidden">

                        <div className="shrink-0">
                          {getRankIcon(index)}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">

                            <p className="truncate font-bold text-slate-900">
                              {isCurrentUser
                                ? "You"
                                : item.userName ||
                                  item.playerName ||
                                  "Unknown Player"}
                            </p>

                            {isCurrentUser && (
                              <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white">
                                YOU
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.technology?.toUpperCase()} •{" "}
                            {item.level}
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

        {/* =====================================
            NO ATTEMPTS
        ===================================== */}
        {quizzes.length > 0 &&
          selectedLeaderboard.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
                <Trophy className="h-10 w-10 text-indigo-300" />
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                No attempts yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Be the first one to complete
                this quiz and claim the top spot! 🚀
              </p>

              <button
                onClick={() =>
                  navigate("/quiz")
                }
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Take Quiz
              </button>

            </div>
          )}

      </main>
    </div>
  );
};

export default Leaderboard;