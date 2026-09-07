# Lightweight Spec: IndexedDB Delete-by-ID

**Task:** `JOVI-111` — Delete photo by primary key ID instead of loading all base64 blobs into memory
**Date:** 2026-09-07
**Status:** In Progress
**Author:** Pair Programmer

---

## 1. Problem

In `src/poc/js/app.js`:
- `deleteCurrentPhoto()` currently calls `store.getAll()` to retrieve every single photo in the database into memory, and then searches for the one matching `lastPhotoData` (a full Base64 JPEG string of hundreds of kilobytes).
- This is inefficient ($O(N)$ with large memory allocation), vulnerable to failure if duplicate data exists, and unnecessary because each photo record in the IndexedDB store has an auto-incrementing integer primary key `id`.
- Furthermore, `openDetail(photo)` already receives the full photo object `photo` containing `photo.id`.

---

## 2. Change

1. In `src/poc/js/app.js`:
   - Declare `let currentPhotoId = null;` near top-level state variables.
   - In `openDetail(photo)`: set `currentPhotoId = photo.id;`.
   - In `deleteCurrentPhoto()`:
     - Check `if (currentPhotoId == null) return;`
     - Perform direct $O(1)$ deletion: `store.delete(currentPhotoId);`
     - On transaction complete: reset `currentPhotoId = null; lastPhotoData = null;`, display toast `'Foto excluída'`, transition back to `SCREENS.GALLERY` and call `loadGallery()`.
2. In `savePhoto(imageData, sharpness)`:
   - Ensure the resolved photo object has its `id` preserved.

---

## 3. Verification Array

- [x] JS syntax passes `node --check src/poc/js/app.js`.
- [x] In browser / Puppeteer: capture photo, navigate to gallery, click photo to open detail screen, tap `#btn-delete`.
- [x] Assert photo is removed from IndexedDB, gallery updates, and detail view transitions back to gallery cleanly.
- [x] Zero console errors or unhandled rejections.
