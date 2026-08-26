import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import {
  FileQuestion,
  Clock,
  CalendarDays,
  Trash2,
  Search,
  SlidersHorizontal,
  Inbox,
  Plus,
  X,
  RefreshCw,
  LayoutList,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";

const BASE_URL = "https://tech-quiz-master-bcknd.vercel.app/api";

const levelToKey = {
  basic: "easy",
  intermediate: "medium",
  advanced: "hard",
};

const difficultyConfig = {
  easy: {
    label: "Easy",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  medium: {
    label: "Medium",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  hard: {
    label: "Hard",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ListPage = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  const [toast, setToast] = useState(null);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/admin/quizzes`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.quizzes || [];

      setQuizzes(
        list.map((quiz) => ({
          ...quiz,
          id: quiz._id || quiz.id,
        }))
      );
    } catch (err) {
      setError(err.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manage Quizzes | Tech Quiz Admin";
    loadQuizzes();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    try {
      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/admin/quiz/${id}`,
        {
          method: "DELETE",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setQuizzes((previous) =>
        previous.filter(
          (quiz) => (quiz._id || quiz.id) !== id
        )
      );

      setToast({
        type: "success",
        message: `"${name}" deleted successfully`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.message || "Failed to delete quiz",
      });
    }

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const searchValue = search.trim().toLowerCase();

    const searchableText = [
      quiz.title,
      quiz.name,
      quiz.technology,
      quiz.description,
      quiz.topic,
      quiz.category,
      quiz.subject,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !searchValue ||
      searchableText.includes(searchValue);

    const rawLevel = (
      quiz.difficulty ||
      quiz.level ||
      ""
    ).toLowerCase();

    const normalizedLevel =
      levelToKey[rawLevel] || rawLevel;

    const matchesLevel =
      filterLevel === "all" ||
      normalizedLevel === filterLevel;

    return matchesSearch && matchesLevel;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterLevel("all");
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />

      {/* PAGE HEADER */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-9">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm">
                <LayoutList className="w-7 h-7 text-white" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Quiz Management
                </h1>

                <p className="text-sm sm:text-base text-slate-500 mt-1">
                  View, search and manage all quizzes from one place.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create New Quiz
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-slate-500">
              Total Quizzes
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {quizzes.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-slate-500">
              Showing Results
            </p>

            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {filteredQuizzes.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm font-medium text-slate-500">
              Current Filter
            </p>

            <p className="text-lg font-bold text-slate-900 mt-3 capitalize">
              {filterLevel === "all"
                ? "All Levels"
                : filterLevel}
            </p>
          </div>

        </div>

        {/* SEARCH AND FILTER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search quizzes by technology, title or topic..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1 md:w-52">
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                <select
                  value={filterLevel}
                  onChange={(e) =>
                    setFilterLevel(e.target.value)
                  }
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-300 bg-white text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none"
                >
                  <option value="all">
                    All Levels
                  </option>

                  <option value="easy">
                    Easy
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="hard">
                    Hard
                  </option>
                </select>
              </div>

              {(search || filterLevel !== "all") && (
                <button
                  onClick={clearFilters}
                  className="h-12 px-4 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                  title="Clear filters"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div className="fixed top-24 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)]">
            <div
              className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}

              <p className="text-sm font-medium flex-1">
                {toast.message}
              </p>

              <button
                onClick={() => setToast(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-28 bg-slate-200" />

                <div className="p-6 space-y-4">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />

                  <div className="h-4 bg-slate-100 rounded w-1/2" />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-slate-100 rounded-xl" />
                    <div className="h-16 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Could not load quizzes
            </h2>

            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              {error}
            </p>

            <button
              onClick={loadQuizzes}
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          filteredQuizzes.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-16 text-center">

              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                <Inbox className="w-10 h-10 text-indigo-500" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                No quizzes found
              </h2>

              <p className="text-slate-500 mt-3 max-w-md mx-auto">
                {quizzes.length === 0
                  ? "You haven't created any quizzes yet. Create your first quiz from the dashboard."
                  : "No quizzes match your current search or filter."}
              </p>

              <button
                onClick={() => {
                  if (quizzes.length === 0) {
                    navigate("/dashboard");
                  } else {
                    clearFilters();
                  }
                }}
                className="inline-flex items-center gap-2 mt-7 px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {quizzes.length === 0 ? (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Quiz
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Reset Filters
                  </>
                )}
              </button>

            </div>
          )}

        {/* QUIZ GRID */}
        {!loading &&
          !error &&
          filteredQuizzes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {filteredQuizzes.map((quiz) => {
                const rawLevel = (
                  quiz.difficulty ||
                  quiz.level ||
                  "basic"
                ).toLowerCase();

                const normalizedLevel =
                  levelToKey[rawLevel] ||
                  rawLevel ||
                  "easy";

                const difficulty =
                  difficultyConfig[normalizedLevel] ||
                  difficultyConfig.easy;

                const title =
                  quiz.title ||
                  quiz.name ||
                  quiz.technology ||
                  "Untitled Quiz";

                const topic =
                  quiz.topic ||
                  quiz.category ||
                  quiz.subject ||
                  quiz.technology ||
                  "";

                const questionCount =
                  quiz.questions?.length ??
                  quiz.totalQuestions ??
                  quiz.questionCount ??
                  0;

                const time =
                  quiz.timeLimit ??
                  quiz.time ??
                  0;

                const createdDate =
                  quiz.createdAt ||
                  quiz.created_at;

                return (
                  <article
                    key={quiz.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
                  >

                    {/* CARD HEADER */}
                    <div className="p-6 bg-slate-900">
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-11 h-11 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                            <FileQuestion className="w-6 h-6 text-white" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-white truncate">
                              {title}
                            </h3>

                            {topic && (
                              <p className="text-sm text-slate-300 mt-1 truncate">
                                {topic}
                              </p>
                            )}
                          </div>

                        </div>

                        <div
                          className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${difficulty.badge}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${difficulty.dot}`}
                          />

                          {difficulty.label}
                        </div>

                      </div>
                    </div>

                    {/* CARD CONTENT */}
                    <div className="p-6 flex flex-col flex-1">

                      <div className="grid grid-cols-2 gap-4">

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-4 h-4" />

                            <span className="text-xs font-medium">
                              Time Limit
                            </span>
                          </div>

                          <p className="text-xl font-bold text-slate-900 mt-2">
                            {time ? `${time} min` : "—"}
                          </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <FileQuestion className="w-4 h-4" />

                            <span className="text-xs font-medium">
                              Questions
                            </span>
                          </div>

                          <p className="text-xl font-bold text-slate-900 mt-2">
                            {questionCount || "—"}
                          </p>
                        </div>

                      </div>

                      <div className="flex items-center gap-3 mt-5 text-sm text-slate-500">
                        <CalendarDays className="w-4 h-4 shrink-0" />

                        <span>
                          Created {formatDate(createdDate)}
                        </span>
                      </div>

                      {/* CARD ACTION */}
                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">

                        <span className="text-xs text-slate-400">
                          Quiz ID: {String(quiz.id).slice(-6)}
                        </span>

                        <button
                          onClick={() =>
                            handleDelete(
                              quiz.id,
                              title
                            )
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>

                      </div>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

      </main>
    </div>
  );
};

export default ListPage;