import { TokenModel } from './../interfaces/token.interface';
import { UserModel } from './../interfaces/user.interface';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}
const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService) { }

  checkUniqueuUsername(username: string): Observable<boolean> {
    return this.http.post<any>(apiUrl + '/api/auth/uniqueusername', { username: username }, httpOptions);
  }

  isAuthenticated(): boolean {
    if (localStorage.getItem('jwt')) {
      return true;
    }
    else {
      return false;
    }
  }

  register(user: UserModel) {
    this.http.post<UserModel>(apiUrl + '/api/auth/register', user, httpOptions)
      .subscribe(response => {
        const token = (<any>response).accessToken;
        const refreshToken = (<any>response).refreshToken;
        localStorage.setItem("jwt", token);
        localStorage.setItem("refreshToken", refreshToken);
        this.router.navigate(["/"]);
      }, error => {
        console.log(error);
      });
  }

  login(user: UserModel, returnUrl: string) {
    this.http.post(apiUrl + '/api/auth/login', user, httpOptions)
      .subscribe(response => {
        const token = (<any>response).accessToken;
        const refreshToken = (<any>response).refreshToken;
        localStorage.setItem("jwt", token);
        localStorage.setItem("refreshToken", refreshToken);
        this.router.navigate([returnUrl]);
      }, err => {
        console.log(err);
      });
  }

  logout() {
    this.http.post(apiUrl + '/api/token/revoke', null).subscribe();
    localStorage.removeItem("jwt");
    localStorage.removeItem("refreshToken");
    this.router.navigate(["/"]);
  }

  getUser(): string {
    const token = localStorage.getItem("jwt");
    if (token)
      return this.jwtHelper.decodeToken(token).unique_name;
    else
      return '';
  }
}
