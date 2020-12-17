import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'scs';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  checkLoggedIn() {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  logOut() {
    this.authService.logout();
    this.checkLoggedIn();
  }

  getUser() {
    return this.authService.getUser();
  }

}


