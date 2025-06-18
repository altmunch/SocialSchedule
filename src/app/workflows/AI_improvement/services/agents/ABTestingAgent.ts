import { aiImprovementService } from '../AIImprovementService';
import { Experiment, ExperimentAnalysis, Platform } from '../../../AI_improvement/functions/abTesting'; // Adjusted path
import { ContentNiche } from '../../types/niche_types';

export interface ABTestingTask {
  type: 'create_experiment' | 'analyze_experiment' | 'prioritize_experiments' | 'manage_experiment_lifecycle';
  experimentId?: string;
  experimentDetails?: Partial<Experiment> & { 
    baseContent?: { caption: string; hashtags: string[] }; 
    variationType?: 'caption' | 'hashtags' | 'tone' | 'length'; 
    duration?: number; // days
    userId?: string;
  };
  platform?: Platform;
  niche?: ContentNiche;
  priority?: 'high' | 'medium' | 'low';
  parameters?: Record<string, any>; // For directives like engagement_focus, virality_focus
}

/**
 * A/B Testing Agent
 * 
 * Specializes in designing, managing, and analyzing A/B tests to identify 
 * optimal content strategies and features.
 */
export class ABTestingAgent {
  private isActive: boolean = false;
  private currentTask: ABTestingTask | null = null;
  private performanceScore: number = 0.8;
  private taskSuccessCount: number = 0;
  private taskFailureCount: number = 0;
  private totalTasksCompleted: number = 0;
  private resourceConsumptionHistory: number[] = [];
  private activeExperiments: Map<string, Experiment> = new Map();

  constructor() {
    // Initialization logic for the A/B testing agent
  }

  async start(): Promise<void> {
    this.isActive = true;
    console.log(`ABTestingAgent started.`);
  }

  async stop(): Promise<void> {
    this.isActive = false;
    this.currentTask = null;
    console.log(`ABTestingAgent stopped.`);
  }

  async executeTask(task: ABTestingTask): Promise<any> {
    this.currentTask = task;
    this.totalTasksCompleted++;
    const startTime = process.hrtime.bigint();
    let result: any = null;

    try {
      switch (task.type) {
        case 'create_experiment':
          result = await this.createExperiment(task);
          break;
        case 'analyze_experiment':
          result = await this.analyzeExperiment(task);
          break;
        case 'prioritize_experiments':
          result = await this.prioritizeExperiments(task);
          break;
        case 'manage_experiment_lifecycle':
          await this.manageExperimentLifecycle(task);
          break;
        default:
          console.warn(`Unknown task type for ABTestingAgent: ${task.type}`);
          this.taskFailureCount++;
          break;
      }
      this.taskSuccessCount++;
    } catch (error) {
      console.error(`ABTestingAgent task failed: ${error}`);
      this.taskFailureCount++;
    } finally {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      this.recordResourceConsumption(durationMs);
      this.updatePerformanceScore();
      this.currentTask = null;
      return result;
    }
  }

  private async createExperiment(task: ABTestingTask): Promise<Experiment | null> {
    if (!task.experimentDetails || !task.experimentDetails.name || !task.experimentDetails.platform || !task.experimentDetails.baseContent || !task.experimentDetails.variationType || !task.experimentDetails.targetMetric || !task.experimentDetails.userId) {
      console.error('Missing details for create_experiment task.');
      return null;
    }
    console.log('Creating A/B test with details:', task.experimentDetails);
    const expRequest = {
        name: task.experimentDetails.name,
        description: task.experimentDetails.description || 'A/B Test',
        platform: task.experimentDetails.platform,
        baseContent: task.experimentDetails.baseContent,
        variationType: task.experimentDetails.variationType,
        targetMetric: task.experimentDetails.targetMetric,
        duration: task.experimentDetails.duration || 7, // Default 7 days
        userId: task.experimentDetails.userId,
    };
    const { experiment } = await aiImprovementService.createABTest(expRequest);
    if (experiment) {
        this.activeExperiments.set(experiment.id, experiment);
    }
    return experiment;
  }

  private async analyzeExperiment(task: ABTestingTask): Promise<ExperimentAnalysis | null> {
    if (!task.experimentId) {
      console.error('Experiment ID is required for analysis.');
      return null;
    }
    console.log(`Analyzing A/B test: ${task.experimentId}`);
    const { analysis } = await aiImprovementService.analyzeABTest(task.experimentId);
    // Update experiment status based on analysis
    if (analysis && (analysis.status === 'significant_difference' || analysis.status === 'no_significant_difference')) {
        const exp = this.activeExperiments.get(task.experimentId);
        if (exp) {
            exp.status = 'completed';
        }
    }
    return analysis;
  }

  private async prioritizeExperiments(task: ABTestingTask): Promise<string[]> {
    console.log('Prioritizing A/B experiments based on directives:', task.parameters);
    // Placeholder: In a real scenario, this would involve complex logic based on impact, feasibility,
    // system objectives, and directives from MasterOrchestrator (e.g., focus on engagement or virality)
    const prioritizedList = Array.from(this.activeExperiments.keys());
    
    if (task.parameters?.engagement_focus) {
        // Logic to prioritize experiments targeting engagement
        console.log('Prioritizing for engagement.');
    }
    if (task.parameters?.virality_focus) {
        // Logic to prioritize experiments targeting virality (e.g., shares, views)
        console.log('Prioritizing for virality.');
    }

    console.log('Current A/B experiment priorities (mock):', prioritizedList);
    return prioritizedList;
  }

  private async manageExperimentLifecycle(task: ABTestingTask): Promise<void> {
    console.log('Managing A/B experiment lifecycle for task:', task);
    // Placeholder: Logic to start, pause, or conclude experiments based on time or performance.
    if (task.experimentId && task.parameters?.action) {
        const exp = this.activeExperiments.get(task.experimentId);
        if (exp) {
            console.log(`Performing action: ${task.parameters.action} on experiment ${task.experimentId}`);
            // exp.status = task.parameters.action; // e.g., 'paused', 'running'
        }
    }
  }
  
  async getActiveExperiments(): Promise<Experiment[]> {
      return Array.from(this.activeExperiments.values());
  }

  async getStatus(): Promise<'active' | 'idle' | 'error'> {
    if (!this.isActive) return 'idle';
    if (this.performanceScore < 0.3) return 'error';
    return this.currentTask ? 'active' : 'idle';
  }

  async getPerformance(): Promise<number> {
    return this.performanceScore;
  }

  async getResourceUtilization(): Promise<number> {
    if (this.resourceConsumptionHistory.length === 0) return 0;
    const sum = this.resourceConsumptionHistory.reduce((acc, val) => acc + val, 0);
    const average = sum / this.resourceConsumptionHistory.length;
    return Math.min(1, average / 1000);
  }

  async getCurrentTask(): Promise<string | undefined> {
    return this.currentTask ? `${this.currentTask.type}${this.currentTask.experimentId ? ` - ${this.currentTask.experimentId}` : ''}` : undefined;
  }

  private recordResourceConsumption(durationMs: number): void {
    this.resourceConsumptionHistory.push(durationMs);
    if (this.resourceConsumptionHistory.length > 100) {
      this.resourceConsumptionHistory.shift();
    }
  }

  private updatePerformanceScore(): void {
    if (this.totalTasksCompleted === 0) {
      this.performanceScore = 0.8;
      return;
    }
    const successRate = this.taskSuccessCount / this.totalTasksCompleted;
    this.performanceScore = 0.5 * successRate + 0.3 * (1 - this.getResourceUtilization()) + 0.2 * this.performanceScore;
    this.performanceScore = Math.max(0.1, Math.min(1.0, this.performanceScore));
  }
} 