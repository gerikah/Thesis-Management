import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// TODO: Add your API routes here
// Example:
// app.get('/api/theses', (req, res) => { ... });
// app.post('/api/theses', (req, res) => { ... });

// Start server
app.listen(PORT, () => {
  console.log(`PUP CpE Thesis Management Backend running on http://localhost:${PORT}`);
});
