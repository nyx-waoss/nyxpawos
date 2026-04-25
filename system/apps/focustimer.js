console.log('Current: apps/focustimer.js');


// ─── Estado ────────────────────────────────────────────────────────────────
const FT = {
    modes: {
        pomodoro: { label: 'ENFOQUE',       duration: 25 * 60, isBreak: false },
        short:    { label: 'DESCANSO',      duration:  5 * 60, isBreak: true  },
        long:     { label: 'DESCANSO LARGO',duration: 15 * 60, isBreak: true  },
    },
    currentMode: 'pomodoro',
    totalSeconds: 25 * 60,
    remaining: 25 * 60,
    running: false,
    interval: null,
    circumference: 553, // 2πr ≈ 2*π*88

    stats: {
        today: 0,
        streak: 0,
        total: 0,
        lastDate: null,
    },
    log: [],

    // DOM refs
    el: {},
};

// ─── Persistencia ──────────────────────────────────────────────────────────
function ft_saveStats() {
    try {
        localStorage.setItem('ft_stats', JSON.stringify(FT.stats));
        localStorage.setItem('ft_log',   JSON.stringify(FT.log.slice(-50)));
    } catch(e) {}
}

function ft_loadStats() {
    try {
        const s = localStorage.getItem('ft_stats');
        const l = localStorage.getItem('ft_log');
        if (s) FT.stats = JSON.parse(s);
        if (l) FT.log   = JSON.parse(l);

        // reset today count if it's a new day
        const today = new Date().toDateString();
        if (FT.stats.lastDate && FT.stats.lastDate !== today) {
            FT.stats.today = 0;
        }
        FT.stats.lastDate = today;
    } catch(e) {}
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function ft_fmt(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function ft_now() {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
}

function ft_updateRing() {
    const progress = FT.remaining / FT.totalSeconds;
    const offset   = FT.circumference * (1 - progress);
    FT.el.ring.style.strokeDashoffset = offset;

    const warn = FT.remaining <= 60 && !FT.modes[FT.currentMode].isBreak;
    FT.el.ring.classList.toggle('warn', warn);
    FT.el.display.classList.toggle('warn', warn);
}

function ft_updateDisplay() {
    FT.el.display.textContent = ft_fmt(FT.remaining);
    ft_updateRing();
}

function ft_updateStats() {
    FT.el.statToday.textContent  = FT.stats.today;
    FT.el.statStreak.textContent = FT.stats.streak;
    FT.el.statTotal.textContent  = FT.stats.total;
}

function ft_renderLog() {
    if (FT.log.length === 0) {
        FT.el.log.innerHTML = '<div class="ft-log-empty">Sin sesiones aún...</div>';
        return;
    }
    FT.el.log.innerHTML = FT.log.slice().reverse().map(e => `
        <div class="ft-log-entry">
            <span class="ft-log-time">${e.time}</span>
            <span class="ft-log-type ${e.isBreak ? 'break' : ''}">${e.type}</span>
            <span class="ft-log-task">${e.task || '—'}</span>
        </div>
    `).join('');
}

function ft_addLogEntry(type, isBreak) {
    const task = FT.el.taskInput.value.trim();
    FT.log.push({ time: ft_now(), type, isBreak, task });
    ft_renderLog();
}

// ─── Core lógica ───────────────────────────────────────────────────────────
function ft_setMode(mode) {
    ft_stop();
    FT.currentMode   = mode;
    FT.totalSeconds  = FT.modes[mode].duration;
    FT.remaining     = FT.totalSeconds;

    // update tabs
    FT.el.tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    FT.el.statusLabel.textContent = FT.modes[mode].label;
    FT.el.startBtn.textContent    = 'INICIAR';
    FT.el.startBtn.classList.remove('running');
    FT.el.display.classList.remove('pulse', 'warn');
    FT.el.ring.classList.remove('warn');

    ft_updateDisplay();
}

function ft_start() {
    if (FT.running) return;
    FT.running = true;
    FT.el.startBtn.textContent = 'PAUSAR';
    FT.el.startBtn.classList.add('running');
    FT.el.statusLabel.textContent = FT.modes[FT.currentMode].label + '...';

    FT.interval = setInterval(() => {
        if (FT.remaining <= 0) {
            ft_complete();
            return;
        }
        FT.remaining--;
        ft_updateDisplay();
    }, 1000);
}

function ft_pause() {
    if (!FT.running) return;
    FT.running = false;
    clearInterval(FT.interval);
    FT.interval = null;
    FT.el.startBtn.textContent = 'CONTINUAR';
    FT.el.startBtn.classList.remove('running');
    FT.el.statusLabel.textContent = 'PAUSADO';
}

function ft_stop() {
    FT.running = false;
    clearInterval(FT.interval);
    FT.interval = null;
}

function ft_reset() {
    ft_stop();
    FT.remaining = FT.totalSeconds;
    FT.el.startBtn.textContent = 'INICIAR';
    FT.el.startBtn.classList.remove('running');
    FT.el.display.classList.remove('pulse', 'warn');
    FT.el.ring.classList.remove('warn');
    FT.el.statusLabel.textContent = FT.modes[FT.currentMode].label;
    ft_updateDisplay();
}

function ft_complete() {
    ft_stop();
    const mode    = FT.modes[FT.currentMode];
    const typeStr = mode.isBreak ? 'BREAK' : '🍅 POMO';

    if (!mode.isBreak) {
        FT.stats.today++;
        FT.stats.total++;
        FT.stats.streak++;
        FT.stats.lastDate = new Date().toDateString();
        ft_updateStats();
    }

    ft_addLogEntry(typeStr, mode.isBreak);
    ft_saveStats();

    // visual feedback
    FT.el.display.classList.add('pulse');
    FT.el.statusLabel.textContent = mode.isBreak ? '¡DESCANSADO!' : '¡COMPLETADO!';
    FT.el.startBtn.textContent    = 'INICIAR';

    // notify if possible
    ft_notify(mode.isBreak ? '¡Descanso terminado!' : '🍅 ¡Pomodoro completado!');

    // auto-advance mode suggestion
    if (!mode.isBreak) {
        const nextBreak = (FT.stats.today % 4 === 0) ? 'long' : 'short';
        setTimeout(() => ft_setMode(nextBreak), 800);
    } else {
        setTimeout(() => ft_setMode('pomodoro'), 800);
    }
}

function ft_notify(msg) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Timer', { body: msg, icon: '' });
    }
}

function ft_requestNotifPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ─── Init / Cleanup ────────────────────────────────────────────────────────
function init_focustimer() {
    console.log('Initiating focustimer...');

    // Cache DOM
    const w = document.getElementById('win_focustimer');
    FT.el = {
        display:    w.querySelector('#ft-display'),
        ring:       w.querySelector('#ft-ring-prog'),
        statusLabel:w.querySelector('#ft-status-label'),
        startBtn:   w.querySelector('#ft-start-btn'),
        resetBtn:   w.querySelector('#ft-reset-btn'),
        skipBtn:    w.querySelector('#ft-skip-btn'),
        taskInput:  w.querySelector('#ft-task-input'),
        tabs:       w.querySelectorAll('.ft-tab'),
        log:        w.querySelector('#ft-log'),
        clearLog:   w.querySelector('#ft-clear-log'),
        statToday:  w.querySelector('#ft-stat-today'),
        statStreak: w.querySelector('#ft-stat-streak'),
        statTotal:  w.querySelector('#ft-stat-total'),
    };

    ft_loadStats();
    ft_updateStats();
    ft_renderLog();
    ft_updateDisplay();
    ft_requestNotifPermission();

    // Eventos
    FT.el.startBtn.addEventListener('click', () => {
        if (FT.running) ft_pause();
        else ft_start();
    });

    FT.el.resetBtn.addEventListener('click', ft_reset);

    FT.el.skipBtn.addEventListener('click', () => {
        ft_stop();
        const mode = FT.currentMode;
        const next = mode === 'pomodoro' ? 'short' : 'pomodoro';
        ft_setMode(next);
    });

    FT.el.tabs.forEach(tab => {
        tab.addEventListener('click', () => ft_setMode(tab.dataset.mode));
    });

    FT.el.clearLog.addEventListener('click', () => {
        FT.log = [];
        ft_renderLog();
        ft_saveStats();
    });

    // keyboard shortcut: Space = play/pause (solo si la ventana está visible)
    FT._keyHandler = (e) => {
        if (e.code === 'Space' && document.activeElement !== FT.el.taskInput) {
            e.preventDefault();
            if (FT.running) ft_pause();
            else ft_start();
        }
    };
    window.addEventListener('keydown', FT._keyHandler);
}

function cleanup_focustimer() {
    console.log('Cleaning focustimer...');
    ft_stop();
    if (FT._keyHandler) {
        window.removeEventListener('keydown', FT._keyHandler);
        FT._keyHandler = null;
    }
}

window.scriptReady('focustimer');
// template version 3.1