import mongoose, { Document, Schema } from 'mongoose';

interface ProductDetailsTypes {
    whyCreated?: string;
    purpose?: string;
    energeticPurpose?: string;
    frequencyInfo?: {
        chakraAlignment?: string;
        designedFor?: string;
        energySignature?: string;
        elementalInfluence?: string;
    };
    additionalDetails?: {
        sizeMaterial?: string;
        care?: string;
        shippingFormat?: string;
        returns?: string;
    };
}

export interface IProduct extends Document {
    title: string;
    description?: string;
    type?: 'physical' | 'digital' | 'affiliate';
    category?: 'mugs-drinkware' | 'appare-accessories' | 'journals-papers' | 'home-energy-tools' | 'stickers-printables' | 'digital-art-decoy' | 'jewelry' | 'featured-collection',
    toolsType?: 'mug' | 'shirt' | 'journal',
    imageSrc: string[];
    rating?: number;
    price?: number;
    isNewProduct: boolean;
    isPick: boolean;
    details?: ProductDetailsTypes;
    createdAt: Date;
    updatedAt: Date;
}

type ProductDocument = Document & IProduct;

const ProductSchema = new Schema<ProductDocument>({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['physical', 'digital', 'affiliate'] },
    category: { type: String, enum: ['mugs-drinkware', 'appare-accessories', 'journals-papers', 'home-energy-tools', 'stickers-printables', 'digital-art-decoy', 'jewelry', 'featured-collection'] },
    toolsType: { type: String, enum: ['mug', 'shirt', 'journal'] },
    imageSrc: [{ type: String, required: true }],
    rating: { type: Number },
    price: { type: Number },
    isNewProduct: { type: Boolean, default: false },
    isPick: { type: Boolean, default: false },
    details: {
        whyCreated: String,
        purpose: String,
        energeticPurpose: String,
        frequencyInfo: {
            chakraAlignment: String,
            designedFor: String,
            energySignature: String,
            elementalInfluence: String
        },
        additionalDetails: {
            sizeMaterial: String,
            care: String,
            shippingFormat: String,
            returns: String
        }
    }
}, { timestamps: true });

export default mongoose.model<ProductDocument>('Product', ProductSchema);
