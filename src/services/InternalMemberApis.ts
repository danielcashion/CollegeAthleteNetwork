import { InternalEmailTemplate } from "@/types/InternalMember";
import axios from "axios";
import { CampaignData } from "@/types/Campaign";

export function cleanEmailField(text: string | undefined | null): string {
  if (!text) return "";

  // Remove \r\n from the beginning and end of the string
  return text.replace(/^(\r\n)+|(\r\n)+$/g, "").trim();
}

export function cleanCampaignEmailFields<T extends Record<string, any>>(
  data: T
): T {
  const cleanedData = { ...data };

  // Clean email_subject if it exists
  if ("email_subject" in cleanedData && cleanedData.email_subject) {
    (cleanedData as any).email_subject = cleanEmailField(
      cleanedData.email_subject
    );
  }

  return cleanedData;
}

export const getAllInternalMembers = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/members_internal`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all internal members:", error);
    throw error;
  }
};

export const getInternalMemberByEmail = async (email: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/members_internal?email_address=${email}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching internal member by email:", error);
    throw error;
  }
};

export const getInternalEmailTemplates = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns_templates`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching internal email templates:", error);
    throw error;
  }
};

export const getInternalEmailTemplatesById = async (id: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns_templates?campaign_template_id=${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching internal email templates:", error);
    throw error;
  }
};

export const createInternalEmailTemplate = async (
  templateData: InternalEmailTemplate
) => {
  try {
    // Remove university_name field before sending to API
    const templateDataWithoutUniversity = { ...templateData };
    delete (templateDataWithoutUniversity as any).university_name;

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns_templates`,
      templateDataWithoutUniversity
    );
    return response.data;
  } catch (error) {
    console.error("Error creating internal email template:", error);
    throw error;
  }
};

export const updateInternalEmailTemplate = async (
  templateId: string,
  templateData: InternalEmailTemplate
) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns_templates?campaign_template_id=${templateId}`,
      templateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating internal email template:", error);
    throw error;
  }
};

export const deleteInternalEmailTemplate = async (
  campaign_template_id: string
) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns_templates?campaign_template_id=${campaign_template_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting internal email template:", error);
    throw error;
  }
};

export const createInternalCampaign = async (campaignData: CampaignData) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns`,
      campaignData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
};

export const updateInternalCampaign = async (
  campaign_id: string,
  campaignData: CampaignData
) => {
  try {
    // Clean email fields before sending
    const cleanedData = cleanCampaignEmailFields(campaignData);

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns?campaign_id=${campaign_id}`,
      cleanedData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating campaign:", error);
    throw error;
  }
};

export const getInternalCampaigns = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching internal campaigns:", error);
    throw error;
  }
};

export const getInternalCampaignById = async (campaign_id: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns?campaign_id=${campaign_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign by ID:", error);
    throw error;
  }
};

export const deleteInternalCampaign = async (campaign_id: string) => {
  try {
    const campaign = await getInternalCampaignById(campaign_id);

    if (!campaign || campaign.length === 0) {
      throw new Error("Campaign not found");
    }

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_campaigns?campaign_id=${campaign_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
};

export const getEmailListByUniversityAndFilters = async ({
  university_name,
  gender_id,
  max_roster_year,
  sports,
}: {
  university_name: string; // Can be a single university name or JSON stringified array like '["Yale","Harvard"]'
  gender_id?: number[];
  max_roster_year?: number[];
  sports?: string[];
}) => {
  if (!university_name) {
    throw new Error("university_name is required");
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    // params.append("task", "get_email_list_test");
    params.append("task", "get_single_university_current_students");
    // university_name can be a JSON array string for multiple universities: '["Yale","Harvard"]'
    params.append("university_name", university_name);

    // Add optional array parameters
    if (gender_id && gender_id.length > 0) {
      params.append("gender_id", JSON.stringify(gender_id));
    }

    if (max_roster_year && max_roster_year.length > 0) {
      params.append("max_roster_year", JSON.stringify(max_roster_year));
    }

    if (sports && sports.length > 0) {
      params.append("sports", JSON.stringify(sports));
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/messaging?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching email list:", error);
    throw error;
  }
};

export const getCampaignEventSummaryByCampaignId = async (
  campaign_id: string
) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/campaign_metrics?task=campaign_event_summary&campaign_id=${campaign_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign summary by ID:", error);
    throw error;
  }
};

export const getCampaignLineChartByCampaignId = async (campaign_id: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/campaign_metrics?task=campaign_line_chart&campaign_id=${campaign_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign line chart by ID:", error);
    throw error;
  }
};

export const getCampaignTimeSeriesByCampaignId = async (
  campaign_id: string
) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/campaign_metrics?task=campaign_timeseries&campaign_id=${campaign_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign time series by ID:", error);
    throw error;
  }
};

export const getTotalCountsByUniversity = async ({
  university_name,
}: {
  university_name: string;
}) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/messaging?task=total_counts&university_name=${university_name}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total counts:", error);
    throw error;
  }
};
