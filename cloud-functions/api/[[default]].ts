import { app, setupApiRoutes } from '../../server';

setupApiRoutes();

// Protect /api routes from being swallowed by the SPA fallback (if somehow this applies, though EdgeOne route should stop here)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API Route Not Found: ${req.method} ${req.originalUrl}` });
});

export default app;
