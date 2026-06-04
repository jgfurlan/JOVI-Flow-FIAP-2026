# Design Spec: JOVI "Smart Canvas" Camera UI

## 1. Overview
The "Smart Canvas" is a futuristic, hyper-minimalist web-based camera interface designed for the JOVI x FIAP Challenge 2026. It prioritizes the viewfinder as the central experience, using "invisible" controls and AI-driven feedback to provide a premium, high-performance feel.

## 2. Core UI Components

### 2.1 The "Liquid" Viewfinder
- **Description:** A true full-screen camera preview using the `getUserMedia` API.
- **Aesthetic:** No visible chrome or borders. UI elements float on top using a "Liquid Glass" (glassmorphism) style—translucent, blurred backgrounds that inherit colors from the camera feed.

### 2.2 The Interactive "Aura Ring" (Primary Control)
- **Visual:** A floating translucent ring at the bottom center.
- **Primary Action (Tap):** Captures the photo.
- **Secondary Action (Drag/Rotation):** 
    - Dragging clockwise/counter-clockwise simulates the JOVI hardware "Aura Light."
    - Dynamically applies a CSS filter/overlay to the viewfinder to adjust color temperature (Warm/Cool) in real-time.
- **Haptic Feedback:** Uses the **Vibration API** to simulate "ticks" as the user rotates the ring.

### 2.3 The "Bento" Intelligent Gallery (Secondary UI)
- **Trigger:** A small, rounded "Bento" tile in the bottom-left corner showing the latest capture.
- **Action:** Expanding reveals a modular grid (Bento Box layout) of recent photos.
- **Intelligence:** Photos are automatically grouped into "Memories" based on timestamps.

### 2.4 Performance "Spark" (AI Feedback)
- **Visual:** A tiny, pulsing glowing dot in the top-right corner.
- **Function:** Provides "Performance Feedback."
    - **Green:** Optimal conditions.
    - **Gold/Amber:** AI Low-Light enhancement active.
    - **Blue:** Focus/Stability optimization active.

## 3. Technical Implementation Strategy

### 3.1 Frontend Stack
- **Framework:** Vanilla HTML5/CSS3 and TypeScript/JavaScript (to maximize speed/minimality).
- **Styling:** Modern CSS (Flexbox/Grid) with custom animations.
- **Performance:** **View Transitions API** for seamless switching between Camera and Gallery views.

### 3.2 Key Web APIs
- **MediaDevices API:** For high-resolution camera access.
- **Vibration API:** For tactile interaction with the Aura Ring.
- **IndexedDB:** For local, high-speed caching of captured media (simulated).
- **Service Workers:** For offline functionality and instant loading.

## 4. Interaction Map
1. **Launch:** App loads in <200ms with a skeleton screen.
2. **Composition:** User sees 100% viewfinder. Performance Spark indicates AI readiness.
3. **Lighting Adjustment:** User drags Aura Ring; preview warms/cools instantly.
4. **Capture:** Tap Shutter; screen flashes subtly; Bento preview updates.
5. **Review:** Tap Bento; View Transitions API slides the gallery into view.

---
*Status: Final Design approved for JOVI x FIAP Challenge.*
