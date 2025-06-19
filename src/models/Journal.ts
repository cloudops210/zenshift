import mongoose, { Document, Schema } from 'mongoose';

export interface IJournal extends Document {
    title: string;
    author: string;
    description: string;
    vertical: 'interiors' | 'abundance' | 'health' | 'apothecary' | 'energy';
    imageSrc?: string[];
    readTime?: string;
    createdAt: Date;
    updatedAt: Date;
}

const JournalSchema: Schema = new Schema<IJournal>(
    {
        title: { type: String, required: true },
        author: { type: String },
        description: { type: String, required: true },
        vertical: { type: String, enum: ['interiors', 'abundance', 'health', 'apothecary', 'energy'], required: true },
        imageSrc: [{ type: String }],
        readTime: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model<IJournal>('Journal', JournalSchema);
