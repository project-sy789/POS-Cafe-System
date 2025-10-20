import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import { socketAuthMiddleware } from './socket/socketAuth.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Café POS System API' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// Socket.IO authentication middleware
io.use(socketAuthMiddleware);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} (User: ${socket.user.username}, Role: ${socket.user.role})`);

  // Set up socket event handlers
  setupSocketHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id} (User: ${socket.user.username})`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export io instance getter for use in controllers
export const getIO = () => io;

export { app, io };
