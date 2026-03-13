# 🚀 Quick Start Guide - Meeting Room Booking System

## Step 1: Start the Backend

1. Navigate to the backend directory:
```bash
cd backend/MeetingRoomBookingApi
```

2. Run the backend:
```bash
dotnet run
```

The backend should start on `https://localhost:5260`

## Step 2: Start the Frontend

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend/meeting-room-ui
```

2. Install dependencies (first time only):
```bash
npm install
```

3. Start the Angular development server:
```bash
npm start
```

The application will open at `http://localhost:4200`

## Step 3: Use the Application

### Create an Account
1. Navigate to `http://localhost:4200` (redirects to `/login`)
2. Click "Create Account" link
3. Fill in:
   - Full Name
   - Email Address
   - Password
4. Click "Create Account"
5. You'll be redirected to login page

### Login
1. Enter your email and password
2. Click "Sign In"
3. You'll be redirected to the Rooms page

### Browse and Book Rooms
1. On the Rooms page, you'll see all available meeting rooms
2. Each card shows:
   - Room Name
   - Capacity
   - Location
3. Click "Book This Room" on any room

### Make a Booking
1. Select Start Date & Time
2. Select End Date & Time
3. Click "Confirm Booking"
4. You'll be redirected to "My Bookings" page

### View Your Bookings
1. Click "My Bookings" in the navbar
2. See all your bookings in a table format
3. View booking details including duration

### Logout
1. Click "Logout" button in the navbar
2. You'll be redirected to the login page

## 🎨 Key Features

✅ Modern gradient UI design  
✅ Fully responsive (mobile, tablet, desktop)  
✅ Real-time form validation  
✅ Loading spinners  
✅ Error messages  
✅ Success notifications  
✅ Duration calculation  
✅ Bootstrap 5 styling  
✅ Bootstrap Icons  

## 🔧 Troubleshooting

### Backend Not Running
**Error**: "Failed to fetch" or connection errors  
**Solution**: Make sure the backend is running on `https://localhost:5260`

### CORS Errors
**Error**: CORS policy blocking requests  
**Solution**: Check that the backend has CORS configured for `http://localhost:4200`

### Port Already in Use
**Error**: Port 4200 is already in use  
**Solution**: 
```bash
# On Windows:
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Or run on different port:
ng serve --port 4201
```

### Database Not Initialized
**Error**: Database connection errors  
**Solution**: Make sure SQL Server is running and migrations are applied

## 📦 Project Structure

```
Meeting-Room-Booking-System/
│
├── backend/
│   └── MeetingRoomBookingApi/
│       ├── Controllers/
│       ├── Models/
│       ├── Data/
│       └── Program.cs
│
├── frontend/
│   └── meeting-room-ui/
│       └── src/
│           └── app/
│               ├── components/
│               │   ├── login/
│               │   ├── register/
│               │   ├── rooms/
│               │   ├── book-room/
│               │   └── bookings/
│               └── services/
│                   └── api.service.ts
│
└── database/
    └── schema.sql
```

## 🌐 URLs

- **Frontend**: http://localhost:4200
- **Backend API**: https://localhost:5260/api
- **Swagger**: https://localhost:5260/swagger (if enabled)

## 📱 Test Data

After registration, you can test with:
- Create multiple room bookings
- View different time slots
- Check booking durations
- Test responsive design on different screen sizes

## 🎯 Default Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/login` |
| `/login` | Login page |
| `/register` | Registration page |
| `/rooms` | Meeting rooms list (requires login) |
| `/book-room/:id` | Book specific room (requires login) |
| `/bookings` | User's bookings (requires login) |

## ✨ Tips

1. **Keep Backend Running**: Always start backend before frontend
2. **Check Console**: Use browser DevTools (F12) to see API requests
3. **Responsive Testing**: Use DevTools to test mobile/tablet views
4. **Error Messages**: Read error alerts for helpful information
5. **LocalStorage**: UserId is stored in localStorage after login

## 🆘 Need Help?

1. Check browser console for errors (F12)
2. Check backend terminal for API errors
3. Verify both servers are running
4. Check network requests in DevTools
5. Ensure database is accessible

---

**Enjoy using the Meeting Room Booking System! 🎉**
