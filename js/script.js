/**
 * Nextcloud Countdown Logic
 * Data saved via API (Nextcloud Backend DB)
 * Features: Edit, All Day, Particles and Notifications
 */

const NEWS_ARTICLES = [
    {
        title: "The News Gazette",
        content: "We've added this News Center so you can keep up with what's new in Countdown — right from inside the app. Check back here for every major update."
    },
    {
        title: "Custom Completion Messages",
        content: "When a countdown hits zero, you now choose what it says. Pick the classic default, a random surprise from our curated list, or write your own personal message."
    },
    {
        title: "Collapsible Settings Panel",
        content: "The settings panel can now be hidden on both mobile and desktop, keeping your workspace clean when you don't need it."
    },
    {
        title: "Three Layout Views",
        content: "Switch between Expanded (stacked cards), Grid (side-by-side) and the original compact view to display your countdowns exactly how you want them."
    },
    {
        title: "Emoji Picker",
        content: "Each countdown can now have its own emoji icon. A full categorized picker lets you browse hundreds of emojis — faces, animals, food, travel, and more — right from the creation form."
    },
    {
        title: "Smart Sorting",
        content: "Sort your countdowns by date, name, or newest first. A directional toggle lets you flip between ascending and descending order, with your preference remembered across sessions."
    },
    {
        title: "Recurrent Countdowns",
        content: "Set a countdown to automatically restart after it expires. Choose daily, weekly, monthly, yearly, or a custom interval in days — perfect for recurring events."
    },
    {
        title: "System Notifications",
        content: "When a countdown reaches zero, a Nextcloud system notification is triggered. You'll be alerted even if you're not looking at the app."
    },
    {
        title: "Interactive Toast Notifications",
        content: "In-app notifications now appear as sleek, dismissible toasts. Click anywhere on the toast or hit the × button to close them instantly."
    },
    {
        title: "Confetti Celebrations",
        content: "Every time you save a countdown or one expires, a confetti burst lights up the screen. Clicking the app title also triggers it — and hides a 1000-click Easter Egg challenge."
    },
    {
        title: "Countdown Description Field",
        content: "Add optional notes or context to any countdown via the description field. View them at a glance in the Details panel."
    },
    {
        title: "PWA Install Support",
        content: "Install Countdown as a Progressive Web App directly from the settings panel. Get it on your home screen for quick access without opening a browser."
    },
    {
        title: "ESC Key & Click-Outside to Close",
        content: "All modals and panels now close when you press ESC or click outside them — no need to hunt for a close button."
    },
    {
        title: "Keyboard Accessibility",
        content: "Every action button (edit, delete, info) is fully keyboard-navigable. High-visibility neon focus highlights make it easy to know where you are on the page."
    },
    {
        title: "Dashboard Widget",
        content: "Countdown integrates with the Nextcloud Dashboard. A compact widget shows your upcoming events at a glance from the home screen."
    },
    {
        title: "Theme-Aware Design",
        content: "The entire app adapts seamlessly to Nextcloud's light, dark, and high-contrast accessibility themes — including notifications, icons, and card colours."
    },
    {
        title: "Mobile-First Responsive Layout",
        content: "From the collapsible header to the adaptive grid and resized modals, every element has been refined for a smooth experience on phones and tablets."
    }
];

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
    const dateGroup = document.getElementById('date-group');
    const sizeSlider = document.getElementById('size-slider');
    const sortOpts = document.querySelectorAll('.sort-opt');
    const layoutOpts = document.querySelectorAll('.layout-opt');
    const directionBtn = document.getElementById('sort-direction-btn');
    const descriptionInput = document.getElementById('cd-description');
    const emojiTrigger = document.getElementById('emoji-trigger');
    const emojiPicker = document.getElementById('hud-emoji-picker');
    const emojiGrid = document.getElementById('emoji-grid');
    const catBtns = document.querySelectorAll('.cat-btn');

    const infoModal = document.getElementById('info-modal');
    const infoCreated = document.getElementById('info-created');
    const infoDescription = document.getElementById('info-description');
    const infoRepeat = document.getElementById('info-repeat');
    const closeInfoBtn = document.getElementById('close-info-btn');
    const reviewBtn = document.querySelector('.review-btn');

    const repeatToggle = document.getElementById('cd-repeat-toggle');
    const repeatOptions = document.getElementById('repeat-options');
    const repeatType = document.getElementById('cd-repeat-type');
    const customRepeatGroup = document.getElementById('custom-repeat-group');
    const customRepeatValue = document.getElementById('cd-repeat-value');
    const pwaRow = document.getElementById('pwa-install-row');
    const pwaBtn = document.getElementById('pwa-install-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsToggle = document.getElementById('settings-toggle');
    const msgOpts = document.querySelectorAll('.msg-opt');
    const customMsgInput = document.getElementById('custom-completion-input');
    const newsModal = document.getElementById('news-modal');
    const newsBtn = document.getElementById('news-btn');
    const closeNewsBtn = document.getElementById('close-news-btn');
    const newsArticlesContainer = document.getElementById('news-articles');

    let countdowns = [];
    let intervals = [];
    let deferredPrompt;

    const apiUrl = OC.generateUrl('/apps/countdown/api/countdowns');
    const notifyUrl = OC.generateUrl('/apps/countdown/api/notify');
    const notificationContainer = document.getElementById('countdown-notification-container');

    /**
     * Show a custom interactive notification toast
     * @param {string} message 
     * @param {number} duration 
     */
    function showAppNotification(message, duration = 5000) {
        if (!notificationContainer) return;

        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        
        const content = document.createElement('div');
        content.className = 'notif-content';
        content.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notif-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.ariaLabel = 'Close notification';

        toast.appendChild(content);
        toast.appendChild(closeBtn);
        notificationContainer.appendChild(toast);

        const dismiss = () => {
            if (toast.classList.contains('hide')) return;
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        };

        toast.onclick = dismiss;
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            dismiss();
        };

        if (duration > 0) {
            setTimeout(dismiss, duration);
        }
    }

    // Confetti State
    let confettiParticles = [];
    let isConfettiRunning = false;
    const confettiColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#ffffff'];

    const EMOJI_DATA = {
      faces: [
        "😀","😃","😄","😁","😆","😅","😂","🤣","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚","😙",
        "😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥",
        "😌","😔","😪","🤤","😴","🫩","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","😵‍💫","🤯",
        "🤠","🥳","🥸","😎","🤓","🧐",
        "😕","🫤","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","🫢","🫣","🫡","😭","😱",
        "😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬",
        "😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","🤖",
        "🙂‍↔️","🙂‍↕️"
      ],
  
      people: [
        "👶","🧒","👦","👧","🧑","👨","👩","🧓","👴","👵",
        "🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇",
        "🤦","🤷","🫅","👮","🕵️","💂","👷","🤴","👸",
        "👳","👲","🧕","🤵","👰","🫄","🤰","🤱",
        "👼","🎅","🤶","🦸","🦹","🧙","🧚","🧛","🧜","🧝",
        "💆","💇","🚶","🚶‍➡️","🏃","🏃‍➡️","🧎","🧎‍➡️","💃","🕺","🧍","🧎",
        "🧑‍🦯","🧑‍🦯‍➡️","🧑‍🦼","🧑‍🦼‍➡️","🧑‍🦽","🧑‍🦽‍➡️",
        "👯","🧖","🧗","🤺","🏇","⛷️","🏂","🏌️","🏄","🚣","🏊","⛹️","🏋️","🚴","🚵",
        "🤸","🤼","🤽","🤾","🤹",
        "🛀","🛌",
        "👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙",
        "👈","👉","👆","🖕","👇","☝️",
        "👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🙏",
        "💅","🤳",
        "💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁",
        "🦷","🦴","👀","👁️","👅","👄",
        "🧑‍🧑‍🧒","🧑‍🧒","🧑‍🧒‍🧒","🧑‍🧑‍🧒‍🧒"
      ],
  
      animals: [
        "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐽","🐸",
        "🐵","🙈","🙉","🙊",
        "🐔","🐧","🐦","🐦‍🔥","🐤","🐣","🐥","🦆","🦅","🦉",
        "🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜",
        "🪲","🪳","🕷️","🕸️",
        "🐢","🐍","🦎","🦂",
        "🦀","🦞","🦐","🦑","🐙",
        "🐠","🐟","🐡","🦈",
        "🐬","🐳","🐋",
        "🐊","🐆","🐅","🦓","🦍","🦧","🐘","🦛","🦏",
        "🐪","🐫","🦒","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐",
        "🦌","🫎","🫏","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛",
        "🪶","🐓","🦃","🦚","🦜",
        "🦢","🦩","🕊️",
        "🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️",
        "🦔"
      ],
  
      food: [
        "🍏","🍎","🍐","🍊","🍋","🍋‍🟩","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝",
        "🍅","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠",
        "🍄","🍄‍🟫",
        "🥐","🥖","🍞","🥨","🥯","🥞","🧇",
        "🧀","🍖","🍗","🥩","🥓",
        "🍔","🍟","🍕","🌭","🥪","🌮","🌯","🫔","🥙","🧆",
        "🥚","🍳","🥘","🍲","🫕","🥣","🥗","🍿","🧈","🧂",
        "🍱","🍘","🍙","🍚","🍛","🍜","🍝","🍢","🍣","🍤","🍥",
        "🥮","🍡","🥟","🥠","🥡",
        "🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯",
        "🍼","🥛","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉"
      ],
  
      activities: [
        "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱",
        "🪀","🏓","🏸","🏒","🏑","🥍","🏏",
        "🪃","🥅","⛳","🪁","🏹","🎣",
        "🤿","🥊","🥋","🎽","🛹","🛼",
        "🎿","⛸️","🥌",
        "🎯","🪄","🎮","🕹️","🎲","🧩","♟️",
        "🎭","🎨","🧵","🪡","🧶"
      ],
  
      travel: [
        "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜",
        "🏍️","🛵","🚲","🛴",
        "🚨","🚔","🚍","🚘",
        "✈️","🛫","🛬","🪂","💺",
        "🚀","🛸",
        "🚁",
        "🚢","⛴️","🛥️","🚤","🛶",
        "🚂","🚆","🚇","🚊","🚝","🚞","🚋",
        "🚉","🚏",
        "🗺️","🧭","🏔️","⛰️","🌋","🗻",
        "🏕️","🏖️","🏜️","🏝️",
        "🏟️","🏛️","🏗️","🧱",
        "🪨","🪵",
        "🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭",
        "⛪","🕌","🛕","🕍","⛩️",
        "⛲","⛺","🌁","🌃","🌄","🌅","🌆","🌇","🌉","♨️",
        "🎠","🎡","🎢",
        "🎪"
      ],
  
      objects: [
        "⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","🖲️","💽","💾","💿","📀",
        "📷","📸","📹","🎥",
        "📞","☎️","📟","📠",
        "📺","📻",
        "⏰","⏱️","⏲️","🕰️",
        "🔋","🔌","💡","🔦","🕯️",
        "🧯","🛢️","💸",
        "💵","💴","💶","💷","🪙",
        "💳","💰","💎",
        "⚖️","🪜","🧰","🪛","🔧","🔨","⚒️","🛠️","⛏️","🪚",
        "🔩","⚙️","🪤",
        "🧱","⛓️","⛓️‍💥",
        "🔫","💣","🧨",
        "🪓","🔪","🗡️","⚔️","🛡️",
        "🚬","⚰️","🪦",
        "⚱️","🏺",
        "🔮","📿","🧿",
        "💈","⚗️","🔭","🔬",
        "🧪","🧫","🧬"
      ],
  
      symbols: [
        "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
        "❣️","💕","💞","💓","💗","💖","💘","💝",
        "💟","☮️","✝️","☪️","🕉️","☸️",
        "🔯","🕎","☯️",
        "☢️","☣️",
        "🆔","⚠️","🚸","⛔","🚫","❌","⭕",
        "✅","☑️","✔️",
        "❗","❓","‼️","⁉️",
        "🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪",
        "⬆️","⬇️","⬅️","➡️",
        "♾️"
      ],
  
      flags: [
        "🏳️","🏴","🏁","🚩","🏳️‍🌈","🏳️‍⚧️"
      ]
    };

    const placeholders = [
        "Spider-Man 4 Premiere", "Elder Scrolls VI", "New Daft Punk Album",
        "Stranger Things Season 5", "Batman: Part II", "BioShock 4",
        "Gorillaz New Tour", "The Last of Us Season 3", "Avatar 3 Release",
        "Metal Gear Solid Delta", "Radiohead New Album", "Black Mirror Season 7",
        "Joker: Folie à Deux", "Final Fantasy XVII", "Tool New Single",
        "Euphoria Season 3", "Superman: Legacy", "Hollow Knight: Silksong",
        "Kendrick Lamar Album", "House of the Dragon S3"
    ];

    const completionMessages = [
        "Mission Accomplished", "Victory Royale", "Game Over", "Time's Up!", "The End",
        "Zero Hour", "Completed!", "Level Complete", "Quest Finished", "Finale",
        "Curtain Call", "It's Time!", "Day One", "Welcome to the future", "Destination Reached",
        "Platinum Trophy", "Final Boss Defeated", "Fade to Black", "New Game+", "Winner Winner!",
        "Achievement Unlocked", "K.O.!", "FATALITY", "Wasted", "You Died",
        "Legend Status", "End of an Era", "Launch Sequence Initiated", "Encore!", "To be continued..."
    ];

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

    sortOpts.forEach(btn => {
        btn.addEventListener('click', () => {
            sortOpts.forEach(o => o.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('countdown-sort', btn.dataset.sort);
            renderCountdowns();
        });
    });

    directionBtn.addEventListener('click', () => {
        directionBtn.classList.toggle('desc');
        localStorage.setItem('countdown-dir', directionBtn.classList.contains('desc') ? 'desc' : 'asc');
        renderCountdowns();
    });

    // Emoji Picker Logic
    function renderEmojiCategory(category) {
        emojiGrid.innerHTML = '';
        const emojis = EMOJI_DATA[category] || [];
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-item';
            btn.textContent = emoji;
            btn.type = 'button';
            btn.onclick = () => {
                emojiTrigger.textContent = emoji;
                emojiPicker.classList.add('hidden');
            };
            emojiGrid.appendChild(btn);
        });
    }

    // InsertEmoji function is retired since we no longer inject into the input directly.


    emojiTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('hidden');
        if (!emojiPicker.classList.contains('hidden')) {
            renderEmojiCategory('faces');
        }
    });

    catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderEmojiCategory(btn.dataset.cat);
        });
    });

    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiTrigger) {
            emojiPicker.classList.add('hidden');
        }
    });

    repeatToggle.addEventListener('change', () => {
        repeatOptions.classList.toggle('hidden', !repeatToggle.checked);
    });

    repeatType.addEventListener('change', () => {
        customRepeatGroup.classList.toggle('hidden', repeatType.value !== 'custom');
    });


    addBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Create a new Countdown';
        idInput.value = '';
        nameInput.value = '';
        
        // Random default emoji generator
        const emojis = ["😀", "🎮", "💡", "✨", "🚀", "🎉", "🔥", "🎧", "🎬", "📅", "🎁", "✈️", "🍕", "🏆"];
        emojiTrigger.textContent = emojis[Math.floor(Math.random() * emojis.length)];

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
        descriptionInput.value = '';
        repeatToggle.checked = false;
        repeatOptions.classList.add('hidden');
        repeatType.value = 'daily';
        customRepeatGroup.classList.add('hidden');
        customRepeatValue.value = '1';
        modal.classList.remove('hidden');
    });

    function closeAllModals() {
        modal.classList.add('hidden');
        infoModal.classList.add('hidden');
        emojiPicker.classList.add('hidden');
        if (newsModal) newsModal.classList.add('hidden');
    }

    // Global ESC key listener to close everything
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
            
            // Also close settings if open (mobile)
            if (settingsPanel && !settingsPanel.classList.contains('collapsed')) {
                settingsPanel.classList.add('collapsed');
                localStorage.setItem('settings-collapsed', 'true');
            }
        }
    });

    cancelBtn.addEventListener('click', closeAllModals);
    closeInfoBtn.addEventListener('click', closeAllModals);
    if (closeNewsBtn) closeNewsBtn.addEventListener('click', closeAllModals);

    // Close on overlay click
    [modal, infoModal, newsModal].forEach(ov => {
        ov.addEventListener('click', (e) => {
            if (e.target === ov) {
                closeAllModals();
            }
        });
    });

    saveBtn.addEventListener('click', async () => {
        let rawName = nameInput.value.trim();
        const dateVal = dateInput.value;
        const description = descriptionInput.value.trim();
        const selectedEmoji = emojiTrigger.textContent;

        if (!rawName || !dateVal) {
            showAppNotification('Please fill in all fields! 🚨');
            return;
        }

        const name = `${selectedEmoji} ${rawName}`;

        const targetDate = new Date(dateVal).getTime();

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
                    description: description,
                    repeat: repeatToggle.checked ? repeatType.value : 'none',
                    repeatValue: parseFloat(customRepeatValue.value) || 1,
                    notified: isFuture ? false : countdowns[index].notified
                };
            }
        } else {
            // New insertion
            countdowns.push({
                id: Date.now(),
                name: name,
                targetDate: targetDate,
                description: description,
                repeat: repeatToggle.checked ? repeatType.value : 'none',
                repeatValue: parseFloat(customRepeatValue.value) || 1,
                createdAt: Date.now(),
                notified: false
            });
        }

        modal.classList.add('hidden');
        renderCountdowns();
        await saveCountdowns();
        launchConfetti(50);
        showAppNotification('Countdown saved successfully! 🚀');
    });


    function updateTimeLeft(cd, timerElement, cardElement) {
        const now = new Date().getTime();
        const distance = cd.targetDate - now;

        if (distance <= 0) {
            const msgType = localStorage.getItem('countdown-msg-type') || 'default';
            const customMsg = localStorage.getItem('countdown-msg-custom') || '';
            let msg = "Completed!";

            if (msgType === 'random' && typeof completionMessages !== 'undefined' && completionMessages.length > 0) {
                const numericId = Number(cd.id) || 0;
                msg = completionMessages[numericId % completionMessages.length];
            } else if (msgType === 'custom' && customMsg.trim() !== '') {
                msg = customMsg.trim();
            }
            
            timerElement.innerHTML = `<div class="completed-box"><div class="completed-text">${msg}</div></div>`;
            if (!cd.notified) { // Celebration fires the first time the expired event is viewed
                cd.notified = true;
                triggerNotification(cd.name);
                launchConfetti();
                
                // If recurrent, calculate next date
                if (cd.repeat && cd.repeat !== 'none') {
                    const nextDate = calculateNextDate(cd.targetDate, cd.repeat, cd.repeatValue);
                    cd.targetDate = nextDate;
                    cd.notified = false; // Reset for next time
                    console.log('Recurrent restart:', cd.name, 'Next:', new Date(nextDate).toLocaleString());
                }
                
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
        
        const activeSort = document.querySelector('.sort-opt.active');
        const sortBy = activeSort ? activeSort.dataset.sort : 'date';
        const isAscending = !directionBtn.classList.contains('desc');
        
        const sorted = [...countdowns];
        const multiplier = isAscending ? 1 : -1;

        sorted.sort((a, b) => {
            let res = 0;
            if (sortBy === 'name') {
                res = a.name.localeCompare(b.name);
            } else if (sortBy === 'newest') {
                res = b.id - a.id;
            } else {
                res = a.targetDate - b.targetDate;
            }
            return res * multiplier;
        });

        sorted.forEach(cd => {
            const card = document.createElement('div');
            card.className = 'countdown-card';

            const titleRow = document.createElement('div');
            titleRow.className = 'cd-name';
            titleRow.innerHTML = `<span>${cd.name}</span>`;

            const actions = document.createElement('div');
            actions.className = 'cd-actions';

            const editBtn = document.createElement('span');
            editBtn.className = 'cd-edit icon-edit';
            editBtn.tabIndex = 0;
            editBtn.role = 'button';
            editBtn.ariaLabel = 'Edit Countdown';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                openEditModal(cd);
            };
            editBtn.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    editBtn.onclick(e);
                }
            };

            const delBtn = document.createElement('span');
            delBtn.className = 'cd-delete icon-delete';
            delBtn.tabIndex = 0;
            delBtn.role = 'button';
            delBtn.ariaLabel = 'Delete Countdown';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('Delete this countdown?')) {
                    countdowns = countdowns.filter(item => item.id !== cd.id);
                    renderCountdowns();
                    saveCountdowns();
                }
            };
            delBtn.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    delBtn.onclick(e);
                }
            };

            const infoBtn = document.createElement('span');
            infoBtn.className = 'cd-info icon-info';
            infoBtn.tabIndex = 0;
            infoBtn.role = 'button';
            infoBtn.ariaLabel = 'View Details';
            infoBtn.onclick = (e) => {
                e.stopPropagation();
                openInfoModal(cd);
            };
            infoBtn.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    infoBtn.onclick(e);
                }
            };

            actions.appendChild(infoBtn);
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

    function calculateNextDate(currentDate, type, value) {
        const date = new Date(currentDate);
        const now = Date.now();
        
        while (date.getTime() <= now) {
            switch (type) {
                case 'daily':
                    date.setDate(date.getDate() + 1);
                    break;
                case 'weekly':
                    date.setDate(date.getDate() + 7);
                    break;
                case 'monthly':
                    date.setMonth(date.getMonth() + 1);
                    break;
                case 'yearly':
                    date.setFullYear(date.getFullYear() + 1);
                    break;
                case 'custom':
                    date.setTime(date.getTime() + (value * 86400000)); // Days to ms
                    break;
            }
        }
        return date.getTime();
    }

    function openEditModal(cd) {
        modalTitle.textContent = 'Edit Countdown';
        idInput.value = cd.id;
        
        // Extract Emoji from the beginning of the title
        const emojiRegex = /^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2B50}\u{2B55}\u{23F0}-\u{23FA}])\s*/u;
        const match = cd.name.match(emojiRegex);
        if (match) {
            emojiTrigger.textContent = match[1];
            nameInput.value = cd.name.replace(emojiRegex, '');
        } else {
            const emojis = ["😀", "🎮", "💡", "✨", "🚀", "🎉", "🔥", "🎧", "🎬", "📅", "🎁"];
            emojiTrigger.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            nameInput.value = cd.name;
        }
        descriptionInput.value = cd.description || '';
        
        repeatToggle.checked = cd.repeat && cd.repeat !== 'none';
        repeatOptions.classList.toggle('hidden', !repeatToggle.checked);
        repeatType.value = cd.repeat || 'daily';
        customRepeatGroup.classList.toggle('hidden', repeatType.value !== 'custom');
        customRepeatValue.value = cd.repeatValue || 1;

        dateInput.type = 'datetime-local';
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(cd.targetDate - tzoffset)).toISOString().slice(0, 16);
        dateInput.value = localISOTime;

        modal.classList.remove('hidden');
    }

    function openInfoModal(cd) {
        infoCreated.textContent = cd.createdAt ? new Date(cd.createdAt).toLocaleString() : 'Legacy Countdown';
        infoDescription.textContent = cd.description || 'No description provided.';
        
        let repeatText = 'No';
        if (cd.repeat && cd.repeat !== 'none') {
            switch(cd.repeat) {
                case 'daily': repeatText = 'Every Day'; break;
                case 'weekly': repeatText = 'Every Week'; break;
                case 'monthly': repeatText = 'Every Month'; break;
                case 'yearly': repeatText = 'Every Year'; break;
                case 'custom': 
                    const val = cd.repeatValue || 1;
                    repeatText = `Every ${val} Days`; 
                    break;
            }
        }
        infoRepeat.textContent = repeatText;
        
        infoModal.classList.remove('hidden');
    }

    // PARTICLE EFFECT (CONFETTI)
    function launchConfetti(intensity = 150) {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        for (let i = 0; i < intensity; i++) {
            confettiParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * 150,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                tilt: Math.random() * 10 - 10,
                tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }

        if (!isConfettiRunning) {
            isConfettiRunning = true;
            requestAnimationFrame(confettiLoop);
        }
    }

    function confettiLoop() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (confettiParticles.length === 0) {
            isConfettiRunning = false;
            return;
        }

        confettiParticles.forEach((p, i) => {
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
        });

        // Refilter particles table to remove those off-screen
        confettiParticles = confettiParticles.filter(p => p.y <= canvas.height);

        if (confettiParticles.length > 0) {
            requestAnimationFrame(confettiLoop);
        } else {
            isConfettiRunning = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    window.addEventListener('resize', () => {
        const canvas = document.getElementById('confetti-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });

    // Initialize application after all functions and constants are defined
    try {
        console.log("%c--- COUNTDOWN APP INITIALIZED v1.1.12 ---", "color: #3498db; font-size: 20px; font-weight: bold;");
        const savedScale = localStorage.getItem('countdown-scale') || 1;
        sizeSlider.value = savedScale;
        grid.style.setProperty('--cd-zoom', savedScale);
        // Easter Egg: Massive 1000-click challenge with themed levels
        let titleClickCount = 0;
        const titleMessages = {
            // Tutorial & Foundation
            5: "Stop clicking! 🙄",
            10: "You really like clicking, don't you? 🤨",
            15: "Something special is coming... eventually! 🎁",
            20: "Okay, you win! Here is more confetti! 🎉",
            25: "Holy f, I'm coming Lois! 💦",
            30: "Level Up! You are now a 'Clicker Initiate'. ⚔️",
            50: "Achievement Unlocked: Mouse Abuse. 🖱️",

            // Movie Quests
            75: "Wait... there is no spoon. 🥄",
            100: "May the Force be with you. Always. ✨",
            125: "I'll be back. (Or you will, clicking more). 🦾",
            150: "Houston, we have a clicker. 🚀",
            175: "Frankly, my dear, I don't give a click. 🎩",
            200: "You're gonna need a bigger mouse. 🦈",

            // Video Game Bosses
            250: "YOU DIED. (Just kidding, keep going). 🔥",
            275: "Snake? SNAKE?! SNNNAAAKKKEEEE!!! 🐍",
            300: "The cake is a lie. 🎂",
            325: "Wasted. 💸",
            350: "Finish him! 🥊",
            375: "Ssssss... 💥",
            400: "Hey you, you're finally awake. ❄️",
            425: "It's-a me, Mario! 🍄",
            450: "All your base are belong to us. 🤖",
            500: "BOSS BATTLE: The Click King appeared! 👑",

            // TV Series & Binge
            550: "Winter is coming... and it's cold. ❄️",
            600: "I am the one who knocks! 🚪",
            650: "Bazinga! ⚡",
            700: "Friends don't lie. (But this button might). 🧇",
            750: "We were on a break! ☕",
            800: "To infinity and beyond! ✨",

            // Music & Pop Culture
            850: "Never gonna give you up... 🎵",
            875: "I came in like a wrecking ball! 🔨",
            900: "Is this the real life? Is this just fantasy? 🌎",
            925: "Harder, Better, Faster, Stronger. 🎧",
            950: "In the end, it doesn't even matter... 💔",
            975: "Look at me. I'm the captain now. ⚓",
            990: "SO CLOSE. FEEL THE POWER. ⚡",
            995: "995... 996... 997... 998... 999...",
            1000: "LEGENDARY STATUS ACHIEVED! You are the Chosen One! 🏆🔥👑✨"
        };

        const appTitle = document.querySelector('.countdown-title');
        if (appTitle) {
            const handleTitleInteration = () => {
                titleClickCount++;
                launchConfetti(50);
                if (titleMessages[titleClickCount]) {
                    showAppNotification(titleMessages[titleClickCount]);
                }
                
                // Reset after the ultimate goal
                if (titleClickCount >= 1000) {
                    titleClickCount = 0;
                }
            };

            appTitle.addEventListener('click', handleTitleInteration);
            appTitle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTitleInteration();
                }
            });
        }

        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                launchConfetti(80);
                showAppNotification('Thank you! 🦊');
            });
        }

        loadCountdowns();

        // Restore sort preference
        const savedSort = localStorage.getItem('countdown-sort');
        const savedDir = localStorage.getItem('countdown-dir');
        
        if (savedSort) {
            sortOpts.forEach(btn => {
                if (btn.dataset.sort === savedSort) {
                    sortOpts.forEach(o => o.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        }
        
        if (savedDir === 'desc') {
            directionBtn.classList.add('desc');
        }

        // PWA Installation Logic
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;
            // Update UI notify the user they can install the PWA
            if (pwaRow) pwaRow.classList.remove('hidden');
        });

        if (pwaBtn) {
            pwaBtn.addEventListener('click', async () => {
                if (!deferredPrompt) return;
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                // We've used the prompt, and can't use it again, throw it away
                deferredPrompt = null;
                // Hide the install button
                if (pwaRow) pwaRow.classList.add('hidden');
            });
        }

        // Settings Panel Toggle Logic (Mobile)
        if (settingsToggle && settingsPanel) {
            const isCollapsed = localStorage.getItem('settings-collapsed') === 'true';
            if (isCollapsed) {
                settingsPanel.classList.add('collapsed');
            }

            settingsToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent immediate closing by the document listener
                settingsPanel.classList.toggle('collapsed');
                localStorage.setItem('settings-collapsed', settingsPanel.classList.contains('collapsed'));
            });

            // Auto-close when clicking outside (mobile only)
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 900) {
                    if (!settingsPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
                        if (!settingsPanel.classList.contains('collapsed')) {
                            settingsPanel.classList.add('collapsed');
                            localStorage.setItem('settings-collapsed', 'true');
                        }
                    }
                }
            });
        }
        // Dual Layout Toggle Logic (Settings Panel)
        if (layoutOpts.length > 0) {
            let savedLayout = localStorage.getItem('countdown-view-layout') || 'grid-1';
            
            // Sanitize: If user had 'list' view, reset to 'grid-1' (as 'list' is deprecated)
            if (savedLayout === 'list') {
                savedLayout = 'grid-1';
                localStorage.setItem('countdown-view-layout', 'grid-1');
            }

            // Apply initial state
            layoutOpts.forEach(opt => {
                const layoutSuffix = opt.dataset.layout;
                opt.classList.toggle('active', layoutSuffix === savedLayout);
            });

            // Set container class (e.g., view-grid-1, view-grid-2)
            grid.classList.add(`view-${savedLayout}`);

            layoutOpts.forEach(btn => {
                btn.addEventListener('click', () => {
                    const layout = btn.dataset.layout;
                    
                    // UI Update
                    layoutOpts.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Grid Layout Classes Update
                    grid.classList.remove('view-grid-1', 'view-grid-2');
                    grid.classList.add(`view-${layout}`);

                    // Persistence
                    localStorage.setItem('countdown-view-layout', layout);

                    // Smooth transition feedback
                    grid.style.opacity = '0.5';
                    setTimeout(() => grid.style.opacity = '1', 200);
                });
            });
        }

        // Completion Message Settings Logic
        if (msgOpts.length > 0) {
            const savedMsgType = localStorage.getItem('countdown-msg-type') || 'default';
            const savedCustomMsg = localStorage.getItem('countdown-msg-custom') || '';
            
            if (customMsgInput) {
                customMsgInput.value = savedCustomMsg;
                if (savedMsgType === 'custom') {
                    customMsgInput.classList.remove('hidden');
                }
            }

            msgOpts.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.msg === savedMsgType);
                
                btn.addEventListener('click', () => {
                    const type = btn.dataset.msg;
                    msgOpts.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    localStorage.setItem('countdown-msg-type', type);
                    
                    if (customMsgInput) {
                        if (type === 'custom') {
                            customMsgInput.classList.remove('hidden');
                            customMsgInput.focus();
                        } else {
                            customMsgInput.classList.add('hidden');
                        }
                    }
                    
                    // Re-render to show updated messages if any countdown is finished
                    renderCountdowns();
                });
            });

            if (customMsgInput) {
                customMsgInput.addEventListener('input', () => {
                    localStorage.setItem('countdown-msg-custom', customMsgInput.value);
                });
                
                customMsgInput.addEventListener('change', () => {
                    renderCountdowns();
                });
            }
        }

        // News Center Logic
        if (newsBtn && newsModal && newsArticlesContainer) {
            newsBtn.addEventListener('click', () => {
                newsArticlesContainer.innerHTML = '';
                NEWS_ARTICLES.forEach(item => {
                    const article = document.createElement('div');
                    article.className = 'news-article';
                    article.innerHTML = `
                        <h3>${item.title}</h3>
                        <p>${item.content}</p>
                    `;
                    newsArticlesContainer.appendChild(article);
                });
                newsModal.classList.remove('hidden');
                launchConfetti(30);
            });
        }
    } catch (e) {
        console.error('Final initialization error:', e);
    }
});
