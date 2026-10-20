const CACHE_NAME = 'nahj-alhaq-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
];

// تثبيت الـ Service Worker وتخزين الأصول الأساسية
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل وتحديث الـ Cache القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية التخزين الاستجابي (Network First with Cache Fallback)
self.addEventListener('fetch', (e) => {
  // تجاهل الطلبات المباشرة لقاعدة بيانات Supabase لضمان جلب البيانات الحية دائماً
  if (e.request.url.includes('supabase.co')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (e.request.method === 'GET') {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(e.request)) // في حالة انقطاع الإنترنت، يعرض النسخة المخزنة
  );
});
