# 🇮🇳 SportRise (खेल उत्थान)
### India's Premier Grassroots Sports Event & Athlete Performance Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black.svg?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.14-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.1-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?logo=sqlite)](https://www.sqlite.org/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-Vision%20OCR-8E75B2.svg?logo=google)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

---

## 📌 Executive Overview

**SportRise (खेल उत्थान)** is an enterprise-grade full-stack sports technology platform engineered specifically for the Indian athletic ecosystem. It connects aspiring grassroots athletes from districts and states across India with verified educational institutions, sports academies, and national talent scouts.

The platform bridges grassroots athletic discovery with modern sports analytics by combining:
- **Verified Event Management**: Multi-sport tournament discovery, eligibility tracking, and digital applications.
- **AI-Powered Scorecard OCR**: Automated digitisation of scanned scorecards and match sheets using Google Gemini Vision.
- **Cryptographic Evidence Verification**: SHA-256 evidence hashing and official institutional stamp validation to prevent certificate fraud.
- **Deterministic Multi-Match Athlete Rankings**: Khelo India Youth Games & Sports Authority of India (SAI) benchmarked ranking engine calculating percentile metrics and skill indexes.
- **Production OTP Authentication**: Indian 10-digit mobile number validation and cryptographic SHA-256 email OTP verification powered by Resend API.

---

## 🏗️ Reorganized Monorepo Directory Tree

The codebase is organized as an industry-standard full-stack monorepo with strict architectural separation between **Frontend** and **Backend** modules.

```
sportrise/
├── frontend/                          # Next.js 14 Client Application (Port 3000)
│   ├── public/                        # Static assets, branding logos & icons
│   ├── src/
│   │   ├── app/                       # Next.js App Router (Pages, Layouts & API)
│   │   │   ├── (auth)/                # Authentication Route Group
│   │   │   │   ├── login/             # Dual Athlete / Institution Login Portal
│   │   │   │   ├── register/          # Athlete Registration with 10-digit mobile rule
│   │   │   │   └── verify-otp/        # SHA-256 Email OTP Verification Screen
│   │   │   ├── admin/                 # Platform Administration Portal
│   │   │   ├── athletes/              # Public Athlete Directory & Deep Profiles
│   │   │   │   ├── [id]/              # Individual Athlete Performance Profile
│   │   │   │   └── page.tsx           # Searchable Indian Athlete Directory
│   │   │   ├── dashboard/             # Authenticated Athlete Career Dashboard
│   │   │   ├── events/                # Tournament Directory & Proof Documents
│   │   │   │   ├── [id]/              # Event Details, Schedule, Venue & Rules
│   │   │   │   ├── completed/         # Completed Events Archive & Verified Scorecards
│   │   │   │   └── page.tsx           # Live & Upcoming Sports Events Finder
│   │   │   ├── institution/           # School, College & Academy Portal
│   │   │   │   ├── dashboard/         # Event Management & Match Results Panel
│   │   │   │   ├── events/new/        # Host Event Wizard (Rules, Categories, Venue)
│   │   │   │   ├── login/             # Institution Official Login
│   │   │   │   └── register/          # Institution Onboarding & Accreditation
│   │   │   ├── leaderboard/           # National Khelo India Standard Rankings
│   │   │   ├── matches/               # Match Operations & Evidence Submission
│   │   │   │   └── [id]/submit-result/# Official Result & Scorecard Upload Screen
│   │   │   ├── performance-log/       # Athlete Self-Assessment & Metric Logging
│   │   │   ├── sports-corner/         # Olympic & Grassroots Sports Catalogue
│   │   │   ├── favicon.ico            # Site Favicon
│   │   │   ├── globals.css            # Tailwind Directives & Tricolour Gradients
│   │   │   ├── layout.tsx             # Root Layout with Indian Tricolour accents
│   │   │   └── page.tsx               # Homepage ("India Plays. SportRise Connects.")
│   │   ├── components/                # Reusable React UI Component Library
│   │   │   ├── events/
│   │   │   │   ├── EventCard.tsx      # Sports Event Card with Status Badges
│   │   │   │   └── EventFilters.tsx   # State, District & Sport Filter Bar
│   │   │   ├── institution/
│   │   │   │   └── InstitutionEventCard.tsx # Institution Event Action Controller
│   │   │   ├── AthleteCard.tsx        # Standard Athlete Card with Skill Index
│   │   │   ├── Footer.tsx             # Indian Sports Tech Portal Footer
│   │   │   ├── Navbar.tsx             # Responsive Navigation with Role Detection
│   │   │   └── StateDistrictSelector.tsx # 36 Indian States & UTs Cascading Dropdown
│   │   ├── data/
│   │   │   └── sportsCatalogue.ts     # Curated Olympic & National Sports Database
│   │   └── lib/
│   │       ├── api.ts                 # Axios API Client with JWT Interceptors
│   │       ├── indianLocations.ts     # Comprehensive Indian States & Districts Data
│   │       └── utils.ts               # CSS class merger & formatting helpers
│   ├── .eslintrc.json                 # Next.js ESLint Configuration
│   ├── next.config.mjs                # Next.js Server & Image Domain Config
│   ├── package.json                   # Frontend Dependencies & Scripts
│   ├── postcss.config.js              # PostCSS Config
│   ├── tailwind.config.ts             # Tailwind Theme & Custom Indian Palette
│   └── tsconfig.json                  # TypeScript Compiler Configuration
│
├── backend/                           # Express.js REST API Server (Port 5000)
│   ├── prisma/
│   │   ├── dev.db                     # SQLite Database with Seeded Indian Sports Data
│   │   └── schema.prisma              # Database Schema (Athletes, Events, Matches, etc.)
│   ├── scripts/                       # Database Management & Seeding Utilities
│   │   ├── clean.ts                   # Database Reset Utility
│   │   ├── cleanAthletes.ts           # Athlete Record Sanitization Script
│   │   ├── clearTemporaryStudents.ts  # Temporary User Purge Script
│   │   ├── seed.ts                    # Base Athlete & Event Seeder
│   │   ├── seedDemoEvents.ts          # Sample Regional Event Seeder
│   │   ├── seedEvents.ts              # Verified School & University Event Seeder
│   │   ├── seedRealisticSportsData.ts # Production Seeder (15 Athletes, 3 Events, SHA-256)
│   │   ├── testIntegration.ts         # Full-System End-to-End Integration Test Suite
│   │   ├── testLiveReg.ts             # Live Registration & OTP Dispatch Tester
│   │   └── testResend.ts              # Resend Email API Connectivity Tester
│   ├── src/                           # Pure Application Source Code
│   │   ├── controllers/               # HTTP Request Handlers
│   │   │   ├── athlete.controller.ts  # Athlete Profiles, Metrics & Search Handlers
│   │   │   ├── auth.controller.ts     # User/Institution Auth, 10-Digit Mobile, OTP
│   │   │   ├── event.controller.ts    # Event Creation, Discovery & Proof Queries
│   │   │   ├── institution.controller.ts # Institution Profile & Managed Events
│   │   │   ├── leaderboard.controller.ts # National Rankings & Metric Aggregations
│   │   │   └── match.controller.ts    # Match Results, Scorecard OCR & Verification
│   │   ├── data/
│   │   │   └── sportsData.ts          # Sport-specific Scoring Metrics & SAI Benchmarks
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # Bearer JWT Verification & Role Guards
│   │   │   └── upload.middleware.ts   # Multer Disk Storage & File MIME Filter
│   │   ├── models/                    # Data Access Layers & Validation
│   │   │   ├── Athlete.ts             # Athlete Profile Data Access
│   │   │   ├── Institution.ts         # Institution Data Access
│   │   │   ├── OTP.ts                 # Cryptographic SHA-256 OTP Generator & Verifier
│   │   │   └── User.ts                # User Data Access
│   │   ├── routes/                    # API Route Definitions
│   │   │   ├── athlete.routes.ts      # `/api/athletes`
│   │   │   ├── auth.routes.ts         # `/api/auth`
│   │   │   ├── event.routes.ts        # `/api/events`
│   │   │   ├── institution.routes.ts  # `/api/institutions`
│   │   │   ├── leaderboard.routes.ts  # `/api/leaderboard`
│   │   │   └── match.routes.ts        # `/api/matches`
│   │   ├── services/                  # Core Business & AI Logic
│   │   │   ├── aiRanking.service.ts   # AI Skill Index & Assessment Evaluator
│   │   │   ├── email.service.ts       # Resend / Nodemailer Dual-Engine Mailer
│   │   │   ├── scorecardOcr.service.ts# Google Gemini 1.5 Vision OCR Service
│   │   │   └── verifiedRanking.service.ts # Deterministic Multi-Match Ranking Engine
│   │   ├── app.ts                     # Express App Initialization & Middleware Stack
│   │   └── prisma.ts                  # Shared Prisma ORM Client Instance
│   ├── uploads/                       # Scorecard & Proof Storage
│   │   └── .gitkeep                   # Directory preservation placeholder
│   ├── package.json                   # Backend Dependencies & Scripts
│   └── tsconfig.json                  # TypeScript Compiler Configuration
│
├── .gitignore                         # Comprehensive Monorepo Git Ignore Rules
├── package.json                       # Monorepo Workspace Configuration & Root Scripts
└── README.md                          # Full Project Documentation & Developer Guide
```

---

## 💻 Tech Stack Breakdown

### Frontend Technologies
| Technology | Version | Purpose in SportRise |
| :--- | :--- | :--- |
| **Next.js** | `^14.2.15` | Modern React framework with App Router, server-rendered components, and dynamic routing |
| **React** | `^18.3.1` | Core declarative UI rendering library |
| **TypeScript** | `^5.6.3` | End-to-end type safety, typed interfaces for athletes, events, scorecards, and ranking metrics |
| **Tailwind CSS** | `^3.4.14` | Utility-first styling with custom Indian tricolour palette (`saffron`, `navy`, `emerald`) |
| **Lucide React** | `^0.454.0` | Accessible, consistent vector iconography across all dashboards |
| **Axios** | `^1.7.7` | HTTP client with automatic JWT token attachment and error interception |
| **React Hook Form** | `^7.53.1` | High-performance, unopinionated form state management |
| **Zod** | `^3.23.8` | Schema validation matching Indian mobile format and scorecard fields |
| **Recharts** | `^2.13.3` | Interactive radar charts and performance progression visualizations |
| **QRCode.react** | `^4.1.0` | Cryptographic QR code generation for athlete digital ID cards and verified scorecards |
| **Canvas Confetti** | `^1.9.3` | Celebration animations upon successful tournament registration and podium achievements |

### Backend Technologies
| Technology | Version | Purpose in SportRise |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | Server runtime environment |
| **Express.js** | `^4.21.1` | REST API framework handling routing, request parsing, and middleware pipeline |
| **TypeScript** | `^5.6.3` | Strict backend typing for models, services, controllers, and database queries |
| **Prisma ORM** | `^5.22.0` | Type-safe query builder and database migration manager |
| **SQLite** | `3` | Embedded relational database (`backend/prisma/dev.db`) storing athletes, events, and match records |
| **Google Gemini AI**| `^0.21.0` | Gemini 1.5 Flash Vision OCR extracting athlete performance from scorecards and PDFs |
| **BcryptJS** | `^2.4.3` | Salted password hashing (10 salt rounds) for user and institution credentials |
| **JSONWebToken** | `^9.0.2` | Stateless HMAC-SHA256 bearer token authentication |
| **Multer** | `^2.4.0` | Multi-part file upload engine for scorecards, match photos, and certificates |
| **Nodemailer** | `^6.9.16` | Fallback SMTP email delivery engine |
| **Resend API** | `REST` | Production-grade transactional email service dispatching 6-digit OTPs |
| **TSX** | `^4.19.2` | High-speed TypeScript execution engine for dev daemons and seeding scripts |

---

## 🧭 Folder Navigation Guide

To help both human developers and automated AI tools navigate the repository effectively, consult this roadmap:

### 1. `frontend/src/app`
Contains every public and protected screen, organized by feature using Next.js App Router:
- **`events/completed/`**: Houses the **Completed Events Archive**, complete with institutional stamps, tournament summary cards, and verified scorecards.
- **`athletes/`**: Public athlete directory with filterable search by sport, state, district, and gender, linking to individual athlete profile pages (`[id]/page.tsx`).
- **`leaderboard/`**: Live comparative athlete leaderboard benchmarked against Khelo India standards with sport-specific metrics (e.g. 100m sprint timings, archery X-ring counts, weightlifting Olympic totals).
- **`institution/`**: Educational institutions and sports academies manage events and submit official match records here.
- **`(auth)/`**: Handles registration with strict Indian mobile phone rules (must be exactly 10 digits; letters rejected) and email OTP verification.

### 2. `frontend/src/components`
Contains shared, reusable UI elements:
- **`Navbar.tsx`**: Top navigation header featuring Indian sports branding and role-based action buttons.
- **`Footer.tsx`**: Tricolour-accented footer with links to Olympic sports catalogues and grassroots initiatives.
- **`StateDistrictSelector.tsx`**: Cascading state and district dropdown covering all 36 Indian States and Union Territories.
- **`AthleteCard.tsx`** & **`EventCard.tsx`**: Standardized cards displaying athlete skill scores and tournament timelines.

### 3. `backend/src/controllers`
Handles incoming HTTP requests, enforces authorization, and formats responses:
- **`match.controller.ts`**: Implements match creation, AI scorecard reading triggers, and institutional submission flows.
- **`auth.controller.ts`**: Enforces 10-digit mobile number validation and dispatches OTP emails.
- **`leaderboard.controller.ts`**: Aggregates ranking scores and generates comparative standings.

### 4. `backend/src/services`
Core algorithmic and artificial intelligence engines:
- **`verifiedRanking.service.ts`**: The mathematical core of SportRise. Implements sport-specific ranking formulas, percentile conversions, Khelo India benchmarks, and cryptographic SHA-256 evidence hashing.
- **`scorecardOcr.service.ts`**: Interfaces with Google Gemini 1.5 Flash Vision to parse scanned documents, score sheets, and tournament tables into structured JSON.
- **`email.service.ts`**: Orchestrates transactional OTP delivery with automatic fallback between Resend API and Nodemailer SMTP.

### 5. `backend/scripts`
Self-contained database administration, automated seeding, and system verification scripts:
- **`seedRealisticSportsData.ts`**: Seeds 15 diverse Indian athletes, 3 completed multi-sport events, and cryptographically verified scorecards.
- **`testIntegration.ts`**: Automated end-to-end integration test validating OTP generation, match submission, SHA-256 evidence hashing, and leaderboard updates.

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### 1. Installation
Clone the repository and install dependencies using npm monorepo workspaces:

```bash
# Clone the repository
git clone https://github.com/your-username/sportrise.git
cd sportrise

# Install dependencies for both Frontend and Backend
npm install --prefix backend
npm install --prefix frontend
```

### 2. Environment Variables Configuration

#### Backend Configuration (`backend/.env`)
Create `backend/.env` with the following variables:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="sportrise_production_jwt_super_secret_2026_india"

# Email Delivery (Resend API)
RESEND_API_KEY="re_your_resend_api_key_here"
RESEND_FROM="SportRise India <onboarding@resend.dev>"

# AI OCR Engine (Google Gemini API)
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

#### Frontend Configuration (`frontend/.env.local`)
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For the Vercel frontend, set `NEXT_PUBLIC_API_URL` in the Vercel project's
Environment Variables to the publicly deployed backend API base URL, for example:

```env
NEXT_PUBLIC_API_URL=https://sportrise.onrender.com/api
```

Redeploy after changing this variable because `NEXT_PUBLIC_` values are embedded
in the frontend build. The Vercel frontend cannot use a backend running at
`localhost` on a developer's computer.

### 3. Database Initialization & Seeding
Configure `DATABASE_URL` with a PostgreSQL connection string for both local development and the Render backend. On Render, use the connection string for the attached PostgreSQL database. With the repository root as the service root, configure the backend build command to create the Prisma client, sync the schema, and compile the API:

```bash
# Render build command (DATABASE_URL must be configured in the service environment)
npm install
npm run prisma:push --workspace=backend
npm run build:backend

# Render start command
npm run start --workspace=backend
```

`prisma:push` creates or updates the PostgreSQL schema; it does not copy records from
the old local SQLite database at `backend/prisma/dev.db`. Migrate any local records
you need to keep, or seed the PostgreSQL database with the appropriate seed scripts.
Do not set Render's PostgreSQL URL in a schema configured for SQLite (or vice versa).

### 4. Running the Development Servers

You can run both servers simultaneously using workspace scripts from the root directory:

```bash
# Terminal 1: Start Backend API (runs on http://localhost:5000)
npm run dev:backend

# Terminal 2: Start Frontend Client (runs on http://localhost:3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience SportRise.

---

## 🛡️ Key System Architecture & Algorithms

### 1. Indian Mobile Number Validation Rule
To ensure grassroots data integrity across rural and urban districts, registration enforces strict Indian phone number formatting on both frontend and backend:
- Value must contain **exactly 10 digits**.
- Alphabetic characters and special symbols are strictly rejected with an immediate user-facing alert: `"Please enter a valid 10-digit mobile number. Letters are not allowed."`
- Fewer than 10 digits trigger: `"Mobile number must contain exactly 10 digits."`
- More than 10 digits trigger: `"Mobile number cannot contain more than 10 digits."`

### 2. Cryptographic Evidence Hashing (SHA-256)
Every official scorecard, certificate, and match photo uploaded by an institution generates an immutable SHA-256 fingerprint:
$$\text{EvidenceHash} = \text{SHA256}(\text{InstitutionID} + \text{MatchID} + \text{ScorecardContent} + \text{Timestamp})$$
This digital digest is rendered alongside an institutional verification seal on the public Completed Events page, preventing forged certificates and unauthorized score alterations.

### 3. Multi-Match Deterministic Athlete Ranking Formula
Unlike simple win-loss ratios, SportRise uses a deterministic multi-parameter scoring formula tailored to each sport discipline:

$$\text{FinalScore} = \text{BaseScore} \times W_{\text{playtime}} + \sum (\text{Metric}_i \times W_i) + \text{Bonus}_{\text{podium}}$$

- **Track & Field**: Evaluated against national senior records using inverse exponential decay on finishing seconds.
- **Archery**: Scored on total arrow accuracy, 10s & X-ring counts, and elimination bracket advancement.
- **Weightlifting**: Evaluated using Olympic Totals (Snatch + Clean & Jerk) normalized against bodyweight brackets.
- **Football & Team Sports**: Evaluated using playing time weights, goals, assists, tackles, and clean sheets.

---

## 📡 API Reference Overview

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register athlete with 10-digit mobile validation & dispatch OTP |
| `/api/auth/verify-otp` | `POST` | Public | Verify SHA-256 hashed 6-digit OTP and activate account |
| `/api/auth/login` | `POST` | Public | Authenticate athlete or institution official and issue JWT |
| `/api/events` | `GET` | Public | Filter events by sport, state, district, and status |
| `/api/events/completed` | `GET` | Public | Retrieve completed events with scorecards & institutional stamps |
| `/api/events` | `POST` | Institution | Create and publish a new sporting tournament |
| `/api/matches/ocr-scorecard` | `POST` | Institution | Upload scorecard image/PDF for Gemini AI OCR extraction |
| `/api/matches/submit-result` | `POST` | Institution | Submit official match result with SHA-256 evidence hashing |
| `/api/athletes` | `GET` | Public | Search and list verified Indian athletes |
| `/api/athletes/:id` | `GET` | Public | Retrieve deep athlete profile, tournament history & skill index |
| `/api/leaderboard` | `GET` | Public | Get comparative rankings by sport, state, age category & gender |

---

## 🧪 Testing & Verification

Run the comprehensive integration test suite to verify all core systems:

```bash
npm run test:integration
```

The test validates:
- [x] Athlete registration with 10-digit phone number check.
- [x] SHA-256 OTP hashing and rate-limited resend logic.
- [x] Institutional match result submission with scorecards.
- [x] SHA-256 evidence verification and digital stamp generation.
- [x] Deterministic multi-match ranking calculation and leaderboard synchronization.

---

## 🇮🇳 Contributing to Indian Sports Tech

SportRise welcomes contributions from developers, sports scientists, coaches, and sports data enthusiasts across India.
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/NewSportSupport`).
3. Commit your Changes (`git commit -m 'Add Boxing and Wrestling SAI scoring support'`).
4. Push to the Branch (`git push origin feature/NewSportSupport`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the ISC License. Built with ❤️ for Indian sports excellence.
