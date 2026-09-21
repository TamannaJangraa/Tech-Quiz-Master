import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser, SignInButton } from "@clerk/react";
import {
  ArrowRight,
  Brain,
  Clock3,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();

  const handleStartQuiz = () => {
    if (!isLoaded || !isSignedIn) return;
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ================= HERO ================= */}
      <main>
        <section className="relative overflow-hidden">
          {/* Soft background decoration */}
          <div className="absolute left-0 top-0 -z-0 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute right-0 top-20 -z-0 h-72 w-72 rounded-full bg-violet-100/60 blur-3xl" />

          <div className="relative mx-auto flex min-h-[600px] max-w-5xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm">
              <Brain size={17} />
              Learn • Practice • Compete
            </div>

            {/* Heading */}
            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
              Test Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Technical Skills
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Challenge yourself with technology-based quizzes, improve your
              knowledge, and see how you rank against other participants.
            </p>

            {/* Buttons */}
            {!isLoaded ? (
              <div className="mt-8 h-12 w-36 animate-pulse rounded-xl bg-slate-200" />
            ) : isSignedIn ? (
              <button
                onClick={handleStartQuiz}
                className="group mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300"
              >
                Start Quiz
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            ) : (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/register")}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <SignInButton mode="modal">
                  <button className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600">
                    Login
                  </button>
                </SignInButton>
              </div>
            )}

            {/* Trust points */}
            <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Multiple technologies
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Multiple difficulty levels
              </span>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">

            <div className="mb-9 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Why Tech Quiz Master?
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Learn. Practice. Improve.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Brain size={22} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Practice
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Test your knowledge across different technologies and
                  programming topics.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Clock3 size={22} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Challenge
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Attempt timed quizzes and challenge yourself to improve
                  your accuracy.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Trophy size={22} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Compete
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Check your results and compare your performance on the
                  leaderboard.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;