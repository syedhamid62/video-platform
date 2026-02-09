# 🚀 Full Stack Deployment Guide

This project is a Full Stack application with:
- **Frontend**: Angular 17
- **Backend**: Spring Boot 3 (Java 17)

Since Vercel is best optimized for Frontends, we recommend a **Split Deployment Strategy**:
1. **Backend** (Spring Boot) -> **Railway** or **Render** (Free tier available)
2. **Frontend** (Angular) -> **Vercel**

---

## Part 1: Deploy Backend (Spring Boot)

### Option A: Deploy to Railway (Recommended)
1. Sign up at [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository (`video-platform`).
4. Railway will automatically detect the `Dockerfile` at the root and start building.
5. Once deployed, go to **Settings** -> **Domains** and generate a domain (e.g., `video-platform-production.up.railway.app`).
6. **Copy this URL**. You will need it for the frontend.

### Option B: Deploy to Render
1. Sign up at [Render.com](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repo.
4. Select **Docker** as the Runtime.
5. Render will build using the `Dockerfile`.
6. Once live, copy your backend URL (e.g., `https://video-sharing-app.onrender.com`).

---

## Part 2: Connect Frontend to Backend

1. **Wait** until your Backend is live from Part 1.
2. Open `src/environments/environment.prod.ts` in your local code.
3. Update the `apiUrl` with your **new Backend URL**:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://video-platform-production.up.railway.app/api' // <--- REPLACE THIS
   };
   ```
4. Commit and push this change to GitHub:
   ```bash
   git add src/environments/environment.prod.ts
   git commit -m "Update prod API URL"
   git push origin master
   ```

---

## Part 3: Deploy Frontend (Vercel)

1. Sign up at [Vercel.com](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`video-platform`).
4. Framework Preset: **Angular** (should be auto-detected).
5. Build Command: `ng build` (default).
6. Output Directory: `dist/video-platform` (default).
7. Click **Deploy**.

🎉 **Success!** Your full stack app is now live.
- **Frontend**: Vercel URL
- **Backend**: Railway/Render URL
