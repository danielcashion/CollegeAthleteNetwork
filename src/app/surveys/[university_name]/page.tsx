import SurveyForm from "@/components/Survey/SurveyForm";
import {
  getSurveyQuestions,
  getUniversityMeta,
} from "@/services/universityApi";
import Image from "next/image";
import { redirect } from "next/navigation";
// import CANColorLogo from "../../../public/Logos/CANLogo1200X1200Color.png";
import CANColorLogo from "../../../../public/Logos/CANLogo1200X1200Color.png";


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

  if (surveyQuestion.length === 0) {
    redirect("/");
  }

  return (
    <div className="">
      <div className="pt-24 pb-10 flex flex-col items-center justify-center gap-5 mb-5 bg-gradient-to-r from-[#1C315F] to-[#ED3237]">
        <Image
          src={CANColorLogo}
          alt="The College Athlete Network" //{data.university_name}
          height={200}
          width={200}
        />
        {/* <Image
          src={data?.logo_url}
          alt={data.university_name}
          height={100}
          width={100}
        /> */}
        <h1 className="text-5xl font-bold mb-2 text-center text-white">
          {data.university_name}&apos;s Athlete Network Survey
        </h1>
        <h2 className="text-4xl font-bold mb-2 text-center text-white" role="heading" aria-level="2">
          Survey Topic: Opportunities to Strengthen the Athlete Network at{" "}
          {data.university_name}
        </h2>
        <h2 className="text-md font-bold mb-1 text-center text-white" role="heading" aria-level="3">
          This survey is strictly anonymous and confidential. All reasponses will{" "}
          <strong>*not*</strong> be shared with anyone outside of the{" "}
          {data.university_name} Athletic Department.
        </h2>
        <h2 className="text-md font-bold text-center text-white" role="heading" aria-level="3">
          Please also note that while we are actively seeking to provide our
          services to {data.university_name}, we currently have{" "}
          <strong>no affiliation</strong> with the university.
        </h2>

        {/* <h4 className="text-lg font-bold mb-6 text-center text-white">
          The College Athlete Network strengthens other universities&apos;
          Athlete Networks, and we are{" "}
          <strong>independently researching</strong> the offering at{" "}
          {data.university_name}.
        </h4> */}
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
