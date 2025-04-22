"use client";

import { useEffect, useState } from "react";
import { logIpAddress } from "@/app/api/logUserIP/logIPAddress";
import { useAppStore } from "@/store/appStore";

const LogUserIP = () => {
  const { userIp, setUserIp } = useAppStore();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userIp || loading) return;
    setLoading(true);

    const logIPAndLocation = async () => {
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipRes.json();
        if (!ip) throw new Error("No IP returned");

        const geoRes = await fetch(
          `https://api.ipapi.com/api/${ip}?access_key=${process.env.NEXT_PUBLIC_IPAPI_KEY}`
        );
        const geo = await geoRes.json();
        const { city, region_code: state, latitude, longitude } = geo;
        if (!city || !state) {
          console.error("Incomplete geo data:", geo);
          return;
        }

        const payload = {
          app: "CANHomepage",
          ip,
          city,
          state,
          latitude,
          longitude,
          created_datetime: new Date().toISOString(),
          created_by: "iplogger",
          is_active_YN: 1,
        };
        await logIpAddress(payload);

        setUserIp(ip);
      } catch (err: any) {
        console.error("Error logging IP or location:", err);
      } finally {
        setLoading(false);
      }
    };

    logIPAndLocation();
  }, [userIp]);

  return null;
};

export default LogUserIP;
