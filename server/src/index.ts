import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import reviewRoutes from './routes/review.routes';
import documentRoutes from './routes/document.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
import ctdRoutes from './routes/ctd.routes';
import portalRoutes from './routes/portal.routes';
import { AppError } from './utils/errors';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProduction ? true : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ctd', ctdRoutes);
app.use('/api/portal', portalRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve the React build
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  // SPA fallback: send all non-API routes to index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err.message?.includes('File too large')) {
    res.status(400).json({
      error: { code: 'FILE_TOO_LARGE', message: '文件大小不能超过10MB' },
    });
    return;
  }

  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Drug Registration Server: http://localhost:${PORT}`);
  console.log(`📋 Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  if (!isProduction) {
    console.log(`💡 Frontend dev server: npm run dev:client`);
  }
});

export default app;
