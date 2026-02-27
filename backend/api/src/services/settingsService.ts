import { prisma } from '../config/prisma';

export const SETTINGS_SINGLETON_ID = 'singleton';

export interface SettingsData {
  subjects: string[];
  schools: string[];
  [key: string]: unknown;
}

export const DEFAULT_SETTINGS_DATA: SettingsData = {
  subjects: ['N/A'],
  schools: ['N/A'],
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const normalizeStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (typeof item !== 'string') {
      continue;
    }

    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    deduped.push(normalized);
  }

  return deduped;
};

export const normalizeSettingsData = (raw: unknown): SettingsData => {
  const base = isPlainObject(raw) ? { ...raw } : {};
  const settings: SettingsData = {
    ...base,
    subjects: normalizeStringList(base.subjects),
    schools: normalizeStringList(base.schools),
  };

  return settings;
};

export const buildDefaultSettingsData = (): SettingsData => ({
  subjects: [...DEFAULT_SETTINGS_DATA.subjects],
  schools: [...DEFAULT_SETTINGS_DATA.schools],
});

export const getSettingsData = async (client: any = prisma): Promise<SettingsData | null> => {
  const record = await client.setting.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
    select: { data: true },
  });

  if (!record) {
    return null;
  }

  return normalizeSettingsData(record.data);
};

export const getMissingSubjects = (requested: unknown, allowedSubjects: string[]): string[] => {
  const requestedSubjects = normalizeStringList(requested);
  const allowed = new Set(allowedSubjects);
  return requestedSubjects.filter(subject => !allowed.has(subject));
};
