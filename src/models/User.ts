import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
    name: string;
    email: string;
    avatar?: string;
    password: string;
    googleId?: string;
    facebookId?: string;
    isEmailVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    verifyEmailToken?: string;
    verifyEmailExpire?: Date;
    comparePassword: (password: string) => Promise<boolean>;
    generateEmailVerificationToken: (email: string) => string;
    createVerificationUrl: (token: string) => string;
    resetPasswordUrl: (token: string) => string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        avatar: {
            type: String
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        facebookId: {
            type: String,
            unique: true,
            sparse: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        verifyEmailToken: String,
        verifyEmailExpire: Date,
    },
    { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};
  
UserSchema.methods.generateEmailVerificationToken = function (email: string): string {
    return jwt.sign(
        { email },
        process.env.JWT_SECRET_KEY || "",
        { expiresIn: "1h" }
    );
};
  
UserSchema.methods.createVerificationUrl = function (token: string): string {
    this.verifyEmailExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    this.verifyEmailToken = token;
    return `${process.env.BACKEND_BASE_URL}/verify-email?token=${token}`;
};

UserSchema.methods.resetPasswordUrl = function (token: string): string {
    this.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    this.resetPasswordToken = token;
    return `${process.env.BACKEND_BASE_URL}/reset-password?token=${token}`;
};

export default mongoose.model<IUser>('User', UserSchema);
