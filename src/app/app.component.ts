import { HomeComponent } from './components/home/home.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

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
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  checkLoggedIn() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout().pipe(tap(() => {
      this.router.navigate(['/']);
      this.checkLoggedIn();
    })).subscribe();
  }

  getUser() {
    return this.authService.getUser();
  }

  onOutletLoaded(event: any) {
    if (event instanceof HomeComponent)
      event.isLoggedIn = this.authService.isLoggedIn();
  }

}


