# [JOVI-106] View Transitions & Bento Grid Morphing Failure

## Issue Description
The CSS Bento Grid morphing and View Transitions are completely failing on both PC browsers and iPhone browsers. Despite fallback logic (PR #20) and caching fixes (PR #18), the smooth transitions and gallery interactions do not trigger correctly.

## Context from Graphify Trace
The `graphify` semantic pipeline was run on `src/poc/js/app.js` and `src/poc/index.html`. 
The resulting knowledge graph is available in `graphify-out/graph.html` and `graphify-out/GRAPH_REPORT.md`.

**Key Graphify Findings:**
- **Community 0 (Gallery & Photo Logic):** `app_loadgallery`, `app_opendetail`, `app_deletecurrentphoto`
- **Community 2 (UI Views):** `app_showscreen` references `index_screencamera`, `index_screendetail`, `index_screengallery`.
- **The Gap:** There is a disconnect between how `app_showscreen` removes/adds the `.d-none` class and how the View Transition API handles state capture. The View Transition API requires the DOM state to change *inside* the callback passed to `document.startViewTransition()`. However, `app_showscreen` manipulates `.d-none` immediately. 

## Technical Diagnosis for Pi Agent
1. **View Transition Name Assignment:** In `app_opendetail`, the script applies `view-transition-name: photo-detail` to the clicked gallery image and the detail view image. If multiple elements have the same `view-transition-name` at the same time, the transition will abort.
2. **Timing & DOM Updates:** The `showScreen()` function forcefully applies `.d-none`. The `document.startViewTransition()` callback might not be correctly wrapping the DOM mutations in `showScreen()`.
3. **Bento Grid Logic:** The flex/grid CSS classes for the gallery might be collapsing or reflowing too aggressively before the transition can capture the old/new visual states.

## Tasks for Pi Agent
1. **Review Graphify Output:** Open `graphify-out/graph.html` to visualize the exact dependency tree between the gallery load function and the detail view rendering.
2. **Fix `view-transition-name` Collision:** Ensure that the transition name is uniquely applied and removed *immediately* after the transition ends to prevent collisions.
3. **Refactor `showScreen`:** Ensure `showScreen` wraps its DOM updates inside `document.startViewTransition(() => { ... })` properly for browsers that support it, maintaining an elegant fallback for those that don't.
4. **Test Morphing:** Validate the exact morphing behavior between the grid item and the absolute detail view.
