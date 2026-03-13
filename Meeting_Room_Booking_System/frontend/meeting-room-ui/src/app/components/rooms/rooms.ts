import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, Room, RoomPopularityDto, RoomRequest } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-rooms',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	templateUrl: './rooms.html',
	styleUrl: './rooms.css'
})
export class Rooms implements OnInit {
	rooms: Room[] = [];
	roomPopularity: RoomPopularityDto[] = [];
	searchTerm = '';
	isLoading = false;
	isStatsLoading = false;
	errorMessage = '';
	successMessage = '';
	isSaving = false;
	editedRoomId: number | null = null;
	roomForm: RoomRequest = {
		name: '',
		capacity: 1,
		location: ''
	};

	constructor(
		private readonly api: ApiService,
		private readonly auth: AuthService,
		private readonly cd: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadRooms();
		this.loadRoomPopularity();
	}

	get isAdmin(): boolean {
		return this.auth.isAdmin();
	}

	private showError(message: string): void {
		this.errorMessage = message;
		this.cd.detectChanges();
		setTimeout(() => {
			this.errorMessage = '';
			this.cd.detectChanges();
		}, 2000);
	}

	get filteredRooms(): Room[] {
		const term = this.searchTerm.trim().toLowerCase();
		if (!term) {
			return this.rooms;
		}

		return this.rooms.filter((room) =>
			room.name.toLowerCase().includes(term) ||
			room.location.toLowerCase().includes(term) ||
			room.capacity.toString().includes(term)
		);
	}

	get totalBookingsCount(): number {
		return this.roomPopularity.reduce((sum, item) => sum + item.bookingCount, 0);
	}

	get mostBookedRoomName(): string {
		if (this.roomPopularity.length === 0 || this.roomPopularity[0].bookingCount === 0) {
			return 'N/A';
		}
		return this.roomPopularity[0].roomName;
	}

	get mostBookedRoomCount(): number {
		if (this.roomPopularity.length === 0) {
			return 0;
		}
		return this.roomPopularity[0].bookingCount;
	}

	loadRoomPopularity(): void {
		if (!this.isAdmin) {
			this.roomPopularity = [];
			return;
		}

		this.isStatsLoading = true;
		this.api.getRoomPopularityReport().subscribe({
			next: (res: RoomPopularityDto[]) => {
				this.roomPopularity = res;
				this.isStatsLoading = false;
				this.cd.detectChanges();
			},
			error: () => {
				this.roomPopularity = [];
				this.isStatsLoading = false;
				this.cd.detectChanges();
			}
		});
	}

	loadRooms(): void {
		this.isLoading = true;
		this.errorMessage = '';
		
		this.api.getRooms().subscribe({
			next: (res: Room[]) => {
				this.rooms = res;
				this.loadRoomPopularity();
				this.isLoading = false;
				this.cd.detectChanges();
			},
			error: (err) => {
				this.showError(`Failed to load rooms: ${err.message || 'Unknown error'}`);
				this.isLoading = false;
			}
		});
	}

	startEdit(room: Room): void {
		if (!this.isAdmin) {
			return;
		}

		this.editedRoomId = room.id;
		this.roomForm = {
			name: room.name,
			capacity: room.capacity,
			location: room.location
		};
		this.errorMessage = '';
		this.successMessage = '';
		
		window.scrollTo({
            top: 350,
            behavior: 'smooth'
        });
	}

	resetForm(): void {
		this.editedRoomId = null;
		this.roomForm = {
			name: '',
			capacity: 1,
			location: ''
		};
	}

	saveRoom(): void {
		if (!this.isAdmin) {
			this.showError('Only Admin can manage rooms.');
			return;
		}

		if (!this.roomForm.name || !this.roomForm.location || this.roomForm.capacity <= 0) {
			this.showError('Please provide valid room name, location, and capacity.');
			return;
		}

		this.isSaving = true;
		this.errorMessage = '';
		this.successMessage = '';

		const request = this.editedRoomId === null
			? this.api.addRoom(this.roomForm)
			: this.api.updateRoom(this.editedRoomId, this.roomForm);

		request.subscribe({
			next: () => {
				this.successMessage = this.editedRoomId === null
					? 'Room added successfully.'
					: 'Room updated successfully.';
				this.resetForm();
				this.loadRooms();
			// FAST AUTO-HIDE (2 Seconds)
            setTimeout(() => {
                this.successMessage = '';
                this.cd.detectChanges();
            }, 2000);
			//
			},

			error: (err: { error?: string }) => {
				this.showError(typeof err.error === 'string'
					? err.error
					: 'Unable to save room.');
				this.isSaving = false;
			},
			complete: () => {
				this.isSaving = false;
				this.cd.detectChanges();
			}
		});
	}

	deleteRoom(roomId: number): void {
		if (!this.isAdmin) {
			this.showError('Only Admin can delete rooms.');
			return;
		}

		this.errorMessage = '';
		this.successMessage = '';

		this.api.deleteRoom(roomId).subscribe({
			next: () => {
				this.successMessage = 'Room deleted successfully.';
				this.loadRooms();
				// FAST AUTO-HIDE (2 Seconds)
            setTimeout(() => {
                this.successMessage = '';
                this.cd.detectChanges();
            }, 2000);
			//
			},
			error: (err: { error?: string }) => {
				this.showError(typeof err.error === 'string'
					? err.error
					: 'Unable to delete room.');
			}
		});
	}
}