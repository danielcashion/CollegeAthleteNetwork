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
