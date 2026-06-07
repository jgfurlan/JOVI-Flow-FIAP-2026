/**
 * JOVI Flow – 3 Touch Camera Experience
 * Core Application
 */

const JOVIFlow = (() => {
    let currentScreen = 'splash';
    let mediaStream = null;
    let lastPhotoData = null;
    let fpsHistory = [];
    let animationFrameId = null;

    // Aura Light Gesture State
    let isDragging = false;
    let startX = 0;
    let startTemperature = 5000; // default Kelvin
    let currentTemperature = 5000;

    const SCREENS = {
        SPLASH: 'splash',
        CAMERA: 'camera',
        GALLERY: 'gallery',
        DETAIL: 'detail',
        SHARE: 'share'
    };

    const STORAGE_KEY = 'jovi-flow-media';

    async function init() {
        try {
            console.log('[JOVI Flow] Initializing...');
            bindEvents();

            // Do not await loadGallery so it doesn't block the UI if DB hangs
            loadGallery().catch(e => console.error('[JOVI Flow] loadGallery error:', e));

            showScreen(SCREENS.SPLASH);

            if (window.location.protocol === 'file:') {
                showToast('Aviso: Câmera requer Servidor HTTP (localhost)');
            }

            setTimeout(() => {
                if (window.location.protocol !== 'file:') {
                    showScreen(SCREENS.CAMERA);
                    startCamera();
                }
            }, 2000);
        } catch (error) {
            alert("Init error: " + error.message);
            console.error(error);
        }
    }

    function bindEvents() {
        document.getElementById('screen-splash').addEventListener('click', () => {
            showScreen(SCREENS.CAMERA);
            startCamera();
        });

        // Pointer gestures for Aura Shutter button
        const btnCapture = document.getElementById('btn-capture');
        if (btnCapture) {
            btnCapture.addEventListener('pointerdown', (e) => {
                isDragging = true;
                startX = e.clientX;
                btnCapture.setPointerCapture(e.pointerId);
                navigator.vibrate?.(15); // haptic vibration tap
            });

            btnCapture.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                const diffX = e.clientX - startX;
                const tempChange = diffX * 20; // 1px drag = 20 Kelvin change
                let newTemp = Math.max(2000, Math.min(10000, startTemperature + tempChange));

                // Vibrate tick on each 500K threshold change
                if (Math.round(newTemp / 500) !== Math.round(currentTemperature / 500)) {
                    navigator.vibrate?.(5);
                }
                currentTemperature = newTemp;
                updateAuraLightTemperature(currentTemperature);

                // Rotate the dial visually
                const ring = btnCapture.querySelector('.capture-ring');
                if (ring) {
                    const rotation = ((currentTemperature - 5000) / 5000) * 180;
                    ring.style.transform = `rotate(${rotation}deg)`;
                }
            });

            btnCapture.addEventListener('pointerup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                btnCapture.releasePointerCapture(e.pointerId);
                startTemperature = currentTemperature;

                const diffX = Math.abs(e.clientX - startX);
                if (diffX < 8) {
                    capturePhoto(); // quick tap triggers snap
                }
            });

            btnCapture.addEventListener('pointercancel', () => {
                isDragging = false;
            });
        }

        document.getElementById('btn-gallery-thumb')?.addEventListener('click', () => showScreen(SCREENS.GALLERY));
        document.getElementById('btn-goto-camera')?.addEventListener('click', () => {
            showScreen(SCREENS.CAMERA);
            startCamera();
        });
        document.getElementById('btn-back-camera')?.addEventListener('click', () => {
            showScreen(SCREENS.CAMERA);
            startCamera();
        });
        document.getElementById('btn-back-gallery')?.addEventListener('click', () => showScreen(SCREENS.GALLERY));
        document.getElementById('btn-back-detail')?.addEventListener('click', () => showScreen(SCREENS.GALLERY));
        document.getElementById('btn-share')?.addEventListener('click', openShareScreen);
        document.getElementById('btn-share-photo')?.addEventListener('click', openShareScreen);
        document.getElementById('btn-delete')?.addEventListener('click', deleteCurrentPhoto);

        document.querySelectorAll('.btn-share-option').forEach(btn => {
            btn.addEventListener('click', () => shareTo(btn.dataset.platform));
        });

        document.getElementById('btn-switch-camera')?.addEventListener('click', switchCamera);
        document.getElementById('btn-flash')?.addEventListener('click', toggleFlash);

        window.addEventListener('resize', handleOrientationChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    function showScreen(screenId) {
        const performTransition = () => {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            const screen = document.getElementById(`screen-${screenId}`);
            if (screen) {
                screen.classList.add('active');
                currentScreen = screenId;
                console.log(`[JOVI Flow] Screen: ${screenId}`);
            }
        };

        if (document.startViewTransition) {
            document.documentElement.classList.add('view-transitioning');
            const transition = document.startViewTransition(performTransition);
            transition.finished.finally(() => {
                document.documentElement.classList.remove('view-transitioning');
            });
        } else {
            performTransition();
        }
    }

    async function startCamera() {
        const video = document.getElementById('camera-preview');
        if (!video) return;

        try {
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = mediaStream;
            await video.play();
            startFPSCounter();
            console.log('[JOVI Flow] Camera started');
        } catch (error) {
            console.error('[JOVI Flow] Camera error:', error);
            showToast('Câmera não disponível. Use um dispositivo compatível.');
        }
    }

    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function startFPSCounter() {
        const video = document.getElementById('camera-preview');
        const fpsCounter = document.getElementById('fps-counter');
        let lastTime = performance.now();
        let frameCount = 0;

        function countFPS() {
            if (currentScreen !== SCREENS.CAMERA) {
                animationFrameId = requestAnimationFrame(countFPS);
                return;
            }

            frameCount++;
            const now = performance.now();
            const delta = now - lastTime;

            if (delta >= 1000) {
                const fps = Math.round(frameCount * 1000 / delta);
                fpsHistory.push(fps);
                if (fpsHistory.length > 10) fpsHistory.shift();
                const avgFps = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);
                if (fpsCounter) fpsCounter.textContent = `${avgFps} FPS`;
                frameCount = 0;
                lastTime = now;
            }

            animationFrameId = requestAnimationFrame(countFPS);
        }

        animationFrameId = requestAnimationFrame(countFPS);
    }

    function updateAuraLightTemperature(temp) {
        const overlay = document.querySelector('.camera-overlay');
        const spark = document.getElementById('performance-spark');
        if (!overlay) return;

        let r, g, b;
        if (temp < 5000) {
            // Warm Orange tones
            const ratio = (temp - 2000) / 3000;
            r = 255;
            g = Math.round(140 + ratio * 115);
            b = Math.round(ratio * 255);

            if (spark) {
                spark.className = 'performance-spark low-light';
                spark.title = 'AI Night Mode Ativo';
            }
        } else {
            // Cool Blue tones
            const ratio = (temp - 5000) / 5000;
            r = Math.round(255 - ratio * 245);
            g = Math.round(255 - ratio * 194);
            b = 255;

            if (spark) {
                spark.className = 'performance-spark stabilizing';
                spark.title = 'Foco Estabilizado';
            }
        }

        overlay.style.background = `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.25) 0%, rgba(${r}, ${g}, ${b}, 0) 80%)`;
        overlay.style.mixBlendMode = 'soft-light';
    }

    async function capturePhoto() {
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const auraEffect = document.querySelector('.aura-light-effect');

        if (!video || !canvas) return;

        const captureBtn = document.getElementById('btn-capture');
        captureBtn.disabled = true;

        auraEffect?.classList.add('active');

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        applyAuraLightEffect(ctx, canvas.width, canvas.height);

        const sharpness = calculateSharpness(ctx, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        lastPhotoData = imageData;

        const photo = await savePhoto(imageData, sharpness);

        setTimeout(() => {
            auraEffect?.classList.remove('active');
            captureBtn.disabled = false;
            showToast('Foto salva!');
            updateGalleryThumbnail(imageData);
            loadGallery();
        }, 300);
    }

    function applyAuraLightEffect(ctx, width, height) {
        let r, g, b;
        if (currentTemperature < 5000) {
            const ratio = (currentTemperature - 2000) / 3000;
            r = 255;
            g = Math.round(140 + ratio * 115);
            b = Math.round(ratio * 255);
        } else {
            const ratio = (currentTemperature - 5000) / 5000;
            r = Math.round(255 - ratio * 245);
            g = Math.round(255 - ratio * 194);
            b = 255;
        }

        const gradient = ctx.createRadialGradient(
            width / 2, height * 0.5,
            0,
            width / 2, height * 0.5,
            Math.min(width, height) * 0.4
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.05)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function calculateSharpness(ctx, width, height) {
        const sampleSize = 100;
        const sx = Math.floor((width - sampleSize) / 2);
        const sy = Math.floor((height - sampleSize) / 2);

        try {
            const imgData = ctx.getImageData(sx, sy, sampleSize, sampleSize);
            const data = imgData.data;
            const size = sampleSize;

            const gray = new Uint8Array(size * size);
            for (let i = 0; i < data.length; i += 4) {
                gray[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            }

            let varianceSum = 0;
            let count = 0;

            for (let y = 1; y < size - 1; y++) {
                for (let x = 1; x < size - 1; x++) {
                    const idx = y * size + x;
                    const val = 4 * gray[idx]
                              - gray[idx - 1]
                              - gray[idx + 1]
                              - gray[idx - size]
                              - gray[idx + size];
                    varianceSum += val * val;
                    count++;
                }
            }

            const meanSquared = varianceSum / count;
            const score = Math.min(1.0, Math.max(0.1, meanSquared / 700));
            console.log('[JOVI Flow] Sharpness score:', score);
            return parseFloat(score.toFixed(2));
        } catch (e) {
            console.warn('[JOVI Flow] Sharpness check error:', e);
            return 0.8;
        }
    }

    async function savePhoto(imageData, sharpness) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORAGE_KEY, 'readwrite');
            const store = tx.objectStore(STORAGE_KEY);

            const photo = {
                id: Date.now(),
                data: imageData,
                sharpness: sharpness || 0.8,
                createdAt: new Date().toISOString()
            };

            store.add(photo);
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });

            console.log('[JOVI Flow] Photo saved:', photo.id);
            return photo;
        } catch (error) {
            console.error('[JOVI Flow] Save error:', error);
            showToast('Erro ao salvar foto');
        }
    }

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('JOVIFlowDB', 1);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORAGE_KEY)) {
                    db.createObjectStore(STORAGE_KEY, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async function loadGallery() {
        const grid = document.getElementById('gallery-grid');
        const empty = document.getElementById('gallery-empty');
        const footer = document.getElementById('gallery-footer');

        if (!grid) return;

        try {
            const db = await openDB();
            const tx = db.transaction(STORAGE_KEY, 'readonly');
            const store = tx.objectStore(STORAGE_KEY);
            const request = store.getAll();

            request.onsuccess = () => {
                const photos = request.result.reverse();

                if (photos.length === 0) {
                    empty.style.display = 'flex';
                    footer.style.display = 'none';
                    return;
                }

                empty.style.display = 'none';
                footer.style.display = 'block';

                grid.innerHTML = '';

                // Find highest sharpness index
                let highestSharpness = 0;
                let featuredIndex = -1;

                photos.forEach((p, idx) => {
                    if (p.sharpness && p.sharpness > highestSharpness) {
                        highestSharpness = p.sharpness;
                        featuredIndex = idx;
                    }
                });

                // Inject dynamic optimization stats card in Bento grid
                const statCard = document.createElement('div');
                statCard.className = 'gallery-item stat-card';
                const avgSharpness = (photos.reduce((acc, p) => acc + (p.sharpness || 0.8), 0) / photos.length * 100).toFixed(0);
                statCard.innerHTML = `
                    <div class="stat-title">IA Otimização</div>
                    <div class="stat-value">Bateria: +35%</div>
                    <div class="stat-title">Média Nitidez</div>
                    <div class="stat-value">${avgSharpness}%</div>
                `;

                photos.forEach((photo, idx) => {
                    const item = document.createElement('div');
                    const isFeatured = idx === featuredIndex;
                    item.className = `gallery-item${isFeatured ? ' featured' : ''}`;

                    let inner = `<img src="${photo.data}" alt="Foto" loading="lazy">`;
                    if (photo.sharpness) {
                        inner += `<div class="sharpness-badge">Nitidez: ${(photo.sharpness * 100).toFixed(0)}%</div>`;
                    }
                    item.innerHTML = inner;
                    item.addEventListener('click', () => openDetail(photo));
                    grid.appendChild(item);
                });

                // Bento styling positioning
                if (grid.children.length > 1) {
                    grid.insertBefore(statCard, grid.children[1]);
                } else {
                    grid.appendChild(statCard);
                }

                // Update header title
                const headerTitle = document.querySelector('.gallery-header h2');
                if (headerTitle) headerTitle.textContent = 'Galeria Bento';
            };
        } catch (error) {
            console.error('[JOVI Flow] Load gallery error:', error);
        }
    }

    function updateGalleryThumbnail(imageData) {
        const thumb = document.querySelector('.thumbnail-placeholder');
        if (thumb) {
            thumb.style.backgroundImage = `url(${imageData})`;
            thumb.style.backgroundSize = 'cover';
            thumb.style.backgroundPosition = 'center';
        }
    }

    function openDetail(photo) {
        lastPhotoData = photo.data;
        document.getElementById('detail-image').src = photo.data;
        document.getElementById('detail-date').textContent = formatDate(photo.createdAt);

        // Dynamically assign view-transition-name class to the clicked item
        document.querySelectorAll('.gallery-item img').forEach(img => {
            img.classList.remove('transition-active');
            if (img.src === photo.data) {
                img.classList.add('transition-active');
            }
        });

        showScreen(SCREENS.DETAIL);
    }

    async function deleteCurrentPhoto() {
        if (!lastPhotoData) return;

        try {
            const db = await openDB();
            const tx = db.transaction(STORAGE_KEY, 'readwrite');
            const store = tx.objectStore(STORAGE_KEY);

            // Need to retrieve all to match the source Base64
            const request = store.getAll();
            request.onsuccess = async () => {
                const photos = request.result;
                const match = photos.find(p => p.data === lastPhotoData);
                if (match) {
                    store.delete(match.id);
                    await new Promise(resolve => {
                        tx.oncomplete = resolve;
                    });
                    showToast('Foto excluída');
                    showScreen(SCREENS.GALLERY);
                    loadGallery();
                }
            };
        } catch (e) {
            console.error('[JOVI Flow] Delete failed:', e);
        }
    }

    function openShareScreen() {
        if (!lastPhotoData) return;
        document.getElementById('share-preview-image').src = lastPhotoData;
        showScreen(SCREENS.SHARE);
    }

    async function shareTo(platform) {
        const status = document.getElementById('share-status');
        if (!status) return;
        status.textContent = '';

        switch (platform) {
            case 'whatsapp':
                const waUrl = `https://wa.me/?text=${encodeURIComponent('Compartilhado via JOVI Flow 📸')}`;
                window.open(waUrl, '_blank');
                status.textContent = 'Abrindo WhatsApp...';
                break;

            case 'instagram':
                status.textContent = 'Copie a imagem e cole no Instagram';
                navigator.clipboard.writeText(lastPhotoData).catch(() => {});
                break;

            case 'copy':
                try {
                    const response = await fetch(lastPhotoData);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    status.textContent = 'Imagem copiada!';
                } catch (error) {
                    status.textContent = 'Erro ao copiar. Tente salvar.';
                }
                break;
        }
    }

    async function switchCamera() {
        if (!mediaStream) return;

        const video = document.getElementById('camera-preview');
        const currentFacing = mediaStream.getVideoTracks()[0].getSettings().facingMode;
        const newFacing = currentFacing === 'environment' ? 'user' : 'environment';

        stopCamera();

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacing }
            });
            video.srcObject = mediaStream;
            await video.play();
            showToast(`Câmera: ${newFacing === 'user' ? 'frontal' : 'traseira'}`);
        } catch (error) {
            console.error('[JOVI Flow] Switch camera error:', error);
            showToast('Erro ao trocar câmera');
            startCamera();
        }
    }

    function toggleFlash() {
        if (!mediaStream) return;
        const track = mediaStream.getVideoTracks()[0];
        if (track.getCapabilities()?.torch) {
            const current = track.getSettings().torch;
            track.applyConstraints({ advanced: [{ torch: !current }] });
            showToast(!current ? 'Flash ligado' : 'Flash desligado');
        } else {
            showToast('Flash não disponível');
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            stopCamera();
        } else if (currentScreen === SCREENS.CAMERA) {
            startCamera();
        }
    }

    function handleOrientationChange() {
        if (currentScreen === SCREENS.CAMERA) {
            const video = document.getElementById('camera-preview');
            if (video && video.videoWidth > 0) {
                // Resize handers if needed
            }
        }
    }

    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2500);
    }

    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', JOVIFlow.init);
