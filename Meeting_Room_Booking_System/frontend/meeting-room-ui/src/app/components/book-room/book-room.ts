import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, User } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-book-room',
	standalone: true,
	imports: [FormsModule, RouterLink],
	templateUrl: './book-room.html',
	styleUrl: './book-room.css'
})
export class BookRoom {
	roomId: number;
	startTime = '';
	endTime = '';
	selectedUserId: number | null = null;
	availableUsers: User[] = [];
	isLoadingUsers = false;
	isSubmitting = false;
	errorMessage = '';
	successMessage = '';

	constructor(
		private readonly route: ActivatedRoute,
		private readonly api: ApiService,
		private readonly router: Router,
		private readonly auth: AuthService,
		private readonly cd: ChangeDetectorRef
	) {
		this.roomId = Number(this.route.snapshot.params['id']);
		this.selectedUserId = this.auth.getUserId();
	}

	ngOnInit(): void {
		if (this.isAdmin) {
			this.loadUsers();
		}
	}

	get isAdmin(): boolean {
		return this.auth.isAdmin();
	}

	get minStartDateTime(): string {
		const now = new Date();
		const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
		return local.toISOString().slice(0, 16);
	}

	get minEndDateTime(): string {
		return this.startTime || this.minStartDateTime;
	}

	loadUsers(): void {
		this.isLoadingUsers = true;
		this.api.getUsers().subscribe({
			next: (res: User[]) => {
				this.availableUsers = res
					.filter((user) => user.isActive)
					.sort((left, right) => left.name.localeCompare(right.name));

				if (this.selectedUserId === null && this.availableUsers.length > 0) {
					this.selectedUserId = this.availableUsers[0].id;
				}

				this.isLoadingUsers = false;
				this.cd.detectChanges();
			},
			error: () => {
				this.errorMessage = 'Unable to load users for admin booking.';
				this.isLoadingUsers = false;
				this.cd.detectChanges();
			}
		});
	}

	book(): void {
		this.errorMessage = '';
		this.successMessage = '';

		if (!this.startTime || !this.endTime) {
			this.errorMessage = 'Please select both start and end times.';
			this.cd.detectChanges();
			return;
		}

    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
		const now = new Date();

		if (start < now) {
			this.errorMessage = 'Start time cannot be in the past.';
			this.cd.detectChanges();
			return;
		}

    if (end <= start) {
        this.errorMessage = 'End time must be after the start time.';
        this.cd.detectChanges();
        return;
    }

		const currentUserId = this.auth.getUserId();
		if (!currentUserId) {
			this.errorMessage = 'User not logged in. Please login again.';
			this.cd.detectChanges();
			return;
		}

		const bookingUserId = this.isAdmin ? this.selectedUserId : currentUserId;
		if (!bookingUserId) {
			this.errorMessage = 'Please select a user for this booking.';
			this.cd.detectChanges();
			return;
		}

		this.isSubmitting = true;

		this.api
			.addBooking({
				roomId: this.roomId,
				userId: bookingUserId,
				startTime: this.startTime,
				endTime: this.endTime
			})
			.subscribe({
				next: () => {
					this.successMessage = 'Room booked successfully! Redirecting...';
					this.cd.detectChanges();
					setTimeout(() => {
						this.router.navigate(['/bookings']);
					}, 1500);
				},
				error: (err) => {
                    // If the backend sent a 400 BadRequest with a message, use it. 
    // Otherwise, use a default fallback.
                    this.errorMessage = err.error?.message || err.error || 'Booking failed. The room may already be booked for this time.';
					
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