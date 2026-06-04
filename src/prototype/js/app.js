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

    const SCREENS = {
        SPLASH: 'splash',
        CAMERA: 'camera',
        GALLERY: 'gallery',
        DETAIL: 'detail',
        SHARE: 'share'
    };

    const STORAGE_KEY = 'jovi-flow-media';

    async function init() {
        console.log('[JOVI Flow] Initializing...');
        bindEvents();
        await loadGallery();
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
    }

    function bindEvents() {
        document.getElementById('screen-splash').addEventListener('click', () => {
            showScreen(SCREENS.CAMERA);
            startCamera();
        });

        document.getElementById('btn-capture').addEventListener('click', capturePhoto);
        document.getElementById('btn-gallery-thumb')?.addEventListener('click', () => showScreen(SCREENS.GALLERY));
        document.getElementById('btn-goto-camera')?.addEventListener('click', () => showScreen(SCREENS.CAMERA));
        document.getElementById('btn-back-camera')?.addEventListener('click', () => showScreen(SCREENS.CAMERA));
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
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screen = document.getElementById(`screen-${screenId}`);
        if (screen) {
            screen.classList.add('active');
            currentScreen = screenId;
            console.log(`[JOVI Flow] Screen: ${screenId}`);
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

    async function capturePhoto() {
        const video = document.getElementById('camera-preview');
        const canvas = document.getElementById('camera-canvas');
        const auraEffect = document.querySelector('.aura-light-effect');

        if (!video || !canvas) return;

        const captureBtn = document.getElementById('btn-capture');
        captureBtn.disabled = true;

        auraEffect?.classList.add('active');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        applyAuraLightEffect(ctx, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        lastPhotoData = imageData;

        await savePhoto(imageData);

        setTimeout(() => {
            auraEffect?.classList.remove('active');
            captureBtn.disabled = false;
            showToast('Foto salva!');
            updateGalleryThumbnail(imageData);
        }, 500);
    }

    function applyAuraLightEffect(ctx, width, height) {
        const gradient = ctx.createRadialGradient(
            width / 2, height * 0.7,
            0,
            width / 2, height * 0.7,
            Math.min(width, height) * 0.3
        );
        gradient.addColorStop(0, 'rgba(255, 214, 0, 0.15)');
        gradient.addColorStop(0.5, 'rgba(255, 214, 0, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 214, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    async function savePhoto(imageData) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORAGE_KEY, 'readwrite');
            const store = tx.objectStore(STORAGE_KEY);

            const photo = {
                id: Date.now(),
                data: imageData,
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
                photos.forEach(photo => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.innerHTML = `<img src="${photo.data}" alt="Foto" loading="lazy">`;
                    item.addEventListener('click', () => openDetail(photo));
                    grid.appendChild(item);
                });
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
        showScreen(SCREENS.DETAIL);
    }

    function deleteCurrentPhoto() {
        if (!lastPhotoData) return;
        showToast('Foto excluída');
        showScreen(SCREENS.GALLERY);
        loadGallery();
    }

    function openShareScreen() {
        if (!lastPhotoData) return;
        document.getElementById('share-preview-image').src = lastPhotoData;
        showScreen(SCREENS.SHARE);
    }

    async function shareTo(platform) {
        const status = document.getElementById('share-status');
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
                // Re-render if needed
            }
        }
    }

    function showToast(message) {
        const container = document.getElementById('toast-container');
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
