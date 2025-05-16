"use client";
import Link from "next/link";
import { postSurvey, type SurveyQuestion } from "@/services/universityApi";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { FaCheck } from "react-icons/fa6";
import { ImSpinner8 } from "react-icons/im";

export default function SurveyForm({
  questions,
  university_name,
  survey_id,
}: {
  questions: SurveyQuestion[] | null;
  university_name: string;
  survey_id: string | any;
}) {
  const router = useRouter();
  const cookieKey = `CollegeAthleteNetwork-${university_name}-${survey_id}`;

  const [responses, setResponses] = useState<
    { question_id: string; answer: number | string | null }[] | null
  >(
    questions?.length
      ? questions.map((q) => ({ question_id: q.question_id, answer: null }))
      : null
  );
  const [email, setEmail] = useState<string>("");
  const [ipAddress, setIpAddress] = useState<string>("");
  const [isSticky, setIsSticky] = useState(false);
  const [alreadyFilled, setAlreadyFilled] = useState<boolean>(false);
  const [surveySubmitted, setSurveySubmitted] = useState<boolean>(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const setCookie = (name: string, value: string, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${expires}; path=/`;
  };

  const getCookie = (name: string) => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  };

  useEffect(() => {
    if (getCookie(cookieKey)) {
      setAlreadyFilled(true);
    }
  }, [cookieKey]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    const sentinel = document.createElement("div");
    Object.assign(sentinel.style, {
      height: "1px",
      width: "100%",
      position: "absolute",
      top: "0",
      left: "0",
    });
    header.parentNode?.insertBefore(sentinel, header);
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.parentNode?.removeChild(sentinel);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipRes.json();
        setIpAddress(ip);
      } catch {}
    })();
  }, []);

  const handleAnswerChange = (
    index: number,
    value: { question_id: string; answer: number | string | null }
  ) => {
    if (!responses) return;
    const updated = [...responses];
    updated[index] = value;
    setResponses(updated);
  };

  const getCompletedCount = () => {
    if (!responses) return 0;
    return responses.filter((r) => r.answer !== null).length;
  };

  const handleSubmit = async () => {
    if (!responses) return;
    if (responses.some((r) => r.answer === null)) {
      alert("Please answer all the questions.");
      return;
    }

    setLoading(true);

    try {
      await Promise.all(
        responses.map((response) =>
          postSurvey({
            survey_id,
            university_name,
            question_id: response.question_id,
            response_value: response.answer!,
            email: email || "",
            ip_address: ipAddress || "",
          })
        )
      );
      setSurveySubmitted(true);
      setCookie(cookieKey, cookieKey);
      setTimeout(() => router.push("/"), 4900);
    } catch (error) {
      console.error("We are so sorry, but something went wrong submitting the survey:", error);
      alert(
        "We are so sorry, but something went wrong submitting the survey. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (alreadyFilled) {
    return (
      <div className="w-full max-w-4xl mx-auto text-black h-[50vh] flex flex-col justify-center items-center gap-4">
        <FaCheck size={100} className="text-[#ed3237]" />
        <p className="text-center text-[#1C315F] text-3xl font-bold">
          You&apos;ve already filled out this survey!
        </p>
        <p className="text-center text-[#1C315F] text-lg font-bold">
          Sorry, only 1 entry per survery, please...
        </p>
        <Link
          href={"/"}
          className="bg-blueMain text-white py-2 px-6 text-xl font-semibold rounded"
        >
          Take me to the Home Page
        </Link>
      </div>
    );
  }

  if (surveySubmitted) {
    return (
      <div className="w-full max-w-4xl mx-auto text-black h-[50vh] flex flex-col justify-center items-center gap-4">
        <FaCheck size={100} className="text-blueMain" />
        <p className="text-center text-[#1C315F] text-3xl font-bold">
          Thank you for submitting your survey!
        </p>
        <p className="text-center text-[#1C315F] text-xl font-bold">
          You will be redirected to our homepage in about 5 seconds …</p>
      </div>
    );
  }

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
          />
        </div>
      </div>

      <div className="p-6 pt-4">
        {questions && questions.length > 0 ? (
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

                {question.question_type === "scale" && (
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
                          className={`py-2 rounded-md transition-all duration-200 font-medium ${
                            responses && responses[index].answer === value
                              ? "bg-blueMain text-white shadow-md"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {question.question_type === "input" && (
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
                Would you like to join our mailing list? (Optional)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email if you&apos;d like to keep current.
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
            disabled={
              !responses || responses.some((r) => r.answer === null) || loading
            }
            className={`px-5 py-2.5 bg-blueMain text-white rounded-lg font-medium transition-colors ${
              !responses || responses.some((r) => r.answer === null)
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <ImSpinner8 size={20} className="animate-spin" />
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
