import { Router } from 'express';
import {
    createBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPost,
    deleteBlogPost,
    getBlogPostsByVertical,
} from '../controllers/blogpost.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', getAllBlogPosts);
router.get('/vertical/:vertical', getBlogPostsByVertical);
router.get('/:id', getBlogPostById);
router.post('/', authenticateJWT, createBlogPost);
router.put('/:id', authenticateJWT, updateBlogPost);
router.delete('/:id', authenticateJWT, deleteBlogPost);

export default router;
