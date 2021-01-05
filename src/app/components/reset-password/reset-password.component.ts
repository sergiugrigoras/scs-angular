import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from 'src/app/services/password.service';
import { PasswordValidators } from '../profile/password.validators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetToken = '';
  resetTokenId = '';
  maskedMailAddress = '';
  userError = '';
  passwordError = '';
  passwordSuccess = '';

  userIdentifierForm = new FormGroup({
    userIdentifier: new FormControl('', Validators.required),
  });

  passwordForm = new FormGroup({
    newPassword: new FormControl('', Validators.required),
    confirmNewPassword: new FormControl('', Validators.required),
  }, PasswordValidators.passwordsShouldMatch);

  constructor(private route: ActivatedRoute, private router: Router, private passwordService: PasswordService, private authService: AuthService) { }

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParams['token'] || '';
    this.resetTokenId = this.route.snapshot.queryParams['id'] || '';
  }

  getResetToken() {
    this.passwordService.sendResetToken(this.userIdentifierForm.get('userIdentifier')?.value).subscribe(response => {
      this.userIdentifierForm.reset();
      this.maskedMailAddress = (<any>response).mail;
      this.userError = '';
    },
      error => {
        this.maskedMailAddress = '';
        this.userIdentifierForm.reset();
        if (error instanceof HttpErrorResponse)
          this.userError = error.error;
      },
    );
  }

  resetPassword() {
    this.passwordService.resetPassword(+this.resetTokenId, this.resetToken, this.newPassword?.value)
      .pipe(
        catchError(error => {
          this.passwordError = 'Invalid Token';
          this.passwordForm.reset();
          return throwError(error);
        }),
        switchMap(tokens => {
          return this.authService.loginWithToken(tokens);
        })
      )
      .subscribe(res => {
        if (res) {
          this.passwordSuccess = 'Password has been changed succesfully';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        }
      })


  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmNewPassword() {
    return this.passwordForm.get('confirmNewPassword');
  }

}
