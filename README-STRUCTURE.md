# PUP CpE Thesis Management Portal

A comprehensive thesis management system for the PUP College of Engineering Digital Archive.

## Project Structure

```
Thesis-Management/
├── frontend/                  # React + Vite frontend application
│   ├── src/
│   │   ├── main.tsx          # Main application logic
│   │   ├── index.css         # Styling
│   │   └── App.tsx           # Root React component
│   ├── index.html            # Entry HTML file
│   ├── package.json          # Frontend dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   └── vite.config.ts        # Vite configuration
│
├── backend/                   # Express.js backend API
│   ├── src/
│   │   └── server.ts         # Express server setup
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript configuration
│
├── package.json              # Root workspace configuration
└── README.md                 # This file
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript linter

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled backend
- `npm run lint` - Run TypeScript linter

## Features

### Dashboard (Archival Focus)
- **Archive Overview**: View total archived theses with metrics
- **Theses by Batch (Year)**: Track graduation batches
- **Theses by Section (Block)**: Organize by academic sections
- **Digital Repository**: Search and view archived records

### Archive Management (Admin Only)
- Add new thesis records to the archive
- Classify by research type (Software/Hardware/Both)
- Categorize by research topic
- Manage author information and academic advisers

### Authentication
- Guest access to view archived theses
- Admin-only authentication for archiving operations
- Valid admin credentials: `admin`, `thesis_head`, `coordinator`

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite 6** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vanilla JavaScript** - Logic for dashboard interactions

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Node.js** - Runtime environment

## Environment Variables

Create `.env` files in frontend and backend directories:

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

## Database Integration

The system is designed to work with thesis data using these SQL queries:

```sql
-- Total archived theses
SELECT COUNT(*) FROM theses;

-- Theses by batch year
SELECT COUNT(DISTINCT batch_year) FROM theses;

-- Theses by section
SELECT COUNT(DISTINCT section) FROM theses;

-- Theses by research type
SELECT research_type, COUNT(*) FROM theses GROUP BY research_type;
```

## Contributing

1. Create a new branch for your feature
2. Make your changes in frontend or backend
3. Test thoroughly
4. Submit a pull request

## License

PUP - Proprietary

## Support

For questions or issues, contact the thesis management team.
