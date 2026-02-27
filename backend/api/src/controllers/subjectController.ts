import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { getSettingsData } from '../services/settingsService';

/**
 * Legacy compatibility endpoint.
 * Returns subject names from settings as a plain string list.
 *
 * @route GET /api/subjects
 */
export const getSubjects = expressAsyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettingsData();
  res.status(200).json(settings?.subjects ?? []);
});
