import { Router, Request, Response } from 'express';
import { processMessage } from '../services/messageProcessor';
import { WhatsAppMessage } from '../types';

const router = Router();

// GET /webhook — Meta verification handshake
router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[Webhook] Verified by Meta.');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// POST /webhook — incoming WhatsApp messages
router.post('/', (req: Request, res: Response) => {
  // Always respond 200 immediately — Meta will retry if we don't
  res.status(200).send('OK');

  const body = req.body;
  if (body?.object !== 'whatsapp_business_account') return;

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      for (const message of value?.messages || []) {
        if (message.type !== 'text') continue; // text only for now

        const msg: WhatsAppMessage = {
          from: message.from,
          text: message.text?.body || '',
          messageId: message.id,
        };

        // Process async — don't await (webhook already replied 200)
        processMessage(msg).catch(err =>
          console.error('[Webhook] processMessage error:', err),
        );
      }
    }
  }
});

export default router;
