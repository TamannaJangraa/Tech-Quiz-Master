// Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useApi } from "../services/api/api.js";
import Navbar from "./navbar.jsx";

import {
  Upload,
  CheckCircle,
  Clock,
  FileQuestion,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Info,
  Sparkles,
  BarChart3,
  UserCheck,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

const levels = [
  { value: "Basic" },
  { value: "Intermediate" },
  { value: "Advanced" },
];

function parseCSVText(csvText) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (current !== "" || row.length > 0) {
        row.push(current);
        rows.push(row);
      }

      current = "";
      row = [];

      if (char === "\r" && csvText[i + 1] === "\n") i++;

      continue;
    }

    current += char;
  }

  if (current !== "" || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.map((r) => r.map((c) => c.trim()));
}

const Dashboard = () => {
  const [technology, setTechnology] = useState("");
  const [level, setLevel] = useState("Basic");
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Dashboard statistics
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalQuestions: 0,
    submittedQuizzes: 0,
    pendingQuizzes: 0,
  });

  // Details modal
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [detailsModal, setDetailsModal] = useState({
    open: false,
    title: "",
    type: "",
    data: [],
  });

  const [loadingStats, setLoadingStats] = useState(true);

  const fileInputRef = useRef(null);
  const { request } = useApi();

  // =========================================================
  // OPEN DASHBOARD DETAILS
  // =========================================================
  const openDetails = async (type, title) => {
    try {
      setLoadingDetails(true);

      setDetailsModal({
        open: true,
        title,
        type,
        data: [],
      });

      const response = await request(
        `/admin/details?type=${encodeURIComponent(type)}`
      );

      setDetailsModal({
        open: true,
        title: response.title || title,
        type,
        data: response.data || [],
      });
    } catch (err) {
      console.error("Dashboard details error:", err);

      setDetailsModal({
        open: true,
        title,
        type,
        data: [],
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // =========================================================
  // CLOSE DETAILS MODAL
  // =========================================================
  const closeDetails = () => {
    setDetailsModal({
      open: false,
      title: "",
      type: "",
      data: [],
    });
  };

  // =========================================================
  // LOAD ADMIN STATS
  // =========================================================
  useEffect(() => {
    document.title = "Admin Dashboard | Tech Quiz Master";

    const loadStats = async () => {
      try {
        setLoadingStats(true);

        const data = await request("/admin/stats");

        setAdminStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          inactiveUsers: data.inactiveUsers || 0,
          totalQuestions: data.totalQuestions || 0,
          submittedQuizzes: data.submittedQuizzes || 0,
          pendingQuizzes: data.pendingQuizzes || 0,
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // =========================================================
  // TOAST TIMER
  // =========================================================
  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.show]);

  // =========================================================
  // VALIDATE FORM
  // =========================================================
  const validateForm = () => {
    const errors = {};

    if (!technology.trim()) {
      errors.technology = "Technology name is required";
    }

    if (!level) {
      errors.level = "Level is required";
    }

    if (!timeLimit || Number(timeLimit) < 1) {
      errors.timeLimit = "Time limit must be at least 1 minute";
    }

    if (questions.length === 0) {
      errors.questions = "Please upload a CSV file with questions";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =========================================================
  // DRAG & DROP
  // =========================================================
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setCsvError("");

    const file = e.dataTransfer.files?.[0];

    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith(".csv") &&
      file.type !== "text/csv"
    ) {
      setToast({
        show: true,
        type: "error",
        message: "Please upload a valid CSV file",
      });

      return;
    }

    processCSVFile(file);
  };

  // =========================================================
  // FILE UPLOAD
  // =========================================================
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];

    setCsvError("");

    if (file) {
      processCSVFile(file);
    }
  };

  const processCSVFile = (file) => {
    setCsvFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = String(e.target?.result || "");
      processCSVText(text);
    };

    reader.onerror = () => {
      setCsvError("Failed to read file.");
    };

    reader.readAsText(file);
  };

  // =========================================================
  // PROCESS CSV
  // =========================================================
  const processCSVText = (csvText) => {
    if (!csvText) return;

    setCsvError("");

    const rows = parseCSVText(csvText);

    if (rows.length === 0) {
      setCsvError("Uploaded CSV is empty or invalid");
      return;
    }

    const header = rows[0].map((c) => c.toLowerCase());

    let startIdx = 0;

    const hasQuestionHeader = header.some(
      (h) => h.includes("question") || h.includes("q.")
    );

    const hasAnswerHeader = header.some(
      (h) => h.includes("answer") || h.includes("correct")
    );

    const hasOptionsHeader = header.some(
      (h) => h.includes("option") || h.includes("choice")
    );

    if (hasQuestionHeader && (hasAnswerHeader || hasOptionsHeader)) {
      startIdx = 1;
    }

    const parsedQuestions = [];

    for (let i = startIdx; i < rows.length; i++) {
      const row = rows[i];

      if (row.length === 0 || row.every((cell) => !cell.trim())) {
        continue;
      }

      const paddedRow = [...row];

      while (paddedRow.length < 6) {
        paddedRow.push("");
      }

      const question = paddedRow[0] || "";

      const options = [
        paddedRow[1] || "",
        paddedRow[2] || "",
        paddedRow[3] || "",
        paddedRow[4] || "",
      ];

      const answerRaw = (paddedRow[5] || "").trim().toUpperCase();

      let answerKey = "";
      let answerText = "";
      let foundAnswer = false;

      // A/B/C/D
      if (["A", "B", "C", "D"].includes(answerRaw)) {
        answerKey = answerRaw;

        const index = ["A", "B", "C", "D"].indexOf(answerRaw);

        answerText = options[index] || answerRaw;

        foundAnswer = true;
      }

      // 1/2/3/4
      if (!foundAnswer && ["1", "2", "3", "4"].includes(answerRaw)) {
        const index = parseInt(answerRaw, 10) - 1;

        answerKey = ["A", "B", "C", "D"][index];

        answerText = options[index] || answerRaw;

        foundAnswer = true;
      }

      // Exact answer text
      if (!foundAnswer) {
        for (let j = 0; j < options.length; j++) {
          if (
            options[j].trim().toLowerCase() ===
            answerRaw.toLowerCase()
          ) {
            answerKey = ["A", "B", "C", "D"][j];
            answerText = options[j];

            foundAnswer = true;
            break;
          }
        }
      }

      // Partial answer text
      if (!foundAnswer) {
        for (let j = 0; j < options.length; j++) {
          if (
            options[j]
              .trim()
              .toLowerCase()
              .includes(answerRaw.toLowerCase()) ||
            (answerRaw &&
              answerRaw
                .toLowerCase()
                .includes(options[j].trim().toLowerCase()))
          ) {
            answerKey = ["A", "B", "C", "D"][j];
            answerText = options[j];

            foundAnswer = true;
            break;
          }
        }
      }

      // Default A
      if (!foundAnswer && options[0]) {
        answerKey = "A";
        answerText = options[0];
      }

      if (question.trim()) {
        parsedQuestions.push({
          question: question.trim(),
          options: options.map((option) => option.trim()),
          answerKey,
          answerText,
        });
      }
    }

    if (parsedQuestions.length === 0) {
      setCsvError("No valid questions found in CSV");
      return;
    }

    setQuestions(parsedQuestions);

    setShowPreview(true);

    setValidationErrors((prev) => ({
      ...prev,
      questions: "",
    }));

    setToast({
      show: true,
      type: "success",
      message: `${parsedQuestions.length} questions loaded successfully`,
    });
  };

  // =========================================================
  // CREATE QUIZ
  // =========================================================
  const handleSubmit = async () => {
    if (!validateForm()) {
      setToast({
        show: true,
        type: "error",
        message: "Please fill all required fields",
      });

      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        technology: technology.trim(),
        level,
        timeLimit: parseInt(timeLimit, 10),
        questions,
        totalQuestions: questions.length,
      };

      await request("/admin/upload-quiz", "POST", payload);

      setToast({
        show: true,
        type: "success",
        message: `Quiz "${technology.trim()}" created successfully with ${questions.length} questions`,
      });

      resetForm();
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message: err.message || "Quiz upload failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================
  const resetForm = () => {
    setTechnology("");
    setLevel("Basic");
    setTimeLimit(30);
    setQuestions([]);
    setShowPreview(false);
    setValidationErrors({});
    setCsvFileName("");
    setCsvError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isFormValid =
    technology.trim() &&
    level &&
    Number(timeLimit) >= 1 &&
    questions.length > 0 &&
    !submitting;

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* =====================================================
            DASHBOARD HEADER
        ====================================================== */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <Sparkles size={14} />
                Admin Workspace
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage quizzes, monitor student activity,
                and keep your quiz platform organized.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Activity
                size={18}
                className="text-indigo-600"
              />

              <span className="text-sm font-semibold text-slate-700">
                Platform Overview
              </span>
            </div>

          </div>
        </section>

        {/* =====================================================
            STATISTICS
        ====================================================== */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL USERS */}
          <div
            onClick={() =>
              openDetails("totalUsers", "All Users")
            }
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>

                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loadingStats
                    ? "..."
                    : adminStats.totalUsers}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Registered participants
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:scale-105">
                <Users size={22} />
              </div>

            </div>
          </div>

          {/* ACTIVE USERS */}
          <div
            onClick={() =>
              openDetails(
                "activeUsers",
                "Logged In Users"
              )
            }
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Users
                </p>

                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loadingStats
                    ? "..."
                    : adminStats.activeUsers}
                </h3>

                <p className="mt-2 text-xs font-medium text-emerald-600">
                  Currently active
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
                <UserCheck size={22} />
              </div>

            </div>
          </div>

          {/* QUESTIONS */}
          <div
            onClick={() =>
              openDetails(
                "totalQuestions",
                "Quiz Question Details"
              )
            }
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Questions
                </p>

                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loadingStats
                    ? "..."
                    : adminStats.totalQuestions}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Across all quizzes
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:scale-105">
                <FileQuestion size={22} />
              </div>

            </div>
          </div>

          {/* SUBMITTED */}
          <div
            onClick={() =>
              openDetails(
                "submittedQuizzes",
                "Submitted Quizzes"
              )
            }
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Submitted Quizzes
                </p>

                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loadingStats
                    ? "..."
                    : adminStats.submittedQuizzes}
                </h3>

                <p className="mt-2 text-xs font-medium text-emerald-600">
                  Successfully submitted
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
                <CheckCircle size={22} />
              </div>

            </div>
          </div>

          {/* INACTIVE */}
          <div
            onClick={() =>
              openDetails(
                "inactiveUsers",
                "Inactive Students"
              )
            }
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Students
                </p>

                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loadingStats
                    ? "..."
                    : adminStats.inactiveUsers}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Registered but inactive
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:scale-105">
                <Users size={22} />
              </div>

            </div>
          </div>

          {/* PENDING */}
          <div
            onClick={() =>
              openDetails(
                "pendingQuizzes",
                "Pending Quizzes"
              )
            }
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Quizzes
                </p>

                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loadingStats
                    ? "..."
                    : adminStats.pendingQuizzes}
                </h3>

                <p className="mt-2 text-xs font-medium text-amber-600">
                  Attempted but not submitted
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:scale-105">
                <Clock size={22} />
              </div>

            </div>
          </div>

          {/* USER ACTIVITY */}
          <div
            onClick={() =>
              openDetails(
                "activeUsers",
                "User Activity"
              )
            }
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  User Activity
                </p>

                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loadingStats
                    ? "..."
                    : `${
                        adminStats.totalUsers > 0
                          ? (
                              (adminStats.activeUsers /
                                adminStats.totalUsers) *
                              100
                            ).toFixed(1)
                          : "0.0"
                      }%`}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Logged-in user percentage
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:scale-105">
                <BarChart3 size={22} />
              </div>

            </div>
          </div>

        </section>

        {/* =====================================================
            MAIN LAYOUT
        ====================================================== */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">

          {/* ===================================================
              CREATE QUIZ
          =================================================== */}
          <section className="xl:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* FORM HEADER */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-5 py-6 sm:px-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                      <FileQuestion size={23} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Quiz Builder
                      </p>

                      <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                        Create New Quiz
                      </h2>

                      <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                        Configure the quiz details and upload your questions in CSV format.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                    <Zap size={14} className="text-indigo-500" />
                    Ready to build
                  </div>

                </div>
              </div>

              <div className="space-y-8 p-5 sm:p-7">

                {/* STEP 1 */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      1
                    </span>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Basic Information
                      </h3>

                      <p className="text-xs text-slate-400">
                        Define the technology and difficulty.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* TECHNOLOGY */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Technology
                      </label>

                      <input
                        type="text"
                        value={technology}
                        onChange={(e) => {
                          setTechnology(e.target.value);

                          setValidationErrors((prev) => ({
                            ...prev,
                            technology: "",
                          }));
                        }}
                        placeholder="e.g. Java, Python, JavaScript"
                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                          validationErrors.technology
                            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                        }`}
                      />

                      {validationErrors.technology && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle size={16} />
                          {validationErrors.technology}
                        </p>
                      )}
                    </div>

                    {/* DIFFICULTY */}
                    <div>
                      <label className="mb-3 block text-sm font-semibold text-slate-700">
                        Difficulty Level
                      </label>

                      <div className="grid grid-cols-3 gap-2.5">
                        {levels.map((lvl) => {
                          const selected = level === lvl.value;

                          const styles = {
                            Basic: selected
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40",

                            Intermediate: selected
                              ? "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50/40",

                            Advanced: selected
                              ? "border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50/40",
                          };

                          return (
                            <button
                              key={lvl.value}
                              type="button"
                              onClick={() => {
                                setLevel(lvl.value);

                                setValidationErrors((prev) => ({
                                  ...prev,
                                  level: "",
                                }));
                              }}
                              className={`rounded-xl border-2 px-3 py-3.5 text-xs font-bold transition sm:text-sm ${styles[lvl.value]}`}
                            >
                              {selected && (
                                <CheckCircle2
                                  size={16}
                                  className="mx-auto mb-1"
                                />
                              )}

                              {lvl.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TIME */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Time Limit
                      </label>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Clock
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type="text"
                            inputMode="numeric"
                            value={timeLimit}
                            onChange={(e) => {
                              const value = e.target.value;

                              if (
                                value === "" ||
                                /^\d+$/.test(value)
                              ) {
                                setTimeLimit(value);

                                setValidationErrors((prev) => ({
                                  ...prev,
                                  timeLimit: "",
                                }));
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                setTimeLimit(30);
                              }
                            }}
                            className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-4 ${
                              validationErrors.timeLimit
                                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                            }`}
                          />
                        </div>

                        <div className="shrink-0 rounded-xl bg-slate-100 px-3.5 py-3.5 text-xs font-semibold text-slate-500 sm:px-4 sm:text-sm">
                          min
                        </div>
                      </div>

                      {validationErrors.timeLimit && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle size={16} />
                          {validationErrors.timeLimit}
                        </p>
                      )}
                    </div>

                  </div>
                </div>

                {/* STEP 2 */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      2
                    </span>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Add Questions
                      </h3>

                      <p className="text-xs text-slate-400">
                        Upload a CSV containing your quiz questions.
                      </p>
                    </div>
                  </div>

                  {/* CSV UPLOAD */}
                  <div>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
                        isDragging
                          ? "border-indigo-500 bg-indigo-50 shadow-inner"
                          : validationErrors.questions
                          ? "border-red-400 bg-red-50"
                          : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition-transform group-hover:scale-105">
                        <UploadCloud size={28} />
                      </div>

                      <h3 className="mt-4 font-bold text-slate-700">
                        {isDragging
                          ? "Drop your CSV file here"
                          : "Upload your questions CSV"}
                      </h3>

                      <p className="mt-1.5 text-sm text-slate-500">
                        Drag & drop or click to browse
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        Supported format: .csv
                      </p>
                    </div>

                    {csvFileName && (
                      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                            <CheckCircle size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-emerald-700">
                              {questions.length} questions loaded
                            </p>

                            <p className="truncate text-xs text-emerald-600">
                              {csvFileName}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPreview(!showPreview);
                          }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-xs font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50 sm:w-auto"
                        >
                          <Eye size={15} />
                          {showPreview ? "Hide Preview" : "Preview"}
                        </button>
                      </div>
                    )}

                    {csvError && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle size={16} />
                        {csvError}
                      </p>
                    )}

                    {validationErrors.questions && !csvError && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle size={16} />
                        {validationErrors.questions}
                      </p>
                    )}
                  </div>
                </div>

                {/* PREVIEW */}
                {showPreview && questions.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
                      <div>
                        <h3 className="font-bold text-slate-800">
                          Question Preview
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Showing the first 3 uploaded questions
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Eye size={18} />
                      </div>
                    </div>

                    <div className="space-y-3 p-4 sm:p-5">
                      {questions.slice(0, 3).map((question, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                              {index + 1}
                            </span>

                            <p className="font-semibold leading-6 text-slate-800">
                              {question.question}
                            </p>
                          </div>

                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {question.options.map(
                              (option, optionIndex) => {
                                const letter =
                                  ["A", "B", "C", "D"][optionIndex];

                                const correct =
                                  question.answerKey === letter;

                                return (
                                  <div
                                    key={optionIndex}
                                    className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                                      correct
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-slate-200 text-slate-600"
                                    }`}
                                  >
                                    <span className="font-bold">
                                      {letter}.
                                    </span>

                                    <span className="flex-1">
                                      {option}
                                    </span>

                                    {correct && (
                                      <CheckCircle2
                                        size={16}
                                        className="shrink-0 text-emerald-500"
                                      />
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      3
                    </span>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Publish Quiz
                      </h3>

                      <p className="text-xs text-slate-400">
                        Review the details and create the quiz.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isFormValid}
                      className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all ${
                        isFormValid
                          ? "bg-indigo-600 shadow-md shadow-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
                          : "cursor-not-allowed bg-slate-300"
                      }`}
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                          Creating Quiz...
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          Create Quiz
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ===================================================
              SIDEBAR
          ==================================================== */}
          <aside className="space-y-6">

            {/* QUIZ SUMMARY */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-slate-50 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Activity size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Quiz Summary
                    </h3>

                    <p className="text-xs text-slate-400">
                      Current configuration
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">

                <div className="rounded-xl bg-indigo-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                    Technology
                  </p>

                  <p className="mt-1 truncate text-lg font-bold text-slate-900">
                    {technology || "Not selected"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Difficulty
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {level}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {timeLimit || 0} min
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <FileQuestion
                      size={18}
                      className="text-violet-600"
                    />

                    <span className="text-sm font-medium text-slate-600">
                      Questions
                    </span>
                  </div>

                  <span className="text-xl font-extrabold text-indigo-600">
                    {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                  <CheckCircle2
                    size={16}
                    className="shrink-0 text-emerald-500"
                  />

                  Quiz will be created only when all required fields are valid.
                </div>

              </div>
            </div>

            {/* CSV GUIDE */}
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
                  <Upload size={20} />
                </div>

                <div>
                  <h3 className="font-bold">
                    CSV Upload Guide
                  </h3>

                  <p className="text-xs text-slate-400">
                    Keep your file simple
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                Add the question, four answer options,
                and the correct answer in your CSV file.
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs font-semibold text-slate-400">
                  Expected structure
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-200">
                  Question, Option A, Option B, Option C,
                  Option D, Answer
                </p>
              </div>

            </div>

          </aside>
        </div>
      </main>

      {/* =======================================================
          DETAILS MODAL
      ======================================================== */}
      {detailsModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">

              <div className="flex min-w-0 items-center gap-3">

                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  {detailsModal.type === "totalQuestions" ? (
                    <FileQuestion size={22} />
                  ) : detailsModal.type === "submittedQuizzes" ? (
                    <CheckCircle size={22} />
                  ) : detailsModal.type === "pendingQuizzes" ? (
                    <Clock size={22} />
                  ) : (
                    <Users size={22} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                    {detailsModal.title}
                  </h2>

                  {!loadingDetails && (
                    <p className="text-sm text-slate-500">
                      {detailsModal.data.length}{" "}
                      {detailsModal.type === "totalQuestions"
                        ? "quizzes"
                        : detailsModal.type === "submittedQuizzes" ||
                          detailsModal.type === "pendingQuizzes"
                        ? "attempts"
                        : "users"}
                    </p>
                  )}
                </div>

              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="ml-3 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={22} />
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="min-h-[250px] flex-1 overflow-auto">

              {/* LOADING */}
              {loadingDetails ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
                  <Loader2
                    size={35}
                    className="animate-spin text-indigo-600"
                  />

                  <p className="text-sm font-medium text-slate-500">
                    Loading details...
                  </p>
                </div>
              ) : detailsModal.data.length === 0 ? (

                /* EMPTY */
                <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

                  <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
                    <Info size={30} />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-700">
                    No data available
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    There are currently no records available for this
                    section.
                  </p>

                </div>
              ) : detailsModal.type === "totalQuestions" ? (

                /* =================================================
                   QUESTION DETAILS
                ================================================== */
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[650px] text-left">

                    <thead className="sticky top-0 bg-slate-50">
                      <tr className="border-b border-slate-200">

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          #
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Technology
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Level
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Questions
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Created
                        </th>

                      </tr>
                    </thead>

                    <tbody>
                      {detailsModal.data.map((item, index) => (
                        <tr
                          key={item._id || index}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-800">
                              {item.technology || "N/A"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                              {item.level || "N/A"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-bold text-violet-600">
                              {item.questionCount || 0}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              ) : detailsModal.type === "submittedQuizzes" ||
                detailsModal.type === "pendingQuizzes" ? (

                /* =================================================
                   QUIZ RESULT DETAILS
                ================================================== */
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[900px] text-left">

                    <thead className="sticky top-0 bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          #
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Student
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Technology
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Level
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Questions
                        </th>

                        {detailsModal.type === "submittedQuizzes" && (
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Score
                          </th>
                        )}

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Date
                        </th>

                      </tr>

                    </thead>

                    <tbody>
                      {detailsModal.data.map((item, index) => {

                        const percentage =
                          item.totalQuestions > 0
                            ? (
                                (item.correct /
                                  item.totalQuestions) *
                                100
                              ).toFixed(1)
                            : "0.0";

                        return (
                          <tr
                            key={item._id || index}
                            className="border-b border-slate-100 transition hover:bg-slate-50"
                          >

                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                              {index + 1}
                            </td>

                            <td className="px-5 py-4">
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {item.fullName || "Unknown Student"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {item.email || "N/A"}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                              {item.technology || "N/A"}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                {item.level || "N/A"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                              {item.totalQuestions || 0}
                            </td>

                            {detailsModal.type === "submittedQuizzes" && (
                              <td className="px-5 py-4">
                                <div>
                                  <span className="font-bold text-emerald-600">
                                    {item.correct || 0}/
                                    {item.totalQuestions || 0}
                                  </span>

                                  <span className="ml-2 text-xs text-slate-500">
                                    ({percentage}%)
                                  </span>
                                </div>
                              </td>
                            )}

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {item.createdAt
                                ? new Date(
                                    item.createdAt
                                  ).toLocaleString()
                                : "N/A"}
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>

                  </table>
                </div>
              ) : (

                /* =================================================
                   USER DETAILS
                ================================================== */
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[750px] text-left">

                    <thead className="sticky top-0 bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          #
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Name
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Email
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Role
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Last Active
                        </th>

                      </tr>

                    </thead>

                    <tbody>
                      {detailsModal.data.map((user, index) => (

                        <tr
                          key={user._id || index}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800">
                              {user.fullName || "N/A"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {user.email || "N/A"}
                          </td>

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                              {user.role || "student"}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            {user.isLoggedIn ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                <span className="h-2 w-2 rounded-full bg-slate-400" />
                                Inactive
                              </span>
                            )}

                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {user.lastActiveDate
                              ? new Date(
                                  user.lastActiveDate
                                ).toLocaleString()
                              : "Never"}
                          </td>

                        </tr>

                      ))}
                    </tbody>

                  </table>

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">

              <p className="text-xs text-slate-500">
                Click outside or use the close button to close.
              </p>

              <button
                type="button"
                onClick={closeDetails}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =======================================================
          TOAST
      ======================================================== */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-[110] w-[calc(100%-2rem)] max-w-sm sm:bottom-6 sm:right-6">

          <div
            className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
              toast.type === "success"
                ? "border-emerald-200"
                : "border-red-200"
            }`}
          >

            {toast.type === "success" ? (
              <CheckCircle className="shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="shrink-0 text-red-500" />
            )}

            <p className="text-sm font-medium text-slate-700">
              {toast.message}
            </p>

            <button
              onClick={() =>
                setToast((prev) => ({
                  ...prev,
                  show: false,
                }))
              }
              className="ml-auto text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;