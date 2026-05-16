import { defineConfig } from 'astro/config';

export default defineConfig({
  // Replace with your custom domain (with https://)
  // If not using a custom domain, use: https://YOUR-GITHUB-USERNAME.github.io
  site: 'https://yourdomain.com',

  // No base needed when using a custom domain.
  // If using GitHub Pages without a custom domain on a project repo
  // (not user/org repo), set: base: '/your-repo-name'
});
