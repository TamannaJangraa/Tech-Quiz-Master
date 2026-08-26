import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

const MyResults = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [getToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
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
      <div className="mx-auto max-w-4xl">

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
              const percentage = Math.round(
                (result.correct / result.totalQuestions) * 100
              );

              return (
                <div
                  key={result._id}
                  className="rounded-2xl bg-white p-6 shadow-md"
                >
                  <div className="flex items-center justify-between">
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
                        {result.correct} / {result.totalQuestions}
                      </p>

                      <p className="text-sm text-gray-500">
                        {percentage}% Score
                      </p>
                    </div>
                  </div>

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

                  <p className="mt-5 text-sm text-gray-400">
                    Attempted on:{" "}
                    {new Date(result.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResults;