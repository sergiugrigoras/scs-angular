import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { PasswordValidators } from './password.validators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { PasswordService } from 'src/app/services/password.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm = new FormGroup({
    username: new FormControl(this.authService.getUser()),
    email: new FormControl(this.authService.getEmail()),
  });

  passwordForm = new FormGroup({
    oldPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', Validators.required),
    confirmNewPassword: new FormControl('', Validators.required),
  }, PasswordValidators.passwordsShouldMatch);

  response = '';
  constructor(private authService: AuthService, private passwordService: PasswordService) { }

  ngOnInit(): void {
  }


  get oldPassword() {
    return this.passwordForm.get('oldPassword');
  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmNewPassword() {
    return this.passwordForm.get('confirmNewPassword');
  }

  changePassword() {
    this.passwordService.changePassword(this.oldPassword?.value, this.newPassword?.value).subscribe(
      result => {
        this.response = (<any>result).message;
      },
      error => {
        if (error instanceof HttpErrorResponse)
          if (error.status === 400) {
            this.response = error.error;
            setTimeout(() => {
              this.response = '';
            }, 3000);
          }
      },
      () => {
        this.passwordForm.reset();
        setTimeout(() => {
          this.response = '';
        }, 3000);
      }
    );
  }

}
