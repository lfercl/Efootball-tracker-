importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

let firebaseInitialized = false;

const initFirebase = (config) => {
  if (firebaseInitialized || !config) return;
  try {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || 'Novo resultado registrado';
      const body = payload.notification?.body || payload.data?.body || 'Confira a partida no app.';
      self.registration.showNotification(title, {
        body,
        icon: './favicon.ico',
        data: payload.data,
      });
    });
    firebaseInitialized = true;
  } catch (error) {
    console.error('FCM service worker failed to initialize', error);
  }
};

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'INITIALIZE_FCM') {
    initFirebase(event.data.config);
  }
});

// Required by some installability checks on mobile browsers.
self.addEventListener('fetch', () => {});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
