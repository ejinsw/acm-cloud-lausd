import fs from 'fs/promises';
import { NextFunction, Request, Response } from 'express';

const formidable: any = require('formidable');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENTS = 5;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

type UploadRequest = Request & {
  uploadedFiles?: UploadedFile[];
};

const normalizeFieldValue = (value: string[] | string | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const createMultipartParser = (fieldName: string) => {
  return async (req: UploadRequest, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      next();
      return;
    }

    const form = formidable({
      multiples: true,
      maxFiles: MAX_DOCUMENTS,
      maxFileSize: MAX_FILE_SIZE_BYTES,
      keepExtensions: true,
    });

    form.parse(
      req,
      async (
        parseError: { code?: number; message?: string } | null,
        fields: Record<string, string | string[] | undefined>,
        files: Record<string, any>
      ) => {
      if (parseError) {
        const message =
          parseError.code === 1009
            ? `You can upload up to ${MAX_DOCUMENTS} files.`
            : parseError.code === 1016
              ? 'Each file must be 10MB or smaller.'
              : parseError.message || 'Failed to process uploaded files.';
        res.status(400).json({ error: message });
        return;
      }

      try {
        const parsedBody: Record<string, string | undefined> = {};
        for (const [key, value] of Object.entries(fields)) {
          parsedBody[key] = normalizeFieldValue(value as string[] | string | undefined);
        }
        req.body = parsedBody as Request['body'];

        const rawFiles = toArray(files[fieldName]);
        if (rawFiles.length > MAX_DOCUMENTS) {
          res.status(400).json({ error: `You can upload up to ${MAX_DOCUMENTS} files.` });
          return;
        }

        const uploadedFiles: UploadedFile[] = [];
        for (const file of rawFiles) {
          const mimeType = file.mimetype || 'application/octet-stream';
          if (!ALLOWED_MIME_TYPES.has(mimeType)) {
            res.status(400).json({ error: 'Unsupported file type. Use PDF, JPG, or PNG only.' });
            return;
          }

          const buffer = await fs.readFile(file.filepath);
          uploadedFiles.push({
            originalname: file.originalFilename || 'document',
            mimetype: mimeType,
            size: file.size || buffer.length,
            buffer,
          });

          try {
            await fs.unlink(file.filepath);
          } catch {
            // Ignore temp cleanup failures.
          }
        }

        req.uploadedFiles = uploadedFiles;
        next();
      } catch (error) {
        next(error);
      }
      }
    );
  };
};

export const signupDocumentsUpload = [createMultipartParser('verificationDocuments')];

export const instructorDocumentsUpload = [createMultipartParser('documents')];
