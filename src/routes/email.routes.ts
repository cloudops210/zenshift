import { Router } from 'express';
import { sendEmail } from '../controllers/email.controller';

const router = Router();

/**
 * @openapi
 * /api/email/send:
 *   post:
 *     summary: Send an email
 *     tags:
 *       - Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *             properties:
 *               to:
 *                 type: string
 *               subject:
 *                 type: string
 *               text:
 *                 type: string
 *               html:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to send email
 */
router.post('/send', sendEmail);

export default router;
