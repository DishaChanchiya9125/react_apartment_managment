# MongoDB Database Setup Guide

## 📋 Overview
This guide will help you set up MongoDB database on your local machine for the Apartment Management System.

## 🚀 Step-by-Step MongoDB Installation

### Method 1: MongoDB Community Server (Recommended)

#### 1. Download MongoDB
- Go to: https://www.mongodb.com/try/download/community
- Select:
  - **Version**: Latest (7.0 or higher)
  - **Platform**: Windows
  - **Package**: msi
- Click **Download**

#### 2. Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. Check **"Install MongoDB as a Service"**
4. Check **"Install MongoDB Compass"** (GUI tool)
5. Click **Install**

#### 3. Start MongoDB Service
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

#### 4. Verify Installation
```bash
# Check MongoDB version
mongod --version

# Connect to MongoDB
mongo
```

### Method 2: Using Docker (Alternative)

#### 1. Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop/

#### 2. Run MongoDB Container
```bash
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run --name apartment-mongodb -p 27017:27017 -d mongo
```

## 🗄️ Database Setup

### 1. Create Database
The database will be created automatically when you start the backend server. Database name: `apartment_management`

### 2. Verify Database Connection
```bash
# Connect to MongoDB shell
mongo

# Switch to your database
use apartment_management

# Show collections
show collections
```

## 🔧 Backend Setup

### 1. Install Backend Dependencies
```bash
cd d:/react_apartment_managment-main/backend
npm install
```

### 2. Environment Configuration
The `.env` file is already configured:
```
MONGODB_URI=mongodb://localhost:27017/apartment_management
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin@1234
FRONTEND_URL=http://localhost:3000
```

### 3. Start Backend Server
```bash
# For development
npm run dev

# For production
npm start
```

The server will start at: **http://localhost:5000**

## 🧪 Test Database Connection

### 1. Health Check
Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Apartment Management API is running",
  "database": "Connected"
}
```

### 2. Test API Endpoints
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Test login (admin)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin@1234"}'
```

## 🏠 Frontend Integration

### 1. Update Frontend API Configuration
The frontend will automatically connect to the backend at `http://localhost:5000`

### 2. Start Frontend
```bash
cd d:/react_apartment_managment-main
npm start
```

## 📊 Database Collections

The following collections will be created automatically:

### 1. **users**
- User authentication and profiles
- Admin and user roles
- Login credentials

### 2. **apartments**
- Apartment information
- Unit details, rent, status
- Tenant assignments

### 3. **maintenance**
- Maintenance requests
- Issue tracking and status
- Priority levels

### 4. **amenitybookings**
- Amenity reservations
- Booking status and approvals
- Time slot management

### 5. **communitypolls**
- Community voting
- Poll questions and options
- Vote tracking

### 6. **payments**
- Rent and fee payments
- Payment status and history
- Invoice management

## 🔍 MongoDB Compass (GUI Tool)

### 1. Open MongoDB Compass
- Install during MongoDB setup or download separately
- Connect with: `mongodb://localhost:27017`

### 2. View Database
- Select `apartment_management` database
- Browse all collections
- View and edit data directly

## 🚨 Troubleshooting

### Common Issues:

#### 1. MongoDB Service Not Starting
```bash
# Stop service
net stop MongoDB

# Start service
net start MongoDB

# Check service status
sc query MongoDB
```

#### 2. Port Already in Use
```bash
# Check what's using port 27017
netstat -ano | findstr :27017

# Kill the process
taskkill /PID <PID> /F
```

#### 3. Connection Refused
- Ensure MongoDB service is running
- Check firewall settings
- Verify MongoDB URI in `.env` file

#### 4. Database Not Created
- Start the backend server first
- Database creates automatically on first connection
- Check server logs for connection status

## 📱 Mobile Access

Once running, you can access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database**: mongodb://localhost:27017

## 🔄 Data Flow

### User → Admin Data Flow:
1. **User creates** maintenance request → Saved in database
2. **Admin views** all requests → Retrieved from database
3. **Admin updates** status → Saved in database
4. **User sees** updated status → Retrieved from database

### Real-time Updates:
- All data changes are instantly saved to MongoDB
- Admin and user see real-time updates
- No data loss on server restart

## 🎯 Next Steps

1. **Install MongoDB** using the steps above
2. **Start backend server**: `cd backend && npm run dev`
3. **Start frontend**: `npm start`
4. **Test with admin login**: admin@gmail.com / admin@1234
5. **Create users** and test all functionality

Your complete apartment management system with MongoDB database is now ready! 🎉
