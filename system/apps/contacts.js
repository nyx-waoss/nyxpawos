console.log('Current: apps/contacts.js');
window.AppMetadata = window.AppMetadata || {};
window.AppMetadata.contacts = {
    displayName: 'Contactos',
    icon: 'assets/apps/contacts.png',
    version: '1.0.0',
    author: 'Nyx_Waoss'
};

//Codigo aqui:
let _contacts_sidebarHandler = null;
let _contacts_sidebarEl = null;

window.SysVar = window.SysVar || {};
function render_contacts() {
    const contacts_list = document.getElementById('contacts_sidebar');
    contacts_list.innerHTML = '';
    SysVar.contacts_contacts.forEach(contact_object => {
        const contact_item = document.createElement('div');
        contact_item.innerHTML = `<img alt="Contact" src="${contact_object.photo}"><span>${contact_object.name}</span>`;
        contact_item.className = 'contacts_sidebar_item';
        contact_item.dataset.contact = JSON.stringify(contact_object);
        contacts_list.appendChild(contact_item);
    });

    /*contacts_list.addEventListener('contextmenu',(e)=>{
        e.preventDefault();
        const item = e.target.closest('.contacts_sidebar_item');
        if (!item) return;
        const contact_object = JSON.parse(item.dataset.contact);


    });*/
}

function contacts_generateId() {
    const ids = SysVar.contacts_contacts.map(c => Number(c.id));
    const maxId = ids.length > 0 ? Math.max(...ids) : -1;
    return String(maxId + 1).padStart(4, "0");
}
function contacts_idExists(id) {
    return SysVar.contacts_contacts.some(c => c.id === id);
}
function contacts_newContact(name="Contact", photo='assets/gf_icons/contact.png', phone='', email='', description='') {
    let contact_id;
    do {
        contact_id = contacts_generateId();
    } while (contacts_idExists(contact_id));

    SysVar.contacts_contacts.push({
        photo:photo,
        name:name,
        phone:phone,
        email:email,
        description:description,
        id:contact_id
    });
}

function contacts_openNewDialog() {
    document.getElementById('contacts_newcontact_name').value = '';
    document.getElementById('contacts_newcontact_phone').value = '';
    document.getElementById('contacts_newcontact_email').value = '';
    document.getElementById('contacts_newcontact_notes').value = '';

    document.getElementById('contacts_newcontact').style.display = 'flex';
    document.getElementById('contacts_fullinfo').style.display = 'none';
}
function contacts_createFromDialog() {
    const contacts_new_name = document.getElementById('contacts_newcontact_name').value;
    const contacts_new_phone = document.getElementById('contacts_newcontact_phone').value;
    const contacts_new_email = document.getElementById('contacts_newcontact_email').value;
    const contacts_new_description = document.getElementById('contacts_newcontact_notes').value;
    contacts_newContact(contacts_new_name, undefined, contacts_new_phone, contacts_new_email, contacts_new_description);
    contacts_cancelCreation();
    render_contacts();
}
function contacts_cancelCreation() {
    document.getElementById('contacts_newcontact').style.display = 'none';
    document.getElementById('contacts_fullinfo').style.display = 'flex';
}

function contacts_handleSidebarClick(e) {
    const item = e.target.closest('.contacts_sidebar_item');
    if (!item) return;

    document.querySelectorAll('.contacts_sidebar_item').forEach(el => {
        el.classList.remove('ct_selected');
    });
    item.classList.add('ct_selected');

    const contact_object = JSON.parse(item.dataset.contact);

    document.getElementById('contacts_fullinfo_photo').src = contact_object.photo;
    document.getElementById('contacts_fullinfo_name').textContent = contact_object.name;
    document.getElementById('contacts_deletecontc').onclick = async () => {
        const confirmDeleteContact = await showMsgBox("msgbox_warning",`Quieres eliminar a ${contact_object.name} de tus contactos?`, "Eliminar", "Cancelar",{as_win:true,icon:'⚠️'});
        if (confirmDeleteContact) {
            SysVar.contacts_contacts = SysVar.contacts_contacts.filter(
                contact => contact.id !== contact_object.id
            );
            render_contacts();
            document.getElementById('contacts_fullinfo_photo').src = 'assets/gf_icons/contact.png';
            document.getElementById('contacts_fullinfo_name').textContent = 'Selecciona un contacto';
            document.getElementById('contacts_cntdata').innerHTML = '';
        }
    }

    const contacts_cntdata = document.getElementById('contacts_cntdata');
    contacts_cntdata.innerHTML = '';

    const fields = [
        { key:'phone', icon:'assets/gf_icons/phone.png', label: 'Teléfono'},
        { key:'email', icon:'assets/gf_icons/email.png', label: 'Correo'},
        { key:'description', icon:'assets/gf_icons/description.png', label: 'Descripción'}
    ]

    fields.forEach((field, i)=>{
        if (!contact_object[field.key]) return;

        if (i > 0 && contacts_cntdata.children.length > 0) {
            const divider = document.createElement('div');
            divider.className = 'contacts_cntdata_divider';
            contacts_cntdata.appendChild(divider);
        }

        contacts_cntdata.innerHTML += `
        <div class="contacts_cntdata_item">
            <img alt="${field.label}" src="${field.icon}">
            <div class="contacts_cntdata_item_data">
                <span class="data_title">${field.label}</span>
                <span>${contact_object[field.key]}</span>
            </div>
        </div>
        `;
    });
}









//Codigo arriba ⬆️⬆️

function init_contacts() {
    console.log('Initiating contacts...');
    render_contacts();
    document.getElementById('contacts_fullinfo_photo').src = 'assets/gf_icons/contact.png';
    document.getElementById('contacts_fullinfo_name').textContent = 'Selecciona un contacto';

    _contacts_sidebarEl = document.getElementById('contacts_sidebar');
    _contacts_sidebarHandler = (e) => contacts_handleSidebarClick(e);
    _contacts_sidebarEl.addEventListener('click', _contacts_sidebarHandler);
}

function cleanup_contacts() {
    console.log('Cleaning contacts...');
    document.getElementById('contacts_fullinfo_photo').src = 'assets/gf_icons/contact.png';
    document.getElementById('contacts_fullinfo_name').textContent = 'Selecciona un contacto';

    if (_contacts_sidebarEl && _contacts_sidebarHandler) {
        _contacts_sidebarEl.removeEventListener('click', _contacts_sidebarHandler);
        _contacts_sidebarEl = null;
        _contacts_sidebarHandler = null;
    }
}

window.scriptReady('contacts');
//template version 3.1

//=========================================================
//Uso de requests:

/*const contacts_WINDOW_ID = 'win_contacts'; //CAMBIAR NOMBRE DE VARIABLE!!
function solicitarFullscreen() {
    isFullscreen = !isFullscreen;
    window.parent.postMessage({
        action: 'fullscreen', //<-- puede cambairse
        windowId: WINDOW_ID,
        enable: isFullscreen
    }, '*');
}*/

//puede ser:
// 'fullscreen'
// 'maximize'/'restore'
// launch 
// logout
// kill
// addtoappbar