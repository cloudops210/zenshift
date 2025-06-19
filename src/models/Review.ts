import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    buyerName: string;
    feedbackMark: number;
    reviewText: string;
    isVerifiedBuyer?: boolean;
    isFeatured?: boolean;
    product: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
    {
        buyerName: { type: String, required: true },
        feedbackMark: { type: Number, required: true },
        reviewText: { type: String, required: true },
        isVerifiedBuyer: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
