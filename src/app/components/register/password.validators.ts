import { AbstractControl, ControlContainer, ValidationErrors } from '@angular/forms';
export class PasswordValidators {

    // static oldPasswordMatch(control: AbstractControl): Promise<ValidationErrors | null> {
    //     return new Promise((resolve, reject) => {
    //         if (control.value != '1234')
    //             resolve({ invalidOldPassword: true });
    //         else
    //             resolve(null);
    //     });
    // }

    static passwordsShouldMatch(control: AbstractControl): ValidationErrors | null {
        let pass = control.get('password')?.value;
        let confirmPass = control.get('confirmPassword')?.value;

        if (pass !== confirmPass)
            return { passwordsShouldMatch: true };

        return null;
    }
}