console.log('Current: apps/nyxpawslides.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.nyxpawslides = {
    displayName: 'NyxPaw Slides',
    icon: '../../assets/apps/nyxpawslides.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

const SLIDES_WINDOW_ID = 'win_nyxpawslides';

let slides_state = {
    slides: [],
    currentSlide: 0,
    selectedEl: null,
    tool: 'select',
    dragging: false,
    dragOffX: 0, dragOffY: 0,
    resizing: false,
    resizeHandle: null,
    resizeStartX: 0, resizeStartY: 0,
    resizeElSnap: null,
    drawing: false,
    drawStartX: 0, drawStartY: 0,
    CW: 800, CH: 450,
    _resizeObserver: null,
};

const SLIDES_FONTS = ['Arial', 'Georgia', 'Courier New', 'Trebuchet MS', 'Verdana', 'Impact'];

function NPSPresent() {
    const overlay = document.createElement('div');
    overlay.id = 'nps-present-overlay';
    Object.assign(overlay.style, {
        position: 'fixed', inset: '0',
        background: '#000',
        zIndex: '99999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    const cv = document.createElement('canvas');
    cv.width  = slides_state.CW;
    cv.height = slides_state.CH;

    function fitCanvas() {
        const scale = Math.min(
            window.innerWidth  / slides_state.CW,
            window.innerHeight / slides_state.CH
        );
        cv.style.width  = Math.floor(slides_state.CW * scale) + 'px';
        cv.style.height = Math.floor(slides_state.CH * scale) + 'px';
    }

    let presentIdx = slides_state.currentSlide;

    function renderPresent() {
        const ctx = cv.getContext('2d');
        const s = slides_state.slides[presentIdx];
        ctx.clearRect(0, 0, slides_state.CW, slides_state.CH);
        ctx.fillStyle = s.bg || '#fff';
        ctx.fillRect(0, 0, slides_state.CW, slides_state.CH);
        s.elements.forEach(el => {
            ctx.save();
            ctx.globalAlpha = el.opacity;
            slides_drawEl(ctx, el);
            ctx.restore();
        });

        const label = `${presentIdx + 1} / ${slides_state.slides.length}`;
        ctx.font = '14px Segoe UI';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, slides_state.CW - 10, slides_state.CH - 8);

        window.parent.postMessage({
            action: 'fullscreen',
            windowId: 'nyxpawslides',
            enable: true
        }, '*');
    }

    function onKey(e) {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight' || e.key === ' ') {
            if (presentIdx < slides_state.slides.length - 1) { presentIdx++; renderPresent(); }
        }
        if (e.key === 'ArrowLeft') {
            if (presentIdx > 0) { presentIdx--; renderPresent(); }
        }
    }

    function close() {
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', fitAndRender);
        overlay.remove();
        window.parent.postMessage({
            action: 'fullscreen',
            windowId: 'nyxpawslides',
            enable: false
        }, '*');
    }

    function fitAndRender() { fitCanvas(); renderPresent(); }

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', fitAndRender);

    overlay.appendChild(cv);
    document.body.appendChild(overlay);

    fitCanvas();
    renderPresent();
}

function slides_slide() {
    return slides_state.slides[slides_state.currentSlide];
}
function slides_el() {
    const s = slides_slide();
    if (!s || slides_state.selectedEl === null) return null;
    return s.elements[slides_state.selectedEl] || null;
}
function slides_newEl(type, x, y, w, h) {
    return {
        type,
        x, y, w, h,
        fill: '#4a9aff',
        stroke: '#ffffff',
        strokeWidth: 1,
        opacity: 1,
        text: type === 'text' ? 'Texto' : '',
        fontSize: 20,
        fontFamily: 'Arial',
        fontBold: false,
        fontItalic: false,
        textColor: '#ffffff',
        textAlign: 'center',
    };
}
function slides_clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function slides_resizeCanvas() {
    const cv = document.getElementById('slides-canvas');
    const area = document.querySelector('.slides-canvas-area');
    if (!cv || !area) return;

    const areaW = area.clientWidth;
    const areaH = area.clientHeight;
    if (areaW < 10 || areaH < 10) return;

    const padding = 40;
    const scaleX = (areaW - padding) / slides_state.CW;
    const scaleY = (areaH - padding) / slides_state.CH;
    const scale = Math.min(scaleX, scaleY);

    cv.style.width  = Math.floor(slides_state.CW * scale) + 'px';
    cv.style.height = Math.floor(slides_state.CH * scale) + 'px';
}

function slides_render(thumbUpdate = true) {
    const cv = document.getElementById('slides-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const s = slides_slide();
    if (!s) return;

    ctx.clearRect(0, 0, slides_state.CW, slides_state.CH);
    ctx.fillStyle = s.bg || '#ffffff';
    ctx.fillRect(0, 0, slides_state.CW, slides_state.CH);

    s.elements.forEach((el, idx) => {
        ctx.save();
        ctx.globalAlpha = el.opacity;
        slides_drawEl(ctx, el);
        if (idx === slides_state.selectedEl) {
            ctx.strokeStyle = '#4a9aff';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(el.x - 3, el.y - 3, el.w + 6, el.h + 6);
            ctx.setLineDash([]);
            slides_drawHandles(ctx, el);
        }
        ctx.restore();
    });

    if (thumbUpdate) slides_renderThumbs();
    slides_updateStatus();
}

function slides_drawHandles(ctx, el) {
    const pos = slides_handlePos(el);
    ctx.setLineDash([]);
    for (const [, [hx, hy]] of Object.entries(pos)) {
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#4a9aff';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function slides_drawEl(ctx, el) {
    if (el.type === 'text') {
        const style = `${el.fontItalic ? 'italic ' : ''}${el.fontBold ? 'bold ' : ''}${el.fontSize}px ${el.fontFamily}`;
        ctx.font = style;
        ctx.fillStyle = el.textColor;
        ctx.textAlign = el.textAlign || 'center';
        ctx.textBaseline = 'middle';
        const words = el.text.split(' ');
        let line = '';
        const lines = [];
        for (let w of words) {
            const test = line ? line + ' ' + w : w;
            if (ctx.measureText(test).width > el.w && line) {
                lines.push(line); line = w;
            } else { line = test; }
        }
        lines.push(line);
        const lh = el.fontSize * 1.25;
        const startY = el.y + el.h / 2 - ((lines.length - 1) * lh) / 2;
        const ax = el.textAlign === 'left' ? el.x + 4 : el.textAlign === 'right' ? el.x + el.w - 4 : el.x + el.w / 2;
        lines.forEach((ln, i) => ctx.fillText(ln, ax, startY + i * lh));
        return;
    }

    ctx.fillStyle = el.fill;
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth;

    if (el.type === 'rect') {
        ctx.fillRect(el.x, el.y, el.w, el.h);
        if (el.strokeWidth > 0) ctx.strokeRect(el.x, el.y, el.w, el.h);
    } else if (el.type === 'rounded') {
        const r = Math.min(12, el.w / 4, el.h / 4);
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.w, el.h, r);
        ctx.fill();
        if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.type === 'circle') {
        ctx.beginPath();
        ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, el.w / 2, el.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        if (el.strokeWidth > 0) ctx.stroke();
    } else if (el.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(el.x + el.w / 2, el.y);
        ctx.lineTo(el.x + el.w, el.y + el.h);
        ctx.lineTo(el.x, el.y + el.h);
        ctx.closePath();
        ctx.fill();
        if (el.strokeWidth > 0) ctx.stroke();
    }
}

function slides_renderThumbs() {
    const panel = document.getElementById('slides-panel');
    if (!panel) return;
    panel.innerHTML = '';
    slides_state.slides.forEach((slide, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'slide-thumb' + (idx === slides_state.currentSlide ? ' selected' : '');
        //wrap.style.cursor = 'pointer';
        wrap.dataset.idx = idx;

        const cv = document.createElement('canvas');
        cv.className = 'slide-thumb-canvas';
        cv.width = 160; cv.height = 90;
        const ctx = cv.getContext('2d');
        const sc = 160 / slides_state.CW;
        ctx.scale(sc, sc);
        ctx.fillStyle = slide.bg || '#ffffff';
        ctx.fillRect(0, 0, slides_state.CW, slides_state.CH);
        slide.elements.forEach(el => { ctx.save(); slides_drawEl(ctx, el); ctx.restore(); });

        const num = document.createElement('span');
        num.className = 'slide-thumb-num';
        num.textContent = idx + 1;

        wrap.appendChild(cv);
        wrap.appendChild(num);
        wrap.addEventListener('click', () => {
            slides_state.currentSlide = idx;
            slides_state.selectedEl = null;
            slides_render();
            slides_updateProps();
        });
        panel.appendChild(wrap);
    });
}

function slides_updateProps() {
    const panel = document.getElementById('slides-props-panel');
    if (!panel) return;
    const el = slides_el();
    const s = slides_slide();
    panel.innerHTML = '';

    const bgSec = document.createElement('div');
    bgSec.className = 'props-section';
    bgSec.innerHTML = `<div class="props-label">Fondo del slide</div>
    <div class="props-row">
      <label>Color</label>
      <input type="color" id="prop-slide-bg" value="${s ? (s.bg || '#ffffff') : '#ffffff'}">
    </div>`;
    panel.appendChild(bgSec);
    document.getElementById('prop-slide-bg').addEventListener('input', e => {
        slides_slide().bg = e.target.value;
        slides_render();
    });

    if (!el) {
        const emp = document.createElement('p');
        emp.className = 'props-empty';
        emp.textContent = 'Seleccioná un elemento';
        panel.appendChild(emp);
        return;
    }

    const geomSec = slides_propsSection('Posición & Tamaño', `
        <div class="props-row"><label>X</label><input type="number" id="prop-x" value="${Math.round(el.x)}" min="0"></div>
        <div class="props-row"><label>Y</label><input type="number" id="prop-y" value="${Math.round(el.y)}" min="0"></div>
        <div class="props-row"><label>W</label><input type="number" id="prop-w" value="${Math.round(el.w)}" min="10"></div>
        <div class="props-row"><label>H</label><input type="number" id="prop-h" value="${Math.round(el.h)}" min="10"></div>
    `);
    panel.appendChild(geomSec);
    ['x','y','w','h'].forEach(k => {
        document.getElementById('prop-'+k).addEventListener('change', e => {
            el[k] = parseFloat(e.target.value) || 0;
            slides_render();
        });
    });

    if (el.type !== 'text') {
        const appSec = slides_propsSection('Apariencia', `
            <div class="props-row"><label>Relleno</label><input type="color" id="prop-fill" value="${el.fill}"></div>
            <div class="props-row"><label>Borde</label><input type="color" id="prop-stroke" value="${el.stroke}"></div>
            <div class="props-row"><label>Grosor</label>
              <input type="range" id="prop-sw" min="0" max="10" value="${el.strokeWidth}">
              <span id="prop-sw-val" style="font-size:11px;color:#aaa;min-width:16px">${el.strokeWidth}</span>
            </div>
        `);
        panel.appendChild(appSec);
        document.getElementById('prop-fill').addEventListener('input', e => { el.fill = e.target.value; slides_render(); });
        document.getElementById('prop-stroke').addEventListener('input', e => { el.stroke = e.target.value; slides_render(); });
        document.getElementById('prop-sw').addEventListener('input', e => {
            el.strokeWidth = parseInt(e.target.value);
            document.getElementById('prop-sw-val').textContent = el.strokeWidth;
            slides_render();
        });
    }

    if (el.type === 'text') {
        const fontOpts = SLIDES_FONTS.map(f => `<option value="${f}" ${el.fontFamily===f?'selected':''}>${f}</option>`).join('');
        const txtSec = slides_propsSection('Texto', `
            <div class="props-row"><label>Color</label><input type="color" id="prop-tc" value="${el.textColor}"></div>
            <div class="props-row"><label>Fuente</label><select id="prop-ff">${fontOpts}</select></div>
            <div class="props-row"><label>Tamaño</label><input type="number" id="prop-fs" value="${el.fontSize}" min="8" max="120"></div>
            <div class="props-row">
              <label>Estilo</label>
              <button class="props-btn${el.fontBold?' active':''}" id="prop-bold" style="flex:1">N</button>
              <button class="props-btn${el.fontItalic?' active':''}" id="prop-italic" style="flex:1;font-style:italic">I</button>
            </div>
            <div class="props-row"><label>Alin.</label>
              <select id="prop-ta">
                <option value="left" ${el.textAlign==='left'?'selected':''}>Izq.</option>
                <option value="center" ${el.textAlign==='center'?'selected':''}>Centro</option>
                <option value="right" ${el.textAlign==='right'?'selected':''}>Der.</option>
              </select>
            </div>
        `);
        panel.appendChild(txtSec);

        const editBtn = document.createElement('button');
        editBtn.className = 'props-btn';
        editBtn.textContent = '✏ Editar texto';
        editBtn.onclick = () => slides_editText();
        txtSec.appendChild(editBtn);

        document.getElementById('prop-tc').addEventListener('input', e => { el.textColor = e.target.value; slides_render(); });
        document.getElementById('prop-ff').addEventListener('change', e => { el.fontFamily = e.target.value; slides_render(); });
        document.getElementById('prop-fs').addEventListener('change', e => { el.fontSize = parseInt(e.target.value)||16; slides_render(); });
        document.getElementById('prop-bold').addEventListener('click', e => {
            el.fontBold = !el.fontBold;
            e.target.classList.toggle('active', el.fontBold);
            slides_render();
        });
        document.getElementById('prop-italic').addEventListener('click', e => {
            el.fontItalic = !el.fontItalic;
            e.target.classList.toggle('active', el.fontItalic);
            slides_render();
        });
        document.getElementById('prop-ta').addEventListener('change', e => { el.textAlign = e.target.value; slides_render(); });
    }

    const opSec = slides_propsSection('Opacidad', `
        <div class="props-row">
          <input type="range" id="prop-op" min="0" max="1" step="0.05" value="${el.opacity}">
          <span id="prop-op-val" style="font-size:11px;color:#aaa;min-width:28px">${Math.round(el.opacity*100)}%</span>
        </div>
    `);
    panel.appendChild(opSec);
    document.getElementById('prop-op').addEventListener('input', e => {
        el.opacity = parseFloat(e.target.value);
        document.getElementById('prop-op-val').textContent = Math.round(el.opacity*100) + '%';
        slides_render();
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'props-btn danger';
    delBtn.textContent = '✕ Eliminar elemento';
    delBtn.onclick = slides_deleteEl;
    panel.appendChild(delBtn);
}

function slides_propsSection(label, html) {
    const sec = document.createElement('div');
    sec.className = 'props-section';
    sec.innerHTML = `<div class="props-label">${label}</div>${html}`;
    return sec;
}

function slides_updateStatus() {
    const l = document.getElementById('slides-status-left');
    const r = document.getElementById('slides-status-right');
    if (l) l.textContent = `Slide ${slides_state.currentSlide + 1} / ${slides_state.slides.length}`;
    const el = slides_el();
    if (r) r.textContent = el ? `${el.type} seleccionado` : 'Sin selección';
}

async function slides_editText() {
    const el = slides_el();
    if (!el || el.type !== 'text') return;
    const result = await showPromptMsgBox('Texto', 'Nuevo texto:' , 'Ok', 'Cancelar',{as_win:true,icon:'✏️'});
    if (result.confirmed && result.value !== '') {
        el.text = result.value;
        slides_render();
    }
}

function slides_hitEl(x, y) {
    const s = slides_slide();
    for (let i = s.elements.length - 1; i >= 0; i--) {
        const el = s.elements[i];
        if (x >= el.x && x <= el.x + el.w && y >= el.y && y <= el.y + el.h) return i;
    }
    return null;
}

function slides_handlePos(el) {
    const mx = el.x + el.w / 2, my = el.y + el.h / 2;
    const ex = el.x + el.w, ey = el.y + el.h;
    return {
        nw: [el.x, el.y],   n: [mx, el.y],   ne: [ex, el.y],
        e:  [ex, my],        se: [ex, ey],     s: [mx, ey],
        sw: [el.x, ey],      w: [el.x, my],
    };
}

function slides_hitHandle(x, y, el) {
    if (!el) return null;
    const pos = slides_handlePos(el);
    const R = 8; 
    for (const [key, [hx, hy]] of Object.entries(pos)) {
        if (Math.abs(x - hx) < R && Math.abs(y - hy) < R) return key;
    }
    return null;
}

function slides_canvasPos(e) {
    const cv = document.getElementById('slides-canvas');
    const rect = cv.getBoundingClientRect();
    const scaleX = slides_state.CW / rect.width;
    const scaleY = slides_state.CH / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

function slides_onMouseDown(e) {
    if (e.button !== 0) return;
    const { x, y } = slides_canvasPos(e);
    const tool = slides_state.tool;
    const s = slides_slide();

    if (tool === 'select') {
        const el = slides_el();
        if (el) {
            const h = slides_hitHandle(x, y, el);
            if (h) {
                slides_state.resizing = true;
                slides_state.resizeHandle = h;
                slides_state.resizeStartX = x;
                slides_state.resizeStartY = y;
                slides_state.resizeElSnap = { ...el };
                return;
            }
        }
        const idx = slides_hitEl(x, y);
        slides_state.selectedEl = idx;
        if (idx !== null) {
            const hit = s.elements[idx];
            slides_state.dragging = true;
            slides_state.dragOffX = x - hit.x;
            slides_state.dragOffY = y - hit.y;
        }
        slides_render();
        slides_updateProps();
    } else {
        slides_state.drawing = true;
        slides_state.drawStartX = x;
        slides_state.drawStartY = y;
        const newEl = slides_newEl(tool, x, y, 4, 4);
        s.elements.push(newEl);
        slides_state.selectedEl = s.elements.length - 1;
        slides_render();
        slides_updateProps();
    }
}

function slides_onMouseMove(e) {
    const { x, y } = slides_canvasPos(e);
    const s = slides_slide();

    if (slides_state.dragging && slides_state.selectedEl !== null) {
        const el = s.elements[slides_state.selectedEl];
        el.x = slides_clamp(x - slides_state.dragOffX, 0, slides_state.CW - el.w);
        el.y = slides_clamp(y - slides_state.dragOffY, 0, slides_state.CH - el.h);
        slides_render(false);
    } else if (slides_state.resizing && slides_state.selectedEl !== null) {
        const el = s.elements[slides_state.selectedEl];
        const snap = slides_state.resizeElSnap;
        const dx = x - slides_state.resizeStartX;
        const dy = y - slides_state.resizeStartY;
        const h = slides_state.resizeHandle;
        const MIN = 10;
        if (h.includes('e')) el.w = Math.max(MIN, snap.w + dx);
        if (h.includes('s')) el.h = Math.max(MIN, snap.h + dy);
        if (h.includes('w')) { el.w = Math.max(MIN, snap.w - dx); el.x = snap.x + snap.w - el.w; }
        if (h.includes('n')) { el.h = Math.max(MIN, snap.h - dy); el.y = snap.y + snap.h - el.h; }
        slides_render(false);
    } else if (slides_state.drawing && slides_state.selectedEl !== null) {
        const el = s.elements[slides_state.selectedEl];
        const nx = Math.min(x, slides_state.drawStartX);
        const ny = Math.min(y, slides_state.drawStartY);
        el.x = nx; el.y = ny;
        el.w = Math.max(4, Math.abs(x - slides_state.drawStartX));
        el.h = Math.max(4, Math.abs(y - slides_state.drawStartY));
        slides_render(false);
    }
}

function slides_onMouseUp() {
    if (slides_state.dragging || slides_state.resizing || slides_state.drawing) {
        slides_state.dragging = false;
        slides_state.resizing = false;
        slides_state.drawing = false;
        if (slides_state.tool !== 'select') {
            slides_setTool('select');
        }
        slides_render();
        slides_updateProps();
    }
}

function slides_onDblClick(e) {
    const { x, y } = slides_canvasPos(e);
    const idx = slides_hitEl(x, y);
    if (idx !== null) {
        slides_state.selectedEl = idx;
        const el = slides_slide().elements[idx];
        if (el.type === 'text') slides_editText();
        slides_render();
        slides_updateProps();
    }
}

function slides_setTool(t) {
    slides_state.tool = t;
    document.querySelectorAll('.slides-tool-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === t);
    });
    const cv = document.getElementById('slides-canvas');
    if (cv) cv.style.cursor = t === 'select' ? 'default' : 'crosshair';
}

function slides_addSlide() {
    slides_state.slides.push({ bg: '#ffffff', elements: [] });
    slides_state.currentSlide = slides_state.slides.length - 1;
    slides_state.selectedEl = null;
    slides_render();
    slides_updateProps();
}

function slides_delSlide() {
    if (slides_state.slides.length <= 1) return;
    slides_state.slides.splice(slides_state.currentSlide, 1);
    slides_state.currentSlide = Math.max(0, slides_state.currentSlide - 1);
    slides_state.selectedEl = null;
    slides_render();
    slides_updateProps();
}

function slides_deleteEl() {
    if (slides_state.selectedEl === null) return;
    slides_slide().elements.splice(slides_state.selectedEl, 1);
    slides_state.selectedEl = null;
    slides_render();
    slides_updateProps();
}

function slides_moveUp() {
    const s = slides_slide();
    const i = slides_state.selectedEl;
    if (i === null || i >= s.elements.length - 1) return;
    [s.elements[i], s.elements[i+1]] = [s.elements[i+1], s.elements[i]];
    slides_state.selectedEl = i + 1;
    slides_render();
}

function slides_moveDown() {
    const s = slides_slide();
    const i = slides_state.selectedEl;
    if (i === null || i <= 0) return;
    [s.elements[i], s.elements[i-1]] = [s.elements[i-1], s.elements[i]];
    slides_state.selectedEl = i - 1;
    slides_render();
}

function slides_onKeyDown(e) {
    const win = document.getElementById(SLIDES_WINDOW_ID);
    if (!win || win.classList.contains('hidden')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
        slides_deleteEl();
        e.preventDefault();
    }
    if (!slides_el()) {
        if (e.key === 'ArrowRight' && slides_state.currentSlide < slides_state.slides.length - 1) {
            slides_state.currentSlide++;
            slides_state.selectedEl = null;
            slides_render(); slides_updateProps();
        }
        if (e.key === 'ArrowLeft' && slides_state.currentSlide > 0) {
            slides_state.currentSlide--;
            slides_state.selectedEl = null;
            slides_render(); slides_updateProps();
        }
    }
    const el = slides_el();
    if (el) {
        let moved = false;
        if (e.key === 'ArrowUp')    { el.y -= 2; moved = true; }
        if (e.key === 'ArrowDown')  { el.y += 2; moved = true; }
        if (e.key === 'ArrowLeft')  { el.x -= 2; moved = true; }
        if (e.key === 'ArrowRight') { el.x += 2; moved = true; }
        if (moved) { slides_render(false); e.preventDefault(); }
    }
}

function NPSSaveCurrent() {
    sysExecApp('files');

    (async () => {
        await waitUntil(() => typeof filesOpenSaveDialog === 'function');
        filesOpenSaveDialog();

        await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === true);
        await waitUntil(() => SysVar.pointerFilesSaveDialogOpen === false);
                
        if (SysVar.pointerFilesSaveDialogSaveYN) {
            const filename = SysVar.pointerFilesSaveDialogFilename.trim();

            if (!filename) {
                showAlertBox('⚠️ Advertencia!', 'Ingresa un nombre para el archivo!');
                return;
            }

            const finalFilename = filename.includes('.qsld') ? filename : filename + '.qsld';
            const content = JSON.stringify(slides_state.slides);
            let success = false;
            if (window.fs.fileExistInPath(finalFilename, window.fs.getCurrentDirectory())) {
                success = window.fs.modifyFile(finalFilename, content);
            } else {
                success = window.fs.createFile(finalFilename, content);
            }
                    

            if (success) {
                console.log(`Document saved as: ${finalFilename}`);
                        
            } else {
                console.error('Cannot save document');
                showAlertBox('❌ Error', 'Error al guardar el documento: Ya existe un archivo con el mismo nombre o no se pudo generar');
            }
                    
        }
        
        SysVar.pointerFilesSaveDialogSaveYN = false;
    })();
}

window.nyxpawslidesSetContent = function(jsonString) {
    if (!AppManager.loadedApps.has('nyxpawslides')) {
        AppManager.loadApp('nyxpawslides').then(() => {
            setTimeout(() => {
                slides_state.slides = JSON.parse(jsonString);
                slides_state.currentSlide = 0;
                slides_state.selectedEl = null;
                slides_render();
                slides_updateProps();
            },70);
        });
        return;
    }
    try {
        slides_state.slides = JSON.parse(jsonString);
    } catch {
        slides_state.slides = jsonString;
    }
    slides_state.currentSlide = 0;
    slides_state.selectedEl = null;
    slides_render();
    slides_updateProps();
}

function init_nyxpawslides() {
    console.log('Initiating nyxpawslides...');

    slides_state.slides = [{ bg: '#ffffff', elements: [] }];
    slides_state.currentSlide = 0;
    slides_state.selectedEl = null;
    slides_state.tool = 'select';

    const cv = document.getElementById('slides-canvas');
    if (!cv) return;

    cv.width  = slides_state.CW;
    cv.height = slides_state.CH;
    cv.style.cursor = 'default';

    const area = document.querySelector('.slides-canvas-area');
    if (area) {
        if (slides_state._resizeObserver) slides_state._resizeObserver.disconnect();
        slides_state._resizeObserver = new ResizeObserver(() => {
            slides_resizeCanvas();
        });
        slides_state._resizeObserver.observe(area);
    }

    slides_resizeCanvas();

    cv.addEventListener('mousedown', slides_onMouseDown);
    cv.addEventListener('mousemove', slides_onMouseMove);
    cv.addEventListener('mouseup',   slides_onMouseUp);
    cv.addEventListener('dblclick',  slides_onDblClick);
    document.addEventListener('mouseup', slides_onMouseUp);
    document.addEventListener('keydown', slides_onKeyDown);

    document.querySelectorAll('.slides-tool-btn').forEach(btn => {
        btn.addEventListener('click', () => slides_setTool(btn.dataset.tool));
    });
    document.getElementById('slides-btn-add-slide')?.addEventListener('click', slides_addSlide);
    document.getElementById('slides-btn-del-slide')?.addEventListener('click', slides_delSlide);
    document.getElementById('slides-btn-del-el')?.addEventListener('click', slides_deleteEl);
    document.getElementById('slides-btn-up')?.addEventListener('click', slides_moveUp);
    document.getElementById('slides-btn-down')?.addEventListener('click', slides_moveDown);

    slides_render();
    slides_updateProps();
}

function cleanup_nyxpawslides() {
    console.log('Cleaning nyxpawslides...');
    if (slides_state._resizeObserver) {
        slides_state._resizeObserver.disconnect();
        slides_state._resizeObserver = null;
    }
    document.removeEventListener('keydown', slides_onKeyDown);
    document.removeEventListener('mouseup', slides_onMouseUp);
    const cv = document.getElementById('slides-canvas');
    if (cv) {
        cv.removeEventListener('mousedown', slides_onMouseDown);
        cv.removeEventListener('mousemove', slides_onMouseMove);
        cv.removeEventListener('mouseup',   slides_onMouseUp);
        cv.removeEventListener('dblclick',  slides_onDblClick);
    }
}

window.scriptReady('nyxpawslides');
// template version 3.1