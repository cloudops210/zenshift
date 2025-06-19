import { Router } from 'express';
import { getProfile, updateProfile, deleteProfile } from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateJWT, getProfile);

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user profile
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authenticateJWT, updateProfile);

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     summary: Delete current user account
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/me', authenticateJWT, deleteProfile);

export default router;
