importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

const workerUrl = new URL(self.location.href);
const firebaseConfig = {
  apiKey: workerUrl.searchParams.get("apiKey") || "",
  authDomain: workerUrl.searchParams.get("authDomain") || "",
  projectId: workerUrl.searchParams.get("projectId") || "",
  storageBucket: workerUrl.searchParams.get("storageBucket") || "",
  messagingSenderId: workerUrl.searchParams.get("messagingSenderId") || "",
  appId: workerUrl.searchParams.get("appId") || "",
};

const canInitialize = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

if (canInitialize && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

if (canInitialize) {
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const title = data.title || "Nova atividade";
    const body = data.body || "Abra a app para ver as novidades.";
    const icon = new URL("icons/icon-192.png", self.registration.scope).href;

    return self.registration.showNotification(title, {
      body,
      icon,
      badge: icon,
      tag: data.eventId || data.type || "matchday-activity",
      renotify: true,
      data: {
        tab: data.tab || "results",
        eventId: data.eventId || "",
      },
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const tab = event.notification.data?.tab || "results";
  const target = new URL(self.registration.scope);
  target.searchParams.set("tab", tab);

  event.waitUntil((async () => {
    const clientList = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const appClient = clientList.find((client) => client.url.startsWith(self.registration.scope));

    if (appClient) {
      const navigated = "navigate" in appClient ? await appClient.navigate(target.href) : appClient;
      const activeClient = navigated || appClient;
      activeClient.postMessage({ type: "OPEN_APP_TAB", tab });
      if ("focus" in activeClient) return activeClient.focus();
      return activeClient;
    }
    return clients.openWindow ? clients.openWindow(target.href) : undefined;
  })());
});
