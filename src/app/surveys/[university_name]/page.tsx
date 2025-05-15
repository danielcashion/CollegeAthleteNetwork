"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


// TO <DO>
// 1. Add a API request to GET the university_meta data
// 2. Add a API request to GET the survey_questions for each survey_id
// 3. Add a API request to POST the survey responses

const questions = [
    {"I want to stay connected with other athletes from my university after graduation.",
    "My university does not currently offer an easy or effective way for athletes to stay connected.",
    "I would benefit from a private online network made specifically for athletes and alumni from my university.",
    "I would use a platform that helps me connect with former athletes for mentorship, career advice, or job opportunities.",
    "I feel disconnected from other athletes who came before or after me at my university.",
    "Athletes have different career journeys than the general student population and need a dedicated support network.",
    "A university-backed athlete network would help me transition from sports to a career more confidently.",
    "Seeing what other athletes from my university are doing professionally would motivate and inspire me.",
    "I would be more likely to stay engaged with my athletic program if this kind of network existed.",
    "My university should invest in a platform that connects its current and former athletes in a meaningful way.",
];

export default function SurveyPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<number[]>(
    Array(questions.length).fill(5)
  );

  const handleSliderChange = (index: number, value: number) => {
    const updated = [...responses];
    updated[index] = value;
    setResponses(updated);
  };

  const handleSubmit = () => {
    console.log("Survey submitted:", responses);
    alert("Thank you for your feedback!");
    // TODO: Send data to your backend/API here
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Athlete Network Survey</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        {questions.map((question, index) => (
          <div key={index} className="mb-8">
            <label className="block text-lg font-medium mb-2">
              {index + 1}. {question}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">1</span>
              <input
                type="range"
                min={1}
                max={10}
                value={responses[index]}
                onChange={(e) =>
                  handleSliderChange(index, parseInt(e.target.value))
                }
                className="w-full"
              />
              <span className="text-sm text-gray-600">10</span>
              <span className="ml-4 text-gray-800 font-semibold w-8 text-center">
                {responses[index]}
              </span>
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
