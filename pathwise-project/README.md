# PathWise 🎓

A smart personalized learning platform with React frontend and Node.js/Express backend.

## Project Structure

```
pathwise-project/
├── frontend/          # React + Vite app (port 5173)
├── backend/           # Node.js + Express API (port 5000)
├── start.sh           # One-command startup script
└── README.md
```

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

> Install MongoDB: https://www.mongodb.com/docs/manual/installation/

## Setup & Run

### 1. Start MongoDB
Make sure MongoDB is running on your machine:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 2. Install dependencies (first time only)
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 3. Start the app

#### Option A — One script (recommended)
```bash
./start.sh
```

#### Option B — Separate terminals

**Terminal 1 – Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Open in browser
- **App:** http://localhost:5173
- **API:** http://localhost:5000/api/health

## Environment Variables

Backend config is in `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-learning
JWT_SECRET=super_secret_pathwise_key_2024
JWT_EXPIRES_IN=7d
```

## Seed the database (optional)
```bash
cd backend
npm run seed
```

## API Routes
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/subjects | Get subjects |
| POST | /api/path/generate | Generate learning path |
| GET | /api/path/me | Get user's path |
| PUT | /api/progress/:moduleId | Update progress |
