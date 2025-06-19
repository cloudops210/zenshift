import express from 'express';
import {
    createReview,
    getAllReviews,
    getReviewById,
    getReviewsByProduct,
    deleteReview
} from '../controllers/review.controller';

const router = express.Router();

router.post('/', createReview);
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.get('/product/:productId', getReviewsByProduct);
router.delete('/:id', deleteReview);

export default router; 