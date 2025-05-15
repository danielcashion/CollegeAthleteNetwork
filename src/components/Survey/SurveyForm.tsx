"use client";

import { postSurvey, type SurveyQuestion } from "@/services/universityApi";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

export default function SurveyForm({
  questions,
  university_name,
}: {
  questions: SurveyQuestion[] | null;
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

  const [email, setEmail] = useState<string>("");

  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );

    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    sentinel.style.width = "100%";
    sentinel.style.position = "absolute";
    sentinel.style.top = "0";
    sentinel.style.left = "0";

    if (header.parentNode) {
      header.parentNode.insertBefore(sentinel, header);
    }

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }
    };
  }, []);

  const handleAnswerChange = (
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
        alert("Please answer all the questions");
        return;
      }
      const promises = responses?.map((response) =>
        postSurvey({
          survey_id: "surv_303",
          university_name: "yale",
          question_id: response?.question_id,
          response_value: response?.answer,
          email: email || "",
        })
      );

      try {
        await Promise.all(promises);
        alert("Thank you for your feedback!");
      } catch (error) {
        console.error("Something went wrong submitting the survey:", error);
        alert("There was an error submitting your feedback. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  const getCompletedCount = () => {
    if (!responses) return 0;
    return responses.filter((response) => response.answer !== null).length;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 relative">
      <div
        ref={headerRef}
        className={`sticky top-0 z-10 bg-white px-6 ${
          isSticky ? "pt-24" : "pt-6"
        } pb-4 border-b border-gray-100 rounded-t-xl shadow-sm transition-padding duration-200`}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Feedback Survey
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Please answer all questions to submit your feedback
          </p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-gray-600">Progress:</span>
            <div className="flex items-center gap-1">
              <span className="text-redMain">{getCompletedCount()}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{questions?.length || 0}</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-blueMain h-full rounded-full transition-all duration-300"
            style={{
              width: `${
                questions?.length
                  ? (getCompletedCount() / questions.length) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>
      </div>

      <div className="p-6 pt-4">
        {questions?.length ? (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.question_id}
                className={`p-6 rounded-lg border ${
                  responses && responses[index].answer !== null
                    ? "border-emerald-100 bg-green-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-800">
                      {question.question?.replace(
                        "{university_name}",
                        university_name
                      )}
                    </h3>

                    {responses && responses[index].answer !== null && (
                      <div className="flex items-center mt-1 text-emerald-600 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        <span>Answered</span>
                      </div>
                    )}
                  </div>
                </div>

                {question?.question_type === "scale" && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Strongly Disagree</span>
                      <span>Strongly Agree</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1 sm:gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            handleAnswerChange(index, {
                              question_id: question.question_id,
                              answer: value,
                            })
                          }
                          className={`
                          py-2 rounded-md transition-all duration-200 font-medium
                          ${
                            responses && responses[index].answer === value
                              ? "bg-blueMain text-white shadow-md"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }
                        `}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {question?.question_type === "input" && (
                  <div className="mt-4">
                    <textarea
                      rows={4}
                      placeholder="Please tell us what you think here..."
                      onChange={(e) =>
                        handleAnswerChange(index, {
                          question_id: question.question_id,
                          answer: e.target.value,
                        })
                      }
                      value={
                        (responses && (responses[index].answer as string)) || ""
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain outline-none transition-all"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No questions available</p>
          </div>
        )}

        <div className="mt-6 mb-6 p-6 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800">
                Would you like to stay updated? (Optional)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email if you'd like to receive further updates about
                this initiative.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueMain focus:border-blueMain outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!responses || responses.some((r) => r.answer === null)}
            className={`px-5 py-2.5 bg-blueMain text-white rounded-lg font-medium transition-colors ${
              !responses || responses.some((r) => r.answer === null)
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700 text-white"
            }`}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
