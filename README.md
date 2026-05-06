# ⚡ TaskFlow — Team Task Manager

A full-stack team task management web app with role-based access control, project management, and a sleek dark UI.

## 🚀 Live Demo

> Deploy URL goes here after Railway deployment

**Demo accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Member | member@demo.com | password123 |

---

## ✨ Features

- **Authentication** — JWT-based signup/login with role selection
- **Projects** — Create, edit, delete projects with color labels and due dates
- **Kanban Board** — Drag-and-drop tasks across Todo → In Progress → Review → Done
- **Task Management** — Assign tasks, set priorities (Low/Medium/High/Urgent), due dates
- **Team Management** — Add/remove members per project; admins can promote users
- **Dashboard** — Stats overview, recent activity, project progress bars
- **Overdue Detection** — Visual warnings for past-due tasks
- **Role-Based Access** — Admins manage all; members see only their projects
- **Comments** — Add comments to tasks (API ready)

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Node.js + Express 4 |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcryptjs |
| Deployment | Railway |

---

## 🛠 Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USERNAME/taskflow
cd taskflow

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd client && npm install && cd ..

# 4. Seed demo data (optional)
node server/seed.js

# 5. Start development servers
npm run dev
```

Runs on:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project + tasks + members |
| PUT | `/api/projects/:id` | Update project (admin) |
| DELETE | `/api/projects/:id` | Delete project (admin) |
| POST | `/api/projects/:id/members` | Add member (admin) |
| DELETE | `/api/projects/:id/members/:uid` | Remove member (admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task + comments |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |

**Task filters:** `?status=todo&priority=high&assignee=me&project_id=1&overdue=true`

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/stats` | Dashboard statistics |
| PUT | `/api/users/:id/role` | Change user role (admin) |

---

## 🚂 Deploy to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
3. Select your repo
4. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secure-random-string-here
   ```
5. Railway auto-detects `railway.toml` and builds + deploys
6. After deploy, run seed: use Railway's terminal → `node server/seed.js`

> The SQLite database persists in Railway's volume. For production at scale, migrate to PostgreSQL.

---

## 📁 Project Structure

```
taskflow/
├── server/
│   ├── index.js          # Express app entry
│   ├── seed.js           # Demo data seeder
│   ├── db/
│   │   └── index.js      # SQLite + schema
│   ├── middleware/
│   │   └── auth.js       # JWT middleware + RBAC
│   └── routes/
│       ├── auth.js       # Auth endpoints
│       ├── projects.js   # Project CRUD
│       ├── tasks.js      # Task CRUD + comments
│       └── users.js      # User management + stats
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx       # Router
│       ├── api.js        # API client
│       ├── styles.css    # Global design system
│       ├── contexts/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── Layout.jsx    # Sidebar layout
│       │   └── TaskModal.jsx # Create/edit task
│       └── pages/
│           ├── Auth.jsx      # Login + Signup
│           ├── Dashboard.jsx
│           ├── Projects.jsx
│           ├── ProjectDetail.jsx  # Kanban board
│           ├── Tasks.jsx     # Task list + filters
│           └── Team.jsx      # User management
├── package.json          # Root (Railway entry)
├── railway.toml          # Railway config
└── README.md
```

---

## 🔐 Role-Based Access Control

| Action | Member | Project Admin | System Admin |
|--------|--------|---------------|--------------|
| View own projects | ✅ | ✅ | ✅ |
| Create projects | ✅ | ✅ | ✅ |
| Edit/delete own project | ❌ | ✅ | ✅ |
| Add/remove members | ❌ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Edit any task | ✅ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |
| Promote users | ❌ | ❌ | ✅ |

---

## 📹 Demo Video Notes

For your 2–5 min demo, cover:
1. Sign up as admin + member
2. Create a project, add member
3. Create tasks with different priorities/statuses
4. Demo kanban drag-and-drop
5. Show dashboard stats
6. Admin: promote a member
7. Show overdue task detection
