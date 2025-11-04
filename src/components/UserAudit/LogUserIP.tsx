"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";

const LogUserIP = () => {
  const { userIp, setUserIp } = useAppStore();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userIp || loading) return;
    setLoading(true);

    const logIPAndLocation = async () => {
      try {
        console.log("Starting IP logging process...");
        
        // Use our internal API route instead of external APIs directly
        const response = await fetch("/api/logUserIP", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Send empty body since the API route handles IP detection
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API error: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.log("IP logging response:", data);

        if (data.success && data.ip) {
          setUserIp(data.ip);
          console.log("Successfully logged IP:", data.ip, "Location:", data.location);
        } else {
          console.warn("IP logging completed but no IP returned:", data);
        }

      } catch (err: any) {
        console.error("Error logging IP or location:", err);
        
        // Don't retry on client errors (4xx) but allow the component to continue
        if (err.message?.includes("4")) {
          console.log("Client error detected, not retrying");
        }
      } finally {
        setLoading(false);
      }
    };

    logIPAndLocation();
  }, [userIp, loading, setUserIp]);

  return null;
};

export default LogUserIP;
