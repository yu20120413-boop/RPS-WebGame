"use strict";

window.AudioManager = (() => {
    const USE_EXTERNAL_AUDIO = true;
    const FADE_DURATION_MS = 500;
    const AUDIO_VOL = Object.freeze({
        lobby: 0.2, battle: 0.2, attack: 0.6, critical: 0.8,
        shield: 0.7, magic: 0.7, tie: 0.5, win: 0.85,
        lose: 0.8, click: 0.6, countdown: 0.6, start: 0.7
    });

    const sounds = USE_EXTERNAL_AUDIO ? {
        click: new Audio("assets/click.mp3"),
        win: new Audio("assets/win.mp3"),
        lose: new Audio("assets/lose.mp3"),
        attack: new Audio("assets/attack.mp3"),
        critical: new Audio("assets/critical.mp3"),
        shield: new Audio("assets/shield.mp3"),
        magic: new Audio("assets/magic.mp3"),
        tie: new Audio("assets/tie.mp3"),
        countdown: new Audio("assets/countdown.mp3"),
        start: new Audio("assets/start.mp3"),
        lobby: new Audio("assets/lobby.mp3"),
        battle: new Audio("assets/battle.mp3")
    } : {};

    if (sounds.lobby) sounds.lobby.loop = true;
    if (sounds.battle) sounds.battle.loop = true;

    let audioCtx = null;
    let currentBGMKey = null;
    let bgmFadeRafId = null;

    function stopAllBGM() {
        if (bgmFadeRafId !== null) {
            cancelAnimationFrame(bgmFadeRafId);
            bgmFadeRafId = null;
        }
        ["lobby", "battle"].forEach(key => {
            if (sounds[key]) {
                sounds[key].pause();
                sounds[key].currentTime = 0;
                sounds[key].volume = 0;
            }
        });
        currentBGMKey = null;
    }

    function playSynthFallback(type) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === "suspended") audioCtx.resume();
            const now = audioCtx.currentTime;
            const createTone = (oscType, startFreq, endFreq, startTime, duration, peakGain) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = oscType;
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.setValueAtTime(startFreq, startTime);
                if (endFreq && endFreq !== startFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
                gain.gain.setValueAtTime(peakGain, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                osc.onended = () => { osc.disconnect(); gain.disconnect(); };
                osc.start(startTime);
                osc.stop(startTime + duration);
            };
            if (type === "click") createTone("sine", 780, 1280, now, 0.06, 0.12);
            else if (type === "countdown") createTone("triangle", 520, 520, now, 0.14, 0.16);
            else if (type === "start") createTone("sawtooth", 523.25, 1046.5, now, 0.32, 0.2);
            else if (type === "attack") createTone("sawtooth", 300, 58, now, 0.22, 0.26);
            else if (type === "critical") createTone("sawtooth", 600, 100, now, 0.35, 0.3);
            else if (type === "shield") createTone("square", 540, 920, now, 0.18, 0.18);
            else if (type === "magic") createTone("sine", 420, 1260, now, 0.3, 0.2);
            else if (type === "tie") createTone("sine", 400, 400, now, 0.15, 0.1);
            else if (type === "win") [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => createTone("triangle", freq, freq, now + idx * 0.09, 0.25, 0.16));
            else if (type === "lose") [392, 349.23, 311.13, 261.63].forEach((freq, idx) => createTone("sawtooth", freq, freq, now + idx * 0.12, 0.28, 0.15));
        } catch (e) {}
    }

    function playSound(type) {
        if (USE_EXTERNAL_AUDIO && sounds[type]) {
            try {
                if (sounds[type].readyState >= 2) sounds[type].currentTime = 0;
                sounds[type].volume = AUDIO_VOL[type] || 1.0;
                sounds[type].play().catch(() => playSynthFallback(type));
            } catch (e) { playSynthFallback(type); }
        } else {
            playSynthFallback(type);
        }
    }

    function switchBGM(target) {
        if (!USE_EXTERNAL_AUDIO || !sounds[target]) return;

        const nextTrack = sounds[target];
        const targetVol = AUDIO_VOL[target] || 0.2;

        if (currentBGMKey === target && !nextTrack.paused && bgmFadeRafId === null) {
            nextTrack.volume = targetVol;
            return;
        }

        if (bgmFadeRafId !== null) {
            cancelAnimationFrame(bgmFadeRafId);
            bgmFadeRafId = null;
        }

        const prevKey = currentBGMKey;
        const prevTrack = prevKey && sounds[prevKey] ? sounds[prevKey] : null;
        const prevStartVol = prevTrack ? prevTrack.volume : 0;

        ["lobby", "battle"].forEach(key => {
            if (sounds[key] && sounds[key] !== prevTrack && sounds[key] !== nextTrack) {
                sounds[key].pause();
                sounds[key].currentTime = 0;
                sounds[key].volume = 0;
            }
        });

        currentBGMKey = target;
        const nextStartVol = nextTrack.paused ? 0 : nextTrack.volume;
        nextTrack.volume = nextStartVol;
        nextTrack.play().catch(() => {});

        const startTime = performance.now();

        function stepFade(now) {
            const progress = Math.min(1, (now - startTime) / FADE_DURATION_MS);

            if (prevTrack && prevTrack !== nextTrack) {
                prevTrack.volume = Math.max(0, prevStartVol * (1 - progress));
            }
            nextTrack.volume = Math.min(targetVol, nextStartVol + (targetVol - nextStartVol) * progress);

            if (progress < 1) {
                bgmFadeRafId = requestAnimationFrame(stepFade);
            } else {
                if (prevTrack && prevTrack !== nextTrack) {
                    prevTrack.pause();
                    prevTrack.currentTime = 0; 
                    prevTrack.volume = 0;
                }
                nextTrack.volume = targetVol;
                bgmFadeRafId = null;
            }
        }

        bgmFadeRafId = requestAnimationFrame(stepFade);
    }

    return { playSound, switchBGM, stopAllBGM };
})();