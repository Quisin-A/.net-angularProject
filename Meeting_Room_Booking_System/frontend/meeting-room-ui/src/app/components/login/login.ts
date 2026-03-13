import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, LoginResponse } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule, RouterLink],
	templateUrl: './login.html',
	styleUrl: './login.css'
})
export class Login {
	email = '';
	password = '';
	isSubmitting = false;
	errorMessage = '';
	//
	showPassword = false;
	//

    

	constructor(
		private readonly api: ApiService,
		private readonly router: Router,
		private readonly auth: AuthService,
		private readonly cd: ChangeDetectorRef
	) {}

//
	togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
	//
	login(): void {
		this.errorMessage = '';

		if (!this.email || !this.password) {
			this.errorMessage = 'Please enter email and password.';
			this.cd.detectChanges();
			return;
		}

		this.isSubmitting = true;

		this.api
			.login({ email: this.email, password: this.password })
			.subscribe({
				next: (res: LoginResponse) => {
					this.auth.setSession({
						id: res.id,
						name: res.name,
						email: res.email,
						role: res.role
					});
					this.router.navigate(['/rooms']);
				},
				error: (err: { error?: string }) => {
					this.errorMessage = typeof err.error === 'string'
						? err.error
						: 'Invalid email or password.';
					this.isSubmitting = false;
					this.cd.detectChanges();
				},
				complete: () => {
					this.isSubmitting = false;
					this.cd.detectChanges();
				}
			});
	}
	//
	private autoHideError(): void {
    this.cd.detectChanges();
    setTimeout(() => {
        this.errorMessage = '';
        this.cd.detectChanges();
    }, 2000); // 2 Seconds
}

	//
}