const CACHE_NAME = 'mirror-ai-v1';
const STATIC_CACHE = 'mirror-ai-static-v1';
const DYNAMIC_CACHE = 'mirror-ai-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  (self as any).skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  (self as any).clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Network error', { status: 408 });
  }
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  });

  return cached || fetchPromise;
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Offline', { status: 503 });
  }
}

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() || {};
  const title = data.title || '心镜 AI';
  const options = {
    body: data.body || '你有一条新提醒',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.url || '/',
    actions: [
      { action: 'open', title: '打开' },
      { action: 'close', title: '关闭' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-entries') {
    event.waitUntil(syncJournalEntries());
  }
});

async function syncJournalEntries() {
  const db = await openDB();
  const entries = await db.getAll('pending-entries');
  
  for (const entry of entries) {
    try {
      await fetch('/api/entries', {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: { 'Content-Type': 'application/json' },
      });
      await db.delete('pending-entries', entry.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('mirror-ai', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pending-entries')) {
        db.createObjectStore('pending-entries', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface PushEvent extends Event {
  data?: any;
}

interface NotificationEvent extends Event {
  action: string;
  notification: {
    data: string;
    close(): void;
  };
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
}
