import { HttpErrorResponse } from '@angular/common/http';
import { UserModel } from './../../interfaces/user.interface';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  badLogin: boolean = false;
  returnUrl: string = '';
  form = new FormGroup({
    userIdentifier: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login() {
    let identifier = this.form.get('userIdentifier')?.value;
    let user: UserModel = {
      username: String(identifier).includes('@') ? '' : identifier,
      email: String(identifier).includes('@') ? identifier : '',
      password: this.form.get('password')?.value
    };
    this.authService.login(user).subscribe(res => {
      if (res)
        this.router.navigate([this.returnUrl]);
    },
      error => {
        if (error instanceof HttpErrorResponse && error.status === 404)
          this.badLogin = true;
      });
  }

}
