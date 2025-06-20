import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { sendVerificationEmail, sendResetPasswordEmail } from "../services/email.service";
import User from '../models/User';

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const verifyEmailSchema = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
});

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

export const register = async (req: Request, res: Response) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const verifyEmailToken = user.generateEmailVerificationToken(email);
        const verificationUrl = user.createVerificationUrl(verifyEmailToken);

        // await sendVerificationEmail(email, verificationUrl);

        res.status(201).json({
            message: 'User registered successfully',
        });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ error: 'Invalid your email' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid your password' });

        // if (!user.isEmailVerified) {
        //     return sendErrorResponse(res, 400, "Please verify your email first", "");
        // }
        
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { error } = verifyEmailSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, token } = req.body;

        const user = await User.findOne({
            email,
            verifyEmailToken: token,
            verifyEmailExpire: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid or expired verification token' });
            return;
        }

        if (user.isEmailVerified) {
            res.status(400).json({ error: 'Email is already verified' });
            return;
        }

        user.isEmailVerified = true;
        user.verifyEmailToken = undefined;
        user.verifyEmailExpire = undefined;
        await user.save();

        res.status(200).json({
            message: 'Email verification successful',
            user: {
                id: user._id,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Email verification failed' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { error } = forgotPasswordSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(200).json({
                message: 'If an account with that email exists, a password reset link has been sent'
            });
            return;
        }

        const resetToken = user.generateEmailVerificationToken(email);
        const resetUrl = user.resetPasswordUrl(resetToken);
        await user.save();

        await sendResetPasswordEmail(email, resetUrl);

        res.status(200).json({
            message: 'If an account with that email exists, a password reset link has been sent'
        });
    } catch (error) {
        res.status(500).json({ error: 'Password reset request failed' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { error } = resetPasswordSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, token, password } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid or expired password reset token' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password reset successful',
            user: {
                id: user.id,
                email: user.email,
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Password reset failed' });
    }
};

// Social Authentication Callback Controller
export const socialAuthCallback = async (req: Request & { user?: any }, res: Response) => {
    try {
        const user = req.user;

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const responseData = {
            message: "Login successful",
            user: {
                name: user.name,
                email: user.email,
            },
            token,
        };

        const encodedData = encodeURIComponent(JSON.stringify(responseData));
        res.redirect(`${process.env.BACKEND_BASE_URL}/social-callback?data=${encodedData}`);
    } catch (err) {
        res.status(500).json({ error: 'Social authentication failed' });
    }
};