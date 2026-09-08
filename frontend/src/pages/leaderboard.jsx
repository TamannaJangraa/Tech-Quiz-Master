import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Trophy, Home } from "lucide-react";
import { apiRequest } from "../services/api";

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        // =====================================
        // LOAD ALL QUIZZES
        // =====================================
        const quizData = await apiRequest(
          "/admin/public-quizzes",
          "GET",
          null,
          token
        );

        const availableQuizzes =
          quizData?.quizzes ||
          (Array.isArray(quizData) ? quizData : []);

        // =====================================
        // LOAD ALL LEADERBOARD RESULTS
        // =====================================
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

        console.log("ALL QUIZZES:", availableQuizzes);
        console.log("ALL LEADERBOARD RESULTS:", results);

        /*
          Create quiz options from BOTH:
          1. Existing quizzes
          2. Existing result records

          This prevents an old result from disappearing
          if the quiz metadata is slightly different.
        */

        const quizMap = new Map();

        availableQuizzes.forEach((quiz) => {
          const technology = String(
            quiz.technology || ""
          ).trim();

          const level = String(
            quiz.level || ""
          ).trim();

          if (!technology) return;

          const key = `${normalize(technology)}-${normalize(
            level
          )}`;

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

          const key = `${normalize(technology)}-${normalize(
            level
          )}`;

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

        console.log("FINAL QUIZ OPTIONS:", finalQuizzes);

        setQuizzes(finalQuizzes);
        setLeaderboard(results);

        // Automatically select first quiz
        if (finalQuizzes.length > 0) {
          setSelectedQuiz(finalQuizzes[0].id);
        }
      } catch (err) {
        console.error("LEADERBOARD ERROR:", err);

        setError(
          err.message || "Failed to load leaderboard"
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
  // FILTER SELECTED QUIZ
  // =====================================
  const selectedLeaderboard = currentQuiz
    ? leaderboard
        .filter((item) => {
          return (
            normalize(item.technology) ===
              normalize(currentQuiz.technology) &&
            normalize(item.level) ===
              normalize(currentQuiz.level)
          );
        })
        .sort((a, b) => {
          // Highest percentage first
          if (b.percentage !== a.percentage) {
            return b.percentage - a.percentage;
          }

          // Then highest correct answers
          if (b.correct !== a.correct) {
            return b.correct - a.correct;
          }

          // Earlier submission gets higher rank
          return (
            new Date(a.createdAt) -
            new Date(b.createdAt)
          );
        })
    : [];

  // =====================================
  // RANK ICON
  // =====================================
  const getRankIcon = (index) => {
    if (index === 0) {
      return <span className="text-2xl">🥇</span>;
    }

    if (index === 1) {
      return <span className="text-2xl">🥈</span>;
    }

    if (index === 2) {
      return <span className="text-2xl">🥉</span>;
    }

    return (
      <span className="font-bold text-gray-500">
        #{index + 1}
      </span>
    );
  };

  // =====================================
  // LOADING
  // =====================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Trophy
            size={50}
            className="mx-auto mb-4 text-indigo-600 animate-bounce"
          />

          <p className="text-gray-600">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-red-600 font-semibold">
          {error}
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* =====================================
            HEADER
        ===================================== */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Trophy
                size={35}
                className="text-yellow-500"
              />

              <h1 className="text-3xl font-bold text-gray-900">
                Leaderboard
              </h1>
            </div>

            <p className="mt-2 text-gray-500">
              Quiz-wise performance 🏆
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
          >
            <Home size={18} />
            Home
          </button>
        </div>

        {/* =====================================
            QUIZ SELECTOR
        ===================================== */}
        {quizzes.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white p-5 shadow-md">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Select Quiz
            </label>

            <select
              value={selectedQuiz}
              onChange={(e) =>
                setSelectedQuiz(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {quizzes.map((quiz) => (
                <option
                  key={quiz.id}
                  value={quiz.id}
                >
                  {quiz.technology?.toUpperCase()} Quiz -{" "}
                  {quiz.level}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* =====================================
            SELECTED QUIZ TITLE
        ===================================== */}
        {currentQuiz && (
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentQuiz.technology?.toUpperCase()} Quiz
            </h2>

            <p className="text-gray-500">
              Level: {currentQuiz.level}
            </p>
          </div>
        )}

        {/* =====================================
            NO QUIZZES
        ===================================== */}
        {quizzes.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow">
            <Trophy
              size={55}
              className="mx-auto mb-4 text-gray-300"
            />

            <h2 className="text-xl font-bold text-gray-800">
              No quizzes available
            </h2>

            <p className="mt-2 text-gray-500">
              No quizzes or quiz attempts are available yet.
            </p>
          </div>
        )}

        {/* =====================================
            NO ATTEMPTS
        ===================================== */}
        {quizzes.length > 0 &&
          selectedLeaderboard.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow">

              <Trophy
                size={55}
                className="mx-auto mb-4 text-gray-300"
              />

              <h2 className="text-xl font-bold text-gray-800">
                No attempts yet
              </h2>

              <p className="mt-2 text-gray-500">
                No one has completed this quiz yet.
              </p>

            </div>
          )}

        {/* =====================================
            LEADERBOARD
        ===================================== */}
        {selectedLeaderboard.length > 0 && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-md">

            {/* HEADER */}
            <div className="grid grid-cols-4 gap-4 border-b bg-gray-100 px-6 py-4 font-semibold text-gray-600">
              <div>Rank</div>
              <div>Player</div>
              <div>Quiz</div>
              <div className="text-right">
                Score
              </div>
            </div>

            {/* ALL PARTICIPANTS */}
            {selectedLeaderboard.map(
              (item, index) => {

                const isCurrentUser =
                  item.userId === user?.id;

                return (
                  <div
                    key={`${item.userId}-${item.technology}-${item.level}`}
                    className={`grid grid-cols-4 items-center gap-4 border-b px-6 py-5 last:border-b-0 ${
                      isCurrentUser
                        ? "bg-indigo-50"
                        : ""
                    }`}
                  >

                    {/* RANK */}
                    <div className="flex items-center">
                      {getRankIcon(index)}
                    </div>

                    {/* PLAYER */}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.userName ||
                          item.playerName ||
                          "Unknown Player"}
                      </p>

                      {isCurrentUser && (
                        <p className="text-xs text-indigo-600">
                          Your best score
                        </p>
                      )}
                    </div>

                    {/* QUIZ */}
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.technology?.toUpperCase()} Quiz
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.level}
                      </p>
                    </div>

                    {/* SCORE */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-indigo-600">
                        {item.correct} /{" "}
                        {item.totalQuestions}
                      </p>

                      <p className="text-sm text-gray-500">
                        {Math.round(item.percentage)}%
                      </p>
                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;