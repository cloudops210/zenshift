import { Request, Response } from 'express';
import Review  from '../models/Review';
import Joi from 'joi';

export const createReviewSchema = Joi.object({
    buyerName: Joi.string().required().min(2).max(100),
    feedbackMark: Joi.number().required().min(0).max(5),
    reviewText: Joi.string().required().min(2).max(1000),
    isVerifiedBuyer: Joi.boolean(),
    isFeatured: Joi.boolean(),
    product: Joi.string().required()
});

// Create a new review
export const createReview = async (req: Request, res: Response) => {
    try {
        const { error } = createReviewSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
        }

        const review = new Review(req.body);
        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: 'Error creating review', error });
    }
};

// Get all reviews with pagination
export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find()
                .populate('product', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments()
        ]);

        res.status(200).json({
            reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

// Get review by ID
export const getReviewById = async (req: Request, res: Response) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('product', 'name');
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching review', error });
    }
};

// Get reviews by product ID with pagination
export const getReviewsByProduct = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ product: req.params.productId })
                .populate('product', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ product: req.params.productId })
        ]);

        res.status(200).json({
            reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product reviews', error });
    }
};

// Delete review
export const deleteReview = async (req: Request, res: Response) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
}; 