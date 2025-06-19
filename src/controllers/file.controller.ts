import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { UploadedFile } from 'express-fileupload';

const UPLOAD_DIR = path.join(__dirname, '/../uploads/');

const generateFileName = (originalName: string): string => {
    const fileExt = originalName.split('.').pop();
    return `file-${Date.now()}.${fileExt}`;
};

const cleanupFiles = async (filePaths: string[]): Promise<void> => {
    for (const filePath of filePaths) {
        try {
            await fs.promises.unlink(filePath);
        } catch (err) {
            console.error(`Error deleting file ${filePath}:`, err);
        }
    }
};

const validateFile = (file: UploadedFile, allowedMimeTypes: string[]): void => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('File type not allowed');
    }
};

const handleFileUpload = async (file: UploadedFile, directory: string): Promise<string> => {
    const fileName = generateFileName(file.name);
    const uploadPath = path.join(directory, fileName);
    await file.mv(uploadPath);
    return uploadPath;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded' });
        }

        const uploadedFile = req.files.file as UploadedFile;
        
        const uploadPath = await handleFileUpload(uploadedFile, UPLOAD_DIR);
        const fileName = path.basename(uploadPath);

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            fileName,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

export const uploadMultiFile = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files.files)) {
            return res.status(400).json({ error: 'No files were uploaded' });
        }

        const fileNames: string[] = [];
        for (const file of req.files.files) {
            const uploadPath = await handleFileUpload(file, UPLOAD_DIR);
            const fileName = path.basename(uploadPath);
            fileNames.push(fileName);
        }

        res.status(200).json({
            success: true,
            message: 'Files uploaded successfully',
            fileName: fileNames,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload files' });
    }
};