// ============================================================================
// 0. SVG Sprite 定義與 SVG 管理 (優化 DOM 節點數量與跨瀏覽器渲染)
// ============================================================================
const SVG_LIB_DEFINITIONS = {
    arrowRight: `<g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></g>`,
    arrowLeft: `<g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></g>`,
    check: `<g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="20 6 9 17 4 12"/></g>`,
    refresh: `<g stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></g>`,
    gamepad: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="6"/></g>`,
    robot: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="16" y1="16" x2="16" y2="16.01"/></g>`,
    globe: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></g>`,
    home: `<g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></g>`,
    door: `<g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/></g>`,
    hourglass: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></g>`,
    sliders: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></g>`,
    target: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></g>`,
    userShield: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></g>`,
    bag: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></g>`,
    cpu: `<g stroke="#00D4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></g>`,
    mystery: `<g fill="none" data-vb="64"><circle cx="32" cy="32" r="28" stroke="#00D4FF" stroke-width="3" stroke-dasharray="6 4" fill="rgba(0,212,255,0.08)"/><path d="M25 24c0-4.5 3.5-8 8-8s8 3.5 8 7.5c0 3.5-2.5 5.5-5 7-2 1.2-3 2.5-3 5v1.5" stroke="#00D4FF" stroke-width="4.5" stroke-linecap="round"/><circle cx="33" cy="46" r="3" fill="#00D4FF"/></g>`,
    scissors: `<g fill="none" data-vb="64"><circle cx="32" cy="32" r="29" fill="rgba(255,107,43,0.14)" stroke="#ff6b2b" stroke-width="2.5"/><path d="M24 34V14a4 4 0 0 1 8 0v18M32 32V12a4 4 0 0 1 8 0v22" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/><path d="M20 34h24a6 6 0 0 1 6 6v8a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10v-8a6 6 0 0 1 4-6z" fill="rgba(255,209,102,0.22)" stroke="#ffd166" stroke-width="3.5"/></g>`,
    rock: `<g fill="none" data-vb="64"><circle cx="32" cy="32" r="29" fill="rgba(0,212,255,0.14)" stroke="#00D4FF" stroke-width="2.5"/><path d="M18 30v-6a4 4 0 0 1 8 0v6m0-8a4 4 0 0 1 8 0v8m0-7a4 4 0 0 1 8 0v7m0-5a4 4 0 0 1 8 0v13a14 14 0 0 1-14 14H28a12 12 0 0 1-12-12V30a4 4 0 0 1 2-3.5" fill="rgba(0,212,255,0.24)" stroke="#00D4FF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 34h20" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`,
    paper: `<g fill="none" data-vb="64"><circle cx="32" cy="32" r="29" fill="rgba(213,66,255,0.14)" stroke="#d542ff" stroke-width="2.5"/><path d="M18 32V18a3.5 3.5 0 0 1 7 0v12m0-15a3.5 3.5 0 0 1 7 0v15m0-14a3.5 3.5 0 0 1 7 0v14m0-10a3.5 3.5 0 0 1 7 0v18a14 14 0 0 1-14 14H28a12 12 0 0 1-12-12V30" fill="rgba(213,66,255,0.22)" stroke="#e07aff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    swords: `<g stroke="#ff6b2b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></g>`,
    greatsword: `<g stroke="#ff5722" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/></g>`,
    shield: `<g stroke="#00e5ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v8"/><path d="M8 12h8"/></g>`,
    staff: `<g stroke="#d542ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m15 4-3 3 2 2 3-3a2.83 2.83 0 1 0-2-2Z"/><path d="m13 6-9.5 9.5a2.12 2.12 0 1 0 3 3L16 9"/><circle cx="18" cy="6" r="3" stroke="#00D4FF"/></g>`,
    dagger: `<g stroke="#ff3b5c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 4 4 14l3 3L17 7l-3-3z"/><path d="m3 21 4-4"/><path d="m15 3 6 6"/></g>`,
    axe: `<g stroke="#ff5722" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M15 13 9 7l4-4 6 6h3a8 8 0 0 1-7 7z"/></g>`,
    bow: `<g stroke="#ffd166" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M17 3h4v4"/><path d="M21 3 10 14"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></g>`,
    star: `<g stroke="#ffeb3b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></g>`,
    bolt: `<g stroke="#ffeb3b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></g>`,
    leaf: `<g stroke="#4caf50" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></g>`,
    flame: `<g stroke="#ff5722" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></g>`,
    snowflake: `<g stroke="#00D4FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></g>`,
    skull: `<g stroke="#d542ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></g>`,
    crown: `<g stroke="#ffeb3b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></g>`,
    eye: `<g stroke="#d542ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></g>`,
    cross: `<g stroke="#ffeb3b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></g>`,
    dragon: `<g stroke="#ff5722" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 3c5 0 9 4 9 9 0 4-3 8-7 9l-2-4-2 4c-4-1-7-5-7-9 0-5 4-9 9-9z"/><path d="m9 10 3 2 3-2"/></g>`,
    flask: `<g stroke="#4caf50" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><line x1="5.52" y1="16" x2="18.48" y2="16"/></g>`,
    gun: `<g stroke="#ff9800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M3 7h15l3 3v3h-4l-2 6H9l2-6H3V7z"/><circle cx="14" cy="10" r="1"/></g>`,
    cog: `<g stroke="#00D4FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></g>`,
    drop: `<g stroke="#ff3b5c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></g>`,
    paw: `<g stroke="#ff9800" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></g>`,
    compass: `<g stroke="#00D4FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></g>`,
    gauntlet: `<g stroke="#00D4FF" stroke-width="2" fill="none"><path d="M6 14V6a2 2 0 0 1 4 0v5m0-6a2 2 0 0 1 4 0v5m0-4a2 2 0 0 1 4 0v8l-3 6H7l-3-6v-3a2 2 0 0 1 2-1z"/></g>`,
    armor: `<g stroke="#00e5ff" stroke-width="2" fill="none"><path d="m6 3 6 3 6-3 3 5-3 3v9H6v-9L3 8l3-5z"/><path d="M12 6v14"/></g>`,
    necklace: `<g stroke="#ffeb3b" stroke-width="2" fill="none"><path d="M6 3c0 6 2.5 10 6 11 3.5-1 6-5 6-11"/><polygon points="12 14 9 19 12 22 15 19 12 14"/></g>`,
    boot: `<g stroke="#ff9800" stroke-width="2" fill="none"><path d="M7 3h7v9l5 3v4H5v-6l2-10z"/><line x1="5" y1="19" x2="19" y2="19"/></g>`,
    helm: `<g stroke="#00D4FF" stroke-width="2" fill="none"><path d="M4 13a8 8 0 0 1 16 0v6l-4-2-4 2-4-2-4 2v-6z"/><path d="M12 5v8"/></g>`,
    cloak: `<g stroke="#d542ff" stroke-width="2" fill="none"><path d="M7 4c3 2 7 2 10 0l4 16-9-2-9 2 4-16z"/></g>`,
    belt: `<g stroke="#ffd166" stroke-width="2" fill="none"><rect x="2" y="9" width="20" height="6" rx="1"/><rect x="9" y="7" width="6" height="10" rx="1"/></g>`,
    charm: `<g stroke="#ff3b5c" stroke-width="2" fill="none"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M12 7v10M9 10h6"/></g>`,
    chain: `<g stroke="#aaa" stroke-width="2" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></g>`,
    ring: `<g stroke="#ffeb3b" stroke-width="2" fill="none"><circle cx="12" cy="14" r="7"/><polygon points="12 3 9 7 15 7 12 3"/></g>`,
    trophy: `<g fill="none" data-vb="64"><path d="M18 10h28v16c0 8-6 14-14 14s-14-6-14-14V10z" fill="rgba(255,235,59,0.22)" stroke="#ffeb3b" stroke-width="3.5"/><path d="M18 14H10v8c0 5 4 8 8 8M46 14h8v8c0 5-4 8-8 8" stroke="#ffeb3b" stroke-width="3.5"/><path d="M32 40v12M20 52h24" stroke="#ffeb3b" stroke-width="4" stroke-linecap="round"/></g>`,
    defeatSkull: `<g fill="none" data-vb="64"><path d="M32 8c-13 0-22 9-22 21 0 7 4 13 9 16v9h26v-9c5-3 9-9 9-16 0-12-9-21-22-21z" fill="rgba(255,59,92,0.2)" stroke="#ff3b5c" stroke-width="3.5"/><circle cx="24" cy="30" r="4" fill="#ff3b5c"/><circle cx="40" cy="30" r="4" fill="#ff3b5c"/><path d="M26 54v-6M32 54v-6M38 54v-6" stroke="#ff3b5c" stroke-width="3"/></g>`,
    vfxSlash: `<g fill="none" data-vb="120"><path d="M12 108 Q55 40 108 12 Q68 68 12 108 Z" fill="#ff6b2b" stroke="#ffeb3b" stroke-width="2.5"/><path d="M26 112 L112 26" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/><path d="M18 82 L82 18" stroke="#ffd166" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 4"/></g>`,
    vfxCrit: `<g fill="none" data-vb="120"><polygon points="60,4 73,42 114,28 84,60 114,92 73,78 60,116 47,78 6,92 36,60 6,28 47,42" fill="rgba(255,235,59,0.38)" stroke="#ffeb3b" stroke-width="3"/><circle cx="60" cy="60" r="24" stroke="#fff" stroke-width="3.5"/><path d="M60 20v80M20 60h80" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>`,
    vfxShield: `<g fill="none" data-vb="120"><polygon points="60,8 105,32 105,88 60,112 15,88 15,32" fill="rgba(0,229,255,0.25)" stroke="#00e5ff" stroke-width="3.5"/><polygon points="60,22 92,40 92,80 60,98 28,80 28,40" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/><circle cx="60" cy="60" r="14" stroke="#00e5ff" stroke-width="2"/></g>`,
    vfxMagic: `<g fill="none" data-vb="120"><circle cx="60" cy="60" r="48" stroke="#d542ff" stroke-width="3" stroke-dasharray="8 4"/><polygon points="60,14 98,82 22,82" stroke="#00D4FF" stroke-width="2.5" fill="rgba(213,66,255,0.18)"/><polygon points="60,106 98,38 22,38" stroke="#d542ff" stroke-width="2.5" fill="none"/><circle cx="60" cy="60" r="10" fill="rgba(0,212,255,0.4)" stroke="#fff" stroke-width="2"/></g>`
};

// 在 DOM 載入後生成動態 <svg><symbol> 庫，並清除內層多餘屬性
function buildSvgSprite() {
    const spriteContainer = document.getElementById('svg-sprite');
    if (!spriteContainer) return;
    let html = '';
    for (let key in SVG_LIB_DEFINITIONS) {
        let raw = SVG_LIB_DEFINITIONS[key];
        let viewBox = "0 0 24 24";
        if (raw.includes('data-vb="64"')) viewBox = "0 0 64 64";
        else if (raw.includes('data-vb="120"')) viewBox = "0 0 120 120";
        const cleanContent = raw.replace(/\s*data-vb="(64|120)"/g, '');
        html += `<symbol id="icon-${key}" viewBox="${viewBox}">${cleanContent}</symbol>`;
    }
    spriteContainer.innerHTML = html;
}

function resolveCharIconKey(name, crit, shield, magic) {
    if (name.includes("聖堂")) return "shield";
    if (name.includes("劍") || name.includes("武士")) return "greatsword";
    if (name.includes("刺客") || name.includes("影")) return "dagger";
    if (name.includes("射") || name.includes("遊俠") || name.includes("風行")) return "bow";
    if (name.includes("槍")) return "gun";
    if (name.includes("狂戰") || name.includes("狂熱")) return "axe";
    if (name.includes("龍")) return "dragon";
    if (name.includes("獸")) return "paw";
    if (name.includes("機")) return "cog";
    if (name.includes("鍊金")) return "flask";
    if (name.includes("血") || name.includes("魅魔")) return "drop";
    if (name.includes("死靈") || name.includes("咒")) return "skull";
    if (name.includes("冰")) return "snowflake";
    if (name.includes("烈焰") || name.includes("火")) return "flame";
    if (name.includes("雷")) return "bolt";
    if (name.includes("德魯伊") || name.includes("自然")) return "leaf";
    if (name.includes("修女") || name.includes("牧師") || name.includes("祭司") || name.includes("神官")) return "cross";
    if (name.includes("星") || name.includes("先知") || name.includes("時空")) return "star";
    if (name.includes("幻")) return "eye";
    if (name.includes("皇") || name.includes("傳奇") || name.includes("督軍")) return "crown";
    if (name.includes("冒險") || name.includes("遊牧") || name.includes("nomad")) return "compass";
    if (crit >= shield && crit >= magic) return "swords";
    if (shield >= crit && shield >= magic) return "shield";
    return "staff";
}

// ============================================================================
// 1. 60 款角色職業資料庫
// ============================================================================
const RAW_CHARS = [
    ["狂劍士", 60, 0, 0, "極致攻擊，勝時高機率爆擊"], ["聖騎士", 0, 60, 0, "絕對防護，敗時高機率免傷"],
    ["大法師", 0, 0, 60, "神祕魔力，平手時高機率逆轉"], ["冒險者", 20, 20, 20, "均衡發展，全方位平均型"],
    ["暗影刺客", 40, 0, 20, "迅捷致命，專精爆擊與魔力"], ["重裝禁衛", 20, 40, 0, "堅固前鋒，專精爆擊與防護"],
    ["占星術士", 0, 20, 40, "星象預測，專精防護與魔力"], ["狂戰鬥士", 50, 10, 0, "嗜血狂放，極高爆擊偏向"],
    ["鐵壁衛士", 10, 50, 0, "鋼軀鐵骨，極高防護偏向"], ["幻術大師", 0, 10, 50, "迷幻結界，極高魔力偏向"],
    ["雷霆使者", 30, 0, 30, "雷電交加，爆擊與魔力並重"], ["樹界德魯伊", 0, 30, 30, "自然庇護，防護與魔力並重"],
    ["戰鬥修女", 30, 30, 0, "聖域裁決，爆擊與防護並重"], ["元素使者", 15, 15, 30, "元素共鳴，魔力主導型"],
    ["劍術大師", 30, 15, 15, "劍道極意，爆擊主導型"], ["皇家騎士", 15, 30, 15, "皇家榮譽，防護主導型"],
    ["傭兵隊長", 25, 25, 10, "豐富經驗，攻守兼備"], ["時空學者", 10, 25, 25, "時空干涉，防守與逆轉"],
    ["混沌術士", 25, 10, 25, "混沌之力，爆擊與逆轉"], ["傳奇英雄", 20, 20, 20, "天選之人，全能均衡型"],
    ["神射手", 55, 5, 0, "精準狙擊，極致爆發"], ["守護者", 0, 60, 0, "不動如山，絕對防禦"],
    ["大賢者", 0, 0, 60, "洞悉萬物，絕對魔力"], ["影舞者", 45, 0, 15, "潛影無形，刺殺藝術"],
    ["聖堂武士", 25, 35, 0, "神聖制裁，攻防一體"], ["死靈法師", 10, 10, 40, "亡者低語，法術專精"],
    ["狂戰神", 50, 10, 0, "怒火燃燒，越戰越勇"], ["武僧", 20, 20, 20, "心如止水，內外兼修"],
    ["龍騎士", 30, 20, 10, "馭龍之威，制霸戰場"], ["精靈遊俠", 35, 10, 15, "自然射手，靈動無雙"],
    ["魔劍士", 25, 10, 25, "劍法雙修，魔武雙極"], ["盾兵", 5, 50, 5, "第一防線，堅不可摧"],
    ["咒術師", 5, 5, 50, "禁忌咒印，主宰平局"], ["鍊金術士", 15, 25, 20, "藥劑轉換，防守反擊"],
    ["火槍手", 45, 10, 5, "火藥轟鳴，致命一擊"], ["狂熱者", 40, 20, 0, "信仰驅動，無畏衝鋒"],
    ["牧師", 0, 25, 35, "聖光治癒，持久戰鬥"], ["德魯伊", 10, 25, 25, "萬物之靈，自然守護"],
    ["刺客", 50, 0, 10, "十步一殺，爆擊至上"], ["幻影", 30, 0, 30, "虛實難辨，法術刺客"],
    ["督軍", 15, 30, 15, "統御戰場，穩紮穩打"], ["冰霜使者", 10, 15, 35, "絕對零度，法術控制"],
    ["烈焰巫師", 20, 0, 40, "灰燼餘溫，法術爆發"], ["自然守護", 0, 40, 20, "大地之盾，堅固防護"],
    ["鐵將軍", 10, 40, 10, "鐵血紀律，重裝防禦"], ["風行者", 35, 5, 20, "順風而行，快速打擊"],
    ["時空行者", 5, 15, 40, "時空扭曲，操控因果"], ["黑暗騎士", 25, 25, 10, "深淵加持，攻守兼備"],
    ["光之祭司", 0, 20, 40, "光明洗禮，法防雙修"], ["狂風劍客", 40, 5, 15, "劍如疾風，勢不可擋"],
    ["岩石巨兵", 0, 55, 5, "大地化身，物理免疫"], ["魅魔", 20, 5, 35, "深淵誘惑，削弱敵人"],
    ["機關師", 15, 20, 25, "精密計算，戰術大師"], ["血法師", 15, 10, 35, "燃血施法，極限一搏"],
    ["武士", 35, 15, 10, "武士道精神，剛猛直前"], ["荒野遊牧", 25, 15, 20, "荒野生存，適應力強"],
    ["先知", 5, 10, 45, "預見未來，法術壓制"], ["審判官", 20, 30, 10, "異端裁決，防禦反擊"],
    ["獸王", 30, 15, 15, "百獸之尊，狂野攻擊"], ["神官", 10, 25, 25, "神之代行，穩健保守"]
];

const CHARACTER_DB = {};
RAW_CHARS.forEach((char, index) => {
    const iconKey = resolveCharIconKey(char[0], char[1], char[2], char[3]);
    CHARACTER_DB[index + 1] = {
        id: index + 1,
        name: char[0],
        crit: char[1],
        shield: char[2],
        magic: char[3],
        desc: char[4],
        iconKey: iconKey
    };
});

// ============================================================================
// 2. 裝備資料庫 (16 系列 × 24 具體裝備 = 384 種組合)
// ============================================================================
const PREFIX_EFFECTS = [
    ["聖光", "平局時，自身額外得 1 分", "tie_p_plus1", "cross"],
    ["滅絕", "平局時，使對手扣除 1 分", "tie_c_minus1", "skull"],
    ["狂戰", "獲勝時，自身額外得 1 分", "win_p_plus1", "axe"],
    ["霸者", "獲勝時，使對手扣除 1 分", "win_c_minus1", "crown"],
    ["不屈", "落敗時，自身慰藉得 1 分", "loss_p_plus1", "shield"],
    ["守護", "落敗時，使對手扣除 1 分", "loss_c_minus1", "userShield"],
    ["命運", "開局前 33.3% 機率自身得 1 分", "rand_p_plus1", "compass"],
    ["幽冥", "開局前 33.3% 機率對手扣 1 分", "rand_c_minus1", "eye"],
    ["雷霆", "獲勝時 50% 機率雷霆爆發得 2 分", "burst_win_p", "bolt"],
    ["混沌", "落敗時 50% 機率反震對手扣 2 分", "burst_loss_c", "flame"],
    ["破甲", "獲勝且被護盾擋下時，強制得 1 分", "win_block_p", "greatsword"],
    ["反甲", "落敗且成功防禦時，反彈對手扣 1 分", "loss_block_c", "shield"],
    ["神力", "獲勝且未被擋下時，額外得 1 分", "win_unblock_p", "swords"],
    ["奇蹟", "開局前 20% 機率自身直接得 2 分", "start_buff", "star"],
    ["血契", "平局時對手扣 1 分，但自身 50% 扣 1 分", "tie_blood", "drop"],
    ["星辰", "平局時 33% 機率額外得 2 分", "tie_burst_p", "staff"]
];

const SUFFIX_EFFECTS = [
    ["護手", "平局時自身扣除 1 分", "tie_p_minus1", "gauntlet"],
    ["胸甲", "平局時對手額外得 1 分", "tie_c_plus1", "armor"],
    ["吊墜", "獲勝時無法得分（扣除 1 分）", "win_p_minus1", "necklace"],
    ["戰靴", "獲勝時對手也獲得 1 分", "win_c_plus1", "boot"],
    ["戰盔", "落敗時自身額外扣除 1 分", "loss_p_minus1", "helm"],
    ["披風", "落敗時對手額外得 1 分", "loss_c_plus1", "cloak"],
    ["腰帶", "開局前 33.3% 機率自身扣除 1 分", "rand_p_minus1", "belt"],
    ["護符", "開局前 33.3% 機率對手獲得 1 分", "rand_c_plus1", "charm"],
    ["鐵鐐", "獲勝時 30% 機率自身扣 1 分", "win_fail_p", "chain"],
    ["腐木", "落敗時 30% 機率對手額外得 1 分", "loss_extra_c", "leaf"],
    ["詛咒", "平局時 30% 機率自身扣 2 分", "tie_burst_p_neg", "skull"],
    ["狂妄", "平局時 30% 機率對手得 2 分", "tie_burst_c_neg", "crown"],
    ["重擔", "獲勝時 20% 機率自身扣 2 分", "win_heavy_p", "chain"],
    ["憐憫", "獲勝時 20% 機率對手得 2 分", "win_pity_c", "drop"],
    ["脆骨", "落敗時 20% 機率自身扣 2 分", "loss_fragile_p", "skull"],
    ["資敵", "落敗時 20% 機率對手得 2 分", "loss_gift_c", "ring"],
    ["厄運", "平局時自身扣 1 分且對手得 1 分", "tie_doom", "eye"],
    ["反噬", "獲勝被擋下時，自身額外扣 1 分", "win_block_neg", "dagger"],
    ["裂痕", "落敗且防禦成功時，自身依然扣 1 分", "loss_block_neg", "shield"],
    ["傲慢", "獲勝且未被擋下時，對手獲得 1 分", "win_unblock_neg", "crown"],
    ["脆弱", "落敗且未被擋下時，自身額外扣 1 分", "loss_unblock_neg", "charm"],
    ["衰亡", "開局前 20% 機率自身扣 2 分", "start_debuff_p", "skull"],
    ["送禮", "開局前 20% 機率對手得 2 分", "start_buff_c", "ring"],
    ["猶豫", "平局時 50% 機率自身扣 1 分", "tie_hesitate", "hourglass"]
];

const EQUIPMENT_DB = {};
let eq_id = 1;
PREFIX_EFFECTS.forEach(prefix => {
    SUFFIX_EFFECTS.forEach(suffix => {
        EQUIPMENT_DB[eq_id] = {
            id: eq_id,
            name: `${prefix[0]}${suffix[0]}`,
            pos: prefix[2],
            neg: suffix[2],
            prefixIconKey: prefix[3],
            iconKey: suffix[3],
            desc: `<span style="color:#4caf50;">【優勢】${prefix[1]}</span><br><span style="color:#ff5252;">【代價】${suffix[1]}</span>`
        };
        eq_id++;
    });
});

// ============================================================================
// 3. 裝備效果處理函式
// ============================================================================
const EFFECT_HANDLERS = {
    'tie_p_plus1': ctx => ctx.is_tie ? [1, 0, "平局共鳴發動，額外得 1 分！"] : null,
    'tie_c_minus1': ctx => ctx.is_tie ? [0, -1, "平局威壓發動，對手扣除 1 分！"] : null,
    'win_p_plus1': ctx => ctx.win ? [1, 0, ctx.blocked ? "勝局共鳴！即便被擋下依然得 1 分！" : "勝局追擊！額外得 1 分！"] : null,
    'win_c_minus1': ctx => ctx.win ? [0, -1, "勝局霸者威壓！使對手扣除 1 分！"] : null,
    'loss_p_plus1': ctx => ctx.loss ? [1, 0, "不屈意志發動！落敗時獲得慰藉 1 分！"] : null,
    'loss_c_minus1': ctx => ctx.loss ? [0, -1, "守護反震！落敗時削弱對手 1 分！"] : null,
    'rand_p_plus1': ctx => (ctx.is_start && Math.random() < 1 / 3) ? [1, 0, "命運加護發動！開局直接得 1 分！"] : null,
    'rand_c_minus1': ctx => (ctx.is_start && Math.random() < 1 / 3) ? [0, -1, "幽冥詛咒發動！開局使對手扣除 1 分！"] : null,
    'burst_win_p': ctx => (ctx.win && Math.random() < 0.5) ? [2, 0, "雷霆暴擊！勝局電光石火斬獲 2 分！"] : null,
    'burst_loss_c': ctx => (ctx.loss && Math.random() < 0.5) ? [0, -2, "混沌裂隙！落敗時反震對手扣 2 分！"] : null,
    'tie_p_minus1': ctx => ctx.is_tie ? [-1, 0, "裝備代價【反噬】：平局自身扣除 1 分！"] : null,
    'tie_c_plus1': ctx => ctx.is_tie ? [0, 1, "裝備代價【饋贈】：平局對手獲得 1 分！"] : null,
    'win_p_minus1': ctx => ctx.win ? [-1, 0, "裝備代價【虛無】：獲勝扣除 1 分！"] : null,
    'win_c_plus1': ctx => ctx.win ? [0, 1, "裝備代價【枷鎖】：獲勝使對手同時得 1 分！"] : null,
    'loss_p_minus1': ctx => ctx.loss ? [-1, 0, "裝備代價【重創】：落敗自身額外扣除 1 分！"] : null,
    'loss_c_plus1': ctx => ctx.loss ? [0, 1, "裝備代價【崩裂】：落敗使對手額外得 1 分！"] : null,
    'rand_p_minus1': ctx => (ctx.is_start && Math.random() < 1 / 3) ? [-1, 0, "裝備代價【厄運】：開局自身扣除 1 分！"] : null,
    'rand_c_plus1': ctx => (ctx.is_start && Math.random() < 1 / 3) ? [0, 1, "裝備代價【敵恩】：開局對手獲得 1 分！"] : null,
    'win_block_p': ctx => (ctx.win && ctx.blocked) ? [1, 0, "破甲發動！被格擋依然強取 1 分！"] : null,
    'loss_block_c': ctx => (ctx.loss && ctx.blocked) ? [0, -1, "反甲發動！完美防禦並反彈對手 1 分！"] : null,
    'win_unblock_p': ctx => (ctx.win && !ctx.blocked) ? [1, 0, "神力發動！直擊弱點額外得 1 分！"] : null,
    'start_buff': ctx => (ctx.is_start && Math.random() < 0.2) ? [2, 0, "奇蹟降臨！開局直接得 2 分！"] : null,
    'tie_blood': ctx => ctx.is_tie ? (Math.random() < 0.5 ? [-1, -1, "血契代價！雙方各扣 1 分！"] : [0, -1, "血契發動！安然使對手扣 1 分！"]) : null,
    'tie_burst_p': ctx => (ctx.is_tie && Math.random() < 0.33) ? [2, 0, "星辰之力！平局中額外奪取 2 分！"] : null,
    'win_fail_p': ctx => (ctx.win && Math.random() < 0.3) ? [-1, 0, "代價【鐵鐐】：獲勝依然被拖累扣 1 分！"] : null,
    'loss_extra_c': ctx => (ctx.loss && Math.random() < 0.3) ? [0, 1, "代價【腐木】：落敗使對手額外得 1 分！"] : null,
    'tie_burst_p_neg': ctx => (ctx.is_tie && Math.random() < 0.3) ? [-2, 0, "代價【詛咒】：平局慘遭詛咒扣 2 分！"] : null,
    'tie_burst_c_neg': ctx => (ctx.is_tie && Math.random() < 0.3) ? [0, 2, "代價【狂妄】：平局使對手狂暴得 2 分！"] : null,
    'win_heavy_p': ctx => (ctx.win && Math.random() < 0.2) ? [-2, 0, "代價【重擔】：獲勝耗盡體力扣 2 分！"] : null,
    'win_pity_c': ctx => (ctx.win && Math.random() < 0.2) ? [0, 2, "代價【憐憫】：獲勝卻送給對手 2 分！"] : null,
    'loss_fragile_p': ctx => (ctx.loss && Math.random() < 0.2) ? [-2, 0, "代價【脆骨】：落敗受重創扣 2 分！"] : null,
    'loss_gift_c': ctx => (ctx.loss && Math.random() < 0.2) ? [0, 2, "代價【資敵】：落敗大意送給對手 2 分！"] : null,
    'tie_doom': ctx => ctx.is_tie ? [-1, 1, "代價【厄運】：平局自身扣 1 分且對手得 1 分！"] : null,
    'win_block_neg': ctx => (ctx.win && ctx.blocked) ? [-1, 0, "代價【反噬】：攻擊被擋下反而受傷扣 1 分！"] : null,
    'loss_block_neg': ctx => (ctx.loss && ctx.blocked) ? [-1, 0, "代價【裂痕】：防禦成功護盾碎裂扣 1 分！"] : null,
    'win_unblock_neg': ctx => (ctx.win && !ctx.blocked) ? [0, 1, "代價【傲慢】：順利攻擊卻讓對手趁機得 1 分！"] : null,
    'loss_unblock_neg': ctx => (ctx.loss && !ctx.blocked) ? [-1, 0, "代價【脆弱】：被直擊額外重創扣 1 分！"] : null,
    'start_debuff_p': ctx => (ctx.is_start && Math.random() < 0.2) ? [-2, 0, "代價【衰亡】：開局直接扣 2 分！"] : null,
    'start_buff_c': ctx => (ctx.is_start && Math.random() < 0.2) ? [0, 2, "代價【送禮】：開局直接送對手 2 分！"] : null,
    'tie_hesitate': ctx => (ctx.is_tie && Math.random() < 0.5) ? [-1, 0, "代價【猶豫】：平局遲疑扣除 1 分！"] : null
};