// index.mjs
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({
  region: process.env.AWS_REGION || "us-east-1"
});

const DEFAULT_API_URL =
  "https://api.tourneymaster.org/publicprod/opportunities_status";

const FROM_EMAIL = process.env.FROM_EMAIL;

// Phrases that suggest a posting is no longer active.
const INACTIVE_PATTERNS = [
  /\bfilled\b/i,
  /\bcancelled\b/i,
  /\bcanceled\b/i,
  /\bposition has been filled\b/i,
  /\bjob has been filled\b/i,
  /\bno longer accepting applications\b/i,
  /\bapplications closed\b/i,
  /\bposting closed\b/i,
  /\bjob closed\b/i,
  /\bopportunity closed\b/i,
  /\bthis job is no longer available\b/i,
  /\bthis position is no longer available\b/i,
  /\bno longer available\b/i,
  /\bexpired\b/i
];

function log(level, message, details = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...details
  };

  console[level === "error" ? "error" : "log"](JSON.stringify(entry));
}

function getErrorDetails(err) {
  return {
    errorName: err?.name || "Error",
    errorMessage: err?.message || String(err),
    stack: err?.stack
  };
}

function toBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "y"].includes(normalized);
  }
  return defaultValue;
}

export const handler = async (event = {}, context = {}) => {
  const invocationId = context.awsRequestId || "unknown";
  const startedAt = Date.now();

  log("info", "Opportunity status scan started", {
    invocationId,
    dryRun: toBoolean(event.DRY_RUN, toBoolean(process.env.DRY_RUN, false))
  });

  try {
    if (!FROM_EMAIL) {
      throw new Error("Missing required env var: FROM_EMAIL");
    }

    const dryRun = toBoolean(
      event.DRY_RUN,
      toBoolean(process.env.DRY_RUN, false)
    );

    const apiUrl =
      event.OPPORTUNITIES_STATUS_URL ||
      process.env.OPPORTUNITIES_STATUS_URL ||
      DEFAULT_API_URL;

    const opportunities = await fetchOpportunities(apiUrl);
    const results = [];

    log("info", "Opportunities fetched", {
      invocationId,
      opportunityCount: opportunities.length
    });

    for (const opp of opportunities) {
      try {
        const result = await processOpportunity(opp, { dryRun, invocationId });
        results.push(result);
      } catch (err) {
        log("error", "Opportunity processing failed", {
          invocationId,
          jobId: opp?.job_id,
          ...getErrorDetails(err)
        });
        throw err;
      }
    }

    const summary = results.reduce((counts, result) => {
      counts[result.status] = (counts[result.status] || 0) + 1;
      return counts;
    }, {});

    log("info", "Opportunity status scan completed", {
      invocationId,
      durationMs: Date.now() - startedAt,
      summary
    });

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Opportunity status scan completed.",
          dryRun,
          apiUrl,
          scanned: results.length,
          results
        },
        null,
        2
      )
    };
  } catch (err) {
    log("error", "Opportunity status scan failed", {
      invocationId,
      durationMs: Date.now() - startedAt,
      ...getErrorDetails(err)
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Lambda failed.",
        error: err.message
      })
    };
  }
};

async function fetchOpportunities(url) {
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch opportunities. HTTP ${resp.status}`);
  }

  const data = await resp.json();

  if (!Array.isArray(data)) {
    throw new Error("Expected API response to be an array.");
  }

  return data;
}

async function processOpportunity(opp, { dryRun, invocationId }) {
  const {
    job_id,
    university_name,
    company_name,
    job_title,
    external_link_url,
    email,
    member_name,
    is_active_YN
  } = opp;

  const startedAt = Date.now();
  const logContext = { invocationId, jobId: job_id };

  if (!external_link_url) {
    log("warn", "Opportunity skipped: missing external link", logContext);
    return {
      job_id,
      status: "skipped",
      reason: "Missing external_link_url"
    };
  }

  if (!email) {
    log("warn", "Opportunity skipped: missing recipient", logContext);
    return {
      job_id,
      status: "skipped",
      reason: "Missing email"
    };
  }

  if (Number(is_active_YN) !== 1) {
    log("info", "Opportunity skipped: already inactive", logContext);
    return {
      job_id,
      status: "skipped",
      reason: "Opportunity is already inactive"
    };
  }

  const scanResult = await scanExternalJobPosting(external_link_url);

  // Update the endpoint with latest check timestamp after scanning
  if (!dryRun) {
    try {
      await updateLatestActiveCheck(job_id);
    } catch (err) {
      log("error", "Failed to update latest active check", {
        ...logContext,
        ...getErrorDetails(err)
      });
    }
  }

  if (scanResult.isInactive) {
    const subject = `Please confirm: has your ${job_title || "job opportunity"} been filled?`;

    const bodyText = buildEmailText({
      member_name,
      company_name,
      job_title,
      university_name,
      external_link_url,
      reason: scanResult.reason,
      job_id
    });

    const bodyHtml = buildEmailHtml({
      member_name,
      company_name,
      job_title,
      university_name,
      external_link_url,
      reason: scanResult.reason,
      job_id,
      email
    });

    if (!dryRun) {
      await sendEmail({
        to: email,
        subject,
        textBody: bodyText,
        htmlBody: bodyHtml
      });
    }

    log("info", dryRun ? "Opportunity would trigger email" : "Opportunity email sent", {
      ...logContext,
      durationMs: Date.now() - startedAt,
      reason: scanResult.reason,
      dryRun
    });

    return {
      job_id,
      status: dryRun ? "would_email" : "emailed",
      external_link_url,
      reason: scanResult.reason
    };
  }

  log("info", "Opportunity remains open", {
    ...logContext,
    durationMs: Date.now() - startedAt,
    reason: scanResult.reason
  });

  return {
    job_id,
    status: "still_open",
    external_link_url,
    reason: scanResult.reason
  };
}

async function scanExternalJobPosting(url) {
  try {
    const resp = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OpportunityStatusBot/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    const finalUrl = resp.url;
    const status = resp.status;

    if (status !== 200) {
      return {
        isInactive: true,
        reason: `External posting returned HTTP ${status}`,
        finalUrl
      };
    }

    const contentType = resp.headers.get("content-type") || "";
    let body = "";

    if (
      contentType.includes("text") ||
      contentType.includes("html") ||
      contentType.includes("json")
    ) {
      body = await resp.text();
    }

    const normalized = normalizeContent(body);

    for (const pattern of INACTIVE_PATTERNS) {
      if (pattern.test(normalized)) {
        return {
          isInactive: true,
          reason: `Detected inactive keyword/pattern: ${pattern}`,
          finalUrl
        };
      }
    }

    return {
      isInactive: false,
      reason: "HTTP 200 and no inactive keywords found",
      finalUrl
    };
  } catch (err) {
    return {
      isInactive: true,
      reason: `Error reaching external posting: ${err.message}`
    };
  }
}

function normalizeContent(text) {
  return String(text || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sendEmail({ to, subject, textBody, htmlBody }) {
  const cmd = new SendEmailCommand({
    FromEmailAddress: FROM_EMAIL,
    Destination: {
      ToAddresses: [to]
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject
        },
        Body: {
          Text: {
            Data: textBody
          },
          Html: {
            Data: htmlBody
          }
        }
      }
    }
  });

  return ses.send(cmd);
}

async function updateLatestActiveCheck(job_id) {
  const utcNow = new Date().toISOString();

  const response = await fetch(
    "https://api.tourneymaster.org/publicprod/opportunities",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        job_id,
        latest_active_check: utcNow
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update opportunity. HTTP ${response.status}`);
  }

  return response.json();
}

function buildEmailText({
  member_name,
  company_name,
  job_title,
  university_name,
  external_link_url,
  reason,
  job_id
}) {
  const viewUrl = `https://members.collegeathletenetwork.org/opportunities/${encodeURIComponent(
    job_id || ""
  )}`;

  return `Hi ${member_name || "there"},

We reviewed one of your posted opportunities and detected signals suggesting that the external job posting may no longer be active.

Opportunity Details:
- The Company: ${company_name || ""}
- Job Title: ${job_title || ""}
- Your University: ${university_name || ""}
- External Link: ${external_link_url || ""}

Why this was flagged:
${reason || ""}

View the Opportunity:
${viewUrl}

Please confirm whether this opportunity has been filled or should be closed.

Thank you,
The College Athlete Network`;
}

function buildEmailHtml({
  member_name,
  company_name,
  job_title,
  university_name,
  external_link_url,
  reason,
  job_id,
  email
}) {
  const viewOpportunityUrl = `https://members.collegeathletenetwork.org/opportunities/${encodeURIComponent(
    job_id || ""
  )}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>The College Athlete Network | Opportunity Status Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:linear-gradient(180deg,#eef2f7 0%,#f7f9fc 100%);margin:0;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;border-collapse:collapse;margin:0 auto;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 14px 40px rgba(28,49,95,0.12);">

          <tr>
            <td style="height:6px;background:linear-gradient(90deg,#1C315F 0%,#ED3237 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="background:linear-gradient(135deg,#1C315F 0%,#284784 58%,#ED3237 100%);padding:28px 26px 18px 26px;text-align:center;">
              <img
                src="https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Logos/CANLogo1200x1200White.png"
                alt="The College Athlete Network"
                width="108"
                style="display:block;margin:0 auto 14px auto;border:0;outline:none;text-decoration:none;height:auto;"
              />
              <div style="display:inline-block;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.20);border-radius:999px;padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.8px;color:#ffffff;text-transform:uppercase;">
                Opportunity Status Review
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:32px;line-height:42px;font-weight:800;color:#ffffff;margin:18px 0 10px 0;">
                Please confirm whether this opportunity has been filled.
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:28px;color:#e9eef8;max-width:590px;margin:0 auto;">
                We reviewed one of your posted opportunities and detected signals suggesting that the external job posting may no longer be active.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 26px;background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:-2px;">
                <tr>
                  <td style="padding:24px 0 0 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;background:linear-gradient(135deg,#fff7f7 0%,#f5f8ff 100%);border:1px solid #dbe4f2;border-radius:16px;">
                      <tr>
                        <td style="padding:24px 22px;text-align:center;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:24px;font-weight:800;color:#ED3237;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">
                            Status Confirmation Requested
                          </div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;font-weight:700;color:#1f2a44;margin-bottom:8px;">
                            Hi ${escapeHtml(member_name || "there")}!
                          </div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#475467;max-width:560px;margin:0 auto;">
                            Our system checked your external opportunity link and found that the posting may now be inactive. This can happen when a position has been <strong>filled</strong>, <strong>cancelled</strong>, <strong>closed</strong>, or when the external page no longer returns a valid reponse.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 26px 8px 26px;background-color:#ffffff;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:32px;font-weight:800;color:#1C315F;margin-bottom:12px;">
                Opportunity details
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:29px;color:#344054;margin-bottom:18px;">
                Please review the details below and confirm whether this opportunity should remain active.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 26px 6px 26px;background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">

                <tr>
                  <td style="padding:0 0 14px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;background-color:#f8fafc;border:1px solid #e4e7ec;border-radius:14px;">
                      <tr>
                        <td style="padding:18px;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:800;color:#667085;text-transform:uppercase;margin-bottom:6px;">Company</div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;font-weight:800;color:#1C315F;">${escapeHtml(company_name || "")}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 0 14px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;background-color:#f8fafc;border:1px solid #e4e7ec;border-radius:14px;">
                      <tr>
                        <td style="padding:18px;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:800;color:#667085;text-transform:uppercase;margin-bottom:6px;">Job Title</div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;font-weight:800;color:#1C315F;">${escapeHtml(job_title || "")}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 0 14px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;background-color:#f8fafc;border:1px solid #e4e7ec;border-radius:14px;">
                      <tr>
                        <td style="padding:18px;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:800;color:#667085;text-transform:uppercase;margin-bottom:6px;">University</div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;font-weight:800;color:#1C315F;">${escapeHtml(university_name || "")}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 0 14px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;background-color:#fff7f7;border:1px solid #f1c7cb;border-radius:14px;">
                      <tr>
                        <td style="padding:18px;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:800;color:#B42318;text-transform:uppercase;margin-bottom:6px;">Why this was flagged</div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#475467;">${escapeHtml(reason || "")}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 0 14px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;background-color:#f8fafc;border:1px solid #e4e7ec;border-radius:14px;">
                      <tr>
                        <td style="padding:18px;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:800;color:#667085;text-transform:uppercase;margin-bottom:6px;">External Job Link</div>
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;color:#475467;word-break:break-word;">
                            <a href="${escapeAttribute(external_link_url || "")}" style="color:#1C315F;text-decoration:underline;">${escapeHtml(external_link_url || "")}</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 26px 10px 26px;background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;background:linear-gradient(135deg,#1C315F 0%,#243b72 100%);border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 22px;text-align:center;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:32px;font-weight:800;color:#ffffff;margin-bottom:10px;">
                      Review this opportunity on The College Athlete Network
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:27px;color:#dbe5f5;max-width:560px;margin:0 auto 20px auto;">
                      Please review the posting and confirm whether it has been filled or should be closed.
                    </div>
                    <a href="${escapeAttribute(viewOpportunityUrl)}" style="display:inline-block;background:linear-gradient(135deg,#ED3237 0%,#ff6b57 100%);color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:800;padding:16px 28px;border-radius:12px;letter-spacing:0.3px;">
                      View the Opportunity
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 26px 30px 26px;background-color:#ffffff;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:#475467;">
                If the position has been filled, we recommend closing the opportunity so that student-athletes and alumni are not directed to an inactive posting. If it is still active, no action is needed beyond confirming it remains open.
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color:#162846;padding:28px 26px;text-align:center;">
              <img
                src="https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Logos/CANLogo1200x1200White.png"
                alt="College Athlete Network"
                width="118"
                style="display:block;margin:0 auto 14px auto;border:0;outline:none;text-decoration:none;height:auto;"
              />
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:24px;color:#d0d5dd;">
                © 2026 The College Athlete Network. All rights reserved.<br />
                One World Trade Center | Suite 8500 | New York City
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:22px;color:#d0d5dd;margin-top:10px;">
                <a href="https://www.collegeathletenetwork.org/privacy-policy" style="color:#ffffff;text-decoration:none;">Privacy Policy</a>
                &nbsp;|&nbsp;
                <a href="https://www.collegeathletenetwork.org/contact-us" style="color:#ffffff;text-decoration:none;">Contact Us</a>
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#98a2b3;margin-top:10px;">
                This email was sent to ${escapeHtml(email || "")}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}