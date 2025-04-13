const { execSync } = require('child_process');

try {
  console.log('Starting Detox server on port 8099...');
  execSync('npx detox run-server -p 8099', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start Detox server:', error);
}