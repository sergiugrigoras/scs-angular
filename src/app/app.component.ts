import { Component, OnInit } from '@angular/core';
import { faCoffee, faAmbulance } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'scs';
  icon1 = faAmbulance;

  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.checkLoggedIn();
  }

  logOut() {
    this.authService.logout();
  }

  checkLoggedIn() {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

}


