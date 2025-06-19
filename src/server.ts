import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGODB_URL is not defined in the environment variables.");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log(`Connected to MongoDB: ${MONGO_URI}`);
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Zenshift running on port ${PORT}`);
        });
     })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });
