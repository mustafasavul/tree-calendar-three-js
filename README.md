# 🌳 Seasonal 365-Day Tree Calendar

> A beautiful, interactive 3D visualization where a tree represents the entire year, with 365 leaves representing each day. Built with Three.js as a **vibe coding** project - focusing on creativity, aesthetics, and the joy of building something beautiful.

![Tree Calendar](https://img.shields.io/badge/Three.js-3D%20Visualization-000000?style=flat&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Open%20Source-green?style=flat)

## ✨ About This Project

This is a **vibe coding** project - a creative exploration focused on building something visually stunning and meaningful. The concept combines the beauty of nature with the precision of time, creating an immersive experience where users can visualize their year as a living, breathing tree.

Each leaf on the tree represents a day of the year, changing color based on whether it's in the past, present, or future. The tree features four seasonal branches with distinct color palettes, creating an intuitive and beautiful way to visualize time.

### 🎨 What is Vibe Coding?

**Vibe coding** is about prioritizing creativity, aesthetics, and the joy of building over strict technical requirements. It's coding with intention, focusing on:
- **Visual beauty** and user experience
- **Creative expression** through code
- **Learning through experimentation**
- **Building something meaningful** and inspiring

This project embodies that philosophy - it's not just functional, it's beautiful, thoughtful, and created with care.

## 🌟 Features

### Core Features
- 🌳 **365 Leaves**: Each leaf represents one day of the year
- 🍂 **Seasonal Branches**: Four distinct branches (Spring, Summer, Autumn, Winter) with unique color palettes
- 📅 **Dynamic Coloring**: Leaves change color based on date status:
  - **Past**: Faded gray (fallen leaves on ground)
  - **Today**: Gold with glowing outline (highlighted on branch)
  - **Future**: Light beige (normal leaves on branch)
- 🖱️ **Interactive Hover**: Tooltips show date and season information
- 🎨 **Panoramic Background**: Support for custom background images
- ✨ **Smooth Animations**: Breathing effects, camera auto-rotation, and seasonal transitions
- 🌍 **Multi-language Support**: 12 languages with automatic detection
- 📱 **Responsive Design**: Works on desktop and mobile devices

### Visual Features
- **Expanded Environment**: Large landscape with hills, flowers, mushrooms, trees, and natural objects
- **Seasonal Characters**: Four people representing each season with matching clothing colors
- **Campfire Scene**: Animated campfire with realistic particle effects
- **Dog Companion**: Animated dog near the campfire
- **Glassmorphism UI**: Modern, Apple-inspired liquid glass interface
- **Seasonal Effects**: Snow in winter, rain in autumn, sun in summer

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (or download the project):
```bash
git clone <repository-url>
cd tree-calendar
```

2. **Install dependencies**:
```bash
npm install
```

3. **Add background image (optional)**:
   - Place a panoramic background image at `public/bg.jpg`
   - Recommended: Japanese garden/temple scene (16:9 aspect ratio)
   - If not provided, a gradient background will be used

4. **Run development server**:
```bash
npm run dev
```

5. **Open in browser**:
   - The app will automatically open at `http://localhost:3000`
   - Or navigate to the URL shown in the terminal

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🚀 Deployment

This project is configured for easy deployment on popular platforms:

### Netlify

1. **Connect your repository** to Netlify
2. **Build settings** (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy!** Netlify will automatically handle SPA routing via `netlify.toml`

**Or deploy via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Vercel

1. **Import your repository** to Vercel
2. **Build settings** (auto-detected):
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Deploy!** Vercel will automatically handle routing via `vercel.json`

**Or deploy via CLI:**
```bash
npm install -g vercel
vercel --prod
```

### Other Platforms

The project can be deployed to any static hosting service:
- **GitHub Pages**: Set `base: '/repo-name/'` in `vite.config.js`
- **Cloudflare Pages**: Connect repository, build command: `npm run build`
- **AWS S3 + CloudFront**: Upload `dist` folder contents
- **Firebase Hosting**: Use `firebase init` and deploy `dist` folder

All platforms support the SPA routing via redirects configured in the respective config files.

## 📁 Project Structure

```
tree-calendar/
├── index.html              # Main HTML entry point
├── about.html              # About page
├── main.js                 # Three.js scene setup and animation loop
├── about.js                # About page localization
├── styles.css              # Main UI styling
├── about.css               # About page styling
├── localization.js         # Multi-language support (12 languages)
├── tree/
│   └── SeasonalTree.js     # Tree class with calendar logic
├── public/
│   └── bg.jpg              # Background image (add your own)
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## 🎨 Color Palettes

### Season Branches
- **Spring**: `#9be7a6` (pastel green) - March, April, May
- **Summer**: `#5cc87a` (vibrant green) - June, July, August
- **Autumn**: `#e9964c` (warm orange) - September, October, November
- **Winter**: `#cfd8dc` (cool gray) - December, January, February

### Leaf Status
- **Past**: `#b0a090` (muted wood gray) - Fallen leaves on ground
- **Today**: `#ffd700` (gold) - Glowing leaf with white outline
- **Future**: `#d4c4a8` (light wood beige) - Normal leaves on branch

### Seasonal Character Clothing
- **Spring**: Green (`#66bb6a`)
- **Summer**: Yellow/Amber (`#ffc107`)
- **Autumn**: Orange (`#ff6b35`)
- **Winter**: Light Blue (`#64b5f6`)

## 🎮 Controls

- **Mouse Drag**: Rotate camera around tree
- **Scroll**: Zoom in/out
- **Hover**: See date and season info for each leaf
- **Season Panel**: Click the tree icon (bottom right) to change seasons
- **Calendar Info**: Click the calendar icon (top left) to see statistics

## 🌍 Supported Languages

- English (en)
- Turkish (tr)
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Chinese (zh)
- Korean (ko)
- Arabic (ar)

Language is automatically detected from your browser settings.

## 🛠️ Technologies

- **Vite** - Build tool and development server
- **Three.js** - 3D graphics and WebGL rendering
- **JavaScript ES6+** - Modern JavaScript with ES modules
- **CSS3** - Glassmorphism UI design with animations

## 👨‍💻 Creator

**Mustafa Savul** - Front End Developer

- 🌐 [Website](https://mustafasavul.com/)
- 💼 [LinkedIn](https://www.linkedin.com/in/mustafasavul)
- 💻 [GitHub](https://github.com/mustafasavul)



## 🤖 AI-Assisted Development

This project was created with the assistance of AI tools. The development process involved collaboration between human creativity and AI capabilities to bring this interactive 3D calendar visualization to life. The combination of modern web technologies and AI assistance enabled rapid prototyping and implementation of complex 3D graphics and interactive features.

**Note**: While AI tools were used in the development process, the concept, design decisions, and final implementation were guided by human expertise and creativity.

## 📄 License & Usage

This project is **open source** and available for educational purposes. Feel free to:
- Explore the code
- Learn from it
- Use it as inspiration for your own projects
- Modify and experiment

If you use this code in your projects, please give appropriate credit.

## 🎯 Project Philosophy

This project represents **vibe coding** - coding with intention, focusing on:
- **Aesthetics over strict functionality**
- **Creative expression through code**
- **Building something beautiful and meaningful**
- **Learning through experimentation**
- **Enjoying the process of creation**

It's not about following every best practice or optimizing every line - it's about creating something that brings joy, inspires curiosity, and demonstrates the beauty that can be achieved with code.

## 🙏 Acknowledgments

- **Three.js** community for the amazing 3D library
- **Vite** team for the excellent build tool
- All the open-source contributors who make projects like this possible

## 📝 Future Ideas

Potential enhancements (if the vibe calls for it):
- [ ] Custom leaf shapes and patterns
- [ ] More seasonal effects and animations
- [ ] Sound effects and ambient music
- [ ] Export/share functionality
- [ ] Custom date range selection
- [ ] More interactive elements

---

**Made with ❤️ and good vibes**

*Remember: Code doesn't always have to be perfect. Sometimes it just needs to be beautiful and meaningful.*
