# SprintBoard — Project Management Tool

A fully functional JIRA clone built with React 19 and TypeScript. Supports sprint planning, kanban boards, issue tracking, time logging, and team collaboration — all persisted in browser localStorage with no backend required.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Default Login:**
- Email: `admin@company.com`
- Password: `admin123`

---

## Features

### Issue Management
- Create, edit, and delete issues with full detail views
- Issue types: Story, Task, Bug, Epic
- Priority levels: Lowest, Low, Medium, High, Highest
- Status workflow: Backlog → To Do → In Progress → In Review → Done
- Drag and drop between Kanban columns
- Time estimation and work log tracking
- Labels, comments, file attachments (base64), and issue links

### Issue Dependencies
- Link issues with typed relationships: blocks, blocked-by, relates-to, duplicates, duplicated-by
- Remove links from the issue detail panel

### Sprint Planning
- Create sprints with name, goal, start date, and end date
- Start and complete sprints (Admin only)
- Incomplete issues automatically return to backlog on sprint close
- Collapsible sprint sections in both Backlog and Sprints views

### Time Tracking
- Log hours against any issue with an optional description
- View per-issue work log history with totals
- Compare logged time against estimated hours

### Team Collaboration
- Email-based invitations — invited users sign up with the invited address to join
- Role-based permissions: Admin and Member
- Admins can create sprints, invite members, and manage settings
- Member profiles with assigned and completed issue counts

### Activity Feed
- Chronological log of all team actions: issue creation, status changes, assignments, comments, work logs, file attachments, and sprint events
- Shown in the Activity tab and surfaced as notifications in the top navigation bar
- Capped at 200 most recent entries

---

## Views

| View | Description |
|------|-------------|
| Board | Kanban board with To Do, In Progress, In Review, and Done columns. Drag and drop supported. Scoped to the active sprint. |
| Backlog | Full issue list grouped by sprint, with collapsible sections. Create issues and sprints from here. |
| Sprints | All sprints sorted by status (active first), with per-sprint progress bars and issue breakdowns. |
| Dashboard | Status and type distribution, active sprint progress, team performance summary, and recently updated issues. |
| Activity | Paginated activity feed (up to 50 entries shown) with action type badges and timestamps. |
| Team | Member cards with assigned, in-progress, and completed counts. Expandable to show assigned issues. |
| Settings | Project details (read-only), pending invitations list, and account/logout controls. |

---

## Authentication

- Email and password login and signup
- Session persisted in `localStorage` under a separate auth key
- Role assigned at signup based on pending invitation, defaulting to Member
- Admin-only actions: invite members, create sprints, start/complete sprints

**Default admin credentials:**
- Email: `admin@company.com`
- Password: `admin123`

---

## Data Model

All state is stored in `localStorage` under the key `jira_clone_data`. The schema maps directly to the TypeScript types in `src/types.ts`:

| Entity | Key fields |
|--------|-----------|
| Project | id, name, key, description, adminId |
| User | id, name, email, role, assignedIssues, completedIssues |
| Issue | id, key, title, type, priority, status, sprintId, assigneeId, labels, estimatedHours, comments, workLogs, links, attachments |
| Sprint | id, name, goal, startDate, endDate, status |
| Invitation | id, email, role, status (pending/accepted/rejected) |
| Activity | id, type, userId, issueId, sprintId, details, createdAt |

No backend is required. All data survives page refreshes.

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.3 | UI framework |
| react-dom | 19.2.3 | DOM renderer |
| typescript | 5.9.3 | Type safety |
| vite | 7.2.4 | Build tool and dev server |
| tailwindcss | 4.1.17 | Utility-first CSS |
| @dnd-kit/core | 6.3.1 | Drag and drop |
| @dnd-kit/sortable | 10.0.0 | Sortable drag and drop |
| lucide-react | 1.8.0 | Icon library |
| recharts | 3.8.1 | Chart components |
| date-fns | 4.1.0 | Date formatting |
| clsx + tailwind-merge | — | Conditional class merging |

---

## Project Structure

```
src/
├── components/
│   ├── views/
│   │   ├── BoardView.tsx          # Kanban board with drag and drop
│   │   ├── BacklogView.tsx        # Sprint and backlog management
│   │   ├── SprintsView.tsx        # Sprint overview with progress
│   │   ├── DashboardView.tsx      # Analytics and metrics
│   │   ├── ActivityView.tsx       # Activity feed
│   │   ├── TeamView.tsx           # Member profiles
│   │   └── SettingsView.tsx       # Project and account settings
│   ├── ModernDashboard.tsx        # Top nav, tab bar, modal orchestration
│   ├── Auth.tsx                   # Login and signup forms
│   ├── CreateIssueModal.tsx       # New issue form
│   ├── CreateSprintModal.tsx      # New sprint form
│   ├── InviteMemberModal.tsx      # Invite by email form
│   ├── IssueCard.tsx              # Draggable kanban card
│   ├── IssueDetailModal.tsx       # Issue detail with tabbed panels
│   └── DroppableColumn.tsx        # Droppable kanban column
├── context/
│   └── AppContext.tsx             # Global state via React Context
├── services/
│   └── database.ts                # localStorage read/write and activity logging
├── types.ts                       # All TypeScript interfaces and union types
├── utils/
│   └── cn.ts                      # clsx + tailwind-merge helper
└── App.tsx                        # Root component and auth gate
```

---

## Usage Guide

**Creating an issue**
1. Click the blue "Create" button in the top navigation and select "Create Issue", or use the button inside the Backlog view.
2. Fill in the type, priority, title, description, assignee, labels, and estimated hours.
3. Click "Create Issue".

**Starting a sprint**
1. Go to the Backlog view.
2. Click "Create Sprint" (Admin only) and fill in the sprint name, goal, and dates.
3. Once issues are added, click "Start Sprint" on the sprint row.

**Completing a sprint**
1. Go to the Backlog or Sprints view.
2. Click "Complete Sprint" on the active sprint.
3. Done issues remain in the completed sprint; all other issues return to the backlog.

**Inviting a team member**
1. Log in as an admin and go to Settings.
2. Click "Invite Member", enter the email address, and select a role.
3. The invited user signs up using that email address. Their role is assigned automatically on signup.

**Logging work time**
1. Open any issue and go to the "Work Logs" tab.
2. Enter hours and an optional description, then click "Log".

**Linking issues**
1. Open an issue and go to the "Links" tab.
2. Select a relationship type and the target issue, then click "Link".

---

## Build Info

- **Build size:** 289 KB (gzipped: 86 KB)
- **Build time:** ~1.6 s
- **TypeScript coverage:** 100%

---

## Future Enhancements

- Real backend integration (Firebase or Supabase)
- WebSocket-based real-time collaboration
- Export to CSV or PDF
- Full-text search and advanced filtering
- Keyboard shortcuts
- Dark mode

---

## License

MIT License — free to use as a learning reference or as a starting point for your own project management tool.