import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Booking } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-bookings',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterLink],
	templateUrl: './bookings.html',
	styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
	bookings: Booking[] = [];
	searchTerm = '';
	searchDate = '';
	isLoading = false;
	isCancelling = false;
	errorMessage = '';
	successMessage = '';

	constructor(
		private readonly api: ApiService,
		private readonly auth: AuthService,
		private readonly cd: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadBookings();
	}

	get isAdmin(): boolean {
		return this.auth.isAdmin();
	}

	get filteredBookings(): Booking[] {
		if (!this.isAdmin) {
			return this.bookings;
		}

		const term = this.searchTerm.trim().toLowerCase();
		const hasDateFilter = this.searchDate.trim().length > 0;

		if (!term && !hasDateFilter) {
			return this.bookings;
		}

		let selectedDayStart: Date | null = null;
		let selectedDayEnd: Date | null = null;
		if (hasDateFilter) {
			const parts = this.searchDate.split('-').map((x) => Number(x));
			if (parts.length === 3) {
				selectedDayStart = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
				selectedDayEnd = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
			}
		}

		return this.bookings.filter((booking) => {
			const roomName = (booking.room?.name || `room ${booking.roomId}`).toLowerCase();
			const location = (booking.room?.location || '').toLowerCase();
			const bookedBy = (booking.user?.name || `user ${booking.userId}`).toLowerCase();
			const bookingId = String(booking.id);
			const textMatch = !term
				|| roomName.includes(term)
				|| location.includes(term)
				|| bookedBy.includes(term)
				|| bookingId.includes(term);

			let dateMatch = true;
			if (selectedDayStart !== null && selectedDayEnd !== null) {
				const bookingStart = new Date(booking.startTime);
				const bookingEnd = new Date(booking.endTime);
				dateMatch = bookingStart <= selectedDayEnd && bookingEnd >= selectedDayStart;
			}

			return textMatch && dateMatch;
		});
	}

	loadBookings(): void {
		this.isLoading = true;
		this.errorMessage = '';
		this.successMessage = '';
		this.searchTerm = '';
		this.searchDate = '';
		const userId = this.auth.getUserId();

		if (!this.auth.isAdmin() && userId === null) {
			this.errorMessage = 'User session expired. Please sign in again.';
			this.isLoading = false;
			this.cd.detectChanges();
			return;
		}

		const request = this.auth.isAdmin()
			? this.api.getAllBookings()
			: this.api.getMyBookings(userId as number);

		request.subscribe({
			next: (res: Booking[]) => {
				this.bookings = res;
				this.isLoading = false;
				this.cd.detectChanges();
			},
			error: (err: { error?: string }) => {
				this.errorMessage = typeof err.error === 'string'
					? err.error
					: 'Failed to load bookings.';
				this.isLoading = false;
				this.cd.detectChanges();
			}
		});
	}

	canCancelBooking(booking: Booking): boolean {
		const userId = this.auth.getUserId();

		if (this.auth.isAdmin()) {
			return true;
		}

		return userId !== null && booking.userId === userId;
	}

	cancelBooking(booking: Booking): void {
		if (!this.canCancelBooking(booking) || this.isCancelling) {
			return;
		}

		const isConfirmed = window.confirm('Cancel this booking and release the room?');
		if (!isConfirmed) {
			return;
		}

		this.isCancelling = true;
		this.errorMessage = '';
		this.successMessage = '';

		this.api.cancelBooking(booking.id).subscribe({
			next: () => {
				const roomName = booking.room?.name || `Room ${booking.roomId}`;
				const employeeName = booking.user?.name || `User ${booking.userId}`;
				this.successMessage = this.auth.isAdmin()
					? `Booking for ${roomName} (${employeeName}) has been cancelled.`
					: `Your booking for ${roomName} has been cancelled.`;
				this.cd.detectChanges();
				
				setTimeout(() => {
					this.bookings = this.bookings.filter((x) => x.id !== booking.id);
            		this.successMessage = '';
					this.isCancelling = false;
					this.cd.detectChanges();
				}, 2000);
			},
			error: (err: { error?: string }) => {
				this.errorMessage = typeof err.error === 'string'
					? err.error
					: 'Unable to cancel booking.';
				this.isCancelling = false;
				this.cd.detectChanges();
			}
		});
	}

	get pageTitle(): string {
		return this.auth.isAdmin() ? 'All Bookings' : 'My Bookings';
	}

	get pageSubtitle(): string {
		return this.auth.isAdmin()
			? 'Monitor every reservation across all users'
			: 'View and manage your room reservations';
	}

	// formatDateTime(dateTime: string): string {
	// 	if (!dateTime) return '';
	// 	const date = new Date(dateTime);
	// 	// return date.toLocaleString('en-US', {
	// 	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	// 	// return date.toLocaleString('en-IN', {
	// 	return localDate.toLocaleString('en-IN', {

	// 		year: 'numeric',
	// 		month: 'short',
	// 		day: 'numeric',
	// 		hour: '2-digit',
	// 		minute: '2-digit',
	// 		hour12: true,
	// 		// timeZone: 'UTC'
	// 	});
	// }
  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';

    // 1. Convert the ISO string to a JavaScript Date object.
    // The browser automatically converts UTC to your Local Time (IST).
    const date = new Date(dateTime);

    // 2. Format for display using Indian English standards.
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
        // Do NOT use timeZone: 'UTC' here; we want Local Time!
    });
}

	calculateDuration(startTime: string, endTime: string): string {
		const start = new Date(startTime);
		const end = new Date(endTime);
		const diffMs = end.getTime() - start.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		
		if (diffHours > 0) {
			return `${diffHours}h ${diffMinutes}m`;
		}
		return `${diffMinutes}m`;
	}

	getBookingStatus(booking: Booking): 'Past' | 'Ongoing' | 'Upcoming' {
		const now = new Date();
		const start = new Date(booking.startTime);
		const end = new Date(booking.endTime);

		if (now < start) {
			return 'Upcoming';
		}

		if (now >= start && now <= end) {
			return 'Ongoing';
		}

		return 'Past';
	}

	getBookingStatusClass(booking: Booking): string {
		const status = this.getBookingStatus(booking);
		if (status === 'Ongoing') {
			return 'bg-success';
		}

		if (status === 'Upcoming') {
			return 'bg-warning text-dark';
		}

		return 'bg-secondary';
	}
}
