import { Router } from 'express';
import { uploadFile } from '../controllers/file.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/upload', authenticateJWT, uploadFile);

export default router;
