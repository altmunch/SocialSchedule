import { featureStore } from './feedbackLoop';

// Enhanced model with multiple features and better training
interface ModelWeights {
  likeRatio: number;
  commentRatio: number;
  shareRatio: number;
  captionLength: number;
  hashtagCount: number;
  timeOfDay: number;
  dayOfWeek: number;
  bias: number;
}

interface TrainingMetrics {
  mse: number;
  mae: number;
  r2: number;
  accuracy: number;
  lastTrainingDate: Date;
  trainingDataSize: number;
}

// Enhanced model parameters with multiple features
let modelWeights: ModelWeights = {
  likeRatio: 1.2,
  commentRatio: 0.8,
  shareRatio: 1.5,
  captionLength: 0.001,
  hashtagCount: 0.05,
  timeOfDay: 0.02,
  dayOfWeek: 0.01,
  bias: 0
};

let trainingMetrics: TrainingMetrics = {
  mse: 0,
  mae: 0,
  r2: 0,
  accuracy: 0,
  lastTrainingDate: new Date(),
  trainingDataSize: 0
};

/**
 * Enhanced model training using multiple features and gradient descent
 */
export function updateModel(): void {
  const data = featureStore.contentPerformance;
  if (!data.length) {
    console.warn('No training data available for model update');
    return;
  }

  console.log(`Training engagement prediction model with ${data.length} samples...`);

  // Extract features and targets
  const features = data.map(extractFeatures);
  const targets = data.map(d => d.engagementRate);

  // Normalize features
  const normalizedFeatures = normalizeFeatures(features);

  // Train using gradient descent
  trainWithGradientDescent(normalizedFeatures, targets);

  // Update training metrics
  const predictions = normalizedFeatures.map(f => predictWithFeatures(f));
  trainingMetrics = calculateTrainingMetrics(targets, predictions, data.length);

  console.log(`Model training completed. MSE: ${trainingMetrics.mse.toFixed(4)}, R²: ${trainingMetrics.r2.toFixed(4)}`);
}

/**
 * Extract features from content performance data
 */
function extractFeatures(content: any): number[] {
  return [
    content.likeRatio || 0,
    content.commentRatio || 0,
    content.shareRatio || 0,
    (content.caption?.length || 0) / 100, // Normalize caption length
    content.hashtags?.length || 0,
    getTimeOfDayFeature(content.publishTime),
    getDayOfWeekFeature(content.publishTime)
  ];
}

/**
 * Normalize features to improve training stability
 */
function normalizeFeatures(features: number[][]): number[][] {
  if (features.length === 0) return [];

  const numFeatures = features[0].length;
  const means = new Array(numFeatures).fill(0);
  const stds = new Array(numFeatures).fill(1);

  // Calculate means
  for (let i = 0; i < numFeatures; i++) {
    means[i] = features.reduce((sum, f) => sum + f[i], 0) / features.length;
  }

  // Calculate standard deviations
  for (let i = 0; i < numFeatures; i++) {
    const variance = features.reduce((sum, f) => sum + Math.pow(f[i] - means[i], 2), 0) / features.length;
    stds[i] = Math.sqrt(variance) || 1; // Avoid division by zero
  }

  // Normalize
  return features.map(f => f.map((val, i) => (val - means[i]) / stds[i]));
}

/**
 * Train model using gradient descent
 */
function trainWithGradientDescent(features: number[][], targets: number[]): void {
  const learningRate = 0.01;
  const epochs = 1000;
  const minImprovement = 1e-6;
  
  let prevLoss = Infinity;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradients = calculateGradients(features, targets);
    
    // Update weights
    modelWeights.likeRatio -= learningRate * gradients[0];
    modelWeights.commentRatio -= learningRate * gradients[1];
    modelWeights.shareRatio -= learningRate * gradients[2];
    modelWeights.captionLength -= learningRate * gradients[3];
    modelWeights.hashtagCount -= learningRate * gradients[4];
    modelWeights.timeOfDay -= learningRate * gradients[5];
    modelWeights.dayOfWeek -= learningRate * gradients[6];
    modelWeights.bias -= learningRate * gradients[7];

    // Calculate current loss
    const currentLoss = calculateMeanSquaredError(features, targets);
    
    // Early stopping if improvement is minimal
    if (Math.abs(prevLoss - currentLoss) < minImprovement) {
      console.log(`Training converged at epoch ${epoch}`);
      break;
    }
    
    prevLoss = currentLoss;
  }
}

/**
 * Calculate gradients for gradient descent
 */
function calculateGradients(features: number[][], targets: number[]): number[] {
  const gradients = new Array(8).fill(0); // 7 features + bias
  const n = features.length;

  for (let i = 0; i < n; i++) {
    const prediction = predictWithFeatures(features[i]);
    const error = prediction - targets[i];

    // Calculate gradients for each weight
    for (let j = 0; j < 7; j++) {
      gradients[j] += (2 * error * features[i][j]) / n;
    }
    gradients[7] += (2 * error) / n; // bias gradient
  }

  return gradients;
}

/**
 * Calculate mean squared error
 */
function calculateMeanSquaredError(features: number[][], targets: number[]): number {
  let mse = 0;
  for (let i = 0; i < features.length; i++) {
    const prediction = predictWithFeatures(features[i]);
    mse += Math.pow(prediction - targets[i], 2);
  }
  return mse / features.length;
}

/**
 * Predict engagement using all features
 */
function predictWithFeatures(features: number[]): number {
  return (
    modelWeights.likeRatio * features[0] +
    modelWeights.commentRatio * features[1] +
    modelWeights.shareRatio * features[2] +
    modelWeights.captionLength * features[3] +
    modelWeights.hashtagCount * features[4] +
    modelWeights.timeOfDay * features[5] +
    modelWeights.dayOfWeek * features[6] +
    modelWeights.bias
  );
}

/**
 * Enhanced engagement prediction with multiple features
 */
export function predictEngagement(contentFeatures: {
  likeRatio?: number;
  commentRatio?: number;
  shareRatio?: number;
  captionLength?: number;
  hashtagCount?: number;
  publishTime?: Date;
}): number {
  const features = [
    contentFeatures.likeRatio || 0,
    contentFeatures.commentRatio || 0,
    contentFeatures.shareRatio || 0,
    (contentFeatures.captionLength || 0) / 100,
    contentFeatures.hashtagCount || 0,
    getTimeOfDayFeature(contentFeatures.publishTime),
    getDayOfWeekFeature(contentFeatures.publishTime)
  ];

  // Note: In a real implementation, we'd need to normalize using the same 
  // parameters used during training
  return Math.max(0, predictWithFeatures(features));
}

/**
 * Backward compatibility for simple prediction
 */
export function predictEngagementSimple(likeRatio: number): number {
  return predictEngagement({ likeRatio });
}

/**
 * Enhanced model evaluation with multiple metrics
 */
export function evaluateModel(): number {
  const data = featureStore.contentPerformance;
  if (!data.length) return 0;

  const features = data.map(extractFeatures);
  const normalizedFeatures = normalizeFeatures(features);
  const targets = data.map(d => d.engagementRate);
  const predictions = normalizedFeatures.map(f => predictWithFeatures(f));

  const metrics = calculateTrainingMetrics(targets, predictions, data.length);
  
  console.log('Model Evaluation Results:');
  console.log(`- MSE: ${metrics.mse.toFixed(4)}`);
  console.log(`- MAE: ${metrics.mae.toFixed(4)}`);
  console.log(`- R²: ${metrics.r2.toFixed(4)}`);
  console.log(`- Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);

  return metrics.mse;
}

/**
 * Calculate comprehensive training metrics
 */
function calculateTrainingMetrics(targets: number[], predictions: number[], dataSize: number): TrainingMetrics {
  const n = targets.length;
  
  // MSE
  const mse = targets.reduce((sum, target, i) => 
    sum + Math.pow(target - predictions[i], 2), 0) / n;
  
  // MAE
  const mae = targets.reduce((sum, target, i) => 
    sum + Math.abs(target - predictions[i]), 0) / n;
  
  // R²
  const targetMean = targets.reduce((sum, val) => sum + val, 0) / n;
  const totalSumSquares = targets.reduce((sum, val) => sum + Math.pow(val - targetMean, 2), 0);
  const residualSumSquares = targets.reduce((sum, target, i) => 
    sum + Math.pow(target - predictions[i], 2), 0);
  const r2 = 1 - (residualSumSquares / totalSumSquares);
  
  // Accuracy (percentage of predictions within 20% of actual)
  const accurateCount = targets.filter((target, i) => 
    Math.abs(target - predictions[i]) <= Math.abs(target * 0.2)).length;
  const accuracy = accurateCount / n;

  return {
    mse,
    mae,
    r2,
    accuracy,
    lastTrainingDate: new Date(),
    trainingDataSize: dataSize
  };
}

/**
 * Extract time of day feature (0-1)
 */
function getTimeOfDayFeature(publishTime?: Date): number {
  if (!publishTime) return 0.5; // Default to midday
  const hour = publishTime.getHours();
  return hour / 24;
}

/**
 * Extract day of week feature (0-1)
 */
function getDayOfWeekFeature(publishTime?: Date): number {
  if (!publishTime) return 0.5; // Default to mid-week
  const day = publishTime.getDay();
  return day / 7;
}

/**
 * Get model information and metrics
 */
export function getModelInfo(): {
  weights: ModelWeights;
  metrics: TrainingMetrics;
  isHealthy: boolean;
} {
  const isHealthy = trainingMetrics.r2 > 0.5 && 
                   trainingMetrics.accuracy > 0.6 && 
                   trainingMetrics.trainingDataSize > 50;

  return {
    weights: { ...modelWeights },
    metrics: { ...trainingMetrics },
    isHealthy
  };
}

/**
 * Reset model to initial state
 */
export function resetModel(): void {
  modelWeights = {
    likeRatio: 1.2,
    commentRatio: 0.8,
    shareRatio: 1.5,
    captionLength: 0.001,
    hashtagCount: 0.05,
    timeOfDay: 0.02,
    dayOfWeek: 0.01,
    bias: 0
  };
  
  trainingMetrics = {
    mse: 0,
    mae: 0,
    r2: 0,
    accuracy: 0,
    lastTrainingDate: new Date(),
    trainingDataSize: 0
  };
  
  console.log('Model reset to initial state');
}
