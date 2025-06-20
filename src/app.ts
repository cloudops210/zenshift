import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import routes from './routes';
import passport from './config/passport';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());

const staticPath = path.join(__dirname, 'static');
app.use(express.static(staticPath));

app.use(fileUpload({
    createParentPath: true,
    limits: { 
      fileSize: 100 * 1024 * 1024
    },
    abortOnLimit: true,
    safeFileNames: false,
    preserveExtension: true
}));

app.use(passport.initialize());

app.use('/api', routes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

export default app;
