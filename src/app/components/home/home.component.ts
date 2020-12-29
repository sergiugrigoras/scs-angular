import { AuthService } from 'src/app/services/auth.service';
import { Component, Input, OnInit } from '@angular/core';
import { faHdd, faStickyNote } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;

  faHdd = faHdd;
  faStickyNote = faStickyNote;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.isUserLoggedInSubject.subscribe(val => {
      this.isLoggedIn = val;
    }
    );
  }
}
