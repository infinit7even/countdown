/**
 * Nextcloud Countdown Logic
 * Dati salvati tramite API (Nextcloud Backend DB)
 * Funzioni: Modifica, Tutto il giorno, Particelle e Notifiche
 */
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('countdown-modal');
    const modalTitle = document.getElementById('modal-title');
    const addBtn = document.getElementById('add-countdown-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const grid = document.getElementById('countdown-grid');
    
    const idInput = document.getElementById('cd-id');
    const nameInput = document.getElementById('cd-name');
    const dateInput = document.getElementById('cd-date');
    const allDayCheckbox = document.getElementById('cd-allday');
    const dateGroup = document.getElementById('date-group');
    const sizeSlider = document.getElementById('size-slider');

    let countdowns = [];
    let intervals = [];
    
    const apiUrl = OC.generateUrl('/apps/countdown/api/countdowns');
    const notifyUrl = OC.generateUrl('/apps/countdown/api/notify');

    // Gestione visibilità orario per "Tutto il giorno"
    allDayCheckbox.addEventListener('change', () => {
        const currentVal = dateInput.value;
        if (allDayCheckbox.checked) {
            dateInput.type = 'date';
            if (currentVal && currentVal.includes('T')) {
                dateInput.value = currentVal.split('T')[0];
            }
        } else {
            dateInput.type = 'datetime-local';
            if (currentVal && !currentVal.includes('T')) {
                dateInput.value = currentVal + 'T12:00'; // Default a mezzogiorno
            }
        }
    });

    // Caricamento Dati Remoti
    async function loadCountdowns() {
        try {
            const response = await fetch(apiUrl, {
                headers: { 'requesttoken': OC.requestToken }
            });
            if(response.ok) {
                countdowns = await response.json();
                renderCountdowns();
            }
        } catch (e) {
            console.error('Errore nel caricamento', e);
        }
    }

    // Salvataggio nel Database
    async function saveCountdowns() {
        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'requesttoken': OC.requestToken
                },
                body: JSON.stringify({ countdowns: countdowns })
            });
        } catch (e) {
            console.error('Errore di salvataggio', e);
        }
    }

    // Invio Notifica di Sistema
    async function triggerNotification(name) {
        try {
            await fetch(notifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'requesttoken': OC.requestToken
                },
                body: JSON.stringify({ name: name })
            });
        } catch (e) {
            console.error('Errore invio notifica', e);
        }
    }

    loadCountdowns();

    // Impostazione Grandezza
    const savedScale = localStorage.getItem('countdown-scale') || 1;
    sizeSlider.value = savedScale;
    grid.style.setProperty('--cd-zoom', savedScale);

    sizeSlider.addEventListener('input', (e) => {
        const scale = e.target.value;
        grid.style.setProperty('--cd-zoom', scale);
        localStorage.setItem('countdown-scale', scale);
    });

    addBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Crea un nuovo Countdown';
        idInput.value = '';
        nameInput.value = '';
        dateInput.value = '';
        dateInput.type = 'datetime-local';
        allDayCheckbox.checked = false;
        modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    saveBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const dateVal = dateInput.value;
        if (!name || !dateVal) {
            OC.Notification.showTemporary('Compila tutti i campi!');
            return;
        }

        let targetDate;
        if (allDayCheckbox.checked) {
            // Se tutto il giorno, impostiamo alla fine della giornata selezionata (23:59:59)
            targetDate = new Date(dateVal + 'T23:59:59').getTime();
        } else {
            targetDate = new Date(dateVal).getTime();
        }
        
        const editingId = idInput.value;
        if (editingId) {
            // Modifica esistente
            const index = countdowns.findIndex(c => c.id == editingId);
            if (index !== -1) {
                countdowns[index] = { ...countdowns[index], name, targetDate, allDay: allDayCheckbox.checked };
            }
        } else {
            // Nuovo inserimento
            countdowns.push({
                id: Date.now(),
                name: name,
                targetDate: targetDate,
                allDay: allDayCheckbox.checked,
                notified: false
            });
        }
        
        modal.classList.add('hidden');
        renderCountdowns();
        await saveCountdowns();
    });

    function updateTimeLeft(cd, timerElement, cardElement) {
        const now = new Date().getTime();
        const distance = cd.targetDate - now;

        if (distance <= 0) {
            timerElement.innerHTML = '<div class="completed-box"><div class="completed-text">Completato!</div></div>';
            if (!cd.notified && distance > -5000) { // Notifica e particelle solo se appena scaduto (entro 5 sec)
                cd.notified = true;
                triggerNotification(cd.name);
                launchConfetti();
                saveCountdowns();
            }
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerElement.innerHTML = `
            <div class="cd-timer">
                <div class="time-box"><div class="time-val">${days}</div><div class="time-lbl">Giorni</div></div>
                <div class="time-box"><div class="time-val">${hours}</div><div class="time-lbl">Ore</div></div>
                <div class="time-box"><div class="time-val">${minutes}</div><div class="time-lbl">Min</div></div>
                <div class="time-box"><div class="time-val">${seconds}</div><div class="time-lbl">Sec</div></div>
            </div>
        `;
    }

    function renderCountdowns() {
        intervals.forEach(id => clearInterval(id));
        intervals = [];
        grid.innerHTML = '';
        
        if(countdowns.length === 0) {
            grid.innerHTML = '<div class="empty-state">Non hai nessun countdown attivo.<br>Clicca in alto per crearne uno nuovo.</div>';
            return;
        }

        countdowns.sort((a,b) => a.targetDate - b.targetDate).forEach(cd => {
            const card = document.createElement('div');
            card.className = 'countdown-card';
            
            const titleRow = document.createElement('div');
            titleRow.className = 'cd-name';
            titleRow.innerHTML = `<span>${cd.name}</span>`;
            
            const actions = document.createElement('div');
            actions.className = 'cd-actions';
            
            const editBtn = document.createElement('span');
            editBtn.className = 'cd-edit icon-edit';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                openEditModal(cd);
            };
            
            const delBtn = document.createElement('span');
            delBtn.className = 'cd-delete icon-delete';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if(confirm('Eliminare questo countdown?')) {
                    countdowns = countdowns.filter(item => item.id !== cd.id);
                    renderCountdowns(); 
                    saveCountdowns();
                }
            };

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            titleRow.appendChild(actions);

            const timerCont = document.createElement('div');
            card.appendChild(titleRow);
            card.appendChild(timerCont);
            grid.appendChild(card);

            updateTimeLeft(cd, timerCont, card);
            const intId = setInterval(() => updateTimeLeft(cd, timerCont, card), 1000);
            intervals.push(intId);
        });
    }

    function openEditModal(cd) {
        modalTitle.textContent = 'Modifica Countdown';
        idInput.value = cd.id;
        nameInput.value = cd.name;
        
        const date = new Date(cd.targetDate);
        allDayCheckbox.checked = !!cd.allDay;
        
        if (cd.allDay) {
            dateInput.type = 'date';
            dateInput.value = date.toISOString().split('T')[0];
        } else {
            dateInput.type = 'datetime-local';
            // Format for datetime-local: YYYY-MM-DDTHH:mm
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            const localISOTime = (new Date(cd.targetDate - tzoffset)).toISOString().slice(0, 16);
            dateInput.value = localISOTime;
        }
        
        modal.classList.remove('hidden');
    }

    // EFFETTO PARTICELLE (CONFETTI)
    function launchConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#ffffff'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * 150,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 10,
                tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }

        let animationId;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.d);
                p.tilt = Math.sin(p.tiltAngle) * 15;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
                ctx.stroke();

                if (p.y > canvas.height) {
                    particles[i] = { ...p, x: Math.random() * canvas.width, y: -20, tiltAngle: 0 };
                }
            });
        }

        let start = Date.now();
        function loop() {
            draw();
            if (Date.now() - start < 5000) { // Dura 5 secondi
                animationId = requestAnimationFrame(loop);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cancelAnimationFrame(animationId);
            }
        }
        loop();
    }
});
