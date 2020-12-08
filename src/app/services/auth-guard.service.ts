import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { faAmbulance } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.apiUrl;

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtHelper: JwtHelperService, private router: Router, private http: HttpClient) {
    }

    async canActivate() {
        const token = localStorage.getItem("jwt");
        if (token == null) {
            this.router.navigate(["login"]);
            return false;
        }

        if (token && !this.jwtHelper.isTokenExpired(token)) {
            //console.log(this.jwtHelper.decodeToken(token));
            return true;
        }
        const isRefreshSuccess = await this.tryRefreshingTokens(token);
        if (!isRefreshSuccess) {
            this.router.navigate(["login"]);
        }
        return isRefreshSuccess;
    }

    private async tryRefreshingTokens(token: any): Promise<boolean> {
        // Try refreshing tokens using refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        const credentials = JSON.stringify({ accessToken: token, refreshToken: refreshToken });
        let isRefreshSuccess: boolean;
        try {
            const response = await this.http.post(apiUrl + '/api/token/refresh', credentials, {
                headers: new HttpHeaders({
                    "Content-Type": "application/json"
                }),
                observe: 'response'
            }).toPromise();
            // If token refresh is successful, set new tokens in local storage.
            const newToken = (<any>response).body.accessToken;
            const newRefreshToken = (<any>response).body.refreshToken;
            localStorage.setItem("jwt", newToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            isRefreshSuccess = true;
        }
        catch (ex) {
            isRefreshSuccess = false;
        }
        return isRefreshSuccess;
    }

}
