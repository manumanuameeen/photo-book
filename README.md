# Photo-Book Platform

A comprehensive platform for photographers and clients, featuring booking systems, rental management, and a robust admin dashboard.

## 🚀 Tech Stack

- **Frontend**: React, Vite, Vanilla CSS (Premium Custom Design)
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (Mongoose), Redis (BullMQ for messaging)
- **Payments**: Stripe Integration
- **Storage**: AWS S3, Cloudinary
- **Communication**: Socket.io (Real-time chat), Nodemailer

## 📁 Project Structure
a
The project follows a clean architecture with categorized subfolders for better maintainability.

### Backend (`/backend`)
- `src/controller`: Categorized controllers (admin, user, booking, rental).
- `src/services`: Implementation-specific services organized by domain.
- `src/repositories`: Data access layer with Base/Implementation pattern.
- `src/interfaces`: Centralized TypeScript interfaces and enums.
- `src/models`: Mongoose schemas and models.

### Frontend (`/frontend`)
- `src/assets`: Statics and global styles.
- `src/components`: UI components organized by domain.
- `src/interfaces`: Shared interfaces and types.
- `src/services/api`: Categorized API service layer.
- `src/store`: State management (Zustand/Context).

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- MongoDB (Local or Atlas)
- Redis instance

### Local Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Photo-book
   ```

2. **Setup Environment Variables**
   - Create a `.env` file in `/backend` using `/backend/.env.example` as a template.
   - Create a `.env` file in `/frontend` using `/frontend/.env.example` as a template.

3. **Install Dependencies**
   ```bash
   # Root
   npm install

   # Backend
   cd backend && npm install

   # Frontend
   cd ../frontend && npm install
   ```

4. **Run with Docker**
   ```bash
   # Using Docker Compose for Development
   docker-compose -f docker-compose.dev.yml up --build
   ```

5. **Run Locally without Docker**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## 🔐 Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | Secret key for auth tokens |
| `STRIPE_SECRET_KEY` | Stripe payment gateway key |
| `CLOUDINARY_URL` | Cloudinary storage configuration |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for backend API |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key |

## 🧪 Development Workflow

- **Backend Build Check**: `cd backend && npx tsc --noEmit`
- **Frontend Build Check**: `cd frontend && npx tsc --noEmit`
- **Linting**: `npm run lint`

## 📄 License
This project is for internal use/demonstration.
