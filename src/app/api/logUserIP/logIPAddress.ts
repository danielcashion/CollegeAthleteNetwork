import axios from "axios";

// Function to log IP address and timestamp
export async function logIpAddress(payload: any) {
  // Check if the payload is empty
  console.log("payload=>", payload);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user_audit`,
      payload
    );

    return response.data;
  } catch (error: any) {
    throw new Error(`Error logging IP and timestamp: ${error.message}`);
  }
}
