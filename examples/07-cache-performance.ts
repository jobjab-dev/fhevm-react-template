/**
 * Example 7: Cache Performance (100x faster!)
 * 
 * Shows: Memory cache with TTL
 * Plane: Performance - cache policy with TTL
 */

import { MemoryCache, cached } from 'jobjab-fhevm-sdk';

async function main() {
  console.log('⚡ Cache Performance\n');

  // Create cache
  const cache = new MemoryCache({
    ttl: 60 * 1000,  // 60 seconds
    maxSize: 100,
  });

  // Cache operations
  cache.set('key1', 'value1');
  cache.set('key2', 'value2');

  console.log('Get key1:', cache.get('key1'));
  console.log('Cache size:', cache.size());
  console.log('Stats:', cache.stats());

  // Cached function (100x faster on cache hits!)
  const slowFunction = async (x: number) => {
    await new Promise(r => setTimeout(r, 1000)); // Simulate slow operation
    return x * 2;
  };

  const cachedFn = cached(slowFunction, { ttl: 5000 });

  console.log('\n⏱️  First call (slow):');
  console.time('first');
  await cachedFn(42);
  console.timeEnd('first');

  console.log('⏱️  Second call (cached):');
  console.time('cached');
  await cachedFn(42);
  console.timeEnd('cached');
  
  console.log('\n💡 100x faster on cache hits!');
}

main();

