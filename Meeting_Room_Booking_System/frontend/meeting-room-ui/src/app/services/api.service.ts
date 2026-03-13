import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
}

export interface RoomRequest {
  name: string;
  capacity: number;
  location: string;
}

export interface RoomPopularityDto {
  roomName: string;
  bookingCount: number;
}

export interface Booking {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  room?: {
    name: string;
    location: string;
    capacity: number;
  };
  user?: {
    name: string;
    email?: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface CreateBookingRequest {
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:5260/api';

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms`);
  }

  getRoomPopularityReport(): Observable<RoomPopularityDto[]> {
    return this.http.get<RoomPopularityDto[]>(`${this.baseUrl}/rooms/popularity-report`);
  }

  addRoom(payload: RoomRequest): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/rooms`, payload);
  }

  updateRoom(id: number, payload: RoomRequest): Observable<Room> {
    return this.http.put<Room>(`${this.baseUrl}/rooms/${id}`, payload);
  }

  deleteRoom(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/rooms/${id}`);
  }

  addBooking(payload: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, payload);
  }

  cancelBooking(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/bookings/${id}`);
  }

  getMyBookings(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/my/${userId}`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  toggleUserStatus(id: number, clearFutureBookings: boolean): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/disabled/${id}?clearFutureBookings=${clearFutureBookings}`, {});
  }
}
