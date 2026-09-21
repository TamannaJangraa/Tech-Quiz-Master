import React from "react";
import {
  Check,
  CircleHelp,
} from "lucide-react";

const Question = ({
  question,
  selectedAnswer,
  onAnswer,
}) => {
  if (!question) return null;

  const options = question.options || [];

  const labels = ["A", "B", "C", "D"];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ================= QUESTION HEADER ================= */}
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-7">

        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
            <CircleHelp size={18} />
          </div>

          <span>Question</span>
        </div>

      </div>

      {/* ================= QUESTION CONTENT ================= */}
      <div className="px-5 py-6 sm:px-7 sm:py-8">

        <h2 className="text-xl font-bold leading-8 text-slate-900 sm:text-2xl">
          {question.question}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Select the best answer from the options below.
        </p>

        {/* ================= OPTIONS ================= */}
        <div className="mt-7 grid gap-3.5">

          {options.map((option, index) => {
            const isSelected =
              selectedAnswer === option;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onAnswer(option)}
                aria-pressed={isSelected}
                className={`group relative flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 sm:p-5 ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm"
                }`}
              >

                {/* Option Letter */}
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                  }`}
                >
                  {labels[index]}
                </span>

                {/* Option Text */}
                <span
                  className={`flex-1 text-sm leading-6 sm:text-base ${
                    isSelected
                      ? "font-semibold text-indigo-800"
                      : "font-medium text-slate-700"
                  }`}
                >
                  {option}
                </span>

                {/* Selected Check */}
                {isSelected && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}

              </button>
            );
          })}

        </div>

        {/* ================= STATUS ================= */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

          <span className="text-xs font-medium text-slate-500 sm:text-sm">
            {selectedAnswer
              ? "Answer selected"
              : "Choose one option to continue"}
          </span>

          <span
            className={`text-xs font-bold sm:text-sm ${
              selectedAnswer
                ? "text-emerald-600"
                : "text-slate-400"
            }`}
          >
            {selectedAnswer ? "✓ Selected" : "Not answered"}
          </span>

        </div>

      </div>
    </div>
  );
};

export default Question;