import { HttpInterceptorFn } from '@angular/common/http';

export const roleInterceptor: HttpInterceptorFn = (req, next) => {
  const role = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');

  const headers: { [key: string]: string } = {};
  
  if (role) {
    headers['role'] = role;
  }
  
  if (userId) {
    headers['userId'] = userId;
  }

  if (Object.keys(headers).length === 0) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: headers
  }));
};
