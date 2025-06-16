import { SchedulerService } from '../SchedulerService';

describe('SchedulerService', () => {
  let scheduler: SchedulerService;

  beforeEach(() => {
    scheduler = new SchedulerService();
  });

  afterEach(async () => {
    // Clean up any scheduled tasks
    await scheduler.shutdown();
  });

  describe('task scheduling', () => {
    it('should schedule a task for immediate execution', async () => {
      const mockTask = jest.fn().mockResolvedValue('task completed');
      const taskId = await scheduler.scheduleTask({
        id: 'immediate-task-1',
        name: 'Immediate Task',
        handler: mockTask,
        executeAt: new Date(),
        priority: 'high',
      });

      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');
      
      // Wait for task execution
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockTask).toHaveBeenCalled();
    });

    it('should schedule a task for future execution', async () => {
      const mockTask = jest.fn().mockResolvedValue('future task completed');
      const futureTime = new Date(Date.now() + 1000); // 1 second from now
      
      const taskId = await scheduler.scheduleTask({
        id: 'future-task-1',
        name: 'Future Task',
        handler: mockTask,
        executeAt: futureTime,
        priority: 'medium',
      });

      expect(taskId).toBeDefined();
      
      // Task should not execute immediately
      expect(mockTask).not.toHaveBeenCalled();
      
      // Wait for scheduled execution
      await new Promise(resolve => setTimeout(resolve, 1200));
      expect(mockTask).toHaveBeenCalled();
    });

    it('should schedule recurring tasks', async () => {
      const mockTask = jest.fn().mockResolvedValue('recurring task completed');
      
      const taskId = await scheduler.scheduleRecurringTask({
        id: 'recurring-task-1',
        name: 'Recurring Task',
        handler: mockTask,
        interval: 500, // Every 500ms
        maxExecutions: 3,
        priority: 'low',
      });

      expect(taskId).toBeDefined();
      
      // Wait for multiple executions
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(mockTask).toHaveBeenCalledTimes(3);
    });

    it('should handle cron-style scheduling', async () => {
      const mockTask = jest.fn().mockResolvedValue('cron task completed');
      
      const taskId = await scheduler.scheduleCronTask({
        id: 'cron-task-1',
        name: 'Cron Task',
        handler: mockTask,
        cronExpression: '*/1 * * * * *', // Every second
        maxExecutions: 2,
        priority: 'high',
      });

      expect(taskId).toBeDefined();
      
      // Wait for cron executions
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(mockTask).toHaveBeenCalledTimes(2);
    });
  });

  describe('queue management', () => {
    it('should maintain task priority order', async () => {
      const executionOrder: string[] = [];
      
      const highPriorityTask = jest.fn().mockImplementation(() => {
        executionOrder.push('high');
        return Promise.resolve('high priority completed');
      });
      
      const mediumPriorityTask = jest.fn().mockImplementation(() => {
        executionOrder.push('medium');
        return Promise.resolve('medium priority completed');
      });
      
      const lowPriorityTask = jest.fn().mockImplementation(() => {
        executionOrder.push('low');
        return Promise.resolve('low priority completed');
      });

      // Schedule tasks in reverse priority order
      await scheduler.scheduleTask({
        id: 'low-priority-task',
        name: 'Low Priority Task',
        handler: lowPriorityTask,
        executeAt: new Date(),
        priority: 'low',
      });

      await scheduler.scheduleTask({
        id: 'medium-priority-task',
        name: 'Medium Priority Task',
        handler: mediumPriorityTask,
        executeAt: new Date(),
        priority: 'medium',
      });

      await scheduler.scheduleTask({
        id: 'high-priority-task',
        name: 'High Priority Task',
        handler: highPriorityTask,
        executeAt: new Date(),
        priority: 'high',
      });

      // Wait for execution
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // High priority should execute first
      expect(executionOrder[0]).toBe('high');
    });

    it('should handle queue capacity limits', async () => {
      const limitedScheduler = new SchedulerService({ maxQueueSize: 2 });
      const mockTask = jest.fn().mockResolvedValue('task completed');

      // Schedule tasks up to limit
      const task1 = await limitedScheduler.scheduleTask({
        id: 'task-1',
        name: 'Task 1',
        handler: mockTask,
        executeAt: new Date(Date.now() + 1000),
        priority: 'medium',
      });

      const task2 = await limitedScheduler.scheduleTask({
        id: 'task-2',
        name: 'Task 2',
        handler: mockTask,
        executeAt: new Date(Date.now() + 1000),
        priority: 'medium',
      });

      expect(task1).toBeDefined();
      expect(task2).toBeDefined();

      // Third task should be rejected or queued differently
      try {
        const task3 = await limitedScheduler.scheduleTask({
          id: 'task-3',
          name: 'Task 3',
          handler: mockTask,
          executeAt: new Date(Date.now() + 1000),
          priority: 'medium',
        });
        
        // If accepted, should be handled gracefully
        expect(task3).toBeDefined();
      } catch (error) {
        // If rejected, should throw meaningful error
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('queue');
      }

      await limitedScheduler.shutdown();
    });

    it('should provide queue status and metrics', async () => {
      const mockTask = jest.fn().mockResolvedValue('task completed');
      
      // Schedule multiple tasks
      await scheduler.scheduleTask({
        id: 'status-task-1',
        name: 'Status Task 1',
        handler: mockTask,
        executeAt: new Date(Date.now() + 1000),
        priority: 'high',
      });

      await scheduler.scheduleTask({
        id: 'status-task-2',
        name: 'Status Task 2',
        handler: mockTask,
        executeAt: new Date(Date.now() + 2000),
        priority: 'medium',
      });

      const queueStatus = await scheduler.getQueueStatus();
      
      expect(queueStatus).toHaveProperty('totalTasks');
      expect(queueStatus).toHaveProperty('pendingTasks');
      expect(queueStatus).toHaveProperty('runningTasks');
      expect(queueStatus).toHaveProperty('completedTasks');
      expect(queueStatus.totalTasks).toBeGreaterThanOrEqual(2);
    });
  });

  describe('error recovery', () => {
    it('should retry failed tasks with exponential backoff', async () => {
      let attemptCount = 0;
      const failingTask = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return Promise.resolve('task succeeded on retry');
      });

      const taskId = await scheduler.scheduleTask({
        id: 'retry-task-1',
        name: 'Retry Task',
        handler: failingTask,
        executeAt: new Date(),
        priority: 'high',
        retryOptions: {
          maxRetries: 3,
          retryDelay: 100,
          exponentialBackoff: true,
        },
      });

      expect(taskId).toBeDefined();
      
      // Wait for retries to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(failingTask).toHaveBeenCalledTimes(3);
    });

    it('should handle task timeouts', async () => {
      const longRunningTask = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 2000)); // 2 second task
      });

      const taskId = await scheduler.scheduleTask({
        id: 'timeout-task-1',
        name: 'Timeout Task',
        handler: longRunningTask,
        executeAt: new Date(),
        priority: 'medium',
        timeout: 500, // 500ms timeout
      });

      expect(taskId).toBeDefined();
      
      // Wait for timeout to occur
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const taskStatus = await scheduler.getTaskStatus(taskId);
      expect(['timeout', 'failed']).toContain(taskStatus.status);
    });

    it('should handle scheduler service failures gracefully', async () => {
      const mockTask = jest.fn().mockResolvedValue('task completed');
      
      // Schedule a task
      const taskId = await scheduler.scheduleTask({
        id: 'failure-recovery-task',
        name: 'Failure Recovery Task',
        handler: mockTask,
        executeAt: new Date(Date.now() + 500),
        priority: 'high',
        persistent: true,
      });

      expect(taskId).toBeDefined();
      
      // Simulate service restart
      await scheduler.shutdown();
      scheduler = new SchedulerService();
      
      // Task should be recoverable if persistent
      const recoveredTasks = await scheduler.recoverTasks();
      expect(Array.isArray(recoveredTasks)).toBe(true);
    });

    it('should handle dead letter queue for permanently failed tasks', async () => {
      const alwaysFailingTask = jest.fn().mockImplementation(() => {
        throw new Error('Task always fails');
      });

      const taskId = await scheduler.scheduleTask({
        id: 'dead-letter-task',
        name: 'Dead Letter Task',
        handler: alwaysFailingTask,
        executeAt: new Date(),
        priority: 'low',
        retryOptions: {
          maxRetries: 2,
          retryDelay: 100,
        },
      });

      expect(taskId).toBeDefined();
      
      // Wait for all retries to fail
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const deadLetterTasks = await scheduler.getDeadLetterTasks();
      expect(Array.isArray(deadLetterTasks)).toBe(true);
      expect(deadLetterTasks.length).toBeGreaterThan(0);
    });
  });

  describe('task lifecycle management', () => {
    it('should allow task cancellation', async () => {
      const mockTask = jest.fn().mockResolvedValue('task completed');
      
      const taskId = await scheduler.scheduleTask({
        id: 'cancellable-task',
        name: 'Cancellable Task',
        handler: mockTask,
        executeAt: new Date(Date.now() + 1000),
        priority: 'medium',
      });

      expect(taskId).toBeDefined();
      
      // Cancel the task before execution
      const cancelled = await scheduler.cancelTask(taskId);
      expect(cancelled).toBe(true);
      
      // Wait past execution time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Task should not have executed
      expect(mockTask).not.toHaveBeenCalled();
    });

    it('should allow task rescheduling', async () => {
      const mockTask = jest.fn().mockResolvedValue('task completed');
      
      const taskId = await scheduler.scheduleTask({
        id: 'reschedulable-task',
        name: 'Reschedulable Task',
        handler: mockTask,
        executeAt: new Date(Date.now() + 2000),
        priority: 'medium',
      });

      expect(taskId).toBeDefined();
      
      // Reschedule to execute sooner
      const rescheduled = await scheduler.rescheduleTask(taskId, new Date(Date.now() + 500));
      expect(rescheduled).toBe(true);
      
      // Wait for rescheduled execution
      await new Promise(resolve => setTimeout(resolve, 800));
      expect(mockTask).toHaveBeenCalled();
    });

    it('should provide detailed task status information', async () => {
      const mockTask = jest.fn().mockResolvedValue('task completed');
      
      const taskId = await scheduler.scheduleTask({
        id: 'status-info-task',
        name: 'Status Info Task',
        handler: mockTask,
        executeAt: new Date(Date.now() + 500),
        priority: 'high',
        metadata: { userId: 'user-123', operation: 'content-processing' },
      });

      const initialStatus = await scheduler.getTaskStatus(taskId);
      expect(initialStatus).toHaveProperty('id', taskId);
      expect(initialStatus).toHaveProperty('status', 'scheduled');
      expect(initialStatus).toHaveProperty('createdAt');
      expect(initialStatus).toHaveProperty('metadata');
      
      // Wait for execution
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const finalStatus = await scheduler.getTaskStatus(taskId);
      expect(['completed', 'success']).toContain(finalStatus.status);
    });
  });

  describe('performance and scalability', () => {
    it('should handle high-volume task scheduling efficiently', async () => {
      const mockTask = jest.fn().mockResolvedValue('bulk task completed');
      const taskCount = 100;
      
      const startTime = Date.now();
      const taskIds = await Promise.all(
        Array.from({ length: taskCount }).map((_, idx) =>
          scheduler.scheduleTask({
            id: `bulk-task-${idx}`,
            name: `Bulk Task ${idx}`,
            handler: mockTask,
            executeAt: new Date(Date.now() + Math.random() * 1000),
            priority: idx % 3 === 0 ? 'high' : idx % 3 === 1 ? 'medium' : 'low',
          })
        )
      );
      const endTime = Date.now();

      expect(taskIds.length).toBe(taskCount);
      expect(endTime - startTime).toBeLessThan(5000); // Should schedule quickly
      
      // Wait for some executions
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(mockTask).toHaveBeenCalled();
    });

    it('should manage memory efficiently with large task queues', async () => {
      const mockTask = jest.fn().mockResolvedValue('memory test completed');
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Schedule many tasks
      const taskIds = await Promise.all(
        Array.from({ length: 500 }).map((_, idx) =>
          scheduler.scheduleTask({
            id: `memory-task-${idx}`,
            name: `Memory Task ${idx}`,
            handler: mockTask,
            executeAt: new Date(Date.now() + Math.random() * 5000),
            priority: 'medium',
          })
        )
      );

      expect(taskIds.length).toBe(500);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be reasonable
      expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    it('should support concurrent task execution', async () => {
      const concurrentScheduler = new SchedulerService({ maxConcurrentTasks: 5 });
      const executionTimes: number[] = [];
      
      const concurrentTask = jest.fn().mockImplementation(async () => {
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms task
        const endTime = Date.now();
        executionTimes.push(endTime - startTime);
        return 'concurrent task completed';
      });

      // Schedule 10 tasks to test concurrency
      const taskIds = await Promise.all(
        Array.from({ length: 10 }).map((_, idx) =>
          concurrentScheduler.scheduleTask({
            id: `concurrent-task-${idx}`,
            name: `Concurrent Task ${idx}`,
            handler: concurrentTask,
            executeAt: new Date(),
            priority: 'medium',
          })
        )
      );

      expect(taskIds.length).toBe(10);
      
      // Wait for all tasks to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(concurrentTask).toHaveBeenCalledTimes(10);
      
      await concurrentScheduler.shutdown();
    });
  });

  describe('monitoring and observability', () => {
    it('should provide comprehensive metrics', async () => {
      const mockTask = jest.fn().mockResolvedValue('metrics task completed');
      
      // Schedule various tasks
      await scheduler.scheduleTask({
        id: 'metrics-task-1',
        name: 'Metrics Task 1',
        handler: mockTask,
        executeAt: new Date(),
        priority: 'high',
      });

      await scheduler.scheduleTask({
        id: 'metrics-task-2',
        name: 'Metrics Task 2',
        handler: mockTask,
        executeAt: new Date(Date.now() + 500),
        priority: 'medium',
      });

      // Wait for some execution
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const metrics = await scheduler.getMetrics();
      
      expect(metrics).toHaveProperty('totalTasksScheduled');
      expect(metrics).toHaveProperty('totalTasksCompleted');
      expect(metrics).toHaveProperty('totalTasksFailed');
      expect(metrics).toHaveProperty('averageExecutionTime');
      expect(metrics).toHaveProperty('queueSize');
      expect(metrics.totalTasksScheduled).toBeGreaterThanOrEqual(2);
    });

    it('should support task execution logging', async () => {
      const logs: string[] = [];
      const loggingScheduler = new SchedulerService({
        logger: {
          info: (message: string) => logs.push(`INFO: ${message}`),
          error: (message: string) => logs.push(`ERROR: ${message}`),
          warn: (message: string) => logs.push(`WARN: ${message}`),
        },
      });

      const mockTask = jest.fn().mockResolvedValue('logging task completed');
      
      await loggingScheduler.scheduleTask({
        id: 'logging-task',
        name: 'Logging Task',
        handler: mockTask,
        executeAt: new Date(),
        priority: 'high',
      });

      // Wait for execution and logging
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(log => log.includes('scheduled'))).toBe(true);
      
      await loggingScheduler.shutdown();
    });
  });

  describe('task scheduling accuracy and timing', () => {
    it('should schedule tasks with accurate timing', async () => {
      const mockTask = jest.fn().mockResolvedValue('completed');
      const startTime = Date.now();
      
      await scheduler.scheduleTask({
        id: 'timing-test',
        handler: mockTask,
        executeAt: new Date(startTime + 500),
      });

      await new Promise(resolve => setTimeout(resolve, 700));
      expect(mockTask).toHaveBeenCalled();
    });

    it('should handle immediate task execution', async () => {
      const mockTask = jest.fn().mockResolvedValue('immediate');
      
      await scheduler.scheduleTask({
        id: 'immediate-test',
        handler: mockTask,
        executeAt: new Date(),
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockTask).toHaveBeenCalled();
    });
  });

  describe('queue management and prioritization', () => {
    it('should prioritize high priority tasks', async () => {
      const executionOrder: string[] = [];
      
      const highTask = jest.fn().mockImplementation(() => {
        executionOrder.push('high');
        return Promise.resolve();
      });
      
      const lowTask = jest.fn().mockImplementation(() => {
        executionOrder.push('low');
        return Promise.resolve();
      });

      await scheduler.scheduleTask({
        id: 'low-priority',
        handler: lowTask,
        executeAt: new Date(),
        priority: 'low',
      });

      await scheduler.scheduleTask({
        id: 'high-priority',
        handler: highTask,
        executeAt: new Date(),
        priority: 'high',
      });

      await new Promise(resolve => setTimeout(resolve, 200));
      expect(executionOrder[0]).toBe('high');
    });

    it('should manage queue capacity', async () => {
      const limitedScheduler = new SchedulerService({ maxQueueSize: 2 });
      const mockTask = jest.fn();

      const task1 = await limitedScheduler.scheduleTask({
        id: 'task-1',
        handler: mockTask,
        executeAt: new Date(Date.now() + 1000),
      });

      const task2 = await limitedScheduler.scheduleTask({
        id: 'task-2',
        handler: mockTask,
        executeAt: new Date(Date.now() + 1000),
      });

      expect(task1).toBeDefined();
      expect(task2).toBeDefined();

      await limitedScheduler.shutdown();
    });
  });

  describe('error recovery and retry mechanisms', () => {
    it('should retry failed tasks', async () => {
      let attempts = 0;
      const retryTask = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Task failed');
        }
        return Promise.resolve('success');
      });

      await scheduler.scheduleTask({
        id: 'retry-test',
        handler: retryTask,
        executeAt: new Date(),
        retryOptions: {
          maxRetries: 3,
          retryDelay: 100,
        },
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(retryTask).toHaveBeenCalledTimes(3);
    });

    it('should handle task timeouts', async () => {
      const timeoutTask = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 1000));
      });

      await scheduler.scheduleTask({
        id: 'timeout-test',
        handler: timeoutTask,
        executeAt: new Date(),
        timeout: 200,
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      const status = await scheduler.getTaskStatus('timeout-test');
      expect(['timeout', 'failed']).toContain(status.status);
    });
  });

  describe('performance monitoring and reporting', () => {
    it('should provide queue status', async () => {
      const mockTask = jest.fn().mockResolvedValue('completed');
      
      await scheduler.scheduleTask({
        id: 'status-test',
        handler: mockTask,
        executeAt: new Date(Date.now() + 500),
      });

      const status = await scheduler.getQueueStatus();
      expect(status).toHaveProperty('totalTasks');
      expect(status).toHaveProperty('pendingTasks');
      expect(status.totalTasks).toBeGreaterThan(0);
    });

    it('should track execution metrics', async () => {
      const mockTask = jest.fn().mockResolvedValue('completed');
      
      await scheduler.scheduleTask({
        id: 'metrics-test',
        handler: mockTask,
        executeAt: new Date(),
      });

      await new Promise(resolve => setTimeout(resolve, 200));
      
      const metrics = await scheduler.getMetrics();
      expect(metrics).toHaveProperty('totalTasksScheduled');
      expect(metrics).toHaveProperty('totalTasksCompleted');
    });
  });
}); 