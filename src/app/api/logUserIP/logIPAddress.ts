import axios from "axios";

// Function to log IP address and timestamp
export async function logIpAddress(payload: any) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/publicprod/user_audit`,
      payload
    );

    return response.data;
  } catch (error: any) {
    throw new Error(`Error logging IP and timestamp: ${error.message}`);
  }
}
