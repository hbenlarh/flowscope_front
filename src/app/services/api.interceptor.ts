import { HttpInterceptorFn } from '@angular/common/http';

// Prefix /api requests with backend origin when running on the server (SSR)
export const serverApiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  const isServer = typeof window === 'undefined';
  if (isServer && req.url.startsWith('/api/')) {
    const backendOrigin = process.env['API_BASE_URL'] || 'http://127.0.0.1:8000';
    const rewritten = backendOrigin.replace(/\/$/, '') + req.url;
    req = req.clone({ url: rewritten });
  }
  return next(req);
};


