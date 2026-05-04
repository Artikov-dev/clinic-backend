import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/env';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { swaggerSpec } from './docs/swagger';

const app = express();

// ─── SECURITY ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ─── PARSING ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── LOGGING ──────────────────────────────────────────────────────────────────
if (config.isDev) app.use(morgan('dev'));
else app.use(morgan('combined'));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Clinic API is running',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── SWAGGER ──────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Clinic API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
