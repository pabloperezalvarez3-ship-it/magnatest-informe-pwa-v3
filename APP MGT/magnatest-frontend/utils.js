// Fotos (drag & drop para ordenar)
const groupsWrap = document.getElementById('foto-groups');
const tplGroup = document.getElementById('tpl-foto-group');

function enableDnD(card) {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', 'drag');
        card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
}

function bindGallery(gallery) {
    let overCard = null;
    gallery.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = gallery.querySelector('.dragging');
        const cards = [...gallery.querySelectorAll('.photo:not(.dragging)')];
        let nearest = null,
            minDist = 1e9;
        cards.forEach(c => {
            const r = c.getBoundingClientRect();
            const cx = r.left + r.width / 2,
                cy = r.top + r.height / 2;
            const d = (e.clientX - cx) ** 2 + (e.clientY - cy) ** 2;
            if (d < minDist) {
                minDist = d;
                nearest = c;
            }
        });
        cards.forEach(c => c.classList.remove('drag-over'));
        if (nearest) {
            nearest.classList.add('drag-over');
            overCard = nearest;
        }
    });
    gallery.addEventListener('dragleave', () => {
        gallery.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));
    });
    gallery.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragging = gallery.querySelector('.dragging');
        if (!dragging) return;
        if (overCard) {
            gallery.insertBefore(dragging, overCard);
            overCard.classList.remove('drag-over');
            overCard = null;
        } else {
            gallery.appendChild(dragging);
        }
    });
}

function bindGroup(group) {
    const gallery = group.querySelector('.gallery');
    bindGallery(gallery);
    const picker = group.querySelector('.picker');
    group.querySelector('.btnPick').addEventListener('click', () => picker.click());
    const onFiles = (files) => {
        Array.from(files).forEach(file => {
            const r = new FileReader();
            r.onload = e => {
                const card = document.createElement('div');
                card.className = 'photo';
                const img = document.createElement('img');
                img.alt = 'foto';
                img.src = e.target.result;
                card.appendChild(img);
                enableDnD(card);
                gallery.appendChild(card);
            };
            r.readAsDataURL(file);
        });
    };
    picker.addEventListener('change', (ev) => {
        onFiles(ev.target.files);
        ev.target.value = '';
    });
}
// crea un grupo nuevo y lo devuelve
function addFotoGroup(nombre) {
    const g = tplGroup.content.firstElementChild.cloneNode(true);
    groupsWrap.appendChild(g);
    bindGroup(g);
    // opcional: copiar nombre
    if (nombre) {
        const label = g.querySelector('.group-name');
        if (label) label.textContent = nombre;
    }
    return g;
}

// primer grupo al cargar
addFotoGroup();

// máximo de fotos por página/grupo
const MAX_PHOTOS_PER_GROUP = 4; // cámbialo a 6 si quieres 6 fotos por hoja

// decide en qué galería va la próxima foto
function getTargetGallery() {
    let groups = groupsWrap.querySelectorAll('.group');
    if (!groups.length) {
        groups = [addFotoGroup()];
    }

    let last = groups[groups.length - 1];
    let gallery = last.querySelector('.gallery');
    let currentCount = gallery.querySelectorAll('.photo').length;

    if (currentCount >= MAX_PHOTOS_PER_GROUP) {
        // copia el nombre del componente al nuevo grupo

        gallery = last.querySelector('.gallery');
    }
    return gallery;
}

// botón + Fotos sigue creando grupos manuales si tú quieres
document.getElementById('btnAddFotos').addEventListener('click', () => addFotoGroup());

// +Zonas y +Resultados
function addZonaRow() {
    const tbody = document.querySelector('#tabla-zonas tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = '<td contenteditable="true"></td><td contenteditable="true"></td>';
    tbody.appendChild(tr);
}

function addResultadoRow() {
    const tbody = document.querySelector('#tabla-resultados tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = '<td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td>';
    tbody.appendChild(tr);
}
document.getElementById('btnAddZonas').addEventListener('click', addZonaRow);
document.getElementById('btnAddResultados').addEventListener('click', addResultadoRow);

// Guardar / Cargar
const sheet = document.getElementById('sheet');
const btnSave = document.getElementById('btnSave'),
    btnLoad = document.getElementById('btnLoad'),
    fileLoader = document.getElementById('fileLoader');

function getState() {
    return {
        version: 'sections-final-v31',
        saved_at: new Date().toISOString(),
        html: sheet.innerHTML
    };
}

function download(name, text) {
    const blob = new Blob([text], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}

function saveToFile() {
    const s = getState();
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    download('informe_magnatest_' + stamp + '.mgt.json', JSON.stringify(s));
}

function restoreState(s) {
    if (!s || !s.html) return;
    sheet.innerHTML = s.html;
    // rebind galleries for drag & drop
    sheet.querySelectorAll('#sec-fotos .gallery').forEach(bindGallery);
    sheet.querySelectorAll('#sec-fotos .photo').forEach(enableDnD);
    // re-enlazar botones
    document.getElementById('btnAddFotos').addEventListener('click', addFotoGroup);
    document.getElementById('btnAddZonas').addEventListener('click', addZonaRow);
    document.getElementById('btnAddResultados').addEventListener('click', addResultadoRow);
}
btnSave.addEventListener('click', saveToFile);
btnLoad.addEventListener('click', () => fileLoader.click());
fileLoader.addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = e => {
        try {
            restoreState(JSON.parse(e.target.result));
        } catch (err) {
            alert('Archivo inválido');
        }
    };
    r.readAsText(f);
    ev.target.value = '';
});



(function() {
    function qualifyPhotoCard(node) {
        if (!node) return null;
        // base element to decorate is the first ancestor that holds the img
        var card = node.closest('.mgt-photo, .mgt-photo-card, .photo-card, .photo, .gallery-item, .evidence-photo, .evidence .item, figure');
        if (!card) card = node.parentElement;
        if (!card) return null;
        card.classList.add('mgt-photo-card');
        if (!card.querySelector('.mgt-remove')) {
            var b = document.createElement('button');
            b.className = 'mgt-remove';
            b.textContent = '🗑';
            b.title = 'Eliminar';
            card.appendChild(b);
        }
        return card;
    }

    function decorateAll() {
        document.querySelectorAll('img').forEach(function(img) {
            // solo evidencias: ignora el logo y otros iconos
            var src = img.getAttribute('src') || '';
            if (/logo|icon|magnatest|mgt/i.test(src)) return;
            qualifyPhotoCard(img);
        });
    }
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.mgt-remove');
        if (!btn) return;
        var card = btn.closest('.mgt-photo-card');
        if (!card) return;
        // intenta identificar sección/ID si existen
        var section = card.closest('[data-section-id]');
        var img = card.querySelector('img');
        var src = img ? img.currentSrc || img.src : '';
        card.remove();
        try {
            var st = (window.MGT_STATE = JSON.parse(localStorage.getItem('mgt_state') || '{}'));
            // Limpieza aproximada: elimina por src
            if (st.photosBySection) {
                Object.keys(st.photosBySection).forEach(function(k) {
                    st.photosBySection[k] = (st.photosBySection[k] || []).filter(function(p) {
                        return (p && p.src) ? p.src !== src : true;
                    });
                });
            }
            localStorage.setItem('mgt_state', JSON.stringify(st));
        } catch (err) {
            console.warn('No se pudo sincronizar la eliminación en storage:', err);
        }
    });
    // Bootstrap + observar cambios (cuando se agregan fotos nuevas)
    document.addEventListener('DOMContentLoaded', function() {
        decorateAll();
        var mo = new MutationObserver(function(muts) {
            muts.forEach(function(m) {
                m.addedNodes && m.addedNodes.forEach(function(n) {
                    if (n.nodeType === 1) {
                        if (n.matches('img')) qualifyPhotoCard(n);
                        n.querySelectorAll && n.querySelectorAll('img').forEach(qualifyPhotoCard);
                    }
                });
            });
        });
        mo.observe(document.body, {
            childList: true,
            subtree: true
        });
        window.mgtRefreshPhotoButtons = decorateAll;
    });
})();



// === Numeración automática (localStorage) ===
(function() {
    const key = "mgt_report_seq";
    const node = document.getElementById("report-no");
    const pad = n => String(n).padStart(3, "0");
    const render = (n) => {
        if (node) node.textContent = "n° " + pad(n);
    };
    const getSeq = () => {
        const raw = Number(localStorage.getItem(key));
        return Number.isFinite(raw) && raw > 0 ? raw : 1;
    };
    const bump = () => {
        let n = getSeq() + 1;
        localStorage.setItem(key, String(n));
        return n;
    };
    // pinta el número actual al cargar
    render(getSeq());
    // después de imprimir (cuando cierras el diálogo), aumenta correlativo
    window.addEventListener("afterprint", () => render(bump()));
    // al Guardar, también aumenta correlativo
    const btnSave = document.getElementById("btnSave");
    if (btnSave) btnSave.addEventListener("click", () => {
        render(bump());
    });
})();

// === Registrar Service Worker para modo offline ===
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("./sw.js")
            .then(reg => console.log("SW registrado:", reg.scope))
            .catch(err => console.warn("SW error:", err));
    });
}