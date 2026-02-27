export interface SettingsData {
  subjects: string[];
  schools: string[];
  [key: string]: unknown;
}

interface SettingsEnvelope {
  settings: SettingsData;
}

interface InitializeSettingsResponse {
  created: boolean;
  settings: SettingsData;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function normalizeSettings(value: unknown): SettingsData {
  const base =
    value && typeof value === "object" && !Array.isArray(value)
      ? ({ ...value } as Record<string, unknown>)
      : {};

  return {
    ...base,
    subjects: normalizeStringList(base.subjects),
    schools: normalizeStringList(base.schools),
  };
}

async function parseJsonOrNull(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  const body = await parseJsonOrNull(response);

  if (!response.ok) {
    const message =
      (body as { error?: string; message?: string } | null)?.error ||
      (body as { error?: string; message?: string } | null)?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

function adminHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getSettings(): Promise<SettingsData | null> {
  const response = await fetch(`${API_BASE}/api/settings`);
  if (response.status === 404) {
    return null;
  }
  const body = await parseJsonOrNull(response);

  if (!response.ok) {
    const message =
      (body as { error?: string; message?: string } | null)?.error ||
      (body as { error?: string; message?: string } | null)?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return normalizeSettings((body as SettingsEnvelope).settings);
}

export async function initializeSettings(
  token: string,
): Promise<InitializeSettingsResponse> {
  const result = await requestJson<InitializeSettingsResponse>(
    "/api/settings/initialize",
    {
      method: "POST",
      headers: adminHeaders(token),
    },
  );

  return {
    ...result,
    settings: normalizeSettings(result.settings),
  };
}

export async function createSettings(
  token: string,
  settings: Record<string, unknown>,
): Promise<SettingsData> {
  const result = await requestJson<SettingsEnvelope>("/api/settings", {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify({ settings }),
  });

  return normalizeSettings(result.settings);
}

export async function replaceSettings(
  token: string,
  settings: Record<string, unknown>,
): Promise<SettingsData> {
  const result = await requestJson<SettingsEnvelope>("/api/settings", {
    method: "PUT",
    headers: adminHeaders(token),
    body: JSON.stringify({ settings }),
  });

  return normalizeSettings(result.settings);
}

export async function deleteSettings(token: string): Promise<void> {
  await requestJson<unknown>("/api/settings", {
    method: "DELETE",
    headers: adminHeaders(token),
  });
}

export async function addSubject(
  token: string,
  subject: string,
): Promise<SettingsData> {
  const result = await requestJson<SettingsEnvelope>("/api/settings/subjects", {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify({ subject }),
  });

  return normalizeSettings(result.settings);
}

export async function removeSubject(
  token: string,
  subject: string,
): Promise<SettingsData> {
  const result = await requestJson<SettingsEnvelope>(
    `/api/settings/subjects/${encodeURIComponent(subject)}`,
    {
      method: "DELETE",
      headers: adminHeaders(token),
    },
  );

  return normalizeSettings(result.settings);
}

export async function addSchool(
  token: string,
  school: string,
): Promise<SettingsData> {
  const result = await requestJson<SettingsEnvelope>("/api/settings/schools", {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify({ school }),
  });

  return normalizeSettings(result.settings);
}

export async function removeSchool(
  token: string,
  school: string,
): Promise<SettingsData> {
  const result = await requestJson<SettingsEnvelope>(
    `/api/settings/schools/${encodeURIComponent(school)}`,
    {
      method: "DELETE",
      headers: adminHeaders(token),
    },
  );

  return normalizeSettings(result.settings);
}

export async function setSettingsField(
  token: string,
  key: string,
  value: unknown,
): Promise<SettingsData> {
  const result = await requestJson<SettingsEnvelope>(
    `/api/settings/fields/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: adminHeaders(token),
      body: JSON.stringify({ value }),
    },
  );

  return normalizeSettings(result.settings);
}

export async function deleteSettingsField(
  token: string,
  key: string,
): Promise<SettingsData> {
  const result = await requestJson<SettingsEnvelope>(
    `/api/settings/fields/${encodeURIComponent(key)}`,
    {
      method: "DELETE",
      headers: adminHeaders(token),
    },
  );

  return normalizeSettings(result.settings);
}

