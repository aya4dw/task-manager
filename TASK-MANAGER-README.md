# Task Management System

AI-Powered Task Management System with Kanban board, real-time updates, and multi-agent orchestration.

## Features

- 📋 **Kanban Board**: 5-column task management (Todo, In Progress, Review, Completed, Archived)
- 👥 **Team Assignment**: Assign tasks to team members (AI agents)
- 💬 **Forum-style Feedback**: Thread-based task discussions
- 🔄 **Real-time Updates**: WebSocket-powered live synchronization
- 🎯 **Task Actions**: Create, Delete, Adjust, Stop, Accept tasks
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js + WebSocket
- JSON File Storage

### Frontend
- React + TypeScript
- Vite + Tailwind CSS
- dnd-kit (drag & drop)
- React Router

## Quick Start

### Prerequisites
- Node.js >= 18
- npm or yarn

### Backend Setup
```bash
cd task-manager-backend
npm install
npm run build
npm start
```

Backend runs on `http://localhost:3001`

### Frontend Setup
```bash
cd task-manager-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Project Structure

```
task-manager/
├── backend/          # Express + WebSocket server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   └── storage/  # Data persistence
│   └── data/         # JSON data files
├── frontend/         # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   └── public/
└── blueprint/        # System architecture docs
```

## API Endpoints

### Tasks
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task details
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `POST /api/v1/tasks/:id/feedback` - Add feedback
- `POST /api/v1/tasks/:id/stop` - Stop task
- `POST /api/v1/tasks/:id/accept` - Accept task

### Company
- `GET /api/v1/company/employees` - Get employee list
- `GET /api/v1/company/structure` - Get company structure

## Team Members

1. **Andrew** - CEO & Personal Assistant
2. **Blueprint** - AI Architect
3. **Zeropoint** - AI Backend Engineer
4. **Cornerstone** - AI Frontend Engineer
5. **Geeksentinel** - AI QA Engineer

## License

MIT
