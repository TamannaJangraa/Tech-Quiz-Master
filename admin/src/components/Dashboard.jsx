import React, { useState, useRef, useEffect } from "react";
import Navbar from "./navbar.jsx";
import { useAuth } from "@clerk/react";
import { apiRequest } from "../services/api/api.js";

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

      if (char === "\r" && csvText[i + 1] === "\n") {
        i++;
      }

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
  const { getToken } = useAuth();
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

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalLoggedIn: 0,
    totalQuestions: 0,
    loggedInPercentage: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = "Admin Dashboard | Tech Quiz Master";

    const loadStats = async () => {
      try {
        const token = await getToken();

        const data = await apiRequest(
          "/admin/stats",
          "GET",
          null,
          token
        );

        console.log("STATS API RESPONSE:", data);

        setAdminStats({
          totalUsers: data.totalUsers || 0,
          totalLoggedIn: data.loggedInUsers || 0,
          totalQuestions: data.totalQuestions || 0,
          loggedInPercentage: data.loggedInPercentage || 0,
        });
      } catch (error) {
        console.error("Stats error:", error);
      }
      finally {
  setLoadingStats(false);
}
    };

    loadStats();
  }, [getToken]);

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

  const validateForm = () => {
    const errors = {};

    if (!technology.trim()) {
      errors.technology = "Technology name is required";
    }

    if (!level) {
      errors.level = "Level is required";
    }

    if (!timeLimit || Number(timeLimit) < 1) {
      errors.timeLimit =
        "Time limit must be at least 1 minute";
    }

    if (questions.length === 0) {
      errors.questions =
        "Please upload a CSV file with questions";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

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

  const processCSVText = (csvText) => {
    if (!csvText) return;

    setCsvError("");

    const rows = parseCSVText(csvText);

    if (rows.length === 0) {
      setCsvError(
        "Uploaded CSV is empty or invalid"
      );

      return;
    }

    const header = rows[0].map((c) =>
      c.toLowerCase()
    );

    let startIdx = 0;

    const hasQuestionHeader = header.some(
      (h) =>
        h.includes("question") ||
        h.includes("q.")
    );

    const hasAnswerHeader = header.some(
      (h) =>
        h.includes("answer") ||
        h.includes("correct")
    );

    const hasOptionsHeader = header.some(
      (h) =>
        h.includes("option") ||
        h.includes("choice")
    );

    if (
      hasQuestionHeader &&
      (hasAnswerHeader || hasOptionsHeader)
    ) {
      startIdx = 1;
    }

    const parsedQuestions = [];

    for (
      let i = startIdx;
      i < rows.length;
      i++
    ) {
      const row = rows[i];

      if (
        row.length === 0 ||
        row.every((cell) => !cell.trim())
      ) {
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

      const answerRaw = (
        paddedRow[5] || ""
      )
        .trim()
        .toUpperCase();

      let answerKey = "";
      let answerText = "";
      let foundAnswer = false;

      if (
        ["A", "B", "C", "D"].includes(
          answerRaw
        )
      ) {
        answerKey = answerRaw;

        const index = [
          "A",
          "B",
          "C",
          "D",
        ].indexOf(answerRaw);

        answerText =
          options[index] || answerRaw;

        foundAnswer = true;
      }

      if (
        !foundAnswer &&
        ["1", "2", "3", "4"].includes(
          answerRaw
        )
      ) {
        const index =
          parseInt(answerRaw, 10) - 1;

        answerKey = [
          "A",
          "B",
          "C",
          "D",
        ][index];

        answerText =
          options[index] || answerRaw;

        foundAnswer = true;
      }

      if (!foundAnswer) {
        for (
          let j = 0;
          j < options.length;
          j++
        ) {
          if (
            options[j]
              .trim()
              .toLowerCase() ===
            answerRaw.toLowerCase()
          ) {
            answerKey = [
              "A",
              "B",
              "C",
              "D",
            ][j];

            answerText = options[j];
            foundAnswer = true;

            break;
          }
        }
      }

      if (!foundAnswer) {
        for (
          let j = 0;
          j < options.length;
          j++
        ) {
          if (
            options[j]
              .trim()
              .toLowerCase()
              .includes(
                answerRaw.toLowerCase()
              ) ||
            (answerRaw &&
              answerRaw
                .toLowerCase()
                .includes(
                  options[j]
                    .trim()
                    .toLowerCase()
                ))
          ) {
            answerKey = [
              "A",
              "B",
              "C",
              "D",
            ][j];

            answerText = options[j];
            foundAnswer = true;

            break;
          }
        }
      }

      if (!foundAnswer && options[0]) {
        answerKey = "A";
        answerText = options[0];
      }

      if (question.trim()) {
        parsedQuestions.push({
          question: question.trim(),
          options: options.map((option) =>
            option.trim()
          ),
          answerKey,
          answerText,
        });
      }
    }

    if (parsedQuestions.length === 0) {
      setCsvError(
        "No valid questions found in CSV"
      );

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      setToast({
        show: true,
        type: "error",
        message:
          "Please fill all required fields",
      });

      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        technology: technology.trim(),
        level,
        timeLimit: parseInt(
          timeLimit,
          10
        ),
        questions,
        totalQuestions: questions.length,
      };

      const token = await getToken();

      await apiRequest(
        "/admin/upload-quiz",
        "POST",
        payload,
        token
      );

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
        message:
          err.message || "Quiz upload failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Welcome */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Sparkles size={21} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    Admin Dashboard
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage quizzes and monitor your platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5">
              <Activity
                size={18}
                className="text-indigo-600"
              />

              <span className="text-sm font-semibold text-indigo-700">
                Quiz Management
              </span>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {loadingStats
                    ? "..."
                    : adminStats.totalUsers}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Registered participants
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Logged In Users
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {loadingStats
                    ? "..."
                    : adminStats.totalLoggedIn}
                </h3>

                <p className="mt-2 text-xs text-emerald-600">
                  Currently active
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <UserCheck size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Questions Loaded
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {loadingStats ? "..." : adminStats.totalQuestions}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Ready for current quiz
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <FileQuestion size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  User Activity
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {loadingStats
                    ? "..."
                    : `${adminStats.loggedInPercentage}%`}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Logged in percentage
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>
        </section>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">

          {/* Create Quiz */}
          <section className="xl:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
                    <FileQuestion size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Create New Quiz
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Configure your quiz and upload questions using a CSV file.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-5 sm:p-6">

                {/* Technology */}
                <div>
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
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${validationErrors.technology
                      ? "border-red-400 focus:ring-red-100"
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

                {/* Difficulty */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Difficulty Level
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {levels.map((lvl) => {
                      const selected =
                        level === lvl.value;

                      const styles = {
                        Basic: selected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-emerald-300",

                        Intermediate: selected
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 hover:border-amber-300",

                        Advanced: selected
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-slate-200 hover:border-rose-300",
                      };

                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => {
                            setLevel(lvl.value);

                            setValidationErrors(
                              (prev) => ({
                                ...prev,
                                level: "",
                              })
                            );
                          }}
                          className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold transition ${styles[lvl.value]}`}
                        >
                          {selected && (
                            <CheckCircle2
                              size={17}
                              className="mx-auto mb-1"
                            />
                          )}

                          {lvl.value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Time Limit
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Clock
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        inputMode="numeric"
                        value={timeLimit}
                        onChange={(e) => {
                          const value =
                            e.target.value;

                          if (
                            value === "" ||
                            /^\d+$/.test(value)
                          ) {
                            setTimeLimit(value);

                            setValidationErrors(
                              (prev) => ({
                                ...prev,
                                timeLimit: "",
                              })
                            );
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setTimeLimit(30);
                          }
                        }}
                        className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4 ${validationErrors.timeLimit
                          ? "border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                          }`}
                      />
                    </div>

                    <div className="flex items-center justify-center rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600">
                      {timeLimit || 0} minutes
                    </div>
                  </div>

                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <Info size={15} />
                    Time allocated to each participant.
                  </p>
                </div>

                {/* CSV Upload */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Upload Questions CSV
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${isDragging
                      ? "border-indigo-500 bg-indigo-50"
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

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                      <UploadCloud size={28} />
                    </div>

                    <h3 className="font-semibold text-slate-700">
                      {isDragging
                        ? "Drop your CSV file here"
                        : "Drag & drop your CSV file"}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      or click here to browse your computer
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      Question, Option A, Option B, Option C, Option D, Correct Answer
                    </p>
                  </div>

                  {csvFileName && (
                    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <CheckCircle
                          size={19}
                          className="shrink-0 text-emerald-600"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-emerald-700">
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

                          setShowPreview(
                            !showPreview
                          );
                        }}
                        className="w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 sm:w-auto"
                      >
                        {showPreview
                          ? "Hide Preview"
                          : "Preview"}
                      </button>
                    </div>
                  )}

                  {csvError && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle size={16} />
                      {csvError}
                    </p>
                  )}

                  {validationErrors.questions && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle size={16} />
                      {validationErrors.questions}
                    </p>
                  )}
                </div>

                {/* Preview */}
                {showPreview &&
                  questions.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-800">
                            Question Preview
                          </h3>

                          <p className="text-sm text-slate-500">
                            Showing the first 3 uploaded questions
                          </p>
                        </div>

                        <Eye
                          size={20}
                          className="shrink-0 text-indigo-600"
                        />
                      </div>

                      <div className="space-y-3">
                        {questions
                          .slice(0, 3)
                          .map(
                            (question, index) => (
                              <div
                                key={index}
                                className="rounded-xl border border-slate-200 bg-white p-4"
                              >
                                <p className="font-semibold text-slate-800">
                                  {index + 1}.{" "}
                                  {
                                    question.question
                                  }
                                </p>

                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                  {question.options.map(
                                    (
                                      option,
                                      optionIndex
                                    ) => {
                                      const letter =
                                        [
                                          "A",
                                          "B",
                                          "C",
                                          "D",
                                        ][
                                        optionIndex
                                        ];

                                      const correct =
                                        question.answerKey ===
                                        letter;

                                      return (
                                        <div
                                          key={
                                            optionIndex
                                          }
                                          className={`rounded-lg border px-3 py-2 text-sm ${correct
                                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                            : "border-slate-200 text-slate-600"
                                            }`}
                                        >
                                          <span className="mr-2 font-bold">
                                            {letter}.
                                          </span>

                                          {option}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  )}

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition ${isFormValid
                      ? "bg-indigo-600 shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl"
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
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                  <Activity size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Quiz Summary
                  </h3>

                  <p className="text-xs text-slate-500">
                    Current configuration
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">
                    Technology
                  </span>

                  <span className="truncate text-sm font-semibold text-slate-800">
                    {technology ||
                      "Not selected"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">
                    Difficulty
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {level}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">
                    Time Limit
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {timeLimit || 0} min
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Questions
                  </span>

                  <span className="text-sm font-semibold text-indigo-600">
                    {questions.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <Upload
                  size={21}
                  className="text-indigo-300"
                />

                <h3 className="font-bold">
                  CSV Upload Guide
                </h3>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                Your CSV should contain a question,
                four options, and the correct answer.
              </p>

              <div className="mt-5 overflow-x-auto rounded-xl bg-white/10 p-4 font-mono text-xs leading-6 text-slate-300">
                Question<br />
                Option A<br />
                Option B<br />
                Option C<br />
                Option D<br />
                Correct Answer
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="flex gap-3">
                <Sparkles
                  size={21}
                  className="mt-0.5 shrink-0 text-indigo-600"
                />

                <div>
                  <h4 className="font-semibold text-indigo-900">
                    Admin Tip
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-indigo-700">
                    Preview your uploaded questions before creating the quiz to ensure all options and answers are correctly detected.
                  </p>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm sm:bottom-6 sm:right-6">
          <div
            className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${toast.type === "success"
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