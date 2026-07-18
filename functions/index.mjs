import admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const sendMatchNotification = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed');
    }

    const { groupCode, title, body } = req.body || {};
    if (!groupCode || !title || !body) {
      return res.status(400).send('Missing required fields: groupCode, title, body');
    }

    const snapshot = await db.collection('pushTokens').where('groupCode', '==', groupCode).get();
    const tokens = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) tokens.push(data.token);
    });

    if (!tokens.length) {
      return res.status(200).send('No tokens found');
    }

    const message = {
      tokens,
      notification: {
        title,
        body,
      },
      webpush: {
        fcmOptions: {
          link: '/',
        },
      },
    };

    const response = await admin.messaging().sendMulticast(message);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('sendMatchNotification', error);
    return res.status(500).json({ error: error.message || 'Internal error' });
  }
});

export const notifyOnNewMatch = onDocumentWritten('sharedStorage/{docId}', async (event) => {
  try {
    const beforeRaw = event.data?.previous?.value;
    const afterRaw = event.data?.value;
    if (!afterRaw) return;

    const beforeData = beforeRaw ? JSON.parse(beforeRaw) : { matches: [] };
    const afterData = JSON.parse(afterRaw);

    const beforeMatches = Array.isArray(beforeData.matches) ? beforeData.matches : [];
    const afterMatches = Array.isArray(afterData.matches) ? afterData.matches : [];
    if (afterMatches.length <= beforeMatches.length) return;

    const newMatches = afterMatches.slice(beforeMatches.length);
    const latest = newMatches[newMatches.length - 1];
    if (!latest) return;

    const docId = event.data?.ref?.id || '';
    const decoded = decodeURIComponent(docId || '');
    const [, groupCode] = decoded.split(':');
    if (!groupCode) return;

    const tokensSnapshot = await db.collection('pushTokens').where('groupCode', '==', groupCode).get();
    const tokens = [];
    tokensSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) tokens.push(data.token);
    });
    if (!tokens.length) return;

    const title = `${latest.recordedBy || 'Alguém'} registrou uma partida`;
    const body = `${latest.playerA} ${latest.scoreA} x ${latest.scoreB} ${latest.playerB}`;

    const message = {
      tokens,
      notification: { title, body },
      webpush: { fcmOptions: { link: '/' } },
    };

    await admin.messaging().sendMulticast(message);
  } catch (error) {
    console.error('notifyOnNewMatch', error);
  }
});
