import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
    user?: mongoose.Types.ObjectId;
    eventType: string;
    eventData?: Record<string, any>;
    createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema<IAnalytics>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        eventType: { type: String, required: true },
        eventData: { type: Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
