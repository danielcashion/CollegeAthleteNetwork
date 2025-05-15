import SurveyForm from "@/components/Survey/SurveyForm";
import {
  getSurveyQuestions,
  getUniversityMeta,
} from "@/services/universityApi";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ university_name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { university_name } = await params;
  const { survey_id } = (await searchParams) || undefined;

  if (!survey_id) {
    redirect("/");
  }

  const data = university_name
    ? await getUniversityMeta({ university_name })
    : null;

  const surveyQuestion = survey_id
    ? await getSurveyQuestions({ survey_id: survey_id as string })
    : null;

  return (
    <div className="">
      <div className="pt-24 pb-10 flex flex-col items-center justify-center gap-5 mb-5 bg-gradient-to-r from-[#1C315F] to-[#ED3237]">
        <Image
          src={data?.logo_url}
          alt={data.university_name}
          height={100}
          width={100}
        />
        <h1 className="text-4xl font-bold mb-2 text-center text-white">
          {data.university_name}&apos;s Athlete Network Survey
        </h1>
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Survey Topic: How Strong is the Athlete Network Offering at{" "}
          {data.university_name}?
        </h2>
      </div>

      <div className="bg-[#F9FAFB]">
        {surveyQuestion?.length && (
          <SurveyForm
            questions={surveyQuestion}
            university_name={data.university_name ?? ""}
            survey_id={survey_id}
          />
        )}
      </div>
    </div>
  );
}
