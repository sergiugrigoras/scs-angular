import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { faAmbulance } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

const apiUrl: string = environment.apiUrl;

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authService.isLoggedIn()) {
            return true;
        } else {
            this.router.navigate(["login"], { queryParams: { returnUrl: state.url } });
            return this.authService.isLoggedIn();
        }
    }

}
