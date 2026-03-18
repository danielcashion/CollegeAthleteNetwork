import { initBotId } from "botid/client/core";

// Define the paths that need bot protection.
// These are API endpoints that handle form submissions and user-generated content.
initBotId({
  protect: [
    { path: "/api/contact-form", method: "POST" },
    { path: "/api/job-application", method: "POST" },
    { path: "/api/send-email", method: "POST" },
  ],
});
