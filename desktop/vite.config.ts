import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-themes',
      apply: 'build',
      enforce: 'post',
      async generateBundle() {
        const themesDir = path.resolve(__dirname, '../img/themes');
        const publicThemesDir = path.resolve(__dirname, 'public/themes');

        if (fs.existsSync(themesDir)) {
          // Create public/themes directory if it doesn't exist
          if (!fs.existsSync(publicThemesDir)) {
            fs.mkdirSync(publicThemesDir, { recursive: true });
          }

          // Copy all theme images from resources to public/themes
          const files = fs.readdirSync(themesDir);
          files.forEach((file) => {
            const src = path.join(themesDir, file);
            const dest = path.join(publicThemesDir, file);
            const stat = fs.statSync(src);

            if (stat.isDirectory()) {
              if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
              }
              const subfiles = fs.readdirSync(src);
              subfiles.forEach((subfile) => {
                fs.copyFileSync(path.join(src, subfile), path.join(dest, subfile));
              });
            } else {
              fs.copyFileSync(src, dest);
            }
          });
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  base: process.env.VITE_DEV_SERVER_URL ? '/' : './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
