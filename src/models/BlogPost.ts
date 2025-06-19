import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPost extends Document {
    title: string;
    description: string;
    vertical: 'interiors' | 'abundance' | 'health' | 'apothecary';
    imageSrc?: string[];
    readTime?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BlogPostSchema: Schema = new Schema<IBlogPost>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        vertical: { type: String, enum: ['interiors', 'abundance', 'health', 'apothecary'], required: true },
        imageSrc: [{ type: String }],
        readTime: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
