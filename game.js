// --- 初始化 Firebase ---
const firebaseConfig = { 
    databaseURL: "https://rps-webgame-default-rtdb.asia-southeast1.firebasedatabase.app" 
};
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.database() : null;

// --- HTML 安全跳脫輔助函式 (防止名稱 XSS 與破版) ---
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

// --- 遊戲狀態 ---
let gameState = {
    gameMode: "pvn",
    playerName: "無名英雄",
    opponentName: "電腦",
    targetWins: 5,
    customConfig: { hasChar: true, hasEquip: true, isStrong: true },
    tempSelectedCharId: null,
    tempSelectedPrefixIndex: null,
    tempSelectedEquipId: null,
    
    playerChar: null, playerEq: null, pScore: 0,
    compChar: null, compEq: null, cScore: 0,
    
    roundNum: 1,
    lastProcessedRound: 0,
    isCalculatingRound: false,
    history: [],
    roomCode: null,
    isHost: false,
    
    isGameOver: false,
    isBusy: false
};

// --- 精準計時器管理系統 ---
let activeTimeouts = new Set();
let activeIntervals = new Set();

function registerTimeout(fn, delay) {
    const id = setTimeout(() => {
        activeTimeouts.delete(id);
        fn();
    }, delay);
    activeTimeouts.add(id);
    return id;
}

function registerInterval(fn, delay) {
    const id = setInterval(fn, delay);
    activeIntervals.add(id);
    return id;
}

function clearAllTimers() {
    activeTimeouts.forEach(id => clearTimeout(id));
    activeIntervals.forEach(id => clearInterval(id));
    activeTimeouts.clear();
    activeIntervals.clear();
}

const choiceSvgKeys = {
    "剪刀": "scissors",
    "石頭": "rock",
    "布": "paper"
};
const counterWin = { "剪刀": "石頭", "石頭": "布", "布": "剪刀" };

// --- 音效系統 (Web Audio 合成器為主，支援選配外部音訊且零 404 報錯) ---
const USE_EXTERNAL_AUDIO = true;
const sounds = USE_EXTERNAL_AUDIO ? {
    click: new Audio('assets/click.mp3'),
    win: new Audio('assets/win.mp3'),
    lose: new Audio('assets/lose.mp3'),
    attack: new Audio('assets/attack.mp3'),
    shield: new Audio('assets/shield.mp3'),
    magic: new Audio('assets/magic.mp3'),
    countdown: new Audio('assets/countdown.mp3'),
    start: new Audio('assets/start.mp3')
} : {};

let audioCtx = null;
function playSynthFallback(type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        const createTone = (oscType, startFreq, endFreq, startTime, duration, peakGain) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = oscType;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(startFreq, startTime);
            if (endFreq && endFreq !== startFreq) {
                osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
            }
            gain.gain.setValueAtTime(peakGain, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
            };
            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        if (type === 'click') {
            createTone('sine', 680, 980, now, 0.06, 0.12);
        } else if (type === 'countdown') {
            createTone('triangle', 440, 440, now, 0.15, 0.18);
        } else if (type === 'start') {
            createTone('sawtooth', 523.25, 1046.5, now, 0.35, 0.22);
        } else if (type === 'attack') {
            createTone('sawtooth', 280, 55, now, 0.22, 0.28);
        } else if (type === 'shield') {
            createTone('square', 520, 880, now, 0.18, 0.18);
        } else if (type === 'magic') {
            createTone('sine', 400, 1200, now, 0.3, 0.2);
        } else if (type === 'win') {
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                createTone('triangle', freq, freq, now + idx * 0.09, 0.25, 0.16);
            });
        } else if (type === 'lose') {
            [392, 349.23, 311.13, 261.63].forEach((freq, idx) => {
                createTone('sawtooth', freq, freq, now + idx * 0.12, 0.28, 0.15);
            });
        }
    } catch (e) {}
}

function playSound(type) {
    if (USE_EXTERNAL_AUDIO && sounds[type]) {
        try {
            if (sounds[type].readyState >= 2) {
                sounds[type].currentTime = 0;
            }
            sounds[type].play().catch(() => playSynthFallback(type));
        } catch (e) {
            playSynthFallback(type);
        }
    } else {
        playSynthFallback(type);
    }
}

// --- 內嵌 SVG 標籤建構 ---
function buildInlineIconHtml(iconKey) {
    if (!iconKey) return '';
    return `<span class="inline-tag-svg"><svg><use href="#icon-${iconKey}"></use></svg></span>`;
}
function buildCharNameWithIcon(charObj) {
    if (!charObj) return '';
    return `<span>${escapeHtml(charObj.name)}</span><span class="inline-tag-group">${buildInlineIconHtml(charObj.iconKey)}</span>`;
}
function buildEquipNameWithIcon(eqObj) {
    if (!eqObj) return '<span>無裝備</span>';
    return `<span>${escapeHtml(eqObj.name)}</span><span class="inline-tag-group">${buildInlineIconHtml(eqObj.prefixIconKey)}${buildInlineIconHtml(eqObj.iconKey)}</span>`;
}
function setHeaderTitle(elId, iconKey, text) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = `<span class="svg-icon header-svg"><svg><use href="#icon-${iconKey}"></use></svg></span> <span>${escapeHtml(text)}</span>`;
}

function initStaticIcons() {
    buildSvgSprite();
    const charListEl = document.getElementById('char-list');
    if (charListEl) {
        charListEl.addEventListener('click', e => {
            const card = e.target.closest('.card[data-char-id]');
            if (!card) return;
            playSound('click');
            gameState.tempSelectedCharId = card.getAttribute('data-char-id');
            charListEl.querySelectorAll('.card.selected').forEach(x => x.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('btn-next-char').disabled = false;
        });
    }

    const prefixListEl = document.getElementById('equip-prefix-list');
    if (prefixListEl) {
        prefixListEl.addEventListener('click', e => {
            const card = e.target.closest('.card[data-prefix-idx]');
            if (!card) return;
            playSound('click');
            gameState.tempSelectedPrefixIndex = parseInt(card.getAttribute('data-prefix-idx'), 10);
            prefixListEl.querySelectorAll('.card.selected').forEach(x => x.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('btn-next-prefix').disabled = false;
        });
    }

    const detailListEl = document.getElementById('equip-detail-list');
    if (detailListEl) {
        detailListEl.addEventListener('click', e => {
            const card = e.target.closest('.card[data-equip-id]');
            if (!card) return;
            playSound('click');
            gameState.tempSelectedEquipId = parseInt(card.getAttribute('data-equip-id'), 10);
            detailListEl.querySelectorAll('.card.selected').forEach(x => x.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('btn-next-equip').disabled = false;
        });
    }
}

// ============================================================================
// Canvas 粒子引擎 (支援 rAF 自動喚醒、高 DPI 與時間減速 Dilation 特效)
// ============================================================================
const ParticleEngine = (() => {
    let canvas, ctx, w, h;
    let ambientParticles = [];
    let burstParticles = [];
    let shockwaves = [];
    let isRunning = false;
    let speedMultiplier = 1.0;
    let speedTimer = null;

    function resize() {
        if (!canvas) return;
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        ambientParticles.forEach(p => {
            if (p.x > w) p.x = Math.random() * w;
            if (p.y > h) p.y = Math.random() * h;
        });
    }

    function init() {
        canvas = document.getElementById('bg-particles');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        ambientParticles = Array.from({ length: 45 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 2 + 0.8,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -Math.random() * 0.55 - 0.15,
            alpha: Math.random() * 0.55 + 0.15,
            color: Math.random() > 0.25 ? '#00D4FF' : '#d542ff'
        }));
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        requestAnimationFrame(loop);
    }

    function stop() {
        isRunning = false;
        if (ctx && canvas) {
            ctx.clearRect(0, 0, w, h);
        }
    }

    function applyTimeDilation(factor = 0.2, duration = 150) {
        speedMultiplier = factor;
        if (speedTimer) clearTimeout(speedTimer);
        speedTimer = setTimeout(() => {
            speedMultiplier = 1.0;
        }, duration);
    }

    function spawnBurst(x, y, color = '#00D4FF', count = 42) {
        if (!canvas) return;
        if (!isRunning) start();
        shockwaves.push({ x, y, r: 8, maxR: 175, alpha: 0.9, color });
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8.5 + 2.2;
            burstParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: Math.random() * 3.5 + 1.5,
                alpha: 1,
                decay: Math.random() * 0.022 + 0.015,
                color
            });
        }
    }

    function spawnElementBurst(elId, color, count = 42) {
        const el = document.getElementById(elId);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, color, count);
    }

    function loop() {
        if (!isRunning) return;
        if (!document.hidden && ctx) {
            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < ambientParticles.length; i++) {
                const p = ambientParticles[i];
                p.x += p.vx * speedMultiplier;
                p.y += p.vy * speedMultiplier;
                if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i];
                sw.r += (sw.maxR - sw.r) * 0.14 * speedMultiplier;
                sw.alpha -= 0.032 * speedMultiplier;
                if (sw.alpha <= 0) {
                    shockwaves.splice(i, 1);
                    continue;
                }
                ctx.save();
                ctx.globalAlpha = sw.alpha;
                ctx.strokeStyle = sw.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            for (let i = burstParticles.length - 1; i >= 0; i--) {
                const b = burstParticles[i];
                b.x += b.vx * speedMultiplier;
                b.y += b.vy * speedMultiplier;
                b.vx *= 0.95;
                b.vy *= 0.95;
                b.vy += 0.12 * speedMultiplier;
                b.alpha -= b.decay * speedMultiplier;
                if (b.alpha <= 0) {
                    burstParticles.splice(i, 1);
                    continue;
                }
                ctx.globalAlpha = b.alpha;
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        requestAnimationFrame(loop);
    }

    return { init, start, stop, applyTimeDilation, spawnBurst, spawnElementBurst };
})();

document.addEventListener('DOMContentLoaded', () => {
    initStaticIcons();
    ParticleEngine.init();
});

function toggleButtons(enable) {
    document.querySelectorAll('.btn-action').forEach(btn => btn.disabled = !enable);
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');

    // 在倒數、戰鬥與結算畫面上維持粒子引擎運作
    if (id === 'screen-battle' || id === 'screen-countdown' || id === 'screen-result') {
        ParticleEngine.start();
    } else {
        ParticleEngine.stop();
    }
}

function logMsg(msg, color = "#aaa") {
    const logBox = document.getElementById('battle-log');
    if (!logBox) return;
    const p = document.createElement('div');
    p.innerHTML = msg;
    p.style.color = color;
    logBox.appendChild(p);
    while (logBox.children.length > 80) {
        logBox.removeChild(logBox.firstChild);
    }
    requestAnimationFrame(() => {
        logBox.scrollTop = logBox.scrollHeight;
    });
}

function showFloatingText(wrapperId, text, color, delay = 0) {
    registerTimeout(() => {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;
        const floatEl = document.createElement('div');
        floatEl.className = 'floating-text';
        floatEl.style.color = color;
        floatEl.style.textShadow = `0 0 12px ${color}, 0 0 24px #000`;
        floatEl.innerText = text;
        wrapper.appendChild(floatEl);
        registerTimeout(() => floatEl.remove(), 1200);
    }, delay);
}

// 支援傳入單一或多個特效 class，避免連續呼叫互相覆蓋
const ALL_SCREEN_EFFECTS = [
    'bg-flash-red', 'bg-flash-cyan', 'bg-flash-gold', 'bg-flash-purple',
    'shake-screen', 'crit-shake-gold'
];

function triggerScreenEffect(...effectClasses) {
    const container = document.getElementById('game-container');
    if (!container) return;
    container.classList.remove(...ALL_SCREEN_EFFECTS);
    void container.offsetWidth;
    if (effectClasses.includes('shake-screen') && effectClasses.includes('bg-flash-gold')) {
        container.classList.add('crit-shake-gold');
    } else {
        container.classList.add(...effectClasses);
    }
}

function triggerArenaVFX(vfxKey, targetWrapperId, particleColor) {
    const overlay = document.getElementById('vfx-overlay');
    const flare = document.getElementById('arena-flare');
    if (flare) {
        flare.classList.remove('flare-active');
        void flare.offsetWidth;
        flare.classList.add('flare-active');
    }
    if (overlay) {
        overlay.innerHTML = `<div class="vfx-burst"><svg><use href="#icon-${vfxKey}"></use></svg></div>`;
    }
    
    if (vfxKey === 'vfxCrit') {
        ParticleEngine.applyTimeDilation(0.18, 160);
    }

    if (targetWrapperId) {
        ParticleEngine.spawnElementBurst(targetWrapperId, particleColor, 48);
    } else {
        ParticleEngine.spawnElementBurst('battle-arena', particleColor, 45);
    }
}

function resetArena() {
    const pIcon = document.getElementById('p-action');
    const cIcon = document.getElementById('c-action');
    if (pIcon && cIcon) {
        pIcon.innerHTML = `<svg><use href="#icon-mystery"></use></svg>`;
        cIcon.innerHTML = `<svg><use href="#icon-mystery"></use></svg>`;
        pIcon.className = "action-icon";
        cIcon.className = "action-icon";
    }
    const pAura = document.getElementById('p-aura');
    const cAura = document.getElementById('c-aura');
    if (pAura) pAura.className = "aura-ring";
    if (cAura) cAura.className = "aura-ring";

    const vfxOverlay = document.getElementById('vfx-overlay');
    if (vfxOverlay) vfxOverlay.innerHTML = '';

    const flare = document.getElementById('arena-flare');
    if (flare) flare.classList.remove('flare-active');

    const container = document.getElementById('game-container');
    if (container) {
        container.classList.remove(...ALL_SCREEN_EFFECTS);
    }
    document.querySelectorAll('.floating-text').forEach(el => el.remove());
}

function cleanupFirebaseListeners() {
    if (db && gameState.roomCode) {
        const roomRef = db.ref('rooms/' + gameState.roomCode);
        roomRef.off();
        roomRef.child('status').off();
        roomRef.child('choices').off();
        roomRef.child('results').off();
    }
}

function abortOnlineRoomAndLeave() {
    cleanupFirebaseListeners();
    if (db && gameState.roomCode) {
        const roomRef = db.ref('rooms/' + gameState.roomCode);
        if (gameState.isHost) {
            roomRef.onDisconnect().cancel();
            roomRef.remove();
        } else {
            roomRef.child('guest').onDisconnect().cancel();
            roomRef.child('guestName').onDisconnect().cancel();
            roomRef.child('guest').remove();
            roomRef.child('guestName').remove();
        }
    }
    gameState.roomCode = null;
    gameState.isHost = false;
}

function goBack(fromScreen) {
    playSound('click');
    clearAllTimers();

    // 若處於線上模式且已進入房間流程，返回大廳時徹底清理房間資源
    if (gameState.gameMode === 'pvp_online' && gameState.roomCode) {
        if (
            fromScreen === 'screen-room-waiting' ||
            fromScreen === 'screen-guest-waiting' ||
            fromScreen === 'screen-custom' ||
            fromScreen === 'screen-char'
        ) {
            abortOnlineRoomAndLeave();
            showScreen('screen-online-lobby');
            return;
        }
    }

    switch (fromScreen) {
        case 'screen-mode-type': showScreen('screen-name'); break;
        case 'screen-online-lobby': showScreen('screen-mode-type'); break;
        case 'screen-custom': showScreen(gameState.gameMode === 'pvp_online' ? 'screen-online-lobby' : 'screen-mode-type'); break;
        case 'screen-char': showScreen(gameState.gameMode === 'pvp_online' ? 'screen-online-lobby' : 'screen-custom'); break;
        case 'screen-equip-prefix': showScreen('screen-char'); break;
        case 'screen-equip-detail': showScreen('screen-equip-prefix'); break;
        default: showScreen('screen-name'); break;
    }
}

function submitName() {
    playSound('click');
    gameState.playerName = document.getElementById('player-name').value.trim() || "無名英雄";
    showScreen('screen-mode-type');
}

function syncCustomSwitchUI() {
    ['hasChar', 'hasEquip', 'isStrong'].forEach(key => {
        const track = document.getElementById(`switch-${key}`);
        if (track && track.parentElement) {
            track.parentElement.classList.toggle('active', !!gameState.customConfig[key]);
        }
    });
}

function setGameMode(mode) {
    playSound('click');
    gameState.gameMode = mode;
    document.getElementById('pvn-settings-container').style.display = (mode === 'pvn') ? 'block' : 'none';
    syncCustomSwitchUI();
    if (mode === 'pvp_online') {
        showScreen('screen-online-lobby');
    } else {
        setHeaderTitle('custom-setting-title', 'sliders', '自訂義對局設定');
        showScreen('screen-custom');
    }
}

// --- 線上房間系統 ---
function createOnlineRoom() {
    if (!db) return alert("Firebase 尚未載入！");
    playSound('click');
    abortOnlineRoomAndLeave();
    const timeoutId = registerTimeout(() => {
        alert("⚠️ 連線逾時！請確認網路或 Firebase 資料庫規則是否開啟讀寫權限。");
    }, 4000);

    gameState.isHost = true;
    gameState.roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('display-room-code').innerText = gameState.roomCode;
    document.getElementById('room-status-text').innerText = "房號已生成，等待挑戰者加入...";
    document.getElementById('btn-start-room-game').style.display = "none";
    
    const roomRef = db.ref('rooms/' + gameState.roomCode);
    roomRef.onDisconnect().remove();

    roomRef.set({
        hostName: gameState.playerName,
        status: "waiting",
        targetWins: 5
    }).then(() => {
        clearTimeout(timeoutId);
        activeTimeouts.delete(timeoutId);
    }).catch(err => {
        clearTimeout(timeoutId);
        activeTimeouts.delete(timeoutId);
        alert("創建房間失敗: " + err.message);
    });

    roomRef.on('value', snap => {
        const data = snap.val();
        if (data && data.guestName && data.status === "waiting") {
            gameState.opponentName = data.guestName;
            document.getElementById('room-status-text').innerText = `玩家【${data.guestName}】已加入房間！`;
            document.getElementById('btn-start-room-game').style.display = "inline-flex";
        } else if (data && !data.guestName && data.status === "waiting") {
            document.getElementById('room-status-text').innerText = "房號已生成，等待挑戰者加入...";
            document.getElementById('btn-start-room-game').style.display = "none";
        }
    });
    showScreen('screen-room-waiting');
}

function joinOnlineRoom() {
    if (!db) return alert("Firebase 尚未載入！");
    playSound('click');
    const code = document.getElementById('room-code-input').value.trim();
    if (code.length !== 4) return alert("請輸入 4 碼房號！");
    
    abortOnlineRoomAndLeave();
    const timeoutId = registerTimeout(() => {
        alert("⚠️ 連線逾時！請確認房號是否正確。");
    }, 4000);
    gameState.isHost = false;
    gameState.roomCode = code;

    const roomRef = db.ref('rooms/' + code);
    roomRef.once('value').then(snap => {
        clearTimeout(timeoutId);
        activeTimeouts.delete(timeoutId);
        const data = snap.val();
        if (!data) return alert("找不到此房間，請確認房號是否正確！");
        if (data.status !== "waiting" || data.guestName) return alert("此房間已經開始遊戲或已滿！");

        gameState.opponentName = data.hostName;
        roomRef.child('guestName').onDisconnect().remove();
        roomRef.child('guest').onDisconnect().remove();
        roomRef.update({ guestName: gameState.playerName });
        
        document.getElementById('display-room-code').innerText = code;
        document.getElementById('room-status-text').innerText = `成功加入房主【${data.hostName}】的房間！等待房主設定局數...`;
        document.getElementById('btn-start-room-game').style.display = "none";
        showScreen('screen-room-waiting');

        roomRef.on('value', roomSnap => {
            const rData = roomSnap.val();
            if (!rData) {
                cleanupFirebaseListeners();
                alert("房主已關閉房間！");
                gameState.roomCode = null;
                showScreen('screen-online-lobby');
                return;
            }
            if (rData.status === "selecting") {
                gameState.targetWins = rData.targetWins || 5;
                roomRef.off('value');
                setHeaderTitle('char-screen-title', 'shield', `選擇您的職業 (${gameState.playerName})`);
                renderCharSelection();
                showScreen('screen-char');
            }
        });
    }).catch(err => {
        clearTimeout(timeoutId);
        activeTimeouts.delete(timeoutId);
        alert("連線失敗: " + err.message);
    });
}

function hostStartGame() {
    playSound('click');
    if (db && gameState.roomCode) db.ref('rooms/' + gameState.roomCode).off('value');
    setHeaderTitle('custom-setting-title', 'sliders', '房間局數設定');
    document.getElementById('pvn-settings-container').style.display = 'none';
    showScreen('screen-custom');
}

function toggleSwitch(key) {
    playSound('click');
    gameState.customConfig[key] = !gameState.customConfig[key];
    syncCustomSwitchUI();
}

function confirmCustomMatch() {
    playSound('click');
    const winInput = document.getElementById('custom-target-wins');
    let wins = parseInt(winInput.value, 10);
    const errTip = document.getElementById('win-error-msg');
    if (isNaN(wins) || wins < 5) { wins = 5; winInput.value = 5; errTip.innerText = "已自動校正為最低 5 局！"; }
    else if (wins > 100) { wins = 100; winInput.value = 100; errTip.innerText = "已自動校正為最高 100 局！"; }
    else { errTip.innerText = ""; }

    gameState.targetWins = wins;

    if (gameState.gameMode === 'pvp_online' && gameState.isHost && db) {
        db.ref('rooms/' + gameState.roomCode).update({ targetWins: wins, status: "selecting" });
    }
    setHeaderTitle('char-screen-title', 'shield', `選擇您的職業 (${gameState.playerName})`);
    renderCharSelection();
    showScreen('screen-char');
}

// --- 選擇職業與裝備 (DOM 節點輕量化渲染) ---
function renderCharSelection() {
    gameState.tempSelectedCharId = null;
    document.getElementById('btn-next-char').disabled = true;
    const cl = document.getElementById('char-list');
    cl.innerHTML = '';

    const frag = document.createDocumentFragment();
    let idx = 0;
    for (let id in CHARACTER_DB) {
        const c = CHARACTER_DB[id];
        const div = document.createElement('div');
        div.className = 'card';
        div.id = `char-card-${id}`;
        div.setAttribute('data-char-id', id);
        div.style.animationDelay = `${Math.min(idx * 12, 360)}ms`;
        div.innerHTML = `
            <h4>
                <span>${escapeHtml(c.name)}</span>
                <span class="inline-tag-group">${buildInlineIconHtml(c.iconKey)}</span>
            </h4>
            <div class="stat-bars">
                <div class="stat-seg-crit" style="width:${(c.crit / 60) * 100}%"></div>
                <div class="stat-seg-shield" style="width:${(c.shield / 60) * 100}%"></div>
                <div class="stat-seg-magic" style="width:${(c.magic / 60) * 100}%"></div>
            </div>
            <div class="stat-tags">
                <span class="tag-crit">爆:${c.crit}%</span>
                <span class="tag-shield">盾:${c.shield}%</span>
                <span class="tag-magic">魔:${c.magic}%</span>
            </div>
            <p>${escapeHtml(c.desc)}</p>
        `;
        frag.appendChild(div);
        idx++;
    }
    cl.appendChild(frag);
}

function confirmCharSelection() {
    if (!gameState.tempSelectedCharId) return;
    playSound('click');
    gameState.playerChar = CHARACTER_DB[gameState.tempSelectedCharId];
    
    gameState.tempSelectedPrefixIndex = null;
    document.getElementById('btn-next-prefix').disabled = true;
    const pl = document.getElementById('equip-prefix-list');
    pl.innerHTML = '';

    const frag = document.createDocumentFragment();
    PREFIX_EFFECTS.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.id = `prefix-card-${i}`;
        div.setAttribute('data-prefix-idx', i);
        div.style.animationDelay = `${i * 18}ms`;
        div.innerHTML = `
            <h4>
                <span>${escapeHtml(p[0])} 系列</span>
                <span class="inline-tag-group">${buildInlineIconHtml(p[3])}</span>
            </h4>
            <p class="eq-pos-line">${escapeHtml(p[1])}</p>
        `;
        frag.appendChild(div);
    });
    pl.appendChild(frag);
    showScreen('screen-equip-prefix');
}

function confirmPrefixSelection() {
    if (gameState.tempSelectedPrefixIndex === null) return;
    playSound('click');
    const prefixIndex = gameState.tempSelectedPrefixIndex;
    const prefixInfo = PREFIX_EFFECTS[prefixIndex];
    gameState.tempSelectedEquipId = null;
    document.getElementById('btn-next-equip').disabled = true;
    setHeaderTitle('equip-detail-title', prefixInfo[3], `【${prefixInfo[0]}系列】選擇具體裝備`);

    const dl = document.getElementById('equip-detail-list');
    dl.innerHTML = '';
    const frag = document.createDocumentFragment();
    const startId = prefixIndex * 24 + 1;
    for (let i = startId; i < startId + 24; i++) {
        const eq = EQUIPMENT_DB[i];
        const div = document.createElement('div');
        div.className = 'card';
        div.id = `equip-card-${i}`;
        div.setAttribute('data-equip-id', i);
        div.style.animationDelay = `${(i - startId) * 15}ms`;
        div.innerHTML = `
            <h4>
                <span>${escapeHtml(eq.name)}</span>
                <span class="inline-tag-group">
                    ${buildInlineIconHtml(eq.prefixIconKey)}
                    ${buildInlineIconHtml(eq.iconKey)}
                </span>
            </h4>
            <p>${eq.desc}</p>
        `;
        frag.appendChild(div);
    }
    dl.appendChild(frag);
    showScreen('screen-equip-detail');
}

function proceedAfterSetup() {
    if (!gameState.tempSelectedEquipId) return;
    playSound('click');
    gameState.playerEq = EQUIPMENT_DB[gameState.tempSelectedEquipId];
    
    if (gameState.gameMode === 'pvp_online' && db) {
        const role = gameState.isHost ? 'host' : 'guest';
        const roomRef = db.ref('rooms/' + gameState.roomCode);
        roomRef.child(role).set({
            name: gameState.playerName,
            charId: gameState.playerChar.id,
            eqId: gameState.playerEq.id,
            char: gameState.playerChar,
            eq: gameState.playerEq
        });
        showScreen('screen-guest-waiting');
        
        roomRef.on('value', snap => {
            const data = snap.val();
            if (!data || (gameState.isHost && !data.guestName)) {
                abortOnlineRoomAndLeave();
                alert("對手已離開房間！");
                showScreen('screen-online-lobby');
                return;
            }
            if (data.host && data.guest && data.host.char && data.guest.char) {
                roomRef.off('value');
                const oppData = gameState.isHost ? data.guest : data.host;
                gameState.opponentName = oppData.name;
                gameState.compChar = (oppData.charId && CHARACTER_DB[oppData.charId]) ? CHARACTER_DB[oppData.charId] : oppData.char;
                gameState.compEq = (oppData.eqId && EQUIPMENT_DB[oppData.eqId]) ? EQUIPMENT_DB[oppData.eqId] : oppData.eq;
                startCountdownPhase();
            }
        });
    } else {
        startCountdownPhase();
    }
}

// --- 倒數階段 ---
function startCountdownPhase() {
    clearAllTimers();
    showScreen('screen-countdown');
    let timeLeft = 3;
    const countEl = document.getElementById('countdown-number');
    const ringEl = document.getElementById('countdown-ring');
    const tipEl = document.getElementById('countdown-tip');

    const triggerCountdownAnim = (contentHtml) => {
        countEl.innerHTML = contentHtml;
        countEl.classList.remove('countdown-pulse');
        ringEl.classList.remove('ring-burst');
        void countEl.offsetWidth;
        countEl.classList.add('countdown-pulse');
        ringEl.classList.add('ring-burst');
    };

    tipEl.innerText = "準備迎戰！";
    triggerCountdownAnim(timeLeft);
    playSound('countdown');

    const timer = registerInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            triggerCountdownAnim(timeLeft);
            playSound('countdown');
        } else if (timeLeft === 0) {
            triggerCountdownAnim(`<svg><use href="#icon-swords"></use></svg>`);
            tipEl.innerText = "戰鬥開始！";
            playSound('start');
            ParticleEngine.spawnElementBurst('countdown-number', '#00D4FF', 50);
        } else {
            clearInterval(timer);
            activeIntervals.delete(timer);
            initBattle();
        }
    }, 950);
}

// --- 初始化戰鬥 ---
function initBattle() {
    clearAllTimers();
    gameState.isGameOver = false;
    gameState.isBusy = false;
    gameState.isCalculatingRound = false;
    gameState.pScore = 0;
    gameState.cScore = 0;
    gameState.roundNum = 1;
    gameState.lastProcessedRound = 0;
    gameState.history = [];
    document.getElementById('pvp-waiting-msg').style.display = 'none';
    toggleButtons(true);
    resetArena();
    
    if (gameState.gameMode === 'pvn') {
        gameState.compChar = gameState.customConfig.hasChar
            ? CHARACTER_DB[Math.floor(Math.random() * 60) + 1]
            : { name: "史萊姆 (無職業)", crit: 0, shield: 0, magic: 0, iconKey: "drop" };
        gameState.compEq = gameState.customConfig.hasEquip
            ? EQUIPMENT_DB[Math.floor(Math.random() * 384) + 1]
            : null;
        gameState.opponentName = gameState.compChar.name;
    } else if (gameState.gameMode === 'pvp_online') {
        setupOnlineBattleListeners();
    }

    document.getElementById('p-name-display').innerText = gameState.playerName;
    document.getElementById('p-class-eq').innerHTML = `
        <span class="badge-pill">${buildCharNameWithIcon(gameState.playerChar)}</span>
        <span class="badge-pill">${buildEquipNameWithIcon(gameState.playerEq)}</span>
    `;

    document.getElementById('c-name-display').innerText = gameState.opponentName;
    document.getElementById('c-class-eq').innerHTML = `
        <span class="badge-pill">${buildCharNameWithIcon(gameState.compChar)}</span>
        <span class="badge-pill">${buildEquipNameWithIcon(gameState.compEq)}</span>
    `;
    document.getElementById('target-win-display').innerText = `目標: ${gameState.targetWins} 勝`;
    
    updateScoreUI(false, false);
    document.getElementById('battle-log').innerHTML = '';
    logMsg(`${buildInlineIconHtml('swords')} <span>戰鬥開始！先獲得 <strong>${gameState.targetWins}</strong> 分者獲勝！</span>`, 'var(--highlight)');
    showScreen('screen-battle');
}

function setupOnlineBattleListeners() {
    if (!db) return;
    const roomRef = db.ref('rooms/' + gameState.roomCode);

    // 監聽房間存亡與對手斷線狀態，避免戰鬥中途對手離線導致永久卡死
    roomRef.on('value', snap => {
        if (gameState.isGameOver) return;
        const data = snap.val();
        if (!data || (gameState.isHost && !data.guestName)) {
            gameState.isGameOver = true;
            clearAllTimers();
            abortOnlineRoomAndLeave();
            alert("對手已中斷連線或離開對局！");
            showScreen('screen-online-lobby');
        }
    });

    if (gameState.isHost) {
        roomRef.child('choices').on('value', snap => {
            if (gameState.isGameOver || gameState.isCalculatingRound) return;
            const allChoices = snap.val();
            const curChoices = allChoices ? allChoices[gameState.roundNum] : null;
            if (curChoices && curChoices.host && curChoices.guest) {
                gameState.isCalculatingRound = true;
                computeAndBroadcastOnlineRound(curChoices.host, curChoices.guest, gameState.roundNum);
            }
        });
    }

    roomRef.child('results').on('value', snap => {
        if (gameState.isGameOver) return;
        const allResults = snap.val();
        if (!allResults) return;
        const res = allResults[gameState.roundNum];
        if (res && res.roundNum > gameState.lastProcessedRound) {
            gameState.lastProcessedRound = res.roundNum;
            renderSyncedOnlineRound(res);
        }
    });
}

function playRound(pChoice) {
    if (gameState.isGameOver || gameState.isBusy) return;
    playSound('click');

    if (gameState.gameMode === 'pvp_online' && db) {
        gameState.isBusy = true;
        toggleButtons(false);
        document.getElementById('pvp-waiting-msg').style.display = 'block';
        const roleKey = gameState.isHost ? 'host' : 'guest';
        db.ref(`rooms/${gameState.roomCode}/choices/${gameState.roundNum}/${roleKey}`).set(pChoice);
    } else {
        gameState.isBusy = true;
        toggleButtons(false);
        let cChoice = ["剪刀", "石頭", "布"][Math.floor(Math.random() * 3)];
        if (gameState.customConfig.isStrong && gameState.history.length >= 2) {
            const counts = { "剪刀": 0, "石頭": 0, "布": 0 };
            gameState.history.slice(-5).forEach(m => counts[m]++);
            cChoice = counterWin[Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)];
        }
        gameState.history.push(pChoice);
        executePvNRound(pChoice, cChoice);
    }
}

// 線上回合運算 (修正 0% 邊界機率與攻守雙向格擋判定)
function computeAndBroadcastOnlineRound(hostChoice, guestChoice, rNum) {
    const isTie = hostChoice === guestChoice;
    const hWin = (hostChoice === "剪刀" && guestChoice === "布") ||
                 (hostChoice === "石頭" && guestChoice === "剪刀") ||
                 (hostChoice === "布" && guestChoice === "石頭");
    const gWin = !isTie && !hWin;

    const hostChar = gameState.playerChar;
    const guestChar = gameState.compChar;
    const hostEq = gameState.playerEq;
    const guestEq = gameState.compEq;

    let hDelta = 0, gDelta = 0;
    let roundBlocked = false;
    let effectType = 'none';
    let dmgVal = 0;

    if (isTie) {
        const hMagic = Math.random() * 100 < hostChar.magic;
        const gMagic = Math.random() * 100 < guestChar.magic;
        if (hMagic && !gMagic) { hDelta += 1; effectType = 'magic_host'; dmgVal = 1; }
        else if (gMagic && !hMagic) { gDelta += 1; effectType = 'magic_guest'; dmgVal = 1; }
        else if (hMagic && gMagic) { effectType = 'magic_clash'; }
    } else if (hWin) {
        const isCrit = Math.random() * 100 < hostChar.crit;
        const isShield = Math.random() * 100 < guestChar.shield;
        const finalDmg = (isCrit ? 2 : 1) - (isShield ? 1 : 0);
        if (finalDmg > 0) {
            hDelta += finalDmg;
            dmgVal = finalDmg;
            effectType = isCrit ? 'crit' : 'attack';
        } else {
            roundBlocked = true;
            effectType = 'shield';
        }
    } else {
        const isCrit = Math.random() * 100 < guestChar.crit;
        const isShield = Math.random() * 100 < hostChar.shield;
        const finalDmg = (isCrit ? 2 : 1) - (isShield ? 1 : 0);
        if (finalDmg > 0) {
            gDelta += finalDmg;
            dmgVal = finalDmg;
            effectType = isCrit ? 'crit' : 'attack';
        } else {
            roundBlocked = true;
            effectType = 'shield';
        }
    }

    const isStart = (rNum === 1);
    const ctxH = { is_tie: isTie, win: hWin, loss: gWin, blocked: roundBlocked, is_start: isStart };
    const ctxG = { is_tie: isTie, win: gWin, loss: hWin, blocked: roundBlocked, is_start: isStart };

    const hGear = evaluateGearPure(hostEq, ctxH, gameState.playerName);
    const gGear = evaluateGearPure(guestEq, ctxG, gameState.opponentName);

    const hostNetGear = hGear.act + gGear.opp;
    const guestNetGear = gGear.act + hGear.opp;

    hDelta += hostNetGear;
    gDelta += guestNetGear;

    const newHostScore = Math.max(0, gameState.pScore + hDelta);
    const newGuestScore = Math.max(0, gameState.cScore + gDelta);

    db.ref(`rooms/${gameState.roomCode}/results/${rNum}`).set({
        roundNum: rNum,
        hostChoice,
        guestChoice,
        isTie,
        hWin,
        gWin,
        hDelta,
        gDelta,
        roundBlocked,
        effectType,
        dmgVal,
        hGearLogs: hGear.logs,
        gGearLogs: gGear.logs,
        hostScore: newHostScore,
        guestScore: newGuestScore,
        hostGearNet: hostNetGear,
        guestGearNet: guestNetGear
    });
}

function evaluateGearPure(eq, ctx, ownerTag) {
    let act = 0, opp = 0, logs = [];
    if (!eq) return { act, opp, logs };
    const eqIcons = `${buildInlineIconHtml(eq.prefixIconKey)}${buildInlineIconHtml(eq.iconKey)}`;
    const safeOwner = escapeHtml(ownerTag);
    const safeEqName = escapeHtml(eq.name);
    [eq.pos, eq.neg].forEach(code => {
        if (EFFECT_HANDLERS[code]) {
            const res = EFFECT_HANDLERS[code](ctx);
            if (res) {
                act += res[0];
                opp += res[1];
                logs.push(`${eqIcons} <span>[裝備] ${safeOwner}的【${safeEqName}】: ${res[2]}</span>`);
            }
        }
    });
    return { act, opp, logs };
}

function renderSyncedOnlineRound(res) {
    document.getElementById('pvp-waiting-msg').style.display = 'none';
    const myChoice = gameState.isHost ? res.hostChoice : res.guestChoice;
    const opChoice = gameState.isHost ? res.guestChoice : res.hostChoice;

    const pIcon = document.getElementById('p-action');
    const cIcon = document.getElementById('c-action');
    const pAura = document.getElementById('p-aura');
    const cAura = document.getElementById('c-aura');

    pIcon.innerHTML = `<svg><use href="#icon-${choiceSvgKeys[myChoice]}"></use></svg>`;
    cIcon.innerHTML = `<svg><use href="#icon-${choiceSvgKeys[opChoice]}"></use></svg>`;
    pIcon.className = "action-icon pop-left";
    cIcon.className = "action-icon pop-right";

    const safePName = escapeHtml(gameState.playerName);
    const safeOName = escapeHtml(gameState.opponentName);

    logMsg(`--- 第 ${res.roundNum} 回合 ---`, '#fff');
    logMsg(`${buildInlineIconHtml(choiceSvgKeys[myChoice])} <span>${safePName}出: <strong>${myChoice}</strong> ｜</span> ${buildInlineIconHtml(choiceSvgKeys[opChoice])} <span>${safeOName}出: <strong>${opChoice}</strong></span>`);

    const myWin = (gameState.isHost && res.hWin) || (!gameState.isHost && !res.hWin && !res.isTie);
    const myMagic = (gameState.isHost && res.effectType === 'magic_host') || (!gameState.isHost && res.effectType === 'magic_guest');
    const opMagic = (gameState.isHost && res.effectType === 'magic_guest') || (!gameState.isHost && res.effectType === 'magic_host');

    if (res.isTie) {
        logMsg("🤝 雙方平手！");
        if (res.effectType === 'magic_clash') {
            logMsg(`${buildInlineIconHtml('staff')} <span>雙方同時觸發【魔力爆發】，奧術洪流互相抵銷！</span>`, 'var(--magic)');
            playSound('magic');
            pIcon.classList.add('icon-magic');
            cIcon.classList.add('icon-magic');
            if (pAura) pAura.classList.add('aura-magic');
            if (cAura) cAura.classList.add('aura-magic');
            triggerScreenEffect('bg-flash-purple');
            triggerArenaVFX('vfxMagic', null, '#d542ff');
        } else if (myMagic) {
            logMsg(`${buildInlineIconHtml('staff')} <span>${safePName}【魔力爆發】，逆轉奪取 1 分！</span>`, 'var(--magic)');
            playSound('magic');
            pIcon.classList.add('icon-magic');
            if (pAura) pAura.classList.add('aura-magic');
            triggerScreenEffect('bg-flash-purple');
            triggerArenaVFX('vfxMagic', 'p-wrapper', '#d542ff');
            showFloatingText('p-wrapper', 'MAGIC +1', 'var(--magic)');
        } else if (opMagic) {
            logMsg(`${buildInlineIconHtml('staff')} <span>${safeOName}【魔力爆發】，逆轉奪取 1 分！</span>`, 'var(--danger)');
            playSound('magic');
            cIcon.classList.add('icon-magic');
            if (cAura) cAura.classList.add('aura-magic');
            triggerScreenEffect('bg-flash-purple');
            triggerArenaVFX('vfxMagic', 'c-wrapper', '#d542ff');
            showFloatingText('c-wrapper', 'MAGIC +1', 'var(--danger)');
        }
    } else if (myWin) {
        if (res.effectType === 'crit') {
            logMsg(`${buildInlineIconHtml('bolt')} <span>獲勝！【爆擊命中】(+${res.dmgVal}分)</span>`, 'var(--crit)');
            playSound('attack');
            pIcon.classList.add('icon-crit'); cIcon.classList.add('icon-shake');
            if (pAura) pAura.classList.add('aura-crit');
            triggerScreenEffect('shake-screen', 'bg-flash-gold');
            triggerArenaVFX('vfxCrit', 'c-wrapper', '#ffeb3b');
            showFloatingText('c-wrapper', `CRIT -${res.dmgVal}`, 'var(--crit)');
        } else if (res.effectType === 'attack') {
            logMsg(`${buildInlineIconHtml('swords')} <span>獲勝！【普通攻擊】(+${res.dmgVal}分)</span>`, 'var(--attack)');
            playSound('attack');
            pIcon.classList.add('icon-attack'); cIcon.classList.add('icon-shake');
            if (pAura) pAura.classList.add('aura-attack');
            triggerScreenEffect('bg-flash-red');
            triggerArenaVFX('vfxSlash', 'c-wrapper', '#ff6b2b');
            showFloatingText('c-wrapper', `-${res.dmgVal}`, 'var(--danger)');
        } else if (res.effectType === 'shield') {
            logMsg(`${buildInlineIconHtml('shield')} <span>攻擊被對手【護盾防禦】完全擋下！</span>`, 'var(--shield)');
            playSound('shield');
            cIcon.classList.add('icon-shield'); pIcon.classList.add('icon-shake');
            if (cAura) cAura.classList.add('aura-shield');
            triggerScreenEffect('bg-flash-cyan');
            triggerArenaVFX('vfxShield', 'c-wrapper', '#00e5ff');
            showFloatingText('c-wrapper', 'BLOCKED', 'var(--shield)');
        }
    } else {
        if (res.effectType === 'crit') {
            logMsg(`${buildInlineIconHtml('bolt')} <span>敗北！${safeOName}【爆擊命中】(+${res.dmgVal}分)</span>`, 'var(--crit)');
            playSound('attack');
            cIcon.classList.add('icon-crit'); pIcon.classList.add('icon-shake');
            if (cAura) cAura.classList.add('aura-crit');
            triggerScreenEffect('shake-screen', 'bg-flash-gold');
            triggerArenaVFX('vfxCrit', 'p-wrapper', '#ffeb3b');
            showFloatingText('p-wrapper', `CRIT -${res.dmgVal}`, 'var(--crit)');
        } else if (res.effectType === 'attack') {
            logMsg(`${buildInlineIconHtml('swords')} <span>敗北！${safeOName}【普通攻擊】(+${res.dmgVal}分)</span>`, 'var(--attack)');
            playSound('attack');
            cIcon.classList.add('icon-attack'); pIcon.classList.add('icon-shake');
            if (cAura) cAura.classList.add('aura-attack');
            triggerScreenEffect('bg-flash-red');
            triggerArenaVFX('vfxSlash', 'p-wrapper', '#ff6b2b');
            showFloatingText('p-wrapper', `-${res.dmgVal}`, 'var(--danger)');
        } else if (res.effectType === 'shield') {
            logMsg(`${buildInlineIconHtml('shield')} <span>成功用【護盾防禦】擋下對手攻擊！</span>`, 'var(--shield)');
            playSound('shield');
            pIcon.classList.add('icon-shield'); cIcon.classList.add('icon-shake');
            if (pAura) pAura.classList.add('aura-shield');
            triggerScreenEffect('bg-flash-cyan');
            triggerArenaVFX('vfxShield', 'p-wrapper', '#00e5ff');
            showFloatingText('p-wrapper', 'BLOCKED', 'var(--shield)');
        }
    }

    // 同步顯示雙方的裝備觸發紀錄
    const combinedGearLogs = [
        ...(res.hGearLogs || []),
        ...(res.gGearLogs || [])
    ];
    combinedGearLogs.forEach(msg => logMsg(msg, '#ffd700'));

    const myGearNet = gameState.isHost ? (res.hostGearNet || 0) : (res.guestGearNet || 0);
    const opGearNet = gameState.isHost ? (res.guestGearNet || 0) : (res.hostGearNet || 0);
    if (myGearNet !== 0) {
        showFloatingText('p-wrapper', `EQUIP ${myGearNet > 0 ? '+' + myGearNet : myGearNet}`, myGearNet > 0 ? 'var(--crit)' : 'var(--danger)', 280);
    }
    if (opGearNet !== 0) {
        showFloatingText('c-wrapper', `EQUIP ${opGearNet > 0 ? '+' + opGearNet : opGearNet}`, opGearNet > 0 ? 'var(--crit)' : 'var(--danger)', 280);
    }

    const newPScore = gameState.isHost ? res.hostScore : res.guestScore;
    const newCScore = gameState.isHost ? res.guestScore : res.hostScore;
    const pChanged = newPScore !== gameState.pScore;
    const cChanged = newCScore !== gameState.cScore;
    gameState.pScore = newPScore;
    gameState.cScore = newCScore;
    updateScoreUI(pChanged, cChanged);
    gameState.roundNum = res.roundNum + 1;

    if (gameState.pScore >= gameState.targetWins || gameState.cScore >= gameState.targetWins) {
        gameState.isGameOver = true;
        toggleButtons(false);
        registerTimeout(endGame, 1450);
    } else {
        registerTimeout(() => {
            resetArena();
            gameState.isBusy = false;
            gameState.isCalculatingRound = false;
            toggleButtons(true);
        }, 1250);
    }
}

function executePvNRound(pChoice, cChoice) {
    const pIcon = document.getElementById('p-action');
    const cIcon = document.getElementById('c-action');
    const pAura = document.getElementById('p-aura');
    const cAura = document.getElementById('c-aura');

    pIcon.innerHTML = `<svg><use href="#icon-${choiceSvgKeys[pChoice]}"></use></svg>`;
    cIcon.innerHTML = `<svg><use href="#icon-${choiceSvgKeys[cChoice]}"></use></svg>`;
    pIcon.className = "action-icon pop-left";
    cIcon.className = "action-icon pop-right";

    const safePName = escapeHtml(gameState.playerName);
    const safeOName = escapeHtml(gameState.opponentName);

    logMsg(`--- 第 ${gameState.roundNum} 回合 ---`, '#fff');
    logMsg(`${buildInlineIconHtml(choiceSvgKeys[pChoice])} <span>${safePName}出: <strong>${pChoice}</strong> ｜</span> ${buildInlineIconHtml(choiceSvgKeys[cChoice])} <span>${safeOName}出: <strong>${cChoice}</strong></span>`);
    
    const isTie = pChoice === cChoice;
    const pWin = (pChoice === "剪刀" && cChoice === "布") ||
                 (pChoice === "石頭" && cChoice === "剪刀") ||
                 (pChoice === "布" && cChoice === "石頭");
    const cWin = !isTie && !pWin;
    let pScoreDelta = 0, cScoreDelta = 0, roundBlocked = false;

    const p2Char = gameState.compChar;
    const p2Eq = gameState.compEq;

    if (isTie) {
        logMsg("🤝 雙方平手！");
        const pMagic = Math.random() * 100 < gameState.playerChar.magic;
        const cMagic = Math.random() * 100 < p2Char.magic;
        
        if (pMagic && cMagic) {
            logMsg(`${buildInlineIconHtml('staff')} <span>雙方同時觸發【魔力爆發】，奧術洪流互相抵銷！</span>`, 'var(--magic)');
            playSound('magic');
            pIcon.classList.add('icon-magic');
            cIcon.classList.add('icon-magic');
            if (pAura) pAura.classList.add('aura-magic');
            if (cAura) cAura.classList.add('aura-magic');
            triggerScreenEffect('bg-flash-purple');
            triggerArenaVFX('vfxMagic', null, '#d542ff');
        } else if (pMagic && !cMagic) { 
            pScoreDelta += 1;
            logMsg(`${buildInlineIconHtml('staff')} <span>${safePName}【魔力爆發】，逆轉奪取 1 分！</span>`, 'var(--magic)'); 
            playSound('magic');
            pIcon.classList.add('icon-magic');
            if (pAura) pAura.classList.add('aura-magic');
            triggerScreenEffect('bg-flash-purple');
            triggerArenaVFX('vfxMagic', 'p-wrapper', '#d542ff');
            showFloatingText('p-wrapper', 'MAGIC +1', 'var(--magic)');
        } else if (cMagic && !pMagic) { 
            cScoreDelta += 1;
            logMsg(`${buildInlineIconHtml('staff')} <span>${safeOName}【魔力爆發】，逆轉奪取 1 分！</span>`, 'var(--danger)'); 
            playSound('magic');
            cIcon.classList.add('icon-magic');
            if (cAura) cAura.classList.add('aura-magic');
            triggerScreenEffect('bg-flash-purple');
            triggerArenaVFX('vfxMagic', 'c-wrapper', '#d542ff');
            showFloatingText('c-wrapper', 'MAGIC +1', 'var(--danger)');
        }
    } else if (pWin) {
        const isCrit = Math.random() * 100 < gameState.playerChar.crit;
        const isShield = Math.random() * 100 < p2Char.shield;
        const finalDmg = (isCrit ? 2 : 1) - (isShield ? 1 : 0);

        if (finalDmg > 0) {
            pScoreDelta += finalDmg;
            if (isCrit) {
                logMsg(`${buildInlineIconHtml('bolt')} <span>獲勝！【爆擊命中】(+${finalDmg}分)</span>`, 'var(--crit)');
                playSound('attack');
                pIcon.classList.add('icon-crit'); cIcon.classList.add('icon-shake');
                if (pAura) pAura.classList.add('aura-crit');
                triggerScreenEffect('shake-screen', 'bg-flash-gold');
                triggerArenaVFX('vfxCrit', 'c-wrapper', '#ffeb3b');
                showFloatingText('c-wrapper', `CRIT -${finalDmg}`, 'var(--crit)');
            } else {
                logMsg(`${buildInlineIconHtml('swords')} <span>獲勝！【普通攻擊】(+${finalDmg}分)</span>`, 'var(--attack)');
                playSound('attack');
                pIcon.classList.add('icon-attack'); cIcon.classList.add('icon-shake');
                if (pAura) pAura.classList.add('aura-attack');
                triggerScreenEffect('bg-flash-red');
                triggerArenaVFX('vfxSlash', 'c-wrapper', '#ff6b2b');
                showFloatingText('c-wrapper', `-${finalDmg}`, 'var(--danger)');
            }
        } else {
            roundBlocked = true;
            logMsg(`${buildInlineIconHtml('shield')} <span>攻擊被對手【護盾防禦】完全擋下！</span>`, 'var(--shield)');
            playSound('shield');
            cIcon.classList.add('icon-shield'); pIcon.classList.add('icon-shake');
            if (cAura) cAura.classList.add('aura-shield');
            triggerScreenEffect('bg-flash-cyan');
            triggerArenaVFX('vfxShield', 'c-wrapper', '#00e5ff');
            showFloatingText('c-wrapper', 'BLOCKED', 'var(--shield)');
        }
    } else {
        const isCrit = Math.random() * 100 < p2Char.crit;
        const isShield = Math.random() * 100 < gameState.playerChar.shield;
        const finalDmg = (isCrit ? 2 : 1) - (isShield ? 1 : 0);

        if (finalDmg > 0) {
            cScoreDelta += finalDmg;
            if (isCrit) {
                logMsg(`${buildInlineIconHtml('bolt')} <span>敗北！對手【爆擊命中】(對手+${finalDmg}分)</span>`, 'var(--crit)');
                playSound('attack');
                cIcon.classList.add('icon-crit'); pIcon.classList.add('icon-shake');
                if (cAura) cAura.classList.add('aura-crit');
                triggerScreenEffect('shake-screen', 'bg-flash-gold');
                triggerArenaVFX('vfxCrit', 'p-wrapper', '#ffeb3b');
                showFloatingText('p-wrapper', `CRIT -${finalDmg}`, 'var(--crit)');
            } else {
                logMsg(`${buildInlineIconHtml('swords')} <span>敗北！對手【普通攻擊】(對手+${finalDmg}分)</span>`, 'var(--attack)');
                playSound('attack');
                cIcon.classList.add('icon-attack'); pIcon.classList.add('icon-shake');
                if (cAura) cAura.classList.add('aura-attack');
                triggerScreenEffect('bg-flash-red');
                triggerArenaVFX('vfxSlash', 'p-wrapper', '#ff6b2b');
                showFloatingText('p-wrapper', `-${finalDmg}`, 'var(--danger)');
            }
        } else {
            roundBlocked = true;
            logMsg(`${buildInlineIconHtml('shield')} <span>成功用【護盾防禦】擋下對手攻擊！</span>`, 'var(--shield)');
            playSound('shield');
            pIcon.classList.add('icon-shield'); cIcon.classList.add('icon-shake');
            if (pAura) pAura.classList.add('aura-shield');
            triggerScreenEffect('bg-flash-cyan');
            triggerArenaVFX('vfxShield', 'p-wrapper', '#00e5ff');
            showFloatingText('p-wrapper', 'BLOCKED', 'var(--shield)');
        }
    }

    const isStart = (gameState.roundNum === 1);
    const ctxP = { is_tie: isTie, win: pWin, loss: cWin, blocked: roundBlocked, is_start: isStart };
    const ctxC = { is_tie: isTie, win: cWin, loss: pWin, blocked: roundBlocked, is_start: isStart };
    
    const pGear = evaluateGearPure(gameState.playerEq, ctxP, gameState.playerName);
    const cGear = evaluateGearPure(p2Eq, ctxC, gameState.opponentName);
    [...pGear.logs, ...cGear.logs].forEach(msg => logMsg(msg, '#ffd700'));
    
    const pGearNet = pGear.act + cGear.opp;
    const cGearNet = cGear.act + pGear.opp;
    pScoreDelta += pGearNet;
    cScoreDelta += cGearNet;

    if (pGearNet !== 0) {
        showFloatingText('p-wrapper', `EQUIP ${pGearNet > 0 ? '+' + pGearNet : pGearNet}`, pGearNet > 0 ? 'var(--crit)' : 'var(--danger)', 280);
    }
    if (cGearNet !== 0) {
        showFloatingText('c-wrapper', `EQUIP ${cGearNet > 0 ? '+' + cGearNet : cGearNet}`, cGearNet > 0 ? 'var(--crit)' : 'var(--danger)', 280);
    }

    const newPScore = Math.max(0, gameState.pScore + pScoreDelta);
    const newCScore = Math.max(0, gameState.cScore + cScoreDelta);
    const pChanged = newPScore !== gameState.pScore;
    const cChanged = newCScore !== gameState.cScore;
    gameState.pScore = newPScore;
    gameState.cScore = newCScore;
    updateScoreUI(pChanged, cChanged);
    gameState.roundNum++;

    if (gameState.pScore >= gameState.targetWins || gameState.cScore >= gameState.targetWins) {
        gameState.isGameOver = true;
        toggleButtons(false);
        registerTimeout(endGame, 1450);
    } else { 
        registerTimeout(() => { 
            resetArena();
            gameState.isBusy = false;
            toggleButtons(true);
        }, 1250); 
    }
}

function updateScoreUI(pBump = false, cBump = false) {
    const pScoreEl = document.getElementById('p-score');
    const cScoreEl = document.getElementById('c-score');
    if (pScoreEl) {
        pScoreEl.innerText = gameState.pScore;
        if (pBump) {
            pScoreEl.classList.remove('score-bump');
            void pScoreEl.offsetWidth;
            pScoreEl.classList.add('score-bump');
        }
    }
    if (cScoreEl) {
        cScoreEl.innerText = gameState.cScore;
        if (cBump) {
            cScoreEl.classList.remove('score-bump');
            void cScoreEl.offsetWidth;
            cScoreEl.classList.add('score-bump');
        }
    }

    const pBar = document.getElementById('p-progress-bar');
    const cBar = document.getElementById('c-progress-bar');
    const pPct = Math.min(100, Math.round((gameState.pScore / gameState.targetWins) * 100));
    const cPct = Math.min(100, Math.round((gameState.cScore / gameState.targetWins) * 100));
    if (pBar) pBar.style.width = `${pPct}%`;
    if (cBar) cBar.style.width = `${cPct}%`;
}

function endGame() {
    if (document.getElementById('screen-result').classList.contains('active')) return;
    let title = "", desc = "", iconKey = "";
    if (gameState.pScore >= gameState.targetWins && gameState.cScore >= gameState.targetWins) { 
        title = "雙方平手！";
        desc = `雙方同時斬獲 ${gameState.targetWins} 勝，勢均力敵！`;
        iconKey = "swords";
        playSound('win');
    } else if (gameState.pScore >= gameState.targetWins) { 
        title = "最終勝利！";
        desc = `恭喜冒險者【${gameState.playerName}】率先達成 ${gameState.targetWins} 勝！`;
        iconKey = "trophy";
        playSound('win');
    } else { 
        title = "挑戰失敗...";
        desc = `【${gameState.opponentName}】率先達成 ${gameState.targetWins} 勝！`;
        iconKey = "defeatSkull";
        playSound('lose');
    }
    document.getElementById('result-icon-box').innerHTML = `<svg><use href="#icon-${iconKey}"></use></svg>`;
    document.getElementById('result-title').innerText = title;
    document.getElementById('result-desc').innerText = desc;
    cleanupFirebaseListeners();
    showScreen('screen-result');
    ParticleEngine.spawnBurst(window.innerWidth / 2, window.innerHeight / 3, '#00D4FF', 65);
}

function resetGame() {
    playSound('click');
    clearAllTimers();
    abortOnlineRoomAndLeave();
    gameState = {
        gameMode: "pvn",
        playerName: gameState.playerName,
        opponentName: "電腦",
        targetWins: 5,
        customConfig: gameState.customConfig,
        tempSelectedCharId: null,
        tempSelectedPrefixIndex: null,
        tempSelectedEquipId: null,
        playerChar: null, playerEq: null, compChar: null, compEq: null,
        pScore: 0, cScore: 0, roundNum: 1, lastProcessedRound: 0, isCalculatingRound: false,
        history: [], roomCode: null, isHost: false, isGameOver: false, isBusy: false
    };
    syncCustomSwitchUI();
    toggleButtons(true);
    document.getElementById('battle-log').innerHTML = ''; 
    resetArena();
    showScreen('screen-mode-type');
}