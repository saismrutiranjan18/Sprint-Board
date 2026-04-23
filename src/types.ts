export type IssueType = 'story' | 'task' | 'bug' | 'epic';
export type IssuePriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';
export type IssueStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';
export type SprintStatus = 'planned' | 'active' | 'completed';
export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only stored for demo purposes
  avatar: string;
  role: UserRole;
  assignedIssues: number;
  completedIssues: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface WorkLog {
  id: string;
  userId: string;
  timeSpent: number; // in hours
  description: string;
  createdAt: string;
}

export interface IssueLink {
  id: string;
  type: 'blocks' | 'is-blocked-by' | 'relates-to' | 'duplicates' | 'is-duplicated-by';
  targetIssueId: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64
  uploadedBy: string;
  uploadedAt: string;
}

export interface Activity {
  id: string;
  type: 'issue_created' | 'issue_updated' | 'issue_assigned' | 'comment_added' | 'status_changed' | 'sprint_created' | 'sprint_started' | 'sprint_completed' | 'user_invited' | 'work_logged' | 'file_attached';
  userId: string;
  issueId?: string;
  sprintId?: string;
  details: string;
  metadata?: any;
  createdAt: string;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  assigneeId?: string;
  reporterId: string;
  sprintId?: string;
  labels: string[];
  estimatedHours?: number;
  comments: Comment[];
  workLogs: WorkLog[];
  links: IssueLink[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  createdAt: string;
  adminId: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  projectId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppState {
  project: Project;
  users: User[];
  issues: Issue[];
  sprints: Sprint[];
  invitations: Invitation[];
  activities: Activity[];
}
