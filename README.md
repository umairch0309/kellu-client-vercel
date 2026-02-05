# Kellu Client - Business Management Platform

A robust, mobile-responsive Next.js application for managing business operations including jobs, scheduling, clients, invoices, expenses, team members, and analytics.

## Features

- 📊 **Dashboard** - Overview of analytics and KPIs
- 📅 **Schedule** - Daily, weekly, and monthly calendar views
- 👥 **Clients** - Complete client management system
- 📋 **Workorders** - Job management with quotes, invoices, and status tracking
- 💰 **Quotes & Invoices** - Financial document management
- ✅ **Tasks** - Task assignment and tracking
- 💵 **Expenses** - Expense tracking and management
- ⚙️ **Settings** - Company settings, templates, reminders, team, and services

## Color Palette

- **Primary (Sapphire)**: `#2B50AA` - UI structure & navigation
- **Secondary (Tropical Teal)**: `#28AFB0` - Brand & actions
- **Tertiary (Amethyst Smoke)**: `#B084CC` - Support & personality
- **Neutral Dark (Charcoal Brown)**: `#1F271B` - Text & contrast
- **Neutral Light (Platinum)**: `#EAEBED` - Backgrounds

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
kellu-client/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home/Dashboard page
│   ├── schedule/          # Schedule page
│   ├── clients/           # Clients page
│   ├── workorders/        # Workorders page
│   ├── quotes/            # Quotes page
│   ├── invoices/          # Invoices page
│   ├── tasks/             # Tasks page
│   ├── expenses/          # Expenses page
│   └── settings/          # Settings page
├── components/             # React components
│   ├── Layout.tsx         # Main layout wrapper
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Header.tsx         # Top header
│   ├── Dashboard.tsx     # Dashboard component
│   └── ...                # Other page components
├── data/                  # Mock data
│   └── mockData.ts        # Static data for UI
└── public/                # Static assets
```

## Mobile Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

Key responsive features:
- Collapsible sidebar navigation on mobile
- Responsive tables with horizontal scroll
- Adaptive grid layouts
- Touch-friendly buttons and interactions
- Mobile-optimized forms and inputs

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: React Icons (Feather Icons)
- **Date Handling**: date-fns

## Notes

- This is a UI-only implementation with static data
- All data is stored in `data/mockData.ts`
- No backend integration is included
- Forms are functional but don't persist data

## License

Private project - All rights reserved

