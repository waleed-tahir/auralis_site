<div align="center">
  <img src="public/favicon.png" alt="Auralis Logo" width="80" height="80" />
  <h1>AURALIS</h1>
  <p><strong>The future of high-fidelity spatial audio.</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-0052cc?style=for-the-badge&logo=vercel)](https://waleed-tahir.github.io/auralis_site/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
</div>

<br/>

## 🌐 Live Preview

Experience the live interactive prototype here:  
**👉 [https://waleed-tahir.github.io/auralis_site/](https://waleed-tahir.github.io/auralis_site/) 👈**

---

## 🎬 Showcases

Auralis is a meticulously designed marketing and product portfolio site built to highlight premium audio hardware and software.

### Website Design & Scroll Animation
Features smooth scroll-driven animations, an isometric blueprint view, a dynamic "bento grid" layout, and a custom scrolling 3D phone fan effect.

<div align="center">
  <img src="public/demos/web_design.webp" alt="Website Design Demo" width="800" />
</div>

<br/>

### Interactive App Prototype
An interactive 400vh scrolling container where the companion app seamlessly crossfades through various interfaces, including an animated Dynamic Island.

<div align="center">
  <img src="public/demos/app_design.webp" alt="App Prototype Demo" width="800" />
</div>

---

## ✨ Key Features

- **Hero Fan Animation:** Scroll-driven overlapping devices that fan out cleanly and precisely without centering issues.
- **Bento Grid Presentation:** Cards that fade into focus seamlessly as you scroll down, highlighting product benefits and technology.
- **Isometric SVG Blueprint:** A complex, scroll-linked animated blueprint showcasing internal hardware composition and chip structures.
- **Sticky App Prototype:** A fully functional mock iOS app interface featuring 4 distinct modes (Spatial, Tune, Analytics, Settings) that transition smoothly based on scroll progress or manual button clicks.
- **Premium Aesthetics:** Uses a tailored "Ice & Silver" palette (`#ADC6FF`, `#C8CCD4`, `#050508`) with sleek glassmorphism, micro-animations, and dynamic canvas backgrounds.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS v4
- **Icons**: Lucide React
- **Animations**: Custom React hooks (`useElementScrollProgress`, `useWindowScrollY`) to link DOM scroll positions directly to inline styles and transforms.
- **Audio API**: Web Audio API synthetics for live 3D sound processing and ANC visualization.

---

## 🚀 Local Development

Follow these steps to get the project up and running locally.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/waleed-tahir/auralis_site.git
   cd auralis_site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📦 Deployment (GitHub Pages)

Deployment is automated using the `gh-pages` package. 

To manually trigger a deployment from your local machine to the `gh-pages` branch, simply run:
```bash
npm run deploy
```

*(Note: The `base` property in `vite.config.js` is set to `./` so relative paths resolve correctly in production.)*
