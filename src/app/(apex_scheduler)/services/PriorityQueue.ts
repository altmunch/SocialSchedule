import { PriorityItem } from '../types';

export class PriorityQueue {
  private items: PriorityItem[] = [];

  enqueue(item: Omit<PriorityItem, 'priority'> & { priority?: number }): void {
    // Default priority if not provided
    const priorityItem: PriorityItem = {
      ...item,
      priority: item.priority ?? 0
    };
    
    // Add to the end of the array
    this.items.push(priorityItem);
    
    // Sort by priority (highest first)
    this.items.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): PriorityItem | undefined {
    return this.items.shift();
  }

  peek(): PriorityItem | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  // Get all items without removing them
  getAll(): PriorityItem[] {
    return [...this.items];
  }

  // Remove items that match a condition
  removeWhere(predicate: (item: PriorityItem) => boolean): void {
    this.items = this.items.filter(item => !predicate(item));
  }

  // Update priority of an item
  updatePriority(postId: string, newPriority: number): boolean {
    const itemIndex = this.items.findIndex(item => item.post.id === postId);
    
    if (itemIndex === -1) {
      return false;
    }
    
    // Remove and re-insert to maintain order
    const [item] = this.items.splice(itemIndex, 1);
    this.enqueue({ ...item, priority: newPriority });
    
    return true;
  }
}
