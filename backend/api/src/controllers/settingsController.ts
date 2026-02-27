import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import {
  SETTINGS_SINGLETON_ID,
  buildDefaultSettingsData,
  getSettingsData,
  normalizeSettingsData,
  normalizeStringList,
} from '../services/settingsService';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseSettingsPayload = (value: unknown) => {
  if (!isPlainObject(value)) {
    return null;
  }

  return normalizeSettingsData(value);
};

const normalizeInputName = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
};

const toInputJson = (value: Record<string, unknown>): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue;

const upsertSettingsData = async (settings: Record<string, unknown>) => {
  const updated = await prisma.setting.upsert({
    where: { id: SETTINGS_SINGLETON_ID },
    update: { data: toInputJson(settings) },
    create: { id: SETTINGS_SINGLETON_ID, data: toInputJson(settings) },
    select: { data: true },
  });

  return normalizeSettingsData(updated.data);
};

export const getSettings = expressAsyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettingsData();
  if (!settings) {
    res.status(404).json({ error: 'Settings not initialized' });
    return;
  }

  res.status(200).json({ settings });
});

export const initializeSettings = expressAsyncHandler(async (_req: Request, res: Response) => {
  const existing = await prisma.setting.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
    select: { data: true },
  });

  if (existing) {
    res.status(200).json({
      created: false,
      settings: normalizeSettingsData(existing.data),
    });
    return;
  }

  const defaults = buildDefaultSettingsData();
  const created = await prisma.setting.create({
    data: {
      id: SETTINGS_SINGLETON_ID,
      data: toInputJson(defaults),
    },
    select: { data: true },
  });

  res.status(200).json({
    created: true,
    settings: normalizeSettingsData(created.data),
  });
});

export const createSettings = expressAsyncHandler(async (req: Request, res: Response) => {
  const payload = parseSettingsPayload(req.body?.settings);
  if (!payload) {
    res.status(400).json({ error: 'settings must be a JSON object' });
    return;
  }

  const existing = await prisma.setting.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
    select: { id: true },
  });

  if (existing) {
    res.status(409).json({ error: 'Settings already exist' });
    return;
  }

  const created = await prisma.setting.create({
    data: {
      id: SETTINGS_SINGLETON_ID,
      data: toInputJson(payload),
    },
    select: { data: true },
  });

  res.status(201).json({ settings: normalizeSettingsData(created.data) });
});

export const replaceSettings = expressAsyncHandler(async (req: Request, res: Response) => {
  const payload = parseSettingsPayload(req.body?.settings);
  if (!payload) {
    res.status(400).json({ error: 'settings must be a JSON object' });
    return;
  }

  const existing = await prisma.setting.findUnique({
    where: { id: SETTINGS_SINGLETON_ID },
    select: { id: true },
  });
  if (!existing) {
    res.status(404).json({ error: 'Settings not initialized' });
    return;
  }

  const updated = await prisma.setting.update({
    where: { id: SETTINGS_SINGLETON_ID },
    data: { data: toInputJson(payload) },
    select: { data: true },
  });

  res.status(200).json({ settings: normalizeSettingsData(updated.data) });
});

export const deleteSettings = expressAsyncHandler(async (_req: Request, res: Response) => {
  try {
    await prisma.setting.delete({
      where: { id: SETTINGS_SINGLETON_ID },
    });
  } catch (_error) {
    // Idempotent delete endpoint.
  }

  res.status(204).send();
});

export const addSubjectSetting = expressAsyncHandler(async (req: Request, res: Response) => {
  const subject = normalizeInputName(req.body?.subject);
  if (!subject) {
    res.status(400).json({ error: 'subject is required' });
    return;
  }

  const existing = await getSettingsData();
  if (!existing) {
    res.status(404).json({ error: 'Settings not initialized' });
    return;
  }

  const nextSubjects = normalizeStringList([...existing.subjects, subject]);
  const updated = await upsertSettingsData({
    ...existing,
    subjects: nextSubjects,
  });

  res.status(200).json({ settings: updated });
});

export const removeSubjectSetting = expressAsyncHandler(async (req: Request, res: Response) => {
  const subject = normalizeInputName(decodeURIComponent(req.params.subject || ''));
  if (!subject) {
    res.status(400).json({ error: 'subject path parameter is required' });
    return;
  }

  const existing = await getSettingsData();
  if (!existing) {
    res.status(404).json({ error: 'Settings not initialized' });
    return;
  }

  const updated = await upsertSettingsData({
    ...existing,
    subjects: existing.subjects.filter(value => value !== subject),
  });

  res.status(200).json({ settings: updated });
});

export const addSchoolSetting = expressAsyncHandler(async (req: Request, res: Response) => {
  const school = normalizeInputName(req.body?.school);
  if (!school) {
    res.status(400).json({ error: 'school is required' });
    return;
  }

  const existing = await getSettingsData();
  if (!existing) {
    res.status(404).json({ error: 'Settings not initialized' });
    return;
  }

  const nextSchools = normalizeStringList([...existing.schools, school]);
  const updated = await upsertSettingsData({
    ...existing,
    schools: nextSchools,
  });

  res.status(200).json({ settings: updated });
});

export const removeSchoolSetting = expressAsyncHandler(async (req: Request, res: Response) => {
  const school = normalizeInputName(decodeURIComponent(req.params.school || ''));
  if (!school) {
    res.status(400).json({ error: 'school path parameter is required' });
    return;
  }

  const existing = await getSettingsData();
  if (!existing) {
    res.status(404).json({ error: 'Settings not initialized' });
    return;
  }

  const updated = await upsertSettingsData({
    ...existing,
    schools: existing.schools.filter(value => value !== school),
  });

  res.status(200).json({ settings: updated });
});

export const setSettingsField = expressAsyncHandler(async (req: Request, res: Response) => {
  const key = normalizeInputName(req.params.key);
  if (!key) {
    res.status(400).json({ error: 'key path parameter is required' });
    return;
  }

  if (key === 'subjects' || key === 'schools') {
    res.status(400).json({ error: 'Use dedicated subjects/schools endpoints for this field' });
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(req.body ?? {}, 'value')) {
    res.status(400).json({ error: 'value is required' });
    return;
  }

  const existing = await getSettingsData();
  if (!existing) {
    res.status(404).json({ error: 'Settings not initialized' });
    return;
  }

  const updated = await upsertSettingsData({
    ...existing,
    [key]: req.body.value,
  });

  res.status(200).json({ settings: updated });
});

export const deleteSettingsField = expressAsyncHandler(async (req: Request, res: Response) => {
  const key = normalizeInputName(req.params.key);
  if (!key) {
    res.status(400).json({ error: 'key path parameter is required' });
    return;
  }

  if (key === 'subjects' || key === 'schools') {
    res.status(400).json({ error: 'Cannot delete required fields subjects or schools' });
    return;
  }

  const existing = await getSettingsData();
  if (!existing) {
    res.status(404).json({ error: 'Settings not initialized' });
    return;
  }

  const next = { ...existing } as Record<string, unknown>;
  delete next[key];

  const updated = await upsertSettingsData(next);
  res.status(200).json({ settings: updated });
});
