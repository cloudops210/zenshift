import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import Joi from 'joi';
import bcrypt from 'bcryptjs';

const updateSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6),
});

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as AuthRequest).user?.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { error } = updateSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const updates: any = { ...req.body };
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate((req as AuthRequest).user?.id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete((req as AuthRequest).user?.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
