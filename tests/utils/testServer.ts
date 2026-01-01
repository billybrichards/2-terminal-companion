import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

export function createTestApp() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  
  return app;
}
