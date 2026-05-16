# Blog Setup Guide — Astro + GitHub Pages + Custom Domain

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          ← CI/CD: auto-deploy on push to main
├── public/
│   └── CNAME                   ← Custom domain config
├── src/
│   ├── content/
│   │   ├── config.ts           ← Blog post schema (frontmatter types)
│   │   └── blog/
│   │       └── hello-world.md  ← Your posts go here
│   ├── layouts/
│   │   └── BlogPost.astro      ← Post page layout
│   └── pages/
│       ├── index.astro         ← Homepage (post list)
│       └── blog/
│           └── [slug].astro    ← Dynamic post route
├── astro.config.mjs
└── package.json
```

---

## Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `blog` (or whatever you want — e.g., `yourusername.github.io` for a root domain)
3. Set it to **Public** (required for free GitHub Pages)
4. Don't initialise with a README — you'll push this folder directly

---

## Step 2: Initial Setup

```bash
# In this project folder:
npm install

# Test locally
npm run dev
# Visit http://localhost:4321
```

Then push to GitHub:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

---

## Step 3: Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions** (not a branch)
3. That's it — the workflow in `.github/workflows/deploy.yml` handles the rest

The first deploy triggers automatically when you push. After ~60 seconds your site will be live.

---

## Step 4: Update `astro.config.mjs`

Open `astro.config.mjs` and replace the `site` value:

```js
// If using a custom domain:
site: 'https://yourdomain.com',

// If NOT using a custom domain (GitHub Pages default URL):
site: 'https://YOUR-GITHUB-USERNAME.github.io',

// If your repo is a project repo (not username.github.io),
// also add a base path:
base: '/your-repo-name',
```

---

## Step 5: Custom Domain Setup

### 5a. Update the CNAME file
Edit `public/CNAME` and replace `yourdomain.com` with your actual domain. No `https://`, no trailing slash.

```
myblog.com
```

### 5b. Add DNS records at your registrar

**Option A — Apex domain (e.g., `myblog.com`)**

Add these 4 `A` records pointing to GitHub's IPs:
```
Type  Name  Value
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
```

Also add an `AAAA` record for IPv6 (optional but recommended):
```
Type   Name  Value
AAAA   @     2606:50c0:8000::153
AAAA   @     2606:50c0:8001::153
AAAA   @     2606:50c0:8002::153
AAAA   @     2606:50c0:8003::153
```

**Option B — Subdomain (e.g., `blog.myblog.com`)**

Add a single `CNAME` record:
```
Type   Name  Value
CNAME  blog  YOUR-GITHUB-USERNAME.github.io
```

### 5c. Confirm in GitHub Settings

1. Go to repo → **Settings** → **Pages**
2. Under **Custom domain**, enter your domain and hit Save
3. Wait for DNS propagation (up to 48 hours, usually under 1 hour)
4. Once verified, tick **Enforce HTTPS**

---

## Writing Posts

Create a new `.md` file in `src/content/blog/`:

```markdown
---
title: 'My New Post'
description: 'A short description for the post list and SEO.'
pubDate: '2026-05-16'
tags: ['tag1', 'tag2']
draft: false
---

Your post content in **Markdown** here.
```

- The filename becomes the URL slug: `my-new-post.md` → `/blog/my-new-post`
- Set `draft: true` to write a post without it appearing on the site
- Push to `main` and GitHub Actions deploys it automatically (usually ~30 seconds)

---

## Customising the Blog

### Change the site name / bio
Edit `src/pages/index.astro` — look for `My Blog` and `[Your Name]` near the top of the HTML.

### Change the accent colour
Both layout files use a CSS variable:
```css
--color-accent: #6c4bf4;
```
Change it to any hex colour you like.

### Add post images
Put images in `public/images/` and reference them in frontmatter:
```yaml
heroImage: '/images/my-post-header.jpg'
```
Then render it in `BlogPost.astro` with `{heroImage && <img src={heroImage} alt={title} />}`.

---

## Workflow Summary

```
Write post → git push main → GitHub Actions builds → deploys to Pages → live in ~30s
```

No CMS, no server, no monthly bill.
