console.log("[NyxPawOS] Current: componentsmanager.js");
/*Components Manager... introducido el 25 de marzo del 2026 al sistema. A partir de este archivo todas las apps usan web compontents con light dom*/

class NyxWindow extends HTMLElement {
    connectedCallback() {
        const appName = this.getAttribute('app');
        const title = this.getAttribute('win-title');
        const grabButtons = this.getAttribute('grab-buttons') || '';
        const titleI18n = this.getAttribute('title-i18n');
        const noResize = this.hasAttribute('no-resize');
        const innerContent = this.innerHTML;

        this.id = `win_${appName}`;
        this.classList.add('window', 'hidden');
        if (noResize) this.classList.add('no-resize');
        const i18nAttr = titleI18n ? `data-i18n="${titleI18n}"` : '';

        this.innerHTML = `
            <div class="grab">
                ${grabButtons}
                <span class="grab-title" ${i18nAttr}>${title}</span>
                <button class="grab-btn" id="btn_${appName}">X</button>
            </div>
            <div class="win_content content_${appName}">
                ${innerContent}
            </div>
            ${noResize ? '' : '<div class="resize-handle"></div>'}
        `;
        
        if (!this.dataset.winInitialized) {
            window.initNewWindow?.(this);
            this.dataset.winInitialized = 'true';
        }
    }
}
customElements.define('nyx-window', NyxWindow);

window.scriptReady('componentsmanager');