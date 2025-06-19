import { Request, Response } from 'express';
import Journal from '../models/Journal';
import Joi from 'joi';

const journalSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().allow(''),
    description: Joi.string().required(),
    vertical: Joi.string().valid('interiors', 'abundance', 'health', 'apothecary', 'energy').required(),
    imageSrc: Joi.array().items(Joi.string()),
    readTime: Joi.string().allow('')
});

const idSchema = Joi.object({
    id: Joi.string().required()
});

// Create a new journal
export const createJournal = async (req: Request, res: Response) => {
    try {
        const { error } = journalSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { title, author, description, vertical, imageSrc, readTime } = req.body;
        const journal = await Journal.create({
            title,
            author,
            description,
            vertical,
            imageSrc,
            readTime
        });
        res.status(201).json(journal);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create journal' });
    }
};

// Get all journals
export const getAllJournals = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (req.query.vertical) {
            filter.vertical = req.query.vertical;
        }

        let sort: any = { createdAt: -1 };
        if (req.query.sortBy) {
            switch (req.query.sortBy) {
                case 'alphabetical':
                    sort = { title: 1 };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
                case 'oldest':
                    sort = { createdAt: 1 };
                    break;
                default:
                    sort = { createdAt: -1 };
            }
        }

        const total = await Journal.countDocuments(filter);
        const journals = await Journal.find(filter).sort(sort).skip(skip).limit(limit);

        res.status(200).json({
            journals,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch journals' });
    }
};

// Get journal by ID
export const getJournalById = async (req: Request, res: Response) => {
    try {
        const { error } = idSchema.validate({ id: req.params.id });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const journal = await Journal.findOne({ _id: req.params.id });
        if (!journal) return res.status(404).json({ error: 'Journal not found' });
        res.json(journal);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch journal' });
    }
};

// Update journal
export const updateJournal = async (req: Request, res: Response) => {
    try {
        const { error } = journalSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const journal = await Journal.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!journal) return res.status(404).json({ error: 'Journal not found' });
        res.json(journal);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update journal' });
    }
};

// Delete journal
export const deleteJournal = async (req: Request, res: Response) => {
    try {
        const { error } = idSchema.validate({ id: req.params.id });
        if (error) return res.status(400).json({ error: error.details[0].message });
        
        const journal = await Journal.findOneAndDelete({
            _id: req.params.id
        });
        if (!journal) return res.status(404).json({ error: 'Journal not found' });
        res.json({ message: 'Journal deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete journal' });
    }
}; 