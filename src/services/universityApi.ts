import axios from "axios";

export interface SurveyQuestion {
  row_id: number;
  survey_id: string;
  question_id: string;
  question: string;
  question_type: "scale" | "text" | "multiple_choice" | string; // you can expand possible values
  is_active_YN: number; // could be boolean if your backend allows
  created_by: string;
  created_datetime: string; // ISO date string
  updated_by: string | null;
  updated_datetime: string | null;
}

export const getUniversityMeta = async ({
  university_name,
}: {
  university_name: string;
}) => {
  try {
    const response = await axios.get(
      `${process.env.BASE_API}/university_meta?university_name=${university_name}`
    );
    return response.data[0];
  } catch (error) {
    console.error("Error fetching teams of university:", error);
    throw error;
  }
};

export const getSurveyQuestions = async ({
  survey_id,
}: {
  survey_id: string;
}) => {
  try {
    const response = await axios.get(
      `${process.env.BASE_API}/survey_questions?survey_id=${survey_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching university meta data:", error);
    throw error;
  }
};

export const postSurvey = async (payload: {
  survey_id: string;
  university_name: string;
  question_id: string;
  response_value: string | number | null;
  email: string | null;
  ip_address?: string | null;
}) => {
  try {
    await axios.post(
      `https://api.tourneymaster.org/publicprod/survey_responses`,
      payload
    );
  } catch (error) {
    console.error("Error posting surbey data:", error);
    throw error;
  }
};
