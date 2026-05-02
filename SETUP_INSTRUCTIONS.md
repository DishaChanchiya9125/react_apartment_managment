# Apartment Management System - Setup Instructions

## Project Overview
This is a complete apartment management system built with React that includes:
- Admin dashboard for managing apartments, tenants, and payments
- User portal for booking amenities and reporting issues
- Authentication system with admin and user roles
- Responsive design with modern UI

## Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Step-by-Step Setup Instructions

### 1. Navigate to Project Directory
```bash
cd d:/react_apartment_managment-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
npm start
```

The application will start and open automatically in your browser at:
**http://localhost:3000**

## Login Credentials

### Admin Access
- **Email**: admin@gmail.com
- **Password**: admin@1234

### User Registration
- Click on "Register" to create a new user account
- Use any email (except admin@gmail.com) and password

## Features Available

### Admin Features (admin@gmail.com)
- **Dashboard**: View statistics, recent payments, and occupancy
- **Apartments**: Manage all apartment units
- **Tenants**: View and manage tenant directory
- **Payments**: Track rent and dues
- **Maintenance**: Manage repair tickets
- **Report Issues**: Handle maintenance requests
- **Book Amenities**: Approve amenity bookings
- **Community Polls**: Manage community decisions
- **Maintenance Fees**: Create and manage invoices

### User Features (regular users)
- **Dashboard**: Personal overview and quick links
- **Report Issues**: Submit maintenance requests
- **Book Amenities**: Reserve gym, pool, and meeting rooms
- **Community Polls**: Vote on community decisions
- **Maintenance Fees**: View and pay dues
- **Settings**: Manage profile

## Key Functionality

### 1. Admin Data Access
- Admin can view all apartments, tenants, and payments
- Admin can approve amenity bookings
- Admin can manage maintenance requests
- Admin can create maintenance fee invoices

### 2. Booking System
- Users can book amenities (gym, pool, meeting rooms)
- Admin can approve/reject bookings
- Real-time status updates

### 3. Payment Tracking
- Rent payment status tracking
- Maintenance fee management
- Payment history and reports

## Troubleshooting

### If the app doesn't start:
1. Make sure Node.js is installed (run `node --version`)
2. Check if port 3000 is available
3. Try stopping the process and running `npm start` again

### If you see errors:
1. Run `npm install` again to ensure all dependencies are installed
2. Clear browser cache and reload the page

### Common Issues:
- **Port already in use**: The app will automatically try the next available port (3001, 3002, etc.)
- **Dependencies not found**: Run `npm install` to install missing packages
- **Login not working**: Make sure you're using the exact admin credentials shown above

## Project Structure
```
src/
├── auth/           # Authentication system
├── components/     # Reusable UI components
├── data/          # Mock data and utilities
├── pages/         # Page components
└── App.js         # Main app with routing
```

## Support
If you encounter any issues:
1. Check the browser console for error messages
2. Ensure all dependencies are installed
3. Verify you're using the correct login credentials

The application is now ready to use with all functionality working properly!
