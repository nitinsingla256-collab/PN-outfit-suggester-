import express from 'express';
const app = express();
app.get('*', (req, res) => {
  res.send('<html><body><h1>Minimal Test</h1></body></html>');
});
app.listen(3000, '0.0.0.0', () => console.log('Minimal server running on port 3000'));
