import { UserModel } from './../../interfaces/user.interface';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),
  });

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  login() {
    let user: UserModel = {
      username: this.form.get('username')?.value,
      email: '',
      password: this.form.get('password')?.value
    };
    this.authService.login(user);
  }

}
