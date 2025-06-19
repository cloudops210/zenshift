import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import Joi from 'joi';

const blogSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    vertical: Joi.string().valid('interiors', 'abundance', 'health', 'apothecary').required(),
    imageSrc: Joi.array().items(Joi.string()),
    readTime: Joi.string()
});

const idSchema = Joi.object({
    id: Joi.string().required()
});

const verticalSchema = Joi.object({
    vertical: Joi.string().valid('interiors', 'abundance', 'health', 'apothecary').required(),
});

// Create a new blog post
export const createBlogPost = async (req: Request, res: Response) => {
    try {
        const { error } = blogSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { title, description, vertical, imageSrc, readTime } = req.body;
        const blog = await BlogPost.create({
            title,
            description,
            vertical,
            imageSrc,
            readTime
        });
        res.status(201).json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create blog post' });
    }
};

// Get all blog posts
export const getAllBlogPosts = async (_req: Request, res: Response) => {
    try {
        const blogs = await BlogPost.find();
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
};

// Get blog posts by vertical
export const getBlogPostsByVertical = async (req: Request, res: Response) => {
    try {
        const { error } = verticalSchema.validate({ vertical: req.params.vertical });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { vertical } = req.params;
        
        const blogs = await BlogPost.find({ vertical });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blog posts by vertical' });
    }
};

// Get blog post by ID
export const getBlogPostById = async (req: Request, res: Response) => {
    try {
        const { error } = idSchema.validate({ id: req.params.id });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const blog = await BlogPost.findOne({ _id: req.params.id });
        if (!blog) return res.status(404).json({ error: 'Blog post not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
};

// Update blog post
export const updateBlogPost = async (req: Request, res: Response) => {
    try {
        const { error } = blogSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const blog = await BlogPost.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!blog) return res.status(404).json({ error: 'Blog post not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update blog post' });
    }
};

// Delete blog post
export const deleteBlogPost = async (req: Request, res: Response) => {
    try {
        const { error } = idSchema.validate({ id: req.params.id });
        if (error) return res.status(400).json({ error: error.details[0].message });
        
        const blog = await BlogPost.findOneAndDelete({
            _id: req.params.id
        });
        if (!blog) return res.status(404).json({ error: 'Blog post not found' });
        res.json({ message: 'Blog post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
};
