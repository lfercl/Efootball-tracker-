import admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

if (!admin.apps.length) {
  admin.initializeApp();
}

setGlobalOptions({ region: "europe-west1", maxInstances: 5 });

const db = admin.firestore();
const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

function parseGroup(raw) {
  if (!raw || typeof raw !== "string") return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function addedItems(beforeItems, afterItems) {
  const before = Array.isArray(beforeItems) ? beforeItems : [];
  const after = Array.isArray(afterItems) ? afterItems : [];
  const knownIds = new Set(before.map((item) => item?.id).filter(Boolean));
  if (knownIds.size) return after.filter((item) => item?.id && !knownIds.has(item.id));
  return after.length > before.length ? after.slice(before.length) : [];
}

function normalizedName(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-PT");
}

async function sendActivity({ groupCode, actorName, title, body, tab, type, eventId }) {
  const snapshot = await db.collection("pushTokens").where("groupCode", "==", groupCode).get();
  const recipients = snapshot.docs
    .map((document) => ({ document, ...document.data() }))
    .filter((entry) =>
      entry.enabled === true &&
      entry.token &&
      normalizedName(entry.playerName) !== normalizedName(actorName)
    );

  const webRecipients = recipients.filter((entry) => String(entry.platform || "web") === "web");
  const androidRecipients = recipients.filter((entry) => String(entry.platform || "") === "android");

  const sendInBatches = async (items, buildMessage) => {
    for (let start = 0; start < items.length; start += 500) {
      const batch = items.slice(start, start + 500);
      const response = await admin.messaging().sendEachForMulticast(buildMessage(batch));

      const invalidDocuments = [];
      response.responses.forEach((result, index) => {
        if (!result.success && INVALID_TOKEN_CODES.has(result.error?.code)) {
          invalidDocuments.push(batch[index].document.ref);
        }
      });
      await Promise.all(invalidDocuments.map((reference) => reference.delete()));
    }
  };

  await sendInBatches(webRecipients, (batch) => ({
    tokens: batch.map((entry) => entry.token),
    data: {
      title: String(title || "Nova atividade"),
      body: String(body || "Abra a app para ver as novidades."),
      tab: String(tab || "results"),
      type: String(type || "activity"),
      eventId: String(eventId || ""),
      groupCode: String(groupCode),
    },
    webpush: {
      headers: {
        Urgency: "high",
        TTL: "86400",
      },
    },
  }));

  await sendInBatches(androidRecipients, (batch) => ({
    tokens: batch.map((entry) => entry.token),
    notification: {
      title: String(title || "Nova atividade"),
      body: String(body || "Abra a app para ver as novidades."),
    },
    data: {
      title: String(title || "Nova atividade"),
      body: String(body || "Abra a app para ver as novidades."),
      tab: String(tab || "results"),
      type: String(type || "activity"),
      eventId: String(eventId || ""),
      groupCode: String(groupCode),
    },
    android: {
      priority: "high",
      notification: {
        channelId: "default",
        clickAction: "FCM_PLUGIN_ACTIVITY",
      },
      ttl: 86400000,
    },
  }));
}

export const notifyOnGroupActivity = onDocumentWritten("sharedStorage/{docId}", async (event) => {
  const decodedId = decodeURIComponent(String(event.params.docId || ""));
  if (!decodedId.startsWith("group:")) return;
  const groupCode = decodedId.slice("group:".length).trim().toUpperCase();
  if (!groupCode) return;

  const beforeRaw = event.data?.before?.exists ? event.data.before.data()?.value : null;
  const afterRaw = event.data?.after?.exists ? event.data.after.data()?.value : null;
  if (!afterRaw) return;

  const before = parseGroup(beforeRaw);
  const after = parseGroup(afterRaw);
  const newMatches = addedItems(before.matches, after.matches).slice(-5);
  const newMessages = addedItems(before.messages, after.messages).slice(-5);

  for (const match of newMatches) {
    const actorName = match.recordedBy || "Alguém";
    await sendActivity({
      groupCode,
      actorName,
      title: `${actorName} registou um resultado`,
      body: `${match.playerA} ${match.scoreA} – ${match.scoreB} ${match.playerB}`,
      tab: "results",
      type: "result",
      eventId: match.id,
    });
  }

  for (const message of newMessages) {
    const actorName = message.from || "Alguém";
    const body = message.text
      ? String(message.text).slice(0, 180)
      : message.mediaDataUrl
        ? "Enviou uma imagem no chat."
        : "Enviou uma nova mensagem.";
    await sendActivity({
      groupCode,
      actorName,
      title: `Nova mensagem de ${actorName}`,
      body,
      tab: "chat",
      type: "chat",
      eventId: message.id,
    });
  }
});
