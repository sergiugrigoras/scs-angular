import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
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
  constructor(protected authService: AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

}
