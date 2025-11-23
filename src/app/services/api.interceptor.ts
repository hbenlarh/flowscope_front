import { HttpInterceptorFn } from '@angular/common/http';

// Convert /api requests to full backend URL for both client and server
export const serverApiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api/')) {
    const backendOrigin = process.env['API_BASE_URL'] || 'https://test1.jcloud-ver-jpe.ik-server.com';
    const rewritten = backendOrigin.replace(/\/$/, '') + req.url;
    req = req.clone({ url: rewritten });
  }
  return next(req);
};


