import { app, setupApiRoutes } from '../server';

// Initialize the API routes on the exported Express instance
setupApiRoutes();

// Catch-all API 404 handler to ensure we return JSON, not HTML, for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API Route Not Found: ${req.method} ${req.originalUrl}` });
});

export default app;
