"use strict";

const CONFIG = Object.freeze({
    FIREBASE_URL: "https://rps-webgame-default-rtdb.asia-southeast1.firebasedatabase.app",
    MIN_WINS: 5, MAX_WINS: 100, DEFAULT_WINS: 5, MAX_STAT_VALUE: 60,
    EQUIPS_PER_PREFIX: 24, TOTAL_CHARS: 60, TOTAL_EQUIPS: 384,
    ROOM_CODE_LEN: 4, ROOM_CODE_MIN: 1000, ROOM_CODE_RANGE: 9000,
    AI_HISTORY_WINDOW: 5, MAX_BATTLE_LOGS: 80, NETWORK_TIMEOUT_MS: 4000,
    COUNTDOWN_SECONDS: 3, COUNTDOWN_STEP_MS: 780, VFX_DURATION_MS: 780,
    ROUND_RESET_DELAY_MS: 1050, GAME_END_DELAY_MS: 1150,
    EQUIP_FLOAT_DELAY_MS: 220, FLOAT_TEXT_LIFE_MS: 780, TOAST_DURATION_MS: 3200,
    BGM_FADE_MS: 500,
    COLORS: Object.freeze({ PRIMARY: "#38BDF8", SECONDARY: "#A855F7", GOLD: "#FACC15", SUCCESS: "#22C55E", DANGER: "#EF4444", TEXT: "#FFFFFF" })
});

const CHOICE_SVG_KEYS = Object.freeze({ "剪刀": "scissors", "石頭": "rock", "布": "paper" });
const COUNTER_WIN = Object.freeze({ "剪刀": "石頭", "石頭": "布", "布": "剪刀" });

const CENTERED_SVG_OVERRIDES = Object.freeze({
    rock: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-vb="64"><polygon points="10,38 10,24 22,10 42,10 54,22 54,38 44,54 20,54" fill="currentColor" fill-opacity="0.22" stroke-width="4"/><polyline points="22,10 28,26 10,38" stroke-width="2.8"/><polyline points="42,10 38,24 54,22" stroke-width="2.8"/><polyline points="28,26 38,24" stroke-width="2.8"/><polyline points="28,26 34,42 20,54" stroke-width="2.8"/><polyline points="38,24 46,38 54,38" stroke-width="2.8"/><polyline points="34,42 46,38 44,54" stroke-width="2.8"/><polygon points="22,10 42,10 38,24 28,26" fill="currentColor" fill-opacity="0.38"/><polygon points="34,42 46,38 44,54 20,54" fill="currentColor" fill-opacity="0.48"/></g>`,
    paper: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-vb="64"><path d="M12,18 C24,12 40,22 52,16 C50,32 53,44 48,52 C36,46 22,52 14,48 C18,36 11,28 12,18 Z" fill="currentColor" fill-opacity="0.24" stroke-width="3.5"/><path d="M25,15 C30,28 27,38 22,49" stroke-width="2.6" opacity="0.85"/><path d="M39,19 C44,30 41,40 36,48" stroke-width="2.6" opacity="0.85"/><path d="M16,22 C25,18 36,25 48,20 C46,32 49,41 44,48 C34,43 23,49 17,44 C19,34 14,28 16,22" stroke-width="1.8" stroke-dasharray="3 3" opacity="0.65"/><polygon points="12,18 20,24 16,13" fill="currentColor" fill-opacity="0.5" stroke-width="2"/></g>`,
    ring: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="14" r="6"/><polygon points="12,4 16,8 8,8"/></g>`,
    trophy: `<g fill="none" data-vb="64"><path d="M18,11 h28 v16 c0,8 -6,14 -14,14 s-14,-6 -14,-14 V11 z" fill="rgba(250,204,21,0.22)" stroke="var(--gold)" stroke-width="3.5"/><path d="M18,15 H10 v8 c0,5 4,8 8,8 M46,15 h8 v8 c0,5 -4,8 -8,8" stroke="var(--gold)" stroke-width="3.5"/><path d="M32,41 v12 M20,53 h24" stroke="var(--gold)" stroke-width="4" stroke-linecap="round"/></g>`,
    defeatSkull: `<g fill="none" data-vb="64"><polygon points="32,10 58,54 6,54" fill="rgba(239,68,68,0.2)" stroke="var(--danger)" stroke-width="3.5" stroke-linejoin="round"/><line x1="32" y1="25" x2="32" y2="39" stroke="var(--danger)" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="46" r="2.5" fill="var(--danger)"/></g>`
});

if (typeof firebase !== "undefined" && !firebase.apps.length) firebase.initializeApp({ databaseURL: CONFIG.FIREBASE_URL });
const db = typeof firebase !== "undefined" ? firebase.database() : null;

let gameState = {
    gameMode: "pve", playerName: "未知指揮官", opponentName: "戰術 AI", targetWins: CONFIG.DEFAULT_WINS,
    customConfig: { hasChar: true, hasEquip: true, isStrong: true },
    tempSelectedCharId: null, tempSelectedPrefixIndex: null, tempSelectedEquipId: null,
    playerChar: null, playerEq: null, pScore: 0, compChar: null, compEq: null, cScore: 0,
    roundNum: 1, lastProcessedRound: 0, isCalculatingRound: false, history: [],
    roomCode: null, isHost: false, isGameOver: false, isBusy: false, isConnecting: false
};

const DOM = {};
function cacheDomElements() {
    const ids = ["svg-sprite", "bg-particles", "game-container", "fx-flash-layer", "scifi-vfx-stage", "hud-toast", "hud-toast-text", "player-name", "room-code-input", "display-room-code", "room-status-text", "btn-start-room-game", "custom-setting-title", "custom-target-wins", "win-error-msg", "pve-settings-container", "char-screen-title", "char-list", "btn-next-char", "prefix-screen-title", "equip-prefix-list", "btn-next-prefix", "equip-detail-title", "equip-detail-list", "btn-next-equip", "countdown-ring", "countdown-number", "countdown-tip", "p-name-display", "p-class-eq", "p-score", "p-progress-bar", "c-name-display", "c-class-eq", "c-score", "c-progress-bar", "target-win-display", "battle-arena", "p-wrapper", "p-aura", "p-action", "p-action-use", "arena-flare", "c-wrapper", "c-aura", "c-action", "c-action-use", "pvp-waiting-msg", "action-buttons-container", "battle-log", "result-icon-box", "result-icon-use", "result-title", "result-desc"];
    ids.forEach(id => { DOM[id] = document.getElementById(id); });
    DOM.screens = Array.from(document.querySelectorAll(".screen"));
    DOM.actionButtons = Array.from(document.querySelectorAll(".btn-action"));
}

const activeTimeouts = new Set();
let countdownRafId = null;
let toastTimeoutId = null;
let vfxCleanupTimer = null;

function registerTimeout(fn, delay) { const id = setTimeout(() => { activeTimeouts.delete(id); fn(); }, delay); activeTimeouts.add(id); return id; }
function clearAllTimers() {
    activeTimeouts.forEach(id => clearTimeout(id)); activeTimeouts.clear();
    if (countdownRafId !== null) { cancelAnimationFrame(countdownRafId); countdownRafId = null; }
    if (vfxCleanupTimer !== null) { clearTimeout(vfxCleanupTimer); vfxCleanupTimer = null; }
}
function escapeHtml(str) { if (typeof str !== "string") return ""; return str.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])); }
function showToast(message) {
    if (!DOM["hud-toast"] || !DOM["hud-toast-text"]) return;
    DOM["hud-toast-text"].textContent = message; DOM["hud-toast"].hidden = false;
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => { if (DOM["hud-toast"]) DOM["hud-toast"].hidden = true; }, CONFIG.TOAST_DURATION_MS);
}
function buildInlineIconHtml(iconKey) { if (!iconKey) return ""; return `<span class="inline-tag-svg" aria-hidden="true"><svg><use href="#icon-${iconKey}"></use></svg></span>`; }
function buildCharNameWithIcon(charObj) { if (!charObj) return ""; return `<span>${escapeHtml(charObj.name)}</span><span class="inline-tag-group">${buildInlineIconHtml(charObj.iconKey)}</span>`; }
function buildEquipNameWithIcon(eqObj) { if (!eqObj) return "<span>無武裝</span>"; return `<span>${escapeHtml(eqObj.name)}</span><span class="inline-tag-group">${buildInlineIconHtml(eqObj.prefixIconKey)}${buildInlineIconHtml(eqObj.iconKey)}</span>`; }
function setHeaderTitle(elId, iconKey, text) { const el = DOM[elId] || document.getElementById(elId); if (!el) return; el.innerHTML = `<span class="svg-icon header-svg" aria-hidden="true"><svg><use href="#icon-${iconKey}"></use></svg></span><span class="header-text">${escapeHtml(text)}</span>`; }

function playSound(type) { AudioManager.playSound(type); }
function playBGM(type) { AudioManager.switchBGM(type); }

const ParticleEngine = (() => {
    let canvas, ctx, w, h; let ambientParticles = []; let shockwaves = []; let isRunning = false;
    function resize() { if (!canvas) return; w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; ambientParticles.forEach(p => { if (p.x > w) p.x = Math.random() * w; if (p.y > h) p.y = Math.random() * h; }); }
    function init() {
        canvas = DOM["bg-particles"]; if (!canvas) return; ctx = canvas.getContext("2d"); resize(); window.addEventListener("resize", resize, { passive: true });
        ambientParticles = Array.from({ length: 36 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + 0.8, vx: (Math.random() - 0.5) * 0.28, vy: -Math.random() * 0.45 - 0.12, alpha: Math.random() * 0.45 + 0.15, color: Math.random() > 0.3 ? CONFIG.COLORS.PRIMARY : CONFIG.COLORS.SECONDARY }));
    }
    function start() { if (isRunning) return; isRunning = true; requestAnimationFrame(loop); }
    function stop() { isRunning = false; if (ctx && canvas) ctx.clearRect(0, 0, w, h); }
    function spawnShockwave(x, y, color = CONFIG.COLORS.PRIMARY) { if (!canvas) return; if (!isRunning) start(); shockwaves.push({ x, y, r: 10, maxR: 180, alpha: 0.85, color }); }
    function spawnElementWave(elId, color) { const el = DOM[elId] || document.getElementById(elId); if (!el) return; const rect = el.getBoundingClientRect(); spawnShockwave(rect.left + rect.width / 2, rect.top + rect.height / 2, color); }
    function loop() {
        if (!isRunning) return;
        if (!document.hidden && ctx) {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < ambientParticles.length; i++) { const p = ambientParticles[i]; p.x += p.vx; p.y += p.vy; if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10; ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
            for (let i = shockwaves.length - 1; i >= 0; i--) { const sw = shockwaves[i]; sw.r += (sw.maxR - sw.r) * 0.15; sw.alpha -= 0.035; if (sw.alpha <= 0) { shockwaves.splice(i, 1); continue; } ctx.save(); ctx.globalAlpha = sw.alpha; ctx.strokeStyle = sw.color; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
            ctx.globalAlpha = 1;
        }
        requestAnimationFrame(loop);
    }
    return { init, start, stop, spawnShockwave, spawnElementWave };
})();

function buildSvgSprite() {
    const spriteContainer = DOM["svg-sprite"]; if (!spriteContainer) return; const chunks = [];
    const mergedDefs = Object.assign({}, SVG_LIB_DEFINITIONS, CENTERED_SVG_OVERRIDES);
    for (const [key, raw] of Object.entries(mergedDefs)) {
        let viewBox = "0 0 24 24";
        if (raw.includes('data-vb="64"')) viewBox = "0 0 64 64"; else if (raw.includes('data-vb="120"')) viewBox = "0 0 120 120"; else if (raw.includes('data-vb="512"')) viewBox = "0 0 512 512";
        const cleanContent = raw.replace(/\s*data-vb="(64|120|512)"/g, ""); chunks.push(`<symbol id="icon-${key}" viewBox="${viewBox}">${cleanContent}</symbol>`);
    }
    spriteContainer.innerHTML = chunks.join("");
}

function toggleButtons(enable) { DOM.actionButtons.forEach(btn => { btn.disabled = !enable; }); }
function showScreen(id) {
    DOM.screens.forEach(s => s.classList.remove("active")); const target = document.getElementById(id); if (target) target.classList.add("active");
    if (id === "screen-battle" || id === "screen-countdown" || id === "screen-result") ParticleEngine.start(); else ParticleEngine.stop();
}

function logMsg(msg, color = "var(--text-muted)") {
    const logBox = DOM["battle-log"]; if (!logBox) return; const p = document.createElement("div"); p.innerHTML = msg; p.style.color = color; logBox.appendChild(p);
    while (logBox.children.length > CONFIG.MAX_BATTLE_LOGS) logBox.removeChild(logBox.firstChild);
    requestAnimationFrame(() => { logBox.scrollTop = logBox.scrollHeight; });
}

function showFloatingText(wrapperId, text, color, delay = 0) {
    registerTimeout(() => {
        const wrapper = DOM[wrapperId] || document.getElementById(wrapperId); if (!wrapper) return;
        const floatEl = document.createElement("div"); floatEl.className = "floating-text"; floatEl.style.color = color; floatEl.style.textShadow = `0 0 12px ${color}, 0 0 24px #000`; floatEl.textContent = text;
        wrapper.appendChild(floatEl); registerTimeout(() => floatEl.remove(), CONFIG.FLOAT_TEXT_LIFE_MS);
    }, delay);
}

const FLASH_LAYER_CLASSES = ["fx-flash-red", "fx-flash-cyan", "fx-flash-gold", "fx-flash-purple"];
const VFX_STAGE_MODES = ["vfx-mode-attack", "vfx-mode-overload", "vfx-mode-energy", "vfx-mode-quantum"];

function triggerScreenEffect(flashClass, shake = false) {
    const flashLayer = DOM["fx-flash-layer"]; const container = DOM["game-container"];
    if (flashLayer && flashClass) { flashLayer.classList.remove(...FLASH_LAYER_CLASSES); void flashLayer.offsetWidth; flashLayer.classList.add(flashClass); }
    if (container && shake) { container.classList.remove("shake-screen"); void container.offsetWidth; container.classList.add("shake-screen"); }
}

function triggerSciFiVFX(modeKey, targetWrapperId, waveColor) {
    const stage = DOM["scifi-vfx-stage"]; const flare = DOM["arena-flare"];
    if (flare && modeKey !== "attack") { flare.classList.remove("flare-active"); void flare.offsetWidth; flare.classList.add("flare-active"); }
    if (stage) {
        stage.classList.remove(...VFX_STAGE_MODES); void stage.offsetWidth; stage.classList.add(`vfx-mode-${modeKey}`);
        if (vfxCleanupTimer) clearTimeout(vfxCleanupTimer);
        vfxCleanupTimer = setTimeout(() => { stage.classList.remove(...VFX_STAGE_MODES); }, CONFIG.VFX_DURATION_MS);
    }
    if (targetWrapperId) ParticleEngine.spawnElementWave(targetWrapperId, waveColor); else ParticleEngine.spawnElementWave("battle-arena", waveColor);
}

function setActionIcon(side, iconKey, className = "action-icon") {
    const iconEl = DOM[`${side}-action`]; const useEl = DOM[`${side}-action-use`];
    if (useEl) useEl.setAttribute("href", `#icon-${iconKey}`); if (iconEl) iconEl.className = className;
}

function resetArena() {
    setActionIcon("p", "mystery", "action-icon"); setActionIcon("c", "mystery", "action-icon");
    if (DOM["p-aura"]) DOM["p-aura"].className = "aura-ring"; if (DOM["c-aura"]) DOM["c-aura"].className = "aura-ring";
    if (DOM["scifi-vfx-stage"]) DOM["scifi-vfx-stage"].classList.remove(...VFX_STAGE_MODES);
    if (DOM["arena-flare"]) DOM["arena-flare"].classList.remove("flare-active");
    if (DOM["fx-flash-layer"]) DOM["fx-flash-layer"].classList.remove(...FLASH_LAYER_CLASSES);
    if (DOM["game-container"]) DOM["game-container"].classList.remove("shake-screen");
    document.querySelectorAll(".floating-text").forEach(el => el.remove());
}

let isCharListRendered = false; let isPrefixListRendered = false;
function renderCharSelection() {
    gameState.tempSelectedCharId = null; if (DOM["btn-next-char"]) DOM["btn-next-char"].disabled = true;
    const cl = DOM["char-list"]; if (!cl) return;
    if (isCharListRendered) { cl.querySelectorAll(".card.selected").forEach(x => x.classList.remove("selected")); return; }
    const frag = document.createDocumentFragment(); let idx = 0;
    for (const id in CHARACTER_DB) {
        const c = CHARACTER_DB[id]; const div = document.createElement("div"); div.className = "card card-interactive"; div.id = `char-card-${id}`; div.setAttribute("data-char-id", id); div.setAttribute("role", "option"); div.style.animationDelay = `${Math.min(idx * 10, 300)}ms`;
        div.innerHTML = `<span class="role-type-badge ${c.roleClass}"><span class="role-dot"></span>${c.roleLabel}</span><h4><span>${escapeHtml(c.name)}</span><span class="inline-tag-group">${buildInlineIconHtml(c.iconKey)}</span></h4><div class="stat-bars"><div class="stat-seg-crit" style="width:${(c.crit / CONFIG.MAX_STAT_VALUE) * 100}%"></div><div class="stat-seg-shield" style="width:${(c.shield / CONFIG.MAX_STAT_VALUE) * 100}%"></div><div class="stat-seg-magic" style="width:${(c.magic / CONFIG.MAX_STAT_VALUE) * 100}%"></div></div><div class="stat-tags"><span class="tag-crit">超載:${c.crit}%</span><span class="tag-shield">能量:${c.shield}%</span><span class="tag-magic">量子:${c.magic}%</span></div><p>${escapeHtml(c.desc)}</p>`;
        frag.appendChild(div); idx++;
    }
    cl.appendChild(frag); isCharListRendered = true;
}

function renderPrefixSelection() {
    gameState.tempSelectedPrefixIndex = null; if (DOM["btn-next-prefix"]) DOM["btn-next-prefix"].disabled = true;
    const pl = DOM["equip-prefix-list"]; if (!pl) return;
    if (isPrefixListRendered) { pl.querySelectorAll(".card.selected").forEach(x => x.classList.remove("selected")); return; }
    const frag = document.createDocumentFragment();
    PREFIX_EFFECTS.forEach((p, i) => {
        const div = document.createElement("div"); div.className = "card card-interactive"; div.id = `prefix-card-${i}`; div.setAttribute("data-prefix-idx", i); div.setAttribute("role", "option"); div.style.animationDelay = `${i * 15}ms`;
        div.innerHTML = `<h4><span>${escapeHtml(p[0])} 核心系列</span><span class="inline-tag-group">${buildInlineIconHtml(p[3])}</span></h4><p class="eq-pos-line">${escapeHtml(p[1])}</p>`;
        frag.appendChild(div);
    });
    pl.appendChild(frag); isPrefixListRendered = true;
}

function renderEquipDetailSelection(prefixIndex) {
    const prefixInfo = PREFIX_EFFECTS[prefixIndex]; gameState.tempSelectedEquipId = null; if (DOM["btn-next-equip"]) DOM["btn-next-equip"].disabled = true;
    setHeaderTitle("equip-detail-title", prefixInfo[3], `【${prefixInfo[0]}系列】選擇具體科技武裝`);
    const dl = DOM["equip-detail-list"]; if (!dl) return; dl.innerHTML = "";
    const frag = document.createDocumentFragment(); const startId = prefixIndex * CONFIG.EQUIPS_PER_PREFIX + 1;
    for (let i = startId; i < startId + CONFIG.EQUIPS_PER_PREFIX; i++) {
        const eq = EQUIPMENT_DB[i]; const div = document.createElement("div"); div.className = "card card-interactive"; div.id = `equip-card-${i}`; div.setAttribute("data-equip-id", i); div.setAttribute("role", "option"); div.style.animationDelay = `${(i - startId) * 12}ms`;
        div.innerHTML = `<h4><span>${escapeHtml(eq.name)}</span><span class="inline-tag-group">${buildInlineIconHtml(eq.prefixIconKey)}${buildInlineIconHtml(eq.iconKey)}</span></h4><p><span class="eq-pos-line">${escapeHtml(eq.posText)}</span><span class="eq-neg-line">${escapeHtml(eq.negText)}</span></p>`;
        frag.appendChild(div);
    }
    dl.appendChild(frag);
}

function cleanupFirebaseListeners() { if (db && gameState.roomCode) { const roomRef = db.ref("rooms/" + gameState.roomCode); roomRef.off(); roomRef.child("status").off(); roomRef.child("choices").off(); roomRef.child("results").off(); } }
function abortOnlineRoomAndLeave() {
    cleanupFirebaseListeners();
    if (db && gameState.roomCode) {
        const roomRef = db.ref("rooms/" + gameState.roomCode);
        if (gameState.isHost) { roomRef.onDisconnect().cancel(); roomRef.remove(); }
        else { roomRef.child("guest").onDisconnect().cancel(); roomRef.child("guestName").onDisconnect().cancel(); roomRef.child("guest").remove(); roomRef.child("guestName").remove(); }
    }
    gameState.roomCode = null; gameState.isHost = false; gameState.isConnecting = false;
}
function goBack(fromScreen) {
    playSound("click"); clearAllTimers(); gameState.isConnecting = false;
    if (gameState.gameMode === "pvp_online" && gameState.roomCode) { if (fromScreen === "screen-room-waiting" || fromScreen === "screen-guest-waiting" || fromScreen === "screen-custom" || fromScreen === "screen-char") { abortOnlineRoomAndLeave(); showScreen("screen-online-lobby"); playBGM("lobby"); return; } }
    playBGM("lobby");
    switch (fromScreen) { case "screen-mode-type": showScreen("screen-name"); break; case "screen-online-lobby": showScreen("screen-mode-type"); break; case "screen-custom": showScreen(gameState.gameMode === "pvp_online" ? "screen-online-lobby" : "screen-mode-type"); break; case "screen-char": showScreen(gameState.gameMode === "pvp_online" ? "screen-online-lobby" : "screen-custom"); break; case "screen-equip-prefix": showScreen("screen-char"); break; case "screen-equip-detail": showScreen("screen-equip-prefix"); break; default: showScreen("screen-name"); break; }
}
function submitName() { playSound("click"); const val = DOM["player-name"] ? DOM["player-name"].value.trim() : ""; gameState.playerName = val || "未知指揮官"; playBGM("lobby"); showScreen("screen-mode-type"); }
function syncCustomSwitchUI() { ["hasChar", "hasEquip", "isStrong"].forEach(key => { const track = DOM[`switch-${key}`] || document.getElementById(`switch-${key}`); if (track && track.parentElement) { const isActive = !!gameState.customConfig[key]; track.parentElement.classList.toggle("active", isActive); track.parentElement.setAttribute("aria-checked", String(isActive)); } }); }
function setGameMode(mode) { playSound("click"); gameState.gameMode = mode; if (DOM["pve-settings-container"]) DOM["pve-settings-container"].style.display = mode === "pve" ? "flex" : "none"; syncCustomSwitchUI(); if (mode === "pvp_online") showScreen("screen-online-lobby"); else { setHeaderTitle("custom-setting-title", "sliders", "自訂對局參數"); showScreen("screen-custom"); } }

function createOnlineRoom() {
    if (gameState.isConnecting) return;
    if (!db) return showToast("Firebase 雲端模組尚未載入！");
    playSound("click"); abortOnlineRoomAndLeave();
    gameState.isConnecting = true;
    const timeoutId = registerTimeout(() => { gameState.isConnecting = false; showToast("連線逾時！請確認網路或 Firebase 讀寫權限。"); }, CONFIG.NETWORK_TIMEOUT_MS);
    gameState.isHost = true; gameState.roomCode = Math.floor(CONFIG.ROOM_CODE_MIN + Math.random() * CONFIG.ROOM_CODE_RANGE).toString(); DOM["display-room-code"].textContent = gameState.roomCode; DOM["room-status-text"].textContent = "艙號已生成，等待挑戰者接入..."; DOM["btn-start-room-game"].style.display = "none";
    const roomRef = db.ref("rooms/" + gameState.roomCode); roomRef.onDisconnect().remove();
    roomRef.set({ hostName: gameState.playerName, status: "waiting", targetWins: CONFIG.DEFAULT_WINS }).then(() => { clearTimeout(timeoutId); activeTimeouts.delete(timeoutId); gameState.isConnecting = false; }).catch(err => { clearTimeout(timeoutId); activeTimeouts.delete(timeoutId); gameState.isConnecting = false; showToast("建立戰術艙失敗: " + err.message); });
    roomRef.on("value", snap => { const data = snap.val(); if (data && data.guestName && data.status === "waiting") { gameState.opponentName = data.guestName; DOM["room-status-text"].textContent = `指揮官【${data.guestName}】已接入戰術艙！`; DOM["btn-start-room-game"].style.display = "inline-flex"; } else if (data && !data.guestName && data.status === "waiting") { DOM["room-status-text"].textContent = "艙號已生成，等待挑戰者接入..."; DOM["btn-start-room-game"].style.display = "none"; } });
    showScreen("screen-room-waiting");
}

function joinOnlineRoom() {
    if (gameState.isConnecting) return;
    if (!db) return showToast("Firebase 雲端模組尚未載入！");
    playSound("click"); const code = DOM["room-code-input"] ? DOM["room-code-input"].value.trim() : ""; if (code.length !== CONFIG.ROOM_CODE_LEN) return showToast("請輸入完整的 4 碼戰術艙號！");
    abortOnlineRoomAndLeave();
    gameState.isConnecting = true;
    const timeoutId = registerTimeout(() => { gameState.isConnecting = false; showToast("連線逾時！請確認艙號是否正確。"); }, CONFIG.NETWORK_TIMEOUT_MS);
    gameState.isHost = false; gameState.roomCode = code; const roomRef = db.ref("rooms/" + code);
    roomRef.once("value").then(snap => {
        clearTimeout(timeoutId); activeTimeouts.delete(timeoutId); gameState.isConnecting = false; const data = snap.val();
        if (!data) return showToast("找不到此戰術艙，請確認艙號是否正確！"); if (data.status !== "waiting" || data.guestName) return showToast("此戰術艙已經開始對決或人數已滿！");
        gameState.opponentName = data.hostName; roomRef.child("guestName").onDisconnect().remove(); roomRef.child("guest").onDisconnect().remove(); roomRef.update({ guestName: gameState.playerName });
        DOM["display-room-code"].textContent = code; DOM["room-status-text"].textContent = `成功接入【${data.hostName}】的戰術艙！等待設定局數...`; DOM["btn-start-room-game"].style.display = "none"; showScreen("screen-room-waiting");
        roomRef.on("value", roomSnap => { const rData = roomSnap.val(); if (!rData) { cleanupFirebaseListeners(); showToast("艙主已關閉戰術艙！"); gameState.roomCode = null; showScreen("screen-online-lobby"); return; } if (rData.status === "selecting") { gameState.targetWins = rData.targetWins || CONFIG.DEFAULT_WINS; roomRef.off("value"); setHeaderTitle("char-screen-title", "shield", `選擇戰術職業 (${gameState.playerName})`); renderCharSelection(); showScreen("screen-char"); } });
    }).catch(err => { clearTimeout(timeoutId); activeTimeouts.delete(timeoutId); gameState.isConnecting = false; showToast("連線失敗: " + err.message); });
}

function hostStartGame() { playSound("click"); if (db && gameState.roomCode) db.ref("rooms/" + gameState.roomCode).off("value"); setHeaderTitle("custom-setting-title", "sliders", "戰術艙局數設定"); if (DOM["pve-settings-container"]) DOM["pve-settings-container"].style.display = "none"; showScreen("screen-custom"); }
function toggleSwitch(key) { playSound("click"); gameState.customConfig[key] = !gameState.customConfig[key]; syncCustomSwitchUI(); }
function confirmCustomMatch() {
    playSound("click"); const winInput = DOM["custom-target-wins"]; let wins = parseInt(winInput.value, 10); const errTip = DOM["win-error-msg"];
    if (isNaN(wins) || wins < CONFIG.MIN_WINS) { wins = CONFIG.MIN_WINS; winInput.value = CONFIG.MIN_WINS; errTip.textContent = `已校正為最低 ${CONFIG.MIN_WINS} 勝`; } else if (wins > CONFIG.MAX_WINS) { wins = CONFIG.MAX_WINS; winInput.value = CONFIG.MAX_WINS; errTip.textContent = `已校正為最高 ${CONFIG.MAX_WINS} 勝`; } else { errTip.textContent = ""; }
    gameState.targetWins = wins; if (gameState.gameMode === "pvp_online" && gameState.isHost && db) { db.ref("rooms/" + gameState.roomCode).update({ targetWins: wins, status: "selecting" }); }
    setHeaderTitle("char-screen-title", "shield", `選擇戰術職業 (${gameState.playerName})`); renderCharSelection(); showScreen("screen-char");
}
function confirmCharSelection() { if (!gameState.tempSelectedCharId) return; playSound("click"); gameState.playerChar = CHARACTER_DB[gameState.tempSelectedCharId]; renderPrefixSelection(); showScreen("screen-equip-prefix"); }
function confirmPrefixSelection() { if (gameState.tempSelectedPrefixIndex === null) return; playSound("click"); renderEquipDetailSelection(gameState.tempSelectedPrefixIndex); showScreen("screen-equip-detail"); }
function proceedAfterSetup() {
    if (!gameState.tempSelectedEquipId) return; playSound("click"); gameState.playerEq = EQUIPMENT_DB[gameState.tempSelectedEquipId];
    if (gameState.gameMode === "pvp_online" && db) {
        const role = gameState.isHost ? "host" : "guest"; const roomRef = db.ref("rooms/" + gameState.roomCode);
        roomRef.child(role).set({ name: gameState.playerName, charId: gameState.playerChar.id, eqId: gameState.playerEq.id, char: gameState.playerChar, eq: gameState.playerEq });
        showScreen("screen-guest-waiting");
        roomRef.on("value", snap => {
            const data = snap.val(); if (!data || (gameState.isHost && !data.guestName)) { abortOnlineRoomAndLeave(); showToast("對手已離開戰術艙！"); showScreen("screen-online-lobby"); return; }
            if (data.host && data.guest && data.host.char && data.guest.char) { roomRef.off("value"); const oppData = gameState.isHost ? data.guest : data.host; gameState.opponentName = oppData.name; gameState.compChar = (oppData.charId && CHARACTER_DB[oppData.charId]) ? CHARACTER_DB[oppData.charId] : oppData.char; gameState.compEq = (oppData.eqId && EQUIPMENT_DB[oppData.eqId]) ? EQUIPMENT_DB[oppData.eqId] : oppData.eq; startCountdownPhase(); }
        });
    } else { startCountdownPhase(); }
}

function startCountdownPhase() {
    clearAllTimers(); showScreen("screen-countdown"); playBGM("battle");
    const countEl = DOM["countdown-number"]; const ringEl = DOM["countdown-ring"]; const tipEl = DOM["countdown-tip"];
    const triggerCountdownAnim = contentHtml => { countEl.innerHTML = contentHtml; countEl.classList.remove("countdown-pulse"); ringEl.classList.remove("ring-burst"); void countEl.offsetWidth; countEl.classList.add("countdown-pulse"); ringEl.classList.add("ring-burst"); };
    let currentStep = CONFIG.COUNTDOWN_SECONDS; let lastTick = performance.now();
    tipEl.textContent = "準備迎戰！"; triggerCountdownAnim(String(currentStep)); playSound("countdown");
    function stepCountdown(now) {
        if (now - lastTick >= CONFIG.COUNTDOWN_STEP_MS) {
            lastTick = now; currentStep--;
            if (currentStep > 0) { triggerCountdownAnim(String(currentStep)); playSound("countdown"); }
            else if (currentStep === 0) { triggerCountdownAnim(`<svg><use href="#icon-swords"></use></svg>`); tipEl.textContent = "戰術交鋒開始！"; playSound("start"); ParticleEngine.spawnElementWave("countdown-number", CONFIG.COLORS.PRIMARY); }
            else { countdownRafId = null; initBattle(); return; }
        }
        countdownRafId = requestAnimationFrame(stepCountdown);
    }
    countdownRafId = requestAnimationFrame(stepCountdown);
}

function initBattle() {
    clearAllTimers(); gameState.isGameOver = false; gameState.isBusy = false; gameState.isCalculatingRound = false; gameState.pScore = 0; gameState.cScore = 0; gameState.roundNum = 1; gameState.lastProcessedRound = 0; gameState.history = [];
    DOM["pvp-waiting-msg"].style.display = "none"; toggleButtons(true); resetArena();
    if (gameState.gameMode === "pve") {
        gameState.compChar = gameState.customConfig.hasChar ? CHARACTER_DB[Math.floor(Math.random() * CONFIG.TOTAL_CHARS) + 1] : { name: "自律訓練機 (無模組)", crit: 0, shield: 0, magic: 0, iconKey: "cpu" };
        gameState.compEq = gameState.customConfig.hasEquip ? EQUIPMENT_DB[Math.floor(Math.random() * CONFIG.TOTAL_EQUIPS) + 1] : null;
        gameState.opponentName = gameState.compChar.name;
    } else if (gameState.gameMode === "pvp_online") { setupOnlineBattleListeners(); }
    DOM["p-name-display"].textContent = gameState.playerName; DOM["p-class-eq"].innerHTML = `<span class="badge-pill">${buildCharNameWithIcon(gameState.playerChar)}</span><span class="badge-pill">${buildEquipNameWithIcon(gameState.playerEq)}</span>`;
    DOM["c-name-display"].textContent = gameState.opponentName; DOM["c-class-eq"].innerHTML = `<span class="badge-pill">${buildCharNameWithIcon(gameState.compChar)}</span><span class="badge-pill">${buildEquipNameWithIcon(gameState.compEq)}</span>`;
    DOM["target-win-display"].textContent = `目標: ${gameState.targetWins} 勝`;
    updateScoreUI(false, false); DOM["battle-log"].innerHTML = ""; logMsg(`${buildInlineIconHtml("swords")} <span>戰術終端連線完畢！率先取得 <strong>${gameState.targetWins}</strong> 勝者獲勝！</span>`, "var(--primary)"); showScreen("screen-battle");
}

function checkPendingOnlineChoices() {
    if (!db || !gameState.roomCode || !gameState.isHost || gameState.isGameOver || gameState.isCalculatingRound) return;
    db.ref(`rooms/${gameState.roomCode}/choices/${gameState.roundNum}`).once("value").then(snap => {
        if (gameState.isGameOver || gameState.isCalculatingRound) return;
        const curChoices = snap.val();
        if (curChoices && curChoices.host && curChoices.guest) {
            gameState.isCalculatingRound = true;
            computeAndBroadcastOnlineRound(curChoices.host, curChoices.guest, gameState.roundNum);
        }
    }).catch(() => {});
}

function setupOnlineBattleListeners() {
    if (!db) return; const roomRef = db.ref("rooms/" + gameState.roomCode);
    roomRef.on("value", snap => { if (gameState.isGameOver) return; const data = snap.val(); if (!data || (gameState.isHost && !data.guestName)) { gameState.isGameOver = true; clearAllTimers(); abortOnlineRoomAndLeave(); showToast("對手已中斷連線或離開戰術艙！"); showScreen("screen-online-lobby"); playBGM("lobby"); } });
    if (gameState.isHost) { roomRef.child("choices").on("value", snap => { if (gameState.isGameOver || gameState.isCalculatingRound) return; const allChoices = snap.val(); const curChoices = allChoices ? allChoices[gameState.roundNum] : null; if (curChoices && curChoices.host && curChoices.guest) { gameState.isCalculatingRound = true; computeAndBroadcastOnlineRound(curChoices.host, curChoices.guest, gameState.roundNum); } }); }
    roomRef.child("results").on("value", snap => { if (gameState.isGameOver) return; const allResults = snap.val(); if (!allResults) return; const res = allResults[gameState.roundNum]; if (res && res.roundNum > gameState.lastProcessedRound) { gameState.lastProcessedRound = res.roundNum; renderSyncedOnlineRound(res); } });
}

function playRound(pChoice) {
    if (gameState.isGameOver || gameState.isBusy) return; playSound("click");
    if (gameState.gameMode === "pvp_online" && db) {
        gameState.isBusy = true; toggleButtons(false); DOM["pvp-waiting-msg"].style.display = "inline-flex";
        const roleKey = gameState.isHost ? "host" : "guest";
        db.ref(`rooms/${gameState.roomCode}/choices/${gameState.roundNum}/${roleKey}`).set(pChoice);
    } else {
        gameState.isBusy = true; toggleButtons(false);
        const allMoves = ["剪刀", "石頭", "布"];
        let cChoice = allMoves[Math.floor(Math.random() * 3)];
        if (gameState.customConfig.isStrong && gameState.history.length >= 2) {
            const counts = { "剪刀": 0, "石頭": 0, "布": 0 };
            gameState.history.slice(-CONFIG.AI_HISTORY_WINDOW).forEach(m => counts[m]++);
            const maxCount = Math.max(counts["剪刀"], counts["石頭"], counts["布"]);
            const topMoves = allMoves.filter(m => counts[m] === maxCount);
            const predictedPlayerMove = topMoves[Math.floor(Math.random() * topMoves.length)];
            cChoice = COUNTER_WIN[predictedPlayerMove];
        }
        gameState.history.push(pChoice);
        executePvERound(pChoice, cChoice);
    }
}

function calculateCoreRoundOutcome(p1Choice, p2Choice, p1Char, p2Char) {
    const isTie = p1Choice === p2Choice; const p1Win = (p1Choice === "剪刀" && p2Choice === "布") || (p1Choice === "石頭" && p2Choice === "剪刀") || (p1Choice === "布" && p2Choice === "石頭"); const p2Win = !isTie && !p1Win;
    let p1Delta = 0, p2Delta = 0; let roundBlocked = false; let effectType = "none"; let dmgVal = 0;
    if (isTie) {
        const p1Quantum = Math.random() * 100 < p1Char.magic; const p2Quantum = Math.random() * 100 < p2Char.magic;
        if (p1Quantum && !p2Quantum) { p1Delta = 1; effectType = "magic_p1"; dmgVal = 1; } else if (p2Quantum && !p1Quantum) { p2Delta = 1; effectType = "magic_p2"; dmgVal = 1; } else if (p1Quantum && p2Quantum) { effectType = "magic_clash"; }
    } else if (p1Win) {
        const isOverload = Math.random() * 100 < p1Char.crit; const isEnergy = Math.random() * 100 < p2Char.shield; const finalDmg = (isOverload ? 2 : 1) - (isEnergy ? 1 : 0);
        if (finalDmg > 0) { p1Delta = finalDmg; dmgVal = finalDmg; effectType = isOverload ? "crit" : "attack"; } else { roundBlocked = true; effectType = "shield"; }
    } else {
        const isOverload = Math.random() * 100 < p2Char.crit; const isEnergy = Math.random() * 100 < p1Char.shield; const finalDmg = (isOverload ? 2 : 1) - (isEnergy ? 1 : 0);
        if (finalDmg > 0) { p2Delta = finalDmg; dmgVal = finalDmg; effectType = isOverload ? "crit" : "attack"; } else { roundBlocked = true; effectType = "shield"; }
    }
    return { isTie, p1Win, p2Win, p1Delta, p2Delta, roundBlocked, effectType, dmgVal };
}

function evaluateGearPure(eq, ctx, ownerTag) {
    let act = 0, opp = 0, logs = []; if (!eq) return { act, opp, logs };
    const eqIcons = `${buildInlineIconHtml(eq.prefixIconKey)}${buildInlineIconHtml(eq.iconKey)}`; const safeOwner = escapeHtml(ownerTag); const safeEqName = escapeHtml(eq.name);
    [eq.pos, eq.neg].forEach(code => { if (EFFECT_HANDLERS[code]) { const res = EFFECT_HANDLERS[code](ctx); if (res) { act += res[0]; opp += res[1]; logs.push(`${eqIcons} <span>[武裝] ${safeOwner}的【${safeEqName}】: ${res[2]}</span>`); } } });
    return { act, opp, logs };
}

function presentRoundVisuals(params) {
    const { rNum, myChoice, opChoice, isTie, myWin, effectType, myMagic, opMagic, dmgVal, gearLogs, myGearNet, opGearNet, newPScore, newCScore } = params;
    setActionIcon("p", CHOICE_SVG_KEYS[myChoice], "action-icon pop-left"); setActionIcon("c", CHOICE_SVG_KEYS[opChoice], "action-icon pop-right");
    const pIcon = DOM["p-action"]; const cIcon = DOM["c-action"]; const pAura = DOM["p-aura"]; const cAura = DOM["c-aura"];
    const safePName = escapeHtml(gameState.playerName); const safeOName = escapeHtml(gameState.opponentName);

    logMsg(`--- 第 ${rNum} 回合 ---`, "var(--text)"); logMsg(`${buildInlineIconHtml(CHOICE_SVG_KEYS[myChoice])} <span>${safePName}出: <strong>${myChoice}</strong> ｜</span> ${buildInlineIconHtml(CHOICE_SVG_KEYS[opChoice])} <span>${safeOName}出: <strong>${opChoice}</strong></span>`);

    if (isTie) {
        logMsg(`${buildInlineIconHtml("handshake")} <span>戰術指令平手！</span>`, "var(--text)");
        pIcon.classList.add("icon-tie"); cIcon.classList.add("icon-tie");
        if (effectType === "magic_clash") { logMsg(`${buildInlineIconHtml("staff")} <span>雙方同時觸發【量子脈衝】，高維電弧互相抵銷！</span>`, "var(--secondary)"); playSound("magic"); pIcon.classList.add("icon-magic"); cIcon.classList.add("icon-magic"); pAura.classList.add("aura-magic"); cAura.classList.add("aura-magic"); triggerScreenEffect("fx-flash-purple", false); triggerSciFiVFX("quantum", null, CONFIG.COLORS.SECONDARY); }
        else if (myMagic) { logMsg(`${buildInlineIconHtml("staff")} <span>${safePName}【量子觸發】，高壓量子閃電逆轉奪取 1 分！</span>`, "var(--secondary)"); playSound("magic"); pIcon.classList.add("icon-magic"); pAura.classList.add("aura-magic"); triggerScreenEffect("fx-flash-purple", false); triggerSciFiVFX("quantum", "p-wrapper", CONFIG.COLORS.SECONDARY); showFloatingText("p-wrapper", "QUANTUM +1", "var(--secondary)"); }
        else if (opMagic) { logMsg(`${buildInlineIconHtml("staff")} <span>${safeOName}【量子觸發】，高壓量子閃電逆轉奪取 1 分！</span>`, "var(--danger)"); playSound("magic"); cIcon.classList.add("icon-magic"); cAura.classList.add("aura-magic"); triggerScreenEffect("fx-flash-purple", false); triggerSciFiVFX("quantum", "c-wrapper", CONFIG.COLORS.SECONDARY); showFloatingText("c-wrapper", "QUANTUM +1", "var(--danger)"); }
        else { playSound("tie"); }
    } else if (myWin) {
        if (effectType === "crit") { logMsg(`${buildInlineIconHtml("bolt")} <span>獲勝！【超載觸發】系統輸出突破限制 (+${dmgVal}分)</span>`, "var(--gold)"); playSound("critical"); pIcon.classList.add("icon-crit"); cIcon.classList.add("icon-shake"); pAura.classList.add("aura-crit"); triggerScreenEffect("fx-flash-gold", true); triggerSciFiVFX("overload", "c-wrapper", CONFIG.COLORS.GOLD); showFloatingText("p-wrapper", `OVERLOAD +${dmgVal}`, "var(--gold)"); }
        else if (effectType === "attack") { logMsg(`<span>獲勝！【常規打擊】命中目標 (+${dmgVal}分)</span>`, "var(--primary)"); playSound("attack"); pIcon.classList.add("icon-attack"); cIcon.classList.add("icon-shake"); pAura.classList.add("aura-attack"); triggerScreenEffect("fx-flash-red", false); triggerSciFiVFX("attack", "c-wrapper", CONFIG.COLORS.DANGER); showFloatingText("p-wrapper", `+${dmgVal}`, "var(--primary)"); }
        else if (effectType === "shield") { logMsg(`${buildInlineIconHtml("shield")} <span>攻擊被對手【能量護盾】六角力場完全偏折！</span>`, "var(--primary)"); playSound("shield"); cIcon.classList.add("icon-shield"); pIcon.classList.add("icon-shake"); cAura.classList.add("aura-shield"); triggerScreenEffect("fx-flash-cyan", false); triggerSciFiVFX("energy", "c-wrapper", CONFIG.COLORS.PRIMARY); showFloatingText("c-wrapper", "ENERGY SHIELD", "var(--primary)"); }
    } else {
        if (effectType === "crit") { logMsg(`${buildInlineIconHtml("bolt")} <span>敗北！${safeOName}【超載觸發】系統突破限制 (對手+${dmgVal}分)</span>`, "var(--gold)"); playSound("critical"); cIcon.classList.add("icon-crit"); pIcon.classList.add("icon-shake"); cAura.classList.add("aura-crit"); triggerScreenEffect("fx-flash-gold", true); triggerSciFiVFX("overload", "p-wrapper", CONFIG.COLORS.GOLD); showFloatingText("c-wrapper", `OVERLOAD +${dmgVal}`, "var(--gold)"); }
        else if (effectType === "attack") { logMsg(`<span>敗北！${safeOName}【常規打擊】命中 (對手+${dmgVal}分)</span>`, "var(--danger)"); playSound("attack"); cIcon.classList.add("icon-attack"); pIcon.classList.add("icon-shake"); cAura.classList.add("aura-attack"); triggerScreenEffect("fx-flash-red", false); triggerSciFiVFX("attack", "p-wrapper", CONFIG.COLORS.DANGER); showFloatingText("c-wrapper", `+${dmgVal}`, "var(--danger)"); }
        else if (effectType === "shield") { logMsg(`${buildInlineIconHtml("shield")} <span>成功展開【能量護盾】六角力場偏折對手攻擊！</span>`, "var(--primary)"); playSound("shield"); pIcon.classList.add("icon-shield"); cIcon.classList.add("icon-shake"); pAura.classList.add("aura-shield"); triggerScreenEffect("fx-flash-cyan", false); triggerSciFiVFX("energy", "p-wrapper", CONFIG.COLORS.PRIMARY); showFloatingText("p-wrapper", "ENERGY SHIELD", "var(--primary)"); }
    }

    gearLogs.forEach(msg => logMsg(msg, "var(--gold)"));
    if (myGearNet !== 0) showFloatingText("p-wrapper", `MODULE ${myGearNet > 0 ? "+" + myGearNet : myGearNet}`, myGearNet > 0 ? "var(--gold)" : "var(--danger)", CONFIG.EQUIP_FLOAT_DELAY_MS);
    if (opGearNet !== 0) showFloatingText("c-wrapper", `MODULE ${opGearNet > 0 ? "+" + opGearNet : opGearNet}`, opGearNet > 0 ? "var(--gold)" : "var(--danger)", CONFIG.EQUIP_FLOAT_DELAY_MS);

    const pChanged = newPScore !== gameState.pScore; const cChanged = newCScore !== gameState.cScore;
    gameState.pScore = newPScore; gameState.cScore = newCScore; updateScoreUI(pChanged, cChanged); gameState.roundNum = rNum + 1;
    if (gameState.pScore >= gameState.targetWins || gameState.cScore >= gameState.targetWins) { gameState.isGameOver = true; toggleButtons(false); registerTimeout(endGame, CONFIG.GAME_END_DELAY_MS); }
    else { registerTimeout(() => { resetArena(); gameState.isBusy = false; gameState.isCalculatingRound = false; toggleButtons(true); checkPendingOnlineChoices(); }, CONFIG.ROUND_RESET_DELAY_MS); }
}

function computeAndBroadcastOnlineRound(hostChoice, guestChoice, rNum) {
    const core = calculateCoreRoundOutcome(hostChoice, guestChoice, gameState.playerChar, gameState.compChar);
    const isStart = rNum === 1; const ctxH = { is_tie: core.isTie, win: core.p1Win, loss: core.p2Win, blocked: core.roundBlocked, is_start: isStart }; const ctxG = { is_tie: core.isTie, win: core.p2Win, loss: core.p1Win, blocked: core.roundBlocked, is_start: isStart };
    const hGear = evaluateGearPure(gameState.playerEq, ctxH, gameState.playerName); const gGear = evaluateGearPure(gameState.compEq, ctxG, gameState.opponentName);
    const hostNetGear = hGear.act + gGear.opp; const guestNetGear = gGear.act + hGear.opp;
    const newHostScore = Math.max(0, gameState.pScore + core.p1Delta + hostNetGear); const newGuestScore = Math.max(0, gameState.cScore + core.p2Delta + guestNetGear);
    db.ref(`rooms/${gameState.roomCode}/results/${rNum}`).set({ roundNum: rNum, hostChoice, guestChoice, isTie: core.isTie, hWin: core.p1Win, effectType: core.effectType, dmgVal: core.dmgVal, hGearLogs: hGear.logs, gGearLogs: gGear.logs, hostScore: newHostScore, guestScore: newGuestScore, hostGearNet: hostNetGear, guestGearNet: guestNetGear });
}

function renderSyncedOnlineRound(res) {
    DOM["pvp-waiting-msg"].style.display = "none";
    const myChoice = gameState.isHost ? res.hostChoice : res.guestChoice; const opChoice = gameState.isHost ? res.guestChoice : res.hostChoice;
    const myWin = (gameState.isHost && res.hWin) || (!gameState.isHost && !res.hWin && !res.isTie);
    const myMagic = (gameState.isHost && res.effectType === "magic_p1") || (!gameState.isHost && res.effectType === "magic_p2");
    const opMagic = (gameState.isHost && res.effectType === "magic_p2") || (!gameState.isHost && res.effectType === "magic_p1");
    presentRoundVisuals({ rNum: res.roundNum, myChoice, opChoice, isTie: res.isTie, myWin, effectType: res.effectType, myMagic, opMagic, dmgVal: res.dmgVal, gearLogs: [...(res.hGearLogs || []), ...(res.gGearLogs || [])], myGearNet: gameState.isHost ? (res.hostGearNet || 0) : (res.guestGearNet || 0), opGearNet: gameState.isHost ? (res.guestGearNet || 0) : (res.hostGearNet || 0), newPScore: gameState.isHost ? res.hostScore : res.guestScore, newCScore: gameState.isHost ? res.guestScore : res.hostScore });
}

function executePvERound(pChoice, cChoice) {
    const rNum = gameState.roundNum;
    const core = calculateCoreRoundOutcome(pChoice, cChoice, gameState.playerChar, gameState.compChar);
    const isStart = rNum === 1; const ctxP = { is_tie: core.isTie, win: core.p1Win, loss: core.p2Win, blocked: core.roundBlocked, is_start: isStart }; const ctxC = { is_tie: core.isTie, win: core.p2Win, loss: core.p1Win, blocked: core.roundBlocked, is_start: isStart };
    const pGear = evaluateGearPure(gameState.playerEq, ctxP, gameState.playerName); const cGear = evaluateGearPure(gameState.compEq, ctxC, gameState.opponentName);
    const pGearNet = pGear.act + cGear.opp; const cGearNet = cGear.act + pGear.opp;
    presentRoundVisuals({ rNum, myChoice: pChoice, opChoice: cChoice, isTie: core.isTie, myWin: core.p1Win, effectType: core.effectType, myMagic: core.effectType === "magic_p1", opMagic: core.effectType === "magic_p2", dmgVal: core.dmgVal, gearLogs: [...pGear.logs, ...cGear.logs], myGearNet: pGearNet, opGearNet: cGearNet, newPScore: Math.max(0, gameState.pScore + core.p1Delta + pGearNet), newCScore: Math.max(0, gameState.cScore + core.p2Delta + cGearNet) });
}

function updateScoreUI(pBump = false, cBump = false) {
    const pScoreEl = DOM["p-score"]; const cScoreEl = DOM["c-score"];
    if (pScoreEl) { pScoreEl.textContent = gameState.pScore; if (pBump) { pScoreEl.classList.remove("score-bump"); void pScoreEl.offsetWidth; pScoreEl.classList.add("score-bump"); } }
    if (cScoreEl) { cScoreEl.textContent = gameState.cScore; if (cBump) { cScoreEl.classList.remove("score-bump"); void cScoreEl.offsetWidth; cScoreEl.classList.add("score-bump"); } }
    const pPct = Math.min(100, Math.round((gameState.pScore / gameState.targetWins) * 100)); const cPct = Math.min(100, Math.round((gameState.cScore / gameState.targetWins) * 100));
    if (DOM["p-progress-bar"]) DOM["p-progress-bar"].style.width = `${pPct}%`; if (DOM["c-progress-bar"]) DOM["c-progress-bar"].style.width = `${cPct}%`;
}

function endGame() {
    const resultScreen = document.getElementById("screen-result"); if (resultScreen && resultScreen.classList.contains("active")) return;
    let title = "", desc = "", iconKey = "", resultClass = ""; let waveColor = CONFIG.COLORS.PRIMARY;
    if (gameState.pScore >= gameState.targetWins && gameState.cScore >= gameState.targetWins) { title = "戰術演算平手！"; desc = `雙方同時達成 ${gameState.targetWins} 勝，戰力完全對等！`; iconKey = "swords"; resultClass = "result-icon-box result-tie"; waveColor = CONFIG.COLORS.SECONDARY; playSound("win"); }
    else if (gameState.pScore >= gameState.targetWins) { title = "最終戰術勝利！"; desc = `恭喜指揮官【${gameState.playerName}】率先達成 ${gameState.targetWins} 勝！`; iconKey = "trophy"; resultClass = "result-icon-box result-win"; waveColor = CONFIG.COLORS.GOLD; playSound("win"); }
    else { title = "戰術行動失敗..."; desc = `【${gameState.opponentName}】率先達成 ${gameState.targetWins} 勝！`; iconKey = "defeatSkull"; resultClass = "result-icon-box result-lose"; waveColor = CONFIG.COLORS.DANGER; playSound("lose"); }
    if (DOM["result-icon-use"]) DOM["result-icon-use"].setAttribute("href", `#icon-${iconKey}`); if (DOM["result-icon-box"]) DOM["result-icon-box"].className = resultClass;
    if (DOM["result-title"]) DOM["result-title"].textContent = title; if (DOM["result-desc"]) DOM["result-desc"].textContent = desc;
    cleanupFirebaseListeners(); showScreen("screen-result"); ParticleEngine.spawnShockwave(window.innerWidth / 2, window.innerHeight / 3, waveColor);
}

function resetGame() {
    playSound("click"); clearAllTimers(); abortOnlineRoomAndLeave();
    gameState = { gameMode: "pve", playerName: gameState.playerName, opponentName: "戰術 AI", targetWins: CONFIG.DEFAULT_WINS, customConfig: gameState.customConfig, tempSelectedCharId: null, tempSelectedPrefixIndex: null, tempSelectedEquipId: null, playerChar: null, playerEq: null, compChar: null, compEq: null, pScore: 0, cScore: 0, roundNum: 1, lastProcessedRound: 0, isCalculatingRound: false, history: [], roomCode: null, isHost: false, isGameOver: false, isBusy: false, isConnecting: false };
    syncCustomSwitchUI(); toggleButtons(true); if (DOM["battle-log"]) DOM["battle-log"].innerHTML = ""; resetArena(); showScreen("screen-mode-type");
    AudioManager.stopAllBGM();
    playBGM("lobby");
}

function handleActionDispatch(actionEl) {
    const action = actionEl.getAttribute("data-action");
    switch (action) {
        case "submit-name": submitName(); break;
        case "go-back": goBack(actionEl.getAttribute("data-from")); break;
        case "set-mode": setGameMode(actionEl.getAttribute("data-mode")); break;
        case "create-room": createOnlineRoom(); break;
        case "join-room": joinOnlineRoom(); break;
        case "host-start-game": hostStartGame(); break;
        case "toggle-switch": toggleSwitch(actionEl.getAttribute("data-switch")); break;
        case "confirm-custom": confirmCustomMatch(); break;
        case "confirm-char": confirmCharSelection(); break;
        case "confirm-prefix": confirmPrefixSelection(); break;
        case "confirm-equip": proceedAfterSetup(); break;
        case "play-round": playRound(actionEl.getAttribute("data-choice")); break;
        case "reset-game": resetGame(); break;
    }
}

function bindGlobalEvents() {
    const container = DOM["game-container"] || document;
    container.addEventListener("click", e => {
        const actionEl = e.target.closest("[data-action]");
        if (actionEl) { if (actionEl.disabled) return; handleActionDispatch(actionEl); return; }
        const charCard = e.target.closest(".card[data-char-id]");
        if (charCard && DOM["char-list"]) { playSound("click"); gameState.tempSelectedCharId = charCard.getAttribute("data-char-id"); DOM["char-list"].querySelectorAll(".card.selected").forEach(x => x.classList.remove("selected")); charCard.classList.add("selected"); DOM["btn-next-char"].disabled = false; return; }
        const prefixCard = e.target.closest(".card[data-prefix-idx]");
        if (prefixCard && DOM["equip-prefix-list"]) { playSound("click"); gameState.tempSelectedPrefixIndex = parseInt(prefixCard.getAttribute("data-prefix-idx"), 10); DOM["equip-prefix-list"].querySelectorAll(".card.selected").forEach(x => x.classList.remove("selected")); prefixCard.classList.add("selected"); DOM["btn-next-prefix"].disabled = false; return; }
        const equipCard = e.target.closest(".card[data-equip-id]");
        if (equipCard && DOM["equip-detail-list"]) { playSound("click"); gameState.tempSelectedEquipId = parseInt(equipCard.getAttribute("data-equip-id"), 10); DOM["equip-detail-list"].querySelectorAll(".card.selected").forEach(x => x.classList.remove("selected")); equipCard.classList.add("selected"); DOM["btn-next-equip"].disabled = false; }
    });
    container.addEventListener("keydown", e => {
        if (e.key === "Enter" && e.target.id === "player-name") { e.preventDefault(); submitName(); return; }
        if (e.key === "Enter" && e.target.id === "room-code-input") { e.preventDefault(); joinOnlineRoom(); return; }
        if ((e.key === "Enter" || e.key === " ") && e.target.matches('[role="switch"][data-action="toggle-switch"]')) { e.preventDefault(); toggleSwitch(e.target.getAttribute("data-switch")); }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cacheDomElements(); buildSvgSprite(); bindGlobalEvents(); ParticleEngine.init();
});