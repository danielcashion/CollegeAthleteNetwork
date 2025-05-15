import SurveyForm from '@/components/Survey/SurveyForm';
import {
  getSurveyQuestions,
  getUniversityMeta,
} from '@/services/universityApi';
import Image from 'next/image';

// TO <DO>
// 1. Add a API request to GET the university_meta data
// 2. Add a API request to GET the survey_questions for each survey_id
// 3. Add a API request to POST the survey responses

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ university_name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { university_name } = await params;
  const { survey_id } = (await searchParams) || undefined;

  const data = university_name
    ? await getUniversityMeta({ university_name })
    : null;

  const surveyQuestion = survey_id
    ? await getSurveyQuestions({ survey_id: survey_id as string })
    : null;

  return (
    <div className=" p-6 pt-24 bg-gradient-to-r from-[#1C315F] to-[#ED3237]">
      <div className="flex flex-col items-center justify-center gap-5 mb-5">
        <Image
          src={data?.logo_url}
          alt={data.university_name}
          height={100}
          width={100}
        />
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          {data.university_name}&apos Athlete Network Survey
        </h1>
      </div>

      {surveyQuestion?.length && (
        <SurveyForm
          questions={surveyQuestion}
          university_name={data.university_name ?? ''}
          // primaryColor={data?.primary_hex ?? 'blue'}
        />
      )}
    </div>
  );
}
