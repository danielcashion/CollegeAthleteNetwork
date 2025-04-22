"use client";

import { useEffect } from "react";
import { logIpAddress } from "@/app/api/logUserIP/logIPAddress";
import { useUserSessionStore } from "@/store/userSessionStore";

const LogUserIP = () => {
  // get user seesion from global zustand store
  const { session } = useUserSessionStore();

  useEffect(() => {
    const ipLogged = sessionStorage.getItem("ipLogged");
    const created_datetime = new Date().toISOString();

    if (!ipLogged && session) {
      const logIPAndLocation = async () => {
        try {
          // Step 1: Get the user"s IP address from ipify
          const ipResponse = await fetch("https://api.ipify.org?format=json");
          const { ip } = await ipResponse.json();

          if (ip) {
            console.log("IP: ", ip);

            // Step 2: Call the IPAPI Geocoding API to get city and state based on IP
            const apiKey = process?.env?.NEXT_PUBLIC_IPAPI_KEY; // Using public environment variable
            const URL = `https://api.ipapi.com/api/${ip}?access_key=${apiKey}`;

            const geoResponse = await fetch(URL);
            const geoData = await geoResponse.json();

            if (geoData && geoData.city && geoData.region_code) {
              // Extract city, state, latitude, longitude, and country code from the response
              const {
                city,
                region_code: state,
                latitude,
                longitude,
               // country_code,
              } = geoData;

              // const member_id = "ABCD1234"; // Replace with actual member ID
              const app = "CANHomepage";
              const is_active_YN = 1
              const created_by = "iplogger";

              const payload = {
                app,
                ip,
                longitude,
                latitude,
                city,
                state,
                created_datetime,
                created_by,
                is_active_YN,
              };

              // Step 3: Use the logIpAddress function to log the data
              await logIpAddress(payload);

              // Mark IP as logged in sessionStorage to avoid repeated logging
              sessionStorage.setItem("ipLogged", "true");
            } else {
              console.error("Failed to get location data from IPAPI", geoData);
            }
          } else {
            console.error("Failed to retrieve IP");
          }
        } catch (error: any) {
          console.error("Error logging IP or getting location:", error.message);
        }
      };

      logIPAndLocation();
    }
  }, [session]);

  return null;
};

export default LogUserIP;
