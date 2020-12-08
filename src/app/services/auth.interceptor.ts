import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';



export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        req = req.clone({
            setHeaders: {
                // 'Content-Type': 'application/json; charset=utf-8',
                // 'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("jwt")}`,
            },
        });

        return next.handle(req);
    }
}