import { ingestSampleBatchData, updateModel, predictEngagement, evaluateModel, featureStore } from '../index';

describe('AI Improvement Workflow', () => {
  beforeAll(() => {
    // Clear feature store before each run
    featureStore.userInteractions.length = 0;
    featureStore.contentPerformance.length = 0;
    featureStore.platformMetrics.length = 0;
  });

  it('should ingest batch data and populate the feature store', () => {
    ingestSampleBatchData();
    expect(featureStore.contentPerformance.length).toBeGreaterThan(0);
    expect(featureStore.userInteractions.length).toBeGreaterThan(0);
    expect(featureStore.platformMetrics.length).toBeGreaterThan(0);
  });

  it('should train the model and update parameters', () => {
    updateModel();
    // After training, predictions should be numbers
    const pred = predictEngagement(0.1);
    expect(typeof pred).toBe('number');
  });

  it('should evaluate the model and return a valid MSE', () => {
    const mse = evaluateModel();
    expect(typeof mse).toBe('number');
    expect(mse).toBeGreaterThanOrEqual(0);
  });
}); 