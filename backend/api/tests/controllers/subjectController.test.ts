import { Request, Response } from 'express';
import {
  getAllSubjects,
  getSubjectByName,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjects,
  getSubject,
} from '../../src/controllers/subjectController';

describe('Subject Controller', () => {
  // TODO: Add tests for subject controller functions
  // - getAllSubjects
  // - getSubjectByName
  // - createSubject
  // - updateSubject
  // - deleteSubject
  // - getSubjects
  // - getSubject

  it('should have subject controller functions defined', () => {
    expect(getAllSubjects).toBeDefined();
    expect(getSubjectByName).toBeDefined();
    expect(createSubject).toBeDefined();
    expect(updateSubject).toBeDefined();
    expect(deleteSubject).toBeDefined();
    expect(getSubjects).toBeDefined();
    expect(getSubject).toBeDefined();
  });
}); 