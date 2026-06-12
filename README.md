# TaskFlow - Visual Task Manager

A simple task management system with a Kanban board for small teams.
**Works on desktop and mobile phones.**

## Team Members

| Role | Name |
|------|------|
| Frontend Lead & UI Specialist | @goanarbolkong |
| Backend Lead & API Architect | @MemerZxZ |
| Project Manager & Fullstack QA | @Echeq |

## Tech Stack

- **Frontend:** React + Vite
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Drag & Drop:** @dnd-kit/core
- **Styling:** Tailwind CSS (responsive)
- **Mobile:** Fully responsive design

## Features

- ✅ Create, edit, delete tasks
- ✅ Kanban board (To Do / Doing / Done)
- ✅ Drag & drop between columns
- ✅ Task due dates
- ✅ Mobile friendly (swipe, touch)
- ✅ Real-time updates
- ✅ User authentication

## How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node)
- Supabase account (free)

### Setup Supabase

1. Create a free account at https://supabase.com
2. Create a new project
3. Copy your `URL` and `anon key` from Project Settings > API
4. Create a `.env` file in the frontend folder:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
