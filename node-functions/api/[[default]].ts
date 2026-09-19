import { app, setupApiRoutes } from '../../server';

// Ensure /api routes work whether EdgeOne strips or preserves the /api path prefix:
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

setupApiRoutes();

// Catch-all API 404 handler to ensure we return JSON, not HTML, for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API Route Not Found: ${req.method} ${req.originalUrl || req.url}` });
});

export default app;
