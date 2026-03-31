import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Hospital-bed-expansion-planner/',
  plugins: [react()],
});
