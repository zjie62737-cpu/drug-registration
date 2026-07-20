# Drug Registration Simulation Platform
# 药品注册审评模拟平台

A full-stack web application simulating drug registration processes for NMPA (China), FDA (US), and EMA (EU).

## 🚀 Quick Start (Development)

```bash
# Install all dependencies
npm run install:all

# Initialize database & seed data
npm run db:migrate

# Start both servers
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## 🏭 Production Deployment

### Option 1: Render (Free - Recommended)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name**: `drug-registration`
   - **Runtime**: Node
   - **Build Command**: `npm run install:all && npm run build && cd server && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `bash start.sh`
   - **Region**: Singapore
5. Add Environment Variable: `NODE_ENV` = `production`
6. Deploy!

### Option 2: Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Railway auto-detects Node.js. Set:
   - **Build Command**: `npm run install:all && npm run build && cd server && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `bash start.sh`

### Option 3: Local Production Test

```bash
npm run build     # Build React frontend
npm run start     # Start production server on port 3001
# Open http://localhost:3001
```

## 📋 Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Reviewer (NMPA) | reviewer1 | reviewer123 |
| Reviewer (FDA) | fda_reviewer | fda123 |
| Reviewer (EMA) | ema_reviewer | ema123 |
| Approver | approver1 | approver123 |
| Applicant | applicant1 | applicant123 |

## 📁 Project Structure

```
drug-registration/
├── client/          # React + TypeScript + Ant Design frontend
├── server/          # Express + Prisma + SQLite backend
├── sample-data/     # Sample drug registration documents for simulation
└── start.sh         # Production startup script
```

## 🏛️ Regulatory Systems

- 🇨🇳 **NMPA**: 12-stage review, CTD modules, chemical drug classification 1-5
- 🇺🇸 **FDA**: IND/NDA/BLA/ANDA, PDUFA timelines, ESG submission
- 🇪🇺 **EMA**: CP/DCP/MRP/INP procedures, CHMP assessment, EU legislation
