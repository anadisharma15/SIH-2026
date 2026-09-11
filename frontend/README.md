# VoiceGuard AI - Frontend

This is the frontend component of the VoiceGuard AI application (SIH 2026), built using **React** and **Vite**. 

## Architecture

The frontend follows a modern React functional component architecture. 
- **Routing**: Client-side routing is handled via `react-router-dom` in `App.jsx`, organizing the interface into distinct pages.
- **Styling**: Component-scoped styling is achieved using standard CSS files matched with their respective functional components.
- **Service Layer**: Backend integrations are abstracted into a service layer (`services/api.js`) to decouple UI logic from data fetching.
- **State Management**: Application states are managed contextually at the component level using React Hooks (`useState`, `useEffect`, `useRef`).

## Folder Structure

```text
frontend/
├── public/                 # Static assets directly served to the client
│   ├── logo.png            # Application logo and favicon
│   └── logo-animation.mp4  # Animated logo clip
├── src/                    # Source code
│   ├── components/         # Reusable UI building blocks
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── pages/              # High-level route components
│   │   ├── About.jsx
│   │   ├── Detect.jsx
│   │   ├── Home.jsx
│   │   ├── Landing.jsx
│   │   ├── LiveDetection.jsx
│   │   └── Results.jsx
│   ├── services/           # Abstraction for backend communications
│   │   └── api.js          
│   ├── styles/             # Dedicated CSS styles
│   │   ├── about.css
│   │   ├── detect.css
│   │   ├── footer.css
│   │   ├── global.css      # Application-wide global styling
│   │   ├── home.css
│   │   ├── landing.css
│   │   ├── liveDetection.css
│   │   ├── navbar.css
│   │   └── results.css
│   ├── App.jsx             # App core, defining layouts and routes
│   └── main.jsx            # React root mount point
├── eslint.config.js        # Linting profiles
├── package.json            # NPM dependencies and scripts
└── vite.config.js          # Vite build configuration
```

## Running the Application

1. Make sure you have Node installed.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
