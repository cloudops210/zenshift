import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
    title: string;
    body: string;
    vertical: 'interiors' | 'abundance' | 'health' | 'apothecary';
    files?: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ContentSchema: Schema = new Schema<IContent>(
    {
        title: { type: String, required: true },
        body: { type: String, required: true },
        vertical: { type: String, enum: ['interiors', 'abundance', 'health', 'apothecary'], required: true },
        files: [{ type: String }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IContent>('Content', ContentSchema);
