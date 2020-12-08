import { UserModel } from './../../interfaces/user.interface';
import { AuthService } from './../../services/auth.service';
import { PasswordValidators } from './password.validators';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { UsernameValidators } from './username.validators';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form = new FormGroup({
    username: new FormControl('', Validators.required, this.shouldBeUnique.bind(this)),
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  }, PasswordValidators.passwordsShouldMatch);

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  get password() {
    return this.form.get('password');
  }

  get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  get email() {
    return this.form.get('email');
  }

  get username() {
    return this.form.get('username');
  }

  register() {
    let user: UserModel = {
      username: this.username?.value,
      email: this.email?.value,
      password: this.password?.value
    };
    this.authService.register(user);
  }

  shouldBeUnique(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.authService.checkUniqueuUsername(this.form.get('username')?.value)
      .pipe(map(result => {
        if (result) return null;
        else return { shouldBeUnique: true }
      }));
  }
}
