import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Backend API routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'MPGA Backend & Firebase Integration',
      firebaseProject: 'mpga-cadastro',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/firebase/config', (_req: Request, res: Response) => {
    res.json({
      projectId: 'mpga-cadastro',
      authDomain: 'mpga-cadastro.firebaseapp.com',
      storageBucket: 'mpga-cadastro.firebasestorage.app',
      messagingSenderId: '979797356332',
      appId: '1:979797356332:web:a32b03c58ff57b4d010689',
      measurementId: 'G-VXDQQK8XN3'
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In development mode, dynamically import Vite and mount vite.middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> MPGA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
