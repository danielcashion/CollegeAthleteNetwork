import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Preview calls Renidly, copies profile and logo images into S3, and returns those URLs.
// Confirm checks those rows, marks the athlete's current LinkedIn rows inactive, then inserts one new active set.
// Give the function at least 60 seconds. It needs RENIDLY_API_KEY, PUBLIC_API_BASE_URL, and S3 write access.

const ENRICH_FALLBACK = "https://renidly.com/api/v2/person/enrich";
const API_FALLBACK = "https://api.tourneymaster.org/publicprod";
const BUCKET = process.env.S3_BUCKET || "collegeathletenetwork";
const S3_REGION = "us-east-1";

const s3 = new S3Client({ region: process.env.AWS_REGION || S3_REGION });

const PROFILE_URL =
  /^(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/in\/([A-Za-z0-9\-_%]{2,100})\/?(?:\?[^#]*)?(?:#.*)?$/i;

function reply(statusCode, body) {
  return { statusCode, body: JSON.stringify(body) };
}

function parseEvent(event) {
  if (!event) return {};
  if (typeof event === "string") {
    try {
      return JSON.parse(event);
    } catch {
      return {};
    }
  }
  if (typeof event.body === "string") {
    try {
      return JSON.parse(event.body);
    } catch {
      return event;
    }
  }
  return event;
}

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, digits) => {
      const code = Number(digits);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    });
}

function clip(value, maxLen) {
  if (value == null) return null;
  const text = decodeHtml(value).trim();
  if (!text) return null;
  return text.slice(0, maxLen);
}

function asFlag(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return value ? 1 : 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  const text = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(text)) return 1;
  if (["0", "false", "no", "n"].includes(text)) return 0;
  return null;
}

function asInt(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.trunc(number);
}

function asSmallint(value) {
  const number = asInt(value);
  if (number == null) return null;
  return Math.max(0, Math.min(number, 32767));
}

function renidlyDate(parts) {
  if (!parts || typeof parts !== "object") return null;
  const year = Number(parts.year) || 0;
  if (!year) return null;
  const month = Number(parts.month) || 1;
  const day = Number(parts.day) || 1;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function sqlDate(value) {
  if (!value) return null;
  if (typeof value === "object" && ("year" in value || "month" in value)) return renidlyDate(value);
  const text = String(value).trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function parseGeo(geo) {
  if (!geo || typeof geo !== "object") return { city: null, state: null, country: null };
  const country = geo.country;
  const cityField = String(geo.city || "").trim();
  const full = String(geo.full || "").trim();
  let city = null;
  let state = null;
  if (cityField) {
    const parts = cityField.split(",").map((part) => part.trim()).filter(Boolean);
    city = parts[0] || null;
    if (parts.length >= 2) state = parts[1];
  } else if (full) {
    let parts = full.split(",").map((part) => part.trim()).filter(Boolean);
    if (country && parts.length && parts[parts.length - 1].toLowerCase() === String(country).toLowerCase()) {
      parts = parts.slice(0, -1);
    }
    city = parts[0] || null;
    state = parts[1] || null;
  }
  return {
    city: clip(city, 50),
    state: clip(state, 25),
    country: clip(country, 20),
  };
}

function pickImageUrl(...candidates) {
  let bestUrl = null;
  let bestWidth = -1;
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === "string") {
      const url = candidate.trim();
      if (url && !bestUrl) bestUrl = url;
      continue;
    }
    const items = Array.isArray(candidate) ? candidate : [candidate];
    for (const item of items) {
      if (typeof item === "string") {
        const url = item.trim();
        if (url && !bestUrl) bestUrl = url;
        continue;
      }
      if (!item || typeof item !== "object") continue;
      const url = String(item.url || "").trim();
      if (!url) continue;
      const width = Number(item.width) || 0;
      if (width >= bestWidth) {
        bestWidth = width;
        bestUrl = url;
      }
    }
  }
  return bestUrl;
}

function linkedInHandle(raw) {
  const value = String(raw || "").trim();
  if (!value || value.length > 300 || /[\s<>]/.test(value)) return null;
  if (/^[A-Za-z0-9\-_%]{2,100}$/.test(value)) {
    try {
      const decoded = decodeURIComponent(value);
      return /^[A-Za-z0-9\-_%]{2,100}$/.test(decoded) ? decoded : null;
    } catch {
      return null;
    }
  }

  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let parsed;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }
  if (parsed.username || parsed.password) return null;
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") return null;
  if (!/(^|\.)linkedin\.com$/i.test(parsed.hostname)) return null;
  const match = `${parsed.hostname}${parsed.pathname}`.match(PROFILE_URL);
  const slug = match?.[1];
  if (!slug) return null;
  try {
    const decoded = decodeURIComponent(slug);
    return /^[A-Za-z0-9\-_%]{2,100}$/.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

function enrichEndpoint() {
  const raw = (process.env.RENIDLY_API_BASE_URL || ENRICH_FALLBACK).trim().replace(/\/$/, "");
  if (raw.endsWith("/person/enrich")) return raw;
  return `${raw}/person/enrich`;
}

function apiBase() {
  return (process.env.PUBLIC_API_BASE_URL || API_FALLBACK).trim().replace(/\/$/, "");
}

function rowsOf(data) {
  if (Array.isArray(data)) return data.filter((item) => item && typeof item === "object");
  if (data && typeof data === "object" && Array.isArray(data.resource)) return rowsOf(data.resource);
  if (data && typeof data === "object" && data.athlete_id != null) return [data];
  return [];
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function apiGet(pathAndQuery) {
  const response = await fetch(`${apiBase()}${pathAndQuery}`, {
    signal: AbortSignal.timeout(20000),
  });
  const body = await readJson(response);
  if (!response.ok) {
    const error = new Error(`GET ${pathAndQuery} failed (${response.status})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function apiSend(method, pathAndQuery, payload) {
  const response = await fetch(`${apiBase()}${pathAndQuery}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload == null ? undefined : JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  const body = await readJson(response);
  if (!response.ok) {
    const error = new Error(`${method} ${pathAndQuery} failed (${response.status})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

function sniffImage(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpeg", type: "image/jpeg" };
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { ext: "png", type: "image/png" };
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { ext: "gif", type: "image/gif" };
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { ext: "webp", type: "image/webp" };
  }
  return null;
}

function ownImageUrl(url) {
  return url.startsWith(`https://${BUCKET}.s3.${S3_REGION}.amazonaws.com/`);
}

async function archiveImage(imageUrl, sourceMax, s3Max, cache) {
  const source = clip(imageUrl, sourceMax);
  if (!source) return { source: null, s3: null };
  if (cache.has(source)) return cache.get(source);
  const pending = storeImage(source, s3Max);
  cache.set(source, pending);
  return pending;
}

async function storeImage(source, s3Max) {
  if (ownImageUrl(source)) return { source, s3: clip(source, s3Max) };
  try {
    const response = await fetch(source, {
      headers: { Accept: "image/*,*/*" },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return { source, s3: null };
    const bytes = Buffer.from(await response.arrayBuffer());
    const kind = bytes.length > 0 && bytes.length <= 8_000_000 ? sniffImage(bytes) : null;
    if (!kind) return { source, s3: null };
    const key = `images/${randomUUID()}.${kind.ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: bytes,
        ContentType: kind.type,
        CacheControl: "public, max-age=31536000",
      }),
    );
    return { source, s3: clip(`https://${BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`, s3Max) };
  } catch (error) {
    console.error(JSON.stringify({ message: "Image archive failed", imageUrl: source, error: String(error) }));
    return { source, s3: null };
  }
}

function mapProfile(data) {
  const firstName = clip(data.firstName, 30);
  const lastName = clip(data.lastName, 50);
  const fullName = clip([firstName, lastName].filter(Boolean).join(" "), 80);
  const positions = Array.isArray(data.position) ? data.position : [];
  const firstTitle = positions[0] && typeof positions[0] === "object" ? positions[0].title : null;
  const industry = data.industry && typeof data.industry === "object" ? data.industry.name : data.industry;
  const geo = parseGeo(data.geo);
  const picture = pickImageUrl(data.profilePicture, data.profilePictures);
  const entityId = clip(data.entityId, 80);
  return {
    public_identifier: entityId || clip(data.handle, 80),
    profile_pic_url: clip(picture, 700),
    s3_picture_url: null,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    follower_count: asInt(data.followerCount),
    occupation: clip(firstTitle || data.headline, 250),
    headline: clip(data.headline, 400),
    summary: clip(data.summary, 1200),
    is_open_to_work: asFlag(data.isOpenToWork),
    is_hiring_YN: asFlag(data.isHiring),
    connections_count: asSmallint(data.connectionsCount),
    country: geo.country,
    city: geo.city,
    state: geo.state,
    longitude: null,
    latitude: null,
    connections: asInt(data.connectionsCount),
    personal_emails: null,
    personal_numbers: null,
    industry: clip(industry, 60),
    sector: null,
    is_active_YN: 1,
    created_by: "Renidly",
    urn: entityId,
    source: "Renidly",
  };
}

function companyUrl(exp) {
  const organization = exp.organization && typeof exp.organization === "object" ? exp.organization : {};
  return clip(exp.organizationUrl || organization.url, 200);
}

function mapExperiences(data, handle) {
  const positions = Array.isArray(data.position) ? data.position : [];
  const rows = [];
  positions.forEach((exp, index) => {
    if (!exp || typeof exp !== "object") return;
    const organization = exp.organization && typeof exp.organization === "object" ? exp.organization : {};
    const logo = pickImageUrl(exp.organizationLogo, organization.logoURL);
    const title = clip(exp.title, 60);
    const company = clip(exp.organizationName, 120);
    if (!title && !company) return;
    rows.push({
      bus_url_1: clip(handle, 100),
      start_date: renidlyDate(exp.start),
      end_date: renidlyDate(exp.end),
      company,
      company_profile_url: companyUrl(exp),
      logo_url: clip(logo, 600),
      s3_company_logo_url: null,
      job_order_id: index + 1,
      title,
      description: clip(exp.description, 300),
      location: clip(exp.location, 80),
      is_active_YN: 1,
      created_by: "Renidly",
      urn: clip(data.entityId, 255),
      source: "Renidly",
    });
  });
  return rows;
}

function mapEducations(data, handle) {
  const educations = Array.isArray(data.education) ? data.education : [];
  const rows = [];
  for (const edu of educations) {
    if (!edu || typeof edu !== "object") continue;
    const schoolObj = edu.school && typeof edu.school === "object" ? edu.school : {};
    const organization = edu.organization && typeof edu.organization === "object" ? edu.organization : {};
    const school = clip(edu.schoolName || schoolObj.name || organization.name, 80);
    const degree = clip(edu.degree, 80);
    const field = clip(edu.fieldOfStudy, 60);
    if (!school && !degree && !field) continue;
    const rawSchoolUrl = edu.url || schoolObj.url || organization.url;
    const logo = pickImageUrl(edu.logo, edu.logoURL, schoolObj.logoURL, organization.logoURL);
    rows.push({
      bus_url_1: clip(handle, 80),
      start_date: renidlyDate(edu.start),
      end_date: renidlyDate(edu.end),
      field_of_study: field,
      degree_name: degree,
      school,
      school_profile_url: clip(rawSchoolUrl, 80),
      logo_url: clip(logo, 600),
      s3_school_logo_url: null,
      description: clip(edu.description, 600),
      grade: clip(edu.grade, 100),
      activities_and_societies: clip(edu.activities, 200),
      is_active_YN: 1,
      created_by: "Renidly",
      urn: clip(data.entityId, 255),
      source: "Renidly",
    });
  }
  return rows;
}

async function fetchRenidly(handle) {
  if (!process.env.RENIDLY_API_KEY) {
    throw new Error("RENIDLY_API_KEY is not configured");
  }
  const url = new URL(enrichEndpoint());
  url.searchParams.set("handle", handle);
  const response = await fetch(url, {
    headers: { "X-renidly-apikey": process.env.RENIDLY_API_KEY },
    signal: AbortSignal.timeout(60000),
  });
  const payload = await readJson(response);
  const statusCode = payload && typeof payload === "object" && payload.statusCode != null
    ? Number(payload.statusCode)
    : response.status;
  const data = payload && typeof payload === "object" ? payload.data : null;
  return { statusCode, data: data && typeof data === "object" ? data : null };
}

async function preview(event) {
  const handle = linkedInHandle(event.linkedinUrl || event.handle || event.bus_url_1);
  if (!handle) return reply(400, { error: "That is not a LinkedIn profile URL." });

  let statusCode;
  let data;
  try {
    ({ statusCode, data } = await fetchRenidly(handle));
  } catch (error) {
    console.error(JSON.stringify({ message: "Renidly request failed", error: String(error) }));
    return reply(502, { error: "Renidly is unavailable." });
  }

  if (statusCode === 404 || !data || (!data.firstName && !data.lastName && !data.handle)) {
    return reply(404, { error: "No LinkedIn profile was found for that URL." });
  }
  if (statusCode !== 200) return reply(502, { error: "Renidly did not return a profile." });

  const profile = mapProfile(data);
  if (!profile.public_identifier) profile.public_identifier = clip(handle, 80);
  if (!profile.last_name || !profile.full_name) {
    return reply(404, { error: "That LinkedIn profile is missing a name." });
  }

  const experience = mapExperiences(data, handle);
  const education = mapEducations(data, handle);
  await attachImages({ profile, experience, education });

  return reply(200, {
    profile,
    experience,
    education,
    profileUrl: `https://www.linkedin.com/in/${handle}`,
  });
}

function stampRows(profile, experience, education, athleteId, handle, batchId, now) {
  const firstName = clip(profile.first_name, 30);
  const lastName = clip(profile.last_name, 50);
  const fullName = clip(profile.full_name || [firstName, lastName].filter(Boolean).join(" "), 80);
  const entityId = clip(profile.urn, 80);
  const stagedProfile = {
    athlete_id: athleteId,
    public_identifier: entityId || clip(handle, 80),
    profile_pic_url: clip(profile.profile_pic_url, 700),
    s3_picture_url: clip(profile.s3_picture_url, 125),
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    follower_count: asInt(profile.follower_count),
    last_linkedin_refresh: now,
    occupation: clip(profile.occupation, 250),
    headline: clip(profile.headline, 400),
    summary: clip(profile.summary, 1200),
    is_open_to_work: asFlag(profile.is_open_to_work),
    is_hiring_YN: asFlag(profile.is_hiring_YN),
    connections_count: asSmallint(profile.connections_count),
    country: clip(profile.country, 20),
    city: clip(profile.city, 50),
    state: clip(profile.state, 25),
    longitude: clip(profile.longitude, 20),
    latitude: clip(profile.latitude, 20),
    connections: asInt(profile.connections),
    personal_emails: clip(profile.personal_emails, 80),
    personal_numbers: clip(profile.personal_numbers, 80),
    industry: clip(profile.industry, 60),
    sector: clip(profile.sector, 30),
    is_active_YN: 1,
    created_by: clip(profile.created_by, 40) || "Renidly",
    created_datetime: now,
    urn: entityId,
    load_batch_id: batchId,
    source: "Renidly",
  };

  const stagedExperience = (Array.isArray(experience) ? experience : []).flatMap((row, index) => {
    if (!row || typeof row !== "object") return [];
    const title = clip(row.title, 60);
    const company = clip(row.company, 120);
    if (!title && !company) return [];
    return [{
      athlete_id: athleteId,
      bus_url_1: clip(handle, 100),
      start_date: sqlDate(row.start_date),
      end_date: sqlDate(row.end_date),
      company,
      company_profile_url: clip(row.company_profile_url, 200),
      logo_url: clip(row.logo_url, 600),
      s3_company_logo_url: clip(row.s3_company_logo_url, 200),
      job_order_id: asSmallint(row.job_order_id) || index + 1,
      title,
      description: clip(row.description, 300),
      location: clip(row.location, 80),
      last_update: now,
      is_active_YN: 1,
      created_by: clip(row.created_by, 40) || "Renidly",
      created_datetime: now,
      urn: clip(row.urn || profile.urn, 255),
      load_batch_id: batchId,
      source: "Renidly",
    }];
  });

  const stagedEducation = (Array.isArray(education) ? education : []).flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const school = clip(row.school, 80);
    const degree = clip(row.degree_name, 80);
    const field = clip(row.field_of_study, 60);
    if (!school && !degree && !field) return [];
    return [{
      athlete_id: athleteId,
      bus_url_1: clip(handle, 80),
      start_date: sqlDate(row.start_date),
      end_date: sqlDate(row.end_date),
      field_of_study: field,
      degree_name: degree,
      school,
      school_profile_url: clip(row.school_profile_url, 80),
      logo_url: clip(row.logo_url, 600),
      s3_school_logo_url: clip(row.s3_school_logo_url, 200),
      description: clip(row.description, 600),
      grade: clip(row.grade, 100),
      activities_and_societies: clip(row.activities_and_societies, 200),
      last_update: now,
      is_active_YN: 1,
      created_by: "Renidly",
      created_datetime: now,
      urn: clip(row.urn || profile.urn, 255),
      load_batch_id: batchId,
      source: "Renidly",
    }];
  });

  return { profile: stagedProfile, experience: stagedExperience, education: stagedEducation };
}

function onOurS3(url) {
  const value = clip(url, 700);
  return value && ownImageUrl(value) ? value : null;
}

async function attachImages(staged) {
  const cache = new Map();
  const jobs = [];
  if (staged.profile.profile_pic_url && !onOurS3(staged.profile.s3_picture_url)) {
    jobs.push(
      archiveImage(staged.profile.profile_pic_url, 700, 125, cache).then((image) => {
        staged.profile.profile_pic_url = image.source;
        staged.profile.s3_picture_url = image.s3;
      }),
    );
  }
  for (const row of staged.experience) {
    if (row.logo_url && !onOurS3(row.s3_company_logo_url)) {
      jobs.push(
        archiveImage(row.logo_url, 600, 200, cache).then((image) => {
          row.logo_url = image.source;
          row.s3_company_logo_url = image.s3;
        }),
      );
    }
  }
  for (const row of staged.education) {
    if (row.logo_url && !onOurS3(row.s3_school_logo_url)) {
      jobs.push(
        archiveImage(row.logo_url, 600, 200, cache).then((image) => {
          row.logo_url = image.source;
          row.s3_school_logo_url = image.s3;
        }),
      );
    }
  }
  await Promise.all(jobs);
}

function preflight(staged) {
  if (!staged.profile.public_identifier || !staged.profile.last_name || !staged.profile.full_name) {
    return "The profile needs a name before it can be saved.";
  }
  if (staged.profile.profile_pic_url && !onOurS3(staged.profile.s3_picture_url)) {
    return "The profile image could not be saved.";
  }
  for (const row of staged.experience) {
    if (!row.athlete_id || !row.bus_url_1 || (!row.title && !row.company)) {
      return "The profile is missing a job title or company.";
    }
    if (row.logo_url && !onOurS3(row.s3_company_logo_url)) {
      return "The profile could not save a company logo.";
    }
  }
  for (const row of staged.education) {
    if (!row.athlete_id || !row.bus_url_1 || !row.created_by || !row.created_datetime) {
      return "The profile is missing school details.";
    }
    if (!row.school && !row.degree_name && !row.field_of_study) {
      return "The profile is missing school details.";
    }
    if (row.logo_url && !onOurS3(row.s3_school_logo_url)) {
      return "The profile could not save a school logo.";
    }
  }
  return null;
}

function plainRow(row) {
  const payload = {};
  for (const [key, value] of Object.entries(row)) {
    if (value !== null && typeof value === "object") continue;
    payload[key] = value;
  }
  delete payload.unique_key;
  delete payload.needs_coordinates;
  return payload;
}

function productionProfile(row) {
  const payload = plainRow(row);
  delete payload.urn;
  delete payload.load_batch_id;
  delete payload.source;
  delete payload.row_id;
  return payload;
}

function productionExperience(row) {
  const payload = plainRow(row);
  delete payload.urn;
  delete payload.load_batch_id;
  delete payload.source;
  delete payload.row_id;
  return payload;
}

function productionEducation(row) {
  const payload = productionExperience(row);
  delete payload.logo_url;
  delete payload.s3_school_logo_url;
  return payload;
}

async function rowsForAthlete(table, athleteId) {
  try {
    const body = await apiGet(`/${table}?athlete_id=${athleteId}`);
    return rowsOf(body).filter((row) => Number(row.athlete_id) === athleteId && row.row_id);
  } catch (error) {
    if (error.status === 404) return [];
    throw error;
  }
}

function maintenanceSteps(body) {
  const rows = Array.isArray(body) ? body.flat(2) : [];
  return rows.filter((row) => row && typeof row === "object" && typeof row.step === "string");
}

/** Zero is_active_YN on this athlete's current LinkedIn rows before a new set is inserted. */
async function deactivateCurrentLinkedIn(athleteId) {
  const body = await apiGet(
    `/linkedin_maintenance?task=deactivate_athlete_linkedin_data&athlete_id=${encodeURIComponent(athleteId)}`,
  );
  const text = JSON.stringify(body ?? "");
  const steps = maintenanceSteps(body);
  if (/error:/i.test(text) || !steps.some((row) => /profile/i.test(row.step))) {
    throw new Error("Could not set the previous LinkedIn profile inactive.");
  }
}

async function putActiveFlag(table, row, active) {
  const payload = plainRow(row);
  payload.athlete_id = Number(row.athlete_id);
  payload.row_id = row.row_id;
  payload.is_active_YN = active;
  payload.updated_by = "Renidly";
  payload.updated_datetime = nowStamp();
  await apiSend("PUT", `/${table}?row_id=${encodeURIComponent(row.row_id)}`, payload);
}

function isActive(row) {
  return Number(row.is_active_YN) !== 0;
}

async function postStaging(staged) {
  await apiSend("POST", "/renidly_profile", plainRow(staged.profile));
  for (const row of staged.experience) await apiSend("POST", "/renidly_experience", plainRow(row));
  for (const row of staged.education) await apiSend("POST", "/renidly_education", plainRow(row));
}

async function clearStaging(athleteId) {
  for (const table of ["renidly_experience", "renidly_education", "renidly_profile"]) {
    let body;
    try {
      body = await apiGet(`/${table}?athlete_id=${athleteId}`);
    } catch (error) {
      if (error.status === 404) continue;
      throw error;
    }
    for (const row of rowsOf(body)) {
      if (Number(row.athlete_id) !== athleteId || !row.row_id) continue;
      await apiSend("DELETE", `/${table}?row_id=${encodeURIComponent(row.row_id)}`);
    }
  }
}

async function markAthleteUrl(athleteId, handle, urn) {
  let row = null;
  try {
    const body = await apiGet(`/university_athletes?athlete_id=${athleteId}`);
    row = rowsOf(body).find((item) => Number(item.athlete_id) === athleteId) || rowsOf(body)[0] || null;
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  const payload = {};
  if (row) {
    for (const [key, value] of Object.entries(row)) {
      if (value !== null && typeof value === "object") continue;
      payload[key] = value;
    }
  }
  delete payload.unique_key;
  payload.athlete_id = athleteId;
  payload.bus_url_1 = clip(handle, 60);
  payload.bus_url_1_verified = 1;
  const entityId = clip(urn, 80);
  if (entityId) payload.urn = entityId;
  else delete payload.urn;
  await apiSend("PUT", `/university_athletes?athlete_id=${athleteId}`, payload);
}

async function verifySaved(athleteId, handle, staged, prior) {
  const tables = ["athlete_profile", "athlete_experience", "athlete_education"];
  const current = {};
  for (const table of tables) current[table] = await rowsForAthlete(table, athleteId);

  for (const table of tables) {
    const oldIds = new Set(prior[table].map((row) => Number(row.row_id)));
    const stillActive = current[table].filter((row) => oldIds.has(Number(row.row_id)) && isActive(row));
    if (stillActive.length) throw new Error(`${table} still has previous active rows`);
  }

  const profiles = current.athlete_profile.filter(isActive);
  if (profiles.length !== 1) throw new Error(`expected 1 active profile, found ${profiles.length}`);
  if (staged.profile.public_identifier && profiles[0].public_identifier !== staged.profile.public_identifier) {
    throw new Error("saved profile is missing its LinkedIn entity id");
  }
  if (staged.profile.s3_picture_url && !onOurS3(profiles[0].s3_picture_url)) {
    throw new Error("saved profile is missing its S3 picture");
  }

  const jobs = current.athlete_experience.filter(isActive);
  if (jobs.length !== staged.experience.length) {
    throw new Error(`expected ${staged.experience.length} active jobs, found ${jobs.length}`);
  }
  for (const row of staged.experience) {
    if (row.s3_company_logo_url && !jobs.some((saved) => saved.s3_company_logo_url === row.s3_company_logo_url)) {
      throw new Error("saved job is missing its S3 logo");
    }
  }

  const schools = current.athlete_education.filter(isActive);
  if (schools.length !== staged.education.length) {
    throw new Error(`expected ${staged.education.length} active schools, found ${schools.length}`);
  }

  const athleteBody = await apiGet(`/university_athletes?athlete_id=${athleteId}`);
  const athlete = rowsOf(athleteBody).find((row) => Number(row.athlete_id) === athleteId);
  if (!athlete || Number(athlete.is_active_YN) === 0) throw new Error("athlete record is not active");
  if (athlete.bus_url_1 !== clip(handle, 60) || Number(athlete.bus_url_1_verified) !== 1) {
    throw new Error("athlete LinkedIn URL was not updated");
  }
}

async function restorePriorRows(athleteId, prior) {
  for (const [table, previousRows] of Object.entries(prior)) {
    const previousById = new Map(previousRows.map((row) => [Number(row.row_id), row]));
    const current = await rowsForAthlete(table, athleteId);
    for (const row of current) {
      const previous = previousById.get(Number(row.row_id));
      if (!previous) {
        if (isActive(row)) await putActiveFlag(table, row, 0);
        continue;
      }
      if (isActive(previous) && !isActive(row)) await putActiveFlag(table, previous, 1);
    }
  }
}

async function confirm(event) {
  const athleteId = asInt(event.athleteId ?? event.athlete_id);
  const handle = linkedInHandle(event.linkedinUrl || event.handle || event.bus_url_1 || event.profile?.public_identifier);
  const profile = event.profile;
  if (!athleteId || athleteId <= 0) return reply(400, { error: "athleteId is required." });
  if (!handle) return reply(400, { error: "A LinkedIn profile URL is required." });
  if (!profile || typeof profile !== "object") return reply(400, { error: "Profile rows from the page are required." });

  const batchId = randomUUID();
  const now = nowStamp();
  const staged = stampRows(profile, event.experience, event.education, athleteId, handle, batchId, now);

  let prior = null;
  try {
    await attachImages(staged);
    const problem = preflight(staged);
    if (problem) return reply(400, { error: problem });

    await clearStaging(athleteId);
    await postStaging(staged);
    prior = {
      athlete_profile: await rowsForAthlete("athlete_profile", athleteId),
      athlete_experience: await rowsForAthlete("athlete_experience", athleteId),
      athlete_education: await rowsForAthlete("athlete_education", athleteId),
    };
    await deactivateCurrentLinkedIn(athleteId);

    await apiSend("POST", "/athlete_profile", productionProfile(staged.profile));
    for (const row of staged.experience) await apiSend("POST", "/athlete_experience", productionExperience(row));
    for (const row of staged.education) await apiSend("POST", "/athlete_education", productionEducation(row));
    await markAthleteUrl(athleteId, handle, staged.profile.urn);
    await verifySaved(athleteId, handle, staged, prior);
    await clearStaging(athleteId);
  } catch (error) {
    if (prior) await restorePriorRows(athleteId, prior);
    console.error(JSON.stringify({
      message: "Renidly confirm failed",
      athleteId,
      error: error?.message || String(error),
      body: error?.body || null,
    }));
    const message = error?.preflight || "The profile could not be saved.";
    return reply(error?.preflight ? 400 : 502, { error: message });
  }

  return reply(200, {
    ok: true,
    athleteId,
    profileUrl: `https://www.linkedin.com/in/${handle}`,
    experienceCount: staged.experience.length,
    educationCount: staged.education.length,
  });
}

export const handler = async (event = {}) => {
  const payload = parseEvent(event);
  const action = String(payload.action || (payload.profile ? "confirm" : "preview")).toLowerCase();
  if (action === "confirm" || action === "save") return confirm(payload);
  if (action === "preview" || action === "lookup") return preview(payload);
  return reply(400, { error: "action must be preview or confirm." });
};
