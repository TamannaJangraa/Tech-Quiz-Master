import React from "react";

const Question = ({
  question,
  selectedAnswer,
  onAnswer,
}) => {
  if (!question) return null;

  const options = question.options || [];

  const labels = ["A", "B", "C", "D"];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
      
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-8">
        {question.question}
      </h2>

      <div className="grid gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option)}
            className={`w-full flex items-center gap-4 text-left p-4 rounded-xl border-2 transition-all ${
              selectedAnswer === option
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-indigo-300"
            }`}
          >
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-full font-semibold ${
                selectedAnswer === option
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {labels[index]}
            </span>

            <span className="font-medium text-gray-800">
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Question;