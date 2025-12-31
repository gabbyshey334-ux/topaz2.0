# TOPAZ 2.0 Scoring System

**Heritage Since 1972 - Modernized for Today**

A professional digital scoring system for dance competitions with automatic calculations, rankings, and real-time results.

## 🎭 Features

- **Competition Setup**: Add dancers, configure judges, set competition details
- **Multi-Judge Scoring**: Independent scoring interface for each judge
- **4-Category Scoring System**:
  - Technique (0-25 points)
  - Creativity & Choreography (0-25 points)
  - Presentation (0-25 points)
  - Appearance & Costume (0-25 points)
- **Auto-Calculate Rankings**: Automatic averaging and ranking based on all judge scores
- **Results Display**: Professional results page with top 3 highlighting (🥇🥈🥉)
- **Data Persistence**: LocalStorage saves scores for recovery
- **Responsive Design**: Optimized for iPad, works on all devices
- **Print/Export**: Print results directly from the browser

## 🚀 Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Styling
- **LocalStorage** - Data persistence

## 📦 Installation

```bash
cd topaz-scoring
npm install
```

## 🛠️ Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## 📤 Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd topaz-scoring
vercel
```

3. Follow the prompts to link to your Vercel account

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Vite configuration
6. Click "Deploy"

### Important: Asset Setup

Before deploying, ensure these files are in the `public/` folder:
- `logo.png` - Center logo (96x96px recommended)
- `left-dancer.png` - Left dancer image (128x160px recommended)
- `right-dancer.png` - Right dancer image (128x160px recommended)
- `background.jpg` - Background image

## 📱 Usage Flow

1. **Welcome Page** → Start new competition
2. **Competition Setup** → Enter details, add dancers
3. **Judge Selection** → Each judge selects their number
4. **Scoring Interface** → Judge scores each dancer
5. **Results Page** → View rankings, print, or export

## 🎯 Scoring Categories (Max 100 Points)

- **Technique**: Technical skill and execution (0-25)
- **Creativity & Choreography**: Originality and composition (0-25)
- **Presentation**: Stage presence and performance (0-25)
- **Appearance & Costume**: Visual presentation (0-25)

## 📊 Rankings Calculation

- Each judge scores independently
- System calculates average score across all judges
- Dancers ranked from highest to lowest average
- Ties are handled with shared ranking

## 🎨 Branding

- **Primary Colors**: Cyan (#00BCD4) and Teal
- **Theme**: Modern dance competition aesthetic
- **Logo**: Theater masks with dancer silhouettes
- **Heritage**: Since 1972

## 📄 License

© 2025 TOPAZ 2.0 Scoring System. All rights reserved.

---

**Built with ❤️ for the dance community**
