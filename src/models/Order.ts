import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    products: Array<{
        product: mongoose.Types.ObjectId;
        quantity: number;
    }>;
    total: number;
    status: 'pending' | 'paid' | 'failed' | 'delivered' | 'cancelled';
    paymentIntentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        products: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true, min: 1 },
            },
        ],
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'delivered', 'cancelled'],
            default: 'pending',
        },
        paymentIntentId: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
