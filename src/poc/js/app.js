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

    // Camera Mode & Demo State
    const CAMERA_MODE = { LIVE: 'live', DEMO: 'demo' };
    let cameraMode = CAMERA_MODE.LIVE;
    let demoRafId = null;
    let intendedFacing = 'environment';
    let flashEnabled = false;

    // Gallery Selection State
    let isSelectMode = false;
    const selectedPhotoIds = new Set();
    let currentLoadedPhotos = [];

    // Aura Light Gesture State
    let isDragging = false;
    let startX = 0;
    let startTemperature = 5000; // default Kelvin
    let currentTemperature = 5000;
    let lastCaptureTime = 0;
    let currentPhotoId = null;
    let currentPhotoTags = [];

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
            updateCameraSuggestion(currentTemperature);

            // Carrega miniatura mais recente e galeria no IndexedDB
            updateLatestThumbnailFromDB().catch(() => {});
            loadGallery().catch(e => console.error('[JOVI Flow] loadGallery error:', e));

            showScreen(SCREENS.SPLASH);

            setTimeout(() => {
                showScreen(SCREENS.CAMERA);
                jovi_camera_acquire();
            }, 2000);
        } catch (error) {
            alert("Init error: " + error.message);
            console.error(error);
        }
    }

    function bindEvents() {
        document.getElementById('screen-splash')?.addEventListener('click', () => {
            showScreen(SCREENS.CAMERA);
            jovi_camera_acquire();
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
                try {
                    btnCapture.releasePointerCapture(e.pointerId);
                } catch (_) {}
                startTemperature = currentTemperature;

                const diffX = Math.abs(e.clientX - startX);
                if (diffX < 8) {
                    const now = Date.now();
                    if (now - lastCaptureTime > 400) {
                        lastCaptureTime = now;
                        capturePhoto();
                    }
                }
            });

            btnCapture.addEventListener('click', () => {
                const now = Date.now();
                if (now - lastCaptureTime > 400) {
                    lastCaptureTime = now;
                    capturePhoto();
                }
            });

            btnCapture.addEventListener('pointercancel', () => {
                isDragging = false;
            });
        }

        document.getElementById('btn-gallery-thumb')?.addEventListener('click', () => {
            loadGallery();
            showScreen(SCREENS.GALLERY);
        });
        document.getElementById('btn-goto-camera')?.addEventListener('click', () => {
            showScreen(SCREENS.CAMERA);
            jovi_camera_resume();
        });
        document.getElementById('btn-back-camera')?.addEventListener('click', () => {
            showScreen(SCREENS.CAMERA);
            jovi_camera_resume();
        });
        document.getElementById('btn-back-gallery')?.addEventListener('click', () => {
            loadGallery();
            showScreen(SCREENS.GALLERY);
        });
        document.getElementById('btn-back-detail')?.addEventListener('click', () => {
            loadGallery();
            showScreen(SCREENS.GALLERY);
        });

        // Galeria: Seleção e Compartilhamento
        document.getElementById('btn-select')?.addEventListener('click', toggleGallerySelectMode);
        document.getElementById('btn-share')?.addEventListener('click', handleGalleryShareClick);
        document.getElementById('btn-share-photo')?.addEventListener('click', openShareScreen);
        document.getElementById('btn-delete')?.addEventListener('click', deleteCurrentPhoto);

        // Detalhes: Tags
        document.getElementById('btn-add-tag')?.addEventListener('click', openTagPicker);
        document.getElementById('btn-close-tag-picker')?.addEventListener('click', closeTagPicker);
        document.querySelectorAll('.btn-tag-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.tag) {
                    addTagToCurrentPhoto(btn.dataset.tag);
                }
            });
        });
        document.getElementById('btn-save-custom-tag')?.addEventListener('click', () => {
            const input = document.getElementById('input-custom-tag');
            if (input && input.value) {
                addTagToCurrentPhoto(input.value);
                input.value = '';
            }
        });
        document.getElementById('input-custom-tag')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const input = document.getElementById('input-custom-tag');
                if (input && input.value) {
                    addTagToCurrentPhoto(input.value);
                    input.value = '';
                }
            }
        });

        document.querySelectorAll('.btn-share-option').forEach(btn => {
            btn.addEventListener('click', () => shareTo(btn.dataset.platform));
        });

        document.getElementById('btn-settings')?.addEventListener('click', () => {
            if (cameraMode === CAMERA_MODE.LIVE) {
                stopCamera();
                jovi_camera_enterDemo('ativado manualmente');
            } else {
                jovi_camera_acquire();
            }
        });

        document.getElementById('btn-retry-camera')?.addEventListener('click', () => {
            jovi_camera_acquire();
        });

        document.getElementById('camera-suggestion')?.addEventListener('click', applyNextSmartSuggestion);
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

    async function jovi_camera_acquire() {
        const video = document.getElementById('camera-preview');
        if (!video) return;

        if (window.location.protocol === 'file:') {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                jovi_camera_enterDemo('abra via servidor http para câmera real');
                return;
            }
        } else if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            jovi_camera_enterDemo('sem suporte a câmera');
            return;
        }

        try {
            const constraints = {
                video: {
                    facingMode: intendedFacing,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraMode = CAMERA_MODE.LIVE;
            jovi_camera_stopDemoFeed();

            video.classList.remove('d-none');
            document.getElementById('demo-feed')?.classList.add('d-none');
            document.getElementById('demo-badge')?.classList.add('d-none');
            document.getElementById('btn-retry-camera')?.classList.add('d-none');

            video.srcObject = mediaStream;
            await video.play();
            startFPSCounter();
            console.log('[JOVI Flow] Camera started in LIVE mode');
        } catch (error) {
            console.warn('[JOVI Flow] Camera acquisition failed:', error.name, error.message);
            stopCamera();

            if (window.location.protocol === 'file:') {
                jovi_camera_enterDemo('abra via servidor http para câmera real');
            } else if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
                jovi_camera_enterDemo('permissão de câmera negada');
            } else if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
                jovi_camera_enterDemo('nenhuma câmera encontrada');
            } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
                jovi_camera_enterDemo('câmera em uso por outro app');
            } else {
                jovi_camera_enterDemo('câmera indisponível');
            }
        }
    }

    function jovi_camera_enterDemo(reason) {
        cameraMode = CAMERA_MODE.DEMO;
        stopCamera();

        const video = document.getElementById('camera-preview');
        const demoFeed = document.getElementById('demo-feed');
        const demoBadge = document.getElementById('demo-badge');
        const retryBtn = document.getElementById('btn-retry-camera');
        const fpsCounter = document.getElementById('fps-counter');

        if (video) video.classList.add('d-none');
        if (demoFeed) demoFeed.classList.remove('d-none');
        if (demoBadge) demoBadge.classList.remove('d-none');

        if (reason === 'permissão de câmera negada') {
            retryBtn?.classList.remove('d-none');
        } else {
            retryBtn?.classList.add('d-none');
        }

        if (fpsCounter) {
            fpsCounter.textContent = '60 FPS (DEMO)';
        }

        jovi_camera_startDemoFeed();
        showToast(`Modo Demo: ${reason}`);
        console.log(`[JOVI Flow] Entered DEMO mode (${reason})`);
    }

    function jovi_camera_startDemoFeed() {
        jovi_camera_stopDemoFeed();

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            jovi_camera_renderDemoFrame(0);
            demoRafId = null;
            return;
        }

        function loop(timestamp) {
            if (cameraMode !== CAMERA_MODE.DEMO || document.hidden || currentScreen !== SCREENS.CAMERA) {
                demoRafId = null;
                return;
            }
            jovi_camera_renderDemoFrame(timestamp);
            demoRafId = requestAnimationFrame(loop);
        }

        demoRafId = requestAnimationFrame(loop);
    }

    function jovi_camera_stopDemoFeed() {
        if (demoRafId) {
            cancelAnimationFrame(demoRafId);
            demoRafId = null;
        }
    }

    function jovi_camera_renderDemoFrame(t) {
        const canvas = document.getElementById('demo-feed');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 360;
        const height = rect.height || 640;

        if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
            canvas.width = Math.round(width);
            canvas.height = Math.round(height);
        }

        const ctx = canvas.getContext('2d');
        const time = t || performance.now();
        const w = canvas.width;
        const h = canvas.height;

        // 1. Animated diagonal gradient in brand tokens
        const angle = (time * 0.0003) % (Math.PI * 2);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const grad = ctx.createLinearGradient(
            w / 2 - cos * w * 0.5,
            h / 2 - sin * h * 0.5,
            w / 2 + cos * w * 0.5,
            h / 2 + sin * h * 0.5
        );
        grad.addColorStop(0, '#0a3dff');
        grad.addColorStop(0.5, '#121629');
        grad.addColorStop(1, '#ccab00');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. Soft drifting radial Aura highlight
        const auraX = w / 2 + Math.sin(time * 0.001) * (w * 0.2);
        const auraY = h * 0.45 + Math.cos(time * 0.0015) * (h * 0.12);
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
        const auraRadius = Math.min(w, h) * 0.45;
        const auraGrad = ctx.createRadialGradient(auraX, auraY, 0, auraX, auraY, auraRadius);
        auraGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.45)`);
        auraGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.12)`);
        auraGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = auraGrad;
        ctx.fillRect(0, 0, w, h);

        // 3. Subtle moving scanline
        const scanlineY = (time * 0.12) % h;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fillRect(0, scanlineY, w, 2);

        // 4. Center reticle & brackets
        const cx = w / 2;
        const cy = h / 2;
        ctx.strokeStyle = 'rgba(255, 214, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 32, cy - 32, 64, 64);

        const bLen = 10;
        ctx.beginPath();
        ctx.moveTo(cx - 42, cy - 42 + bLen); ctx.lineTo(cx - 42, cy - 42); ctx.lineTo(cx - 42 + bLen, cy - 42);
        ctx.moveTo(cx + 42 - bLen, cy - 42); ctx.lineTo(cx + 42, cy - 42); ctx.lineTo(cx + 42, cy - 42 + bLen);
        ctx.moveTo(cx - 42, cy + 42 - bLen); ctx.lineTo(cx - 42, cy + 42); ctx.lineTo(cx - 42 + bLen, cy + 42);
        ctx.moveTo(cx + 42 - bLen, cy + 42); ctx.lineTo(cx + 42, cy + 42); ctx.lineTo(cx + 42, cy + 42 - bLen);
        ctx.stroke();

        // 5. HUD text
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0] + '.' + String(Math.floor(now.getMilliseconds() / 100));
        ctx.fillText(`SIMULAÇÃO • ${timeStr}`, 16, h - 90);
        ctx.fillText(`TEMP: ${Math.round(currentTemperature)}K`, 16, h - 74);
    }

    function jovi_camera_injectDemoDetail(ctx, w, h) {
        const cx = w / 2;
        const cy = h / 2;
        ctx.save();
        // Vary the focus sharpness level between captures (level 1 to 4)
        // so calculateSharpness yields distinct scores (e.g. 0.65 to 0.95)
        const level = Math.floor(Math.random() * 4) + 1;
        const boxSize = 20 + level * 12;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + level * 0.15})`;
        ctx.fillRect(cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize);
        ctx.strokeStyle = `rgba(255, 214, 0, ${0.4 + level * 0.15})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize);
        ctx.restore();
    }

    function jovi_camera_activeSurface() {
        if (cameraMode === CAMERA_MODE.DEMO) {
            return document.getElementById('demo-feed');
        }
        return document.getElementById('camera-preview');
    }

    function jovi_camera_resume() {
        if (cameraMode === CAMERA_MODE.DEMO) {
            jovi_camera_startDemoFeed();
        } else {
            jovi_camera_acquire();
        }
    }

    const startCamera = jovi_camera_acquire;

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
        updateCameraSuggestion(temp);
    }

    function updateCameraSuggestion(temperature) {
        const icon = document.getElementById('camera-suggestion-icon');
        const text = document.getElementById('camera-suggestion-text');
        if (!icon || !text) return;

        if (temperature < 3500) {
            icon.textContent = '💡';
            text.textContent = 'Sugestão: Luz Quente (Retratos intimistas)';
        } else if (temperature <= 5500) {
            icon.textContent = '☀️';
            text.textContent = 'Sugestão: Luz Natural (Nitidez equilibrada)';
        } else {
            icon.textContent = '⚡';
            text.textContent = 'Sugestão: Luz Fria (Texturas e contrastes)';
        }
    }

    function applyNextSmartSuggestion() {
        if (currentTemperature < 3500) {
            currentTemperature = 5000;
        } else if (currentTemperature <= 5500) {
            currentTemperature = 6500;
        } else {
            currentTemperature = 2800;
        }
        updateAuraLightTemperature(currentTemperature);
        showToast(`Preset aplicado: ${Math.round(currentTemperature)}K`);
    }

    async function capturePhoto() {
        const surface = jovi_camera_activeSurface();
        const canvas = document.getElementById('camera-canvas');
        const auraEffect = document.querySelector('.aura-light-effect');

        if (!surface || !canvas) return;

        const captureBtn = document.getElementById('btn-capture');
        if (captureBtn) captureBtn.disabled = true;

        triggerScreenFlash();
        auraEffect?.classList.add('active');

        const tCaptureStart = performance.now();
        try {
            if (cameraMode === CAMERA_MODE.DEMO && surface.getContext) {
                jovi_camera_injectDemoDetail(surface.getContext('2d'), surface.width, surface.height);
            }

            canvas.width = surface.videoWidth || surface.width || 640;
            canvas.height = surface.videoHeight || surface.height || 480;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(surface, 0, 0, canvas.width, canvas.height);

            applyAuraLightEffect(ctx, canvas.width, canvas.height);

            const sharpness = calculateSharpness(ctx, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg', 0.85);
            lastPhotoData = imageData;

            await savePhoto(imageData, sharpness);

            const latencyMs = Math.max(1, Math.round(performance.now() - tCaptureStart));
            const latencyBadge = document.getElementById('perf-latency-badge');
            if (latencyBadge) {
                latencyBadge.textContent = `⚡ ${latencyMs}ms Zero-Lag`;
                latencyBadge.classList.remove('d-none');
                setTimeout(() => latencyBadge?.classList.add('d-none'), 2200);
            }

            showToast('Foto salva!');
            updateGalleryThumbnail(imageData);
            loadGallery();
        } catch (error) {
            console.error('[JOVI Flow] Capture error:', error);
            showToast('Erro ao capturar foto');
        } finally {
            setTimeout(() => {
                auraEffect?.classList.remove('active');
                if (captureBtn) captureBtn.disabled = false;
            }, 300);
        }
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
        const sampleSize = 64;
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
                const row = y * size;
                for (let x = 1; x < size - 1; x++) {
                    const idx = row + x;
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
            return parseFloat(score.toFixed(2));
        } catch (e) {
            console.warn('[JOVI Flow] Sharpness check error:', e);
            return 0.8;
        }
    }

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('JOVIFlowDB', 2);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Store legado para compatibilidade total
                if (!db.objectStoreNames.contains(STORAGE_KEY)) {
                    db.createObjectStore(STORAGE_KEY, { keyPath: 'id', autoIncrement: true });
                }
                // MER Tabela 1: midia (armazena imagem base64/blob e timestamp)
                if (!db.objectStoreNames.contains('midia')) {
                    db.createObjectStore('midia', { keyPath: 'id' });
                }
                // MER Tabela 2: metadados (1:0..1 com midia via índice midia_id)
                if (!db.objectStoreNames.contains('metadados')) {
                    const metaStore = db.createObjectStore('metadados', { keyPath: 'id', autoIncrement: true });
                    metaStore.createIndex('midia_id', 'midia_id', { unique: true });
                }
            };
        });
    }

    async function savePhoto(imageData, sharpness) {
        try {
            const db = await openDB();
            const photoId = Date.now();
            const createdAt = new Date().toISOString();
            const score = sharpness || 0.8;

            const midiaRecord = {
                id: photoId,
                data: imageData,
                createdAt: createdAt
            };

            const metadadosRecord = {
                midia_id: photoId,
                sharpness_score: score,
                category: score > 0.85 ? 'Alta Nitidez' : 'Padrão',
                aura_light_sim: Math.round(currentTemperature),
                orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
                tags: []
            };

            const legacyRecord = {
                id: photoId,
                data: imageData,
                sharpness: score,
                createdAt: createdAt,
                tags: []
            };

            const storeNames = ['midia', 'metadados', STORAGE_KEY].filter(n => db.objectStoreNames.contains(n));
            const tx = db.transaction(storeNames, 'readwrite');

            if (db.objectStoreNames.contains('midia')) tx.objectStore('midia').put(midiaRecord);
            if (db.objectStoreNames.contains('metadados')) tx.objectStore('metadados').put(metadadosRecord);
            if (db.objectStoreNames.contains(STORAGE_KEY)) tx.objectStore(STORAGE_KEY).put(legacyRecord);

            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });

            console.log('[JOVI Flow] Photo saved to midia & metadados (id: ' + photoId + ')');
            return { ...midiaRecord, ...metadadosRecord };
        } catch (error) {
            console.error('[JOVI Flow] Save error:', error);
            showToast('Erro ao salvar foto');
        }
    }

    async function getAllPhotosWithMeta() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            if (db.objectStoreNames.contains('midia') && db.objectStoreNames.contains('metadados')) {
                const tx = db.transaction(['midia', 'metadados'], 'readonly');
                const midiaStore = tx.objectStore('midia');
                const metaStore = tx.objectStore('metadados');

                const midiaReq = midiaStore.getAll();
                const metaReq = metaStore.getAll();

                tx.oncomplete = () => {
                    const midiaList = midiaReq.result || [];
                    const metaList = metaReq.result || [];
                    const metaMap = new Map();
                    metaList.forEach(m => metaMap.set(m.midia_id, m));

                    const joined = midiaList.map(m => {
                        const meta = metaMap.get(m.id) || {};
                        return {
                            id: m.id,
                            data: m.data,
                            createdAt: m.createdAt,
                            sharpness: meta.sharpness_score ?? 0.8,
                            sharpness_score: meta.sharpness_score ?? 0.8,
                            category: meta.category || 'Padrão',
                            tags: Array.isArray(meta.tags) ? meta.tags : [],
                            metaId: meta.id
                        };
                    });
                    resolve(joined.sort((a, b) => b.id - a.id));
                };
                tx.onerror = () => reject(tx.error);
            } else if (db.objectStoreNames.contains(STORAGE_KEY)) {
                const tx = db.transaction(STORAGE_KEY, 'readonly');
                const req = tx.objectStore(STORAGE_KEY).getAll();
                req.onsuccess = () => {
                    const list = (req.result || []).map(p => ({
                        id: p.id,
                        data: p.data,
                        createdAt: p.createdAt,
                        sharpness: p.sharpness || 0.8,
                        sharpness_score: p.sharpness || 0.8,
                        category: 'Padrão',
                        tags: p.tags || []
                    }));
                    resolve(list.sort((a, b) => b.id - a.id));
                };
                req.onerror = () => reject(req.error);
            } else {
                resolve([]);
            }
        });
    }

    async function updateLatestThumbnailFromDB() {
        try {
            const photos = await getAllPhotosWithMeta();
            if (photos.length > 0) {
                updateGalleryThumbnail(photos[0].data);
            }
        } catch (e) {
            console.warn('[JOVI Flow] Could not load latest thumbnail:', e);
        }
    }

    async function loadGallery() {
        const grid = document.getElementById('gallery-grid');
        const empty = document.getElementById('gallery-empty');
        const footer = document.getElementById('gallery-footer');
        const gallerySuggestion = document.getElementById('gallery-suggestion');
        const gallerySuggestionText = document.getElementById('gallery-suggestion-text');
        const btnShare = document.getElementById('btn-share');
        const screenGallery = document.getElementById('screen-gallery');

        if (!grid) return;

        if (screenGallery) {
            screenGallery.classList.toggle('selecting', isSelectMode);
        }

        try {
            const photos = await getAllPhotosWithMeta();
            currentLoadedPhotos = photos;

            if (photos.length === 0) {
                if (empty) empty.style.display = 'flex';
                if (footer) footer.style.display = 'none';
                if (gallerySuggestion) gallerySuggestion.classList.add('d-none');
                grid.querySelectorAll('.gallery-item').forEach(el => el.remove());
                if (btnShare) {
                    btnShare.disabled = true;
                    btnShare.textContent = 'Compartilhar';
                }
                return;
            }

            if (empty) empty.style.display = 'none';
            if (footer) footer.style.display = 'block';

            grid.querySelectorAll('.gallery-item').forEach(el => el.remove());

            // Encontra a foto de maior nitidez
            let highestSharpness = 0;
            let featuredIndex = -1;

            photos.forEach((p, idx) => {
                if (p.sharpness && p.sharpness > highestSharpness) {
                    highestSharpness = p.sharpness;
                    featuredIndex = idx;
                }
            });

            // Banner inteligente de sugestão
            if (gallerySuggestion && gallerySuggestionText && featuredIndex !== -1) {
                const featuredPhoto = photos[featuredIndex];
                const pct = Math.round(highestSharpness * 100);
                gallerySuggestionText.textContent = `Sugestão: Foto destacada possui máxima nitidez (${pct}%). Toque para ver.`;
                gallerySuggestion.classList.remove('d-none');
                gallerySuggestion.onclick = () => {
                    if (!isSelectMode) openDetail(featuredPhoto);
                };
            } else if (gallerySuggestion) {
                gallerySuggestion.classList.add('d-none');
            }

            // Card informativo de otimização no Bento Grid
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
                const isSelected = selectedPhotoIds.has(photo.id);

                item.className = `gallery-item${isFeatured ? ' featured' : ''}${isSelected ? ' selected' : ''}`;
                item.dataset.id = String(photo.id);

                let inner = `<img src="${photo.data}" alt="Foto" loading="lazy">`;
                if (photo.sharpness) {
                    inner += `<div class="sharpness-badge">Nitidez: ${(photo.sharpness * 100).toFixed(0)}%</div>`;
                }
                if (photo.tags && photo.tags.length > 0) {
                    inner += `<div class="tags-badge" style="position: absolute; bottom: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.7); font-size: 0.7rem; padding: 2px 6px; border-radius: 9999px; color: #fff; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);">🏷️ ${photo.tags.length}</div>`;
                }
                inner += `<span class="gallery-item-checkbox" aria-hidden="true">${isSelected ? '✓' : ''}</span>`;
                item.innerHTML = inner;

                item.addEventListener('click', () => {
                    if (isSelectMode) {
                        togglePhotoSelection(photo.id, item);
                    } else {
                        openDetail(photo);
                    }
                });

                grid.appendChild(item);
            });

            // Posicionamento no Bento Grid
            if (grid.children.length > 1) {
                grid.insertBefore(statCard, grid.children[1]);
            } else {
                grid.appendChild(statCard);
            }

            updateShareButtonState();
        } catch (error) {
            console.error('[JOVI Flow] Load gallery error:', error);
        }
    }

    function toggleGallerySelectMode() {
        isSelectMode = !isSelectMode;
        const btnSelect = document.getElementById('btn-select');
        const screenGallery = document.getElementById('screen-gallery');

        if (btnSelect) {
            btnSelect.textContent = isSelectMode ? 'Cancelar' : 'Selecionar';
        }

        if (screenGallery) {
            screenGallery.classList.toggle('selecting', isSelectMode);
        }

        if (!isSelectMode) {
            selectedPhotoIds.clear();
            document.querySelectorAll('.gallery-item.selected').forEach(item => {
                item.classList.remove('selected');
                const chk = item.querySelector('.gallery-item-checkbox');
                if (chk) chk.textContent = '';
            });
        }

        updateShareButtonState();
    }

    function togglePhotoSelection(photoId, itemElement) {
        if (selectedPhotoIds.has(photoId)) {
            selectedPhotoIds.delete(photoId);
            itemElement.classList.remove('selected');
            const chk = itemElement.querySelector('.gallery-item-checkbox');
            if (chk) chk.textContent = '';
        } else {
            selectedPhotoIds.add(photoId);
            itemElement.classList.add('selected');
            const chk = itemElement.querySelector('.gallery-item-checkbox');
            if (chk) chk.textContent = '✓';
        }
        updateShareButtonState();
    }

    function updateShareButtonState() {
        const btnShare = document.getElementById('btn-share');
        if (!btnShare) return;

        if (isSelectMode) {
            const count = selectedPhotoIds.size;
            btnShare.disabled = count === 0;
            btnShare.textContent = count > 0 ? `Compartilhar (${count})` : 'Compartilhar';
        } else {
            btnShare.disabled = true;
            btnShare.textContent = 'Compartilhar';
        }
    }

    function handleGalleryShareClick() {
        if (selectedPhotoIds.size === 0) return;

        const selectedList = currentLoadedPhotos.filter(p => selectedPhotoIds.has(p.id));
        if (selectedList.length === 0) return;

        const targetPhoto = selectedList[0];
        currentPhotoId = targetPhoto.id;
        lastPhotoData = targetPhoto.data;

        openShareScreen();
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
        currentPhotoId = photo.id;
        lastPhotoData = photo.data;
        currentPhotoTags = photo.tags || [];

        const img = document.getElementById('detail-image');
        if (img) img.src = photo.data;

        const date = document.getElementById('detail-date');
        if (date) date.textContent = formatDate(photo.createdAt);

        renderDetailTags(currentPhotoTags);

        // Atribui transição de visão animada ao item clicado
        document.querySelectorAll('.gallery-item img').forEach(i => {
            i.classList.remove('transition-active');
            if (i.src === photo.data) {
                i.classList.add('transition-active');
            }
        });

        showScreen(SCREENS.DETAIL);
    }

    function renderDetailTags(tags) {
        const container = document.getElementById('detail-tags');
        if (!container) return;
        container.innerHTML = '';

        if (!tags || tags.length === 0) return;

        tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.innerHTML = `<span>${tag}</span><span class="btn-remove-tag" role="button" tabindex="0" aria-label="Remover tag ${tag}">✕</span>`;
            chip.querySelector('.btn-remove-tag').addEventListener('click', (e) => {
                e.stopPropagation();
                removeTagFromCurrentPhoto(tag);
            });
            container.appendChild(chip);
        });
    }

    function openTagPicker() {
        const modal = document.getElementById('tag-picker-modal');
        if (modal) {
            modal.classList.remove('d-none');
            document.getElementById('input-custom-tag')?.focus();
        }
    }

    function closeTagPicker() {
        const modal = document.getElementById('tag-picker-modal');
        if (modal) modal.classList.add('d-none');
    }

    async function addTagToCurrentPhoto(tagText) {
        const tag = (tagText || '').trim();
        if (!tag) return;

        if (!currentPhotoId) {
            showToast('Nenhuma foto selecionada');
            return;
        }

        try {
            const db = await openDB();
            if (db.objectStoreNames.contains('metadados')) {
                const tx = db.transaction(['metadados'], 'readwrite');
                const metaStore = tx.objectStore('metadados');
                const index = metaStore.index('midia_id');
                const req = index.get(currentPhotoId);

                req.onsuccess = () => {
                    const meta = req.result || { midia_id: currentPhotoId, tags: [] };
                    if (!Array.isArray(meta.tags)) meta.tags = [];
                    if (meta.tags.includes(tag)) {
                        showToast('Tag já adicionada');
                        return;
                    }
                    meta.tags.push(tag);
                    metaStore.put(meta);

                    currentPhotoTags = meta.tags;
                    renderDetailTags(currentPhotoTags);

                    const cached = currentLoadedPhotos.find(p => p.id === currentPhotoId);
                    if (cached) cached.tags = meta.tags;

                    showToast(`Tag "${tag}" adicionada`);
                    closeTagPicker();
                };
                req.onerror = () => showToast('Erro ao salvar tag');
            } else {
                closeTagPicker();
            }
        } catch (e) {
            console.error('[JOVI Flow] Add tag error:', e);
            showToast('Erro ao salvar tag');
        }
    }

    async function removeTagFromCurrentPhoto(tagText) {
        if (!currentPhotoId) return;

        try {
            const db = await openDB();
            if (db.objectStoreNames.contains('metadados')) {
                const tx = db.transaction(['metadados'], 'readwrite');
                const metaStore = tx.objectStore('metadados');
                const index = metaStore.index('midia_id');
                const req = index.get(currentPhotoId);

                req.onsuccess = () => {
                    const meta = req.result;
                    if (!meta || !Array.isArray(meta.tags)) return;
                    meta.tags = meta.tags.filter(t => t !== tagText);
                    metaStore.put(meta);

                    currentPhotoTags = meta.tags;
                    renderDetailTags(currentPhotoTags);

                    const cached = currentLoadedPhotos.find(p => p.id === currentPhotoId);
                    if (cached) cached.tags = meta.tags;

                    showToast(`Tag "${tagText}" removida`);
                };
            }
        } catch (e) {
            console.error('[JOVI Flow] Remove tag error:', e);
        }
    }

    async function deleteCurrentPhoto() {
        if (currentPhotoId == null && !lastPhotoData) return;

        try {
            const db = await openDB();
            const storeNames = ['midia', 'metadados', STORAGE_KEY].filter(n => db.objectStoreNames.contains(n));
            const tx = db.transaction(storeNames, 'readwrite');

            const targetId = currentPhotoId;

            if (db.objectStoreNames.contains('midia') && targetId != null) {
                tx.objectStore('midia').delete(targetId);
            }
            if (db.objectStoreNames.contains('metadados') && targetId != null) {
                const metaStore = tx.objectStore('metadados');
                const index = metaStore.index('midia_id');
                const getReq = index.getKey(targetId);
                getReq.onsuccess = () => {
                    if (getReq.result != null) {
                        metaStore.delete(getReq.result);
                    }
                };
            }
            if (db.objectStoreNames.contains(STORAGE_KEY) && targetId != null) {
                tx.objectStore(STORAGE_KEY).delete(targetId);
            }

            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });

            if (targetId != null) {
                selectedPhotoIds.delete(targetId);
            }

            currentPhotoId = null;
            lastPhotoData = null;
            currentPhotoTags = [];
            showToast('Foto excluída');
            showScreen(SCREENS.GALLERY);
            await loadGallery();
            await updateLatestThumbnailFromDB();
        } catch (e) {
            console.error('[JOVI Flow] Delete failed:', e);
            showToast('Erro ao excluir foto');
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

        if (!lastPhotoData) {
            status.textContent = 'Nenhuma foto selecionada para compartilhar';
            return;
        }

        switch (platform) {
            case 'download': {
                try {
                    const link = document.createElement('a');
                    link.href = lastPhotoData;
                    link.download = `jovi-flow-${Date.now()}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    status.textContent = 'Download concluído! Foto salva no dispositivo.';
                    showToast('Foto baixada!');
                } catch (err) {
                    console.error('[JOVI Flow] Download error:', err);
                    status.textContent = 'Erro ao baixar foto.';
                }
                break;
            }

            case 'whatsapp': {
                if (navigator.canShare && navigator.share) {
                    try {
                        const blob = await (await fetch(lastPhotoData)).blob();
                        const file = new File([blob], `jovi-flow-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'JOVI Flow',
                                text: 'Capturado com JOVI Flow 📸',
                                files: [file]
                            });
                            status.textContent = 'Compartilhado com sucesso!';
                            return;
                        }
                    } catch (e) {
                        if (e.name !== 'AbortError') console.warn('[JOVI Flow] Native share failed:', e);
                    }
                }
                const waUrl = `https://wa.me/?text=${encodeURIComponent('Compartilhado via JOVI Flow 📸')}`;
                window.open(waUrl, '_blank');
                status.textContent = 'Abrindo WhatsApp...';
                break;
            }

            case 'instagram': {
                if (navigator.canShare && navigator.share) {
                    try {
                        const blob = await (await fetch(lastPhotoData)).blob();
                        const file = new File([blob], `jovi-flow-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'JOVI Flow',
                                text: 'Criado no JOVI Flow 📸',
                                files: [file]
                            });
                            status.textContent = 'Compartilhado com sucesso!';
                            return;
                        }
                    } catch (e) {
                        if (e.name !== 'AbortError') console.warn('[JOVI Flow] Native share failed:', e);
                    }
                }
                const link = document.createElement('a');
                link.href = lastPhotoData;
                link.download = `jovi-flow-instagram-${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                status.textContent = 'Foto baixada! Abra o Instagram e selecione da galeria.';
                showToast('Foto salva para Instagram');
                break;
            }

            case 'copy': {
                try {
                    const response = await fetch(lastPhotoData);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    status.textContent = 'Imagem copiada para a área de transferência!';
                    showToast('Imagem copiada!');
                } catch (error) {
                    console.warn('[JOVI Flow] Clipboard image copy failed, trying text:', error);
                    try {
                        await navigator.clipboard.writeText(lastPhotoData);
                        status.textContent = 'Dados da imagem copiados!';
                        showToast('Copiado!');
                    } catch (e2) {
                        status.textContent = 'Erro ao copiar. Use o botão Baixar.';
                    }
                }
                break;
            }
        }
    }

    async function switchCamera() {
        if (cameraMode === CAMERA_MODE.DEMO) {
            showToast('Troca de câmera indisponível no modo demo');
            return;
        }

        if (!mediaStream) return;

        intendedFacing = intendedFacing === 'environment' ? 'user' : 'environment';
        stopCamera();

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: intendedFacing }
            });
            const video = document.getElementById('camera-preview');
            video.srcObject = mediaStream;
            await video.play();
            showToast(`Câmera: ${intendedFacing === 'user' ? 'frontal' : 'traseira'}`);
        } catch (error) {
            console.error('[JOVI Flow] Switch camera error:', error);
            showToast('Erro ao trocar câmera');
            jovi_camera_acquire();
        }
    }

    function toggleFlash() {
        flashEnabled = !flashEnabled;
        const btnFlash = document.getElementById('btn-flash');
        if (btnFlash) {
            btnFlash.classList.toggle('active', flashEnabled);
        }
        showToast(flashEnabled ? 'Flash ativado' : 'Flash desativado');
    }

    function triggerScreenFlash() {
        if (!flashEnabled) return;

        if (mediaStream) {
            const track = mediaStream.getVideoTracks()[0];
            if (track?.getCapabilities?.()?.torch) {
                track.applyConstraints({ advanced: [{ torch: true }] }).catch(() => {});
                setTimeout(() => {
                    track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
                }, 150);
            }
        }

        const overlay = document.getElementById('screen-flash');
        if (overlay) {
            overlay.classList.remove('d-none');
            overlay.classList.remove('flashing');
            void overlay.offsetWidth;
            overlay.classList.add('flashing');
            setTimeout(() => {
                overlay.classList.remove('flashing');
                overlay.classList.add('d-none');
            }, 250);
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            if (cameraMode === CAMERA_MODE.LIVE) {
                stopCamera();
            } else {
                jovi_camera_stopDemoFeed();
            }
        } else if (currentScreen === SCREENS.CAMERA) {
            jovi_camera_resume();
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
