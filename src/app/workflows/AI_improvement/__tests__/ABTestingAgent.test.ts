import { ABTestingAgent, ABTestingTask } from '../services/agents/ABTestingAgent';
import { aiImprovementService } from '../services/AIImprovementService';
import { Platform, Experiment, ExperimentVariant, ExperimentAnalysis, ExperimentResult } from '../functions/abTesting';
import { ContentNiche } from '../types/niche_types';

// Mock the AIImprovementService for A/B testing related functions
jest.mock('../services/AIImprovementService', () => ({
  aiImprovementService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    createABTest: jest.fn().mockImplementation((request) => Promise.resolve({
      experiment: {
        id: 'exp_mock_123',
        name: request.name,
        description: request.description,
        platform: request.platform,
        status: 'draft',
        variants: request.variationType === 'caption' ? [
            { id: 'v1', name: 'Original', description: 'Original', config: {}, weight: 50 }, 
            { id: 'v2', name: 'Optimized', description: 'Optimized', config: {}, weight: 50 }
        ] : [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        targetMetric: request.targetMetric,
        minimumSampleSize: 100,
        confidenceLevel: 0.95,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: request.userId,
      } as Experiment,
      variants: [],
      assignmentInstructions: 'Assign users using assignVariant()',
    })),
    analyzeABTest: jest.fn().mockImplementation((experimentId) => Promise.resolve({
      analysis: {
        experimentId,
        status: 'insufficient_data',
        results: [] as ExperimentResult[],
        confidenceLevel: 0.95,
        recommendations: ['Collect more data'],
        analysisDate: new Date(),
      } as ExperimentAnalysis,
      insights: ['Needs more data'],
      nextSteps: ['Continue running'],
    })),
    // Add other mocks if ContentOptimizationAgent was calling them, but ABTestingAgent doesn't seem to.
  },
}));

describe('ABTestingAgent', () => {
  let agent: ABTestingAgent;

  beforeEach(() => {
    agent = new ABTestingAgent();
    jest.clearAllMocks();
  });

  it('should instantiate correctly', () => {
    expect(agent).toBeInstanceOf(ABTestingAgent);
  });

  it('should start and stop correctly', async () => {
    await agent.start();
    expect(await agent.getStatus()).toBe('idle');
    await agent.stop();
    expect(await agent.getStatus()).toBe('idle');
  });

  it('should execute create_experiment task', async () => {
    await agent.start();
    const task: ABTestingTask = {
      type: 'create_experiment',
      experimentDetails: {
        name: 'Test Experiment',
        description: 'A test A/B experiment',
        platform: Platform.TIKTOK,
        baseContent: { caption: 'Hello', hashtags: ['#world'] },
        variationType: 'caption',
        targetMetric: 'engagementRate',
        duration: 7,
        userId: 'testUser',
      },
    };
    const result = await agent.executeTask(task);
    expect(aiImprovementService.createABTest).toHaveBeenCalled();
    expect(result).toHaveProperty('id', 'exp_mock_123');
    expect((await agent.getActiveExperiments()).length).toBe(1);
  });

  it('should execute analyze_experiment task', async () => {
    await agent.start();
    // First, create an experiment to analyze
    const createTask: ABTestingTask = {
      type: 'create_experiment',
      experimentDetails: { name: 'AnalyzeThis', platform: Platform.INSTAGRAM, baseContent: {caption: 'c', hashtags:[]}, variationType: 'caption', targetMetric: 'views', userId: 'user1' }
    };
    const createdExp = await agent.executeTask(createTask) as Experiment;

    const task: ABTestingTask = { type: 'analyze_experiment', experimentId: createdExp.id };
    const result = await agent.executeTask(task);
    expect(aiImprovementService.analyzeABTest).toHaveBeenCalledWith(createdExp.id);
    expect(result).toHaveProperty('experimentId', createdExp.id);
    expect(result.status).toBe('insufficient_data');
  });

  it('should execute prioritize_experiments task', async () => {
    await agent.start();
    const task: ABTestingTask = { 
        type: 'prioritize_experiments', 
        parameters: { engagement_focus: true } 
    };
    const result = await agent.executeTask(task);
    expect(result).toBeInstanceOf(Array);
    // Further assertions can be added if the mock logic for prioritization becomes more complex
  });

  it('should handle unknown task type gracefully', async () => {
    await agent.start();
    const task = { type: 'some_unknown_task' } as any;
    await expect(agent.executeTask(task)).rejects.toThrow('Unknown task type: some_unknown_task');
  });
  
  it('performance should decrease on task failure', async () => {
    await agent.start();
    (aiImprovementService.createABTest as jest.Mock).mockRejectedValueOnce(new Error('Service create failure'));
    
    const initialPerformance = await agent.getPerformance();
    const task: ABTestingTask = {
      type: 'create_experiment',
      experimentDetails: { name: 'FailExp', platform: Platform.FACEBOOK, baseContent: {caption:'c', hashtags:[]}, variationType:'caption', targetMetric:'likes', userId:'u2' }
    };
    
    await expect(agent.executeTask(task)).rejects.toThrow('Service create failure');
    
    const finalPerformance = await agent.getPerformance();
    expect(finalPerformance).toBeLessThan(initialPerformance);
    expect(finalPerformance).toBeCloseTo(0.7); // 0.8 - 0.1
  });

}); 