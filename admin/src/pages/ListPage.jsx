import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/navbar.jsx";

import {
  FileQuestion,
  Clock,
  CalendarDays,
  Trash2,
  Edit,
  Search,
  SlidersHorizontal,
  Inbox,
  Plus,
  X,
  RefreshCw,
  LayoutList,
  AlertCircle,
  CheckCircle2,
  Save,
  Sparkles,
  Layers3,
  ArrowRight,
  BookOpen,
  ChevronDown,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useApi } from "../services/api/api.js";

const levelToKey = {
  basic: "easy",
  intermediate: "medium",
  advanced: "hard",
};

const difficultyConfig = {
  easy: {
    label: "Easy",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  medium: {
    label: "Medium",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  hard: {
    label: "Hard",
    badge:
      "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
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

const getAnswerKeyFromQuestion = (question) => {
  const answer = (
    question.answer ||
    question.correctAnswer ||
    ""
  )
    .toString()
    .trim();

  const options = Array.isArray(question.options)
    ? question.options
    : [];

  if (
    ["A", "B", "C", "D"].includes(
      answer.toUpperCase()
    )
  ) {
    return answer.toUpperCase();
  }

  const index = options.findIndex(
    (option) =>
      option?.toString().trim().toLowerCase() ===
      answer.toLowerCase()
  );

  if (index >= 0) {
    return ["A", "B", "C", "D"][index];
  }

  return "";
};

const ListPage = () => {
  const navigate = useNavigate();
  const { request } = useApi();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  const [toast, setToast] = useState(null);

  // EDIT STATES
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await request("/admin/quizzes");

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
      setError(
        err.message || "Failed to load quizzes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title =
      "Manage Quizzes | Tech Quiz Admin";
    loadQuizzes();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // DELETE QUIZ
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    try {
      await request(
        `/admin/quiz/${id}`,
        "DELETE"
      );

      setQuizzes((previous) =>
        previous.filter(
          (quiz) =>
            (quiz._id || quiz.id) !== id
        )
      );

      showToast(
        "success",
        `"${name}" deleted successfully`
      );
    } catch (err) {
      showToast(
        "error",
        err.message || "Failed to delete quiz"
      );
    }
  };

  // OPEN EDIT MODAL
  const handleEdit = (quiz) => {
    const questions = Array.isArray(
      quiz.questions
    )
      ? quiz.questions
      : [];

    const formattedQuestions = questions.map(
      (question) => ({
        question:
          question.question || "",
        options: Array.isArray(
          question.options
        )
          ? [
              question.options[0] || "",
              question.options[1] || "",
              question.options[2] || "",
              question.options[3] || "",
            ]
          : ["", "", "", ""],
        answerKey:
          question.answerKey ||
          getAnswerKeyFromQuestion(
            question
          ) ||
          "A",
        answerText:
          question.answerText || "",
      })
    );

    setEditingQuiz(quiz);

    setEditForm({
      technology:
        quiz.technology ||
        quiz.title ||
        quiz.name ||
        "",
      level:
        quiz.level ||
        quiz.difficulty ||
        "Basic",
      timeLimit:
        quiz.timeLimit ||
        quiz.time ||
        30,
      questions:
        formattedQuestions,
    });
  };

  // CLOSE EDIT MODAL
  const closeEditModal = () => {
    if (savingEdit) return;

    setEditingQuiz(null);
    setEditForm(null);
  };

  // UPDATE EDIT FORM
  const updateEditField = (
    field,
    value
  ) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // UPDATE QUESTION TEXT
  const updateQuestion = (
    questionIndex,
    value
  ) => {
    setEditForm((previous) => {
      const updatedQuestions = [
        ...previous.questions,
      ];

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[
          questionIndex
        ],
        question: value,
      };

      return {
        ...previous,
        questions: updatedQuestions,
      };
    });
  };

  // UPDATE OPTION
  const updateOption = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setEditForm((previous) => {
      const updatedQuestions = [
        ...previous.questions,
      ];

      const currentQuestion =
        updatedQuestions[questionIndex];

      const updatedOptions = [
        ...(currentQuestion.options || []),
      ];

      updatedOptions[optionIndex] =
        value;

      const optionKey = [
        "A",
        "B",
        "C",
        "D",
      ][optionIndex];

      updatedQuestions[questionIndex] = {
        ...currentQuestion,
        options: updatedOptions,
        answerText:
          currentQuestion.answerKey ===
          optionKey
            ? value
            : currentQuestion.answerText,
      };

      return {
        ...previous,
        questions: updatedQuestions,
      };
    });
  };

  // UPDATE CORRECT ANSWER
  const updateCorrectAnswer = (
    questionIndex,
    answerKey
  ) => {
    setEditForm((previous) => {
      const updatedQuestions = [
        ...previous.questions,
      ];

      const currentQuestion =
        updatedQuestions[questionIndex];

      const optionIndex = [
        "A",
        "B",
        "C",
        "D",
      ].indexOf(answerKey);

      updatedQuestions[questionIndex] = {
        ...currentQuestion,
        answerKey,
        answerText:
          currentQuestion.options?.[
            optionIndex
          ] || "",
      };

      return {
        ...previous,
        questions: updatedQuestions,
      };
    });
  };

  // SAVE EDITED QUIZ
  const handleSaveEdit = async () => {
    if (!editingQuiz || !editForm) return;

    if (!editForm.technology.trim()) {
      showToast(
        "error",
        "Technology name is required"
      );
      return;
    }

    if (!editForm.level) {
      showToast(
        "error",
        "Please select quiz level"
      );
      return;
    }

    if (
      !editForm.timeLimit ||
      Number(editForm.timeLimit) < 1
    ) {
      showToast(
        "error",
        "Time limit must be at least 1 minute"
      );
      return;
    }

    for (
      let i = 0;
      i < editForm.questions.length;
      i++
    ) {
      const question =
        editForm.questions[i];

      if (!question.question.trim()) {
        showToast(
          "error",
          `Question ${i + 1} cannot be empty`
        );
        return;
      }

      if (
        !question.options ||
        question.options.length !== 4 ||
        question.options.some(
          (option) => !option.trim()
        )
      ) {
        showToast(
          "error",
          `All 4 options are required for Question ${
            i + 1
          }`
        );
        return;
      }

      if (
        !["A", "B", "C", "D"].includes(
          question.answerKey
        )
      ) {
        showToast(
          "error",
          `Please select the correct answer for Question ${
            i + 1
          }`
        );
        return;
      }
    }

    try {
      setSavingEdit(true);

      const cleanedQuestions =
        editForm.questions.map(
          (question) => {
            const answerIndex = [
              "A",
              "B",
              "C",
              "D",
            ].indexOf(
              question.answerKey
            );

            return {
              question:
                question.question.trim(),

              options:
                question.options.map(
                  (option) =>
                    option.trim()
                ),

              answerKey:
                question.answerKey,

              answerText:
                question.options[
                  answerIndex
                ] || "",
            };
          }
        );

      const payload = {
        technology:
          editForm.technology.trim(),

        level: editForm.level,

        timeLimit: Number(
          editForm.timeLimit
        ),

        questions: cleanedQuestions,
      };

      const response = await request(
        `/admin/quiz/${editingQuiz.id}`,
        "PUT",
        payload
      );

      const updatedQuiz =
        response.quiz || {
          ...editingQuiz,
          ...payload,
          totalQuestions:
            cleanedQuestions.length,
        };

      const normalizedQuiz = {
        ...updatedQuiz,
        id:
          updatedQuiz._id ||
          updatedQuiz.id ||
          editingQuiz.id,
      };

      setQuizzes((previous) =>
        previous.map((quiz) =>
          (quiz._id || quiz.id) ===
          editingQuiz.id
            ? normalizedQuiz
            : quiz
        )
      );

      showToast(
        "success",
        `"${payload.technology}" updated successfully`
      );

      closeEditModal();
    } catch (err) {
      showToast(
        "error",
        err.message ||
          "Failed to update quiz"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // FILTERING
  const filteredQuizzes = useMemo(
    () =>
      quizzes.filter((quiz) => {
        const searchValue = search
          .trim()
          .toLowerCase();

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
          searchableText.includes(
            searchValue
          );

        const rawLevel = (
          quiz.difficulty ||
          quiz.level ||
          ""
        ).toLowerCase();

        const normalizedLevel =
          levelToKey[rawLevel] ||
          rawLevel;

        const matchesLevel =
          filterLevel === "all" ||
          normalizedLevel === filterLevel;

        return (
          matchesSearch &&
          matchesLevel
        );
      }),
    [quizzes, search, filterLevel]
  );

  const clearFilters = () => {
    setSearch("");
    setFilterLevel("all");
  };

  const currentFilterLabel =
    filterLevel === "all"
      ? "All Levels"
      : filterLevel === "easy"
      ? "Easy"
      : filterLevel === "medium"
      ? "Medium"
      : "Hard";

  const totalQuestions = quizzes.reduce(
    (sum, quiz) =>
      sum +
      (quiz.questions?.length ??
        quiz.totalQuestions ??
        quiz.questionCount ??
        0),
    0
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Navbar />

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <Sparkles size={14} />
                Quiz Workspace
              </div>

              <div className="flex items-start gap-4">

                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 sm:flex">
                  <LayoutList size={27} />
                </div>

                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Quiz Management
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Search, edit, and manage every quiz
                    from one organized workspace.
                  </p>
                </div>

              </div>
            </div>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg sm:w-fit"
            >
              <Plus size={19} />
              Create New Quiz
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            SUMMARY
        ====================================================== */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Quizzes
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {quizzes.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Created on the platform
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Showing Results
                </p>

                <p className="mt-2 text-3xl font-extrabold text-indigo-600">
                  {filteredQuizzes.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Matching current search/filter
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Layers3 size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Questions
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {totalQuestions}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Across all available quizzes
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileQuestion size={21} />
              </div>
            </div>
          </div>

        </section>

        {/* =====================================================
            SEARCH + FILTER
        ====================================================== */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="mb-4 flex items-center gap-2">
            <Search
              size={18}
              className="text-indigo-600"
            />

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Find a Quiz
              </h2>

              <p className="text-xs text-slate-400">
                Search by technology, title or topic
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search quizzes..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="relative lg:w-56">

              <SlidersHorizontal
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />

              <select
                value={filterLevel}
                onChange={(e) =>
                  setFilterLevel(
                    e.target.value
                  )
                }
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
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

              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
            </div>

            {(search ||
              filterLevel !== "all") && (
              <button
                onClick={clearFilters}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={17} />
                Clear
              </button>
            )}

          </div>
        </section>

        {/* =====================================================
            TOAST
        ====================================================== */}
        {toast && (
          <div className="fixed right-4 top-24 z-[70] w-[calc(100%-2rem)] max-w-sm">
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${
                toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2
                  className="mt-0.5 shrink-0"
                  size={19}
                />
              ) : (
                <AlertCircle
                  className="mt-0.5 shrink-0"
                  size={19}
                />
              )}

              <p className="flex-1 text-sm font-semibold leading-5">
                {toast.message}
              </p>

              <button
                onClick={() =>
                  setToast(null)
                }
                className="rounded-lg p-1 transition hover:bg-black/5"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse"
                >
                  <div className="h-32 bg-slate-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-5 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 rounded-xl bg-slate-100" />
                      <div className="h-20 rounded-xl bg-slate-100" />
                    </div>

                    <div className="h-10 rounded-xl bg-slate-100" />
                  </div>
                </div>
              )
            )}

          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}
        {!loading && error && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Could not load quizzes
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              onClick={loadQuizzes}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={17} />
              Try Again
            </button>

          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}
        {!loading &&
          !error &&
          filteredQuizzes.length === 0 && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Inbox size={30} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No quizzes found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {quizzes.length === 0
                  ? "You haven't created any quizzes yet. Create your first quiz from the dashboard."
                  : "No quizzes match your current search or difficulty filter."}
              </p>

              <button
                onClick={() => {
                  if (
                    quizzes.length ===
                    0
                  ) {
                    navigate(
                      "/dashboard"
                    );
                  } else {
                    clearFilters();
                  }
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                {quizzes.length === 0 ? (
                  <>
                    <Plus size={17} />
                    Create Quiz
                  </>
                ) : (
                  <>
                    <RefreshCw size={17} />
                    Reset Filters
                  </>
                )}
              </button>

            </div>
          )}

        {/* =====================================================
            QUIZ GRID
        ====================================================== */}
        {!loading &&
          !error &&
          filteredQuizzes.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

              {filteredQuizzes.map(
                (quiz) => {
                  const rawLevel = (
                    quiz.difficulty ||
                    quiz.level ||
                    "basic"
                  ).toLowerCase();

                  const normalizedLevel =
                    levelToKey[
                      rawLevel
                    ] ||
                    rawLevel ||
                    "easy";

                  const difficulty =
                    difficultyConfig[
                      normalizedLevel
                    ] ||
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
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/40"
                    >

                      {/* CARD HEADER */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 p-6">

                        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-400/20 blur-2xl" />

                        <div className="relative flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
                              <FileQuestion size={22} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-bold text-white">
                                {title}
                              </h3>

                              {topic && (
                                <p className="mt-1 truncate text-sm text-indigo-200">
                                  {topic}
                                </p>
                              )}
                            </div>

                          </div>

                          <div
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${difficulty.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${difficulty.dot}`}
                            />

                            {difficulty.label}
                          </div>

                        </div>

                        <div className="relative mt-5 flex items-center gap-2 text-xs font-medium text-indigo-100">
                          <CheckCircle2
                            size={14}
                          />
                          Ready to manage
                        </div>

                      </div>

                      {/* CARD CONTENT */}
                      <div className="flex flex-1 flex-col p-6">

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock size={16} />

                              <span className="text-xs font-semibold">
                                Time
                              </span>
                            </div>

                            <p className="mt-2 text-lg font-extrabold text-slate-900">
                              {time
                                ? `${time} min`
                                : "—"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <FileQuestion size={16} />

                              <span className="text-xs font-semibold">
                                Questions
                              </span>
                            </div>

                            <p className="mt-2 text-lg font-extrabold text-slate-900">
                              {questionCount ||
                                "—"}
                            </p>
                          </div>

                        </div>

                        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays
                            size={16}
                          />

                          <span>
                            Created{" "}
                            {formatDate(
                              createdDate
                            )}
                          </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-6">

                          <span className="text-[11px] font-medium text-slate-400">
                            ID:{" "}
                            {String(
                              quiz.id
                            ).slice(-6)}
                          </span>

                          <div className="flex items-center gap-2">

                            <button
                              onClick={() =>
                                handleEdit(
                                  quiz
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                            >
                              <Edit size={15} />
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  quiz.id,
                                  title
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>

                          </div>

                        </div>

                      </div>
                    </article>
                  );
                }
              )}

            </div>
          )}

      </main>

      {/* =====================================================
          EDIT QUIZ MODAL
      ====================================================== */}
      {editingQuiz &&
        editForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5">

            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
              onClick={closeEditModal}
            />

            {/* MODAL */}
            <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">

              {/* MODAL HEADER */}
              <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Edit size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Quiz Editor
                      </p>

                      <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                        Edit Quiz
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Update quiz details and questions.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeEditModal}
                    disabled={savingEdit}
                    className="rounded-xl border border-slate-200 p-2.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={19} />
                  </button>

                </div>

              </div>

              {/* MODAL CONTENT */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 px-5 py-6 sm:px-7">

                {/* DETAILS */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Quiz Details
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Update the basic information of this quiz.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Technology
                      </label>

                      <input
                        type="text"
                        value={
                          editForm.technology
                        }
                        onChange={(e) =>
                          updateEditField(
                            "technology",
                            e.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Level
                      </label>

                      <div className="relative">
                        <select
                          value={
                            editForm.level
                          }
                          onChange={(e) =>
                            updateEditField(
                              "level",
                              e.target.value
                            )
                          }
                          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        >
                          <option value="Basic">
                            Basic
                          </option>

                          <option value="Intermediate">
                            Intermediate
                          </option>

                          <option value="Advanced">
                            Advanced
                          </option>
                        </select>

                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Time Limit
                      </label>

                      <div className="relative">
                        <Clock
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="number"
                          min="1"
                          value={
                            editForm.timeLimit
                          }
                          onChange={(e) =>
                            updateEditField(
                              "timeLimit",
                              e.target.value
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                    </div>

                  </div>
                </section>

                {/* QUESTIONS */}
                <section className="mt-6">

                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Questions
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Edit text, options, and correct answers.
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                      {
                        editForm.questions
                          .length
                      }{" "}
                      Questions
                    </span>

                  </div>

                  {editForm.questions.length ===
                    0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-700">
                      This quiz does not contain any editable questions.
                    </div>
                  )}

                  <div className="space-y-5">

                    {editForm.questions.map(
                      (
                        question,
                        questionIndex
                      ) => (
                        <article
                          key={
                            questionIndex
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >

                          <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 to-indigo-950 px-5 py-4">

                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                                <FileQuestion
                                  size={18}
                                />
                              </div>

                              <div>
                                <p className="text-sm font-bold text-white">
                                  Question{" "}
                                  {questionIndex +
                                    1}
                                </p>

                                <p className="text-xs text-slate-300">
                                  Select the correct option
                                </p>
                              </div>
                            </div>

                          </div>

                          <div className="space-y-5 p-5 sm:p-6">

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Question Text
                              </label>

                              <textarea
                                rows="3"
                                value={
                                  question.question
                                }
                                onChange={(e) =>
                                  updateQuestion(
                                    questionIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter question"
                                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </div>

                            <div>

                              <div className="mb-3 flex items-center justify-between gap-3">
                                <label className="text-sm font-semibold text-slate-700">
                                  Options
                                </label>

                                <span className="text-xs text-slate-400">
                                  Click a letter to mark the correct answer
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                                {question.options.map(
                                  (
                                    option,
                                    optionIndex
                                  ) => {
                                    const optionKey =
                                      [
                                        "A",
                                        "B",
                                        "C",
                                        "D",
                                      ][
                                        optionIndex
                                      ];

                                    const isCorrect =
                                      question.answerKey ===
                                      optionKey;

                                    return (
                                      <div
                                        key={
                                          optionIndex
                                        }
                                        className={`rounded-xl border p-3 transition ${
                                          isCorrect
                                            ? "border-emerald-300 bg-emerald-50"
                                            : "border-slate-200 bg-slate-50"
                                        }`}
                                      >

                                        <div className="flex items-center gap-3">

                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateCorrectAnswer(
                                                questionIndex,
                                                optionKey
                                              )
                                            }
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition ${
                                              isCorrect
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                                            }`}
                                            title={
                                              isCorrect
                                                ? "Correct answer"
                                                : "Mark as correct"
                                            }
                                          >
                                            {optionKey}
                                          </button>

                                          <input
                                            type="text"
                                            value={
                                              option
                                            }
                                            onChange={(
                                              e
                                            ) =>
                                              updateOption(
                                                questionIndex,
                                                optionIndex,
                                                e.target
                                                  .value
                                              )
                                            }
                                            placeholder={`Option ${optionKey}`}
                                            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                          />

                                        </div>

                                        {isCorrect && (
                                          <div className="mt-2 flex items-center gap-1.5 pl-12 text-xs font-bold text-emerald-700">
                                            <CheckCircle2
                                              size={14}
                                            />
                                            Correct Answer
                                          </div>
                                        )}

                                      </div>
                                    );
                                  }
                                )}

                              </div>
                            </div>

                          </div>
                        </article>
                      )
                    )}

                  </div>
                </section>

              </div>

              {/* FOOTER */}
              <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    onClick={closeEditModal}
                    disabled={savingEdit}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingEdit ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Save Changes
                      </>
                    )}
                  </button>

                </div>

              </div>

            </div>
          </div>
        )}
    </div>
  );
};

export default ListPage;
