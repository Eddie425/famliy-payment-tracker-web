# Family Payment Tracker - Frontend

React + TypeScript + Vite frontend application for the Family Payment Tracker system.

## 🚀 Features

- **Dashboard**: View payment statistics and progress
- **Viewer Mode**: View payment list and mark installments as paid (coming soon)
- **Admin Panel**: Manage debts and installments (coming soon)
- **Dark Theme**: Modern fintech-inspired dark UI
- **Responsive Design**: Works on desktop and mobile

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running on http://localhost:8080

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at: http://localhost:3000

### 3. Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## 🔗 Backend Connection

The frontend is configured to connect to the backend API at:
- Development: `http://localhost:8080` (via Vite proxy)
- Production: Set `VITE_API_BASE_URL` environment variable

## 📁 Project Structure

```
src/
├── components/     # Reusable components
│   └── Layout.tsx  # Main layout with navigation
├── pages/          # Page components
│   ├── Dashboard.tsx
│   ├── Admin.tsx
│   └── Viewer.tsx
├── services/       # API services
│   └── api.ts      # Axios configuration
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

## 🔄 API Integration

The frontend connects to the backend API endpoints:

- `GET /api/dashboard/summary` - Dashboard statistics
- `GET /api/admin/debts` - List debts (coming soon)
- `POST /api/admin/debts` - Create debt (coming soon)
- `PUT /api/installments/{id}/paid` - Mark as paid (coming soon)

## 📝 Development Notes

- The app uses a dark theme with fintech-inspired design
- API calls are proxied through Vite in development
- All API calls go through the `api.ts` service for consistent error handling

## 🚧 Coming Soon

- Complete Admin panel functionality
- Viewer mode with payment list
- Payment marking functionality
- Debt creation and management
- Installment adjustment features
