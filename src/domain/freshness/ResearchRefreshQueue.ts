/**
 * ResearchRefreshQueue.ts
 * Phase 15 — Priority-Based Data Refresh Queue.
 */

import { PhaseNodeId, AnalysisDependencyGraph } from '../orchestration/AnalysisDependencyGraph';
import { RefreshPriority } from './ResearchFreshnessEngine';

export interface RefreshQueueTask {
  taskId: string;
  projectId: string;
  category: string;
  priority: RefreshPriority;
  targetPhases: PhaseNodeId[];
  reason: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  enqueuedAt: string;
  completedAt?: string;
  errorDetails?: string;
}

export class ResearchRefreshQueue {
  private tasks: RefreshQueueTask[] = [];

  constructor(initialTasks: RefreshQueueTask[] = []) {
    this.tasks = [...initialTasks];
  }

  /**
   * Enqueues a refresh task for a stale data category.
   */
  public enqueue(
    projectId: string,
    category: string,
    priority: RefreshPriority,
    reason: string
  ): RefreshQueueTask {
    const inputCategoryMap: Record<string, any> = {
      MARKET_PRICE: 'MARKET_PRICE_TICK',
      TECHNICAL_DATA: 'TECHNICAL_CHART_OHLCV',
      NEWS: 'CORPORATE_NEWS_EVENT',
      SHAREHOLDING: 'SHAREHOLDING_PATTERN',
      FINANCIAL_STATEMENTS: 'ANNUAL_REPORT_FILING',
      MANAGEMENT_GUIDANCE: 'CONCALL_TRANSCRIPT',
      INDUSTRY_DATA: 'INDUSTRY_SECTOR_DATA',
      VALUATION_INPUTS: 'VALUATION_ASSUMPTION_OVERRIDE',
    };

    const inputCat = inputCategoryMap[category] || 'MARKET_PRICE_TICK';
    const targetPhases = AnalysisDependencyGraph.getInvalidatedPhasesForInput(inputCat);

    const task: RefreshQueueTask = {
      taskId: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      category,
      priority,
      targetPhases,
      reason,
      status: 'PENDING',
      enqueuedAt: new Date().toISOString(),
    };

    this.tasks.push(task);
    this.sortTasks();
    return task;
  }

  /**
   * Returns pending tasks sorted by priority (CRITICAL > HIGH > MEDIUM > LOW).
   */
  public getPendingTasks(): RefreshQueueTask[] {
    return this.tasks.filter((t) => t.status === 'PENDING');
  }

  /**
   * Returns all tasks for a project.
   */
  public getTasksForProject(projectId: string): RefreshQueueTask[] {
    return this.tasks.filter((t) => t.projectId === projectId);
  }

  /**
   * Marks a task as completed.
   */
  public markCompleted(taskId: string): void {
    const task = this.tasks.find((t) => t.taskId === taskId);
    if (task) {
      task.status = 'COMPLETED';
      task.completedAt = new Date().toISOString();
    }
  }

  /**
   * Marks a task as failed.
   */
  public markFailed(taskId: string, errorDetails: string): void {
    const task = this.tasks.find((t) => t.taskId === taskId);
    if (task) {
      task.status = 'FAILED';
      task.errorDetails = errorDetails;
      task.completedAt = new Date().toISOString();
    }
  }

  private sortTasks(): void {
    const priorityWeight: Record<RefreshPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    this.tasks.sort((a, b) => {
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(a.enqueuedAt).getTime() - new Date(b.enqueuedAt).getTime();
    });
  }
}
