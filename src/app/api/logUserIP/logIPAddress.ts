import axios from "axios";

// Function to log IP address and timestamp
export async function logIpAddress(payload: any) {
    // Check if the payload is empty
  console.log("payload=>", payload);

  const instance = axios.create({
    baseURL: process?.env?.NEXT_PUBLIC_API_URL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  try {
    const response = await instance.post("/publicprod/user_audit", payload);

    return response.data;
  } catch (error: any) {
    throw new Error(`Error logging IP and timestamp: ${error.message}`);
  }
}
