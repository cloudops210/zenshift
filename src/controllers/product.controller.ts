import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product';
import Joi from 'joi';

// Validation schemas
const productSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    type: Joi.string().valid('physical', 'digital', 'affiliate'),
    category: Joi.string().valid('mugs-drinkware', 'appare-accessories', 'journals-papers', 'home-energy-tools', 'stickers-printables', 'digital-art-decoy', 'jewelry', 'featured-collection'),
    toolsType: Joi.string().valid('mug', 'shirt', 'journal'),
    imageSrc: Joi.array().items(Joi.string()).required(),
    rating: Joi.number().min(0).max(5),
    price: Joi.number().min(0),
    isNewProduct: Joi.boolean(),
    isPick: Joi.boolean(),
    details: Joi.object({
        whyCreated: Joi.string(),
        purpose: Joi.string(),
        energeticPurpose: Joi.string(),
        frequencyInfo: Joi.object({
            chakraAlignment: Joi.string(),
            designedFor: Joi.string(),
            energySignature: Joi.string(),
            elementalInfluence: Joi.string()
        }),
        additionalDetails: Joi.object({
            sizeMaterial: Joi.string(),
            care: Joi.string(),
            shippingFormat: Joi.string(),
            returns: Joi.string()
        })
    })
});

const idSchema = Joi.object({
    id: Joi.string().required()
});

const typeSchema = Joi.object({
    type: Joi.string().valid('physical', 'digital', 'affiliate').required()
});

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { error } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const productData: IProduct = req.body;
        const product = new Product(productData);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error });
    }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (req.query.type) filter.type = req.query.type;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.toolsType) filter.toolsType = req.query.toolsType;

        let sort: any = { createdAt: -1 };
        if (req.query.sortBy) {
            switch (req.query.sortBy) {
                case 'alphabetical':
                    sort = { title: 1 };
                    break;
                case 'price':
                    sort = { price: 1 };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
                default:
                    sort = { createdAt: -1 };
            }
        }

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter).sort(sort).skip(skip).limit(limit);

        res.status(200).json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { error } = idSchema.validate({ id: req.params.id });
        if (error) return res.status(400).json({ error: error.details[0].message });


        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { error } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error });
    }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { error } = idSchema.validate({ id: req.params.id });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
