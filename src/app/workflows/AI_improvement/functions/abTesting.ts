import { Platform } from '../../deliverables/types/deliverables_types';
import { PostMetrics } from '@/app/workflows/data_collection/functions/types';

export { Platform }; // Re-export Platform

// A/B Testing Types
export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  weight: number; // Traffic allocation percentage (0-100)
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  variants: ExperimentVariant[];
  startDate: Date;
  endDate?: Date;
  targetMetric: 'engagementRate' | 'likes' | 'comments' | 'shares' | 'views';
  minimumSampleSize: number;
  confidenceLevel: number; // 0.90, 0.95, 0.99
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ExperimentResult {
  variantId: string;
  sampleSize: number;
  metrics: {
    mean: number;
    standardDeviation: number;
    confidenceInterval: [number, number];
  };
  conversionRate?: number;
  significance?: number;
}

export interface ExperimentAnalysis {
  experimentId: string;
  status: 'insufficient_data' | 'no_significant_difference' | 'significant_difference';
  results: ExperimentResult[];
  winningVariant?: string;
  confidenceLevel: number;
  pValue?: number;
  effectSize?: number;
  recommendations: string[];
  analysisDate: Date;
}

// In-memory storage for experiments (in production, this would be a database)
const experiments: Map<string, Experiment> = new Map();
const experimentData: Map<string, Map<string, PostMetrics[]>> = new Map();

/**
 * Creates a new A/B test experiment
 */
export function createExperiment(experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): Experiment {
  const id = generateExperimentId();
  const now = new Date();
  
  const newExperiment: Experiment = {
    ...experiment,
    id,
    createdAt: now,
    updatedAt: now,
  };

  // Validate experiment configuration
  validateExperiment(newExperiment);
  
  experiments.set(id, newExperiment);
  experimentData.set(id, new Map());
  
  return newExperiment;
}

/**
 * Updates an existing experiment
 */
export function updateExperiment(id: string, updates: Partial<Experiment>): Experiment | null {
  const experiment = experiments.get(id);
  if (!experiment) return null;

  const updatedExperiment = {
    ...experiment,
    ...updates,
    id, // Ensure ID cannot be changed
    updatedAt: new Date(),
  };

  validateExperiment(updatedExperiment);
  experiments.set(id, updatedExperiment);
  
  return updatedExperiment;
}

/**
 * Gets an experiment by ID
 */
export function getExperiment(id: string): Experiment | null {
  return experiments.get(id) || null;
}

/**
 * Lists all experiments with optional filtering
 */
export function listExperiments(filters?: {
  platform?: Platform;
  status?: Experiment['status'];
  createdBy?: string;
}): Experiment[] {
  let results = Array.from(experiments.values());

  if (filters) {
    if (filters.platform) {
      results = results.filter(exp => exp.platform === filters.platform);
    }
    if (filters.status) {
      results = results.filter(exp => exp.status === filters.status);
    }
    if (filters.createdBy) {
      results = results.filter(exp => exp.createdBy === filters.createdBy);
    }
  }

  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Assigns a user to a variant based on experiment configuration
 */
export function assignVariant(experimentId: string, userId: string): ExperimentVariant | null {
  const experiment = experiments.get(experimentId);
  if (!experiment || experiment.status !== 'running') return null;

  // Use consistent hashing to ensure same user always gets same variant
  const hash = hashString(userId + experimentId);
  const normalizedHash = hash % 100;

  let cumulativeWeight = 0;
  for (const variant of experiment.variants) {
    cumulativeWeight += variant.weight;
    if (normalizedHash < cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to first variant
  return experiment.variants[0] || null;
}

/**
 * Records experiment data for analysis
 */
export function recordExperimentData(
  experimentId: string,
  variantId: string,
  data: PostMetrics
): boolean {
  const experiment = experiments.get(experimentId);
  if (!experiment || experiment.status !== 'running') return false;

  const expData = experimentData.get(experimentId);
  if (!expData) return false;

  if (!expData.has(variantId)) {
    expData.set(variantId, []);
  }

  expData.get(variantId)!.push(data);
  return true;
}

/**
 * Analyzes experiment results and determines statistical significance
 */
export function analyzeExperiment(experimentId: string): ExperimentAnalysis | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) return null;

  const expData = experimentData.get(experimentId);
  if (!expData) return null;

  const results: ExperimentResult[] = [];
  
  // Calculate metrics for each variant
  for (const variant of experiment.variants) {
    const variantData = expData.get(variant.id) || [];
    
    if (variantData.length === 0) {
      results.push({
        variantId: variant.id,
        sampleSize: 0,
        metrics: {
          mean: 0,
          standardDeviation: 0,
          confidenceInterval: [0, 0],
        },
      });
      continue;
    }

    const values = variantData.map(d => getMetricValue(d, experiment.targetMetric));
    const mean = calculateMean(values);
    const stdDev = calculateStandardDeviation(values, mean);
    const confidenceInterval = calculateConfidenceInterval(
      mean,
      stdDev,
      values.length,
      experiment.confidenceLevel
    );

    results.push({
      variantId: variant.id,
      sampleSize: variantData.length,
      metrics: {
        mean,
        standardDeviation: stdDev,
        confidenceInterval,
      },
    });
  }

  // Determine statistical significance
  const analysis = performStatisticalAnalysis(experiment, results);
  
  return {
    experimentId,
    status: analysis.status,
    results,
    winningVariant: analysis.winningVariant,
    confidenceLevel: experiment.confidenceLevel,
    pValue: analysis.pValue,
    effectSize: analysis.effectSize,
    recommendations: generateRecommendations(experiment, analysis),
    analysisDate: new Date(),
  };
}

/**
 * Generates content variations for A/B testing
 */
export function generateContentVariations(
  baseContent: {
    caption: string;
    hashtags: string[];
    platform: Platform;
  },
  variationType: 'caption' | 'hashtags' | 'tone' | 'length'
): ExperimentVariant[] {
  const variants: ExperimentVariant[] = [];

  switch (variationType) {
    case 'caption':
      variants.push(
        {
          id: 'original',
          name: 'Original Caption',
          description: 'The original caption as provided',
          config: { caption: baseContent.caption },
          weight: 50,
        },
        {
          id: 'optimized',
          name: 'AI-Optimized Caption',
          description: 'Caption optimized for engagement',
          config: { caption: optimizeCaption(baseContent.caption, baseContent.platform) },
          weight: 50,
        }
      );
      break;

    case 'hashtags':
      variants.push(
        {
          id: 'original_hashtags',
          name: 'Original Hashtags',
          description: 'The original hashtag set',
          config: { hashtags: baseContent.hashtags },
          weight: 50,
        },
        {
          id: 'trending_hashtags',
          name: 'Trending Hashtags',
          description: 'Hashtags optimized for current trends',
          config: { hashtags: generateTrendingHashtags(baseContent.platform) },
          weight: 50,
        }
      );
      break;

    case 'tone':
      variants.push(
        {
          id: 'casual_tone',
          name: 'Casual Tone',
          description: 'Casual, friendly tone',
          config: { caption: adjustTone(baseContent.caption, 'casual') },
          weight: 33,
        },
        {
          id: 'professional_tone',
          name: 'Professional Tone',
          description: 'Professional, authoritative tone',
          config: { caption: adjustTone(baseContent.caption, 'professional') },
          weight: 33,
        },
        {
          id: 'excited_tone',
          name: 'Excited Tone',
          description: 'Enthusiastic, energetic tone',
          config: { caption: adjustTone(baseContent.caption, 'excited') },
          weight: 34,
        }
      );
      break;

    case 'length':
      variants.push(
        {
          id: 'short_caption',
          name: 'Short Caption',
          description: 'Concise, brief caption',
          config: { caption: shortenCaption(baseContent.caption) },
          weight: 50,
        },
        {
          id: 'long_caption',
          name: 'Detailed Caption',
          description: 'Extended, detailed caption',
          config: { caption: expandCaption(baseContent.caption) },
          weight: 50,
        }
      );
      break;
  }

  return variants;
}

// Helper functions

function generateExperimentId(): string {
  return 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function validateExperiment(experiment: Experiment): void {
  if (experiment.variants.length < 2) {
    throw new Error('Experiment must have at least 2 variants');
  }

  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    throw new Error('Variant weights must sum to 100');
  }

  if (experiment.confidenceLevel < 0.8 || experiment.confidenceLevel > 0.99) {
    throw new Error('Confidence level must be between 0.8 and 0.99');
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function getMetricValue(data: PostMetrics, metric: Experiment['targetMetric']): number {
  switch (metric) {
    case 'engagementRate': return data.engagementRate;
    case 'likes': return data.likes;
    case 'comments': return data.comments;
    case 'shares': return data.shares;
    case 'views': return data.views;
    default: return 0;
  }
}

function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateStandardDeviation(values: number[], mean: number): number {
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function calculateConfidenceInterval(
  mean: number,
  stdDev: number,
  sampleSize: number,
  confidenceLevel: number
): [number, number] {
  // Using t-distribution for small samples
  const tValue = getTValue(confidenceLevel, sampleSize - 1);
  const marginOfError = tValue * (stdDev / Math.sqrt(sampleSize));
  
  return [mean - marginOfError, mean + marginOfError];
}

function getTValue(confidenceLevel: number, degreesOfFreedom: number): number {
  // Simplified t-value lookup (in production, use a proper statistical library)
  const tTable: Record<number, Record<number, number>> = {
    90: { 1: 6.314, 5: 2.015, 10: 1.812, 30: 1.697, 100: 1.660 },
    95: { 1: 12.706, 5: 2.571, 10: 2.228, 30: 2.042, 100: 1.984 },
    99: { 1: 63.657, 5: 4.032, 10: 3.169, 30: 2.750, 100: 2.626 },
  };

  const level = Math.round(confidenceLevel * 100);
  const df = degreesOfFreedom;
  
  // Find closest degrees of freedom
  const availableDf = [1, 5, 10, 30, 100];
  const closestDf = availableDf.reduce((prev, curr) => 
    Math.abs(curr - df) < Math.abs(prev - df) ? curr : prev
  );

  return tTable[level]?.[closestDf] || 1.96; // Default to z-value for large samples
}

function performStatisticalAnalysis(
  experiment: Experiment,
  results: ExperimentResult[]
): {
  status: ExperimentAnalysis['status'];
  winningVariant?: string;
  pValue?: number;
  effectSize?: number;
} {
  // Check if we have sufficient data
  const sufficientData = results.every(r => r.sampleSize >= experiment.minimumSampleSize);
  if (!sufficientData) {
    return { status: 'insufficient_data' };
  }

  // Perform t-test between variants (simplified for 2 variants)
  if (results.length === 2) {
    const [variant1, variant2] = results;
    const pValue = performTTest(variant1, variant2);
    const significanceThreshold = 1 - experiment.confidenceLevel;

    if (pValue < significanceThreshold) {
      const winningVariant = variant1.metrics.mean > variant2.metrics.mean 
        ? variant1.variantId 
        : variant2.variantId;
      
      const effectSize = calculateEffectSize(variant1, variant2);
      
      return {
        status: 'significant_difference',
        winningVariant,
        pValue,
        effectSize,
      };
    }
  }

  return { status: 'no_significant_difference' };
}

function performTTest(result1: ExperimentResult, result2: ExperimentResult): number {
  // Simplified t-test calculation (in production, use a proper statistical library)
  const mean1 = result1.metrics.mean;
  const mean2 = result2.metrics.mean;
  const std1 = result1.metrics.standardDeviation;
  const std2 = result2.metrics.standardDeviation;
  const n1 = result1.sampleSize;
  const n2 = result2.sampleSize;

  const pooledStd = Math.sqrt(((n1 - 1) * std1 * std1 + (n2 - 1) * std2 * std2) / (n1 + n2 - 2));
  const tStat = (mean1 - mean2) / (pooledStd * Math.sqrt(1/n1 + 1/n2));
  
  // Convert t-statistic to p-value (simplified)
  return Math.abs(tStat) > 2 ? 0.05 : 0.1; // Rough approximation
}

function calculateEffectSize(result1: ExperimentResult, result2: ExperimentResult): number {
  // Cohen's d
  const mean1 = result1.metrics.mean;
  const mean2 = result2.metrics.mean;
  const std1 = result1.metrics.standardDeviation;
  const std2 = result2.metrics.standardDeviation;
  const n1 = result1.sampleSize;
  const n2 = result2.sampleSize;

  const pooledStd = Math.sqrt(((n1 - 1) * std1 * std1 + (n2 - 1) * std2 * std2) / (n1 + n2 - 2));
  return Math.abs(mean1 - mean2) / pooledStd;
}

function generateRecommendations(
  experiment: Experiment,
  analysis: { status: ExperimentAnalysis['status']; winningVariant?: string; effectSize?: number }
): string[] {
  const recommendations: string[] = [];

  switch (analysis.status) {
    case 'insufficient_data':
      recommendations.push(
        'Continue running the experiment to collect more data',
        `Target sample size: ${experiment.minimumSampleSize} per variant`,
        'Consider extending the experiment duration'
      );
      break;

    case 'no_significant_difference':
      recommendations.push(
        'No statistically significant difference found between variants',
        'Consider testing more dramatic variations',
        'You may choose either variant or stick with the original'
      );
      break;

    case 'significant_difference':
      if (analysis.winningVariant) {
        recommendations.push(
          `Implement the winning variant: ${analysis.winningVariant}`,
          `Effect size: ${analysis.effectSize?.toFixed(3)} (${getEffectSizeInterpretation(analysis.effectSize || 0)})`,
          'Monitor performance after implementation'
        );
      }
      break;
  }

  return recommendations;
}

function getEffectSizeInterpretation(effectSize: number): string {
  if (effectSize < 0.2) return 'small effect';
  if (effectSize < 0.5) return 'medium effect';
  return 'large effect';
}

// Content optimization helper functions

function optimizeCaption(caption: string, platform: Platform): string {
  // Platform-specific optimization
  switch (platform) {
    case Platform.TIKTOK:
      return caption + ' 🔥 #fyp #viral';
    case Platform.INSTAGRAM:
      return caption + ' ✨ #instagood #photooftheday';
    default:
      return caption + ' 🚀';
  }
}

function generateTrendingHashtags(platform: Platform): string[] {
  // Mock trending hashtags (in production, fetch from real data)
  const trendingByPlatform = {
    [Platform.TIKTOK]: ['#fyp', '#viral', '#trending', '#foryou', '#tiktok'],
    [Platform.INSTAGRAM]: ['#instagood', '#photooftheday', '#love', '#beautiful', '#happy'],
    [Platform.YOUTUBE]: ['#youtube', '#subscribe', '#viral', '#trending', '#shorts'],
    [Platform.FACEBOOK]: ['#facebook', '#social', '#community', '#share', '#connect'],
    [Platform.TWITTER]: ['#twitter', '#trending', '#viral', '#news', '#social'],
    [Platform.LINKEDIN]: ['#linkedin', '#professional', '#career', '#business', '#networking'],
  };

  return trendingByPlatform[platform] || ['#trending', '#viral'];
}

function adjustTone(caption: string, tone: 'casual' | 'professional' | 'excited'): string {
  switch (tone) {
    case 'casual':
      return caption.toLowerCase().replace(/[!]+/g, '') + ' 😊';
    case 'professional':
      return caption.replace(/[!]+/g, '.').replace(/😊|😍|🔥|✨/g, '');
    case 'excited':
      return caption.replace(/[.]/g, '!') + ' 🔥🔥🔥';
    default:
      return caption;
  }
}

function shortenCaption(caption: string): string {
  const words = caption.split(' ');
  return words.slice(0, Math.min(10, words.length)).join(' ') + (words.length > 10 ? '...' : '');
}

function expandCaption(caption: string): string {
  return caption + ' Check out more content like this and don\'t forget to follow for daily updates! What do you think about this? Let me know in the comments below! 👇';
}

// Placeholder types, to be defined properly later
export interface Experiment {}
export interface ExperimentVariant {}
export interface ExperimentAnalysis {}
export interface ExperimentResult {}

// Add other A/B testing related functions and types here 