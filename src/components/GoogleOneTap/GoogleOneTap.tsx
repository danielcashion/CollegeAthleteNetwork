"use client";

import { useEffect, useCallback, useState } from "react";
import { signIn, useSession } from "next-auth/react"; // NextAuth parts commented out
import Script from "next/script";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback: (notification: any) => void) => void;
          cancel: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  "727817156664-jftuem6k4fmbppdu9escna5eicai2kph.apps.googleusercontent.com";

export default function GoogleOneTap() {
  const { data: session } = useSession(); // Commented out NextAuth session check
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  console.log(session); // You can uncomment this for debugging if needed

  const handleCredentialResponse = useCallback((response: any) => {
    // Original NextAuth signIn code (commented out):
    signIn("google", {
      credential: response.credential,
      redirect: false,
    }).catch((error) => {
      console.error("Error signing in:", error);
    });

    console.log("Google One Tap credential response:", response);
  }, []);

  const initializeGoogleOneTap = useCallback(() => {
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          context: "signin",
          ux_mode: "popup",
          auto_select: false,
          use_fedcm_for_prompt: true,
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log(
              "One Tap was not displayed:",
              notification.getNotDisplayedReason()
            );
          } else if (notification.isSkippedMoment()) {
            console.log(
              "One Tap was skipped:",
              notification.getSkippedReason()
            );
          } else if (notification.isDismissedMoment()) {
            console.log(
              "One Tap was dismissed:",
              notification.getDismissedReason()
            );
          }
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes(
            "Only one navigator.credentials.get request may be outstanding at one time"
          )
        ) {
          console.log(
            "FedCM request already in progress. Waiting before retrying..."
          );
          setTimeout(initializeGoogleOneTap, 1000);
        } else {
          console.error("Error initializing Google One Tap:", error);
        }
      }
    }
  }, [handleCredentialResponse]);

  useEffect(() => {
    if (isGoogleScriptLoaded) {
      initializeGoogleOneTap();
    }
  }, [isGoogleScriptLoaded, initializeGoogleOneTap]);

  //   Removed session-based cancellation of the One Tap prompt
  useEffect(() => {
    if (session) {
      // If user is signed in, cancel any ongoing One Tap prompts
      window.google?.accounts.id.cancel();
    }
  }, [session]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      async
      defer
      onLoad={() => setIsGoogleScriptLoaded(true)}
      strategy="afterInteractive"
    />
  );
}
