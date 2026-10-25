"use strict";
const SVG_LIB_DEFINITIONS = Object.freeze({
    scissors: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-vb="64"><circle cx="18" cy="46" r="9" stroke-width="4" fill="currentColor" fill-opacity="0.15"/><circle cx="46" cy="46" r="9" stroke-width="4" fill="currentColor" fill-opacity="0.15"/><path d="M25 39 L32 30 L52 10 C50 18 44 26 32 30 Z" fill="currentColor" fill-opacity="0.32" stroke-width="3"/><line x1="25" y1="39" x2="52" y2="10" stroke-width="4"/><path d="M39 39 L32 30 L12 10 C14 18 20 26 32 30 Z" fill="currentColor" fill-opacity="0.32" stroke-width="3"/><line x1="39" y1="39" x2="12" y2="10" stroke-width="4"/><circle cx="32" cy="30" r="3" fill="currentColor"/></g>`,
    rock: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-vb="64"><polygon points="12,38 8,24 22,12 44,10 54,22 56,38 46,52 20,52" fill="currentColor" fill-opacity="0.22" stroke-width="4"/><polyline points="22,12 28,26 12,38" stroke-width="2.8"/><polyline points="44,10 38,24 54,22" stroke-width="2.8"/><polyline points="28,26 38,24" stroke-width="2.8"/><polyline points="28,26 34,42 20,52" stroke-width="2.8"/><polyline points="38,24 46,38 56,38" stroke-width="2.8"/><polyline points="34,42 46,38 46,52" stroke-width="2.8"/><polygon points="22,12 44,10 38,24 28,26" fill="currentColor" fill-opacity="0.38"/><polygon points="34,42 46,38 46,52 20,52" fill="currentColor" fill-opacity="0.48"/></g>`,
    paper: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-vb="64"><path d="M12 18 C24 11 40 23 52 16 C50 32 54 44 48 52 C36 45 22 55 14 48 C18 36 9 28 12 18 Z" fill="currentColor" fill-opacity="0.24" stroke-width="3.5"/><path d="M25 15 C30 28 27 38 22 50" stroke-width="2.6" opacity="0.85"/><path d="M39 19 C44 30 41 40 36 48" stroke-width="2.6" opacity="0.85"/><path d="M16 22 C25 18 36 25 48 20 C46 32 50 41 44 48 C34 43 23 50 17 44 C19 34 13 28 16 22" stroke-width="1.8" stroke-dasharray="3 3" opacity="0.65"/><polygon points="12,18 20,24 16,13" fill="currentColor" fill-opacity="0.5" stroke-width="2"/></g>`,
    arrowRight: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></g>`,
    arrowLeft: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></g>`,
    check: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="20 6 9 17 4 12"/></g>`,
    refresh: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></g>`,
    alertCircle: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></g>`,
    handshake: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></g>`,
    gamepad: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="6"/></g>`,
    robot: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="16" y1="16" x2="16" y2="16.01"/></g>`,
    globe: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></g>`,
    home: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></g>`,
    door: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></g>`,
    hourglass: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></g>`,
    sliders: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></g>`,
    target: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></g>`,
    userShield: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="12 2 20 6 20 13 12 22 4 13 4 6 12 2"/></g>`,
    bag: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></g>`,
    cpu: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></g>`,
    swords: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="9"/><line x1="12" y1="1" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="23"/><line x1="1" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="23" y2="12"/></g>`,
    greatsword: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></g>`,
    shield: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2"/><polygon points="12 7 17 9.8 17 14.2 12 17 7 14.2 7 9.8 12 7"/></g>`,
    staff: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"/></g>`,
    dagger: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M2 12h5l3-7 4 14 3-7h5"/></g>`,
    axe: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="8"/><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></g>`,
    bow: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></g>`,
    star: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="4"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/></g>`,
    bolt: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></g>`,
    leaf: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 2v20"/><path d="M4 7l16 10"/><path d="M20 7L4 17"/></g>`,
    flame: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="12 2 19 21 12 17 5 21 12 2"/></g>`,
    snowflake: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><circle cx="12" cy="12" r="6"/></g>`,
    skull: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="12 2 22 20 2 20 12 2"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></g>`,
    crown: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="12 2 16 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 8 8 12 2"/></g>`,
    eye: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></g>`,
    cross: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></g>`,
    dragon: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></g>`,
    flask: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="10" y1="6" x2="14" y2="6"/><line x1="10" y1="10" x2="14" y2="10"/><line x1="10" y1="14" x2="14" y2="14"/></g>`,
    gun: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M2 10h16l4 2v3h-5l-2 5H9l2-5H2v-5z"/><line x1="6" y1="7" x2="14" y2="7"/></g>`,
    cog: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></g>`,
    drop: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="12 2 19 12 12 22 5 12 12 2"/></g>`,
    paw: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="3" y="8" width="18" height="8" rx="2"/><line x1="7" y1="4" x2="7" y2="8"/><line x1="17" y1="4" x2="17" y2="8"/><line x1="7" y1="16" x2="7" y2="20"/><line x1="17" y1="16" x2="17" y2="20"/></g>`,
    compass: `<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></g>`,
    gauntlet: `<g stroke="currentColor" stroke-width="2.2" fill="none"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="4"/></g>`,
    armor: `<g stroke="currentColor" stroke-width="2.2" fill="none"><polygon points="12 2 20 6 18 20 12 22 6 20 4 6 12 2"/><line x1="12" y1="6" x2="12" y2="18"/></g>`,
    necklace: `<g stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></g>`,
    boot: `<g stroke="currentColor" stroke-width="2.2" fill="none"><path d="M4 16l6-12h6l-3 8h7l-8 10-2-6H4z"/></g>`,
    helm: `<g stroke="currentColor" stroke-width="2.2" fill="none"><rect x="2" y="6" width="20" height="12" rx="4"/><line x1="6" y1="12" x2="18" y2="12"/></g>`,
    cloak: `<g stroke="currentColor" stroke-width="2.2" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></g>`,
    belt: `<g stroke="currentColor" stroke-width="2.2" fill="none"><rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="12" cy="12" r="2"/></g>`,
    charm: `<g stroke="currentColor" stroke-width="2.2" fill="none"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="12" x2="15" y2="12"/></g>`,
    chain: `<g stroke="currentColor" stroke-width="2.2" fill="none"><path d="M6 9h12"/><path d="M6 15h12"/><circle cx="6" cy="9" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="6" cy="15" r="2"/><circle cx="18" cy="15" r="2"/></g>`,
    ring: `<g stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="12" cy="14" r="7"/><polygon points="12 6 17 15 7 15 12 6"/></g>`,
    trophy: `<g fill="none" data-vb="64"><path d="M18 10h28v16c0 8-6 14-14 14s-14-6-14-14V10z" fill="rgba(250,204,21,0.22)" stroke="var(--gold)" stroke-width="3.5"/><path d="M18 14H10v8c0 5 4 8 8 8M46 14h8v8c0 5-4 8-8 8" stroke="var(--gold)" stroke-width="3.5"/><path d="M32 40v12M20 52h24" stroke="var(--gold)" stroke-width="4" stroke-linecap="round"/></g>`,
    defeatSkull: `<g fill="none" data-vb="64"><polygon points="32,8 58,52 6,52" fill="rgba(239,68,68,0.2)" stroke="var(--danger)" stroke-width="3.5"/><line x1="32" y1="24" x2="32" y2="38" stroke="var(--danger)" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="45" r="2.5" fill="var(--danger)"/></g>`,
    mystery: `<g fill="none" data-vb="64"><circle cx="32" cy="32" r="28" stroke="var(--primary)" stroke-width="2" stroke-dasharray="4 6" opacity="0.5"><animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="8s" repeatCount="indefinite"/></circle><circle cx="32" cy="32" r="20" stroke="var(--primary)" stroke-width="1" opacity="0.3"/><path d="M32 16 L32 20 M32 44 L32 48 M16 32 L20 32 M44 32 L48 32" stroke="var(--primary)" stroke-width="2"/><circle cx="32" cy="32" r="4" fill="var(--primary)" opacity="0.8"><animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite"/></circle></g>`
});

function resolveCharIconKey(name, crit, shield, magic) {
    if (name.includes("步槍") || name.includes("獵手") || name.includes("狙擊")) return "gun";
    if (name.includes("核心") || name.includes("工程") || name.includes("運算")) return "cpu";
    if (name.includes("觀測") || name.includes("導航") || name.includes("先鋒")) return "compass";
    if (name.includes("守衛") || name.includes("裝甲") || name.includes("壁壘")) return "shield";
    if (name.includes("量子") || name.includes("駭客") || name.includes("奇點")) return "staff";
    if (crit >= shield && crit >= magic) return "bolt";
    if (shield >= crit && shield >= magic) return "shield";
    return "staff";
}

function resolveCharRoleMeta(crit, shield, magic) {
    if (crit >= shield && crit >= magic) return { label: "🟡 超載型", className: "role-overload" };
    if (shield >= crit && shield >= magic) return { label: "🔵 能量型", className: "role-energy" };
    return { label: "🟣 量子型", className: "role-quantum" };
}

const RAW_CHARS = [
    ["超載特工", 60, 0, 0, "極限火力輸出，勝局高機率觸發系統超載"],
    ["量子守衛", 0, 60, 0, "絕對力場防禦，敗局高機率展開能量護盾"],
    ["量子操作員", 0, 0, 60, "高維度干涉，平局時高機率引爆量子脈衝"],
    ["星際先鋒", 20, 20, 20, "全地形標準戰術配置，三項核心指標均衡"],
    ["神經駭客", 40, 0, 20, "高速神經入侵，專精超載突破與量子干擾"],
    ["戰術執行者", 20, 40, 0, "重型前線鎮壓，兼顧超載打擊與能量偏折"],
    ["虛空觀測員", 0, 20, 40, "深空軌道預測，專精能量屏障與量子演算"],
    ["軌道突擊兵", 50, 10, 0, "空降強襲編制，極高超載輸出傾向"],
    ["重裝力場兵", 10, 50, 0, "外骨骼裝甲防護，極高能量護盾傾向"],
    ["相位調諧師", 0, 10, 50, "相位頻率操控，極高量子脈衝傾向"],
    ["電漿突擊手", 30, 0, 30, "高溫電漿注射，超載與量子雙重特化"],
    ["能源工程師", 0, 30, 30, "反應爐迴路調度，能量與量子雙重特化"],
    ["強襲裝甲兵", 30, 30, 0, "攻防一體化機甲，超載與能量雙重特化"],
    ["粒子控制員", 15, 15, 30, "微觀粒子加速，量子脈衝主導型"],
    ["離子獵手", 30, 15, 15, "高能離子鎖定，超載輸出主導型"],
    ["星艦防衛官", 15, 30, 15, "艦橋安全協定，能量護盾主導型"],
    ["戰術指揮官", 25, 25, 10, "多維戰場調度，超載與能量均衡配置"],
    ["時空導航員", 10, 25, 25, "曲速航道校準，能量防護與量子逆轉"],
    ["奇點研究員", 25, 10, 25, "人工奇點激發，超載爆發與量子逆轉"],
    ["特遣中隊長", 20, 20, 20, "太空站特遣核心，全方位穩定輸出"],
    ["磁軌狙擊手", 55, 5, 0, "超遠程電磁加速，極致超載穿透"],
    ["穹頂防衛者", 0, 60, 0, "行星級防護矩陣，極限能量護盾"],
    ["高維演算師", 0, 0, 60, "超算核心直連，極限量子脈衝干涉"],
    ["光學潛行者", 45, 0, 15, "主動迷彩匿蹤，高超載精準突襲"],
    ["泰坦機甲師", 25, 35, 0, "重型機甲駕駛，穩定能量屏障與反擊"],
    ["暗物質技師", 10, 10, 40, "暗物質催化反應，專精量子脈衝"],
    ["聚變爆破手", 50, 10, 0, "微型聚變彈頭，高壓超載毀滅打擊"],
    ["神經協調員", 20, 20, 20, "腦機同步率百分百，全能戰術適應"],
    ["天基打擊員", 30, 20, 10, "軌道衛星砲火引導，強勢超載壓制"],
    ["零重力遊俠", 35, 10, 15, "無重力立體機動，高頻率超載突擊"],
    ["電弧劍士", 25, 10, 25, "高頻電弧刃武裝，超載與量子雙修"],
    ["矩陣屏障員", 5, 50, 5, "六角蜂巢力場展開，堅不可摧防線"],
    ["量子編碼員", 5, 5, 50, "底層邏輯覆寫，主宰平局量子逆轉"],
    ["奈米修復師", 15, 25, 20, "奈米集群重組，穩健能量維持與反制"],
    ["光子砲手", 45, 10, 5, "高濃縮光子束，瞬間超載貫穿"],
    ["超頻狂熱者", 40, 20, 0, "解除安全限制器，強行拉升超載功率"],
    ["力場維護員", 0, 25, 35, "恆定能量供給，擅長持久防禦與量子干擾"],
    ["生態艙守衛", 10, 25, 25, "環形太空站維生防護，能量與量子兼備"],
    ["極速滲透者", 50, 0, 10, "亞光速突進斬擊，超載極大化"],
    ["全息幻影師", 30, 0, 30, "全息投影欺敵，超載與量子同步打擊"],
    ["星際督察官", 15, 30, 15, "艦隊紀律執行，高穩定度能量防護"],
    ["絕對零度員", 10, 15, 35, "超導冷卻凝結，量子脈衝控場專精"],
    ["熱核工程師", 20, 0, 40, "高溫熱核釋放，量子與超載複合輸出"],
    ["重力裝甲兵", 0, 40, 20, "引力場偏折護盾，高強度能量防禦"],
    ["鋼鐵衛戍官", 10, 40, 10, "太空堡壘駐軍，重型能量防線"],
    ["離子推進員", 35, 5, 20, "高速離子尾流，敏捷超載打擊"],
    ["躍遷觀測者", 5, 15, 40, "超空間躍遷干預，高機率量子逆轉"],
    ["深空巡邏員", 25, 25, 10, "邊境星域巡航，攻防一體標準配置"],
    ["極光通訊員", 0, 20, 40, "次空間頻率共振，能量防護與量子干擾"],
    ["音速突擊兵", 40, 5, 15, "超音速動能衝擊，高爆發超載傾向"],
    ["合金壁壘兵", 0, 55, 5, "鈦合金複合裝甲，極高物理與能量偏折"],
    ["脈衝干擾員", 20, 5, 35, "電磁脈衝癱瘓，擅長量子頻率逆轉"],
    ["自律無人機師", 15, 20, 25, "蜂群戰術協同，三維屬性靈活配置"],
    ["反物質特工", 15, 10, 35, "反物質湮滅反應，高風險量子爆發"],
    ["外骨骼戰士", 35, 15, 10, "軍用動力外骨骼，剛猛超載輸出"],
    ["星塵勘探員", 25, 15, 20, "小行星帶生存專家，高適應力配置"],
    ["量子先知號", 5, 10, 45, "量子機率雲預測，極高平局逆轉能力"],
    ["戰術仲裁者", 20, 30, 10, "高階戰術裁決，能量防禦反擊型"],
    ["機甲獸領航員", 30, 15, 15, "仿生機械集群控制，高侵略性超載"],
    ["軌道維和官", 10, 25, 25, "太空站秩序維護，穩健能量與量子配置"]
];

const CHARACTER_DB = {};
RAW_CHARS.forEach((char, index) => {
    const id = index + 1;
    const roleMeta = resolveCharRoleMeta(char[1], char[2], char[3]);
    CHARACTER_DB[id] = Object.freeze({
        id, name: char[0], crit: char[1], shield: char[2], magic: char[3], desc: char[4],
        iconKey: resolveCharIconKey(char[0], char[1], char[2], char[3]),
        roleLabel: roleMeta.label, roleClass: roleMeta.className
    });
});
Object.freeze(CHARACTER_DB);

const PREFIX_EFFECTS = Object.freeze([
    ["光子", "平局時，自身額外得 1 分", "tie_p_plus1", "star"],
    ["湮滅", "平局時，使對手扣除 1 分", "tie_c_minus1", "skull"],
    ["超頻", "獲勝時，自身額外得 1 分", "win_p_plus1", "bolt"],
    ["霸權", "獲勝時，使對手扣除 1 分", "win_c_minus1", "crown"],
    ["恆定", "落敗時，自身補償得 1 分", "loss_p_plus1", "shield"],
    ["力場", "落敗時，使對手扣除 1 分", "loss_c_minus1", "userShield"],
    ["機率", "開局前 33.3% 機率自身得 1 分", "rand_p_plus1", "compass"],
    ["暗物質", "開局前 33.3% 機率對手扣 1 分", "rand_c_minus1", "eye"],
    ["電漿", "獲勝時 50% 機率電漿超載得 2 分", "burst_win_p", "bolt"],
    ["熵增", "落敗時 50% 機率反震對手扣 2 分", "burst_loss_c", "flame"],
    ["破盾", "獲勝且被能量護盾擋下時，強制得 1 分", "win_block_p", "greatsword"],
    ["偏折", "落敗且能量護盾防禦成功時，反彈對手扣 1 分", "loss_block_c", "shield"],
    ["高能", "獲勝且未被擋下時，額外得 1 分", "win_unblock_p", "swords"],
    ["奇點", "開局前 20% 機率自身直接得 2 分", "start_buff", "star"],
    ["神經", "平局時對手扣 1 分，但自身 50% 扣 1 分", "tie_blood", "dagger"],
    ["量子", "平局時 33% 機率額外得 2 分", "tie_burst_p", "staff"]
]);

const SUFFIX_EFFECTS = Object.freeze([
    ["離子步槍", "平局時自身扣除 1 分", "tie_p_minus1", "gun"],
    ["量子核心", "平局時對手額外得 1 分", "tie_c_plus1", "staff"],
    ["神經介面", "獲勝時無法得分（扣除 1 分）", "win_p_minus1", "dagger"],
    ["能量發生器", "獲勝時對手也獲得 1 分", "win_c_plus1", "shield"],
    ["電漿模組", "落敗時自身額外扣除 1 分", "loss_p_minus1", "bolt"],
    ["超載晶體", "落敗時對手額外得 1 分", "loss_c_plus1", "drop"],
    ["奈米護甲", "開局前 33.3% 機率自身扣除 1 分", "rand_p_minus1", "armor"],
    ["戰術運算器", "開局前 33.3% 機率對手獲得 1 分", "rand_c_plus1", "cpu"],
    ["引力穩定器", "獲勝時 30% 機率自身扣 1 分", "win_fail_p", "compass"],
    ["奇點反應爐", "落敗時 30% 機率對手額外得 1 分", "loss_extra_c", "star"],
    ["光子推進器", "平局時 30% 機率自身扣 2 分", "tie_burst_p_neg", "dragon"],
    ["相位力場儀", "平局時 30% 機率對手得 2 分", "tie_burst_c_neg", "userShield"],
    ["磁軌狙擊砲", "獲勝時 20% 機率自身扣 2 分", "win_heavy_p", "bow"],
    ["暗物質電池", "獲勝時 20% 機率對手得 2 分", "win_pity_c", "flask"],
    ["全息瞄準鏡", "落敗時 20% 機率自身扣 2 分", "loss_fragile_p", "target"],
    ["脈衝發射器", "落敗時 20% 機率對手得 2 分", "loss_gift_c", "swords"],
    ["反物質導管", "平局時自身扣 1 分且對手得 1 分", "tie_doom", "chain"],
    ["生物神經晶片", "獲勝被擋下時，自身額外扣 1 分", "win_block_neg", "paw"],
    ["偏折投射器", "落敗且防禦成功時，自身依然扣 1 分", "loss_block_neg", "shield"],
    ["聚變反應引擎", "獲勝且未被擋下時，對手獲得 1 分", "win_unblock_neg", "cog"],
    ["躍遷導航儀", "落敗且未被擋下時，自身額外扣 1 分", "loss_unblock_neg", "compass"],
    ["電磁干擾器", "開局前 20% 機率自身扣 2 分", "start_debuff_p", "skull"],
    ["光學迷彩服", "開局前 20% 機率對手得 2 分", "start_buff_c", "cloak"],
    ["零點諧振器", "平局時 50% 機率自身扣 1 分", "tie_hesitate", "hourglass"]
]);

const EQUIPMENT_DB = {};
let eqIdCounter = 1;
PREFIX_EFFECTS.forEach(prefix => {
    SUFFIX_EFFECTS.forEach(suffix => {
        EQUIPMENT_DB[eqIdCounter] = Object.freeze({
            id: eqIdCounter, name: `${prefix[0]}・${suffix[0]}`, pos: prefix[2], neg: suffix[2],
            prefixIconKey: prefix[3], iconKey: suffix[3],
            posText: `【增益】${prefix[1]}`, negText: `【負荷】${suffix[1]}`
        });
        eqIdCounter++;
    });
});
Object.freeze(EQUIPMENT_DB);

const EFFECT_HANDLERS = Object.freeze({
    'tie_p_plus1': ctx => ctx.is_tie ? [1, 0, "光子諧振啟動，平局額外得 1 分！"] : null,
    'tie_c_minus1': ctx => ctx.is_tie ? [0, -1, "湮滅力場啟動，平局使對手扣除 1 分！"] : null,
    'win_p_plus1': ctx => ctx.win ? [1, 0, ctx.blocked ? "超頻貫穿！即便被護盾偏折依然得 1 分！" : "超頻追擊！額外得 1 分！"] : null,
    'win_c_minus1': ctx => ctx.win ? [0, -1, "霸權壓制！使對手扣除 1 分！"] : null,
    'loss_p_plus1': ctx => ctx.loss ? [1, 0, "恆定補償協定啟動！落敗時得 1 分！"] : null,
    'loss_c_minus1': ctx => ctx.loss ? [0, -1, "力場反衝！落敗時削弱對手 1 分！"] : null,
    'rand_p_plus1': ctx => (ctx.is_start && Math.random() < 1 / 3) ? [1, 0, "機率演算命中！開局直接得 1 分！"] : null,
    'rand_c_minus1': ctx => (ctx.is_start && Math.random() < 1 / 3) ? [0, -1, "暗物質侵蝕！開局使對手扣除 1 分！"] : null,
    'burst_win_p': ctx => (ctx.win && Math.random() < 0.5) ? [2, 0, "電漿超載爆發！勝局瞬間斬獲 2 分！"] : null,
    'burst_loss_c': ctx => (ctx.loss && Math.random() < 0.5) ? [0, -2, "熵增震盪！落敗時反震對手扣 2 分！"] : null,
    'tie_p_minus1': ctx => ctx.is_tie ? [-1, 0, "系統負荷【過熱】：平局自身扣除 1 分！"] : null,
    'tie_c_plus1': ctx => ctx.is_tie ? [0, 1, "系統負荷【溢散】：平局對手獲得 1 分！"] : null,
    'win_p_minus1': ctx => ctx.win ? [-1, 0, "系統負荷【斷路】：獲勝扣除 1 分！"] : null,
    'win_c_plus1': ctx => ctx.win ? [0, 1, "系統負荷【回授】：獲勝使對手同時得 1 分！"] : null,
    'loss_p_minus1': ctx => ctx.loss ? [-1, 0, "系統負荷【崩潰】：落敗自身額外扣除 1 分！"] : null,
    'loss_c_plus1': ctx => ctx.loss ? [0, 1, "系統負荷【洩漏】：落敗使對手額外得 1 分！"] : null,
    'rand_p_minus1': ctx => (ctx.is_start && Math.random() < 1 / 3) ? [-1, 0, "系統負荷【誤判】：開局自身扣除 1 分！"] : null,
    'rand_c_plus1': ctx => (ctx.is_start && Math.random() < 1 / 3) ? [0, 1, "系統負荷【資敵】：開局對手獲得 1 分！"] : null,
    'win_block_p': ctx => (ctx.win && ctx.blocked) ? [1, 0, "破盾協定啟動！穿透能量護盾強取 1 分！"] : null,
    'loss_block_c': ctx => (ctx.loss && ctx.blocked) ? [0, -1, "偏折反擊啟動！完美防禦並反彈對手 1 分！"] : null,
    'win_unblock_p': ctx => (ctx.win && !ctx.blocked) ? [1, 0, "高能直擊！命中目標核心額外得 1 分！"] : null,
    'start_buff': ctx => (ctx.is_start && Math.random() < 0.2) ? [2, 0, "奇點爆發！開局直接得 2 分！"] : null,
    'tie_blood': ctx => ctx.is_tie ? (Math.random() < 0.5 ? [-1, -1, "神經超載負荷！雙方各扣 1 分！"] : [0, -1, "神經入侵成功！使對手扣 1 分！"]) : null,
    'tie_burst_p': ctx => (ctx.is_tie && Math.random() < 0.33) ? [2, 0, "量子疊加態！平局中額外奪取 2 分！"] : null,
    'win_fail_p': ctx => (ctx.win && Math.random() < 0.3) ? [-1, 0, "負荷【引力失衡】：獲勝依然被拖累扣 1 分！"] : null,
    'loss_extra_c': ctx => (ctx.loss && Math.random() < 0.3) ? [0, 1, "負荷【爐心外洩】：落敗使對手額外得 1 分！"] : null,
    'tie_burst_p_neg': ctx => (ctx.is_tie && Math.random() < 0.3) ? [-2, 0, "負荷【推進逆火】：平局遭受反衝扣 2 分！"] : null,
    'tie_burst_c_neg': ctx => (ctx.is_tie && Math.random() < 0.3) ? [0, 2, "負荷【相位失鎖】：平局使對手得 2 分！"] : null,
    'win_heavy_p': ctx => (ctx.win && Math.random() < 0.2) ? [-2, 0, "負荷【能源耗盡】：獲勝耗盡電力扣 2 分！"] : null,
    'win_pity_c': ctx => (ctx.win && Math.random() < 0.2) ? [0, 2, "負荷【暗物質回流】：獲勝卻送給對手 2 分！"] : null,
    'loss_fragile_p': ctx => (ctx.loss && Math.random() < 0.2) ? [-2, 0, "負荷【護甲碎裂】：落敗受重創扣 2 分！"] : null,
    'loss_gift_c': ctx => (ctx.loss && Math.random() < 0.2) ? [0, 2, "負荷【訊號截獲】：落敗送給對手 2 分！"] : null,
    'tie_doom': ctx => ctx.is_tie ? [-1, 1, "負荷【反物質逆流】：平局自身扣 1 分且對手得 1 分！"] : null,
    'win_block_neg': ctx => (ctx.win && ctx.blocked) ? [-1, 0, "負荷【神經反噬】：攻擊被擋下反而受損扣 1 分！"] : null,
    'loss_block_neg': ctx => (ctx.loss && ctx.blocked) ? [-1, 0, "負荷【力場過載】：防禦成功但發生器過熱扣 1 分！"] : null,
    'win_unblock_neg': ctx => (ctx.win && !ctx.blocked) ? [0, 1, "負荷【散熱延遲】：順利攻擊卻讓對手趁機得 1 分！"] : null,
    'loss_unblock_neg': ctx => (ctx.loss && !ctx.blocked) ? [-1, 0, "負荷【導航偏離】：被直擊額外受損扣 1 分！"] : null,
    'start_debuff_p': ctx => (ctx.is_start && Math.random() < 0.2) ? [-2, 0, "負荷【電磁短路】：開局直接扣 2 分！"] : null,
    'start_buff_c': ctx => (ctx.is_start && Math.random() < 0.2) ? [0, 2, "負荷【迷彩失效】：開局直接送對手 2 分！"] : null,
    'tie_hesitate': ctx => (ctx.is_tie && Math.random() < 0.5) ? [-1, 0, "負荷【諧振延遲】：平局訊號延遲扣除 1 分！"] : null
});