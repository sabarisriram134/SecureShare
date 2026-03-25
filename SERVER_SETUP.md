# SecureShare Server Status & Access Guide

## ✅ SERVERS RUNNING

### Backend Server
- **Status**: ✅ Running
- **Port**: 5001
- **URL**: http://localhost:5001
- **API**: Available at http://localhost:5001/auth/login
- **Process**: Node.js Express server
- **Database**: Connected (MongoDB local or demo mode)

### Frontend Server  
- **Status**: ✅ Running
- **Port**: 5176
- **URL**: http://localhost:5176
- **Framework**: Vite + React

---

## 🌐 HOW TO ACCESS

### Open Your Browser
Click the link below or copy to your browser address bar:

```
http://localhost:5176
```

### What You'll See
- SecureShare login page
- Register page
- Dashboard after login

---

## 🔧 TROUBLESHOOTING THE LOGIN ERROR

### Error You Were Getting
```
Login failed: AxiosError {message: 'Network Error', code: 'ERR_NETWORK'}
POST http://localhost:5001/auth/login net::ERR_CONNECTION_REFUSED
```

### Why It Happened
❌ Backend server (port 5001) was not running

### How We Fixed It
✅ Started backend server with: `npm start` (in backend directory)
✅ Started frontend server with: `npm run dev` (in frontend directory)
✅ Backend is now listening on port 5001
✅ Frontend is now accessible on port 5176

---

## 📝 TEST LOGIN

### Demo Credentials (if database has demo users)
```
Email: demo@example.com
Password: demo123
```

### If No Demo Users Exist
You can:
1. Register a new account on the frontend
2. Or use the test scripts in `/backend` directory

---

## 🛠️ TERMINAL COMMANDS

If you need to restart servers:

### Restart Backend
```powershell
cd D:\SecureShare\backend
npm start
```

### Restart Frontend
```powershell
cd D:\SecureShare\frontend
npm run dev
```

---

## 🔌 NETWORK CONNECTIVITY

Check if services are running:

```powershell
# Check Backend (port 5001)
netstat -ano | findstr :5001

# Check Frontend (port 5176)
netstat -ano | findstr :5176

# Test Backend API
Invoke-WebRequest http://localhost:5001/ -UseBasicParsing
```

---

## 📊 RUNNING PROCESSES

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Backend API | 5001 | ✅ Running | http://localhost:5001 |
| Frontend | 5176 | ✅ Running | http://localhost:5176 |
| MongoDB | 27017 | ✅ Available | localhost:27017 |

---

## ⚠️ IF YOU STILL GET CONNECTION ERRORS

### Step 1: Check Backend Logs
Look at the backend terminal output for error messages

### Step 2: Verify MongoDB
If backend shows DB connection errors, MongoDB might not be running:
```powershell
docker ps
docker run -d --name secureshare-mongo -p 27017:27017 mongo:latest
```

### Step 3: Check Firewall
Ensure Windows Firewall is not blocking ports 5001 and 5176

### Step 4: Restart Services
```powershell
# Kill backend process
Stop-Process -Port 5001

# Kill frontend process  
Stop-Process -Port 5176

# Restart both
cd D:\SecureShare\backend && npm start
cd D:\SecureShare\frontend && npm run dev
```

---

## 🔐 API ENDPOINTS

Once backend is running, these endpoints are available:

```
POST   /auth/login         - User login
POST   /auth/register      - User registration
POST   /auth/logout        - User logout
POST   /files/upload       - Upload file
GET    /files/download/:id - Download file
POST   /tactical/*         - Tactical share endpoints
```

---

## ✅ NEXT STEPS

1. **Open Browser**: Go to http://localhost:5176
2. **Login**: Use existing credentials or register
3. **Test Features**: Upload files, test tactical store, etc.

---

*Setup Completed - March 9, 2026*
*Backend: Port 5001 ✅ | Frontend: Port 5176 ✅*
