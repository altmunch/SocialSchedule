import { Platform } from '../../deliverables/types/deliverables_types';
import { ContentNiche } from '../types/niche_types';
import { AIImprovementService } from './AIImprovementService';
import { DataCollectionAgent, DataGap } from './agents/DataCollectionAgent';
import { ContentOptimizationAgent } from './agents/ContentOptimizationAgent';
import { EngagementPredictionAgent } from '../../reports/services/EngagementPredictionAgent';
import { ABTestingAgent } from './agents/ABTestingAgent';
import { NicheSpecializationAgent } from './agents/NicheSpecializationAgent';
import { UIAgent } from './agents/UIAgent';
import { updateModel, evaluateModel } from '../functions/updateModel';

export interface SystemMetrics {
  averageEngagementRate: number;
  contentQualityScore: number;
  viralContentPercentage: number;
  userSatisfactionScore: number;
  systemEfficiency: number;
  modelAccuracy: number;
  dataQuality: number;
  systemUptime: number;
  averageResponseTime: number;
  agentConflictRate: number;
}

export interface AgentStatus {
  agentId: string;
  agentType: string;
  status: 'active' | 'idle' | 'error' | 'training';
  currentTask?: string;
  performance: number;
  resourceUtilization: number;
  lastUpdate: Date;
}

export interface OptimizationObjective {
  type: 'engagement' | 'quality' | 'efficiency' | 'virality';
  target: number;
  current: number;
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
}

export interface ResourceAllocation {
  agentId: string;
  cpuAllocation: number;
  memoryAllocation: number;
  gpuAllocation?: number;
  priority: number;
}

export interface CrossWorkflowOptimization {
  workflowId: string;
  optimizationType: string;
  expectedImprovement: number;
  implementation: string[];
  risks: string[];
}

export interface MasterOrchestratorDecision {
  timestamp: Date;
  agentTasks: Record<string, any>;
  resourceAllocations: ResourceAllocation[];
  modelTrainingSchedule: Record<string, Date>;
  abTestingPriorities: string[];
  crossWorkflowOptimizations: CrossWorkflowOptimization[];
  alertsAndNotifications: string[];
}

// --- PID Controller for resource allocation (T5.1) ---
class PIDController {
  private integral = 0;
  private previousError = 0;
  constructor(private kp: number, private ki: number, private kd: number) {}
  update(setpoint: number, measured: number, dt: number): number {
    const error = setpoint - measured;
    this.integral += error * dt;
    const derivative = (error - this.previousError) / dt;
    this.previousError = error;
    return this.kp * error + this.ki * this.integral + this.kd * derivative;
  }
}

/**
 * Master Orchestrator Agent - The primary coordinator for all AI improvement activities
 * 
 * This agent manages the entire multi-agent system, making high-level decisions about:
 * - Agent coordination and task assignment
 * - Resource allocation and optimization
 * - Model training schedules
 * - Cross-workflow optimization priorities
 * - System performance monitoring
 */
export class MasterOrchestratorAgent {
  private agents: Map<string, any>;
  private systemMetrics: SystemMetrics;
  private activeObjectives: OptimizationObjective[];
  private resourceAllocations: ResourceAllocation[];
  private aiImprovementService: AIImprovementService;
  private isRunning: boolean = false;
  private cycleInterval: NodeJS.Timeout | null = null;
  private lastEngagementModelTrainTime: Date | null = null;
  private lastContentPatternsUpdateTime: Date | null = null;
  private lastDataGapCheckTime: Date | null = null;

  constructor() {
    this.agents = new Map();
    this.activeObjectives = [];
    this.resourceAllocations = [];
    this.aiImprovementService = new AIImprovementService();
    this.systemMetrics = this.initializeSystemMetrics();
    this.initializeAgents();
  }

  /**
   * Initialize all specialized agents
   */
  private initializeAgents(): void {
    // Initialize core agents
    this.agents.set('data_collector', new DataCollectionAgent());
    this.agents.set('content_optimizer', new ContentOptimizationAgent());
    this.agents.set('engagement_predictor', new EngagementPredictionAgent({} as any));
    this.agents.set('ab_tester', new ABTestingAgent());
    this.agents.set('ui_agent', new UIAgent());

    // Initialize niche specialization agents
    for (const niche of Object.values(ContentNiche)) {
      this.agents.set(`niche_${niche}`, new NicheSpecializationAgent(niche));
    }

    console.log(`Initialized ${this.agents.size} specialized agents`);
  }

  /**
   * Initialize system metrics with baseline values
   */
  private initializeSystemMetrics(): SystemMetrics {
    return {
      averageEngagementRate: 0,
      contentQualityScore: 0,
      viralContentPercentage: 0,
      userSatisfactionScore: 0,
      systemEfficiency: 0,
      modelAccuracy: 0,
      dataQuality: 0,
      systemUptime: 99.9,
      averageResponseTime: 200,
      agentConflictRate: 0,
    };
  }

  /**
   * Start the master orchestrator
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Master Orchestrator is already running');
      return;
    }

    console.log('🚀 Starting Master AI Improvement Orchestrator...');
    
    try {
      // Initialize AI improvement service
      await this.aiImprovementService.initialize();
      
      // Set optimization objectives
      this.setOptimizationObjectives();
      
      // Start all agents
      await this.startAllAgents();
      
      // Begin orchestration cycle
      this.isRunning = true;
      this.cycleInterval = setInterval(
        () => this.runOrchestrationCycle().catch(console.error),
        30000 // Run every 30 seconds
      );
      
      console.log('✅ Master Orchestrator started successfully');
    } catch (error) {
      console.error('❌ Failed to start Master Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Stop the master orchestrator
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('🛑 Stopping Master AI Improvement Orchestrator...');
    
    this.isRunning = false;
    
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
    
    // Stop all agents
    await this.stopAllAgents();
    
    console.log('✅ Master Orchestrator stopped');
  }

  /**
   * Main orchestration cycle - runs every 30 seconds
   */
  private async runOrchestrationCycle(): Promise<void> {
    // Feedback loop for objectives
    this.updateObjectiveWeights();
    try {
      console.log('🔄 Running orchestration cycle...');

      // 1. Update system metrics
      await this.updateSystemMetrics();

      // 2. Monitor agent statuses
      const agentStatuses = await this.getAgentStatuses();

      // 2.5. Get current data gaps from DataCollectionAgent
      const dataCollector = this.agents.get('data_collector') as DataCollectionAgent;
      let currentDataGaps: DataGap[] = [];
      if (dataCollector && typeof dataCollector.getDataGaps === 'function') {
        currentDataGaps = dataCollector.getDataGaps();
        // Periodically trigger a data gap analysis by the DataCollectionAgent if it's idle
        const dcStatus = agentStatuses.find(s => s.agentId === 'data_collector');
        if (dcStatus && dcStatus.status === 'idle' && (!this.lastDataGapCheckTime || new Date().getTime() - this.lastDataGapCheckTime.getTime() > 6 * 60 * 60 * 1000)) { // e.g. every 6 hours
          console.log('Triggering periodic data gap monitoring for DataCollectionAgent.');
          // This task assignment will be handled more formally in makeOrchestrationDecision if needed
          // For now, let's assume this might prompt the agent internally or through a task.
          // A more direct way: await dataCollector.executeTask({ type: 'monitor_gaps', niche: ContentNiche.FITNESS, platform: Platform.TIKTOK, priority: 'low', requirements: {} as any });
          // However, tasking agents should ideally be part of the decision logic.
          this.lastDataGapCheckTime = new Date(); 
        }
      } else {
        console.warn('DataCollectionAgent not found or getDataGaps method missing.');
      }

      // 3. Make orchestration decision
      const decision = await this.makeOrchestrationDecision(agentStatuses, currentDataGaps);

      // 4. Execute decision
      await this.executeDecision(decision);

      // 5. Log cycle completion
      console.log('✅ Orchestration cycle completed');

    } catch (error) {
      console.error('❌ Error in orchestration cycle:', error);
    }
  }

  /**
   * Generate orchestration decision using intelligent analysis
   */
  private async makeOrchestrationDecision(agentStatuses: AgentStatus[], dataGaps: DataGap[]): Promise<MasterOrchestratorDecision> {
    // Use intelligent decision making instead of mock implementation
    return this.generateIntelligentDecision(agentStatuses, dataGaps);
  }

  /**
   * Generate intelligent orchestration decision based on system analysis
   */
  private generateIntelligentDecision(agentStatuses: AgentStatus[], dataGaps: DataGap[]): MasterOrchestratorDecision {
    const decision: MasterOrchestratorDecision = {
      timestamp: new Date(),
      agentTasks: {},
      resourceAllocations: [],
      modelTrainingSchedule: {},
      abTestingPriorities: [],
      crossWorkflowOptimizations: [],
      alertsAndNotifications: [],
    };

    // Analyze system performance and prioritize actions
    const systemAnalysis = this.analyzeSystemPerformance();
    const criticalIssues = this.identifyCriticalIssues(systemAnalysis, dataGaps);
    
    // Generate tasks based on priority analysis
    this.assignHighPriorityTasks(decision, agentStatuses, criticalIssues);
    this.scheduleModelTraining(decision, systemAnalysis);
    this.optimizeResourceAllocation(decision, agentStatuses, systemAnalysis);
    this.planCrossWorkflowOptimizations(decision, systemAnalysis);

    return decision;
  }

  /**
   * Analyze current system performance to identify areas needing attention
   */
  private analyzeSystemPerformance(): {
    engagementCritical: boolean;
    qualityCritical: boolean;
    viralityCritical: boolean;
    efficiencyCritical: boolean;
    modelAccuracyCritical: boolean;
    dataQualityCritical: boolean;
    overallHealth: 'critical' | 'warning' | 'good';
  } {
    const metrics = this.systemMetrics;
    const objectives = this.activeObjectives;

    const engagementTarget = objectives.find(o => o.type === 'engagement')?.target || 0.05;
    const qualityTarget = objectives.find(o => o.type === 'quality')?.target || 0.8;
    const viralityTarget = objectives.find(o => o.type === 'virality')?.target || 0.1;
    const efficiencyTarget = objectives.find(o => o.type === 'efficiency')?.target || 0.8;

    const analysis = {
      engagementCritical: metrics.averageEngagementRate < engagementTarget * 0.7,
      qualityCritical: metrics.contentQualityScore < qualityTarget * 0.7,
      viralityCritical: metrics.viralContentPercentage < viralityTarget * 0.5,
      efficiencyCritical: metrics.systemEfficiency < efficiencyTarget * 0.7,
      modelAccuracyCritical: metrics.modelAccuracy < 0.8,
      dataQualityCritical: metrics.dataQuality < 0.7,
      overallHealth: 'good' as 'critical' | 'warning' | 'good'
    };

    // Determine overall system health
    const criticalCount = Object.values(analysis).filter(v => v === true).length;
    if (criticalCount >= 3) {
      analysis.overallHealth = 'critical';
    } else if (criticalCount >= 1) {
      analysis.overallHealth = 'warning';
    }

    return analysis;
  }

  /**
   * Identify critical issues that need immediate attention
   */
  private identifyCriticalIssues(systemAnalysis: any, dataGaps: DataGap[]): {
    priority: 'critical' | 'high' | 'medium' | 'low';
    type: string;
    description: string;
    affectedAgents: string[];
    recommendedActions: string[];
  }[] {
    const issues = [];

    // Data quality issues
    const criticalGaps = dataGaps.filter(gap => gap.severity === 'critical');
    if (criticalGaps.length > 0) {
      issues.push({
        priority: 'critical' as const,
        type: 'data_quality',
        description: `Critical data gaps in ${criticalGaps.length} areas`,
        affectedAgents: ['DataCollectionAgent', 'ContentOptimizationAgent'],
        recommendedActions: ['prioritize_data_collection', 'optimize_collection_strategies']
      });
    }

    // Performance issues
    if (systemAnalysis.engagementCritical) {
      issues.push({
        priority: 'critical' as const,
        type: 'engagement_performance',
        description: 'Engagement rates critically below target',
        affectedAgents: ['EngagementPredictionAgent', 'ABTestingAgent', 'ContentOptimizationAgent'],
        recommendedActions: ['retrain_engagement_models', 'create_engagement_experiments', 'optimize_content_strategy']
      });
    }

    if (systemAnalysis.modelAccuracyCritical) {
      issues.push({
        priority: 'high' as const,
        type: 'model_accuracy',
        description: 'Model accuracy below acceptable threshold',
        affectedAgents: ['EngagementPredictionAgent', 'ContentOptimizationAgent'],
        recommendedActions: ['retrain_models', 'collect_more_training_data']
      });
    }

    return issues.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Assign high priority tasks based on critical issues
   */
  private assignHighPriorityTasks(
    decision: MasterOrchestratorDecision, 
    agentStatuses: AgentStatus[], 
    criticalIssues: any[]
  ): void {
    for (const issue of criticalIssues) {
      for (const agentType of issue.affectedAgents) {
        const agent = agentStatuses.find(a => a.agentType === agentType);
        if (!agent || decision.agentTasks[agent.agentId]) continue;

        const task = this.generateTaskForIssue(issue, agentType);
        if (task) {
          decision.agentTasks[agent.agentId] = task;
          decision.alertsAndNotifications.push(
            `Assigned ${issue.priority} priority task to ${agentType}: ${issue.description}`
          );
        }
      }
    }

    // Assign tasks to remaining idle agents
    for (const agent of agentStatuses) {
      if (agent.status === 'idle' && !decision.agentTasks[agent.agentId]) {
        const task = this.generateOptimalTaskForAgent(agent);
        if (task) {
          decision.agentTasks[agent.agentId] = task;
        }
      }
    }
  }

  /**
   * Generate specific task for addressing an issue
   */
  private generateTaskForIssue(issue: any, agentType: string): any {
    switch (agentType) {
      case 'DataCollectionAgent':
        if (issue.type === 'data_quality') {
          return {
            type: 'optimize_collection',
            priority: 'critical',
            niche: ContentNiche.FITNESS, // Could be determined from data gaps
            platform: Platform.TIKTOK,
            requirements: {
              minSamples: 1000,
              qualityThreshold: 0.9,
              timeRange: '7d',
              contentTypes: ['video', 'image']
            }
          };
        }
        break;

      case 'EngagementPredictionAgent':
        if (issue.type === 'engagement_performance' || issue.type === 'model_accuracy') {
          return {
            type: 'update_predictions',
            priority: 'critical',
            modelType: 'engagement_rate',
            retraining: true,
            focus: 'accuracy_improvement'
          };
        }
        break;

      case 'ABTestingAgent':
        if (issue.type === 'engagement_performance') {
          return {
            type: 'create_experiment',
            priority: 'critical',
            experimentDetails: {
              name: `EngagementRecovery_${Date.now()}`,
              description: 'Emergency experiment to recover engagement rates',
              platform: Platform.TIKTOK,
              targetMetric: 'engagementRate',
              duration: 3, // Shorter duration for urgent testing
              userId: 'MasterOrchestrator'
            },
            parameters: { engagement_focus: true, urgent: true }
          };
        }
        break;

      case 'ContentOptimizationAgent':
        return {
          type: 'optimize_content',
          priority: 'critical',
          focus: ['captions', 'hashtags', 'timing'],
          niche: ContentNiche.FITNESS,
          parameters: { emergency_optimization: true }
        };
    }

    return null;
  }

  /**
   * Generate optimal task for agent based on current system state
   */
  private generateOptimalTaskForAgent(agent: AgentStatus): any {
    const systemMetrics = this.systemMetrics;
    
    switch (agent.agentType) {
      case 'DataCollectionAgent':
        // Focus on areas with lowest data quality
        return {
          type: 'validate_quality',
          priority: systemMetrics.dataQuality < 0.8 ? 'high' : 'medium',
          niche: this.getLowestPerformingNiche(),
          platform: this.getLowestPerformingPlatform(),
          requirements: {
            minSamples: 500,
            qualityThreshold: 0.8,
            timeRange: '14d',
            contentTypes: ['video']
          }
        };

      case 'ContentOptimizationAgent':
        return {
          type: 'update_optimization_models',
          priority: systemMetrics.contentQualityScore < 0.8 ? 'high' : 'medium',
          focus: this.identifyOptimizationFocus(),
        };

      case 'ABTestingAgent':
        return {
          type: 'analyze_experiment',
          priority: 'medium',
          parameters: { focus_on_underperforming: true }
        };

      default:
        return {
          type: 'status_check',
          priority: 'low',
          timestamp: new Date(),
        };
    }
  }

  /**
   * Schedule model training based on system analysis
   */
  private scheduleModelTraining(decision: MasterOrchestratorDecision, systemAnalysis: any): void {
    const now = new Date();
    
    // Schedule engagement model training if accuracy is low or hasn't been trained recently
    if (systemAnalysis.modelAccuracyCritical || systemAnalysis.engagementCritical) {
      decision.modelTrainingSchedule['engagement_prediction'] = new Date(now.getTime() + 30000); // 30 seconds
      decision.alertsAndNotifications.push('Scheduling urgent engagement model retraining');
    } else if (!this.lastEngagementModelTrainTime || 
               now.getTime() - this.lastEngagementModelTrainTime.getTime() > 24 * 60 * 60 * 1000) {
      decision.modelTrainingSchedule['engagement_prediction'] = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    }

    // Schedule content optimization pattern updates
    if (systemAnalysis.qualityCritical || 
        !this.lastContentPatternsUpdateTime ||
        now.getTime() - this.lastContentPatternsUpdateTime.getTime() > 12 * 60 * 60 * 1000) {
      decision.modelTrainingSchedule['content_optimization_patterns'] = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes
      decision.alertsAndNotifications.push('Scheduling content optimization pattern update');
    }
  }

  /**
   * Optimize resource allocation based on system analysis
   */
  private optimizeResourceAllocation(decision: MasterOrchestratorDecision, agentStatuses: AgentStatus[], systemAnalysis: any): void {
    decision.resourceAllocations = this.optimizeResourceAllocations(agentStatuses);
    
    // Boost resources for critical agents
    if (systemAnalysis.overallHealth === 'critical') {
      decision.resourceAllocations.forEach(allocation => {
        const agent = agentStatuses.find(a => a.agentId === allocation.agentId);
        if (agent && this.isCriticalAgent(agent.agentType, systemAnalysis)) {
          allocation.cpuAllocation *= 1.5;
          allocation.memoryAllocation *= 1.2;
          allocation.priority = Math.min(10, allocation.priority + 3);
        }
      });
    }
  }

  /**
   * Plan cross-workflow optimizations
   */
  private planCrossWorkflowOptimizations(decision: MasterOrchestratorDecision, systemAnalysis: any): void {
    const optimizations: CrossWorkflowOptimization[] = [];

    if (systemAnalysis.engagementCritical) {
      optimizations.push({
        workflowId: 'data_collection_to_content_optimization',
        optimizationType: 'data_flow_optimization',
        expectedImprovement: 15,
        implementation: [
          'Prioritize high-engagement content data collection',
          'Feed real-time engagement data to content optimization',
          'Implement feedback loop between optimization and collection'
        ],
        risks: ['Increased data collection costs', 'Potential data quality issues']
      });
    }

    if (systemAnalysis.modelAccuracyCritical) {
      optimizations.push({
        workflowId: 'ai_improvement_to_all_workflows',
        optimizationType: 'model_accuracy_improvement',
        expectedImprovement: 25,
        implementation: [
          'Retrain all prediction models with latest data',
          'Implement cross-validation across workflows',
          'Add model performance monitoring'
        ],
        risks: ['Training time overhead', 'Temporary performance degradation']
      });
    }

    decision.crossWorkflowOptimizations = optimizations;
  }

  /**
   * Check if agent type is critical for current system issues
   */
  private isCriticalAgent(agentType: string, systemAnalysis: any): boolean {
    if (systemAnalysis.engagementCritical && 
        ['EngagementPredictionAgent', 'ABTestingAgent', 'ContentOptimizationAgent'].includes(agentType)) {
      return true;
    }
    if (systemAnalysis.dataQualityCritical && agentType === 'DataCollectionAgent') {
      return true;
    }
    if (systemAnalysis.qualityCritical && agentType === 'ContentOptimizationAgent') {
      return true;
    }
    return false;
  }

  /**
   * Get the niche with lowest performance
   */
  private getLowestPerformingNiche(): ContentNiche {
    // In a real implementation, this would analyze performance data
    // For now, return a default that commonly needs attention
    return ContentNiche.FITNESS;
  }

  /**
   * Get the platform with lowest performance
   */
  private getLowestPerformingPlatform(): Platform {
    // In a real implementation, this would analyze performance data
    // For now, return a default that commonly needs attention
    return Platform.TIKTOK;
  }

  /**
   * Identify areas that need optimization focus
   */
  private identifyOptimizationFocus(): string[] {
    const focus = [];
    if (this.systemMetrics.averageEngagementRate < 0.05) {
      focus.push('captions', 'hashtags');
    }
    if (this.systemMetrics.viralContentPercentage < 0.1) {
      focus.push('timing', 'visuals');
    }
    return focus.length > 0 ? focus : ['captions'];
  }

  /**
   * Execute the orchestration decision
   */
  private async executeDecision(decision: MasterOrchestratorDecision): Promise<void> {
    console.log('📋 Executing orchestration decision:', {
      agentTasks: Object.keys(decision.agentTasks).length,
      resourceAllocations: decision.resourceAllocations.length,
      abTestPriorities: decision.abTestingPriorities.length,
      crossWorkflowOptimizations: decision.crossWorkflowOptimizations.length,
    });

    // Execute agent tasks
    for (const [agentId, task] of Object.entries(decision.agentTasks)) {
      const agent = this.agents.get(agentId);
      if (agent && typeof agent.executeTask === 'function') {
        try {
          await agent.executeTask(task);
        } catch (error) {
          console.error(`Error executing task for agent ${agentId}:`, error);
        }
      }
    }

    // Update resource allocations
    this.resourceAllocations = decision.resourceAllocations;

    // Schedule model training
    for (const [model, schedule] of Object.entries(decision.modelTrainingSchedule)) {
      setTimeout(() => this.trainModel(model), schedule.getTime() - Date.now());
    }

    // Process alerts
    for (const alert of decision.alertsAndNotifications) {
      console.log('🚨 System Alert:', alert);
    }
  }

  /**
   * Update system metrics from all sources
   */
  private async updateSystemMetrics(): Promise<void> {
    try {
      // Get real metrics from AI improvement service
      const aiMetrics = await this.aiImprovementService.getSystemMetrics();
      
      // Get current agent statuses for system health calculation
      const agentStatuses = await this.getAgentStatuses();
      const activeAgents = agentStatuses.filter(a => a.status === 'active').length;
      const totalAgents = agentStatuses.length;
      
      // Calculate system efficiency based on agent performance
      const avgAgentPerformance = agentStatuses.length > 0 
        ? agentStatuses.reduce((sum, a) => sum + a.performance, 0) / agentStatuses.length
        : 0.5;
      
      // Calculate average response time based on system load
      const systemLoad = agentStatuses.reduce((sum, a) => sum + a.resourceUtilization, 0) / agentStatuses.length;
      const baseResponseTime = 150;
      const loadMultiplier = 1 + systemLoad * 0.5; // Higher load = higher response time
      
      // Update metrics with intelligent calculations
      this.systemMetrics = {
        // Use AI service metrics if available, otherwise calculate intelligently
        averageEngagementRate: aiMetrics?.averageEngagementRate || this.calculateEngagementRate(),
        contentQualityScore: aiMetrics?.contentQualityScore || this.calculateContentQualityScore(),
        viralContentPercentage: aiMetrics?.viralContentPercentage || this.calculateViralContentPercentage(),
        userSatisfactionScore: aiMetrics?.userSatisfactionScore || this.calculateUserSatisfactionScore(),
        
        // Calculate system efficiency based on agent performance and uptime
        systemEfficiency: Math.min(100, avgAgentPerformance * 100 * (activeAgents / Math.max(1, totalAgents))),
        
        // Model accuracy from AI improvement service or calculated
        modelAccuracy: aiMetrics?.modelAccuracy || this.calculateModelAccuracy(),
        
        // Data quality from AI improvement service or calculated
        dataQuality: aiMetrics?.dataQuality || this.calculateDataQuality(),
        
        // System uptime (assume good unless agents are failing)
        systemUptime: Math.min(100, 95 + (activeAgents / Math.max(1, totalAgents)) * 5),
        
        // Response time based on system load
        averageResponseTime: baseResponseTime * loadMultiplier,
        
        // Agent conflict rate based on error states
        agentConflictRate: agentStatuses.filter(a => a.status === 'error').length / Math.max(1, totalAgents),
      };

      console.log('📊 System metrics updated:', {
        engagement: `${(this.systemMetrics.averageEngagementRate * 100).toFixed(2)}%`,
        quality: `${this.systemMetrics.contentQualityScore.toFixed(2)}/10`,
        efficiency: `${this.systemMetrics.systemEfficiency.toFixed(1)}%`,
        modelAccuracy: `${(this.systemMetrics.modelAccuracy * 100).toFixed(1)}%`,
        dataQuality: `${(this.systemMetrics.dataQuality * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.error('Error updating system metrics:', error);
      // Fallback to previous metrics or defaults if update fails
    }
  }

  /**
   * Calculate engagement rate based on recent performance data
   */
  private calculateEngagementRate(): number {
    // Get engagement data from feature store if available
    try {
      const { featureStore } = require('../functions/feedbackLoop');
      if (featureStore.contentPerformance && featureStore.contentPerformance.length > 0) {
        const recentData = featureStore.contentPerformance.slice(-50); // Last 50 entries
        const avgEngagement = recentData.reduce((sum: number, item: any) => sum + (item.engagementRate || 0), 0) / recentData.length;
        return Math.max(0.01, Math.min(0.3, avgEngagement)); // Clamp between 1% and 30%
      }
    } catch (error) {
      console.warn('Could not access feature store for engagement calculation');
    }
    
    // Fallback calculation based on objectives
    const engagementObjective = this.activeObjectives.find(o => o.type === 'engagement');
    if (engagementObjective) {
      return Math.max(0.01, engagementObjective.current || 0.05);
    }
    
    return 0.05; // Default 5% engagement rate
  }

  /**
   * Calculate content quality score based on recent performance
   */
  private calculateContentQualityScore(): number {
    try {
      const { featureStore } = require('../functions/feedbackLoop');
      if (featureStore.contentPerformance && featureStore.contentPerformance.length > 0) {
        const recentData = featureStore.contentPerformance.slice(-30);
        const avgQuality = recentData.reduce((sum: number, item: any) => sum + (item.qualityScore || 0.5), 0) / recentData.length;
        return Math.max(5, Math.min(10, avgQuality * 10)); // Convert to 1-10 scale
      }
    } catch (error) {
      console.warn('Could not access feature store for quality calculation');
    }
    
    // Fallback based on objectives
    const qualityObjective = this.activeObjectives.find(o => o.type === 'quality');
    if (qualityObjective) {
      return Math.max(5, qualityObjective.current || 7);
    }
    
    return 7.5; // Default quality score
  }

  /**
   * Calculate viral content percentage
   */
  private calculateViralContentPercentage(): number {
    try {
      const { featureStore } = require('../functions/feedbackLoop');
      if (featureStore.contentPerformance && featureStore.contentPerformance.length > 0) {
        const recentData = featureStore.contentPerformance.slice(-100);
        const viralThreshold = 0.15; // 15% engagement rate threshold for viral
        const viralCount = recentData.filter((item: any) => (item.engagementRate || 0) > viralThreshold).length;
        return Math.min(25, (viralCount / recentData.length) * 100);
      }
    } catch (error) {
      console.warn('Could not access feature store for viral calculation');
    }
    
    // Fallback based on objectives
    const viralityObjective = this.activeObjectives.find(o => o.type === 'virality');
    if (viralityObjective) {
      return Math.max(1, viralityObjective.current || 8);
    }
    
    return 8; // Default 8% viral content
  }

  /**
   * Calculate user satisfaction score
   */
  private calculateUserSatisfactionScore(): number {
    // Calculate based on system performance and engagement
    const engagementFactor = this.systemMetrics.averageEngagementRate * 100; // 0-30 range
    const qualityFactor = this.systemMetrics.contentQualityScore * 10; // 50-100 range
    const efficiencyFactor = this.systemMetrics.systemEfficiency; // 0-100 range
    
    const satisfaction = (engagementFactor * 0.4 + qualityFactor * 0.4 + efficiencyFactor * 0.2);
    return Math.max(70, Math.min(100, satisfaction));
  }

  /**
   * Calculate model accuracy based on recent training results
   */
  private calculateModelAccuracy(): number {
    try {
      const { getModelInfo } = require('../functions/updateModel');
      const modelInfo = getModelInfo();
      if (modelInfo && modelInfo.metrics) {
        // Use R² score as accuracy metric, convert to 0-1 range
        const r2Score = modelInfo.metrics.r2;
        return Math.max(0.5, Math.min(1, r2Score > 0 ? r2Score : 0.7));
      }
    } catch (error) {
      console.warn('Could not access model info for accuracy calculation');
    }
    
    return 0.8; // Default 80% accuracy
  }

  /**
   * Calculate data quality based on recent data collection
   */
  private calculateDataQuality(): number {
    try {
      const { featureStore } = require('../functions/feedbackLoop');
      if (featureStore.contentPerformance && featureStore.contentPerformance.length > 0) {
        const recentData = featureStore.contentPerformance.slice(-50);
        // Calculate quality based on data completeness and recency
        const completeness = recentData.filter((item: any) => 
          item.engagementRate !== undefined && 
          item.likeRatio !== undefined && 
          item.publishTime !== undefined
        ).length / recentData.length;
        
        const recency = recentData.filter((item: any) => {
          const age = Date.now() - new Date(item.publishTime).getTime();
          return age < 7 * 24 * 60 * 60 * 1000; // Less than 7 days old
        }).length / recentData.length;
        
        return Math.max(0.7, Math.min(1, (completeness * 0.6 + recency * 0.4)));
      }
    } catch (error) {
      console.warn('Could not access feature store for data quality calculation');
    }
    
    return 0.85; // Default 85% data quality
  }

  /**
   * Get current status of all agents
   */
  private async getAgentStatuses(): Promise<AgentStatus[]> {
    const statuses: AgentStatus[] = [];

    for (const [agentId, agent] of this.agents.entries()) {
      try {
        const status: AgentStatus = {
          agentId,
          agentType: this.getAgentType(agentId),
          status: agent.getStatus ? await agent.getStatus() : 'idle',
          currentTask: agent.getCurrentTask ? await agent.getCurrentTask() : undefined,
          performance: await this.calculateAgentPerformance(agent, agentId),
          resourceUtilization: await this.calculateResourceUtilization(agent),
          lastUpdate: new Date(),
        };

        statuses.push(status);
      } catch (error) {
        console.error(`Error getting status for agent ${agentId}:`, error);
        // Add agent with error status
        statuses.push({
          agentId,
          agentType: this.getAgentType(agentId),
          status: 'error',
          performance: 0.1, // Low performance for error state
          resourceUtilization: 0,
          lastUpdate: new Date(),
        });
      }
    }

    return statuses;
  }

  /**
   * Calculate intelligent agent performance based on actual metrics
   */
  private async calculateAgentPerformance(agent: any, agentId: string): Promise<number> {
    // Try to get real performance from agent
    if (agent.getPerformance && typeof agent.getPerformance === 'function') {
      try {
        const realPerformance = await agent.getPerformance();
        if (typeof realPerformance === 'number' && !isNaN(realPerformance)) {
          return Math.max(0, Math.min(1, realPerformance));
        }
      } catch (error) {
        console.warn(`Failed to get real performance for ${agentId}:`, error);
      }
    }

    // Calculate performance based on agent type and system metrics
    const agentType = this.getAgentType(agentId);
    const systemMetrics = this.systemMetrics;

    switch (agentType) {
      case 'DataCollectionAgent':
        // Performance based on data quality and collection effectiveness
        return Math.min(1, 
          systemMetrics.dataQuality * 0.6 + 
          (systemMetrics.systemEfficiency / 100) * 0.4
        );

      case 'ContentOptimizationAgent':
        // Performance based on content quality improvements
        return Math.min(1,
          (systemMetrics.contentQualityScore / 10) * 0.7 +
          (systemMetrics.averageEngagementRate * 10) * 0.3
        );

      case 'EngagementPredictionAgent':
        // Performance based on model accuracy and engagement predictions
        return Math.min(1,
          systemMetrics.modelAccuracy * 0.8 +
          (systemMetrics.averageEngagementRate * 5) * 0.2
        );

      case 'ABTestingAgent':
        // Performance based on experiment success and system efficiency
        return Math.min(1,
          (systemMetrics.systemEfficiency / 100) * 0.6 +
          (systemMetrics.averageEngagementRate * 8) * 0.4
        );

      case 'NicheSpecializationAgent':
        // Performance based on niche-specific content quality
        return Math.min(1,
          (systemMetrics.contentQualityScore / 10) * 0.5 +
          (systemMetrics.viralContentPercentage / 20) * 0.5
        );

      case 'UIAgent':
        // Performance based on user satisfaction and system responsiveness
        return Math.min(1,
          (systemMetrics.userSatisfactionScore / 100) * 0.7 +
          (300 - systemMetrics.averageResponseTime) / 300 * 0.3
        );

      default:
        // Default performance calculation for unknown agent types
        return Math.min(1,
          (systemMetrics.systemEfficiency / 100) * 0.5 +
          (systemMetrics.modelAccuracy) * 0.5
        );
    }
  }

  /**
   * Calculate intelligent resource utilization
   */
  private async calculateResourceUtilization(agent: any): Promise<number> {
    // Try to get real resource utilization from agent
    if (agent.getResourceUtilization && typeof agent.getResourceUtilization === 'function') {
      try {
        const realUtilization = await agent.getResourceUtilization();
        if (typeof realUtilization === 'number' && !isNaN(realUtilization)) {
          return Math.max(0, Math.min(1, realUtilization));
        }
      } catch (error) {
        console.warn(`Failed to get real resource utilization for agent:`, error);
      }
    }

    // Calculate based on agent status and current task
    const status = agent.getStatus ? await agent.getStatus() : 'idle';
    const hasCurrentTask = agent.getCurrentTask ? !!(await agent.getCurrentTask()) : false;

    switch (status) {
      case 'active':
        return hasCurrentTask ? 0.7 + Math.random() * 0.2 : 0.3 + Math.random() * 0.2;
      case 'training':
        return 0.8 + Math.random() * 0.15;
      case 'error':
        return 0.1 + Math.random() * 0.1;
      case 'idle':
      default:
        return 0.1 + Math.random() * 0.15;
    }
  }

  /**
   * Get agent type from agent ID
   */
  private getAgentType(agentId: string): string {
    // Extract agent type from ID or return the ID if it's already a type
    if (agentId.includes('_')) {
      return agentId.split('_')[0];
    }
    return agentId;
  }

  /**
   * Set optimization objectives
   */
  private setOptimizationObjectives(): void {
    this.activeObjectives = [
      {
        type: 'engagement',
        target: 0.15, // 15% engagement rate
        current: this.systemMetrics.averageEngagementRate,
        priority: 'high',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        type: 'quality',
        target: 8.5,
        current: this.systemMetrics.contentQualityScore,
        priority: 'high',
      },
      {
        type: 'virality',
        target: 15, // 15% viral rate
        current: this.systemMetrics.viralContentPercentage,
        priority: 'medium',
      },
      {
        type: 'efficiency',
        target: 95, // 95% efficiency
        current: this.systemMetrics.systemEfficiency,
        priority: 'medium',
      },
    ];
  }

  /**
   * Generate task for specific agent based on its status
   */
  private generateTaskForAgent(status: AgentStatus): any {
    switch (status.agentType) {
      case 'DataCollectionAgent':
        return {
          type: 'optimize_collection',
          niche: Object.values(ContentNiche)[Math.floor(Math.random() * Object.values(ContentNiche).length)],
          platform: Object.values(Platform)[Math.floor(Math.random() * Object.values(Platform).length)],
          priority: status.performance < 0.5 ? 'high' : 'medium',
        };

      case 'ContentOptimizationAgent':
        return {
          type: 'optimize_content',
          focus: ['captions', 'hashtags', 'timing'][Math.floor(Math.random() * 3)],
          niche: Object.values(ContentNiche)[Math.floor(Math.random() * Object.values(ContentNiche).length)],
        };

      case 'EngagementPredictionAgent':
        return {
          type: 'update_predictions',
          modelType: 'engagement_rate',
          retraining: status.performance < 0.7,
        };

      case 'ABTestingAgent':
        // If MasterOrchestrator already decided to send a prioritize_experiments task with directives,
        // that would have been set in decision.agentTasks[status.agentId] in generateMockDecision.
        // This part handles other scenarios for an idle or underperforming ABTestingAgent.
        const engagementObj = this.activeObjectives.find(obj => obj.type === 'engagement');
        if (engagementObj && this.systemMetrics.averageEngagementRate < engagementObj.target) {
            // Suggest creating a new experiment if engagement is low
            // This implicitly covers leveraging generateExperimentOpportunities
            return {
                type: 'create_experiment',
                priority: 'high',
                experimentDetails: {
                    name: `EngagementBoost_Exp_${Date.now()}`,
                    description: 'Experiment to boost low engagement rate.',
                    platform: Platform.TIKTOK, // Default or determine dynamically
                    baseContent: { caption: 'Current average caption style', hashtags: ['general'] }, // Placeholder
                    variationType: 'caption', // Default or determine dynamically
                    targetMetric: 'engagementRate',
                    duration: 7, 
                    userId: 'MasterOrchestrator',
                },
                parameters: { engagement_focus: true } // Reinforce focus
            };
        }
        // Default task if no specific action identified by generateMockDecision or above logic
        return {
            type: 'manage_experiment_lifecycle', // General check-up/management task
            priority: 'medium',
        };

      default:
        return {
          type: 'status_check',
          timestamp: new Date(),
        };
    }
  }

  /**
   * Generate cross-workflow optimizations
   */
  private generateCrossWorkflowOptimizations(): CrossWorkflowOptimization[] {
    return [
      {
        workflowId: 'data_collection',
        optimizationType: 'api_rate_optimization',
        expectedImprovement: 15,
        implementation: [
          'Implement intelligent rate limiting',
          'Optimize API call batching',
          'Add predictive rate limit management',
        ],
        risks: ['Potential API throttling', 'Increased complexity'],
      },
      {
        workflowId: 'autoposting',
        optimizationType: 'engagement_prediction_integration',
        expectedImprovement: 25,
        implementation: [
          'Integrate real-time engagement predictions',
          'Implement dynamic posting schedule optimization',
          'Add content quality pre-filtering',
        ],
        risks: ['Model dependency', 'Prediction accuracy requirements'],
      },
    ];
  }

  /**
   * Optimize resource allocations based on agent performance
   */
  private optimizeResourceAllocations(agentStatuses: AgentStatus[]): ResourceAllocation[] {
    // PID controller for CPU allocation
    const pid = new PIDController(0.5, 0.1, 0.05);
    const allocations: ResourceAllocation[] = [];
    for (const status of agentStatuses) {
      // Target utilization: 0.7 (70%)
      const setpoint = 0.7;
      const measured = status.resourceUtilization;
      // Assume dt = 1 for simplicity
      const cpu = Math.max(0.1, Math.min(2, 1 + pid.update(setpoint, measured, 1)));
      allocations.push({
        agentId: status.agentId,
        cpuAllocation: cpu,
        memoryAllocation: 1024,
        gpuAllocation: 0,
        priority: this.calculatePriority(status, this.systemMetrics, this.activeObjectives),
      });
    }
    return allocations;
  }

  /**
   * Calculate priority for agent
   */
  private calculatePriority(status: AgentStatus, systemMetrics: SystemMetrics, activeObjectives: OptimizationObjective[]): number {
    let priority: number;

    if (status.status === 'error') {
      priority = 10; // Highest priority for error recovery
    } else if (status.performance < 0.5) {
      priority = 8; // High priority for poor performance
    } else if (status.resourceUtilization > 0.9) {
      priority = 6; // Medium-high for resource constrained
    } else {
      priority = Math.floor(status.performance * 5) + 1; // 1-5 based on performance
    }

    // Boost priority based on system objectives
    for (const objective of activeObjectives) {
      if (objective.priority === 'high') {
        let isCriticalAgentForObjective = false;
        switch (objective.type) {
          case 'engagement':
            if (systemMetrics.averageEngagementRate < objective.target && 
                (status.agentType === 'EngagementPredictionAgent' || status.agentType === 'ABTestingAgent' || status.agentType === 'ContentOptimizationAgent')) {
              isCriticalAgentForObjective = true;
            }
            break;
          case 'quality':
            if (systemMetrics.contentQualityScore < objective.target && 
                (status.agentType === 'ContentOptimizationAgent' || status.agentType === 'DataCollectionAgent')) {
              isCriticalAgentForObjective = true;
            }
            break;
          case 'virality':
            if (systemMetrics.viralContentPercentage < objective.target &&
                (status.agentType === 'ContentOptimizationAgent' || status.agentType === 'ABTestingAgent')) {
              isCriticalAgentForObjective = true;
            }
            break;
          // Add cases for other objective types like 'efficiency' if specific agents are critical
        }

        if (isCriticalAgentForObjective) {
          priority = Math.min(10, priority + 2); // Boost by 2, capped at 10
        }
      }
    }
    return priority;
  }

  /**
   * Train a specific model
   */
  private async trainModel(modelName: string): Promise<void> {
    console.log(`🎯 Training model: ${modelName}`);
    
    try {
      if (modelName === 'engagement_prediction') {
        console.log('Initiating engagement prediction model training (updateModel, evaluateModel)...');
        updateModel();
        const newMSE = evaluateModel();
        this.lastEngagementModelTrainTime = new Date();
        console.log(`✅ Engagement prediction model training completed. New MSE: ${newMSE.toFixed(4)}`);

      } else if (modelName === 'content_optimization_patterns') {
        console.log('Initiating content optimization patterns update...');
        await this.aiImprovementService.updateContentOptimizationPatterns();
        this.lastContentPatternsUpdateTime = new Date();
        console.log('✅ Content optimization patterns update completed.');

      } else {
        console.warn(`Unknown model name "${modelName}" passed to trainModel.`);
        // Simulate training time for other potential models
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`✅ Model ${modelName} (simulated) training completed`);
      }
    } catch (error) {
      console.error(`❌ Model ${modelName} training failed:`, error);
    }
  }

  /**
   * Start all agents
   */
  private async startAllAgents(): Promise<void> {
    console.log('🚀 Starting all agents...');
    
    for (const [agentId, agent] of this.agents.entries()) {
      try {
        if (typeof agent.start === 'function') {
          await agent.start();
        }
        console.log(`✅ Agent ${agentId} started`);
      } catch (error) {
        console.error(`❌ Failed to start agent ${agentId}:`, error);
      }
    }
  }

  /**
   * Stop all agents
   */
  private async stopAllAgents(): Promise<void> {
    console.log('🛑 Stopping all agents...');
    
    for (const [agentId, agent] of this.agents.entries()) {
      try {
        if (typeof agent.stop === 'function') {
          await agent.stop();
        }
        console.log(`✅ Agent ${agentId} stopped`);
      } catch (error) {
        console.error(`❌ Failed to stop agent ${agentId}:`, error);
      }
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus(): {
    isRunning: boolean;
    metrics: SystemMetrics;
    objectives: OptimizationObjective[];
    agentCount: number;
    resourceAllocations: ResourceAllocation[];
  } {
    return {
      isRunning: this.isRunning,
      metrics: this.systemMetrics,
      objectives: this.activeObjectives,
      agentCount: this.agents.size,
      resourceAllocations: this.resourceAllocations,
    };
  }

  /**
   * Update optimization objective
   */
  updateObjective(type: OptimizationObjective['type'], updates: Partial<OptimizationObjective>): void {
    const objectiveIndex = this.activeObjectives.findIndex(obj => obj.type === type);
    if (objectiveIndex >= 0) {
      this.activeObjectives[objectiveIndex] = {
        ...this.activeObjectives[objectiveIndex],
        ...updates,
      };
    }
  }

  /**
   * Force immediate orchestration cycle
   */
  async forceOrchestrationCycle(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Master Orchestrator is not running');
    }
    
    await this.runOrchestrationCycle();
  }

  // T5.2: Feedback loop for objective weights
  private updateObjectiveWeights(): void {
    // Example: if system efficiency drops, increase weight on efficiency
    const eff = this.systemMetrics.systemEfficiency;
    for (const obj of this.activeObjectives) {
      if (obj.type === 'efficiency') {
        if (eff < 0.8) obj.priority = 'high';
        else if (eff < 0.9) obj.priority = 'medium';
        else obj.priority = 'low';
      }
    }
  }
}

// Export singleton instance
export const masterOrchestratorAgent = new MasterOrchestratorAgent();