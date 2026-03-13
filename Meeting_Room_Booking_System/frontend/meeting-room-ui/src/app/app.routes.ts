import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Rooms } from './components/rooms/rooms';
import { BookRoom } from './components/book-room/book-room';
import { Bookings } from './components/bookings/bookings';
import { UsersManagement } from './components/users-management/users-management';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },

	
	// { path: 'login', component: Login },
	// { path: 'register', component: Register },

	// Apply guestGuard here
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: 'register', component: Register, canActivate: [guestGuard] },

	{ path: 'rooms', component: Rooms, canActivate: [authGuard] },
	{ path: 'book-room/:id', component: BookRoom, canActivate: [authGuard] },
	{ path: 'bookings', component: Bookings, canActivate: [authGuard] },
	{ path: 'users', component: UsersManagement, canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] } },

	{ path: '**', redirectTo: 'login' }
];