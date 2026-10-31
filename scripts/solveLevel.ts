import { solve } from '../src/engine/solver';

export { solve, type SolveResult } from '../src/engine/solver';

async function main() {
  const [, , levelId] = process.argv;
  if (!levelId) {
    console.error('usage: npm run solve -- <levelId>');
    process.exit(1);
  }
  try {
    // Defer import to avoid static analysis errors in tests
    const levelPath = '../src/levels/index';
    const { getLevel } = await import(levelPath);
    const level = getLevel(levelId);
    if (!level) {
      console.error(`level not found: ${levelId}`);
      process.exit(1);
    }
    const result = solve(level);
    if (!result) {
      console.error('解なし、または maxDepth を超えました');
      process.exit(1);
    }
    console.log(`T* = ${result.tStar}`);
    console.log(JSON.stringify(result.path, null, 2));
  } catch (err) {
    console.error('Failed to run main:', err);
    process.exit(1);
  }
}

// Only run main if this file is executed directly (not imported)
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('solveLevel.ts')) {
  void main();
}
