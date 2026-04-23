import { User, Issue, Sprint, Project, Invitation, AppState, Activity, Comment, WorkLog, IssueLink, Attachment } from '../types';

const STORAGE_KEY = 'jira_clone_data';
const AUTH_KEY = 'jira_clone_auth';

// Initialize default admin user
const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@company.com',
  password: 'admin123', // In production, this would be hashed
  avatar: '👨‍💼',
  role: 'admin',
  assignedIssues: 0,
  completedIssues: 0,
  createdAt: new Date().toISOString(),
};

const DEFAULT_PROJECT: Project = {
  id: 'project-1',
  name: 'TaskFlow Project',
  key: 'TASK',
  description: 'Main project workspace',
  createdAt: new Date().toISOString(),
  adminId: 'admin-1',
};

// Initialize database with default data
export const initializeDatabase = (): AppState => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  
  if (existingData) {
    return JSON.parse(existingData);
  }

  const initialState: AppState = {
    project: DEFAULT_PROJECT,
    users: [DEFAULT_ADMIN],
    issues: [],
    sprints: [],
    invitations: [],
    activities: [],
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return initialState;
};

// Get all data
export const getData = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initializeDatabase();
};

// Save data
export const saveData = (data: AppState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Activity logging
const logActivity = (
  type: Activity['type'],
  userId: string,
  details: string,
  issueId?: string,
  sprintId?: string,
  metadata?: any
): void => {
  const data = getData();
  const activity: Activity = {
    id: `activity-${Date.now()}-${Math.random()}`,
    type,
    userId,
    issueId,
    sprintId,
    details,
    metadata,
    createdAt: new Date().toISOString(),
  };
  data.activities = data.activities || [];
  data.activities.unshift(activity); // Add to beginning
  // Keep only last 200 activities
  if (data.activities.length > 200) {
    data.activities = data.activities.slice(0, 200);
  }
  saveData(data);
};

// Auth functions
export const login = (email: string, password: string): User | null => {
  const data = getData();
  const user = data.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  
  return null;
};

export const signup = (name: string, email: string, password: string): User | null => {
  const data = getData();
  
  // Check if user already exists
  if (data.users.find(u => u.email === email)) {
    return null;
  }

  // Check if there's a pending invitation
  const invitation = data.invitations.find(
    inv => inv.email === email && inv.status === 'pending'
  );

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    avatar: `👤`,
    role: invitation?.role || 'member',
    assignedIssues: 0,
    completedIssues: 0,
    createdAt: new Date().toISOString(),
  };

  data.users.push(newUser);
  
  // Mark invitation as accepted if exists
  if (invitation) {
    invitation.status = 'accepted';
  }
  
  saveData(data);
  
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(AUTH_KEY);
  return user ? JSON.parse(user) : null;
};

// User management
export const getUsers = (): User[] => {
  return getData().users;
};

export const updateUser = (userId: string, updates: Partial<User>): void => {
  const data = getData();
  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    data.users[userIndex] = { ...data.users[userIndex], ...updates };
    saveData(data);
  }
};

export const deleteUser = (userId: string): void => {
  const data = getData();
  data.users = data.users.filter(u => u.id !== userId);
  saveData(data);
};

// Issue management
export const getIssues = (): Issue[] => {
  return getData().issues;
};

export const addIssue = (issue: Issue): void => {
  const data = getData();
  data.issues.push(issue);
  saveData(data);
  logActivity('issue_created', issue.reporterId, `created ${issue.key}: ${issue.title}`, issue.id);
};

export const updateIssue = (issueId: string, updates: Partial<Issue>): void => {
  const data = getData();
  const issueIndex = data.issues.findIndex(i => i.id === issueId);
  if (issueIndex !== -1) {
    const oldIssue = data.issues[issueIndex];
    const currentUserId = getCurrentUser()?.id || oldIssue.reporterId;
    
    // Log specific changes
    if (updates.status && updates.status !== oldIssue.status) {
      logActivity('status_changed', currentUserId, `moved ${oldIssue.key} to ${updates.status}`, issueId);
    }
    if (updates.assigneeId && updates.assigneeId !== oldIssue.assigneeId) {
      logActivity('issue_assigned', currentUserId, `assigned ${oldIssue.key}`, issueId, undefined, { assigneeId: updates.assigneeId });
    }
    
    data.issues[issueIndex] = { 
      ...oldIssue, 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // General update activity
    if (!updates.status && !updates.assigneeId) {
      logActivity('issue_updated', currentUserId, `updated ${oldIssue.key}`, issueId);
    }
    
    saveData(data);
  }
};

export const deleteIssue = (issueId: string): void => {
  const data = getData();
  data.issues = data.issues.filter(i => i.id !== issueId);
  saveData(data);
};

// Sprint management
export const getSprints = (): Sprint[] => {
  return getData().sprints;
};

export const addSprint = (sprint: Sprint): void => {
  const data = getData();
  data.sprints.push(sprint);
  saveData(data);
  const currentUserId = getCurrentUser()?.id || 'admin-1';
  logActivity('sprint_created', currentUserId, `created sprint "${sprint.name}"`, undefined, sprint.id);
};

export const updateSprint = (sprintId: string, updates: Partial<Sprint>): void => {
  const data = getData();
  const sprintIndex = data.sprints.findIndex(s => s.id === sprintId);
  if (sprintIndex !== -1) {
    data.sprints[sprintIndex] = { ...data.sprints[sprintIndex], ...updates };
    saveData(data);
  }
};

export const deleteSprint = (sprintId: string): void => {
  const data = getData();
  data.sprints = data.sprints.filter(s => s.id !== sprintId);
  saveData(data);
};

export const completeSprint = (sprintId: string): void => {
  const data = getData();
  const sprint = data.sprints.find(s => s.id === sprintId);
  
  if (sprint && sprint.status === 'active') {
    sprint.status = 'completed';
    sprint.endDate = new Date().toISOString();
    
    // Move incomplete issues back to backlog
    data.issues.forEach(issue => {
      if (issue.sprintId === sprintId && issue.status !== 'done') {
        issue.sprintId = undefined;
        issue.status = 'backlog';
      }
    });
    
    saveData(data);
  }
};

export const startSprint = (sprintId: string): void => {
  const data = getData();
  
  // Deactivate all active sprints
  data.sprints.forEach(s => {
    if (s.status === 'active') {
      s.status = 'completed';
    }
  });
  
  const sprint = data.sprints.find(s => s.id === sprintId);
  if (sprint) {
    sprint.status = 'active';
    sprint.startDate = new Date().toISOString();
    saveData(data);
    const currentUserId = getCurrentUser()?.id || 'admin-1';
    logActivity('sprint_started', currentUserId, `started sprint "${sprint.name}"`, undefined, sprintId);
  }
};

// Invitation management
export const getInvitations = (): Invitation[] => {
  return getData().invitations;
};

export const addInvitation = (invitation: Invitation): void => {
  const data = getData();
  data.invitations.push(invitation);
  saveData(data);
};

export const updateInvitation = (invitationId: string, updates: Partial<Invitation>): void => {
  const data = getData();
  const invIndex = data.invitations.findIndex(i => i.id === invitationId);
  if (invIndex !== -1) {
    data.invitations[invIndex] = { ...data.invitations[invIndex], ...updates };
    saveData(data);
  }
};

export const deleteInvitation = (invitationId: string): void => {
  const data = getData();
  data.invitations = data.invitations.filter(i => i.id !== invitationId);
  saveData(data);
};

// Project management
export const getProject = (): Project => {
  return getData().project;
};

export const updateProject = (updates: Partial<Project>): void => {
  const data = getData();
  data.project = { ...data.project, ...updates };
  saveData(data);
};

// Comments
export const addComment = (issueId: string, userId: string, text: string): void => {
  const data = getData();
  const issue = data.issues.find(i => i.id === issueId);
  if (issue) {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId,
      text,
      createdAt: new Date().toISOString(),
    };
    issue.comments.push(comment);
    issue.updatedAt = new Date().toISOString();
    saveData(data);
    logActivity('comment_added', userId, `commented on ${issue.key}`, issueId);
  }
};

// Work Logs
export const addWorkLog = (issueId: string, userId: string, timeSpent: number, description: string): void => {
  const data = getData();
  const issue = data.issues.find(i => i.id === issueId);
  if (issue) {
    const workLog: WorkLog = {
      id: `worklog-${Date.now()}`,
      userId,
      timeSpent,
      description,
      createdAt: new Date().toISOString(),
    };
    issue.workLogs = issue.workLogs || [];
    issue.workLogs.push(workLog);
    issue.updatedAt = new Date().toISOString();
    saveData(data);
    logActivity('work_logged', userId, `logged ${timeSpent}h on ${issue.key}`, issueId);
  }
};

// Issue Links
export const addIssueLink = (issueId: string, targetIssueId: string, linkType: IssueLink['type']): void => {
  const data = getData();
  const issue = data.issues.find(i => i.id === issueId);
  if (issue) {
    const link: IssueLink = {
      id: `link-${Date.now()}`,
      type: linkType,
      targetIssueId,
    };
    issue.links = issue.links || [];
    issue.links.push(link);
    issue.updatedAt = new Date().toISOString();
    saveData(data);
  }
};

export const removeIssueLink = (issueId: string, linkId: string): void => {
  const data = getData();
  const issue = data.issues.find(i => i.id === issueId);
  if (issue && issue.links) {
    issue.links = issue.links.filter(l => l.id !== linkId);
    issue.updatedAt = new Date().toISOString();
    saveData(data);
  }
};

// Attachments
export const addAttachment = async (issueId: string, userId: string, file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = getData();
      const issue = data.issues.find(i => i.id === issueId);
      if (issue) {
        const attachment: Attachment = {
          id: `attachment-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result as string,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        };
        issue.attachments = issue.attachments || [];
        issue.attachments.push(attachment);
        issue.updatedAt = new Date().toISOString();
        saveData(data);
        logActivity('file_attached', userId, `attached ${file.name} to ${issue.key}`, issueId);
        resolve();
      } else {
        reject(new Error('Issue not found'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const removeAttachment = (issueId: string, attachmentId: string): void => {
  const data = getData();
  const issue = data.issues.find(i => i.id === issueId);
  if (issue && issue.attachments) {
    issue.attachments = issue.attachments.filter(a => a.id !== attachmentId);
    issue.updatedAt = new Date().toISOString();
    saveData(data);
  }
};

// Get activities
export const getActivities = (): Activity[] => {
  const data = getData();
  return data.activities || [];
};
