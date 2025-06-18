'use client';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface ComponentLoadTiming {
  component: string;
  loadTime: number;
  size?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentTimings: ComponentLoadTiming[] = [];
  private observer?: PerformanceObserver;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializePerformanceObserver();
      this.monitorCoreWebVitals();
    }
  }

  private initializePerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric(entry.name, entry.duration || 0);
        });
      });

      try {
        this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (e) {
        console.warn('Performance Observer not fully supported:', e);
      }
    }
  }

  private monitorCoreWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported:', e);
      }

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported:', e);
      }

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported:', e);
      }
    }
  }

  recordMetric(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Keep only last 100 metrics to prevent memory bloat
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log significant performance issues
    if (name === 'LCP' && value > 2500) {
      console.warn(`Poor LCP detected: ${value}ms`);
    }
    if (name === 'FID' && value > 100) {
      console.warn(`Poor FID detected: ${value}ms`);
    }
    if (name === 'CLS' && value > 0.1) {
      console.warn(`Poor CLS detected: ${value}`);
    }
  }

  measureComponentLoad(componentName: string, startTime: number, endTime?: number) {
    const loadTime = (endTime || performance.now()) - startTime;
    this.componentTimings.push({
      component: componentName,
      loadTime,
    });

    // Log slow component loads
    if (loadTime > 1000) {
      console.warn(`Slow component load detected: ${componentName} took ${loadTime}ms`);
    }

    return loadTime;
  }

  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name);
    }
    return [...this.metrics];
  }

  getComponentTimings(): ComponentLoadTiming[] {
    return [...this.componentTimings];
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  getSlowestComponents(limit = 5): ComponentLoadTiming[] {
    return [...this.componentTimings]
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, limit);
  }

  generateReport(): string {
    const report = {
      coreWebVitals: {
        LCP: this.getAverageMetric('LCP'),
        FID: this.getAverageMetric('FID'),
        CLS: this.getAverageMetric('CLS'),
      },
      componentPerformance: {
        slowestComponents: this.getSlowestComponents(),
        averageLoadTime: this.componentTimings.length > 0
          ? this.componentTimings.reduce((acc, timing) => acc + timing.loadTime, 0) / this.componentTimings.length
          : 0,
      },
      recommendations: this.generateRecommendations(),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const avgLCP = this.getAverageMetric('LCP');
    if (avgLCP && avgLCP > 2500) {
      recommendations.push('Consider optimizing images and reducing server response times to improve LCP');
    }

    const avgFID = this.getAverageMetric('FID');
    if (avgFID && avgFID > 100) {
      recommendations.push('Consider code splitting and reducing JavaScript execution time to improve FID');
    }

    const avgCLS = this.getAverageMetric('CLS');
    if (avgCLS && avgCLS > 0.1) {
      recommendations.push('Consider adding size attributes to images and avoiding dynamic content to improve CLS');
    }

    const slowComponents = this.getSlowestComponents(3);
    if (slowComponents.length > 0) {
      slowComponents.forEach(component => {
        if (component.loadTime > 1000) {
          recommendations.push(`Consider lazy loading or optimizing ${component.component} (${component.loadTime}ms load time)`);
        }
      });
    }

    return recommendations;
  }

  clear() {
    this.metrics = [];
    this.componentTimings = [];
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.clear();
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export function usePerformanceMonitor() {
  const markComponentStart = (componentName: string) => {
    return performance.now();
  };

  const markComponentEnd = (componentName: string, startTime: number) => {
    return performanceMonitor.measureComponentLoad(componentName, startTime);
  };

  const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsyncFunction(name, fn);
  };

  const measure = <T>(name: string, fn: () => T): T => {
    return performanceMonitor.measureFunction(name, fn);
  };

  return {
    markComponentStart,
    markComponentEnd,
    measureAsync,
    measure,
    getReport: () => performanceMonitor.generateReport(),
    getMetrics: () => performanceMonitor.getMetrics(),
    getSlowestComponents: () => performanceMonitor.getSlowestComponents(),
  };
}

export default PerformanceMonitor; 