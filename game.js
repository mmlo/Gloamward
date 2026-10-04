"use strict";

/* Gloamward — an original lantern platformer. Art, music, and words are original. */

const W = 480, H = 270, TILE = 16;
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const SAVE_KEY = "gloamward_v1";

const COL = {
  ink: "#080610",
  deepNight: "#05040d",
  skyDusk: "#140e26",
  skyTeal: "#13212c",
  fog: "#241c2e",
  fogGlow: "#453858",
  paper: "#f3ead7",
  dim: "#9c8b77",
  cloak: "#32254a",
  cloakHi: "#5c4c80",
  cloakShadow: "#1a1328",
  scarf: "#d83848",
  scarfHi: "#f25664",
  skin: "#f3c7a5",
  hair: "#2a211c",
  brass: "#c9843a",
  brassHi: "#e8a855",
  flame: "#ffe08a",
  flame2: "#ff7a32",
  flameCore: "#ffffff",
  moss: "#5e9e54",
  mossHi: "#8edb80",
  mossDark: "#264e28",
  leaf: "#214c38",
  trunk: "#483020",
  trunkHi: "#6a4a32",
  cave: "#1c2a3c",
  caveHi: "#324a66",
  crystal: "#54edd9",
  crystalHi: "#bafcf3",
  tower: "#5c3e28",
  towerHi: "#8a6242",
  gold: "#e4b45e",
  goldHi: "#ffe599",
  goldDark: "#946a2a",
  danger: "#d64555",
  dangerHi: "#ff6b7b",
  shard: "#8fd2ff",
  shardHi: "#d8f0ff",
  white: "#fff8ec",
  uiBg: "rgba(14, 10, 20, 0.88)",
  uiBorder: "#5c4a36",
  uiHot: "#ffe08a",
};

// Ambient floating motes and ember particles
const ambientMotes = [];
for (let i = 0; i < 40; i++) {
  ambientMotes.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3 + 0.15,
    vy: -0.2 - Math.random() * 0.35,
    size: Math.random() < 0.35 ? 1.5 : 1,
    alpha: Math.random() * 0.7 + 0.25,
    phase: Math.random() * Math.PI * 2,
    color: Math.random() < 0.65 ? COL.flame : Math.random() < 0.85 ? COL.flame2 : COL.crystal,
  });
}
function updateAmbientMotes() {
  for (const m of ambientMotes) {
    m.x += m.vx + Math.sin(performance.now() * 0.0012 + m.phase) * 0.2;
    m.y += m.vy;
    if (m.y < -10) { m.y = H + 5; m.x = Math.random() * W; }
    if (m.x > W + 10) m.x = -5;
    if (m.x < -10) m.x = W + 5;
  }
}
function drawAmbientMotes(alphaMult = 1) {
  for (const m of ambientMotes) {
    const pulse = 0.4 + 0.6 * Math.sin(performance.now() * 0.003 + m.phase);
    ctx.save();
    ctx.globalAlpha = m.alpha * pulse * alphaMult;
    ctx.fillStyle = m.color;
    ctx.fillRect(Math.round(m.x), Math.round(m.y), m.size, m.size);
    ctx.restore();
  }
}

const LEVELS = [];

function emptyMap(w, h, ch = ".") {
  return Array.from({ length: h }, () => Array(w).fill(ch));
}
function fill(m, x, y, w, h, ch) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const yy = y + j, xx = x + i;
    if (m[yy] && m[yy][xx] !== undefined) m[yy][xx] = ch;
  }
}
function set(m, x, y, ch) { if (m[y] && m[y][x] !== undefined) m[y][x] = ch; }

function buildForest() {
  const w = 78, h = 17;
  const m = emptyMap(w, h);
  fill(m, 0, 15, w, 2, "#");
  fill(m, 0, 14, 18, 1, "#");
  fill(m, 22, 14, 16, 1, "#");
  fill(m, 42, 14, 14, 1, "#");
  fill(m, 60, 14, 18, 1, "#");
  // pits
  fill(m, 18, 14, 4, 3, ".");
  fill(m, 38, 14, 4, 3, ".");
  fill(m, 56, 14, 4, 3, ".");
  fill(m, 18, 16, 4, 1, "^");
  fill(m, 38, 16, 4, 1, "^");
  fill(m, 56, 16, 4, 1, "^");
  // step platforms
  fill(m, 8, 11, 5, 1, "=");
  fill(m, 24, 11, 4, 1, "=");
  fill(m, 44, 10, 4, 1, "=");
  // shadow bridge over second pit approach and a dark hollow
  fill(m, 33, 14, 5, 1, "-");
  fill(m, 48, 12, 6, 1, "-");
  fill(m, 64, 11, 5, 1, "-");
  // wall-jump chimney on solid ground, open at the feet
  fill(m, 26, 8, 1, 5, "#");
  fill(m, 29, 8, 1, 5, "#");
  fill(m, 27, 8, 2, 1, "#");
  set(m, 27, 9, "*");
  // a pillar too tall to vault, so the road asks for a wall jump
  fill(m, 34, 9, 1, 5, "#");
  // side shard ledge
  fill(m, 50, 8, 3, 1, "=");
  set(m, 51, 7, "*");
  // late shard
  fill(m, 70, 8, 3, 1, "#");
  set(m, 71, 7, "*");
  // enemies
  set(m, 12, 13, "M");
  set(m, 46, 13, "M");
  set(m, 66, 13, "F");
  // beacons + exit + start
  set(m, 16, 13, "B");
  set(m, 41, 13, "B");
  set(m, 62, 13, "B");
  set(m, 74, 13, "X");
  set(m, 3, 13, "P");
  // a little canopy solid so the chimney reads
  fill(m, 0, 0, w, 1, "#");
  return m;
}

function buildCave() {
  const w = 72, h = 18;
  const m = emptyMap(w, h);
  fill(m, 0, 0, w, 1, "#");
  fill(m, 0, 16, w, 2, "#");
  fill(m, 0, 15, 14, 1, "#");
  fill(m, 18, 15, 12, 1, "#");
  fill(m, 34, 15, 12, 1, "#");
  fill(m, 50, 15, 22, 1, "#");
  fill(m, 14, 15, 4, 3, ".");
  fill(m, 30, 15, 4, 3, ".");
  fill(m, 46, 15, 4, 3, ".");
  fill(m, 14, 17, 4, 1, "^");
  fill(m, 30, 17, 4, 1, "^");
  fill(m, 46, 17, 4, 1, "^");
  // stalactite lips
  fill(m, 20, 1, 2, 3, "#");
  fill(m, 40, 1, 2, 4, "#");
  fill(m, 58, 1, 2, 3, "#");
  // shadow floor patches — main path needs the lantern
  fill(m, 16, 15, 6, 1, "-");
  fill(m, 36, 13, 7, 1, "-");
  fill(m, 52, 12, 6, 1, "-");
  // required wall-jump shaft, open at the floor
  fill(m, 24, 6, 1, 8, "#");
  fill(m, 27, 6, 1, 8, "#");
  fill(m, 25, 6, 2, 1, "=");
  set(m, 25, 7, "*");
  // upper road after shaft
  fill(m, 28, 9, 4, 1, "#");
  fill(m, 44, 12, 4, 1, "=");
  set(m, 45, 11, "*");
  fill(m, 58, 12, 3, 1, "=");
  set(m, 59, 11, "*");
  // spikes on a tease ledge
  fill(m, 48, 14, 3, 1, "^");
  set(m, 10, 14, "M");
  set(m, 40, 14, "M");
  set(m, 60, 14, "F");
  set(m, 33, 8, "F");
  set(m, 12, 14, "B");
  set(m, 39, 14, "B");
  set(m, 64, 14, "B");
  set(m, 69, 14, "X");
  set(m, 3, 14, "P");
  return m;
}

function buildTower() {
  const w = 26, h = 46;
  const m = emptyMap(w, h);
  fill(m, 0, 0, w, 1, "#");
  fill(m, 0, 0, 1, h, "#");
  fill(m, w - 1, 0, 1, h, "#");
  fill(m, 0, h - 2, w, 2, "#");
  // floors with gaps, ascending
  const floors = [42, 39, 36, 33, 30, 27, 24, 21, 18, 15, 12, 9];
  floors.forEach((y, i) => {
    if (i % 2 === 0) fill(m, 1, y, 16, 1, "#");
    else fill(m, 9, y, 16, 1, "#");
    if (i === 4) fill(m, 9, y, 6, 1, "-");
  });
  fill(m, 4, 41, 2, 1, "^");
  fill(m, 18, 35, 2, 1, "^");
  fill(m, 3, 29, 2, 1, "^");
  fill(m, 2, 33, 3, 1, "=");
  set(m, 3, 32, "*");
  fill(m, 20, 23, 4, 1, "=");
  set(m, 21, 22, "*");
  fill(m, 2, 14, 3, 1, "=");
  set(m, 3, 13, "*");
  set(m, 6, 41, "B");
  set(m, 18, 26, "B");
  set(m, 8, 14, "B");
  set(m, 18, 8, "X");
  set(m, 4, 43, "P");
  set(m, 12, 41, "M");
  set(m, 16, 26, "F");
  set(m, 8, 20, "M");
  set(m, 18, 11, "F");
  return m;
}

function buildBoss() {
  const w = 30, h = 16;
  const m = emptyMap(w, h);
  fill(m, 0, 0, w, 1, "#");
  fill(m, 0, 0, 1, h, "#");
  fill(m, w - 1, 0, 1, h, "#");
  fill(m, 0, 14, w, 2, "#");
  fill(m, 3, 10, 5, 1, "=");
  fill(m, 22, 10, 5, 1, "=");
  fill(m, 11, 8, 8, 1, "-");
  set(m, 4, 9, "*");
  set(m, 24, 9, "*");
  set(m, 14, 7, "*");
  set(m, 5, 13, "B");
  set(m, 24, 13, "B");
  set(m, 15, 13, "B");
  set(m, 4, 13, "P");
  set(m, 27, 13, "X");
  return m;
}

LEVELS.push({
  id: "forest",
  name: "Bramble Mile",
  place: "The swallowed wood",
  map: buildForest(),
  par: 75,
  music: "forest",
  biome: "forest",
  movers: [],
  swings: [],
  boss: false,
});
LEVELS.push({
  id: "cave",
  name: "Glassthroat",
  place: "A cave that keeps its own night",
  map: buildCave(),
  par: 90,
  music: "cave",
  biome: "cave",
  movers: [
    { x: 48, y: 12.2, w: 3, h: 0.45, axis: "x", min: 46, max: 54, speed: 0.018 },
  ],
  swings: [],
  boss: false,
});
LEVELS.push({
  id: "tower",
  name: "The Twelve Bells",
  place: "A spire that still counts hours",
  map: buildTower(),
  par: 110,
  music: "tower",
  biome: "tower",
  movers: [
    { x: 14, y: 40.1, w: 3, h: 0.45, axis: "x", min: 12, max: 20, speed: 0.02 },
    { x: 6, y: 34.1, w: 3, h: 0.45, axis: "y", min: 31, max: 36, speed: 0.016 },
    { x: 16, y: 22.1, w: 3, h: 0.45, axis: "x", min: 12, max: 20, speed: 0.022 },
    { x: 6, y: 16.1, w: 3, h: 0.45, axis: "x", min: 4, max: 12, speed: 0.02 },
  ],
  swings: [
    { x: 20, y: 37, len: 2.2, speed: 0.03, phase: 0 },
    { x: 6, y: 19, len: 2.2, speed: 0.04, phase: 1.2 },
  ],
  boss: false,
});
LEVELS.push({
  id: "boss",
  name: "Keeper of the Last Wick",
  place: "The bell that ate the sun",
  map: buildBoss(),
  par: 80,
  music: "boss",
  biome: "boss",
  movers: [],
  swings: [],
  boss: true,
});

function mapSize(level) {
  return { w: level.map[0].length, h: level.map.length };
}
function tileAt(level, tx, ty) {
  if (ty < 0 || tx < 0 || ty >= level.map.length || tx >= level.map[0].length) return "#";
  return level.map[ty][tx];
}

/* ---------------- input ---------------- */
const keys = new Set();
const input = {
  x: 0, jump: false, jumpPressed: false, jumpReleased: false,
  dash: false, dashPressed: false, down: false, pausePressed: false,
};
const btnState = { l: false, r: false, dn: false, j: false, d: false };

addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  keys.add(e.code);
  if (e.code === "Escape" || e.code === "KeyP") input.pausePressed = true;
  if (e.repeat) return;
  if (e.code === "Space" || e.code === "KeyZ" || e.code === "ArrowUp" || e.code === "KeyW") input.jumpPressed = true;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "KeyX" || e.code === "KeyK") input.dashPressed = true;
});
addEventListener("keyup", (e) => {
  keys.delete(e.code);
  if (e.code === "Space" || e.code === "KeyZ" || e.code === "ArrowUp" || e.code === "KeyW") input.jumpReleased = true;
});

function toggleFullscreen() {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (!isFs) {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) req.call(el).catch(() => {});
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit) exit.call(document).catch(() => {});
  }
}

function updateFullscreenBtn() {
  const btnFS = document.getElementById("btnFS");
  if (!btnFS) return;
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
  btnFS.textContent = isFs ? "✕" : "⛶";
  btnFS.title = isFs ? "Exit Fullscreen" : "Fullscreen";
}
document.addEventListener("fullscreenchange", updateFullscreenBtn);
document.addEventListener("webkitfullscreenchange", updateFullscreenBtn);

function setupTouchControls() {
  const dirBtns = [
    { el: document.getElementById("btnL"), key: "l" },
    { el: document.getElementById("btnDn"), key: "dn" },
    { el: document.getElementById("btnR"), key: "r" },
  ];

  let dirPointerId = null;

  function updateDirStates(x, y) {
    for (const b of dirBtns) {
      if (!b.el) continue;
      const rect = b.el.getBoundingClientRect();
      const inside = x >= rect.left - 16 && x <= rect.right + 16 &&
                     y >= rect.top - 16 && y <= rect.bottom + 16;
      btnState[b.key] = inside;
      b.el.classList.toggle("active", inside);
    }
  }

  function clearDirs() {
    for (const b of dirBtns) {
      btnState[b.key] = false;
      if (b.el) b.el.classList.remove("active");
    }
  }

  for (const b of dirBtns) {
    if (!b.el) continue;
    b.el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      ensureAudio();
      dirPointerId = e.pointerId;
      try { b.el.setPointerCapture(e.pointerId); } catch (_) {}
      updateDirStates(e.clientX, e.clientY);
    });

    b.el.addEventListener("pointermove", (e) => {
      if (e.pointerId === dirPointerId) {
        updateDirStates(e.clientX, e.clientY);
      }
    });

    const releaseDir = (e) => {
      if (e.pointerId === dirPointerId) {
        dirPointerId = null;
        clearDirs();
        try { b.el.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    b.el.addEventListener("pointerup", releaseDir);
    b.el.addEventListener("pointercancel", releaseDir);
  }

  const btnJ = document.getElementById("btnJ");
  let jumpPointerId = null;
  if (btnJ) {
    btnJ.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      ensureAudio();
      jumpPointerId = e.pointerId;
      btnState.j = true;
      input.jumpPressed = true;
      btnJ.classList.add("active");
      try { btnJ.setPointerCapture(e.pointerId); } catch (_) {}
    });
    btnJ.addEventListener("pointermove", (e) => {
      if (e.pointerId === jumpPointerId) {
        const r = btnJ.getBoundingClientRect();
        const inside = e.clientX >= r.left - 24 && e.clientX <= r.right + 24 &&
                       e.clientY >= r.top - 24 && e.clientY <= r.bottom + 24;
        btnState.j = inside;
        btnJ.classList.toggle("active", inside);
      }
    });
    const releaseJump = (e) => {
      if (e.pointerId === jumpPointerId) {
        jumpPointerId = null;
        btnState.j = false;
        input.jumpReleased = true;
        btnJ.classList.remove("active");
        try { btnJ.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    btnJ.addEventListener("pointerup", releaseJump);
    btnJ.addEventListener("pointercancel", releaseJump);
  }

  const btnD = document.getElementById("btnD");
  let dashPointerId = null;
  if (btnD) {
    btnD.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      ensureAudio();
      dashPointerId = e.pointerId;
      btnState.d = true;
      input.dashPressed = true;
      btnD.classList.add("active");
      try { btnD.setPointerCapture(e.pointerId); } catch (_) {}
    });
    btnD.addEventListener("pointermove", (e) => {
      if (e.pointerId === dashPointerId) {
        const r = btnD.getBoundingClientRect();
        const inside = e.clientX >= r.left - 24 && e.clientX <= r.right + 24 &&
                       e.clientY >= r.top - 24 && e.clientY <= r.bottom + 24;
        btnState.d = inside;
        btnD.classList.toggle("active", inside);
      }
    });
    const releaseDash = (e) => {
      if (e.pointerId === dashPointerId) {
        dashPointerId = null;
        btnState.d = false;
        btnD.classList.remove("active");
        try { btnD.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    btnD.addEventListener("pointerup", releaseDash);
    btnD.addEventListener("pointercancel", releaseDash);
  }

  const btnP = document.getElementById("btnP");
  if (btnP) {
    btnP.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      ensureAudio();
      input.pausePressed = true;
    });
  }

  const btnFS = document.getElementById("btnFS");
  if (btnFS) {
    const fsSupported = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled ||
      document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
    if (!fsSupported) {
      btnFS.style.display = "none";
    } else {
      btnFS.addEventListener("click", (e) => {
        e.preventDefault();
        ensureAudio();
        toggleFullscreen();
      });
    }
  }
}
setupTouchControls();

let padJumpWas = false, padDashWas = false, padPauseWas = false;
function pollPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let used = false;
  for (const gp of pads) {
    if (!gp) continue;
    used = true;
    const ax = gp.axes[0] || 0;
    const ay = gp.axes[1] || 0;
    if (Math.abs(ax) > 0.28) input.x += ax;
    if (ay > 0.45) input.down = true;
    const dL = gp.buttons[14] && gp.buttons[14].pressed;
    const dR = gp.buttons[15] && gp.buttons[15].pressed;
    const dU = gp.buttons[12] && gp.buttons[12].pressed;
    const dD = gp.buttons[13] && gp.buttons[13].pressed;
    if (dL) input.x -= 1;
    if (dR) input.x += 1;
    if (dD) input.down = true;
    const jump = (gp.buttons[0] && gp.buttons[0].pressed) || dU;
    const dash = gp.buttons[1] && gp.buttons[1].pressed;
    const pause = (gp.buttons[9] && gp.buttons[9].pressed) || (gp.buttons[8] && gp.buttons[8].pressed);
    if (jump && !padJumpWas) input.jumpPressed = true;
    if (!jump && padJumpWas) input.jumpReleased = true;
    if (dash && !padDashWas) input.dashPressed = true;
    if (pause && !padPauseWas) input.pausePressed = true;
    padJumpWas = !!jump;
    padDashWas = !!dash;
    padPauseWas = !!pause;
    input.jump = input.jump || !!jump;
  }
  return used;
}

function gatherInput() {
  input.x = 0;
  input.jump = false;
  input.down = false;
  if (keys.has("ArrowLeft") || keys.has("KeyA") || btnState.l) input.x -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD") || btnState.r) input.x += 1;
  if (keys.has("Space") || keys.has("KeyZ") || keys.has("ArrowUp") || keys.has("KeyW") || btnState.j) input.jump = true;
  if (keys.has("ArrowDown") || keys.has("KeyS") || btnState.dn) input.down = true;
  input.dash = keys.has("ShiftLeft") || keys.has("ShiftRight") || keys.has("KeyX") || keys.has("KeyK") || btnState.d;
  pollPad();
  if (input.x > 1) input.x = 1;
  if (input.x < -1) input.x = -1;
}
function endInput() {
  input.jumpPressed = false;
  input.jumpReleased = false;
  input.dashPressed = false;
  input.pausePressed = false;
}

/* ---------------- audio (original, synthesized) ---------------- */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;
const music = { timer: null, step: 0, gain: null, theme: "forest" };
const SONGS = {
  forest: { bpm: 96, bass: [45, 45, 41, 43, 38, 38, 43, 41], lead: [69, 72, 74, 72, 69, 67, 65, 67, 72, 76, 74, 72, 69, 65, 67, 64] },
  cave: { bpm: 78, bass: [38, 38, 41, 36, 34, 36, 38, 41], lead: [62, 65, 69, 65, 62, 60, 58, 60, 65, 69, 72, 69, 65, 62, 60, 58] },
  tower: { bpm: 110, bass: [40, 40, 47, 40, 43, 40, 45, 43], lead: [64, 67, 71, 67, 64, 62, 64, 67, 71, 74, 71, 67, 64, 62, 60, 62] },
  boss: { bpm: 132, bass: [36, 36, 43, 36, 34, 36, 41, 43], lead: [60, 63, 67, 63, 72, 67, 63, 60, 67, 70, 72, 70, 67, 63, 60, 58] },
};

function ensureAudio() {
  if (!actx) actx = new AudioCtx();
  if (actx.state === "suspended") actx.resume();
  return actx;
}
function envGain(duration, peak = 0.2) {
  const g = actx.createGain();
  g.gain.setValueAtTime(0.0001, actx.currentTime);
  g.gain.exponentialRampToValueAtTime(peak, actx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);
  return g;
}
function tone(freq, dur, type, peak, dest) {
  if (!actx || settings.sfx <= 0 && dest !== music.gain) return;
  const o = actx.createOscillator();
  const g = envGain(dur, peak * (dest === music.gain ? 1 : settings.sfx));
  o.type = type;
  o.frequency.setValueAtTime(freq, actx.currentTime);
  o.connect(g);
  g.connect(dest || actx.destination);
  o.start();
  o.stop(actx.currentTime + dur + 0.02);
}
function noise(dur, peak) {
  if (!actx || settings.sfx <= 0) return;
  const n = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
  const d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = actx.createBufferSource();
  s.buffer = n;
  const g = actx.createGain();
  g.gain.value = peak * settings.sfx;
  const f = actx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 400;
  s.connect(f); f.connect(g); g.connect(actx.destination);
  s.start();
}
const sfx = {
  jump: () => { tone(420, 0.12, "square", 0.08); tone(640, 0.1, "triangle", 0.05); },
  dash: () => { noise(0.12, 0.18); tone(180, 0.14, "sawtooth", 0.06); },
  land: () => noise(0.06, 0.08),
  stomp: () => { tone(140, 0.16, "square", 0.12); noise(0.1, 0.12); },
  hurt: () => { tone(220, 0.22, "sawtooth", 0.1); tone(110, 0.28, "square", 0.08); },
  beacon: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.22, "triangle", 0.1), i * 70)); },
  shard: () => { tone(880, 0.12, "square", 0.08); tone(1320, 0.16, "triangle", 0.06); },
  die: () => { noise(0.25, 0.16); tone(180, 0.3, "sawtooth", 0.08); },
  win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.28, "triangle", 0.1), i * 110)); },
  ui: () => tone(660, 0.06, "square", 0.05),
};

function startMusic(theme) {
  ensureAudio();
  stopMusic();
  music.theme = theme;
  music.step = 0;
  if (!music.gain) {
    music.gain = actx.createGain();
    music.gain.connect(actx.destination);
  }
  music.gain.gain.value = 0.12 * settings.music;
  const song = SONGS[theme] || SONGS.forest;
  const interval = (60 / song.bpm) * 500;
  music.timer = setInterval(() => {
    if (!actx || settings.music <= 0) return;
    music.gain.gain.value = 0.14 * settings.music;
    const i = music.step % song.lead.length;
    const b = song.bass[music.step % song.bass.length];
    tone(midi(song.lead[i]), 0.22, "square", 0.04, music.gain);
    if (music.step % 2 === 0) tone(midi(b), 0.34, "triangle", 0.07, music.gain);
    if (theme === "tower" && music.step % 2 === 0) noise(0.03, 0.04 * settings.music);
    music.step++;
  }, interval);
}
function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
function stopMusic() {
  if (music.timer) clearInterval(music.timer);
  music.timer = null;
}

/* ---------------- save / settings ---------------- */
let settings = { music: 0.7, sfx: 0.85, shake: true, touch: "on" };
let save = { tutorial: false, unlocked: 0, best: {} };
function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    save = Object.assign({ tutorial: false, unlocked: 0, best: {} }, raw);
    settings = Object.assign(settings, raw.settings || {});
  } catch (e) { /* keep defaults */ }
}
function writeSave() {
  const data = Object.assign({}, save, { settings });
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
loadSave();

/* ---------------- particles / shake ---------------- */
const particles = [];
function burst(x, y, color, n = 8, speed = 1.6) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.4 + Math.random());
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.4, life: 18 + Math.random() * 16, color, g: 0.04, size: 1 + (Math.random() < 0.4 ? 1 : 0) });
  }
}
let shake = 0;
function addShake(n) { if (settings.shake) shake = Math.max(shake, n); }
let hitstop = 0;

/* ---------------- runtime ---------------- */
const game = {
  screen: "title",
  levelIndex: 0,
  level: null,
  player: null,
  enemies: [],
  shards: [],
  beacons: [],
  movers: [],
  swings: [],
  boss: null,
  cam: { x: 0, y: 0 },
  time: 0,
  deaths: 0,
  paused: false,
  fade: 0,
  fadeDir: 0,
  pending: null,
  toast: "",
  toastT: 0,
  intro: 0,
  menuIndex: 0,
  results: null,
  tutorialStep: 0,
  seen: {},
  bestFlash: false,
  ending: 0,
};

function resetInputEdges() { endInput(); }

function makePlayer(x, y) {
  return {
    x, y, w: 10, h: 14, vx: 0, vy: 0,
    facing: 1, grounded: false, wall: 0,
    coyote: 0, buffer: 0, hold: 0,
    jumpCut: false, dashT: 0, dashCd: 0, canDash: true,
    wallLock: 0, inv: 0, hp: 3, maxHp: 3,
    squash: 1, anim: 0, blink: 0,
    lantern: 0, onMover: null, linger: new Map(),
    dead: false, win: false,
  };
}

function parseLevel(index) {
  const level = LEVELS[index];
  game.level = level;
  game.levelIndex = index;
  game.enemies = [];
  game.shards = [];
  game.beacons = [];
  game.movers = level.movers.map((mv, i) => Object.assign({ id: i, t: 0, px: mv.x * TILE, py: mv.y * TILE }, mv));
  game.swings = level.swings.map((s) => Object.assign({ a: s.phase }, s));
  game.boss = null;
  let px = 40, py = 40;
  for (let y = 0; y < level.map.length; y++) {
    for (let x = 0; x < level.map[0].length; x++) {
      const t = level.map[y][x];
      const wx = x * TILE, wy = y * TILE;
      if (t === "P") px = wx + 2, py = wy + 2;
      if (t === "M") game.enemies.push(makeEnemy(wx, wy, "mite"));
      if (t === "F") game.enemies.push(makeEnemy(wx, wy - 10, "moth"));
      if (t === "*") game.shards.push({ x: wx + 4, y: wy + 2, got: false, bob: Math.random() * 6 });
      if (t === "B") game.beacons.push({ x: wx + 8, y: wy + 16, lit: false, tx: x, ty: y });
    }
  }
  game.player = makePlayer(px, py);
  game.cam.x = px - W / 2;
  game.cam.y = py - H / 2;
  game.time = 0;
  game.deaths = 0;
  game.toast = "";
  game.intro = 150;
  game.tutorialStep = save.tutorial ? 99 : 0;
  game.seen = {};
  if (level.boss) spawnBoss();
  startMusic(level.music);
}

function makeEnemy(x, y, kind) {
  return { x, y, w: kind === "moth" ? 12 : 12, h: kind === "moth" ? 8 : 10, vx: kind === "moth" ? 0.4 : 0.55, kind, dir: Math.random() < 0.5 ? -1 : 1, hp: 1, flee: 0, lightT: 0, dead: false, anim: Math.random() * 10, homeY: y };
}
function spawnBoss() {
  game.boss = {
    x: 200, y: 70, w: 28, h: 32, vx: 0.6, dir: 1,
    hp: 3, phase: "idle", timer: 90, vulnerable: 0, anim: 0, hit: 0,
  };
}

function lightAmount(px, py) {
  const p = game.player;
  if (!p) return 0;
  let best = 0;
  const sources = [[p.x + 8 + p.facing * 4, p.y + 6, 78 + Math.sin(p.lantern) * 3]];
  for (const b of game.beacons) if (b.lit) sources.push([b.x, b.y - 10, 118]);
  if (game.boss && game.boss.vulnerable > 0) sources.push([game.boss.x + 14, game.boss.y + 10, 70]);
  for (const s of sources) {
    const d = Math.hypot(px - s[0], py - s[1]);
    const r = s[2];
    const a = 1 - Math.max(0, Math.min(1, (d - r * 0.25) / (r * 0.75)));
    if (a > best) best = a;
  }
  return best;
}
function tileLit(tx, ty) {
  const c = lightAmount(tx * TILE + 8, ty * TILE + 8);
  const key = tx + "," + ty;
  const linger = game.player && game.player.linger.get(key) > 0;
  return c > 0.28 || linger;
}

function rectHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function isSolidTile(t, tx, ty, forFeet) {
  if (t === "#") return true;
  if (t === "~") return tileLit(tx, ty);
  if (!forFeet && (t === "=" || t === "-")) return false;
  return false;
}

function collide(ent, prevY) {
  const level = game.level;
  ent.grounded = false;
  ent.wall = 0;
  // X
  ent.x += ent.vx;
  let x0 = Math.floor(ent.x / TILE), x1 = Math.floor((ent.x + ent.w - 0.01) / TILE);
  let y0 = Math.floor(ent.y / TILE), y1 = Math.floor((ent.y + ent.h - 0.01) / TILE);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = tileAt(level, tx, ty);
    if (t === "#" || (t === "~" && tileLit(tx, ty))) {
      const left = tx * TILE, right = left + TILE;
      if (ent.vx > 0 && ent.x + ent.w > left && ent.x < left) { ent.x = left - ent.w; ent.vx = 0; ent.wall = 1; }
      else if (ent.vx < 0 && ent.x < right && ent.x + ent.w > right) { ent.x = right; ent.vx = 0; ent.wall = -1; }
    }
  }
  // movers as solids
  ent.onMover = null;
  // Y
  ent.y += ent.vy;
  x0 = Math.floor(ent.x / TILE); x1 = Math.floor((ent.x + ent.w - 0.01) / TILE);
  y0 = Math.floor(ent.y / TILE); y1 = Math.floor((ent.y + ent.h - 0.01) / TILE);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = tileAt(level, tx, ty);
    const shadowOk = t === "~" || t === "-" ? tileLit(tx, ty) : true;
    const full = t === "#" || (t === "~" && shadowOk);
    const one = (t === "=" || (t === "-" && shadowOk));
    if (full || one) {
      const top = ty * TILE, bot = top + TILE;
      if (ent.vy >= 0 && ent.y + ent.h > top && prevY + ent.h <= top + 2 && ent.y < top) {
        if (one && input.down && input.jumpPressed) continue;
        ent.y = top - ent.h;
        ent.vy = 0;
        ent.grounded = true;
      } else if (full && ent.vy < 0 && ent.y < bot && ent.y + ent.h > bot) {
        ent.y = bot;
        ent.vy = 0;
      }
    }
  }
  // moving platforms
  for (const mv of game.movers) {
    const mx = mv.px, my = mv.py, mw = mv.w * TILE, mh = 8;
    if (ent.vy >= 0 && ent.x + ent.w > mx + 2 && ent.x < mx + mw - 2 && prevY + ent.h <= my + 3 && ent.y + ent.h >= my && ent.y < my) {
      ent.y = my - ent.h;
      ent.vy = 0;
      ent.grounded = true;
      ent.onMover = mv;
    }
  }
}

function killPlayer() {
  const p = game.player;
  if (p.dead || p.inv > 0) return;
  p.hp -= 1;
  sfx.hurt();
  addShake(5);
  hitstop = 4;
  burst(p.x + 5, p.y + 7, COL.scarf, 10, 1.8);
  if (p.hp <= 0) {
    p.dead = true;
    p.vx = 0;
    sfx.die();
    game.deaths++;
    game.fade = 0;
    game.fadeDir = 1;
    game.pending = "respawn";
  } else {
    p.inv = 70;
    p.vy = -4;
    p.vx = -p.facing * 1.5;
  }
}

function respawn() {
  const p = game.player;
  let x = 40, y = 40;
  // last lit beacon, else start
  let best = null;
  for (const b of game.beacons) if (b.lit) best = b;
  if (best) { x = best.x - 6; y = best.y - 28; }
  else {
    const level = game.level;
    for (let ty = 0; ty < level.map.length; ty++) for (let tx = 0; tx < level.map[0].length; tx++) {
      if (level.map[ty][tx] === "P") { x = tx * TILE + 2; y = ty * TILE + 2; }
    }
  }
  p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.dead = false; p.hp = p.maxHp; p.inv = 80; p.dashT = 0; p.canDash = true;
}

function lightBeacon(b) {
  if (b.lit) return;
  b.lit = true;
  sfx.beacon();
  addShake(3);
  burst(b.x, b.y - 12, COL.flame, 16, 2);
  game.toast = "Beacon lit";
  game.toastT = 90;
  // checkpoint implicit
}

function updatePlayer() {
  const p = game.player;
  if (!p || p.dead) return;
  p.anim++;
  p.lantern += 0.12;
  if (p.blink > 0) p.blink--;
  else if (Math.random() < 0.005) p.blink = 6;
  if (p.inv > 0) p.inv--;
  if (p.wallLock > 0) p.wallLock--;
  if (p.dashCd > 0) p.dashCd--;
  p.squash += (1 - p.squash) * 0.2;

  // linger light on tiles near player
  const tx = Math.floor((p.x + p.w / 2) / TILE), ty = Math.floor((p.y + p.h) / TILE);
  for (let j = -3; j <= 3; j++) for (let i = -4; i <= 4; i++) {
    const key = (tx + i) + "," + (ty + j);
    if (lightAmount((tx + i) * TILE + 8, (ty + j) * TILE + 8) > 0.3) p.linger.set(key, 12);
  }
  for (const [k, v] of p.linger) {
    if (v <= 1) p.linger.delete(k);
    else p.linger.set(k, v - 1);
  }

  const prevY = p.y;
  if (!p.grounded) {
    const dir = input.x || 0;
    if (dir) {
      const tx = Math.floor((p.x + (dir > 0 ? p.w + 1 : -1)) / TILE);
      const y0 = Math.floor((p.y + 2) / TILE);
      const y1 = Math.floor((p.y + p.h - 2) / TILE);
      for (let ty = y0; ty <= y1; ty++) {
        if (tileAt(game.level, tx, ty) === "#") { p.wall = dir > 0 ? 1 : -1; break; }
      }
    }
  }
  if (p.grounded) { p.coyote = 8; p.canDash = true; }
  else if (p.coyote > 0) p.coyote--;
  if (input.jumpPressed) p.buffer = 8;
  else if (p.buffer > 0) p.buffer--;

  if (p.dashT > 0) {
    p.dashT--;
    p.vy = 0;
    collide(p, prevY);
    if (p.dashT === 0) p.vx *= 0.35;
    return;
  }

  const accel = p.grounded ? 0.55 : 0.32;
  const max = 2.35;
  if (p.wallLock <= 0) {
    if (input.x !== 0) {
      p.vx += input.x * accel;
      p.facing = input.x > 0 ? 1 : -1;
    } else {
      p.vx *= p.grounded ? 0.68 : 0.92;
    }
  }
  if (p.vx > max) p.vx = max;
  if (p.vx < -max) p.vx = -max;

  // wall slide
  if (!p.grounded && p.wall !== 0 && input.x === p.wall && p.vy > 0) {
    p.vy = Math.min(p.vy, 1.05);
    if (p.anim % 4 === 0) burst(p.x + (p.wall > 0 ? p.w : 0), p.y + p.h, "#c8b8a0", 1, 0.4);
  }

  const grav = 0.36;
  p.vy += grav;
  if (p.vy > 6.4) p.vy = 6.4;

  if (input.jumpReleased && p.vy < -1.6) p.vy *= 0.52;

  if (p.buffer > 0 && (p.coyote > 0 || p.wall !== 0)) {
    if (p.wall !== 0 && !p.grounded && p.coyote <= 0) {
      p.vy = -6.7;
      p.vx = -p.wall * 3.6;
      p.facing = -p.wall;
      p.wallLock = 8;
      p.canDash = true;
      sfx.jump();
      burst(p.x, p.y + 8, COL.paper, 5, 1);
    } else {
      p.vy = -7.15;
      p.coyote = 0;
      sfx.jump();
      p.squash = 0.7;
      burst(p.x + 2, p.y + p.h, COL.paper, 4, 0.8);
    }
    p.buffer = 0;
    p.grounded = false;
  }

  if (input.dashPressed && p.canDash && p.dashCd <= 0) {
    const dx = input.x !== 0 ? Math.sign(input.x) : p.facing;
    const dy = input.down ? 1 : (input.jump ? -1 : 0);
    const len = Math.hypot(dx, dy) || 1;
    p.vx = (dx / len) * 5.6;
    p.vy = (dy / len) * 5.6;
    p.dashT = 9;
    p.dashCd = 18;
    p.canDash = false;
    p.facing = dx >= 0 ? 1 : -1;
    sfx.dash();
    addShake(2);
    burst(p.x, p.y, COL.flame, 6, 1.2);
  }

  const wasGround = p.grounded;
  collide(p, prevY);
  if (p.onMover) {
    const mv = p.onMover;
    // inherit after mover updates; applied in updateMovers order — see update()
  }
  if (!wasGround && p.grounded) {
    p.squash = 1.35;
    sfx.land();
    burst(p.x + 2, p.y + p.h, "#cbb89a", 4, 0.7);
  }
  if (p.grounded && Math.abs(p.vx) > 0.8 && p.anim % 7 === 0) burst(p.x + 4, p.y + p.h, "#cbb89a", 1, 0.4);

  // hazards
  const footX = Math.floor((p.x + p.w / 2) / TILE);
  const footY = Math.floor((p.y + p.h + 1) / TILE);
  const bodyY = Math.floor((p.y + p.h / 2) / TILE);
  if (tileAt(game.level, footX, footY) === "^" || tileAt(game.level, footX, bodyY) === "^") killPlayer();
  if (p.y > game.level.map.length * TILE + 8) killPlayer();

  // shards
  for (const s of game.shards) {
    if (s.got) continue;
    s.bob += 0.08;
    if (rectHit(p, { x: s.x, y: s.y + Math.sin(s.bob) * 2, w: 8, h: 10 })) {
      s.got = true;
      sfx.shard();
      burst(s.x, s.y, COL.shard, 10, 1.4);
      game.toast = "Wickshard";
      game.toastT = 70;
    }
  }
  // beacons
  for (const b of game.beacons) {
    if (!b.lit && Math.hypot(p.x + 5 - b.x, p.y + 8 - (b.y - 10)) < 36) lightBeacon(b);
  }
  // exit
  if (!game.level.boss) {
    for (let ty = 0; ty < game.level.map.length; ty++) for (let tx = 0; tx < game.level.map[0].length; tx++) {
      if (game.level.map[ty][tx] !== "X") continue;
      const door = { x: tx * TILE, y: ty * TILE, w: TILE, h: TILE };
      if (rectHit(p, door)) {
        const lit = game.beacons.filter((b) => b.lit).length;
        if (lit >= game.beacons.length) finishLevel();
        else { game.toast = "Light every beacon first"; game.toastT = 70; }
      }
    }
  }
}

function updateEnemies() {
  const p = game.player;
  for (const e of game.enemies) {
    if (e.dead) continue;
    e.anim++;
    const lc = lightAmount(e.x + e.w / 2, e.y + e.h / 2);
    if (lc > 0.72) e.lightT++;
    else e.lightT = Math.max(0, e.lightT - 1);
    if (e.lightT > 40) { defeatEnemy(e, "light"); continue; }
    if (lc > 0.48) e.dir = e.x > p.x ? 1 : -1;
    if (e.kind === "mite") {
      e.vx = e.dir * (lc > 0.48 ? 1.15 : 0.62);
      const prevY = e.y;
      e.vy = (e.vy || 0) + 0.35;
      collide(e, prevY);
      const ahead = Math.floor((e.x + e.w / 2 + e.dir * 8) / TILE);
      const under = Math.floor((e.y + e.h + 2) / TILE);
      const front = Math.floor((e.y + 4) / TILE);
      const tFront = tileAt(game.level, ahead, front);
      const tUnder = tileAt(game.level, ahead, under);
      if (tFront === "#" || tUnder === "." || tUnder === "^") e.dir *= -1;
    } else {
      e.x += e.dir * 0.7;
      e.y = e.homeY + Math.sin(e.anim * 0.08) * 10;
      if (tileAt(game.level, Math.floor((e.x + (e.dir > 0 ? e.w : 0)) / TILE), Math.floor(e.y / TILE)) === "#") e.dir *= -1;
    }
    if (p.dead || p.inv > 0 || p.dashT > 0) {
      if (p.dashT > 0 && rectHit(p, e)) defeatEnemy(e, "dash");
      continue;
    }
    if (rectHit(p, e)) {
      const stomp = p.vy > 0.4 && p.y + p.h - e.y < 10;
      if (stomp) {
        defeatEnemy(e, "stomp");
        p.vy = -5.4;
        p.grounded = false;
      } else killPlayer();
    }
  }
}
function defeatEnemy(e, how) {
  if (e.dead) return;
  e.dead = true;
  sfx.stomp();
  addShake(how === "stomp" ? 4 : 2);
  hitstop = how === "stomp" ? 3 : 0;
  burst(e.x + 4, e.y + 4, how === "light" ? COL.flame : COL.fog, 12, 1.8);
}

function updateMovers() {
  for (const mv of game.movers) {
    const prev = mv.axis === "x" ? mv.px : mv.py;
    mv.t += mv.speed;
    const span = (mv.max - mv.min);
    const u = (Math.sin(mv.t * Math.PI * 2) * 0.5 + 0.5) * span + mv.min;
    if (mv.axis === "x") mv.px = u * TILE;
    else mv.py = u * TILE;
    const delta = (mv.axis === "x" ? mv.px : mv.py) - prev;
    const p = game.player;
    if (p && p.onMover === mv) {
      if (mv.axis === "x") p.x += delta;
      else p.y += delta;
    }
  }
  for (const s of game.swings) {
    s.a += s.speed;
    s.bx = s.x * TILE + Math.sin(s.a) * s.len * TILE;
    s.by = s.y * TILE + Math.cos(s.a) * s.len * TILE * 0.35 + s.len * TILE;
    const p = game.player;
    if (!p || p.dead || p.inv > 0) continue;
    if (Math.hypot(p.x + 5 - s.bx, p.y + 7 - s.by) < 10) killPlayer();
  }
}

function updateBoss() {
  const b = game.boss;
  const p = game.player;
  if (!b || !p || p.dead) return;
  b.anim++;
  if (b.hit > 0) b.hit--;
  const lit = game.beacons.filter((x) => x.lit).length;
  if (b.vulnerable > 0) {
    b.vulnerable--;
    b.y += (168 - b.y) * 0.1;
    b.phase = "down";
    const stompBox = { x: b.x, y: b.y - 4, w: b.w, h: 20 };
    if (p.inv <= 0 && p.vy >= 0 && rectHit(p, stompBox) && p.y + p.h < b.y + 16) {
      b.hp--;
      b.vulnerable = 0;
      b.hit = 20;
      p.vy = -6;
      sfx.stomp();
      addShake(6);
      hitstop = 5;
      burst(b.x + 14, b.y + 16, COL.flame, 18, 2.2);
      for (const be of game.beacons) be.lit = false;
      game.toast = b.hp > 0 ? "The Keeper reels" : "The bell cracks";
      game.toastT = 90;
      if (b.hp <= 0) {
        b.phase = "dead";
        sfx.win();
        game.pending = "win";
        game.fadeDir = 1;
        game.fade = 0;
      }
    } else if (p.inv <= 0 && rectHit(p, { x: b.x + 2, y: b.y + 6, w: b.w - 4, h: b.h - 6 })) killPlayer();
    return;
  }
  if (lit >= 3 && b.phase !== "dead") {
    b.vulnerable = 170;
    game.toast = "Stomp the Keeper";
    game.toastT = 90;
    sfx.beacon();
    return;
  }
  b.timer--;
  if (b.phase === "idle") {
    b.x += b.dir * (0.7 + (3 - b.hp) * 0.25);
    if (b.x < 40 || b.x > 400) b.dir *= -1;
    b.y = 72 + Math.sin(b.anim * 0.05) * 8;
    if (b.timer <= 0) { b.phase = "tele"; b.timer = 36; b.dir = p.x > b.x ? 1 : -1; }
  } else if (b.phase === "tele") {
    b.y = 78;
    if (b.timer <= 0) { b.phase = "charge"; b.timer = 28; sfx.dash(); }
  } else if (b.phase === "charge") {
    b.x += b.dir * (3.4 + (3 - b.hp) * 0.4);
    b.y = 186;
    if (p.inv <= 0 && rectHit(p, { x: b.x, y: b.y + 8, w: b.w, h: 18 })) killPlayer();
    if (b.timer <= 0 || b.x < 28 || b.x > 410) { b.phase = "idle"; b.timer = 70 - b.hp * 8; }
  }
  // exit locked until boss dead; door used only after
}

function finishLevel() {
  if (game.pending) return;
  sfx.win();
  const shards = game.shards.filter((s) => s.got).length;
  const total = game.shards.length || 1;
  const rec = { time: game.time / 60, shards, total, deaths: game.deaths, name: game.level.name, id: game.level.id, par: game.level.par };
  const prev = save.best[game.level.id];
  rec.isBest = !prev || rec.time < prev.time || (rec.time === prev.time && rec.shards > prev.shards);
  if (rec.isBest) save.best[game.level.id] = { time: rec.time, shards: rec.shards };
  if (game.levelIndex >= save.unlocked) save.unlocked = game.levelIndex + 1;
  if (game.levelIndex === 0) save.tutorial = true;
  writeSave();
  game.results = rec;
  game.pending = "results";
  game.fadeDir = 1;
  game.fade = 0;
  addShake(2);
}

function update() {
  if (game.screen !== "play") return;
  if (game.paused) return;
  if (hitstop > 0) { hitstop--; return; }
  gatherInput();
  if (window.__bot) botSteer();
  if (input.pausePressed) { game.paused = true; game.menuIndex = 0; sfx.ui(); endInput(); return; }
  if (game.intro > 0) { game.intro--; endInput(); updateCamera(); return; }
  game.time++;
  if (game.toastT > 0) game.toastT--;
  updateMovers();
  updatePlayer();
  updateEnemies();
  updateBoss();
  for (const q of particles) {
    q.x += q.vx; q.y += q.vy; q.vy += q.g; q.life--;
  }
  for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
  updateCamera();
  if (game.fadeDir !== 0) {
    game.fade += game.fadeDir * 0.06;
    if (game.fade >= 1 && game.pending === "respawn") {
      respawn();
      game.fadeDir = -1;
      game.pending = null;
    } else if (game.fade >= 1 && game.pending === "results") {
      game.screen = "results";
      game.menuIndex = 0;
      game.fadeDir = 0;
      game.fade = 0;
      game.pending = null;
      stopMusic();
    } else if (game.fade >= 1 && game.pending === "win") {
      game.screen = "ending";
      game.ending = 0;
      game.fadeDir = 0;
      game.fade = 0;
      game.pending = null;
      const shards = game.shards.filter((s) => s.got).length;
      save.best.boss = save.best.boss && save.best.boss.time < game.time / 60 ? save.best.boss : { time: game.time / 60, shards };
      save.unlocked = Math.max(save.unlocked, 4);
      writeSave();
      stopMusic();
    }
    if (game.fade <= 0 && game.fadeDir < 0) { game.fade = 0; game.fadeDir = 0; }
  }
  considerTutorial();
  endInput();
}

function botSteer() {
  const p = game.player;
  if (!p || game.screen !== "play") return;
  if (p.dead) return;
  const tile = (x, y) => (game.level.map[y] && game.level.map[y][x]) || "#";
  if (game.level.map.length > 20) {
    if (p.x > 280) window.__botDir = -1;
    if (p.x < 48) window.__botDir = 1;
    if (p.grounded) input.jumpPressed = true;
  }
  const dir = window.__botDir || 1;
  input.x = dir;
  const ahead = Math.floor((p.x + (dir > 0 ? p.w + 6 : -6)) / TILE);
  const foot = Math.floor((p.y + p.h - 2) / TILE);
  const blocked = tile(ahead, foot) === "#" || tile(ahead, foot - 1) === "#";
  const below = tile(ahead, foot + 1);
  const gap = below === "." || below === "^" || below === "X";
  if (game.level.map.length > 20 && p.grounded) input.jumpPressed = true;
  if (p.grounded && (blocked || gap)) input.jumpPressed = true;
  if (!p.grounded && p.wall && blocked) input.jumpPressed = true;
  if (!p.grounded && p.vy > 0 && game.level.map.length > 20) input.jumpPressed = true;
  if (gap && (p.grounded || p.coyote > 0)) input.dashPressed = true;
}

function considerTutorial() {
  if (save.tutorial) return;
  const p = game.player;
  if (!p) return;
  if (!game.seen.move && Math.abs(p.vx) > 0.4) game.seen.move = true;
  if (!game.seen.jump && p.vy < -1) game.seen.jump = true;
  if (!game.seen.wall && p.wall !== 0) game.seen.wall = true;
  if (!game.seen.dash && p.dashT > 0) game.seen.dash = true;
}

function updateCamera() {
  const p = game.player;
  if (!p) return;
  const look = p.facing * 28;
  const tx = p.x - W / 2 + look;
  const ty = p.y - H / 2 - 8;
  game.cam.x += (tx - game.cam.x) * 0.12;
  game.cam.y += (ty - game.cam.y) * 0.12;
  const mw = game.level.map[0].length * TILE - W;
  const mh = game.level.map.length * TILE - H;
  if (game.cam.x < 0) game.cam.x = 0;
  if (game.cam.y < 0) game.cam.y = 0;
  if (game.cam.x > mw) game.cam.x = Math.max(0, mw);
  if (game.cam.y > mh) game.cam.y = Math.max(0, mh);
  if (shake > 0) shake *= 0.86;
  if (shake < 0.2) shake = 0;
}

/* ---------------- draw ---------------- */
function blit(px, py, rows, pal, flip) {
  const ox = Math.round(px), oy = Math.round(py);
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][flip ? rows[y].length - 1 - x : x];
      if (ch === "." || !pal[ch]) continue;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}
const PAL = {
  "0": "#080610",
  "1": COL.cloak,
  "2": COL.cloakHi,
  "3": COL.scarf,
  "4": COL.scarfHi,
  "5": COL.skin,
  "6": COL.flameCore,
  "7": COL.brass,
  "8": COL.flame,
  "9": COL.hair
};

function travelerSprite(state, frame) {
  const leg = frame % 2 === 0;
  if (state === "dash") return [
    "...9999.....",
    "..955559....",
    "..9566597...",
    ".11333341...",
    "1113333418..",
    ".1122221....",
    "..1.1.1.....",
  ];
  if (state === "jump") return [
    "...9999...",
    "..955559..",
    "..956659..",
    ".11333311.",
    "1113333411",
    "..12211...",
    ".11...11..",
  ];
  if (state === "wall") return [
    "..9999.",
    ".955559",
    ".956659",
    "1133341",
    "1113341",
    ".12221.",
    ".11.1..",
  ];
  if (state === "run" && leg) return [
    "...9999.",
    "..955559",
    "..956659",
    ".1133341",
    "11133341",
    "..12221.",
    "..1..11.",
    ".11.....",
  ];
  if (state === "run") return [
    "...9999.",
    "..955559",
    "..956659",
    ".1133341",
    "11133341",
    "..12221.",
    ".11..1..",
    "....11..",
  ];
  // idle
  return [
    "...9999.",
    "..955559",
    "..956659",
    ".1133341",
    "11133341",
    "..12221.",
    "..11.11.",
    "..1...1.",
  ];
}

const dashGhosts = [];

function drawTraveler(p) {
  if (p.inv > 0 && Math.floor(p.inv / 3) % 2 === 0) return;
  const state = p.dashT > 0 ? "dash" : (!p.grounded && p.wall !== 0 ? "wall" : (!p.grounded ? "jump" : (Math.abs(p.vx) > 0.4 ? "run" : "idle")));
  const rows = travelerSprite(state, Math.floor(p.anim / 6));
  const bob = state === "idle" ? Math.sin(p.anim * 0.08) * 0.7 : 0;

  // Manage dash ghostly afterimages
  if (p.dashT > 0 && p.anim % 2 === 0) {
    dashGhosts.push({
      x: p.x + p.w / 2,
      y: p.y + p.h,
      facing: p.facing,
      squash: p.squash,
      rows,
      alpha: 0.65,
    });
  }

  // Draw dash afterimages
  for (let i = dashGhosts.length - 1; i >= 0; i--) {
    const g = dashGhosts[i];
    g.alpha -= 0.055;
    if (g.alpha <= 0) {
      dashGhosts.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = g.alpha;
    ctx.translate(Math.round(g.x), Math.round(g.y));
    ctx.scale(g.facing * 2, g.squash * 2);
    // Draw in ethereal twilight tint
    blit(-5, -g.rows.length, g.rows, {
      "0": "transparent", "1": COL.crystal, "2": COL.crystalHi, "3": COL.flame, "4": COL.flame,
      "5": COL.crystal, "6": "#fff", "7": COL.crystalHi, "8": "#fff", "9": COL.crystal
    }, false);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h));
  ctx.scale(p.facing * 2, p.squash * 2);

  // Main traveler sprite
  blit(-5, -rows.length + bob, rows, PAL, false);

  // Lantern swaying physics
  const sway = Math.sin(p.anim * 0.12) * 1.5 + (p.vx * 0.5);
  const lx = 4 + sway * 0.4;
  const ly = -8 + bob;

  // Lantern mount & brass cage
  ctx.fillStyle = COL.brass;
  ctx.fillRect(Math.round(lx), Math.round(ly), 4, 4);
  ctx.fillStyle = COL.brassHi;
  ctx.fillRect(Math.round(lx + 1), Math.round(ly - 1), 2, 1);

  // Lantern fire core & glow
  const flicker = Math.sin(p.lantern * 1.8) > 0;
  ctx.fillStyle = flicker ? COL.flameCore : COL.flame;
  ctx.fillRect(Math.round(lx + 1), Math.round(ly + 1), 2, 2);
  ctx.fillStyle = COL.flame2;
  ctx.fillRect(Math.round(lx + 1), Math.round(ly - 1), 1, 1);

  // Dynamic flowing scarf with velocity and wind flutter
  const wind = Math.sin(performance.now() * 0.012 + p.anim * 0.3) * 1.8;
  const scarfLag = Math.max(-5, Math.min(5, -p.vx * 1.8));
  ctx.fillStyle = COL.scarf;
  ctx.fillRect(-2 + scarfLag, -6 + bob, 3, 2);
  ctx.fillStyle = COL.scarfHi;
  ctx.fillRect(-4 + scarfLag + wind * 0.5, -5 + bob + wind * 0.4, 3, 2);
  ctx.fillStyle = COL.scarf;
  ctx.fillRect(-6 + scarfLag + wind, -4 + bob + wind * 0.8, 2, 2);

  ctx.restore();
}

function drawEnemy(e) {
  if (e.dead) return;
  ctx.save();
  if (e.kind === "mite") {
    const y = Math.round(e.y + (e.anim % 8 < 4 ? 0 : 1));
    const x = Math.round(e.x);
    // Dark armored carapace with chitin highlights
    ctx.fillStyle = "#1e1428";
    ctx.fillRect(x, y, 14, 9);
    ctx.fillStyle = "#4a2a58";
    ctx.fillRect(x + 1, y + 1, 12, 4);
    ctx.fillStyle = "#7a488e";
    ctx.fillRect(x + 3, y + 1, 8, 1);
    // Glowing predatory eyes
    const blink = Math.sin(e.anim * 0.1) > 0.95;
    ctx.fillStyle = blink ? "#5a1420" : COL.dangerHi;
    ctx.fillRect(x + 2, y + 2, 2, 2);
    ctx.fillRect(x + 9, y + 2, 2, 2);
    ctx.fillStyle = "#ffffff";
    if (!blink) {
      ctx.fillRect(x + 3, y + 2, 1, 1);
      ctx.fillRect(x + 10, y + 2, 1, 1);
    }
    // Articulated skittering legs
    const legStep = Math.floor(e.anim / 3) % 2;
    ctx.fillStyle = "#0e0814";
    ctx.fillRect(x + 1 + (legStep ? 1 : 0), y + 8, 3, 2);
    ctx.fillRect(x + 6 - (legStep ? 1 : 0), y + 8, 3, 2);
    ctx.fillRect(x + 10 + (legStep ? 1 : 0), y + 8, 3, 2);
  } else {
    // Flyer (Shadow Moth / Void Bat)
    const y = Math.round(e.y + Math.sin(e.anim * 0.15) * 2);
    const x = Math.round(e.x);
    const wingFlap = Math.sin(e.anim * 0.35);
    const wingH = Math.round(wingFlap * 4);
    // Translucent shadowy wings
    ctx.fillStyle = "rgba(110, 80, 150, 0.65)";
    ctx.fillRect(x - 2, y + 1 - wingH, 5, 4 + Math.abs(wingH));
    ctx.fillRect(x + 9, y + 1 - wingH, 5, 4 + Math.abs(wingH));
    ctx.fillStyle = "rgba(180, 140, 240, 0.4)";
    ctx.fillRect(x - 1, y + 1 - wingH, 3, 1);
    ctx.fillRect(x + 10, y + 1 - wingH, 3, 1);
    // Body core
    ctx.fillStyle = "#221630";
    ctx.fillRect(x + 3, y + 1, 6, 6);
    ctx.fillStyle = "#483260";
    ctx.fillRect(x + 4, y + 2, 4, 4);
    // Glowing spectral cyan eye
    ctx.fillStyle = COL.crystal;
    ctx.fillRect(x + 5, y + 3, 2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 5, y + 3, 1, 1);
  }
  ctx.restore();
}

function drawBoss(b) {
  if (!b || b.phase === "dead") return;
  const x = Math.round(b.x), y = Math.round(b.y);
  const hover = Math.sin(performance.now() * 0.003) * 3;
  const by = y + hover;
  ctx.save();

  // Shadow aura / tendrils
  ctx.fillStyle = "rgba(22, 10, 36, 0.6)";
  ctx.beginPath();
  ctx.arc(x + 14, by + 18, 26, 0, Math.PI * 2);
  ctx.fill();

  // Swirling shroud
  const hitFlash = b.hit > 0 && b.hit % 4 < 2;
  ctx.fillStyle = hitFlash ? "#943048" : "#140c20";
  ctx.fillRect(x + 4, by + 4, 20, 26);
  ctx.fillStyle = hitFlash ? "#bd4860" : "#2e1c42";
  ctx.fillRect(x + 6, by + 8, 16, 18);

  // Horned bone mask
  ctx.fillStyle = "#e0d4c0";
  ctx.fillRect(x + 8, by - 2, 12, 10);
  ctx.fillStyle = "#a89880";
  ctx.fillRect(x + 6, by - 6, 3, 6);
  ctx.fillRect(x + 19, by - 6, 3, 6);

  // Glowing hollow eye sockets
  ctx.fillStyle = b.vulnerable > 0 ? COL.flame : COL.danger;
  ctx.fillRect(x + 10, by + 2, 3, 3);
  ctx.fillRect(x + 15, by + 2, 3, 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 11, by + 2, 1, 1);
  ctx.fillRect(x + 16, by + 2, 1, 1);

  // Arcane chest core
  const corePulse = Math.sin(performance.now() * 0.008) * 0.3 + 0.7;
  ctx.fillStyle = b.vulnerable > 0 ? COL.flame : `rgba(255, 120, 50, ${corePulse})`;
  ctx.fillRect(x + 11, by + 14, 6, 6);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 13, by + 16, 2, 2);

  // Teleportation warning aura
  if (b.phase === "tele") {
    ctx.fillStyle = "rgba(226, 61, 74, 0.4)";
    ctx.fillRect(x - 8, by + 16, 44, 4);
    ctx.fillStyle = COL.dangerHi;
    ctx.fillRect(x - 4, by + 17, 36, 2);
  }

  // Tattered shadowy hem
  ctx.fillStyle = "#100818";
  for (let i = 0; i < 4; i++) {
    const wave = Math.sin(performance.now() * 0.006 + i) * 3;
    ctx.fillRect(x + 5 + i * 5, by + 28, 4, 6 + wave);
  }
  ctx.restore();
}

// Procedural stars map for celestial sky
const CELESTIAL_STARS = [];
for (let i = 0; i < 45; i++) {
  CELESTIAL_STARS.push({
    x: Math.floor(Math.random() * W),
    y: Math.floor(Math.random() * (H * 0.65)),
    size: Math.random() < 0.25 ? 1.5 : 1,
    speed: 0.002 + Math.random() * 0.003,
    phase: Math.random() * Math.PI * 2,
    brightness: 0.35 + Math.random() * 0.6,
  });
}

// Procedural pine tree renderer for rich layered forest
function renderPine(cx, cy, h, w, darkCol, lightCol) {
  const trunkW = Math.max(2, Math.round(w * 0.12));
  ctx.fillStyle = "#140e16";
  ctx.fillRect(Math.round(cx - trunkW / 2), Math.round(cy - h * 0.2), trunkW, Math.round(h * 0.2));
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const frac = i / tiers;
    const ty = cy - h + frac * (h * 0.82);
    const tw = w * (0.35 + frac * 0.65);
    ctx.fillStyle = darkCol;
    ctx.beginPath();
    ctx.moveTo(Math.round(cx), Math.round(ty));
    ctx.lineTo(Math.round(cx - tw / 2), Math.round(ty + h * 0.28));
    ctx.lineTo(Math.round(cx + tw / 2), Math.round(ty + h * 0.28));
    ctx.fill();
    // Highlight facet on left side
    if (lightCol) {
      ctx.fillStyle = lightCol;
      ctx.beginPath();
      ctx.moveTo(Math.round(cx), Math.round(ty));
      ctx.lineTo(Math.round(cx - tw / 2), Math.round(ty + h * 0.28));
      ctx.lineTo(Math.round(cx), Math.round(ty + h * 0.24));
      ctx.fill();
    }
  }
}

function drawBackground() {
  const biome = game.level ? game.level.biome : "forest";
  const camx = game.cam ? game.cam.x : 0;
  const camy = game.cam ? game.cam.y : 0;

  // 1. Layer: Atmospheric Celestial Sky Gradient
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (biome === "cave") {
    g.addColorStop(0, "#080b12");
    g.addColorStop(0.5, "#101824");
    g.addColorStop(1, "#182836");
  } else if (biome === "tower" || biome === "boss") {
    g.addColorStop(0, "#0a060d");
    g.addColorStop(0.5, "#1c101a");
    g.addColorStop(1, "#2c1816");
  } else {
    // Forest / Night sky
    g.addColorStop(0, "#06040d");
    g.addColorStop(0.4, "#100a20");
    g.addColorStop(0.75, "#16122a");
    g.addColorStop(1, "#162432");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // 2. Layer: Twinkling Celestial Stars (Forest & Tower)
  if (biome !== "cave") {
    for (const st of CELESTIAL_STARS) {
      const sx = (st.x - camx * 0.03 + W) % W;
      const sy = st.y - camy * 0.02;
      if (sy < 0 || sy > H) continue;
      const pulse = 0.4 + 0.6 * Math.sin(performance.now() * st.speed + st.phase);
      ctx.fillStyle = `rgba(245, 235, 220, ${st.brightness * pulse})`;
      ctx.fillRect(Math.round(sx), Math.round(sy), st.size, st.size);
    }

    // Luminous Crescent Moon with multi-step ethereal glow
    const mx = 420 - (camx * 0.02 % 40);
    const my = 36 - (camy * 0.015);
    const moonGlow = ctx.createRadialGradient(mx, my, 4, mx, my, 42);
    moonGlow.addColorStop(0, "rgba(255, 240, 200, 0.45)");
    moonGlow.addColorStop(0.35, "rgba(255, 220, 160, 0.15)");
    moonGlow.addColorStop(1, "rgba(255, 200, 140, 0)");
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(mx, my, 42, 0, Math.PI * 2);
    ctx.fill();

    // Moon body & inner crescent shadow
    ctx.fillStyle = "#fff8e6";
    ctx.beginPath();
    ctx.arc(mx, my, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = biome === "tower" || biome === "boss" ? "#1a1018" : "#100a20";
    ctx.beginPath();
    ctx.arc(mx - 4, my - 2, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Layer: Distant Mountains (Parallax 1)
  if (biome === "forest") {
    ctx.fillStyle = "#0c121e";
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 40; x += 35) {
      const px = x;
      const peakY = 120 + Math.sin((x + camx * 0.1) * 0.015) * 35 + Math.cos(x * 0.03) * 15;
      ctx.lineTo(px, peakY);
    }
    ctx.lineTo(W + 50, H);
    ctx.closePath();
    ctx.fill();

    // Midground Pine Forest (Parallax 2)
    const treeSpacing = 65;
    for (let i = 0; i < 11; i++) {
      const tx = Math.round(((i * treeSpacing - camx * 0.22) % (W + 130)) - 50);
      const th = 85 + (i % 3) * 18;
      const tw = 44 + (i % 2) * 8;
      renderPine(tx, 225 - (camy * 0.08), th, tw, "#0b1018", "#121b26");
    }
    // Closer pine silhouettes
    for (let i = 0; i < 9; i++) {
      const tx = Math.round(((i * 78 + 30 - camx * 0.35) % (W + 150)) - 60);
      const th = 110 + (i % 4) * 16;
      const tw = 54 + (i % 2) * 10;
      renderPine(tx, 240 - (camy * 0.12), th, tw, "#080c14", "#0e1520");
    }
  } else if (biome === "cave") {
    // Subterranean stalactite ceiling & glowing mineral veins
    ctx.fillStyle = "#0e1622";
    for (let i = 0; i < 12; i++) {
      const sx = ((i * 45 - camx * 0.2) % (W + 80)) - 30;
      const sh = 30 + (i % 4) * 15;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + 15, sh);
      ctx.lineTo(sx + 30, 0);
      ctx.fill();
    }
    // Deep crystal clusters in background
    for (let i = 0; i < 7; i++) {
      const cx = ((i * 75 - camx * 0.15) % (W + 100)) - 30;
      const cy = 110 + (i % 3) * 35;
      const pulse = Math.sin(performance.now() * 0.002 + i) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(84, 237, 217, ${0.35 * pulse})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 20);
      ctx.lineTo(cx + 6, cy);
      ctx.lineTo(cx + 12, cy + 20);
      ctx.fill();
    }
  } else if (biome === "tower" || biome === "boss") {
    // Gothic battlements, buttresses, and castle spires
    ctx.fillStyle = "#160e18";
    for (let i = 0; i < 8; i++) {
      const bx = ((i * 85 - camx * 0.25) % (W + 120)) - 40;
      // Spire
      ctx.beginPath();
      ctx.moveTo(bx + 14, 30);
      ctx.lineTo(bx, 85);
      ctx.lineTo(bx + 28, 85);
      ctx.fill();
      // Tower block
      ctx.fillRect(bx + 2, 85, 24, 160);
      ctx.fillStyle = "#2c1822";
      ctx.fillRect(bx + 8, 100, 12, 18);
      ctx.fillRect(bx + 8, 135, 12, 18);
      ctx.fillStyle = "#160e18";
    }
  }

  // 4. Layer: Soft Sinusoidal Drifting Mist
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(performance.now() * 0.0006 + i * 1.8) * 8;
    const fy = 125 + i * 40 + wave - (camy * 0.04 % 40);
    const fogG = ctx.createLinearGradient(0, fy, 0, fy + 24);
    fogG.addColorStop(0, "rgba(180, 195, 230, 0)");
    fogG.addColorStop(0.5, "rgba(180, 195, 230, 0.035)");
    fogG.addColorStop(1, "rgba(180, 195, 230, 0)");
    ctx.fillStyle = fogG;
    ctx.fillRect(0, fy, W, 24);
  }

  // Ambient motes in world
  drawAmbientMotes(0.65);
}

function drawTile(t, tx, ty, wx, wy) {
  const biome = game.level.biome;
  if (t === "#" || t === "~" || t === "=" || t === "-") {
    const shadow = t === "~" || t === "-";
    const lit = !shadow || tileLit(tx, ty);
    if (shadow && !lit) {
      const near = lightAmount(wx + 8, wy + 8);
      if (near > 0.08) {
        // Ethereal glowing outline for sleeping shadow blocks
        ctx.fillStyle = `rgba(142, 240, 228, ${Math.min(0.35, near * 0.6)})`;
        ctx.fillRect(wx + 1, wy + 1, TILE - 2, TILE - 2);
        ctx.strokeStyle = `rgba(255, 224, 138, ${Math.min(0.6, near)})`;
        ctx.strokeRect(wx + 0.5, wy + 0.5, TILE - 1, TILE - 1);
      }
      return;
    }

    const isTop = ty === 0 || tileAt(game.level, tx, ty - 1) !== "#";

    if (biome === "forest") {
      // 1. Forest Ground
      if (t === "=" || t === "-") {
        // Rustic wooden platform with timber grain & brackets
        ctx.fillStyle = shadow ? "#3c2a4a" : "#4a3322";
        ctx.fillRect(wx, wy, TILE, 6);
        ctx.fillStyle = shadow ? "#5a426e" : "#6e4e34";
        ctx.fillRect(wx, wy, TILE, 2);
        ctx.fillStyle = "#1e140c";
        ctx.fillRect(wx + 1, wy + 2, 2, 3);
        ctx.fillRect(wx + TILE - 3, wy + 2, 2, 3);
        // Hanging ivy
        if ((tx + ty) % 3 === 0) {
          ctx.fillStyle = COL.moss;
          ctx.fillRect(wx + 5, wy + 6, 2, 4);
          ctx.fillRect(wx + 6, wy + 10, 1, 2);
        }
      } else {
        // Full Earth & Stone Block
        ctx.fillStyle = shadow ? "#281e36" : "#2e241c";
        ctx.fillRect(wx, wy, TILE, TILE);

        // Stone brick seams & bevel texture
        ctx.fillStyle = shadow ? "#3a2c4e" : "#3e3228";
        ctx.fillRect(wx + 1, wy + 1, TILE - 2, TILE - 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.fillRect(wx, wy + TILE - 1, TILE, 1);
        ctx.fillRect(wx + TILE - 1, wy, 1, TILE);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(wx + 1, wy + 1, TILE - 2, 1);

        // Surface Lush Moss Grass Cap
        if (isTop) {
          ctx.fillStyle = COL.mossDark;
          ctx.fillRect(wx, wy, TILE, 5);
          ctx.fillStyle = COL.moss;
          ctx.fillRect(wx, wy, TILE, 3);
          ctx.fillStyle = COL.mossHi;
          ctx.fillRect(wx, wy, TILE, 1);

          // Hanging blades of grass
          const bladeSeed = (tx * 7 + 13) % 5;
          ctx.fillStyle = COL.moss;
          ctx.fillRect(wx + 2, wy + 3, 2, 2 + bladeSeed % 3);
          ctx.fillRect(wx + 9, wy + 3, 2, 3 + (bladeSeed + 1) % 3);

          // Wildflowers or mushrooms on random surface tiles
          if ((tx * 17) % 7 === 0) {
            ctx.fillStyle = COL.white;
            ctx.fillRect(wx + 6, wy - 3, 2, 3);
            ctx.fillStyle = COL.danger;
            ctx.fillRect(wx + 5, wy - 4, 4, 2);
            ctx.fillStyle = "#fff";
            ctx.fillRect(wx + 6, wy - 4, 1, 1);
          } else if ((tx * 11) % 8 === 0) {
            ctx.fillStyle = COL.crystal;
            ctx.fillRect(wx + 7, wy - 3, 2, 3);
            ctx.fillStyle = COL.crystalHi;
            ctx.fillRect(wx + 7, wy - 4, 2, 1);
          }
        }
      }
    } else if (biome === "cave") {
      // 2. Cave Slate & Glowing Crystal Tile
      ctx.fillStyle = shadow ? "#1e2838" : "#1a2432";
      ctx.fillRect(wx, wy, TILE, t === "=" || t === "-" ? 6 : TILE);
      ctx.fillStyle = shadow ? "#2e3c50" : "#26364a";
      ctx.fillRect(wx + 1, wy + 1, TILE - 2, (t === "=" || t === "-" ? 6 : TILE) - 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(wx, wy + (t === "=" || t === "-" ? 5 : TILE - 1), TILE, 1);

      if (isTop) {
        ctx.fillStyle = "#4a6886";
        ctx.fillRect(wx, wy, TILE, 2);
        ctx.fillStyle = "#7ca4c4";
        ctx.fillRect(wx, wy, TILE, 1);
      }

      // Embedded glowing turquoise crystal veins
      if ((tx + ty * 3) % 4 === 0 && (t === "#" || t === "~")) {
        const pulse = Math.sin(performance.now() * 0.003 + tx) * 0.25 + 0.75;
        ctx.fillStyle = `rgba(84, 237, 217, ${pulse})`;
        ctx.fillRect(wx + 4, wy + 5, 4, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(wx + 5, wy + 6, 2, 2);
      }
    } else {
      // 3. Tower / Boss Gothic Masonry Tile
      ctx.fillStyle = shadow ? "#281c20" : "#36241a";
      ctx.fillRect(wx, wy, TILE, t === "=" || t === "-" ? 6 : TILE);
      ctx.fillStyle = shadow ? "#422e36" : "#543a2c";
      ctx.fillRect(wx + 1, wy + 1, TILE - 2, (t === "=" || t === "-" ? 6 : TILE) - 2);
      // Stone brick lines
      ctx.fillStyle = "#1a120c";
      ctx.fillRect(wx, wy + 7, TILE, 1);
      if ((tx + ty) % 2 === 0) ctx.fillRect(wx + 7, wy, 1, 7);
      else ctx.fillRect(wx + 7, wy + 8, 1, 8);

      if (isTop) {
        ctx.fillStyle = COL.goldDark;
        ctx.fillRect(wx, wy, TILE, 3);
        ctx.fillStyle = COL.gold;
        ctx.fillRect(wx, wy, TILE, 1);
      }
    }
  } else if (t === "^") {
    // Spikes (Razor Obsidian Stalagmites with Hazard Glint)
    ctx.fillStyle = "rgba(226, 61, 74, 0.25)";
    ctx.fillRect(wx, wy + 8, TILE, 8);
    // Left tooth
    ctx.fillStyle = "#18141e";
    ctx.beginPath();
    ctx.moveTo(wx + 1, wy + TILE);
    ctx.lineTo(wx + 5, wy + 3);
    ctx.lineTo(wx + 8, wy + TILE);
    ctx.fill();
    ctx.fillStyle = COL.danger;
    ctx.fillRect(wx + 4, wy + 3, 2, 2);
    // Right tooth
    ctx.fillStyle = "#261e30";
    ctx.beginPath();
    ctx.moveTo(wx + 8, wy + TILE);
    ctx.lineTo(wx + 12, wy + 2);
    ctx.lineTo(wx + 15, wy + TILE);
    ctx.fill();
    ctx.fillStyle = COL.dangerHi;
    ctx.fillRect(wx + 11, wy + 2, 2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(wx + 11, wy + 2, 1, 1);
  } else if (t === "X") {
    // Goal Gateway (Ancient Monolith Dolmen with Runes)
    const open = game.beacons.every((b) => b.lit) && !(game.boss && game.boss.hp > 0);
    const gx = wx + 1;
    const gy = wy - 18;

    // Stone pillars
    ctx.fillStyle = "#221c26";
    ctx.fillRect(gx, gy, 4, 34);
    ctx.fillRect(gx + 10, gy, 4, 34);
    // Lintel header
    ctx.fillStyle = "#342a3a";
    ctx.fillRect(gx - 1, gy, 16, 5);
    ctx.fillStyle = "#52445c";
    ctx.fillRect(gx, gy, 14, 2);

    if (open) {
      // Swirling celestial portal vortex
      const portalTime = performance.now() * 0.005;
      const vortexGrad = ctx.createLinearGradient(gx + 4, gy + 5, gx + 10, gy + 32);
      vortexGrad.addColorStop(0, COL.gold);
      vortexGrad.addColorStop(0.5, COL.flame);
      vortexGrad.addColorStop(1, COL.crystal);
      ctx.fillStyle = vortexGrad;
      ctx.fillRect(gx + 4, gy + 5, 6, 28);

      // Portal energy sparks
      const sparkY = gy + 8 + (Math.sin(portalTime) * 10 + 10);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(gx + 5, Math.round(sparkY), 4, 3);

      // Radiant portal bloom
      ctx.fillStyle = "rgba(255, 215, 120, 0.25)";
      ctx.fillRect(gx + 1, gy + 4, 12, 30);
    } else {
      // Closed dormant dark stone slab with faint red runes
      ctx.fillStyle = "#120e16";
      ctx.fillRect(gx + 4, gy + 5, 6, 28);
      ctx.fillStyle = "rgba(180, 60, 70, 0.4)";
      ctx.fillRect(gx + 6, gy + 12, 2, 4);
      ctx.fillRect(gx + 5, gy + 20, 4, 2);
    }
  }
}

function drawBeacon(b) {
  const bx = Math.round(b.x);
  const by = Math.round(b.y);

  // Ornate Stone Plinth
  ctx.fillStyle = "#221a28";
  ctx.fillRect(bx - 3, by - 4, 7, 4);
  ctx.fillStyle = "#3a2e42";
  ctx.fillRect(bx - 2, by - 12, 5, 8);

  // Bronze Brazier Bowl
  ctx.fillStyle = b.lit ? COL.brassHi : "#5c4832";
  ctx.fillRect(bx - 5, by - 16, 11, 4);
  ctx.fillStyle = b.lit ? COL.gold : "#3a2a1c";
  ctx.fillRect(bx - 4, by - 14, 9, 2);

  if (b.lit) {
    // Blazing Sacred Beacon Flame
    const flicker1 = Math.sin(performance.now() * 0.02) * 2;
    const flicker2 = Math.cos(performance.now() * 0.035) * 2;
    // Outer flame aura
    ctx.fillStyle = COL.flame2;
    ctx.beginPath();
    ctx.moveTo(bx - 4, by - 16);
    ctx.lineTo(bx + flicker1, by - 28);
    ctx.lineTo(bx + 4, by - 16);
    ctx.fill();
    // Inner bright core
    ctx.fillStyle = COL.flame;
    ctx.beginPath();
    ctx.moveTo(bx - 2, by - 16);
    ctx.lineTo(bx + flicker2 * 0.5, by - 24);
    ctx.lineTo(bx + 2, by - 16);
    ctx.fill();
    ctx.fillStyle = COL.flameCore;
    ctx.fillRect(bx - 1, by - 20, 2, 4);

    // Rising flame spark
    if (Math.random() < 0.25) {
      burst(bx, by - 22, COL.flame, 1, 0.8);
    }
  } else {
    // Cold charcoal embers
    ctx.fillStyle = "#1e1418";
    ctx.fillRect(bx - 3, by - 18, 7, 2);
  }
}

function drawWorld() {
  drawBackground();
  const level = game.level;
  ctx.save();
  const sx = Math.round(-game.cam.x + (shake ? (Math.random() - 0.5) * shake : 0));
  const sy = Math.round(-game.cam.y + (shake ? (Math.random() - 0.5) * shake : 0));
  ctx.translate(sx, sy);
  const x0 = Math.max(0, Math.floor(game.cam.x / TILE) - 1);
  const y0 = Math.max(0, Math.floor(game.cam.y / TILE) - 1);
  const x1 = Math.min(level.map[0].length, x0 + Math.ceil(W / TILE) + 3);
  const y1 = Math.min(level.map.length, y0 + Math.ceil(H / TILE) + 3);
  for (let ty = y0; ty < y1; ty++) for (let tx = x0; tx < x1; tx++) {
    const t = level.map[ty][tx];
    if (t === "." || t === "P" || t === "M" || t === "F" || t === "*" || t === "B") continue;
    drawTile(t, tx, ty, tx * TILE, ty * TILE);
  }
  for (const mv of game.movers) {
    ctx.fillStyle = game.level.biome === "tower" ? "#8a6844" : "#4e6e78";
    ctx.fillRect(Math.round(mv.px), Math.round(mv.py), mv.w * TILE, 6);
    ctx.fillStyle = COL.gold;
    ctx.fillRect(Math.round(mv.px), Math.round(mv.py), mv.w * TILE, 2);
  }
  for (const s of game.swings) {
    ctx.strokeStyle = "#6a5a48";
    ctx.beginPath();
    ctx.moveTo(s.x * TILE, s.y * TILE);
    ctx.lineTo(s.bx, s.by);
    ctx.stroke();
    ctx.fillStyle = COL.danger;
    ctx.fillRect(s.bx - 4, s.by - 4, 8, 8);
  }
  for (const b of game.beacons) drawBeacon(b);
  for (const s of game.shards) if (!s.got) {
    const y = s.y + Math.sin(s.bob) * 2;
    ctx.fillStyle = COL.shard;
    ctx.fillRect(s.x + 2, y, 4, 6);
    ctx.fillStyle = COL.white;
    ctx.fillRect(s.x + 3, y + 1, 1, 2);
  }
  for (const e of game.enemies) drawEnemy(e);
  if (game.boss) drawBoss(game.boss);
  if (game.player) drawTraveler(game.player);
  for (const q of particles) {
    ctx.globalAlpha = Math.max(0, q.life / 24);
    ctx.fillStyle = q.color;
    ctx.fillRect(Math.round(q.x), Math.round(q.y), q.size, q.size);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  drawDarkness();
  drawHUD();
  if (game.intro > 0) drawIntro();
  if (game.toastT > 0) {
    ctx.fillStyle = "rgba(8,6,10,0.7)";
    ctx.fillRect(W / 2 - 90, 36, 180, 16);
    text(game.toast, W / 2, 47, { align: "center", color: COL.flame, size: 8 });
  }
  if (!save.tutorial) drawTutorial();
  if (game.paused) drawPause();
  if (game.fade > 0) {
    ctx.fillStyle = `rgba(6,4,8,${Math.min(1, game.fade)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

const lightLayer = document.createElement("canvas");
lightLayer.width = W;
lightLayer.height = H;
const lctx = lightLayer.getContext("2d");

function drawDarkness() {
  const p = game.player;
  if (!p) return;
  lctx.clearRect(0, 0, W, H);
  lctx.globalCompositeOperation = "source-over";
  lctx.fillStyle = "rgba(4, 2, 8, 0.94)";
  lctx.fillRect(0, 0, W, H);
  lctx.globalCompositeOperation = "destination-out";

  // Dynamic lantern light with organic flicker
  const flicker = Math.sin(performance.now() * 0.008) * 3 + Math.sin(performance.now() * 0.02) * 1.5;
  const lanternR = 98 + flicker;
  const lights = [
    { x: p.x + 8 + p.facing * 5 - game.cam.x, y: p.y + 4 - game.cam.y, r: lanternR, tint: "rgba(255, 180, 80, 0.22)" }
  ];

  // Lit beacons emit massive radiant light
  for (const b of game.beacons) {
    if (b.lit) {
      lights.push({
        x: b.x - game.cam.x,
        y: b.y - 18 - game.cam.y,
        r: 145 + Math.sin(performance.now() * 0.015) * 4,
        tint: "rgba(255, 190, 70, 0.32)"
      });
    }
  }

  // Shards emit cool sapphire glow
  for (const s of game.shards) {
    if (!s.got) {
      lights.push({
        x: s.x + 4 - game.cam.x,
        y: s.y + 3 - game.cam.y,
        r: 38 + Math.sin(performance.now() * 0.006 + s.bob) * 3,
        tint: "rgba(100, 210, 255, 0.2)"
      });
    }
  }

  // Open gate emits portal bloom
  const gateOpen = game.beacons.every((b) => b.lit) && !(game.boss && game.boss.hp > 0);
  if (gateOpen && game.level) {
    // Find gate in map
    for (let ty = 0; ty < game.level.map.length; ty++) {
      for (let tx = 0; tx < game.level.map[0].length; tx++) {
        if (game.level.map[ty][tx] === "X") {
          lights.push({
            x: tx * TILE + 8 - game.cam.x,
            y: ty * TILE - 4 - game.cam.y,
            r: 110 + Math.sin(performance.now() * 0.005) * 6,
            tint: "rgba(255, 210, 100, 0.28)"
          });
        }
      }
    }
  }

  // Carve lights out of dark layer
  for (const L of lights) {
    const g = lctx.createRadialGradient(L.x, L.y, 8, L.x, L.y, L.r);
    g.addColorStop(0, "rgba(0, 0, 0, 1)");
    g.addColorStop(0.4, "rgba(0, 0, 0, 0.85)");
    g.addColorStop(0.75, "rgba(0, 0, 0, 0.4)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    lctx.fillStyle = g;
    lctx.beginPath();
    lctx.arc(L.x, L.y, L.r, 0, Math.PI * 2);
    lctx.fill();
  }
  lctx.globalCompositeOperation = "source-over";
  ctx.drawImage(lightLayer, 0, 0);

  // Atmospheric warm light halos
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const L of lights) {
    const g = ctx.createRadialGradient(L.x, L.y, 4, L.x, L.y, L.r * 0.65);
    g.addColorStop(0, L.tint || "rgba(255, 176, 80, 0.20)");
    g.addColorStop(1, "rgba(255, 120, 40, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(L.x, L.y, L.r * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft cinematic edge vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.42, W / 2, H / 2, W * 0.72);
  vig.addColorStop(0, "rgba(0, 0, 0, 0)");
  vig.addColorStop(1, "rgba(4, 2, 8, 0.55)");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function text(str, x, y, opt = {}) {
  ctx.save();
  ctx.fillStyle = opt.color || COL.paper;
  const family = opt.family || "'Pixelify Sans', 'Courier New', monospace";
  const weight = opt.weight ? opt.weight + " " : "";
  ctx.font = `${weight}${opt.size || 10}px ${family}`;
  ctx.textAlign = opt.align || "left";
  ctx.textBaseline = opt.baseline || "alphabetic";
  if (opt.shadow) {
    ctx.shadowColor = opt.shadowColor || "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = opt.shadowBlur || 3;
    ctx.shadowOffsetX = opt.shadowOffsetX !== undefined ? opt.shadowOffsetX : 1;
    ctx.shadowOffsetY = opt.shadowOffsetY !== undefined ? opt.shadowOffsetY : 1;
  }
  ctx.fillText(str, x, y);
  ctx.restore();
}

function drawHUD() {
  const p = game.player;
  if (!p) return;

  // 1. Ruby Flame Health Vessels
  for (let i = 0; i < p.maxHp; i++) {
    const hx = 10 + i * 14;
    const hy = 8;
    // Bronze vessel frame
    ctx.fillStyle = "#1e1418";
    ctx.fillRect(hx, hy, 11, 10);
    ctx.fillStyle = i < p.hp ? COL.brassHi : "#4a3c36";
    ctx.strokeRect(hx + 0.5, hy + 0.5, 10, 9);

    if (i < p.hp) {
      // Living ruby flame
      const pulse = Math.sin(performance.now() * 0.01 + i) * 0.2 + 0.8;
      ctx.fillStyle = COL.danger;
      ctx.fillRect(hx + 2, hy + 3, 7, 5);
      ctx.fillStyle = COL.dangerHi;
      ctx.fillRect(hx + 3, hy + 2, 5, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(hx + 4, hy + 3, 2, 2);
    } else {
      // Broken cold vessel
      ctx.fillStyle = "#140e12";
      ctx.fillRect(hx + 2, hy + 2, 7, 6);
    }
  }

  // 2. Beacons Counter with mini lantern icon
  const lit = game.beacons.filter((b) => b.lit).length;
  ctx.fillStyle = COL.brass;
  ctx.fillRect(66, 9, 5, 7);
  ctx.fillStyle = COL.flame;
  ctx.fillRect(67, 11, 3, 3);
  text(`Beacons ${lit}/${game.beacons.length}`, 76, 17, { size: 9, color: COL.gold, shadow: true });

  // 3. Shards Counter with mini crystal diamond icon
  const got = game.shards.filter((s) => s.got).length;
  ctx.fillStyle = COL.shard;
  ctx.beginPath();
  ctx.moveTo(164, 13);
  ctx.lineTo(167, 9);
  ctx.lineTo(170, 13);
  ctx.lineTo(167, 17);
  ctx.fill();
  text(`Shards ${got}/${game.shards.length}`, 175, 17, { size: 9, color: COL.shardHi, shadow: true });

  // 4. Timer Pill
  const t = game.time / 60;
  text(formatTime(t), W - 10, 17, { size: 9, align: "right", color: COL.paper, shadow: true });

  // 5. Boss Health Bar (Keeper)
  if (game.level.boss && game.boss) {
    const bw = 160;
    const bx = W / 2 - bw / 2;
    const by = 8;
    // Ornate frame
    ctx.fillStyle = "#0c0812";
    ctx.fillRect(bx, by, bw, 10);
    ctx.strokeStyle = COL.gold;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 9);
    // Fill
    const frac = Math.max(0, game.boss.hp / 3);
    const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
    grad.addColorStop(0, COL.danger);
    grad.addColorStop(1, COL.dangerHi);
    ctx.fillStyle = grad;
    ctx.fillRect(bx + 2, by + 2, Math.round((bw - 4) * frac), 6);
    text("KEEPER OF THE GLOAM", W / 2, by + 22, { size: 8, align: "center", color: COL.dangerHi, shadow: true });
  }
}

function drawIntro() {
  ctx.fillStyle = "rgba(4, 2, 8, 0.65)";
  ctx.fillRect(0, H / 2 - 32, W, 64);
  ctx.fillStyle = "rgba(255, 180, 80, 0.15)";
  ctx.fillRect(0, H / 2 - 32, W, 1);
  ctx.fillRect(0, H / 2 + 31, W, 1);
  text(game.level.place, W / 2, H / 2 - 8, { align: "center", size: 9, color: COL.gold, family: "'Cinzel', serif", shadow: true });
  text(game.level.name, W / 2, H / 2 + 15, { align: "center", size: 16, color: COL.paper, family: "'Cinzel', serif", weight: "700", shadow: true });
}

function drawTutorial() {
  const p = game.player;
  if (!p || game.intro > 0 || game.paused) return;
  const isTouch = window.matchMedia("(pointer: coarse)").matches || settings.touch === "on";
  let msg = "";
  if (!game.seen.move) msg = isTouch ? "Move with  ◀  ▶" : "Move  A D   or   arrows   or   stick";
  else if (!game.seen.jump) msg = isTouch ? "Jump with  JUMP  (hold for more height)" : "Jump  Space / Z     hold for more height";
  else if (!game.seen.wall && game.levelIndex === 0 && p.x > 28 * TILE) msg = isTouch ? "Wall jump: hold into wall, then press JUMP" : "Wall jump: hold into a wall, then jump";
  else if (!game.seen.dash && p.x > 50 * TILE && game.levelIndex === 0) msg = isTouch ? "Dash with  DASH  (resets when you land)" : "Dash  Shift / X     once, until you land";
  else if (!game.seen.light && p.x > 32 * TILE && game.levelIndex === 0) { msg = "The lantern wakes hidden ground"; game.seen.light = p.x > 40 * TILE; }
  else if (!game.seen.foe && game.enemies.some((e) => !e.dead && Math.abs(e.x - p.x) < 70)) { msg = "Stomp foes, or hold the light until they flee"; game.seen.foe = true; }
  if (!msg) return;

  ctx.fillStyle = "rgba(6, 4, 10, 0.85)";
  ctx.fillRect(35, H - 30, W - 70, 20);
  ctx.strokeStyle = "rgba(228, 180, 94, 0.4)";
  ctx.strokeRect(35.5, H - 29.5, W - 71, 19);
  text(msg, W / 2, H - 16, { align: "center", size: 9, color: COL.paper, shadow: true });
}

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t * 100) % 100);
  return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

/* ---------------- menus ---------------- */
const buttons = [];
function button(x, y, w, h, label, fn, hot) {
  buttons.push({ x, y, w, h, label, fn, hot });
}

function drawButtons() {
  for (const b of buttons) {
    // 1. Dark stone plaque base
    ctx.fillStyle = b.hot ? "rgba(50, 32, 18, 0.96)" : "rgba(14, 10, 20, 0.92)";
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // 2. Beveled corners (chiseled stone look)
    ctx.fillStyle = "#08060c";
    ctx.fillRect(b.x, b.y, 2, 2);
    ctx.fillRect(b.x + b.w - 2, b.y, 2, 2);
    ctx.fillRect(b.x, b.y + b.h - 2, 2, 2);
    ctx.fillRect(b.x + b.w - 2, b.y + b.h - 2, 2, 2);

    // 3. Border: Glowing gold when hot, antique bronze when idle
    ctx.strokeStyle = b.hot ? COL.gold : "#5a4632";
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);

    // 4. Subtle inner highlight line
    ctx.fillStyle = b.hot ? "rgba(255, 240, 180, 0.25)" : "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(b.x + 2, b.y + 1, b.w - 4, 1);

    // 5. Corner decorative studs when selected
    if (b.hot) {
      ctx.fillStyle = COL.gold;
      ctx.fillRect(b.x + 3, b.y + 3, 2, 2);
      ctx.fillRect(b.x + b.w - 5, b.y + 3, 2, 2);
      ctx.fillRect(b.x + 3, b.y + b.h - 5, 2, 2);
      ctx.fillRect(b.x + b.w - 5, b.y + b.h - 5, 2, 2);
    }

    // 6. Label with indicator chevrons
    const displayLabel = b.hot ? `▸  ${b.label}  ◂` : b.label;
    text(displayLabel, b.x + b.w / 2, b.y + Math.round(b.h / 2) + 4, {
      align: "center",
      size: b.hot ? 11 : 10,
      weight: b.hot ? "700" : "500",
      color: b.hot ? COL.flame : COL.paper,
      shadow: true
    });
  }
}

function hitButton(mx, my) {
  for (let i = buttons.length - 1; i >= 0; i--) {
    const b = buttons[i];
    if (mx >= b.x - 4 && mx <= b.x + b.w + 4 && my >= b.y - 4 && my <= b.y + b.h + 4) return b;
  }
  return null;
}

function drawTitle() {
  drawBackgroundScene();

  // 1. Title Logo (GLOAMWARD)
  // Ambient backlight bloom
  const titleY = 62;
  const glowGrad = ctx.createRadialGradient(W / 2, titleY - 5, 10, W / 2, titleY - 5, 130);
  glowGrad.addColorStop(0, "rgba(255, 190, 80, 0.2)");
  glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(W / 2 - 140, titleY - 40, 280, 80);

  // Main Title Typography
  text("GLOAMWARD", W / 2, titleY, {
    align: "center",
    size: 32,
    family: "'Cinzel', serif",
    weight: "900",
    color: COL.paper,
    shadow: true,
    shadowBlur: 8,
    shadowOffsetX: 2,
    shadowOffsetY: 3,
    shadowColor: "#050308"
  });

  // Heraldic Decorative Divider Bar
  ctx.fillStyle = COL.gold;
  ctx.fillRect(W / 2 - 70, titleY + 8, 45, 1);
  ctx.fillRect(W / 2 + 25, titleY + 8, 45, 1);
  ctx.beginPath();
  ctx.moveTo(W / 2, titleY + 4);
  ctx.lineTo(W / 2 + 5, titleY + 9);
  ctx.lineTo(W / 2, titleY + 14);
  ctx.lineTo(W / 2 - 5, titleY + 9);
  ctx.fill();

  // Subtitle
  text("Carry the light. Wake the beacons.", W / 2, titleY + 26, {
    align: "center",
    size: 9,
    color: COL.gold,
    family: "'Cinzel', serif",
    shadow: true
  });

  // 2. Buttons: Elegantly positioned on the center-right (Traveler is on the left cliff)
  buttons.length = 0;
  const btnW = 140;
  const btnX = W / 2 + 10;
  const btnStartY = 114;
  const labels = ["Begin", "Levels", "Settings"];
  labels.forEach((lb, i) => {
    button(btnX, btnStartY + i * 30, btnW, 24, lb, () => titleAction(i), i === game.menuIndex);
  });
  drawButtons();

  // 3. Best Time Badge Pill
  const best = save.best.forest;
  const bestText = best ? `Best mile   ${formatTime(best.time)}` : "No road remembered yet";
  ctx.fillStyle = "rgba(12, 8, 16, 0.75)";
  ctx.fillRect(W / 2 - 80, 216, 180, 16);
  ctx.strokeStyle = "rgba(100, 80, 60, 0.4)";
  ctx.strokeRect(W / 2 - 79.5, 216.5, 179, 15);
  text(bestText, W / 2 + 10, 227, { align: "center", size: 8, color: COL.dim, shadow: true });

  // 4. Control Hints Pill
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  text(isTouch ? "Touch controls ready" : "Keyboard   mouse   gamepad", W / 2 + 10, 248, {
    align: "center",
    size: 8,
    color: "#6e6458",
    shadow: true
  });
}

function titleAction(i) {
  sfx.ui();
  ensureAudio();
  if (i === 0) startLevel(Math.min(save.unlocked, LEVELS.length - 1));
  else if (i === 1) { game.screen = "levels"; game.menuIndex = 0; }
  else { game.screen = "settings"; game.menuIndex = 0; game.settingsFrom = "title"; }
}

function drawLevels() {
  drawBackgroundScene();
  text("ROADS", W / 2, 36, { align: "center", size: 18, family: "'Cinzel', serif", weight: "700", color: COL.gold, shadow: true });
  buttons.length = 0;
  LEVELS.forEach((lv, i) => {
    const open = i <= save.unlocked;
    const best = save.best[lv.id];
    const label = open ? `${i + 1}.  ${lv.name}${best ? "   [" + formatTime(best.time) + "]" : ""}` : `${i + 1}.  Locked`;
    button(65, 54 + i * 32, 350, 24, label, () => { if (open) startLevel(i); }, i === game.menuIndex);
  });
  button(65, 230, 110, 24, "Back", () => { game.screen = "title"; game.menuIndex = 0; }, false);
  drawButtons();
}

function drawSettings() {
  drawBackgroundScene();
  text("SETTINGS", W / 2, 40, { align: "center", size: 18, family: "'Cinzel', serif", weight: "700", color: COL.gold, shadow: true });
  buttons.length = 0;
  button(60, 68, 360, 24, `Music   ${Math.round(settings.music * 100)}%`, () => { settings.music = (settings.music + 0.1) % 1.01; writeSave(); }, game.menuIndex === 0);
  button(60, 98, 360, 24, `Sound   ${Math.round(settings.sfx * 100)}%`, () => { settings.sfx = (settings.sfx + 0.1) % 1.01; writeSave(); sfx.ui(); }, game.menuIndex === 1);
  button(60, 128, 360, 24, `Screen shake   ${settings.shake ? "on" : "off"}`, () => { settings.shake = !settings.shake; writeSave(); }, game.menuIndex === 2);
  button(60, 158, 360, 24, `Touch buttons   ${settings.touch}`, () => {
    settings.touch = settings.touch === "auto" ? "on" : settings.touch === "on" ? "off" : "auto";
    writeSave();
  }, game.menuIndex === 3);
  button(60, 212, 120, 24, "Back", () => { game.screen = game.settingsFrom || "title"; game.menuIndex = 0; }, game.menuIndex === 4);
  drawButtons();
  text("Click a row to change it. Arrows + Enter work too.", W / 2, 252, { align: "center", size: 8, color: COL.dim });
}

function drawPause() {
  ctx.fillStyle = "rgba(4, 2, 8, 0.72)";
  ctx.fillRect(0, 0, W, H);
  text("PAUSED", W / 2, 68, { align: "center", size: 18, family: "'Cinzel', serif", weight: "700", color: COL.gold, shadow: true });
  buttons.length = 0;
  const items = [
    ["Resume", () => { game.paused = false; }],
    ["Restart", () => { game.paused = false; parseLevel(game.levelIndex); }],
    ["Settings", () => { game.screen = "settings"; game.settingsFrom = "play"; game.paused = false; game.menuIndex = 0; }],
    ["Title", () => { game.paused = false; game.screen = "title"; stopMusic(); }],
  ];
  items.forEach((it, i) => button(W / 2 - 75, 96 + i * 30, 150, 24, it[0], it[1], i === game.menuIndex));
  drawButtons();
  text("Move A/D   Jump Space   Dash Shift   Pause Esc", W / 2, 234, { align: "center", size: 8, color: COL.dim });
}

function drawResults() {
  drawBackgroundScene();
  const r = game.results;
  if (!r) return;
  text("ROAD CLEARED", W / 2, 38, { align: "center", size: 18, family: "'Cinzel', serif", weight: "700", color: COL.gold, shadow: true });
  text(r.name, W / 2, 60, { align: "center", size: 12, color: COL.paper, family: "'Cinzel', serif", shadow: true });

  // Stats Card
  ctx.fillStyle = "rgba(12, 8, 18, 0.85)";
  ctx.fillRect(W / 2 - 110, 75, 220, 110);
  ctx.strokeStyle = "rgba(228, 180, 94, 0.4)";
  ctx.strokeRect(W / 2 - 109.5, 75.5, 219, 109);

  text(`Time       ${formatTime(r.time)}`, W / 2, 98, { align: "center", size: 10, shadow: true });
  const rate = Math.round((r.shards / r.total) * 100);
  text(`Collection ${r.shards}/${r.total}   (${rate}%)`, W / 2, 120, { align: "center", size: 10, color: COL.shard, shadow: true });
  text(`Falls      ${r.deaths}`, W / 2, 140, { align: "center", size: 9, color: COL.dim, shadow: true });

  const rank = r.shards === r.total && r.time <= r.par ? "S" : r.shards === r.total ? "A" : r.shards >= 1 ? "B" : "C";
  text(`RANK  ${rank}`, W / 2, 168, { align: "center", size: 16, weight: "700", color: COL.flame, shadow: true });

  buttons.length = 0;
  const last = game.levelIndex >= LEVELS.length - 1;
  button(W / 2 - 110, 202, 100, 24, last ? "Ending" : "Next", () => {
    if (last) { game.screen = "ending"; game.ending = 0; }
    else startLevel(game.levelIndex + 1);
  }, game.menuIndex === 0);
  button(W / 2 + 10, 202, 100, 24, "Retry", () => startLevel(game.levelIndex), game.menuIndex === 1);
  button(W / 2 - 50, 234, 100, 22, "Title", () => { game.screen = "title"; game.menuIndex = 0; }, game.menuIndex === 2);
  drawButtons();
}

function drawEnding() {
  drawBackgroundScene();
  game.ending++;
  text("THE BEACONS HOLD", W / 2, 65, { align: "center", size: 18, family: "'Cinzel', serif", weight: "700", color: COL.gold, shadow: true });
  const lines = [
    "The fog does not leave. It only steps back",
    "where a wick is willing to burn.",
    "The road remembers your light.",
  ];
  lines.forEach((ln, i) => text(ln, W / 2, 105 + i * 18, { align: "center", size: 10, color: COL.paper, shadow: true }));
  buttons.length = 0;
  button(W / 2 - 55, 192, 110, 24, "Title", () => { game.screen = "title"; }, true);
  drawButtons();
  text("Gloamward  —  an original journey", W / 2, 248, { align: "center", size: 8, color: COL.dim });
}

function drawBackgroundScene() {
  game.cam = game.cam || { x: 0, y: 0 };
  updateAmbientMotes();

  // Full atmospheric celestial background
  drawBackground();

  // On Title Screen: Foreground Hero Promontory (Cliff & Traveler)
  if (game.screen === "title") {
    // 1. Ancient rocky cliff face in the lower left
    const cliffGrad = ctx.createLinearGradient(0, 185, 0, H);
    cliffGrad.addColorStop(0, "#181220");
    cliffGrad.addColorStop(0.3, "#100c18");
    cliffGrad.addColorStop(1, "#07040a");
    ctx.fillStyle = cliffGrad;
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, 195);
    ctx.lineTo(45, 192);
    ctx.lineTo(85, 195);
    ctx.lineTo(125, 215);
    ctx.lineTo(145, H);
    ctx.closePath();
    ctx.fill();

    // Rock strata & highlights
    ctx.strokeStyle = "#2e2238";
    ctx.beginPath();
    ctx.moveTo(10, 210); ctx.lineTo(60, 215); ctx.lineTo(110, 235);
    ctx.moveTo(0, 235); ctx.lineTo(40, 238); ctx.lineTo(95, 255);
    ctx.stroke();

    // Moss overhang & ragged grass cap
    ctx.fillStyle = COL.mossDark;
    ctx.fillRect(0, 193, 85, 3);
    ctx.fillStyle = COL.moss;
    ctx.fillRect(0, 192, 85, 2);
    ctx.fillStyle = COL.mossHi;
    ctx.fillRect(0, 191, 85, 1);
    for (let gx = 4; gx < 85; gx += 6) {
      const gH = 2 + (gx % 4);
      ctx.fillStyle = COL.moss;
      ctx.fillRect(gx, 195, 2, gH);
      ctx.fillStyle = COL.mossHi;
      ctx.fillRect(gx, 191, 2, 1);
    }

    // Glowing ancient rune carved in the cliff
    const runePulse = Math.sin(performance.now() * 0.003) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(228, 180, 94, ${0.45 * runePulse})`;
    ctx.fillRect(28, 222, 2, 8);
    ctx.fillRect(25, 224, 8, 2);
    ctx.fillRect(26, 227, 6, 2);

    // 2. The Traveler atop the cliff in 2.4x scale, looking across the horizon!
    const bob = Math.sin(performance.now() * 0.004) * 1.5;
    const heroX = 64;
    const heroY = 194 + bob;

    ctx.save();
    ctx.translate(heroX, heroY);
    ctx.scale(2.4, 2.4);

    // Traveler sprite facing right
    const heroAnim = Math.floor(performance.now() / 350) % 2;
    blit(-5, -8, travelerSprite("idle", heroAnim), PAL, false);

    // Held lantern
    const lanternSway = Math.sin(performance.now() * 0.005) * 1.5;
    const lx = 4 + lanternSway * 0.2;
    const ly = -8;
    ctx.fillStyle = COL.brass;
    ctx.fillRect(Math.round(lx), Math.round(ly), 4, 4);
    ctx.fillStyle = COL.flame;
    ctx.fillRect(Math.round(lx + 1), Math.round(ly + 1), 2, 2);
    ctx.fillStyle = COL.flameCore;
    ctx.fillRect(Math.round(lx + 1), Math.round(ly), 1, 1);

    // Waving crimson scarf in the wind
    const scarfWind = Math.sin(performance.now() * 0.008) * 2;
    ctx.fillStyle = COL.scarf;
    ctx.fillRect(-2, -6, 2, 2);
    ctx.fillStyle = COL.scarfHi;
    ctx.fillRect(-4 + scarfWind * 0.5, -5 + scarfWind * 0.3, 3, 2);
    ctx.fillStyle = COL.scarf;
    ctx.fillRect(-7 + scarfWind, -4 + scarfWind * 0.6, 3, 2);
    ctx.restore();

    // 3. Warm lantern radial illumination cone across the cliff and ground
    const lanternGlow = ctx.createRadialGradient(heroX + 12, heroY - 14, 5, heroX + 12, heroY - 14, 75);
    lanternGlow.addColorStop(0, "rgba(255, 210, 100, 0.45)");
    lanternGlow.addColorStop(0.35, "rgba(255, 160, 60, 0.18)");
    lanternGlow.addColorStop(1, "rgba(255, 120, 40, 0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = lanternGlow;
    ctx.beginPath();
    ctx.arc(heroX + 12, heroY - 14, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Occasional gentle spark rising from the lantern
    if (Math.random() < 0.2) {
      ambientMotes.push({
        x: heroX + 12 + (Math.random() - 0.5) * 4,
        y: heroY - 18,
        vx: 0.2 + Math.random() * 0.4,
        vy: -0.4 - Math.random() * 0.6,
        size: 1.5,
        alpha: 0.9,
        phase: Math.random() * Math.PI,
        color: Math.random() < 0.7 ? COL.flame : COL.flameCore,
      });
    }
  }
}

function startLevel(i) {
  ensureAudio();
  game.screen = "play";
  game.paused = false;
  game.fade = 1;
  game.fadeDir = -1;
  game.pending = null;
  parseLevel(Math.max(0, Math.min(LEVELS.length - 1, i)));
  syncTouch();
}

function render() {
  ctx.imageSmoothingEnabled = false;
  buttons.length = 0;
  if (game.screen === "title") drawTitle();
  else if (game.screen === "levels") drawLevels();
  else if (game.screen === "settings") drawSettings();
  else if (game.screen === "results") drawResults();
  else if (game.screen === "ending") drawEnding();
  else if (game.screen === "play") drawWorld();
}

function menuCount() {
  if (game.screen === "title") return 3;
  if (game.screen === "levels") return 5;
  if (game.screen === "settings") return 5;
  if (game.screen === "results") return 3;
  if (game.paused) return 4;
  return 0;
}
function activateMenu() {
  const b = buttons[game.menuIndex];
  if (b) b.fn();
}

function loop() {
  syncTouch();
  if (game.screen !== "play" || game.paused) {
    gatherInput();
    const n = menuCount();
    if (n) {
      if (input.jumpPressed && (keys.has("ArrowDown") || keys.has("KeyS"))) {}
      if (keys.has("ArrowDown") || keys.has("KeyS")) { /* edge handled below */ }
    }
    // edge menu move using jumpPressed-like: track with keys set on this frame via pause style
    endInput();
  }
  update();
  render();
  requestAnimationFrame(loop);
}

let menuCool = 0;
addEventListener("keydown", (e) => {
  if (menuCool > 0) return;
  const inMenu = game.screen !== "play" || game.paused;
  if (!inMenu) return;
  const n = menuCount();
  if (!n) return;
  if (e.code === "ArrowDown" || e.code === "KeyS") { game.menuIndex = (game.menuIndex + 1) % n; menuCool = 8; sfx.ui(); }
  if (e.code === "ArrowUp" || e.code === "KeyW") { game.menuIndex = (game.menuIndex + n - 1) % n; menuCool = 8; sfx.ui(); }
  if (e.code === "Enter" || e.code === "Space" || e.code === "KeyZ") { activateMenu(); menuCool = 10; }
  if (e.code === "Escape" && game.paused) { game.paused = false; }
});
setInterval(() => { if (menuCool > 0) menuCool--; }, 16);

canvas.addEventListener("pointerdown", (e) => {
  ensureAudio();
  const r = canvas.getBoundingClientRect();
  const mx = (e.clientX - r.left) * W / r.width;
  const my = (e.clientY - r.top) * H / r.height;
  const b = hitButton(mx, my);
  if (b) { b.fn(); sfx.ui(); }
});

let lastTouchOn = null;
function syncTouch() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const on = (settings.touch === "on" || (settings.touch === "auto" && coarse)) && game.screen === "play" && !game.paused;
  if (on !== lastTouchOn) {
    lastTouchOn = on;
    const touchEl = document.getElementById("touch");
    if (touchEl) touchEl.classList.toggle("on", on);
    if (!on) {
      btnState.l = false;
      btnState.r = false;
      btnState.dn = false;
      btnState.j = false;
      btnState.d = false;
      const activeBtns = document.querySelectorAll("#touch button.active");
      activeBtns.forEach((b) => b.classList.remove("active"));
    }
  }
}
addEventListener("resize", syncTouch);

// mouse / gamepad can also use on-screen buttons if enabled
syncTouch();
render();
requestAnimationFrame(loop);

// debug hook for playtesting
window.__G = {
  game, startLevel, settings, save,
  snap: () => canvas.toDataURL("image/png"),
};

if (typeof window !== "undefined" && window.location && new URLSearchParams(window.location.search).has("start")) {
  startLevel(0);
  game.fade = 0;
  game.fadeDir = 0;
}
