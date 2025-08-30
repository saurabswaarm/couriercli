import { execSync } from 'child_process';

// Always run TypeScript compilation before tests
try {
  console.log('Compiling TypeScript files before running tests...');
  execSync('npx tsc --noEmitOnError', { stdio: 'inherit' });
  console.log('Compilation completed successfully!');
} catch (error) {
  console.error('Compilation failed:', error);
  process.exit(1);
}
