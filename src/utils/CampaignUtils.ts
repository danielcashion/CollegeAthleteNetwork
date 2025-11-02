import type { University } from "@/types/University";
import type { EmailRecipientData } from "@/types/Campaign";

// Custom field variables that can be inserted into the email
export const CUSTOM_FIELDS = [
  { label: "Full Name", value: "{{full_name}}" },
  { label: "Athlete Name", value: "{{athlete_name}}" },
  { label: "Email", value: "{{email_address}}" },
  { label: "University", value: "{{university_name}}" },
  { label: "University Logo URL", value: "{{university_logo}}" },
  { label: "University Primary Color", value: "{{university_primary_hex}}" },
  { label: "Sport", value: "{{sport}}" },
  { label: "Gender", value: "{{gender}}" },
  { label: "Graduation Year", value: "{{graduation_year}}" },
];

/**
 * Enhanced template variable replacement with university logo and color scheme support
 * @param content - The email content with template variables
 * @param emailData - The recipient data to use for replacement
 * @param universityMetaData - University metadata containing logo URL and colors
 * @param includeUniversityLogo - Whether to include university logo
 * @param colorScheme - Color scheme to use ("university" or "default")
 * @returns The content with variables replaced
 */
export function replaceTemplateVariablesWithLogo(
  content: string,
  emailData: EmailRecipientData,
  universityMetaData: University | null,
  includeUniversityLogo: boolean,
  colorScheme: "university" | "default" = "default"
): string {
  if (!content || !emailData) {
    return content;
  }

  // Map gender_id to gender string
  const gender = emailData.gender_id === 1 ? "Male" : "Female";

  // Create replacement map with basic variables
  const replacements: { [key: string]: string } = {
    "{{full_name}}": emailData.athlete_name || "",
    "{{athlete_name}}": emailData.athlete_name || "",
    "{{email_address}}": emailData.email_address || "",
    "{{university_name}}": emailData.university_name || "",
    "{{sport}}": emailData.sport || "",
    "{{gender}}": gender,
    "{{graduation_year}}": emailData.max_roster_year?.toString() || "",
    "{{university_logo}}":
      includeUniversityLogo && universityMetaData?.logo_url
        ? universityMetaData.logo_url
        : "",
    "{{university_primary_hex}}":
      colorScheme === "university" && universityMetaData?.primary_hex
        ? universityMetaData.primary_hex
        : "",
  };

  // Replace all variables in the content
  let replacedContent = content;
  for (const [variable, value] of Object.entries(replacements)) {
    replacedContent = replacedContent.replace(new RegExp(variable, "g"), value);
  }

  // Handle university logo img tag conditionally
  if (!includeUniversityLogo) {
    // Remove the entire img tag with id="university_logo" if logo should not be included
    replacedContent = replacedContent.replace(
      /<img[^>]*id\s*=\s*["']university_logo["'][^>]*>/gi,
      ""
    );
  }

  // Handle color scheme replacement
  if (colorScheme === "default") {
    // Remove any elements that contain university_primary_hex references when using default colors
    // This handles cases like: style="background-color: {{university_primary_hex}}"
    replacedContent = replacedContent.replace(
      /{{university_primary_hex}}/gi,
      ""
    );
  }

  return replacedContent;
}

/**
 * Cleans \r\n characters from the start and end of email fields
 * @param text - The text to clean
 * @returns The cleaned text with \r\n removed from start and end
 */
export function cleanEmailField(text: string | undefined | null): string {
  if (!text) return "";

  // Remove \r\n from the beginning and end of the string
  return text.replace(/^(\r\n)+|(\r\n)+$/g, "").trim();
}

/**
 * Cleans email-related fields in campaign data
 * @param data - Campaign data object
 * @returns Campaign data with cleaned email fields
 */
export function cleanCampaignEmailFields<T extends Record<string, any>>(
  data: T
): T {
  const cleanedData = { ...data };

  // Clean email_subject if it exists
  if ("email_subject" in cleanedData && cleanedData.email_subject) {
    (cleanedData as any).email_subject = cleanEmailField(
      cleanedData.email_subject
    );
  }

  return cleanedData;
}

/**
 * Cleans email-related fields in campaign template data
 * @param data - Campaign template data object
 * @returns Campaign template data with cleaned email fields
 */
export function cleanCampaignTemplateEmailFields<T extends Record<string, any>>(
  data: T
): T {
  const cleanedData = { ...data };

  // Clean email_subject if it exists
  if ("email_subject" in cleanedData && cleanedData.email_subject) {
    (cleanedData as any).email_subject = cleanEmailField(
      cleanedData.email_subject
    );
  }

  // Clean email_body if it exists
  if ("email_body" in cleanedData && cleanedData.email_body) {
    (cleanedData as any).email_body = cleanEmailField(cleanedData.email_body);
  }

  return cleanedData;
}

/**
 * Gets sample data for preview purposes
 * @returns Sample email recipient data
 */
export function getSampleEmailData(session?: any): EmailRecipientData {
  return {
    athlete_name: session?.member_name || "John Doe",
    max_roster_year: 2025,
    sport: session?.sport || "Football",
    gender_id: 1,
    email_address: session?.email || "johndoe@gmail.com",
    correlation_id: "e9253846-9c91-11f0-8b40-067d001b966d",
    university_name: "Yale",
  };
}
