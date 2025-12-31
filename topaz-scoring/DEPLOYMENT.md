# 🚀 TOPAZ 2.0 - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

All items below have been completed and the app is **ready for deployment**:

- ✅ All 5 pages built and tested
- ✅ Images moved to `public/` folder
- ✅ Image paths updated to production URLs
- ✅ `vercel.json` configuration created
- ✅ Production build tested successfully
- ✅ README.md created
- ✅ Responsive design verified (mobile, iPad, desktop)

## 📦 What's Ready

### Pages (All Complete)
1. **Welcome Page** (`/`) - Competition start screen
2. **Competition Setup** (`/setup`) - Add dancers and details
3. **Judge Selection** (`/judge-selection`) - Judge login
4. **Scoring Interface** (`/scoring`) - Score each dancer
5. **Results Page** (`/results`) - Rankings and export

### Assets (In `public/` folder)
- `logo.png` - TOPAZ center logo
- `left-dancer.png` - Left dancer silhouette
- `right-dancer.png` - Right dancer silhouette
- `background.jpg` - Page background image

### Configuration Files
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite configuration
- `vercel.json` - Vercel deployment settings
- `tailwind.config.js` - Tailwind CSS configuration

## 🌐 Deploy to Vercel (3 Methods)

### Method 1: Quick Deploy with Vercel CLI (Fastest)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate to project
cd topaz-scoring

# 3. Deploy
vercel

# 4. Follow the prompts:
#    - Set up and deploy? [Y]
#    - Which scope? [Your account]
#    - Link to existing project? [N]
#    - Project name? [topaz-scoring]
#    - Directory? [./]
#    - Override settings? [N]

# 5. Production deployment
vercel --prod
```

### Method 2: Deploy via Vercel Dashboard (Recommended)

1. **Push to Git Repository**
   ```bash
   # Initialize git (if not done)
   cd topaz-scoring
   git init
   git add .
   git commit -m "Initial commit - TOPAZ 2.0 ready for deployment"
   
   # Push to GitHub/GitLab/Bitbucket
   git remote add origin YOUR_REPO_URL
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New Project"**
   - **Import** your Git repository
   - Vercel will **auto-detect** Vite configuration
   - Click **"Deploy"**
   - Wait 1-2 minutes for build

3. **Done!** Your app will be live at: `https://topaz-scoring.vercel.app`

### Method 3: Drag & Drop (Quickest for Testing)

1. Build the project:
   ```bash
   cd topaz-scoring
   npm run build
   ```

2. Go to [vercel.com](https://vercel.com)
3. Drag and drop the `dist/` folder
4. Vercel will deploy instantly

## 🎯 Post-Deployment

### Verify Deployment
1. Open your Vercel URL
2. Test the complete flow:
   - Start new competition
   - Add 2-3 dancers
   - Select Judge 1
   - Score all dancers
   - View results

### Custom Domain (Optional)
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain (e.g., `topaz-scoring.com`)
4. Follow DNS configuration instructions

## 🔧 Build Configuration

The app uses these build settings (already configured):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

## 📱 Environment

- **Node Version**: 18.x or higher
- **Framework**: Vite (auto-detected by Vercel)
- **Build Time**: ~10-15 seconds
- **Deploy Time**: ~1-2 minutes total

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
cd topaz-scoring
rm -rf node_modules dist
npm install
npm run build
```

### Images Not Loading
- Verify all images are in `public/` folder
- Check image paths use `/image.png` format (not `/src/assets/`)

### Routing Issues
- Vercel handles SPA routing automatically
- No additional configuration needed

## 🎉 Success Indicators

After deployment, you should see:
- ✅ Build completes in < 30 seconds
- ✅ All pages load correctly
- ✅ Images and logos display
- ✅ Scoring and data persistence work
- ✅ Responsive design on all devices

## 📊 Performance Expectations

- **Lighthouse Score**: 90+ (Performance)
- **First Load**: < 2 seconds
- **Page Transitions**: Instant (SPA)
- **Bundle Size**: ~268 KB (gzipped: ~81 KB)

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

---

## 🎭 Ready to Deploy!

Your TOPAZ 2.0 Scoring System is **production-ready** and can be deployed immediately!

**Quick Start:**
```bash
cd topaz-scoring
vercel --prod
```

Good luck with your deployment! 🚀

