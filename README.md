# Seasonal 365-Day Tree Calendar

A beautiful Three.js visualization of a year as a low-poly tree with 365 leaves, each representing a day of the year.

## Features

- 🌳 Low-poly stylized tree with 365 leaves (one per day)
- 🍂 Four season branches (Spring, Summer, Autumn, Winter) with distinct color palettes
- 📅 Dynamic leaf coloring based on date (past/today/future)
- 🖱️ Interactive hover support with tooltips showing date and season
- 🎨 Panoramic background support (add your own `bg.jpg`)
- ✨ Smooth animations and breathing effect

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add background image (optional):
   - Place a panoramic background image at `public/bg.jpg`
   - Recommended: Japanese garden/temple scene (16:9 aspect ratio)
   - If not provided, a gradient background will be used

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
tree-calendar/
├── index.html          # Main HTML entry point
├── main.js             # Three.js scene setup and animation loop
├── styles.css          # UI styling
├── tree/
│   └── SeasonalTree.js # Tree class with calendar logic
├── public/
│   └── bg.jpg          # Background image (add your own)
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## Color Palettes

### Season Branches
- Spring: #9be7a6 (pastel green)
- Summer: #5cc87a (vibrant green)
- Autumn: #e9964c (warm orange)
- Winter: #cfd8dc (cool gray)

### Leaf Status
- Past: #bdbdbd (gray)
- Today: #ffeb3b (yellow, glowing)
- Future: #dddddd (light gray)

## Controls

- **Mouse drag**: Rotate camera around tree
- **Scroll**: Zoom in/out
- **Hover**: See date and season info for each leaf

## Technologies

- Vite (vanilla JavaScript)
- Three.js (ES modules)
- OrbitControls for camera interaction

