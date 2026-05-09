# SprintBoard

A full-featured project management tool built with React 19 and TypeScript — inspired by JIRA. Supports sprint planning, Kanban boards with drag-and-drop, role-based access control, time logging, issue dependencies, file attachments, and a real-time activity feed. No backend required — everything runs in the browser and persists via localStorage.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (outputs a single self-contained HTML file)
npm run build

# Preview production build locally
npm run preview
```

**Default admin credentials**
```
Email:    admin@company.com
Password: admin123
```

---

## Features

### Issue Management
- Create issues with type (Story, Task, Bug, Epic), priority (Lowest → Highest), and status
- Full detail view with 5 tabs: Details, Comments, Work Logs, Links, Attachments
- Inline editing — all fields auto-save on blur
- Labels, time estimates, and assignee tracking
- File attachments stored as base64 in localStorage with download support

### Issue Dependencies
- Link issues with typed relationships: Blocks, Blocked By, Relates To, Duplicates, Duplicated By
- Remove links directly from the issue detail panel
- Duplicate link prevention built in

### Kanban Board
- Four-column workflow: To Do → In Progress → In Review → Done
- Drag-and-drop powered by @dnd-kit with smooth DragOverlay animation
- **Role-based drag permissions** — admins can move any card; members can only move cards assigned to them
- Lock icon shown on cards a member cannot drag; grip handle shown on cards they can
- Board scopes automatically to the active sprint

### Sprint Planning
- Create sprints with name, goal, start date, and end date (Admin only)
- Start and complete sprints (Admin only)
- Move backlog issues into sprints with a single hover-click — no drag required
- Remove issues from sprints back to backlog
- Completing a sprint automatically returns all incomplete issues to the backlog
- Done issues remain in the completed sprint as a historical record

### Time Tracking
- Log actual hours against any issue with an optional description
- View per-issue work log history with timestamps and user attribution
- Running total displayed against the original estimate

### Team Collaboration
- Email-based member invitations (demo mode — no email is sent; user signs up with the invited address)
- Role assignment at invitation time; role auto-applied on signup
- Role-based access: only admins can create sprints, invite members, and edit project settings
- Comment threads on every issue with user attribution and timestamps

### Search
- Global search overlay (⌘K / Ctrl+K) filters issues by title, key, and description in real time
- Click any result to open the full issue detail modal

### Activity Feed
- Chronological log of every team action: issue creation, status changes, assignments, comments, work logs, attachments, and sprint events
- Notification bell in the top navigation shows the 8 most recent events
- Full feed available in the Activity tab (up to 200 entries)

### Analytics Dashboard
- Issue counts by status and type with visual progress bars
- Active sprint progress bar with per-status breakdown
- Team performance summary — assigned, in-progress, and completed per member
- Recently updated issues list

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open search |
| `C` | Create new issue |
| `Esc` | Close any modal or overlay |
| `Enter` | Submit a comment |
| `Tab` | Navigate between form fields |

---

## Views

| View | Description |
|------|-------------|
| Board | Kanban board scoped to the active sprint. Drag-and-drop with role-based permissions. |
| Backlog | All issues grouped by sprint. Move issues into sprints with a hover button. Create sprints and issues from here. |
| Sprints | All sprints sorted by status (active first). Per-sprint progress bars, issue breakdowns, and start/complete controls. |
| Dashboard | Status and type distribution, active sprint progress, team workload, and recently updated issues. |
| Activity | Paginated activity feed with action-type badges and timestamps. |
| Team | Member cards with assigned, active, and completed counts. Expandable to show assigned issues. |
| Settings | Editable project name and description (admin). Invitation management with status tracking. Account information. |

---

## Authentication & Permissions

- Email and password login and signup
- Session stored in `localStorage` — survives page refreshes
- Role is assigned at signup based on a pending invitation, defaulting to Member

| Action | Admin | Member |
|--------|-------|--------|
| View all issues and sprints | ✓ | ✓ |
| Create and edit issues | ✓ | ✓ |
| Comment and log work | ✓ | ✓ |
| Drag any card on the board | ✓ | — |
| Drag own assigned cards | ✓ | ✓ |
| Create and manage sprints | ✓ | — |
| Invite team members | ✓ | — |
| Edit project settings | ✓ | — |

---

## Data Model

All state is stored in `localStorage` under the key `jira_clone_data`.

| Entity | Key fields |
|--------|-----------|
| Project | id, name, key, description, adminId |
| User | id, name, email, role, assignedIssues, completedIssues |
| Issue | id, key, title, type, priority, status, sprintId, assigneeId, labels, estimatedHours, comments, workLogs, links, attachments |
| Sprint | id, name, goal, startDate, endDate, status |
| Invitation | id, email, role, status (pending / accepted / rejected) |
| Activity | id, type, userId, issueId, sprintId, details, createdAt |

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.3 | UI framework |
| react-dom | 19.2.3 | DOM renderer |
| typescript | 5.9.3 | Static type safety |
| vite | 7.2.4 | Build tool and dev server |
| vite-plugin-singlefile | 2.3.0 | Bundles everything into one HTML file |
| tailwindcss | 4.1.17 | Utility-first CSS |
| @dnd-kit/core | 6.3.1 | Drag-and-drop primitives |
| @dnd-kit/sortable | 10.0.0 | Sortable drag-and-drop |
| lucide-react | 1.8.0 | Icon library |
| recharts | 3.8.1 | Chart components |
| date-fns | 4.1.0 | Date formatting |
| clsx + tailwind-merge | — | Conditional class merging |

---

## Project Structure

```
src/
├── types.ts                        # All TypeScript interfaces and union types
├── App.tsx                         # Root component — auth gate
├── main.tsx                        # ReactDOM entry point
├── index.css                       # Tailwind import
│
├── services/
│   └── database.ts                 # All localStorage reads/writes and activity logging
│
├── context/
│   └── AppContext.tsx              # Global state and all action functions via useApp()
│
├── utils/
│   └── cn.ts                       # clsx + tailwind-merge helper
│
└── components/
    ├── Auth.tsx                    # Login and signup forms
    ├── ModernDashboard.tsx         # Top nav, tab bar, search overlay, all modal orchestration
    ├── CreateIssueModal.tsx        # New issue form with validation
    ├── CreateSprintModal.tsx       # New sprint form
    ├── InviteMemberModal.tsx       # Invite member by email
    ├── IssueCard.tsx               # Draggable Kanban card with permission-aware drag handle
    ├── IssueDetailModal.tsx        # Full issue editor — 5 tabbed panels
    ├── DroppableColumn.tsx         # Kanban column drop target
    └── views/
        ├── BoardView.tsx           # Kanban board with DnD and permission checks
        ├── BacklogView.tsx         # Sprint planning — move issues in/out of sprints
        ├── SprintsView.tsx         # Sprint overview with progress bars
        ├── DashboardView.tsx       # Analytics and metrics
        ├── ActivityView.tsx        # Activity feed
        ├── TeamView.tsx            # Member profiles and issue lists
        └── SettingsView.tsx        # Project settings and invitation management
```

---

## Architecture

```
Browser localStorage
       │
       ▼
database.ts          — service layer: all reads, writes, and activity logging
       │
       ▼
AppContext.tsx        — React Context: exposes typed state and action functions
       │
       ▼
Components           — read state via useApp(), dispatch actions
```

Every action follows the same pattern:
1. Component calls a context action (e.g. `updateIssue`)
2. Context reads fresh data from `database.ts` to avoid stale closures
3. `database.ts` applies the mutation, logs an activity entry, and saves to localStorage
4. Context calls `refreshData()` which triggers a full React re-render

---

## Deployment

The `vite-plugin-singlefile` plugin inlines all JavaScript and CSS into a single `dist/index.html` file (~300 KB). No server, CDN, or routing configuration needed.

```bash
npm run build
# → dist/index.html  (fully self-contained)
```

**Deploy options**
- **Netlify Drop** — drag the `dist/` folder to netlify.com/drop
- **GitHub Pages** — commit `dist/index.html` and enable Pages on the repository
- **Vercel** — `vercel --prod` from the project root
- **Anywhere** — it is one HTML file; host it on any static server

---

## Build Info

| Metric | Value |
|--------|-------|
| Build size | ~300 KB |
| Gzipped | ~86 KB |
| Build time | ~1.6 s |
| TypeScript coverage | 100% |
| Backend required | None |

---

## Known Limitations

- **No real email delivery** — invitations are stored in localStorage only. Invited users must sign up manually using the invited email address.
- **localStorage cap** — browsers allow ~5 MB per origin. File attachments are stored as base64 which is ~33% larger than the original file. Large attachments may approach this limit.
- **Single project** — the app manages one project per localStorage instance.
- **No real-time sync** — multiple browser tabs or users do not share live updates; each session reads independently from localStorage.

---

## Future Enhancements

- Real backend integration (Supabase or Firebase) for multi-user real-time collaboration
- WebSocket-based live updates across browser tabs
- Full-text search with advanced filtering and sorting
- Dark mode
- Export issues to CSV
- Email delivery via a serverless function

---

## License

MIT — free to use as a learning reference or starting point for your own project management tool.