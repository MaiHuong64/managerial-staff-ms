# Managerial Staff Management System (Hệ thống Quản lý Viên chức)

A full-stack web application for managing personnel records and HR workflows within an organization — including staff planning and appointment approval, modeled after real organizational processes at a university.

## Features

- **Authentication & Authorization** — JWT-based login with role-based access control
- **Staff (Viên chức) Management** — CRUD for staff records, positions (chức danh), and organizational units (đơn vị)
- **Staff Planning (Quy hoạch)** — multi-step planning workflow (Đợt Quy hoạch) with proposal and approval stages
- **Appointment Workflow (Bổ nhiệm)** — multi-step appointment approval process, including:
  - Proposal and approval-in-principle steps
  - Personnel plan with vote-based tie-breaking logic
  - Appointment dossier and appointment decision
- **Classification** — Annual staff performance classification
- **Excel Import/Export**
  - Import staff classification data from Excel
  - Export planning lists to Excel
- **Account Management** — Admin management of user accounts

## Tech Stack

**Backend**
- Node.js, Express.js, TypeScript
- PostgreSQL with raw SQL queries and transactions for multi-step workflows
- JWT authentication
- multer for file uploads, xlsx for Excel import, exceljs for Excel export

**Frontend**
- React, TypeScript, Vite
- Ant Design, Tailwind CSS
- React Router, Axios

## Architecture

The backend follows a module-based, layered architecture. Each business domain is organized as a self-contained module with:

```
modules/<ModuleName>/
  ├── <name>.route.ts        # Express routes
  ├── <name>.controller.ts   # Request/response handling
  ├── <name>.service.ts      # Business logic, transactions
  └── <name>.repository.ts   # Database queries
```

Multi-step workflows (staff planning, appointment approval, Excel import) run inside PostgreSQL transactions to keep related writes atomic and prevent partial state.

## Project Structure

```
managerial-staff-ms/
  ├── client/     # React + Vite frontend
  └── server/     # Express + TypeScript backend
      ├── config/       # DB connection
      ├── middleware/   # Auth middleware, upload handling
      ├── modules/      # Feature modules (see Architecture)
      └── routes/       # Route aggregation
```

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL

### Backend

```bash
cd server
npm install
# create a .env file with your PostgreSQL connection details and JWT_SECRET
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Author

Lê Thị Kim Hương — Information Technology, An Giang University (VNU-HCM)
