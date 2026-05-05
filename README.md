# PrintID Pro

**Student ID Card Management & Print Shop Platform**

PrintID Pro digitizes and streamlines the student ID card lifecycle — from data submission by schools to final card production at print shops.

## Features

- **Attractive Landing Page** with institution registration and admin login
- **Print Shop Admin Dashboard** — full control over institutions, orders, designs, and templates
- **Institution Onboarding** — send registration links; institutions register with all details
- **Student Data Collection** — institution members fill in student details (name, photo, class, father's name, blood group, etc.)
- **Review & Finalize Workflow** — institution admin reviews data, finalizes for printing
- **Real-time Notifications** — print shop gets alerts when ID cards are finalized
- **CSV Export + Photos** — download student data as CSV with photos in a sequenced folder (ZIP)
- **Design Upload & Preview** — upload custom ID card designs, preview in horizontal/vertical format
- **Template Selection** — institutions choose from built-in templates (horizontal/vertical) with live preview
- **Role-Based Access** — Print Shop Admin, Institution Admin, Institution Member

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| File Storage | Local filesystem (Docker volumes) |
| Containerization | Docker + Docker Compose |

## Quick Start with Docker

```bash
# Clone the repository
git clone <repo-url>
cd printid-pro

# Start all services
docker-compose up --build

# Seed the database (run once)
docker exec printid-backend node src/utils/seed.js
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: localhost:27017

### Default Admin Credentials
- **Email**: admin@printidpro.com
- **Password**: admin123

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- MongoDB running locally or via connection string

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit with your MongoDB URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Seed Database
```bash
cd backend
npm run seed
```

## Project Structure

```
printid-pro/
├── frontend/                # Next.js 14 application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── auth/        # Login & Registration
│   │   │   ├── admin/       # Print Shop Admin pages
│   │   │   └── institution/ # Institution pages
│   │   ├── components/      # Reusable UI components
│   │   └── lib/             # API client, store, utilities
│   └── Dockerfile
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & upload middleware
│   │   └── config/          # DB config & constants
│   └── Dockerfile
├── docker-compose.yml       # Full stack orchestration
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/register/institution` — Register institution
- `GET /api/auth/me` — Get current user

### Institutions
- `GET /api/institutions` — List (admin only)
- `POST /api/institutions` — Create & get registration link
- `PUT /api/institutions/:id` — Update
- `POST /api/institutions/:id/logo` — Upload logo
- `POST /api/institutions/:id/signature` — Upload principal signature
- `POST /api/institutions/:id/members` — Add team member

### Students
- `GET /api/students` — List (filtered by role)
- `POST /api/students` — Create student record
- `PUT /api/students/:id` — Update
- `POST /api/students/:id/photo` — Upload photo
- `PUT /api/students/:id/submit` — Submit for review
- `PUT /api/students/:id/review` — Mark as reviewed
- `POST /api/students/finalize` — Finalize for printing

### Batches
- `GET /api/batches` — List print batches
- `GET /api/batches/:id` — Get batch details
- `PUT /api/batches/:id/status` — Update batch status
- `GET /api/batches/:id/export/csv` — Download CSV
- `GET /api/batches/:id/export/zip` — Download ZIP (CSV + Photos)

### Templates & Designs
- `GET /api/templates` — List templates
- `POST /api/templates` — Create template
- `GET /api/designs` — List designs
- `POST /api/designs` — Upload design

## Workflow

1. **Print Shop Admin** onboards an institution → generates registration link
2. **Institution** uses the link to register with full details
3. **Institution Members** collect student data via forms (name, photo, class, etc.)
4. **Institution Admin** reviews student records and finalizes for print
5. **Print Shop** receives notification → downloads CSV + photos → prints ID cards
