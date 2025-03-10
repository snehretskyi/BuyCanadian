import express from 'express';
import cors from 'cors';
import barcodeRoutes from './routes/barcodeRoutes';
import buyCanadianRoutes from './routes/buyCanadianRoutes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use("/buy-canadian", express.static(path.join(__dirname, 'public/buy-canadian/browser')));

app.use("/buy-canadian", buyCanadianRoutes);
app.use('/api', barcodeRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
