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
  console.log('[Webhook] POST received. object=', body?.object);

  if (body?.object !== 'whatsapp_business_account') {
    console.log('[Webhook] Ignored — not a whatsapp_business_account event.');
    return;
  }

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      const messages = value?.messages || [];
      const statuses = value?.statuses || [];
      console.log(`[Webhook] change: ${messages.length} message(s), ${statuses.length} status(es)`);

      for (const message of messages) {
        console.log(`[Webhook] message from=${message.from} type=${message.type}`);

        let msg: WhatsAppMessage | null = null;

        if (message.type === 'text') {
          msg = {
            from: message.from,
            text: message.text?.body || '',
            messageId: message.id,
            kind: 'text',
          };
        } else if (message.type === 'image') {
          msg = {
            from: message.from,
            text: message.image?.caption || '',
            messageId: message.id,
            kind: 'image',
            mediaId: message.image?.id,
          };
        } else {
          continue; // unsupported type (audio, sticker, etc.)
        }

        // Process async — don't await (webhook already replied 200)
        processMessage(msg).catch(err =>
          console.error('[Webhook] processMessage error:', err),
        );
      }
    }
  }
});

export default router;
