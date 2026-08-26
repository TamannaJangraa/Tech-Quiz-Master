import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Home } from "lucide-react";
import { apiRequest } from "../services/api";

const Leaderboard = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const token = await getToken();

        const data = await apiRequest(
          "/results/leaderboard",
          "GET",
          null,
          token
        );

        console.log("LEADERBOARD:", data);

        setLeaderboard(data.results || data || []);
      } catch (err) {
        console.error("LEADERBOARD ERROR:", err);
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [getToken]);

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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
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
              Top quiz performers 🏆
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

        {/* Empty State */}
        {leaderboard.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow">
            <Trophy
              size={55}
              className="mx-auto mb-4 text-gray-300"
            />

            <h2 className="text-xl font-bold text-gray-800">
              No leaderboard data yet
            </h2>

            <p className="mt-2 text-gray-500">
              Complete a quiz to appear on the leaderboard!
            </p>

            <button
              onClick={() => navigate("/quiz")}
              className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-md">

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 border-b bg-gray-100 px-6 py-4 font-semibold text-gray-600">
              <div>Rank</div>
              <div>Player</div>
              <div>Quiz</div>
              <div className="text-right">Score</div>
            </div>

            {/* Leaderboard Users */}
            {leaderboard.map((item, index) => {
              const isCurrentUser =
                item.userId === user?.id;

              return (
                <div
                  key={item.userId}
                  className={`grid grid-cols-4 items-center gap-4 border-b px-6 py-5 last:border-b-0 ${
                    isCurrentUser
                      ? "bg-indigo-50"
                      : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    {getRankIcon(index)}
                  </div>

                  {/* Player */}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isCurrentUser
                        ? "You"
                        : `Player ${index + 1}`}
                    </p>

                    {isCurrentUser && (
                      <p className="text-xs text-indigo-600">
                        Your best score
                      </p>
                    )}
                  </div>

                  {/* Quiz */}
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.technology?.toUpperCase()} Quiz
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.level}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-600">
                      {item.correct} / {item.totalQuestions}
                    </p>

                    <p className="text-sm text-gray-500">
                      {Math.round(item.percentage)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;