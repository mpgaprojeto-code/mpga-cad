import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
      service: 'MPGA Backend & Database Integration',
      supabaseProject: "mpgaprojeto-code's Project",
      firebaseProject: 'mpga-cadastro',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/supabase/status', (_req: Request, res: Response) => {
    const hasUrl = Boolean(process.env.VITE_SUPABASE_URL);
    const hasKey = Boolean(process.env.VITE_SUPABASE_ANON_KEY);
    res.json({
      project: "mpgaprojeto-code's Project",
      configured: hasUrl && hasKey,
      tables: ['registered_children', 'sorteio_state'],
      realtimeEnabled: true,
      hasUrl,
      hasKey
    });
  });

  app.get('/api/supabase/schema', (_req: Request, res: Response) => {
    const schemaPath = path.resolve(__dirname, 'supabase', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(sql);
    } else {
      res.status(404).send('schema.sql not found');
    }
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
