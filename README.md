<p align="center">
  <img src="public/favicon.svg" width="72" alt="CareerForge" />
</p>

<h1 align="center">CareerForge</h1>

<p align="center">
  A modern career-management platform for students — DSA progress, job applications, projects, and study planning in one clean SaaS-style workspace.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6-blue?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white&style=flat-square" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-purple?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/Recharts-3-red?style=flat-square" alt="Recharts" />
</p>

---

## What is CareerForge?

CareerForge is a **frontend application** built to manage the entire student job-search workflow in one place:

- 🧑‍💻 **Track DSA/LeetCode practice** across topics and difficulty
- 💼 **Find and apply to jobs** with a realistic job board
- 📋 **Manage applications** through a Kanban hiring pipeline (Saved → Applied → OA → Interview → Selected → Rejected)
- 🗂️ **Showcase a project portfolio**
- 📅 **Plan daily study sessions**
- 📊 **Understand progress** with interactive analytics charts

> **Note:** This is a UI milestone. All data is realistic **mock data** (`src/data/mockData.ts`) so the frontend can later connect to REST APIs without redesigning the UI.

---

## ✨ Features

| Area | What you get |
|---|---|
| **Dashboard** | Personal greeting, key statistics, DSA progress chart, application pipeline, upcoming deadlines, and recent activity |
| **Jobs** | Searchable job board with filters for location, job type, and experience |
| **Applications** | Kanban-style tracker with an "Add Application" flow |
| **DSA Tracker** | Problem list with difficulty/topic breakdown, search, and filters |
| **Projects** | Portfolio cards with GitHub & live demo links |
| **Study Planner** | Today / upcoming / completed task lists with priorities and due dates |
| **Resume** | Version management with upload, view, download, and delete |
| **Analytics** | Recharts visualizations of progress, applications, consistency, and projects |
| **Settings** | Profile, account, notifications, appearance, and integrations |

## 🛠️ Tech Stack

- **React 19** — functional components, hooks
- **TypeScript** — strict typing throughout
- **Vite 8** — instant dev server and optimized production builds
- **Tailwind CSS 4** — design system with a single primary accent color
- **React Router 7** — client-side routing with layout routes
- **Zustand 5** — lightweight global state
- **Recharts 3** — responsive, clean data visualizations
- **Lucide React** — consistent iconography

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- npm (comes with Node.js)

### Install & run

```bash
# 1. Clone the repository
git clone https://github.com/manas027-karki/collegeforge.git
cd careerforge

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) then bundle for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint code-quality checks |

## 🗂️ Project Structure

```
src/
├── components/     # Reusable UI (Sidebar, Topbar, StatCard, StatusBadge, …)
├── layouts/        # DashboardLayout & AuthLayout shells
├── pages/          # Dashboard, Jobs, Applications, DSA, Projects, Study, Resume, Analytics, Settings, Login, Register
├── data/           # mockData.ts — all centralized mock data
├── store/          # useAppStore.ts — Zustand global state
├── lib/            # utilities (cn, date helpers)
├── config/         # navigation configuration
└── types.ts        # shared TypeScript interfaces
```

## 🗺️ Roadmap

- [x] Project setup, design system, routing, layout, dashboard, mock data
- [ ] Job board with search & filters
- [ ] Kanban application tracker
- [ ] DSA problem tracker
- [ ] Project portfolio & study planner
- [ ] Resume management & analytics dashboard
- [ ] Settings & integrations UI
- [ ] GitHub, LeetCode, and AI assistant integration
- [ ] Backend & real database

## 📄 License

This project is for educational/portfolio purposes. Make sure you don't use real company job listings as actual postings — the job data shown is mock UI data only.