import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Issue, Sprint, Project, Invitation, AppState, Activity, WorkLog, IssueLink, Attachment } from '../types';
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
    // Check if user is already logged in
    const user = db.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const refreshData = () => {
    setAppState(db.getData());
  };

  const login = (email: string, password: string): boolean => {
    const user = db.login(email, password);
    if (user) {
      setCurrentUser(user);
      refreshData();
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    const user = db.signup(name, email, password);
    if (user) {
      setCurrentUser(user);
      refreshData();
      return true;
    }
    return false;
  };

  const logout = () => {
    db.logout();
    setCurrentUser(null);
  };

  const updateProject = (updates: Partial<Project>) => {
    db.updateProject(updates);
    refreshData();
  };

  const inviteUser = (email: string, role: 'admin' | 'member') => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const invitation: Invitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      invitedBy: currentUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      projectId: appState.project.id,
    };

    db.addInvitation(invitation);
    refreshData();
  };

  const addIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const issue: Issue = {
      ...issueData,
      id: `issue-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addIssue(issue);
    
    // Update user's assigned issues count
    if (issue.assigneeId) {
      const assignee = appState.users.find(u => u.id === issue.assigneeId);
      if (assignee) {
        db.updateUser(assignee.id, { assignedIssues: assignee.assignedIssues + 1 });
      }
    }
    
    refreshData();
  };

  const updateIssue = (issueId: string, updates: Partial<Issue>) => {
    const oldIssue = appState.issues.find(i => i.id === issueId);
    
    db.updateIssue(issueId, updates);
    
    // Update assignee counts if assignee changed
    if (updates.assigneeId && oldIssue && updates.assigneeId !== oldIssue.assigneeId) {
      if (oldIssue.assigneeId) {
        const oldAssignee = appState.users.find(u => u.id === oldIssue.assigneeId);
        if (oldAssignee) {
          db.updateUser(oldAssignee.id, { assignedIssues: Math.max(0, oldAssignee.assignedIssues - 1) });
        }
      }
      
      const newAssignee = appState.users.find(u => u.id === updates.assigneeId);
      if (newAssignee) {
        db.updateUser(newAssignee.id, { assignedIssues: newAssignee.assignedIssues + 1 });
      }
    }
    
    // Update completed count if status changed to done
    if (updates.status === 'done' && oldIssue && oldIssue.status !== 'done' && oldIssue.assigneeId) {
      const assignee = appState.users.find(u => u.id === oldIssue.assigneeId);
      if (assignee) {
        db.updateUser(assignee.id, { completedIssues: assignee.completedIssues + 1 });
      }
    }
    
    refreshData();
  };

  const deleteIssue = (issueId: string) => {
    const issue = appState.issues.find(i => i.id === issueId);
    
    if (issue?.assigneeId) {
      const assignee = appState.users.find(u => u.id === issue.assigneeId);
      if (assignee) {
        db.updateUser(assignee.id, { assignedIssues: Math.max(0, assignee.assignedIssues - 1) });
      }
    }
    
    db.deleteIssue(issueId);
    refreshData();
  };

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

  const addComment = (issueId: string, text: string) => {
    db.addComment(issueId, currentUser!.id, text);
    refreshData();
  };

  const addWorkLog = (issueId: string, timeSpent: number, description: string) => {
    db.addWorkLog(issueId, currentUser!.id, timeSpent, description);
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
    await db.addAttachment(issueId, currentUser!.id, file);
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
        activities: appState.activities || [],
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
