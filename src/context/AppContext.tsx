import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User, Issue, Sprint, Project, Invitation, AppState, Activity, IssueLink,
} from '../types';
import * as db from '../services/database';

interface AppContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;

  // Project
  project: Project;
  updateProject: (updates: Partial<Project>) => void;

  // Users
  users: User[];
  inviteUser: (email: string, role: 'admin' | 'member') => void;

  // Issues
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIssue: (issueId: string, updates: Partial<Issue>) => void;
  deleteIssue: (issueId: string) => void;
  addComment: (issueId: string, text: string) => void;
  addWorkLog: (issueId: string, timeSpent: number, description: string) => void;
  addIssueLink: (issueId: string, targetIssueId: string, linkType: IssueLink['type']) => void;
  removeIssueLink: (issueId: string, linkId: string) => void;
  addAttachment: (issueId: string, file: File) => Promise<void>;
  removeAttachment: (issueId: string, attachmentId: string) => void;

  // Sprints
  sprints: Sprint[];
  addSprint: (sprint: Omit<Sprint, 'id' | 'createdAt'>) => void;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
  deleteSprint: (sprintId: string) => void;
  startSprint: (sprintId: string) => void;
  completeSprint: (sprintId: string) => void;

  // Invitations
  invitations: Invitation[];

  // Activities
  activities: Activity[];

  // Utility
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>(() => db.initializeDatabase());

  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const refreshData = () => setAppState(db.getData());

  // ── Auth ────────────────────────────────────────────────────────────────

  const login = (email: string, password: string): boolean => {
    const user = db.login(email, password);
    if (!user) return false;
    setCurrentUser(user);
    refreshData();
    return true;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    const user = db.signup(name, email, password);
    if (!user) return false;
    setCurrentUser(user);
    refreshData();
    return true;
  };

  const logout = () => {
    db.logout();
    setCurrentUser(null);
  };

  // ── Project ──────────────────────────────────────────────────────────────

  const updateProject = (updates: Partial<Project>) => {
    db.updateProject(updates);
    refreshData();
  };

  // ── Users ────────────────────────────────────────────────────────────────

  const inviteUser = (email: string, role: 'admin' | 'member') => {
    if (currentUser?.role !== 'admin') return;
    const { project } = db.getData();
    const invitation: Invitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      invitedBy: currentUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      projectId: project.id,
    };
    db.addInvitation(invitation);
    refreshData();
  };

  // ── Issues ───────────────────────────────────────────────────────────────

  const addIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    const issue: Issue = {
      ...issueData,
      id: `issue-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.addIssue(issue);

    // Update assignee counter using fresh data (avoid stale closure)
    if (issue.assigneeId) {
      const fresh = db.getData();
      const assignee = fresh.users.find(u => u.id === issue.assigneeId);
      if (assignee) db.updateUser(assignee.id, { assignedIssues: assignee.assignedIssues + 1 });
    }
    refreshData();
  };

  const updateIssue = (issueId: string, updates: Partial<Issue>) => {
    // Always read fresh data so we never operate on stale state
    const fresh = db.getData();
    const oldIssue = fresh.issues.find(i => i.id === issueId);

    db.updateIssue(issueId, updates);

    if (oldIssue) {
      // Assignee changed → update counters
      if (updates.assigneeId !== undefined && updates.assigneeId !== oldIssue.assigneeId) {
        if (oldIssue.assigneeId) {
          const prev = fresh.users.find(u => u.id === oldIssue.assigneeId);
          if (prev) db.updateUser(prev.id, { assignedIssues: Math.max(0, prev.assignedIssues - 1) });
        }
        if (updates.assigneeId) {
          const next = fresh.users.find(u => u.id === updates.assigneeId);
          if (next) db.updateUser(next.id, { assignedIssues: next.assignedIssues + 1 });
        }
      }

      // Completed for the first time → increment completedIssues
      if (updates.status === 'done' && oldIssue.status !== 'done' && oldIssue.assigneeId) {
        const assignee = fresh.users.find(u => u.id === oldIssue.assigneeId);
        if (assignee) db.updateUser(assignee.id, { completedIssues: assignee.completedIssues + 1 });
      }
    }
    refreshData();
  };

  const deleteIssue = (issueId: string) => {
    const fresh = db.getData();
    const issue = fresh.issues.find(i => i.id === issueId);
    if (issue?.assigneeId) {
      const assignee = fresh.users.find(u => u.id === issue.assigneeId);
      if (assignee) db.updateUser(assignee.id, { assignedIssues: Math.max(0, assignee.assignedIssues - 1) });
    }
    db.deleteIssue(issueId);
    refreshData();
  };

  // ── Sprints ──────────────────────────────────────────────────────────────

  const addSprint = (sprintData: Omit<Sprint, 'id' | 'createdAt'>) => {
    const sprint: Sprint = {
      ...sprintData,
      id: `sprint-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.addSprint(sprint);
    refreshData();
  };

  const updateSprint = (sprintId: string, updates: Partial<Sprint>) => {
    db.updateSprint(sprintId, updates);
    refreshData();
  };

  const deleteSprint = (sprintId: string) => {
    db.deleteSprint(sprintId);
    refreshData();
  };

  const startSprint = (sprintId: string) => {
    db.startSprint(sprintId);
    refreshData();
  };

  const completeSprint = (sprintId: string) => {
    db.completeSprint(sprintId);
    refreshData();
  };

  // ── Collaboration ────────────────────────────────────────────────────────

  const addComment = (issueId: string, text: string) => {
    if (!currentUser) return;
    db.addComment(issueId, currentUser.id, text);
    refreshData();
  };

  const addWorkLog = (issueId: string, timeSpent: number, description: string) => {
    if (!currentUser) return;
    db.addWorkLog(issueId, currentUser.id, timeSpent, description);
    refreshData();
  };

  const addIssueLink = (issueId: string, targetIssueId: string, linkType: IssueLink['type']) => {
    db.addIssueLink(issueId, targetIssueId, linkType);
    refreshData();
  };

  const removeIssueLink = (issueId: string, linkId: string) => {
    db.removeIssueLink(issueId, linkId);
    refreshData();
  };

  const addAttachment = async (issueId: string, file: File) => {
    if (!currentUser) return;
    await db.addAttachment(issueId, currentUser.id, file);
    refreshData();
  };

  const removeAttachment = (issueId: string, attachmentId: string) => {
    db.removeAttachment(issueId, attachmentId);
    refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        project: appState.project,
        updateProject,
        users: appState.users,
        inviteUser,
        issues: appState.issues,
        addIssue,
        updateIssue,
        deleteIssue,
        addComment,
        addWorkLog,
        addIssueLink,
        removeIssueLink,
        addAttachment,
        removeAttachment,
        sprints: appState.sprints,
        addSprint,
        updateSprint,
        deleteSprint,
        startSprint,
        completeSprint,
        invitations: appState.invitations,
        activities: appState.activities ?? [],
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
