// Shared helpers for Raptor Chase and Raptor Destroy:
// fixed-timestep loop, synthesized sound effects, screen shake, floating text,
// toasts, settings, leaderboards, achievements and touch controls.
(function () {
    'use strict';

    // ---------- Storage ----------
    function load(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    }

    function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function formatTime(frames) {
        const total = Math.floor(frames / 60);
        return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
    }

    // ---------- Settings ----------
    const settings = Object.assign({ sound: true, shake: true }, load('raptorSettings', {}));
    const settingListeners = [];

    function setSetting(name, value) {
        settings[name] = value;
        save('raptorSettings', settings);
        applyVolume();
        settingListeners.forEach(fn => fn());
    }

    // Wires every element with data-setting="sound|shake" into a toggle button.
    function bindSettingButtons() {
        const labels = { sound: ['🔊 Sound: On', '🔇 Sound: Off'], shake: ['📳 Screen shake: On', '📴 Screen shake: Off'] };
        const refresh = () => {
            document.querySelectorAll('[data-setting]').forEach(btn => {
                const name = btn.dataset.setting;
                btn.textContent = labels[name][settings[name] ? 0 : 1];
                btn.classList.toggle('off', !settings[name]);
            });
        };
        document.querySelectorAll('[data-setting]').forEach(btn => {
            btn.addEventListener('click', () => {
                unlockAudio();
                setSetting(btn.dataset.setting, !settings[btn.dataset.setting]);
                play('click');
            });
        });
        settingListeners.push(refresh);
        refresh();
    }

    // ---------- Audio (synthesized, no files needed) ----------
    let actx = null;
    let master = null;
    let noiseBuffer = null;
    const lastPlayed = {};

    function applyVolume() {
        if (master) master.gain.value = settings.sound ? 0.3 : 0;
    }

    // Browsers only allow audio after a user gesture, so call this from click/key handlers.
    function unlockAudio() {
        if (!actx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            actx = new AudioCtx();
            master = actx.createGain();
            master.connect(actx.destination);
            applyVolume();
            noiseBuffer = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        }
        if (actx.state === 'suspended') actx.resume();
    }

    function envelope(gain, t, vol, dur) {
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }

    function tone(type, f0, f1, dur, vol, delay = 0) {
        const t = actx.currentTime + delay;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
        envelope(gain, t, vol, dur);
        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    }

    function noise(dur, vol, cutoff, cutoffEnd = cutoff, delay = 0) {
        const t = actx.currentTime + delay;
        const src = actx.createBufferSource();
        const filter = actx.createBiquadFilter();
        const gain = actx.createGain();
        src.buffer = noiseBuffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff, t);
        if (cutoffEnd !== cutoff) filter.frequency.exponentialRampToValueAtTime(cutoffEnd, t + dur);
        envelope(gain, t, vol, dur);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        src.start(t);
        src.stop(t + dur + 0.02);
    }

    const sounds = {
        shoot: () => tone('square', 900, 500, 0.05, 0.025),
        hit: () => tone('square', 260, 120, 0.05, 0.05),
        kill: () => { noise(0.14, 0.12, 2500, 300); tone('sawtooth', 320, 70, 0.14, 0.06); },
        explode: () => { noise(0.7, 0.4, 1400, 60); tone('sine', 110, 28, 0.6, 0.35); },
        pickup: () => { tone('square', 660, 660, 0.06, 0.06); tone('square', 990, 990, 0.09, 0.06, 0.06); },
        weapon: () => [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.12, 0.09, i * 0.05)),
        levelup: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, 0.14, 0.05, i * 0.07)),
        hurt: () => { tone('sawtooth', 220, 60, 0.25, 0.14); noise(0.15, 0.14, 900); },
        dash: () => noise(0.18, 0.1, 3500, 400),
        death: () => { tone('sawtooth', 420, 35, 1.1, 0.16); noise(0.9, 0.25, 1600, 50); },
        warning: () => [0, 0.32, 0.64].forEach(d => tone('square', 440, 300, 0.22, 0.07, d)),
        achievement: () => [784, 988, 1175, 1568].forEach((f, i) => tone('triangle', f, f, 0.18, 0.08, i * 0.07)),
        heartbeat: () => { tone('sine', 75, 45, 0.12, 0.3); tone('sine', 70, 40, 0.12, 0.22, 0.17); },
        spawn: () => tone('triangle', 180, 260, 0.12, 0.04),
        whistle: () => tone('sine', 1400, 380, 1.5, 0.05),
        growl: () => { tone('sawtooth', 150, 85, 0.22, 0.07); noise(0.18, 0.05, 700); },
        spit: () => tone('triangle', 500, 900, 0.08, 0.04),
        sizzle: () => noise(0.12, 0.04, 5000, 2000),
        click: () => tone('square', 620, 620, 0.03, 0.04)
    };

    // Minimum milliseconds between repeats so rapid-fire sounds don't stack into noise.
    const throttle = { shoot: 70, hit: 45, kill: 35, spawn: 120, sizzle: 160, pickup: 60, growl: 150, spit: 90 };

    function play(name) {
        if (!settings.sound || !actx || actx.state !== 'running' || !sounds[name]) return;
        const now = performance.now();
        const gap = throttle[name] || 0;
        if (gap && now - (lastPlayed[name] || 0) < gap) return;
        lastPlayed[name] = now;
        try { sounds[name](); } catch (e) { /* ignore audio glitches */ }
    }

    // ---------- Screen shake (trauma-based: shakes hard, settles fast) ----------
    const shake = {
        trauma: 0,
        x: 0,
        y: 0,
        add(amount) { this.trauma = Math.min(1, this.trauma + amount); },
        update() {
            this.trauma = Math.max(0, this.trauma - 0.03);
            const magnitude = settings.shake ? this.trauma * this.trauma * 20 : 0;
            this.x = (Math.random() * 2 - 1) * magnitude;
            this.y = (Math.random() * 2 - 1) * magnitude;
        },
        reset() { this.trauma = 0; this.x = 0; this.y = 0; }
    };

    // ---------- Floating text ----------
    function createFloaters() {
        let list = [];
        return {
            add(x, y, text, color = '#ffffff', size = 18, life = 50) {
                list.push({ x, y, text, color, size, life, maxLife: life });
            },
            update() {
                list = list.filter(f => {
                    f.y -= 0.8;
                    f.life--;
                    return f.life > 0;
                });
            },
            draw(ctx) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.lineJoin = 'round';
                list.forEach(f => {
                    const t = f.life / f.maxLife;
                    const pop = t > 0.85 ? 1 + (t - 0.85) * 3 : 1;
                    ctx.globalAlpha = Math.min(1, t * 2);
                    ctx.font = `bold ${Math.round(f.size * pop)}px 'Segoe UI', Arial, sans-serif`;
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
                    ctx.strokeText(f.text, f.x, f.y);
                    ctx.fillStyle = f.color;
                    ctx.fillText(f.text, f.x, f.y);
                });
                ctx.restore();
            },
            clear() { list = []; }
        };
    }

    // ---------- Toasts ----------
    let toastRoot = null;

    function toast(title, body, icon = '🏆') {
        if (!toastRoot) {
            toastRoot = document.createElement('div');
            toastRoot.className = 'rc-toasts';
            document.body.appendChild(toastRoot);
        }
        const el = document.createElement('div');
        el.className = 'rc-toast';
        el.innerHTML = `<span class="rc-toast-icon">${icon}</span><div><b>${escapeHtml(title)}</b><span>${escapeHtml(body)}</span></div>`;
        toastRoot.appendChild(el);
        while (toastRoot.children.length > 3) toastRoot.firstChild.remove();
        setTimeout(() => el.classList.add('leaving'), 3200);
        setTimeout(() => el.remove(), 3700);
    }

    // ---------- Leaderboard ----------
    function createLeaderboard(key, limit = 10) {
        return {
            list() {
                const entries = load(key, []);
                return Array.isArray(entries) ? entries.filter(e => e && typeof e.score === 'number') : [];
            },
            best() {
                const entries = this.list();
                return entries.length ? entries[0].score : 0;
            },
            // Returns the saved entry's id and its 0-based rank, or rank -1 if it missed the top list.
            add(entry) {
                entry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
                const entries = this.list();
                entries.push(entry);
                entries.sort((a, b) => b.score - a.score);
                const top = entries.slice(0, limit);
                save(key, top);
                return { id: entry.id, rank: top.findIndex(e => e.id === entry.id) };
            },
            rename(id, name) {
                const entries = this.list();
                const entry = entries.find(e => e.id === id);
                if (entry) {
                    entry.name = name;
                    save(key, entries);
                }
            }
        };
    }

    // ---------- Achievements ----------
    function createAchievements(key, defs) {
        const unlocked = load(key, {});
        return {
            defs,
            has: id => !!unlocked[id],
            count: () => defs.filter(d => unlocked[d.id]).length,
            unlock(id) {
                const def = defs.find(d => d.id === id);
                if (!def || unlocked[id]) return false;
                unlocked[id] = Date.now();
                save(key, unlocked);
                toast('Achievement unlocked', def.name, def.icon);
                play('achievement');
                return true;
            },
            render(el) {
                el.innerHTML = defs.map(d => `
                    <div class="rc-ach ${unlocked[d.id] ? 'got' : ''}" title="${escapeHtml(d.desc)}">
                        <span class="rc-ach-icon">${unlocked[d.id] ? d.icon : '🔒'}</span>
                        <div><b>${escapeHtml(d.name)}</b><small>${escapeHtml(d.desc)}</small></div>
                    </div>`).join('');
            }
        };
    }

    // ---------- Fixed-timestep loop ----------
    // Game logic always runs at 60 steps per second, so the game plays at the same
    // speed on 60Hz, 120Hz and 144Hz displays.
    function createLoop(step, render) {
        const STEP_MS = 1000 / 60;
        let acc = 0;
        let last = 0;
        function frame(t) {
            if (!last) last = t;
            acc += Math.min(t - last, 250);
            last = t;
            let steps = 0;
            while (acc >= STEP_MS && steps < 5) {
                step();
                acc -= STEP_MS;
                steps++;
            }
            if (steps === 5) acc = 0;
            render();
            requestAnimationFrame(frame);
        }
        return { start: () => requestAnimationFrame(frame) };
    }

    // ---------- Sprites ----------
    // A solid-colour copy of a sprite, used for hit flashes and freeze tints.
    function silhouette(img, color) {
        const c = document.createElement('canvas');
        c.ready = false;
        const make = () => {
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const x = c.getContext('2d');
            x.drawImage(img, 0, 0);
            x.globalCompositeOperation = 'source-in';
            x.fillStyle = color;
            x.fillRect(0, 0, c.width, c.height);
            c.ready = true;
        };
        if (img.complete && img.naturalWidth) make();
        else img.addEventListener('load', make);
        return c;
    }

    function drawCover(ctx, img, w, h, zoom = 1) {
        const ratio = img.naturalWidth / img.naturalHeight;
        let dw = w * zoom;
        let dh = dw / ratio;
        if (dh < h * zoom) {
            dh = h * zoom;
            dw = dh * ratio;
        }
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }

    // ---------- Touch controls ----------
    // Multi-touch aware: tracks its own finger so dash/sprint buttons work at the same time.
    function createJoystick(base, knob) {
        const stick = { x: 0, y: 0, active: false };
        let touchId = null;
        const move = touch => {
            const rect = base.getBoundingClientRect();
            const radius = rect.width / 2;
            let dx = touch.clientX - (rect.left + radius);
            let dy = touch.clientY - (rect.top + radius);
            const dist = Math.hypot(dx, dy);
            const max = radius * 0.6;
            if (dist > max) {
                dx = dx / dist * max;
                dy = dy / dist * max;
            }
            knob.style.transform = `translate(${dx}px, ${dy}px)`;
            const strength = Math.min(1, dist / max);
            stick.x = dist ? (dx / Math.min(dist, max)) * strength : 0;
            stick.y = dist ? (dy / Math.min(dist, max)) * strength : 0;
        };
        const end = () => {
            touchId = null;
            stick.active = false;
            stick.x = 0;
            stick.y = 0;
            knob.style.transform = '';
        };
        base.addEventListener('touchstart', e => {
            e.preventDefault();
            unlockAudio();
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            stick.active = true;
            move(touch);
        }, { passive: false });
        base.addEventListener('touchmove', e => {
            e.preventDefault();
            for (const touch of e.changedTouches) if (touch.identifier === touchId) move(touch);
        }, { passive: false });
        base.addEventListener('touchend', e => {
            for (const touch of e.changedTouches) if (touch.identifier === touchId) end();
        });
        base.addEventListener('touchcancel', end);
        return stick;
    }

    function bindHold(el, onDown, onUp = () => {}) {
        el.addEventListener('touchstart', e => { e.preventDefault(); unlockAudio(); el.classList.add('held'); onDown(); }, { passive: false });
        const up = e => { e.preventDefault(); el.classList.remove('held'); onUp(); };
        el.addEventListener('touchend', up, { passive: false });
        el.addEventListener('touchcancel', up, { passive: false });
    }

    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    window.RC = {
        load, save, escapeHtml, formatTime,
        settings, setSetting, bindSettingButtons,
        unlockAudio, play,
        shake, createFloaters, toast,
        createLeaderboard, createAchievements,
        createLoop, silhouette, drawCover,
        createJoystick, bindHold, isTouchDevice
    };
})();
