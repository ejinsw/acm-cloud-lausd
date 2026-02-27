import express from 'express';
import {
  addSchoolSetting,
  addSubjectSetting,
  createSettings,
  deleteSettings,
  deleteSettingsField,
  getSettings,
  initializeSettings,
  removeSchoolSetting,
  removeSubjectSetting,
  replaceSettings,
  setSettingsField,
} from '../controllers/settingsController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

const adminAuth = [authenticateToken, checkRole(['ADMIN'])];

router.get('/settings', getSettings);

router.post('/settings/initialize', ...adminAuth, initializeSettings);
router.post('/settings', ...adminAuth, createSettings);
router.put('/settings', ...adminAuth, replaceSettings);
router.delete('/settings', ...adminAuth, deleteSettings);

router.post('/settings/subjects', ...adminAuth, addSubjectSetting);
router.delete('/settings/subjects/:subject', ...adminAuth, removeSubjectSetting);

router.post('/settings/schools', ...adminAuth, addSchoolSetting);
router.delete('/settings/schools/:school', ...adminAuth, removeSchoolSetting);

router.put('/settings/fields/:key', ...adminAuth, setSettingsField);
router.delete('/settings/fields/:key', ...adminAuth, deleteSettingsField);

export default router;
