export async function withConcurrencyLimit<T>(
  items: T[],
  limit: number,
  handler: (item: T, index: number) => Promise<void>,
): Promise<void> {
  const executing: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const p = handler(items[i], i);
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
      // Remove settled promises
      for (let j = executing.length - 1; j >= 0; j--) {
        if (executing[j].settled) executing.splice(j, 1);
      }
    }
  }
  await Promise.all(executing);
} 