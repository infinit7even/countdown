/**
 * Nextcloud Countdown Logic
 * Data saved via API (Nextcloud Backend DB)
 * Features: Edit, All Day, Particles and Notifications
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

    const placeholders = [
        "GTA VI Release", "The Last of Us Season 2", "Beyond Good & Evil 2",
        "Hollow Knight: Silksong", "Stranger Things Finale", "Dune: Part Three",
        "New Radiohead Album", "The Witcher 4", "Cyberpunk 2077 Sequel",
        "Elden Ring DLC", "Spider-Man 4 Premiere", "New Kendrick Lamar Album",
        "House of the Dragon S3", "Final Fantasy XVII", "Batman: Part II",
        "New Tool Album", "Red Dead Redemption 3", "Fallout Season 2",
        "Avatar 3 Premiere", "Metroid Prime 4", "Euphoria Season 3",
        "Blade Runner 2099", "BioShock 4", "The Elder Scrolls VI",
        "New Gorillaz Album", "Star Wars: New Jedi Order", "Tron: Ares Premiere",
        "Death Stranding 2", "Doom: The Dark Ages", "Marvel's Wolverine"
    ];

    const completionMessages = [
        "Mission Accomplished", "Victory Royale", "Game Over", "Time's Up!", "The End",
        "Zero Hour", "Completed!", "Level Complete", "Quest Finished", "Finale",
        "Curtain Call", "It's Time!", "Day One", "Welcome to the future", "Destination Reached",
        "Platinum Trophy", "Final Boss Defeated", "Fade to Black", "New Game+", "Winner Winner!",
        "Achievement Unlocked", "K.O.!", "FATALITY", "Wasted", "You Died",
        "Legend Status", "End of an Era", "Launch Sequence Initiated", "Encore!", "To be continued..."
    ];

    // Time visibility management for "All Day"
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
                dateInput.value = currentVal + 'T12:00'; // Default to noon
            }
        }
    });

    // Load Remote Data
    async function loadCountdowns() {
        try {
            const response = await fetch(apiUrl, {
                headers: { 'requesttoken': OC.requestToken }
            });
            if (response.ok) {
                countdowns = await response.json();
                renderCountdowns();
            }
        } catch (e) {
            console.error('Error loading data', e);
        }
    }

    // Save to Database
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
            console.error('Error saving data', e);
        }
    }

    // Send System Notification
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
            console.error('Error sending notification', e);
        }
    }



    // Size Setting

    sizeSlider.addEventListener('input', (e) => {
        const scale = e.target.value;
        grid.style.setProperty('--cd-zoom', scale);
        localStorage.setItem('countdown-scale', scale);
    });


    addBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Create a new Countdown';
        idInput.value = '';
        nameInput.value = '';

        // Random placeholder and backup
        if (typeof placeholders !== 'undefined' && placeholders.length > 0) {
            const index = Math.floor(Math.random() * placeholders.length);
            const randomExample = placeholders[index];
            console.log('--- SETTING RANDOM PLACEHOLDER ---', randomExample);
            nameInput.setAttribute('placeholder', randomExample);
        } else {
            console.warn('--- PLACEHOLDERS ARRAY MISSING ---');
            nameInput.setAttribute('placeholder', "GTA VI Release");
        }

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
            OC.Notification.showTemporary('Please fill in all fields!');
            return;
        }

        let targetDate;
        if (allDayCheckbox.checked) {
            // If all day, set to the end of the selected day (23:59:59)
            targetDate = new Date(dateVal + 'T23:59:59').getTime();
        } else {
            targetDate = new Date(dateVal).getTime();
        }

        const editingId = idInput.value;
        if (editingId) {
            // Existing modification
            const index = countdowns.findIndex(c => c.id == editingId);
            if (index !== -1) {
                const isFuture = targetDate > Date.now();
                countdowns[index] = {
                    ...countdowns[index],
                    name,
                    targetDate,
                    allDay: allDayCheckbox.checked,
                    notified: isFuture ? false : countdowns[index].notified
                };
            }
        } else {
            // New insertion
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
            let msg = "Completed!";
            if (typeof completionMessages !== 'undefined' && completionMessages.length > 0) {
                const numericId = Number(cd.id) || 0;
                msg = completionMessages[numericId % completionMessages.length];
            }
            timerElement.innerHTML = `<div class="completed-box"><div class="completed-text">${msg}</div></div>`;
            if (!cd.notified) { // Celebration fires the first time the expired event is viewed
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
                <div class="time-box"><div class="time-val">${days}</div><div class="time-lbl">Days</div></div>
                <div class="time-box"><div class="time-val">${hours}</div><div class="time-lbl">Hours</div></div>
                <div class="time-box"><div class="time-val">${minutes}</div><div class="time-lbl">Min</div></div>
                <div class="time-box"><div class="time-val">${seconds}</div><div class="time-lbl">Sec</div></div>
            </div>
        `;
    }

    function renderCountdowns() {
        console.log('Rendering countdowns (Count:', countdowns.length, ')');
        intervals.forEach(id => clearInterval(id));
        intervals = [];
        grid.innerHTML = '';

        if (countdowns.length === 0) {
            grid.innerHTML = '<div class="empty-state">You don\'t have any active countdowns.<br>Click above to create a new one.</div>';
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
                if (confirm('Delete this countdown?')) {
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
        modalTitle.textContent = 'Edit Countdown';
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

    // PARTICLE EFFECT (CONFETTI)
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
            if (Date.now() - start < 5000) { // Lasts 5 seconds
                animationId = requestAnimationFrame(loop);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cancelAnimationFrame(animationId);
            }
        }
        loop();
    }

    // Initialize application after all functions and constants are defined
    try {
        console.log("%c--- COUNTDOWN APP INITIALIZED v1.1.12 ---", "color: #3498db; font-size: 20px; font-weight: bold;");
        const savedScale = localStorage.getItem('countdown-scale') || 1;
        sizeSlider.value = savedScale;
        grid.style.setProperty('--cd-zoom', savedScale);
        loadCountdowns();
    } catch (e) {
        console.error('Final initialization error:', e);
    }
});
