import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [FormsModule, RouterLink],
	templateUrl: './register.html',
	styleUrl: './register.css'
})
export class Register {
	name = '';
	email = '';
	password = '';
	isSubmitting = false;
	errorMessage = '';
	successMessage = '';

	constructor(
		private readonly api: ApiService,
		private readonly router: Router,
		private readonly cd: ChangeDetectorRef
	) {}

	private getRegisterErrorMessage(err: HttpErrorResponse): string {
		if (err.status === 0) {
			return 'Cannot reach backend API. Ensure backend is running and CORS origin matches your Angular port.';
		}

		if (typeof err.error === 'string' && err.error.trim().length > 0) {
			return err.error;
		}

		if (err.error && typeof err.error === 'object') {
			const errorObject = err.error as { message?: string; title?: string; errors?: Record<string, string[]> };

			if (errorObject.message) {
				return errorObject.message;
			}

			if (errorObject.title) {
				return errorObject.title;
			}

			if (errorObject.errors) {
				const validationMessages = Object.values(errorObject.errors).flat();
				if (validationMessages.length > 0) {
					return validationMessages.join(' ');
				}
			}
		}

		return 'Registration failed. Please try again.';
	}

	register(): void {
		this.errorMessage = '';
		this.successMessage = '';

		if (!this.name || !this.email || !this.password) {
			this.errorMessage = 'Please fill in all fields.';
			this.cd.detectChanges();
			return;
		}
		//
		// 2. Strict Email Format Validation (Regex)
    // This will block 'employee' because it lacks @ and .domain
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.email.trim())) {
        this.errorMessage = 'Invalid email format (e.g., name@gmail.com).';
        
        // Auto-hide the error after 2 seconds (Fast feedback)
        this.cd.detectChanges();
        setTimeout(() => {
            this.errorMessage = '';
            this.cd.detectChanges();
        }, 2000);
        return;
	}
	//
		

		this.isSubmitting = true;

		this.api
			.register({
				name: this.name,
				email: this.email,
				password: this.password
			})
			.subscribe({
				next: () => {
					this.successMessage = 'Account created successfully! Redirecting to login...';
					this.cd.detectChanges();
					setTimeout(() => {
						this.router.navigate(['/login']);
					}, 2000);
				},
				error: (err: HttpErrorResponse) => {
					this.errorMessage = this.getRegisterErrorMessage(err);
					this.isSubmitting = false;
					this.cd.detectChanges();
				},
				complete: () => {
					this.isSubmitting = false;
					this.cd.detectChanges();
				}
			});
	}
}