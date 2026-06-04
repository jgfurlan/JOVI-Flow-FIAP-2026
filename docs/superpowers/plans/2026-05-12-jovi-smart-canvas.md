# JOVI "Smart Canvas" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hyper-minimalist, high-performance web-based camera prototype for JOVI, featuring an interactive Aura Ring and Liquid Glass aesthetics.

**Architecture:** A single-page application (SPA) focused on the camera viewfinder. UI elements are layered on top of a full-screen `<video>` element. State is managed via a simple central store, and transitions use the View Transitions API.

**Tech Stack:** HTML5, CSS3 (Glassmorphism), Vanilla JavaScript, MediaDevices API, Vibration API, View Transitions API.

---

### Task 1: Foundation & Camera Stream

**Files:**
- Modify: `src/poc/index.html`
- Modify: `src/poc/css/jovi.css`
- Modify: `src/poc/js/app.js`

- [ ] **Step 1: Setup HTML boilerplate with full-screen video**

```html
<!-- src/poc/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>JOVI Smart Canvas</title>
    <link rel="stylesheet" href="css/jovi.css">
</head>
<body>
    <div id="app">
        <video id="viewfinder" autoplay playsinline muted></video>
        <div id="ui-layer">
            <!-- UI components will go here -->
        </div>
    </div>
    <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Add core layout CSS**

```css
/* src/poc/css/jovi.css */
* { margin: 0; padding: 0; box-sizing: border-box; }
body, html { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: sans-serif; }
#app { position: relative; width: 100vw; height: 100dvh; }
#viewfinder { width: 100%; height: 100%; object-fit: cover; }
#ui-layer { position: absolute; inset: 0; pointer-events: none; }
```

- [ ] **Step 3: Implement Camera Access in JS**

```javascript
// src/poc/js/app.js
const viewfinder = document.getElementById('viewfinder');

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false
        });
        viewfinder.srcObject = stream;
    } catch (err) {
        console.error("Camera access denied:", err);
    }
}

document.addEventListener('DOMContentLoaded', initCamera);
```

- [ ] **Step 4: Verify local server shows camera feed**
Run: `python3 -m http.server 8000 --directory src/poc/` (or similar)
Expected: Browser shows the camera stream full-screen.

---

### Task 2: Liquid Glass UI & Performance Spark

**Files:**
- Modify: `src/poc/index.html`
- Modify: `src/poc/css/jovi.css`
- Modify: `src/poc/js/app.js`

- [ ] **Step 1: Add Spark and Bento preview to HTML**

```html
<!-- src/poc/index.html inside #ui-layer -->
<div id="performance-spark" class="spark-green"></div>
<div id="bento-preview" class="glass-panel" style="pointer-events: auto;">
    <div class="preview-thumb"></div>
</div>
```

- [ ] **Step 2: Implement Glassmorphism and Spark CSS**

```css
/* src/poc/css/jovi.css */
.glass-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 18px;
}

#performance-spark {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
    transition: background 0.3s, box-shadow 0.3s;
}

.spark-green { background: #4dfa6d; box-shadow: 0 0 10px #4dfa6d; }
.spark-gold { background: #ffcc00; box-shadow: 0 0 10px #ffcc00; }

#bento-preview {
    position: absolute;
    bottom: 30px;
    left: 30px;
    width: 60px;
    height: 60px;
    overflow: hidden;
}
```

- [ ] **Step 3: Commit Task 2**
`git commit -m "feat: add liquid glass panels and performance spark"`

---

### Task 3: Interactive Aura Ring

**Files:**
- Modify: `src/poc/index.html`
- Modify: `src/poc/css/jovi.css`
- Modify: `src/poc/js/app.js`

- [ ] **Step 1: Add Aura Ring to HTML**

```html
<!-- src/poc/index.html inside #ui-layer -->
<div id="aura-controls" style="pointer-events: auto;">
    <div id="aura-ring-container">
        <div id="aura-shutter"></div>
        <svg id="aura-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
        </svg>
    </div>
</div>
```

- [ ] **Step 2: Style the Shutter and Ring**

```css
/* src/poc/css/jovi.css */
#aura-controls {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
}

#aura-ring-container {
    position: relative;
    width: 80px;
    height: 80px;
}

#aura-shutter {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 54px;
    height: 54px;
    background: #fff;
    border-radius: 50%;
    z-index: 2;
}

#aura-ring {
    position: absolute;
    inset: 0;
    transform: rotate(0deg);
}

#viewfinder-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: overlay;
    transition: background 0.2s;
}
```

- [ ] **Step 3: Implement Rotation & Filter Logic in JS**

```javascript
// src/poc/js/app.js
const auraRing = document.getElementById('aura-ring');
const viewfinder = document.getElementById('viewfinder');
let isRotating = false;
let startAngle = 0;
let currentRotation = 0;

auraRing.addEventListener('touchstart', (e) => {
    isRotating = true;
    const touch = e.touches[0];
    const rect = auraRing.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
});

window.addEventListener('touchmove', (e) => {
    if (!isRotating) return;
    const touch = e.touches[0];
    const rect = auraRing.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
    const delta = angle - startAngle;
    currentRotation += delta * (180 / Math.PI);
    auraRing.style.transform = `rotate(${currentRotation}deg)`;
    
    // Simulate Temperature
    const temp = Math.max(-20, Math.min(20, currentRotation / 10));
    viewfinder.style.filter = `sepia(${temp > 0 ? temp : 0}%) hue-rotate(${temp < 0 ? temp * 5 : 0}deg)`;
    
    if ('vibrate' in navigator) navigator.vibrate(5);
    startAngle = angle;
});

window.addEventListener('touchend', () => { isRotating = false; });
```

---

### Task 4: Bento Gallery & View Transitions

**Files:**
- Modify: `src/poc/index.html`
- Modify: `src/poc/css/jovi.css`
- Modify: `src/poc/js/app.js`

- [ ] **Step 1: Add Gallery Overlay to HTML**

```html
<!-- src/poc/index.html -->
<div id="gallery-view" class="hidden">
    <div class="gallery-header">
        <button id="close-gallery">Back</button>
        <h2>Memories</h2>
    </div>
    <div class="bento-grid">
        <div class="bento-item tall"></div>
        <div class="bento-item"></div>
        <div class="bento-item wide"></div>
    </div>
</div>
```

- [ ] **Step 2: Style Bento Grid**

```css
/* src/poc/css/jovi.css */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 20px;
}
.bento-item { background: #222; border-radius: 12px; aspect-ratio: 1; }
.tall { grid-row: span 2; }
.wide { grid-column: span 2; aspect-ratio: 2/1; }
.hidden { display: none; }
```

- [ ] **Step 3: Implement Transition Logic**

```javascript
// src/poc/js/app.js
const bentoPreview = document.getElementById('bento-preview');
const galleryView = document.getElementById('gallery-view');
const closeGallery = document.getElementById('close-gallery');

bentoPreview.onclick = () => {
    if (!document.startViewTransition) {
        galleryView.classList.remove('hidden');
        return;
    }
    document.startViewTransition(() => {
        galleryView.classList.remove('hidden');
    });
};

closeGallery.onclick = () => {
    if (!document.startViewTransition) {
        galleryView.classList.add('hidden');
        return;
    }
    document.startViewTransition(() => {
        galleryView.classList.add('hidden');
    });
};
```

---

### Task 5: Final Polish & Verification

- [ ] **Step 1: Add capture flash animation**
- [ ] **Step 2: Add auto-switching Performance Spark (Random intervals for demo)**
- [ ] **Step 3: Final cross-browser verification (Chrome/Safari Mobile)**
