import { NextRequest, NextResponse } from "next/server";

/** Browsers send Origin: null for opaque origins (sandboxed iframe, some in-app browsers, file:). */
function corsAllowOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (origin === "null") {
    return "null";
  }
  if (!origin) {
    return null;
  }
  const allowed = new Set([
    "https://www.collegeathletenetwork.org",
    "https://collegeathletenetwork.org",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);
  if (process.env.VERCEL_URL) {
    allowed.add(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    allowed.add(process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""));
  }
  return allowed.has(origin) ? origin : null;
}

function withCors(request: NextRequest, res: NextResponse): NextResponse {
  const allow = corsAllowOrigin(request);
  if (allow !== null) {
    res.headers.set("Access-Control-Allow-Origin", allow);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("Access-Control-Max-Age", "86400");
  }
  return res;
}

export async function OPTIONS(request: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  return withCors(request, res);
}

export async function POST(request: NextRequest) {
  try {
    // Get the real IP address from various headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    
    // Priority order: CF-Connecting-IP > X-Real-IP > X-Forwarded-For > fallback
    let clientIp = cfConnectingIp || realIp || forwarded?.split(",")[0] || "unknown";
    
    console.log("IP logging attempt:", {
      forwarded,
      realIp,
      cfConnectingIp,
      clientIp,
      userAgent: request.headers.get("user-agent"),
    });

    // If we couldn't get IP from headers, try to fetch it
    if (clientIp === "unknown") {
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json", {
          headers: {
            'User-Agent': 'CollegeAthleteNetwork/1.0'
          }
        });
        const { ip } = await ipRes.json();
        clientIp = ip || "unknown";
      } catch (ipError) {
        console.error("Failed to fetch IP from ipify:", ipError);
      }
    }

    // Get location data if we have an IP
    let locationData = {
      city: "Unknown",
      state: "Unknown", 
      latitude: null,
      longitude: null,
    };

    if (clientIp !== "unknown" && process.env.NEXT_PUBLIC_IPAPI_KEY) {
      try {
        const geoRes = await fetch(
          `https://api.ipapi.com/api/${clientIp}?access_key=${process.env.NEXT_PUBLIC_IPAPI_KEY}`,
          {
            headers: {
              'User-Agent': 'CollegeAthleteNetwork/1.0'
            }
          }
        );
        const geo = await geoRes.json();
        
        if (geo && !geo.error) {
          locationData = {
            city: geo.city || "Unknown",
            state: geo.region_code || "Unknown",
            latitude: geo.latitude,
            longitude: geo.longitude,
          };
        } else {
          console.warn("Geo API returned error:", geo);
        }
      } catch (geoError) {
        console.error("Failed to fetch location data:", geoError);
      }
    }

    // Create the payload for logging
    const payload = {
      app: "CANHomepage",
      ip: clientIp,
      city: locationData.city,
      state: locationData.state,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      created_datetime: new Date().toISOString(),
      created_by: "iplogger",
      is_active_YN: 1,
    };

    // Log to external API if configured
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/publicprod/user_audit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'User-Agent': 'CollegeAthleteNetwork/1.0'
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`External API error: ${response.status} ${response.statusText}`);
        }

        await response.json(); // Consume the response
        console.log("Successfully logged IP to external API");
        
        return withCors(
          request,
          NextResponse.json({
            success: true,
            ip: clientIp,
            location: locationData,
            message: "IP logged successfully",
          })
        );
      } catch (apiError) {
        console.error("External API logging failed:", apiError);
        // Continue to return success even if external logging fails
      }
    }

    // Return success response
    return withCors(
      request,
      NextResponse.json({
        success: true,
        ip: clientIp,
        location: locationData,
        message: "IP detection completed",
      })
    );
  } catch (error) {
    console.error("IP logging error:", error);
    return withCors(
      request,
      NextResponse.json(
        {
          success: false,
          error: "Failed to log IP address",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      )
    );
  }
}