"use client";

import React, { createContext, useCallback, useState } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";

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

interface GoogleOneTapContextProps {
  triggerOneTap: () => void;
}

export const GoogleOneTapContext = createContext<GoogleOneTapContextProps>({
  triggerOneTap: () => {},
});

export default function GoogleOneTapProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);

  const handleCredentialResponse = useCallback((response: any) => {
    signIn("credentials", {
      credential: response.credential,
      redirect: false,
    }).catch((error) => {
      console.error("Error signing in:", error);
    });
  }, []);

  const triggerOneTap = useCallback(() => {
    if (window.google && isGoogleScriptLoaded) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          context: "signin",
          ux_mode: "popup",
          auto_select: false,
        });
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isDismissedMoment()) {
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
          setTimeout(triggerOneTap, 1000);
        } else {
          console.error("Error initializing Google One Tap:", error);
        }
      }
    }
  }, [handleCredentialResponse, isGoogleScriptLoaded]);

  return (
    <GoogleOneTapContext.Provider value={{ triggerOneTap }}>
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={() => setIsGoogleScriptLoaded(true)}
        strategy="afterInteractive"
      />
      {children}
    </GoogleOneTapContext.Provider>
  );
}
