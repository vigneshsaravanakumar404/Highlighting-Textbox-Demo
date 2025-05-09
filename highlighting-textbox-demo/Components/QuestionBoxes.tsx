import { useState, useEffect } from "react";

type QuestionBoxesProps = {
    questions: Question[];
    index: number; // Added index parameter
};

export type Question = {
    id: string;
    title: string;
    type: string;
};

export function QuestionBoxes({ questions, index }: QuestionBoxesProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="grid grid-cols-3 gap-4 p-4 w-full">
            {questions.map((question, questionIndex) => {
                // Determine if this question is in focus
                const isInFocus = questionIndex === index;

                return (
                    <div
                        key={question.id}
                        className={`space-y-2 ${!isInFocus ? "opacity-50" : ""}`}
                    >
                        <label
                            className={`block text-sm font-medium ${isInFocus ? "text-black" : "text-gray-500"}`}
                        >
                            {question.title}
                        </label>
                        <input
                            type={question.type}
                            value={answers[question.id] || ""}
                            onChange={e => handleChange(question.id, e.target.value)}
                            className={`w-full h-10 border ${isInFocus ? "border-gray-800 bg-white" : "border-gray-300 bg-gray-100"} text-sm font-mono px-2 tracking-widest ${isInFocus ? "text-black" : "text-gray-400"}`}
                            style={{ borderRadius: 0 }}
                            disabled={!isInFocus}
                        />
                    </div>
                );
            })}
        </div>
    );
}