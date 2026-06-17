import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import webhookRouter from './routes/webhook';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'autonance-backend', ts: new Date().toISOString() });
});

// WhatsApp webhook
app.use('/webhook', webhookRouter);

app.listen(PORT, () => {
  console.log(`\n🚀 Autonance backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Webhook: http://localhost:${PORT}/webhook\n`);
});
