# 🚀 Complete Project Setup & Run Guide

## 📋 Prerequisites
- Node.js (version 14 or higher)
- MongoDB installed on your system
- Git (optional)

---

## 🗄️ Step 1: Install MongoDB Database

### Option A: MongoDB Community Server (Recommended)

#### 1.1 Download MongoDB
- Go to: https://www.mongodb.com/try/download/community
- Select:
  - **Version**: Latest (7.0 or higher)
  - **Platform**: Windows
  - **Package**: msi
- Click **Download**

#### 1.2 Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. Check **"Install MongoDB as a Service"**
4. Check **"Install MongoDB Compass"** (GUI tool)
5. Click **Install**

#### 1.3 Start MongoDB Service
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

#### 1.4 Verify Installation
```bash
# Check MongoDB version
mongod --version

# Connect to MongoDB
mongo
```

### Option B: Docker (Alternative)

```bash
# Install Docker Desktop first
# Then run:
docker pull mongo
docker run --name apartment-mongodb -p 27017:27017 -d mongo
```

---

## 🔧 Step 2: Setup Backend Server

#### 2.1 Navigate to Backend Folder
```bash
cd d:/react_apartment_managment-main/backend
```

#### 2.2 Install Backend Dependencies
```bash
npm install
```

#### 2.3 Start Backend Server
```bash
# For development (auto-restart on changes)
npm run dev

# OR for production
npm start
```

**Backend will start at: http://localhost:5000**

#### 2.4 Verify Backend is Working
Open browser and go to: http://localhost:5000/api/health

You should see:
```json
{
  "status": "OK",
  "message": "Apartment Management API is running",
  "database": "Connected"
}
```

---

## 🎨 Step 3: Setup Frontend Application

#### 3.1 Open New Terminal Window
Keep the backend running in the first terminal, open a new terminal.

#### 3.2 Navigate to Main Project Folder
```bash
cd d:/react_apartment_managment-main
```

#### 3.3 Install Frontend Dependencies
```bash
npm install
```

#### 3.4 Start Frontend Application
```bash
npm start
```

**Frontend will start at: http://localhost:3000**

---

## 🎯 Step 4: Test the Complete System

#### 4.1 Access the Application
Open your browser and go to: **http://localhost:3000**

#### 4.2 Admin Login
- **Email**: admin@gmail.com
- **Password**: admin@1234

#### 4.3 Test All Features
1. **Dashboard** - View statistics and quick access
2. **Report Issues** - Create maintenance requests
3. **Book Amenities** - Reserve gym, pool, meeting rooms
4. **Community Polls** - Vote on community decisions (admin can create)
5. **Maintenance Fees** - View and pay fees
6. **Apartments** - Manage units (admin only)
7. **Tenants** - Manage residents (admin only)
8. **Payments** - Track rent and payments (admin only)

---

## 🔄 Step 5: Verify Data Flow

### Test User → Admin Data Flow:
1. **Login as regular user** (register new account)
2. **Report an issue** - Creates maintenance request
3. **Login as admin** - See the issue in admin dashboard
4. **Update issue status** - Change from "Open" to "In Progress"
5. **Login as user** - See the updated status

### Test Booking System:
1. **User books amenity** - Creates pending booking
2. **Admin sees booking** - In amenities section
3. **Admin approves booking** - Changes status to "Confirmed"
4. **User sees confirmation** - Booking status updated

---

## 📱 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend App** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:5000/api | API endpoints |
| **Health Check** | http://localhost:5000/api/health | Server status |
| **Database** | mongodb://localhost:27017 | MongoDB connection |

---

## 🛠️ Troubleshooting

### Common Issues & Solutions:

#### 1. MongoDB Not Starting
```bash
# Stop and restart MongoDB service
net stop MongoDB
net start MongoDB

# Check service status
sc query MongoDB
```

#### 2. Backend Connection Error
- Ensure MongoDB is running
- Check backend terminal for error messages
- Verify port 5000 is not in use

#### 3. Frontend Not Loading
- Check if backend is running on port 5000
- Verify port 3000 is available
- Check browser console for errors

#### 4. Database Connection Failed
```bash
# Test MongoDB connection
mongo
use apartment_management
show collections
```

#### 5. Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

---

## 🎮 Quick Start Commands

### One-Time Setup:
```bash
# 1. Install MongoDB (from website)
# 2. Start MongoDB service
net start MongoDB

# 3. Setup backend
cd d:/react_apartment_managment-main/backend
npm install
npm run dev

# 4. Setup frontend (new terminal)
cd d:/react_apartment_managment-main
npm install
npm start
```

### Daily Usage:
```bash
# Terminal 1: Start MongoDB
net start MongoDB

# Terminal 2: Start backend
cd d:/react_apartment_managment-main/backend
npm run dev

# Terminal 3: Start frontend
cd d:/react_apartment_managment-main
npm start
```

---

## 🎉 Success Indicators

Your system is working correctly when you see:

✅ **MongoDB service running**  
✅ **Backend server responds** at http://localhost:5000/api/health  
✅ **Frontend loads** at http://localhost:3000  
✅ **Admin login works** (admin@gmail.com / admin@1234)  
✅ **Data persists** between page refreshes  
✅ **User → Admin data flow** works properly  

---

## 📞 Need Help?

If you encounter issues:

1. **Check MongoDB**: Ensure service is running
2. **Check Backend**: Look at terminal error messages
3. **Check Frontend**: Open browser developer console
4. **Check Ports**: Ensure 27017, 5000, 3000 are available
5. **Restart Services**: Stop and restart all services

**Your complete Apartment Management System with MongoDB is now ready!** 🚀
