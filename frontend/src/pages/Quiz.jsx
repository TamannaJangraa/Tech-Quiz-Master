import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useAuth,
  useUser,
  SignInButton,
} from "@clerk/react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  FileCode2,
  Layers3,
  Play,
  RotateCcw,
  Sparkles,
  Clock3,
  Trophy,
} from "lucide-react";

import { apiRequest } from "../services/api";

import Question from "../components/Question";
import Navbar from "../components/Navbar";

const STORAGE_KEY = "techQuizPendingAttempt";

const Quiz = () => {
  const { getToken } = useAuth();

  const { isLoaded, isSignedIn } = useUser();

  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);

  const [quiz, setQuiz] = useState(null);

  const [playerName, setPlayerName] = useState("");

  const [nameSubmitted, setNameSubmitted] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [attemptId, setAttemptId] = useState(null);

  const [resumeAvailable, setResumeAvailable] =
    useState(false);

  const [startingAttempt, setStartingAttempt] =
    useState(false);

  const attemptStartedRef = useRef(false);

  // ========================================
  // LOAD QUIZZES
  // ========================================

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const token = await getToken();

        const data = await apiRequest(
          "/admin/public-quizzes",
          "GET",
          null,
          token
        );

        console.log("FULL API RESPONSE:", data);

        const availableQuizzes =
          data.quizzes || [];

        console.log(
          "AVAILABLE QUIZZES:",
          availableQuizzes
        );

        if (availableQuizzes.length === 0) {
          setError(
            "No quiz available right now."
          );

          return;
        }

        setQuizzes(availableQuizzes);
      } catch (err) {
        console.error("QUIZ ERROR:", err);

        setError(
          err.message ||
            "Failed to load quizzes"
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [getToken]);

  // ========================================
  // CHECK FOR SAVED QUIZ
  // ========================================

  useEffect(() => {
    if (!isSignedIn) return;

    const savedAttempt =
      localStorage.getItem(STORAGE_KEY);

    if (savedAttempt) {
      try {
        const parsed =
          JSON.parse(savedAttempt);

        if (
          parsed.quiz &&
          parsed.attemptId
        ) {
          setResumeAvailable(true);
        }
      } catch (err) {
        console.error(
          "INVALID SAVED ATTEMPT:",
          err
        );

        localStorage.removeItem(
          STORAGE_KEY
        );
      }
    }
  }, [isSignedIn]);

  // ========================================
  // NAME SUBMIT
  // ========================================

  const handleNameSubmit = () => {
    const trimmedName =
      playerName.trim();

    if (!trimmedName) {
      alert(
        "Please enter your name before starting the quiz."
      );

      return;
    }

    setPlayerName(trimmedName);

    setNameSubmitted(true);
  };

  // ========================================
  // SELECT QUIZ
  // ========================================

  const handleSelectQuiz = (
    selectedQuiz
  ) => {
    console.log(
      "SELECTED QUIZ:",
      selectedQuiz
    );

    setQuiz(selectedQuiz);

    setCurrentQuestion(0);

    setAnswers([]);

    setAttemptId(null);

    attemptStartedRef.current = false;
  };

  // ========================================
  // START PENDING ATTEMPT
  // ========================================

  const createPendingAttempt = async (
    selectedQuiz
  ) => {
    if (
      attemptStartedRef.current ||
      startingAttempt
    ) {
      return null;
    }

    try {
      setStartingAttempt(true);

      const token = await getToken();

      const data = await apiRequest(
        "/results/start-attempt",
        "POST",
        {
          playerName,
          technology:
            selectedQuiz.technology,
          level: selectedQuiz.level,
          totalQuestions:
            selectedQuiz.questions?.length ||
            0,
        },
        token
      );

      const newAttemptId =
        data?.result?._id;

      if (!newAttemptId) {
        throw new Error(
          "Attempt ID was not returned"
        );
      }

      attemptStartedRef.current = true;

      setAttemptId(newAttemptId);

      return newAttemptId;
    } catch (err) {
      console.error(
        "START ATTEMPT ERROR:",
        err
      );

      alert(
        "Unable to start quiz. Please try again."
      );

      return null;
    } finally {
      setStartingAttempt(false);
    }
  };

  // ========================================
  // ANSWER SELECT
  // ========================================

  const handleAnswer = async (
    answer
  ) => {
    const updatedAnswers = [
      ...answers,
    ];

    updatedAnswers[currentQuestion] =
      answer;

    setAnswers(updatedAnswers);

    let currentAttemptId =
      attemptId;

    if (!currentAttemptId) {
      currentAttemptId =
        await createPendingAttempt(
          quiz
        );
    }

    if (currentAttemptId) {
      const progress = {
        attemptId:
          currentAttemptId,

        quiz,

        answers:
          updatedAnswers,

        currentQuestion,

        playerName,

        savedAt:
          new Date().toISOString(),
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(progress)
      );

      setResumeAvailable(true);
    }

    console.log(
      "SELECTED ANSWER:",
      answer
    );
  };

  // ========================================
  // NEXT QUESTION
  // ========================================

  const handleNext = () => {
    if (
      currentQuestion <
      quiz.questions.length - 1
    ) {
      const nextQuestion =
        currentQuestion + 1;

      setCurrentQuestion(
        nextQuestion
      );

      if (attemptId) {
        const progress = {
          attemptId,
          quiz,
          answers,
          currentQuestion:
            nextQuestion,
          playerName,
          savedAt:
            new Date().toISOString(),
        };

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(progress)
        );
      }
    } else {
      localStorage.removeItem(
        STORAGE_KEY
      );

      navigate("/result", {
        state: {
          quiz,
          answers,
          playerName,
          attemptId,
        },
      });
    }
  };

  // ========================================
  // RESUME QUIZ
  // ========================================

  const handleResumeQuiz = () => {
    try {
      const savedAttempt =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!savedAttempt) {
        setResumeAvailable(false);
        return;
      }

      const parsed =
        JSON.parse(savedAttempt);

      if (
        !parsed.quiz ||
        !parsed.attemptId
      ) {
        localStorage.removeItem(
          STORAGE_KEY
        );

        setResumeAvailable(false);

        return;
      }

      setPlayerName(
        parsed.playerName || ""
      );

      setQuiz(parsed.quiz);

      setAnswers(
        parsed.answers || []
      );

      setCurrentQuestion(
        parsed.currentQuestion || 0
      );

      setAttemptId(
        parsed.attemptId
      );

      attemptStartedRef.current =
        true;

      setNameSubmitted(true);

      setResumeAvailable(false);
    } catch (err) {
      console.error(
        "RESUME ERROR:",
        err
      );

      localStorage.removeItem(
        STORAGE_KEY
      );

      setResumeAvailable(false);
    }
  };

  // ========================================
  // TECHNOLOGY ICON
  // ========================================

  const getTechnologyIcon = (
    technology
  ) => {
    const tech =
      technology
        ?.toLowerCase()
        ?.trim();

    if (
      tech === "java" ||
      tech === "javascript" ||
      tech === "python"
    ) {
      return Code2;
    }

    if (
      tech === "html" ||
      tech === "css"
    ) {
      return FileCode2;
    }

    return Brain;
  };

  // ========================================
  // DIFFICULTY STYLE
  // ========================================

  const getDifficultyStyle = (
    level
  ) => {
    const normalizedLevel =
      level
        ?.toLowerCase()
        ?.trim();

    if (
      normalizedLevel ===
      "advanced"
    ) {
      return {
        badge:
          "bg-red-50 text-red-600 border-red-100",
        dot: "bg-red-500",
      };
    }

    if (
      normalizedLevel ===
      "intermediate"
    ) {
      return {
        badge:
          "bg-amber-50 text-amber-600 border-amber-100",
        dot: "bg-amber-500",
      };
    }

    return {
      badge:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
      dot: "bg-emerald-500",
    };
  };

  // ========================================
  // AUTH GUARD
  // ========================================

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Brain size={30} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Login Required
          </h2>

          <p className="mt-2 max-w-md text-slate-500">
            Please sign in before starting
            the quiz.
          </p>

          <SignInButton mode="modal">
            <button className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700">
              Login
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[80vh] flex-col items-center justify-center">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading available quizzes...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Brain size={30} />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {error}
          </h2>

          <button
            onClick={() =>
              navigate("/")
            }
            className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // NAME SCREEN
  // ========================================

  if (!nameSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/60 sm:p-9">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Sparkles size={26} />
            </div>

            <h1 className="mt-5 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              Ready for the challenge?
            </h1>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Enter your name to begin your
              quiz journey.
            </p>

            <div className="mt-7">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Your Name
              </label>

              <input
                type="text"
                value={playerName}
                onChange={(e) =>
                  setPlayerName(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNameSubmit();
                  }
                }}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

              <button
                onClick={
                  handleNameSubmit
                }
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Continue to Quiz
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              {resumeAvailable && (
                <button
                  onClick={
                    handleResumeQuiz
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                  <RotateCcw size={17} />
                  Resume Previous Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // QUIZ SELECTION SCREEN
  // ========================================

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">

          {/* Header */}
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
                <Sparkles size={14} />
                Quiz Library
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Choose Your Quiz
              </h1>

              <p className="mt-2 text-slate-500">
                Welcome,{" "}
                <span className="font-semibold text-indigo-600">
                  {playerName}
                </span>
                . Pick a technology and
                test your skills.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Trophy
                size={18}
                className="text-amber-500"
              />

              <span>
                {quizzes.length}{" "}
                {quizzes.length === 1
                  ? "quiz"
                  : "quizzes"}{" "}
                available
              </span>
            </div>

          </div>

          {/* Quiz Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {quizzes.map((item) => {
              const Icon =
                getTechnologyIcon(
                  item.technology
                );

              const difficulty =
                getDifficultyStyle(
                  item.level
                );

              const questionCount =
                item.questions
                  ?.length || 0;

              return (
                <div
                  key={item._id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
                >
                  {/* Card top */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-6">

                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/20 blur-2xl" />

                    <div className="relative flex items-start justify-between gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                        <Icon size={25} />
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${difficulty.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${difficulty.dot}`}
                        />

                        {item.level}
                      </span>
                    </div>

                    <div className="relative mt-6">
                      <h2 className="text-2xl font-bold capitalize text-white">
                        {item.technology}
                        {" Quiz"}
                      </h2>

                      <p className="mt-1 text-sm text-indigo-200">
                        Technical Knowledge
                      </p>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="flex flex-1 flex-col p-6">

                    <div className="grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Brain size={16} />

                          <span className="text-xs font-medium">
                            Questions
                          </span>
                        </div>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {questionCount}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3.5">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock3 size={16} />

                          <span className="text-xs font-medium">
                            Format
                          </span>
                        </div>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          MCQ
                        </p>
                      </div>

                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2
                        size={17}
                        className="text-emerald-500"
                      />

                      <span>
                        Instant performance
                        tracking
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleSelectQuiz(
                          item
                        )
                      }
                      disabled={
                        startingAttempt
                      }
                      className="group/btn mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      <Play
                        size={17}
                        fill="currentColor"
                      />

                      {startingAttempt
                        ? "Preparing..."
                        : `Start ${item.technology} Quiz`}

                      {!startingAttempt && (
                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover/btn:translate-x-1"
                        />
                      )}
                    </button>

                  </div>
                </div>
              );
            })}

          </div>
        </main>
      </div>
    );
  }

  // ========================================
  // QUIZ QUESTIONS SCREEN
  // ========================================

  const question =
    quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {quiz.technology} Quiz
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Question{" "}
                {currentQuestion + 1} of{" "}
                {quiz.questions.length}
              </p>

              <p className="mt-1 text-sm font-medium text-indigo-600">
                Player: {playerName}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-600 sm:self-auto">
              <Layers3 size={16} />

              {quiz.level}
            </div>

          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
              <span>Progress</span>

              <span>
                {Math.round(
                  ((currentQuestion + 1) /
                    quiz.questions.length) *
                    100
                )}
                %
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestion + 1) /
                      quiz.questions
                        .length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

        </div>

        <Question
          question={question}
          selectedAnswer={
            answers[currentQuestion]
          }
          onAnswer={handleAnswer}
        />

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">

          <button
            onClick={() => {
              setQuiz(null);
              setAttemptId(null);
              attemptStartedRef.current =
                false;
            }}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Change Quiz
          </button>

          <button
            onClick={handleNext}
            disabled={
              !answers[currentQuestion] ||
              startingAttempt
            }
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {currentQuestion ===
            quiz.questions.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </button>

        </div>

        {attemptId && (
          <p className="mt-5 text-center text-xs text-slate-400">
            Your progress is automatically
            saved.
          </p>
        )}

      </div>
    </div>
  );
};

export default Quiz;