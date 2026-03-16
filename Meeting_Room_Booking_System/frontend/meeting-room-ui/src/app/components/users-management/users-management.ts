import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, User } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css'
})
export class UsersManagement implements OnInit {
  users: User[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  selectedUser: User | null = null;
  showDeactivateModal = false;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err: { error?: string }) => {
        this.errorMessage = typeof err.error === 'string' ? err.error : 'Failed to load users.';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  onToggleUser(user: User): void {
    if (!this.isAdmin || this.isSaving || user.role === 'Admin') {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (user.isActive) {
      this.selectedUser = user;
      this.showDeactivateModal = true;
      this.cd.detectChanges();
      return;
    }

    this.applyToggle(user, false);
  }

  deactivateOnly(): void {
    if (!this.selectedUser) {
      return;
    }

    this.applyToggle(this.selectedUser, false);
    this.closeDeactivateModal();
  }

  deactivateAndClearBookings(): void {
    if (!this.selectedUser) {
      return;
    }

    this.applyToggle(this.selectedUser, true);
    this.closeDeactivateModal();
  }

  closeDeactivateModal(): void {
    this.showDeactivateModal = false;
    this.selectedUser = null;
    this.cd.detectChanges();
  }

  private applyToggle(user: User, clearFutureBookings: boolean): void {
    this.isSaving = true;

    this.api.toggleUserStatus(user.id, clearFutureBookings).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((x) => (x.id === updatedUser.id ? updatedUser : x));
        this.successMessage = updatedUser.isActive
          ? `${updatedUser.name} is active now.`
          : `${updatedUser.name} has been deactivated${clearFutureBookings ? ' and future bookings were removed' : ''}.`;
        this.isSaving = false;
        this.cd.detectChanges();
    //   },
    // 3. AUTO-HIDE: Clear the message after 4 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.cd.detectChanges();
        }, 2000); 
      },
      error: (err: { error?: string }) => {
        this.errorMessage = typeof err.error === 'string' ? err.error : 'Unable to update user status.';
        this.isSaving = false;
        this.cd.detectChanges();
      }
    });
  }
}
