/**
 * RbacAuthorizationEngine.ts
 * Phase 18 — Role-Based Access Control & Multi-Tenant Project Authorization.
 * Prevents unauthorized access between users and enforces fine-grained permissions.
 */

import { AuthSession } from './AuthManager';

export type ResourceAction =
  | 'PROJECT_READ'
  | 'PROJECT_WRITE'
  | 'PROJECT_DELETE'
  | 'DOCUMENT_UPLOAD'
  | 'ANALYSIS_EXECUTE'
  | 'VERDICT_OVERRIDE'
  | 'AUDIT_LOG_VIEW'
  | 'ADMIN_CONFIGURE';

export interface ProjectOwnershipRecord {
  projectId: string;
  ownerUserId: string;
  collaborators: string[];
}

export class RbacAuthorizationEngine {
  private static projectOwnership: Map<string, ProjectOwnershipRecord> = new Map();

  private static rolePermissions: Record<AuthSession['role'], ResourceAction[]> = {
    RESEARCH_ANALYST: ['PROJECT_READ', 'PROJECT_WRITE', 'DOCUMENT_UPLOAD', 'ANALYSIS_EXECUTE'],
    SENIOR_RESEARCH_ANALYST: [
      'PROJECT_READ',
      'PROJECT_WRITE',
      'DOCUMENT_UPLOAD',
      'ANALYSIS_EXECUTE',
      'VERDICT_OVERRIDE',
      'AUDIT_LOG_VIEW',
    ],
    COMPLIANCE_OFFICER: ['PROJECT_READ', 'AUDIT_LOG_VIEW'],
    SYSTEM_ADMIN: [
      'PROJECT_READ',
      'PROJECT_WRITE',
      'PROJECT_DELETE',
      'DOCUMENT_UPLOAD',
      'ANALYSIS_EXECUTE',
      'VERDICT_OVERRIDE',
      'AUDIT_LOG_VIEW',
      'ADMIN_CONFIGURE',
    ],
  };

  public static registerProjectOwner(projectId: string, ownerUserId: string, collaborators: string[] = []): void {
    this.projectOwnership.set(projectId, {
      projectId,
      ownerUserId,
      collaborators,
    });
  }

  public static authorizeAction(
    session: AuthSession,
    action: ResourceAction,
    projectId?: string
  ): { isAuthorized: boolean; reason?: string } {
    const allowedActions = this.rolePermissions[session.role] || [];
    if (!allowedActions.includes(action)) {
      return {
        isAuthorized: false,
        reason: `FORBIDDEN: Role ${session.role} lacks permission for ${action}`,
      };
    }

    if (projectId && session.role !== 'SYSTEM_ADMIN' && session.role !== 'COMPLIANCE_OFFICER') {
      const ownership = this.projectOwnership.get(projectId);
      if (ownership) {
        const hasAccess = ownership.ownerUserId === session.userId || ownership.collaborators.includes(session.userId);
        if (!hasAccess) {
          return {
            isAuthorized: false,
            reason: `UNAUTHORIZED_PROJECT_ACCESS: User ${session.userId} is not authorized for project ${projectId}`,
          };
        }
      }
    }

    return { isAuthorized: true };
  }

  public static clear(): void {
    this.projectOwnership.clear();
  }
}
