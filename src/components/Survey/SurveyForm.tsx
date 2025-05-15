'use client';

import { postSurvey, SurveyQuestion } from '@/services/universityApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SurveyForm({
  questions,
  // primaryColor,
  university_name,
}: {
  questions: SurveyQuestion[] | null;
  // primaryColor: string;
  university_name: string;
}) {
    const router = useRouter();
  const [responses, setResponses] = useState<
    { question_id: string; answer: number | string | null }[] | null
  >(
    questions?.length
      ? questions?.map((question) => ({
          question_id: question.question_id,
          answer: null,
        }))
      : null
  );

  const handleSliderChange = (
    index: number,
    value: { question_id: string; answer: number | string | null }
  ) => {
    if (responses) {
      const updated = [...responses];
      updated[index] = value;
      setResponses(updated);
    }
  };

  const handleSubmit = async () => {
    if (responses) {
      const notAllFilled = responses?.some(
        (response) => response.answer === null
      );
      if (notAllFilled) {
        alert('Please answer all the questions');
        return;
      }
      const promises = responses?.map((response) =>
        postSurvey({
          survey_id: 'surv_303',
          university_name: 'yale',
          question_id: response?.question_id,
          response_value: response?.answer,
        })
      );

      try {
        await Promise.all(promises);
        alert('Thank you for your feedback!');
      } catch (error) {
        console.error('Something went wrong submitting the survey:', error);
        alert('There was an error submitting your feedback. Please try again.');
      }
    }
    // TODO: Send data to your backend/API here
  };

  const handleCancel = () => {
    router.push('/');
  };
  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-4xl mx-auto">
      {questions?.length &&
        questions.map((question, index) => (
          <div key={question.question_id} className="mb-8">
            <label className="block text-lg font-medium mb-2 text-white">
              {index + 1}.{" "}
              {question.question?.replace("{university_name}", university_name)}
            </label>
            <div className="flex items-center space-x-4">
              {question?.question_type === "scale" && (
                <>
                  <span className="text-sm text-white w-40">
                    Strongly Disagree
                  </span>
                  <span className="text-sm text-white">1</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={
                      responses && responses[index].answer !== null
                        ? responses[index]?.answer
                        : 5
                    }
                    onChange={(e) =>
                      handleSliderChange(index, {
                        question_id: question.question_id,
                        answer: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <span className="text-sm text-white">10</span>
                  <span className="text-sm text-white w-40">
                    Strongly Agree
                  </span>
                  <span className="ml-4 text-white font-semibold w-32 text-center">
                    Your answer: {responses ? responses[index]?.answer : 5}
                  </span>
                </>
              )}
              {question?.question_type === "input" && (
                <textarea
                  rows={4}
                  placeholder="Please tell us what you think here..."
                  onChange={(e) =>
                    handleSliderChange(index, {
                      question_id: question.question_id,
                      answer: e.target.value,
                    })
                  }
                  className="w-full outline-none border-2 rounded-lg"
                />
              )}
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
  );
}
