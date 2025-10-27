import { InternalEmailTemplate } from "@/types/InternalMember";
import axios from "axios";

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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_email_templates`
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_email_templates?template_id=${id}`
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
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_email_templates`,
      templateData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating internal email template:", error);
    throw error;
  }
};

export const updateInternalEmailTemplate = async (
  templateData: InternalEmailTemplate
) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_email_templates`,
      templateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating internal email template:", error);
    throw error;
  }
};

export const deleteInternalEmailTemplate = async (template_id: string) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/internal_email_templates?template_id=${template_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting internal email template:", error);
    throw error;
  }
};
