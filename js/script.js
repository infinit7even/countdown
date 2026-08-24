/**
 * Nextcloud Countdown Logic
 * Data saved via API (Nextcloud Backend DB)
 * Features: Edit, All Day, Particles and Notifications
 */

const NEWS_ARTICLES = [
    {
        title: "🌈Massive Emoji Update",
        content: "Expanded the emoji picker library! Now you have hundreds of new icons across all categories to perfectly match your countdowns."
    },
    {
        title: "🔄Cross-Tab Synchronization",
        content: "If you have the app open in multiple tabs, creating, editing, or deleting a countdown will now instantly sync across all of them without needing to refresh."
    },
    {
        title: "🚨System Notifications v2",
        content: "Notification system upgraded to utilize Nextcloud Background Jobs integration with system crontab. For more info read the [user documentation↗️](https://github.com/infinit7even/countdown/blob/master/README.md#-how-notifications-work)."
    },
    {
        title: "✨Custom Completion Messages",
        content: "Configurable completion messages with support for default presets, random selections, or personalized text."
    },
    {
        title: "🆕OCC Command Integration",
        content: "Command-line management for administrators. Supports listing, adding, and deleting countdowns, as well as manual notification checks."
    },
    {
        title: "⚙️Collapsible Settings Panel",
        content: "Hideable settings panel on both mobile and desktop for an optimized workspace."
    },
    {
        title: "📊Three Layout Views",
        content: "Multiple display modes: Expanded (stacked), Grid (side-by-side), and Compact. Layout preferences are preserved across sessions."
    },
    {
        title: "🎯Emoji Picker",
        content: "Integrated emoji support with a categorized picker. Allows selecting from hundreds of icons during countdown creation."
    },
    {
        title: "↕️Smart Sorting",
        content: "Sorting capabilities by date, name, or creation order. Includes a directional toggle for ascending or descending results."
    },
    {
        title: "📅Recurrent Countdowns",
        content: "Support for automatic countdown restarts. Available intervals include daily, weekly, monthly, yearly, or custom day counts."
    },
    {
        title: "🔔System Notifications",
        content: "Automated Nextcloud system notifications triggered upon countdown expiration."
    },
    {
        title: "🎉Confetti Celebrations",
        content: "Visual feedback via confetti bursts on save or expiration events. Includes a title-based interaction challenge."
    },
    {
        title: "🪀Countdown Description Field",
        content: "Support for optional notes or context via a dedicated description field, viewable in the details panel."
    },
    {
        title: "📱PWA Install Support",
        content: "Direct Progressive Web App (PWA) installation from the settings panel for standalone home screen access."
    },
    {
        title: "❤️Keyboard Accessibility",
        content: "Full keyboard navigation support for all interactive elements, enhanced by high-visibility focus highlights."
    },
    {
        title: "😊Dashboard Widget",
        content: "Seamless integration with the Nextcloud Dashboard via a dedicated summary widget."
    },
    {
        title: "🎨Theme-Aware Design",
        content: "Full compatibility with Nextcloud light, dark, and accessibility themes."
    },
];

// Native app detection to hide Nextcloud top bar and background immediately
if (navigator.userAgent.includes('CountdownNative') || (typeof window !== 'undefined' && window.nativex)) {
    document.documentElement.classList.add('is-native');
}

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
    const emojiSearchInput = document.getElementById('emoji-search-input');
    const emojiSearchClear = document.getElementById('emoji-search-clear');
    const emojiCategories = document.querySelector('.emoji-categories');
    const catBtns = document.querySelectorAll('.cat-btn');

    const infoModal = document.getElementById('info-modal');
    const infoCreated = document.getElementById('info-created');
    const infoDescription = document.getElementById('info-description');
    const infoRepeat = document.getElementById('info-repeat');
    const infoMilestoneGroup = document.getElementById('info-milestone-group');
    const infoMilestone = document.getElementById('info-milestone');
    const closeInfoBtn = document.getElementById('close-info-btn');
    const reviewBtn = document.querySelector('.review-btn');

    const repeatToggle = document.getElementById('cd-repeat-toggle');
    const repeatOptions = document.getElementById('repeat-options');
    const repeatType = document.getElementById('cd-repeat-type');
    const customRepeatGroup = document.getElementById('custom-repeat-group');
    const customRepeatValue = document.getElementById('cd-repeat-value');
    const yearlyRepeatGroup = document.getElementById('yearly-repeat-group');
    const startingYearInput = document.getElementById('cd-starting-year');
    const pwaRow = document.getElementById('app-debug-row');
    const pwaBtn = document.getElementById('pwa-install-btn');
    const debugBtn = document.getElementById('debug-notif-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsToggle = document.getElementById('settings-toggle');
    const msgOpts = document.querySelectorAll('.msg-opt');
    const customMsgInput = document.getElementById('custom-completion-input');
    const newsModal = document.getElementById('news-modal');
    const newsBtn = document.getElementById('news-btn');
    const closeNewsBtn = document.getElementById('close-news-btn');
    const newsArticlesContainer = document.getElementById('news-articles');

    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let countdownToDelete = null;

    // Request Browser Notification Permission
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

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

    if (debugBtn) {
        debugBtn.addEventListener('click', async () => {
            showAppNotification("🚀 Starting Test Notification...");

            // 1. Browser Notification
            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    try {
                        new Notification("Countdown Test Notification! 🎉", {
                            body: "Browser notifications are working correctly on this device. ✅",
                            icon: OC.generateUrl('/apps/countdown/img/app.svg')
                        });
                    } catch (err) {
                        console.warn("new Notification() not supported", err);
                        // Fallback to service worker if available
                        if (navigator.serviceWorker) {
                            navigator.serviceWorker.ready.then(function(registration) {
                                registration.showNotification("Countdown Test Notification! 🎉", {
                                    body: "Mobile PWA notifications are working correctly. ✅",
                                    icon: OC.generateUrl('/apps/countdown/img/app.svg')
                                });
                            }).catch(function(e) { console.warn("ServiceWorker showNotification failed", e); });
                        }
                    }
                } else {
                    showAppNotification("⚠️ Browser notifications NOT allowed. Check site settings!");
                    Notification.requestPermission();
                }
            }

            // 2. Android Notification (via JS Bridge)
            if (window.CountdownJsBridge) {
                window.CountdownJsBridge.triggerNotification("Test Notification: Android System ✅");
            }

            // 3. Server Notification (via API)
            try {
                await fetch(OC.generateUrl('/apps/countdown/api/notify'), {
                    method: 'POST',
                    headers: { 'requesttoken': OC.requestToken }
                });
                showAppNotification("📡 Server notification sent!");
            } catch (e) {
                console.error("Test Error:", e);
                showAppNotification("❌ Server notification failed.");
            }
        });
    }

    // Confetti State
    let confettiParticles = [];
    let isConfettiRunning = false;
    const confettiColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#ffffff'];

const EMOJI_DATA = {
      faces: [
        "😀","😃","😄","😁","😆","😅","😂","🤣","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚","😙",
        "😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😶‍🌫️","🫥","😏","😒","🙄","😬","🤥",
        "🫠","🫨","😌","😔","😪","🤤","😴","🫩","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","😵‍💫","🤯",
        "🤠","🥳","🥸","😎","🤓","🧐",
        "😕","🫤","😟","🙁","☹️","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","🫢","🫣","🫡","😭","😱",
        "😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬",
        "😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","🤖",
        "🙂‍↔️","🙂‍↕️",
        "❤️‍🔥","❤️‍🩹"
      ],

      people: [
        "👶","🧒","👦","👧","🧑","👨","👩","🧓","👴","👵",
        "🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇",
        "🤦","🤷","🫅","👮","🕵️","💂","👷","🤴","👸",
        "👳","👲","🧕","🤵","👰","🫃","🫄","🤰","🤱",
        "👼","🎅","🤶","🧑‍🎄","🦸","🦹","🧙","🧚","🧛","🧜","🧝",
        "💆","💇","🚶","🚶‍➡️","🏃","🏃‍➡️","🧎","🧎‍➡️","💃","🕺","🧍","🧘",
        "🧑‍🦯","🧑‍🦯‍➡️","🧑‍🦼","🧑‍🦼‍➡️","🧑‍🦽","🧑‍🦽‍➡️",
        "👯","🧖","🧗","🤺","🏇","⛷️","🏂","🏌️","🏄","🚣","🏊","⛹️","🏋️","🚴","🚵",
        "🤸","🤼","🤽","🤾","🤹",
        "🛀","🛌",
        "🧑‍⚕️","🧑‍🎓","🧑‍🏫","🧑‍⚖️","🧑‍🌾","🧑‍🍳","🧑‍🔧","🧑‍🏭","🧑‍💼","🧑‍🔬","🧑‍🎨","🧑‍✈️","🧑‍🚀","🧑‍🚒","🧑‍💻","🧑‍🎤",
        "🥷",
        "👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","🫵","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙",
        "👈","👉","👆","🖕","👇","☝️",
        "👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🫶","🙏",
        "💅","🤳",
        "💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁",
        "🦷","🦴","👀","👁️","👅","👄","🫦",
        "🧑‍🧑‍🧒","🧑‍🧒","🧑‍🧒‍🧒","🧑‍🧑‍🧒‍🧒"
      ],

      animals: [
        "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐽","🐸",
        "🐵","🙈","🙉","🙊",
        "🐔","🐧","🐦","🐦‍🔥","🐦‍⬛","🐤","🐣","🐥","🦆","🦅","🦉","🦇",
        "🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜",
        "🪲","🪳","🕷️","🕸️","🦟","🦗","🪱","🪰",
        "🐢","🐍","🦎","🦂","🐊","🦕","🦖","🐉","🐲",
        "🦀","🦞","🦐","🦑","🐙","🦪",
        "🐠","🐟","🐡","🦈","🐬","🐳","🐋","🦭",
        "🐆","🐅","🦓","🦍","🦧","🐘","🦣","🦛","🦏","🦬",
        "🐪","🐫","🦒","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐",
        "🦌","🫎","🫏","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛",
        "🪶","🐓","🦃","🦚","🦜","🦢","🦩","🕊️","🪿",
        "🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔",
        "🐾","🦠","🪸","🪼",
        "💐","🌸","💮","🪷","🏵️","🌹","🥀","🌺","🌻","🌼","🌷",
        "🌱","🪴","🌲","🌳","🌴","🌵","🌾","🌿","☘️","🍀","🍁","🍂","🍃",
        "🍄","🍄‍🟫",
        "🪨","🪵","🪹","🪺"
      ],

      food: [
        "🍏","🍎","🍐","🍊","🍋","🍋‍🟩","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝",
        "🍅","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠",
        "🍄","🍄‍🟫",
        "🥐","🥖","🍞","🥨","🥯","🫓","🥞","🧇",
        "🧀","🍖","🍗","🥩","🥓",
        "🍔","🍟","🍕","🌭","🥪","🌮","🌯","🫔","🥙","🧆",
        "🥚","🍳","🥘","🍲","🫕","🥣","🥗","🍿","🧈","🧂",
        "🍱","🍘","🍙","🍚","🍛","🍜","🍝","🍢","🍣","🍤","🍥",
        "🥮","🍡","🥟","🥠","🥡",
        "🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯",
        "🍼","🥛","☕","🫖","🍵","🧃","🥤","🧋","🍶","🍾","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉",
        "🫚","🫙","🧊","🫘","🫗"
      ],

      activities: [
        "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱",
        "🪀","🏓","🏸","🏒","🏑","🥍","🏏",
        "🪃","🥅","⛳","🪁","🏹","🎣",
        "🤿","🥊","🥋","🎽","🛹","🛼",
        "🎿","⛸️","🥌",
        "🎯","🪄","🎮","🕹️","🎲","🧩","♟️",
        "🏆","🥇","🥈","🥉","🏅","🎖️","🎗️",
        "🎭","🎨","🧵","🪡","🧶","🪢",
        "🎬","🎤","🎧","🎼","🎹","🥁","🪘","🎷","🎺","🎸","🎻","🪕","🪗","🪇","🎙️","🎚️","🎛️",
        "🎵","🎶",
        "🎉","🎊","🎈","🎁","🎀","🎫","🎟️",
        "🧨","🎆","🎇","✨",
        "🎑","🏮","🧧"
      ],

      travel: [
        "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜",
        "🏍️","🛵","🚲","🛴","🛺",
        "🚨","🚔","🚍","🚘",
        "🚥","🚦","🚧","🚏",
        "⛽","⚓","🛟",
        "✈️","🛫","🛬","🛩️","🪂","💺",
        "🚀","🛸","🚁",
        "🚢","⛴️","🛥️","🚤","🛶",
        "🚂","🚆","🚇","🚊","🚝","🚞","🚋","🚉",
        "🗺️","🧭",
        "🌍","🌎","🌏","🌐","🗾",
        "🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏞️",
        "🏟️","🏛️","🏗️","🧱",
        "🪨","🪵",
        "🛖","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭",
        "⛪","🕌","🛕","🕍","⛩️",
        "🪞","🪟","🛗","🚪","🛋️","🪑","🚽","🪠","🚿","🛁",
        "⛲","⛺","🌁","🌃","🌄","🌅","🌆","🌇","🌉","♨️",
        "🎠","🎡","🎢","🎪",
        "☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","🌀","🌈","🌂","☂️",
        "🔥","💧","🌊","⚡","🌙","🌟","⭐","🌠","✨"
      ],

      objects: [
        "⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","🖲️","💽","💾","💿","📀",
        "📷","📸","📹","🎥","📽️","🎞️",
        "📞","☎️","📟","📠",
        "📺","📻","🎙️","🎚️","🎛️",
        "⏰","⏱️","⏲️","🕰️","⌛","⏳",
        "🔋","🔌","💡","🔦","🕯️","🪔",
        "🧯","🛢️","💸",
        "💵","💴","💶","💷","🪙",
        "💳","💰","💎","🪬",
        "⚖️","🪜","🧰","🪛","🔧","🔨","⚒️","🛠️","⛏️","🪚",
        "🔩","⚙️","🪤","🪣",
        "🧱","⛓️","⛓️‍💥",
        "🔫","💣","🧨",
        "🪓","🔪","🗡️","⚔️","🛡️",
        "🚬","⚰️","🪦","⚱️","🏺",
        "🔮","📿","🧿",
        "💈","⚗️","🔭","🔬",
        "🧪","🧫","🧬",
        "🩺","🩹","💊","💉","🩸","🩻","🩼",
        "🪮","🧴","🧼","🫧","🪥","🧽","🧹","🧺","🧻","🪒","🧷",
        "🧢","🎩","🎓","⛑️","👒","🪖","👑",
        "💍","💄","👜","👛","💼","🛍️","🎒","🧳",
        "👓","🕶️","🥽",
        "🥼","🦺","👗","👘","🥻","🩱","🩲","🩳","👙","👚","👛","👔","👕","🧥","🧤","🧣","🧦",
        "👞","👟","🥾","🥿","👠","👡","🩰","👢",
        "✂️","🖊️","🖋️","✒️","🖌️","🖍️","✏️","📝",
        "🔍","🔎","🔏","🔒","🔓","🔑","🗝️",
        "🔔","🔕","📢","📣","📯","🔈","🔉","🔊",
        "📡","🔋","🪫",
        "📦","📫","📪","📬","📭","📮","🗳️","✉️","📧","📨","📩","📥","📤","📜","📃","📄","📑","🗒️","🗓️",
        "📅","📆","📇","📈","📉","📊","📋","📌","📍","📎","🖇️","📏","📐",
        "🗑️","📰","🗞️","📓","📔","📒","📕","📗","📘","📙","📚","🔖","🏷️",
        "💰","🗃️","🗄️","🗂️","📁","📂",
        "🧮","🪪","🧾","🧲",
        "⚗️","🔭","🔬","🧪","🧫","🧬"
      ],

      symbols: [
        "❤️","🧡","💛","💚","💙","🩵","💜","🖤","🤍","🤎","🩷","🩶","💔",
        "❣️","💕","💞","💓","💗","💖","💘","💝",
        "❤️‍🔥","❤️‍🩹",
        "💟","☮️","✝️","☪️","🕉️","☸️",
        "🔯","🕎","☯️",
        "☢️","☣️",
        "♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","⛎",
        "🆔","⚠️","🚸","⛔","🚫","❌","⭕",
        "✅","☑️","✔️",
        "❗","❓","‼️","⁉️",
        "🔴","🟠","🟡","🟢","🔵","🟣","🟤","⚫","⚪","🔶","🔷","🔸","🔹","🔺","🔻","💠","🔘","🔲","🔳","⬛","⬜","◼️","◻️","◾","◽","▪️","▫️",
        "⬆️","↗️","➡️","↘️","⬇️","↙️","⬅️","↖️","↕️","↔️","↩️","↪️","⤴️","⤵️",
        "🔀","🔁","🔂","▶️","⏩","⏭️","⏯️","◀️","⏪","⏮️","🔼","⏫","🔽","⏬","⏸️","⏹️","⏺️","⏏️",
        "🎦","🔅","🔆","📶","📳","📴","📵","📳",
        "🆒","🆓","🆕","🆙","🆗","🆖","🆘","🆚","🆛","🆜","🈶","🈯","🉐","🈹","🈚","🈲","🉑","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️",
        "🔟","🔠","🔡","🔢","🔣","🔤","🅰️","🅱️","🆎","🅾️",
        "⁉️","‼️","〰️","➰","➿","✔️","🔃","🔄",
        "🔙","🔚","🔛","🔜","🔝",
        "🛐","⚛️","🕯️","📿",
        "♾️","©️","®️","™️",
        "✳️","❇️","💯","🔱","📛","🔰","⭕","✅","☑️","❎","🏁"
      ],

      flags: [
        "🏳️","🏴","🏁","🚩","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️",
        "🇦🇨","🇦🇩","🇦🇪","🇦🇫","🇦🇬","🇦🇮","🇦🇱","🇦🇲","🇦🇴","🇦🇶","🇦🇷","🇦🇸","🇦🇹","🇦🇺","🇦🇼","🇦🇽","🇦🇿",
        "🇧🇦","🇧🇧","🇧🇩","🇧🇪","🇧🇫","🇧🇬","🇧🇭","🇧🇮","🇧🇯","🇧🇱","🇧🇲","🇧🇳","🇧🇴","🇧🇶","🇧🇷","🇧🇸","🇧🇹","🇧🇻","🇧🇼","🇧🇾","🇧🇿",
        "🇨🇦","🇨🇨","🇨🇩","🇨🇫","🇨🇬","🇨🇭","🇨🇮","🇨🇰","🇨🇱","🇨🇲","🇨🇳","🇨🇴","🇨🇵","🇨🇷","🇨🇺","🇨🇻","🇨🇼","🇨🇽","🇨🇾","🇨🇿",
        "🇩🇪","🇩🇬","🇩🇯","🇩🇰","🇩🇲","🇩🇴","🇩🇿",
        "🇪🇦","🇪🇨","🇪🇪","🇪🇬","🇪🇭","🇪🇷","🇪🇸","🇪🇹","🇪🇺",
        "🇫🇮","🇫🇯","🇫🇰","🇫🇲","🇫🇴","🇫🇷",
        "🇬🇦","🇬🇧","🇬🇩","🇬🇪","🇬🇫","🇬🇬","🇬🇭","🇬🇮","🇬🇱","🇬🇲","🇬🇳","🇬🇵","🇬🇶","🇬🇷","🇬🇸","🇬🇹","🇬🇺","🇬🇼","🇬🇾",
        "🇭🇰","🇭🇲","🇭🇳","🇭🇷","🇭🇹","🇭🇺",
        "🇮🇨","🇮🇩","🇮🇪","🇮🇱","🇮🇲","🇮🇳","🇮🇴","🇮🇶","🇮🇷","🇮🇸","🇮🇹",
        "🇯🇪","🇯🇲","🇯🇴","🇯🇵",
        "🇰🇪","🇰🇬","🇰🇭","🇰🇮","🇰🇲","🇰🇳","🇰🇵","🇰🇷","🇰🇼","🇰🇾","🇰🇿",
        "🇱🇦","🇱🇧","🇱🇨","🇱🇮","🇱🇰","🇱🇷","🇱🇸","🇱🇹","🇱🇺","🇱🇻","🇱🇾",
        "🇲🇦","🇲🇨","🇲🇩","🇲🇪","🇲🇫","🇲🇬","🇲🇭","🇲🇰","🇲🇱","🇲🇲","🇲🇳","🇲🇴","🇲🇵","🇲🇶","🇲🇷","🇲🇸","🇲🇹","🇲🇺","🇲🇻","🇲🇼","🇲🇽","🇲🇾","🇲🇿",
        "🇳🇦","🇳🇨","🇳🇪","🇳🇫","🇳🇬","🇳🇮","🇳🇱","🇳🇴","🇳🇵","🇳🇷","🇳🇺","🇳🇿",
        "🇴🇲",
        "🇵🇦","🇵🇪","🇵🇫","🇵🇬","🇵🇭","🇵🇰","🇵🇱","🇵🇲","🇵🇳","🇵🇷","🇵🇸","🇵🇹","🇵🇼","🇵🇾",
        "🇶🇦",
        "🇷🇪","🇷🇴","🇷🇸","🇷🇺","🇷🇼",
        "🇸🇦","🇸🇧","🇸🇨","🇸🇩","🇸🇪","🇸🇬","🇸🇭","🇸🇮","🇸🇯","🇸🇰","🇸🇱","🇸🇲","🇸🇳","🇸🇴","🇸🇷","🇸🇸","🇸🇹","🇸🇻","🇸🇽","🇸🇾","🇸🇿",
        "🇹🇦","🇹🇨","🇹🇩","🇹🇫","🇹🇬","🇹🇭","🇹🇯","🇹🇰","🇹🇱","🇹🇲","🇹🇳","🇹🇴","🇹🇷","🇹🇹","🇹🇻","🇹🇼","🇹🇿",
        "🇺🇦","🇺🇬","🇺🇲","🇺🇳","🇺🇸","🇺🇾","🇺🇿",
        "🇻🇦","🇻🇨","🇻🇪","🇻🇬","🇻🇮","🇻🇳","🇻🇺",
        "🇼🇫","🇼🇸",
        "🇽🇰",
        "🇾🇪","🇾🇹",
        "🇿🇦","🇿🇲","🇿🇼",
        "🏴󠁧󠁢󠁥󠁮󠁧󠁿","🏴󠁧󠁢󠁳󠁣󠁴󠁿","🏴󠁧󠁢󠁷󠁬󠁳󠁿"
      ]
    };

const EMOJI_KEYWORDS = {"😀": "faces grinning face smile happy laugh joy cheerful positive smiley", "😃": "faces smiling face with open mouth happy smile joy excited grinning", "😄": "faces smiling face with open mouth and eyes happy joy laugh fun", "😁": "faces grinning face with smiling eyes beaming smile teeth happy proud delight", "😆": "faces smiling face with open mouth and tightly-closed eyes laughing closed grinning fun lol haha joke giggle", "😅": "faces smiling face with open mouth and cold sweat smile relief phew awkward nervous workout gym laugh", "😂": "faces face with tears of joy laughing laugh lol haha crying hilarious fun", "🤣": "faces rolling on the floor laughing rofl hilarious lmao dead dying funny", "🙂": "faces slightly smiling face happy smile okay good nice polite", "🙃": "faces upside-down face silly sarcasm ironical goofy ironic mood", "😉": "faces winking face wink flirt secret joke playful teasing cheeky", "😊": "faces smiling face with eyes blush warm happy tender sweet", "😇": "faces smiling face with halo innocent angel blessed good saint holy pure angelic", "🥰": "faces smiling face with eyes and three hearts love romantic in happy", "😍": "faces smiling face with heart-shaped eyes heart love romantic favorite crush happy", "🤩": "faces grinning face with star eyes", "😘": "faces face throwing a kiss blow love romance flirt happy", "😗": "faces kissing face", "☺️": "faces white smiling face", "😚": "faces kissing face with closed eyes", "😙": "faces kissing face with smiling eyes", "😋": "faces face savouring delicious food", "😛": "faces face with stuck-out tongue", "😜": "faces face with stuck-out tongue and winking eye", "🤪": "faces grinning face with one large and small eye", "😝": "faces face with stuck-out tongue and tightly-closed eyes", "🤑": "faces money-mouth face", "🤗": "faces hugging face", "🤭": "faces smiling face with eyes and hand covering mouth", "🤫": "faces face with finger covering closed lips", "🤔": "faces thinking face", "🤐": "faces zipper-mouth face", "🤨": "faces face with one eyebrow raised", "😐": "faces neutral face", "😑": "faces expressionless face", "😶": "faces face without mouth", "😶‍🌫️": "faces face without mouth fog", "🫥": "faces dotted line face", "😏": "faces smirking face", "😒": "faces unamused face", "🙄": "faces face with rolling eyes", "😬": "faces grimacing face", "🤥": "faces lying face", "🫠": "faces melting face", "🫨": "faces shaking face", "😌": "faces relieved face", "😔": "faces pensive face", "😪": "faces sleepy face", "🤤": "faces drooling face", "😴": "faces sleeping face", "🫩": "faces", "😷": "faces face with medical mask", "🤒": "faces face with thermometer", "🤕": "faces face with head-bandage", "🤢": "faces nauseated face", "🤮": "faces face with open mouth vomiting", "🤧": "faces sneezing face", "🥵": "faces overheated face", "🥶": "faces freezing face", "🥴": "faces face with uneven eyes and wavy mouth", "😵": "faces dizzy face", "😵‍💫": "faces dizzy face symbol", "🤯": "faces shocked face with exploding head", "🤠": "faces face with cowboy hat", "🥳": "faces face with party horn and hat partying celebrate birthday new year hats celebration festivity", "🥸": "faces disguised face", "😎": "faces smiling face with sunglasses cool shades chill confident boss summer stylish handsome", "🤓": "faces nerd face geek glasses smart study tech intelligent dork bookworm", "🧐": "faces face with monocle classy curious inspect examine smart investigate detective", "😕": "faces confused face", "🫤": "faces face with diagonal mouth", "😟": "faces worried face", "🙁": "faces slightly frowning face", "☹️": "faces white frowning face", "😮": "faces face with open mouth", "😯": "faces hushed face", "😲": "faces astonished face", "😳": "faces flushed face", "🥺": "faces face with pleading eyes", "🥹": "faces face holding back tears", "😦": "faces frowning face with open mouth", "😧": "faces anguished face", "😨": "faces fearful face", "😰": "faces face with open mouth and cold sweat", "😥": "faces disappointed but relieved face", "😢": "faces crying face", "🫢": "faces face with open eyes and hand over mouth", "🫣": "faces face with peeking eye", "🫡": "faces saluting face", "😭": "faces loudly crying face sob tears sad depressed heartbreak grief", "😱": "faces face screaming in fear shock scream scared horror frightened home alone omgh", "😖": "faces confounded face", "😣": "faces persevering face", "😞": "faces disappointed face", "😓": "faces face with cold sweat", "😩": "faces weary face", "😫": "faces tired face", "🥱": "faces yawning face", "😤": "faces face with look of triumph", "😡": "faces pouting face angry mad furious red annoyed rage upset", "😠": "faces angry face", "🤬": "faces serious face with symbols covering mouth", "😈": "faces smiling face with horns", "👿": "faces imp", "💀": "faces skull", "☠️": "faces skull and crossbones", "💩": "faces pile of poo", "🤡": "faces clown face", "👹": "faces japanese ogre", "👺": "faces japanese goblin", "👻": "faces ghost", "👽": "faces extraterrestrial alien", "🤖": "faces robot face", "🙂‍↔️": "faces slightly smiling face left right arrow", "🙂‍↕️": "faces slightly smiling face up down arrow", "❤️‍🔥": "faces heavy black heart fire", "❤️‍🩹": "faces heavy black heart adhesive bandage", "👶": "people baby infant newborn birth pregnant pregnancy kid child toddler boy girl", "🧒": "people child", "👦": "people boy", "👧": "people girl", "🧑": "people adult", "👨": "people man", "👩": "people woman", "🧓": "people older adult", "👴": "people older man", "👵": "people older woman", "🙍": "people person frowning", "🙎": "people person with pouting face", "🙅": "people face with no good gesture", "🙆": "people face with ok gesture", "💁": "people information desk person", "🙋": "people happy person raising one hand", "🧏": "people deaf person", "🙇": "people person bowing deeply", "🤦": "people face palm", "🤷": "people shrug", "🫅": "people person with crown", "👮": "people police officer", "🕵️": "people sleuth or spy", "💂": "people guardsman", "👷": "people construction worker", "🤴": "people prince", "👸": "people princess", "👳": "people man with turban", "👲": "people man with gua pi mao", "🧕": "people person with headscarf", "🤵": "people man in tuxedo", "👰": "people bride with veil", "🫃": "people pregnant man", "🫄": "people pregnant person", "🤰": "people pregnant woman", "🤱": "people breast-feeding", "👼": "people baby angel", "🎅": "people father christmas", "🤶": "people mother christmas", "🧑‍🎄": "people adult christmas tree", "🦸": "people superhero", "🦹": "people supervillain", "🧙": "people mage", "🧚": "people fairy", "🧛": "people vampire", "🧜": "people merperson", "🧝": "people elf", "💆": "people face massage", "💇": "people haircut", "🚶": "people pedestrian", "🚶‍➡️": "people pedestrian black rightwards arrow", "🏃": "people runner", "🏃‍➡️": "people runner black rightwards arrow", "🧎": "people kneeling person", "🧎‍➡️": "people kneeling person black rightwards arrow", "💃": "people dancer", "🕺": "people man dancing", "🧍": "people standing person", "🧘": "people person in lotus position", "🧑‍🦯": "people adult probing cane", "🧑‍🦯‍➡️": "people adult probing cane black rightwards arrow", "🧑‍🦼": "people adult motorized wheelchair", "🧑‍🦼‍➡️": "people adult motorized wheelchair black rightwards arrow", "🧑‍🦽": "people adult manual wheelchair", "🧑‍🦽‍➡️": "people adult manual wheelchair black rightwards arrow", "👯": "people woman with bunny ears", "🧖": "people person in steamy room", "🧗": "people person climbing", "🤺": "people fencer", "🏇": "people horse racing", "⛷️": "people skier", "🏂": "people snowboarder", "🏌️": "people golfer", "🏄": "people surfer", "🚣": "people rowboat", "🏊": "people swimmer", "⛹️": "people person with ball", "🏋️": "people weight lifter", "🚴": "people bicyclist", "🚵": "people mountain bicyclist", "🤸": "people person doing cartwheel", "🤼": "people wrestlers", "🤽": "people water polo", "🤾": "people handball", "🤹": "people juggling", "🛀": "people bath", "🛌": "people sleeping accommodation", "🧑‍⚕️": "people adult staff of aesculapius", "🧑‍🎓": "people adult graduation cap", "🧑‍🏫": "people adult school", "🧑‍⚖️": "people adult scales", "🧑‍🌾": "people adult ear of rice", "🧑‍🍳": "people adult cooking", "🧑‍🔧": "people adult wrench", "🧑‍🏭": "people adult factory", "🧑‍💼": "people adult briefcase", "🧑‍🔬": "people adult microscope", "🧑‍🎨": "people adult artist palette", "🧑‍✈️": "people adult airplane", "🧑‍🚀": "people adult rocket", "🧑‍🚒": "people adult fire engine", "🧑‍💻": "people adult personal computer", "🧑‍🎤": "people adult microphone", "🥷": "people ninja", "👋": "people waving hand sign", "🤚": "people raised back of hand", "🖐️": "people raised hand with fingers splayed", "✋": "people raised hand", "🖖": "people raised hand with part between middle and ring fingers", "🫱": "people rightwards hand", "🫲": "people leftwards hand", "🫳": "people palm down hand", "🫴": "people palm up hand", "🫵": "people index pointing at the viewer", "👌": "people ok hand sign", "🤌": "people pinched fingers", "🤏": "people pinching hand", "✌️": "people victory hand", "🤞": "people hand with index and middle fingers crossed", "🫰": "people hand with index finger and thumb crossed", "🤟": "people i love you hand sign", "🤘": "people sign of the horns", "🤙": "people call me hand", "👈": "people white left pointing backhand index", "👉": "people white right pointing backhand index", "👆": "people white up pointing backhand index", "🖕": "people reversed hand with middle finger extended", "👇": "people white down pointing backhand index", "☝️": "people white up pointing index", "👍": "people thumbs up sign", "👎": "people thumbs down sign", "✊": "people raised fist", "👊": "people fisted hand sign", "🤛": "people left-facing fist", "🤜": "people right-facing fist", "👏": "people clapping hands sign", "🙌": "people person raising both hands in celebration", "👐": "people open hands sign", "🤲": "people palms up together", "🫶": "people heart hands", "🙏": "people person with folded hands", "💅": "people nail polish", "🤳": "people selfie", "💪": "people flexed biceps", "🦾": "people mechanical arm", "🦿": "people mechanical leg", "🦵": "people leg", "🦶": "people foot", "👂": "people ear", "🦻": "people ear with hearing aid", "👃": "people nose", "🧠": "people brain", "🫀": "people anatomical heart", "🫁": "people lungs", "🦷": "people tooth", "🦴": "people bone", "👀": "people eyes", "👁️": "people eye", "👅": "people tongue", "👄": "people mouth", "🫦": "people biting lip", "🧑‍🧑‍🧒": "people adult child", "🧑‍🧒": "people adult child", "🧑‍🧒‍🧒": "people adult child", "🧑‍🧑‍🧒‍🧒": "people adult child", "🐶": "animals dog face puppy doggy pet animal canine bark woof cute", "🐱": "animals cat face kitten kitty pet animal feline meow cute purr", "🐭": "animals mouse face", "🐹": "animals hamster face", "🐰": "animals rabbit face", "🦊": "animals fox face animal wild red clever cute foxy", "🐻": "animals bear face animal wild grizzly teddy cute", "🐼": "animals panda face animal bear bamboo china cute giant", "🐻‍❄️": "animals bear face snowflake", "🐨": "animals koala", "🐯": "animals tiger face animal cat wild predator stripes jungle", "🦁": "animals lion face wild animal king cat predator roar savanna safari", "🐮": "animals cow face", "🐷": "animals pig face", "🐽": "animals pig nose", "🐸": "animals frog face", "🐵": "animals monkey face", "🙈": "animals see-no-evil monkey", "🙉": "animals hear-no-evil monkey", "🙊": "animals speak-no-evil monkey", "🐔": "animals chicken", "🐧": "animals penguin", "🐦": "animals bird", "🐦‍🔥": "animals bird fire", "🐦‍⬛": "animals bird black large square", "🐤": "animals baby chick", "🐣": "animals hatching chick", "🐥": "animals front-facing baby chick", "🦆": "animals duck", "🦅": "animals eagle", "🦉": "animals owl", "🦇": "animals bat", "🐺": "animals wolf face", "🐗": "animals boar", "🐴": "animals horse face", "🦄": "animals unicorn face horse magical fantasy horn rainbow pony cute fairy", "🐝": "animals honeybee", "🐛": "animals bug", "🦋": "animals butterfly", "🐌": "animals snail", "🐞": "animals lady beetle", "🐜": "animals ant", "🪲": "animals beetle", "🪳": "animals cockroach", "🕷️": "animals spider", "🕸️": "animals spider web", "🦟": "animals mosquito", "🦗": "animals cricket", "🪱": "animals worm", "🪰": "animals fly", "🐢": "animals turtle", "🐍": "animals snake", "🦎": "animals lizard", "🦂": "animals scorpion", "🐊": "animals crocodile", "🦕": "animals sauropod", "🦖": "animals t-rex", "🐉": "animals dragon", "🐲": "animals dragon face", "🦀": "animals crab", "🦞": "animals lobster", "🦐": "animals shrimp", "🦑": "animals squid", "🐙": "animals octopus", "🦪": "animals oyster", "🐠": "animals tropical fish", "🐟": "animals fish", "🐡": "animals blowfish", "🦈": "animals shark", "🐬": "animals dolphin", "🐳": "animals spouting whale", "🐋": "animals whale", "🦭": "animals seal", "🐆": "animals leopard", "🐅": "animals tiger", "🦓": "animals zebra face", "🦍": "animals gorilla", "🦧": "animals orangutan", "🐘": "animals elephant", "🦣": "animals mammoth", "🦛": "animals hippopotamus", "🦏": "animals rhinoceros", "🦬": "animals bison", "🐪": "animals dromedary camel", "🐫": "animals bactrian camel", "🦒": "animals giraffe face", "🐃": "animals water buffalo", "🐂": "animals ox", "🐄": "animals cow", "🐎": "animals horse", "🐖": "animals pig", "🐏": "animals ram", "🐑": "animals sheep", "🦙": "animals llama", "🐐": "animals goat", "🦌": "animals deer", "🫎": "animals moose", "🫏": "animals donkey", "🐕": "animals dog", "🐩": "animals poodle", "🦮": "animals guide dog", "🐕‍🦺": "animals dog safety vest", "🐈": "animals cat", "🐈‍⬛": "animals cat black large square", "🪶": "animals feather", "🐓": "animals rooster", "🦃": "animals turkey", "🦚": "animals peacock", "🦜": "animals parrot", "🦢": "animals swan", "🦩": "animals flamingo", "🕊️": "animals dove of peace", "🪿": "animals goose", "🐇": "animals rabbit", "🦝": "animals raccoon", "🦨": "animals skunk", "🦡": "animals badger", "🦫": "animals beaver", "🦦": "animals otter", "🦥": "animals sloth", "🐁": "animals mouse", "🐀": "animals rat", "🐿️": "animals chipmunk", "🦔": "animals hedgehog", "🐾": "animals paw prints", "🦠": "animals microbe", "🪸": "animals coral", "🪼": "animals jellyfish", "💐": "animals bouquet", "🌸": "animals cherry blossom", "💮": "animals white flower", "🪷": "animals lotus", "🏵️": "animals rosette", "🌹": "animals rose", "🥀": "animals wilted flower", "🌺": "animals hibiscus", "🌻": "animals sunflower", "🌼": "animals blossom", "🌷": "animals tulip", "🌱": "animals seedling", "🪴": "animals potted plant", "🌲": "animals evergreen tree", "🌳": "animals deciduous tree", "🌴": "animals palm tree", "🌵": "animals cactus", "🌾": "animals ear of rice", "🌿": "animals herb", "☘️": "animals shamrock", "🍀": "animals four leaf clover", "🍁": "animals maple leaf", "🍂": "animals fallen leaf", "🍃": "animals leaf fluttering in wind", "🍄": "animals mushroom", "🍄‍🟫": "animals mushroom large brown square", "🪨": "animals rock", "🪵": "animals wood", "🪹": "animals empty nest", "🪺": "animals nest with eggs", "🍏": "food green apple", "🍎": "food red apple", "🍐": "food pear", "🍊": "food tangerine", "🍋": "food lemon", "🍋‍🟩": "food lemon large green square", "🍌": "food banana", "🍉": "food watermelon", "🍇": "food grapes", "🍓": "food strawberry", "🫐": "food blueberries", "🍈": "food melon", "🍒": "food cherries", "🍑": "food peach", "🥭": "food mango", "🍍": "food pineapple", "🥥": "food coconut", "🥝": "food kiwifruit", "🍅": "food tomato", "🥑": "food avocado", "🥦": "food broccoli", "🥬": "food leafy green", "🥒": "food cucumber", "🌶️": "food hot pepper", "🫑": "food bell pepper", "🌽": "food ear of maize", "🥕": "food carrot", "🫒": "food olive", "🧄": "food garlic", "🧅": "food onion", "🥔": "food potato", "🍠": "food roasted sweet potato", "🥐": "food croissant", "🥖": "food baguette bread", "🍞": "food bread", "🥨": "food pretzel", "🥯": "food bagel", "🫓": "food flatbread", "🥞": "food pancakes", "🧇": "food waffle", "🧀": "food cheese wedge", "🍖": "food meat on bone", "🍗": "food poultry leg", "🥩": "food cut of meat", "🥓": "food bacon", "🍔": "food hamburger burger fast dinner meal beef", "🍟": "food french fries", "🍕": "food slice of pizza cheese italian fast dinner meal", "🌭": "food hot dog", "🥪": "food sandwich", "🌮": "food taco", "🌯": "food burrito", "🫔": "food tamale", "🥙": "food stuffed flatbread", "🧆": "food falafel", "🥚": "food egg", "🍳": "food cooking", "🥘": "food shallow pan of", "🍲": "food pot of", "🫕": "food fondue", "🥣": "food bowl with spoon", "🥗": "food green salad", "🍿": "food popcorn movie cinema snack film episode series", "🧈": "food butter", "🧂": "food salt shaker", "🍱": "food bento box", "🍘": "food rice cracker", "🍙": "food rice ball", "🍚": "food cooked rice", "🍛": "food curry and rice", "🍜": "food steaming bowl", "🍝": "food spaghetti", "🍢": "food oden", "🍣": "food sushi", "🍤": "food fried shrimp", "🍥": "food fish cake with swirl design", "🥮": "food moon cake", "🍡": "food dango", "🥟": "food dumpling", "🥠": "food fortune cookie", "🥡": "food takeout box", "🍦": "food soft ice cream", "🍧": "food shaved ice", "🍨": "food ice cream", "🍩": "food doughnut", "🍪": "food cookie", "🎂": "food birthday cake bday anniversary party celebrate celebration", "🍰": "food shortcake", "🧁": "food cupcake", "🥧": "food pie", "🍫": "food chocolate bar", "🍬": "food candy", "🍭": "food lollipop", "🍮": "food custard", "🍯": "food honey pot", "🍼": "food baby bottle", "🥛": "food glass of milk", "☕": "food hot beverage", "🫖": "food teapot", "🍵": "food teacup without handle", "🧃": "food beverage box", "🥤": "food cup with straw", "🧋": "food bubble tea", "🍶": "food sake bottle and cup", "🍾": "food bottle with popping cork", "🍺": "food beer mug alcohol drink pub bar party cheers oktoberfest brew lager ale", "🍻": "food clinking beer mugs beers cheers party pub bar celebration drink", "🥂": "food clinking glasses champagne toast cheers celebration wedding anniversary wine drink party", "🍷": "food wine glass red drink alcohol bar dinner restaurant", "🥃": "food tumbler glass", "🍸": "food cocktail glass martini drink alcohol bar party club lounge", "🍹": "food tropical drink", "🧉": "food mate drink", "🫚": "food ginger root", "🫙": "food jar", "🧊": "food ice cube", "🫘": "food beans", "🫗": "food pouring liquid", "⚽": "activities soccer ball football sports match game champions fifa league world cup", "🏀": "activities basketball and hoop ball sports game nba match tournament", "🏈": "activities american football", "⚾": "activities baseball", "🥎": "activities softball", "🎾": "activities tennis racquet and ball", "🏐": "activities volleyball", "🏉": "activities rugby football", "🥏": "activities flying disc", "🎱": "activities billiards", "🪀": "activities yo-yo", "🏓": "activities table tennis paddle and ball", "🏸": "activities badminton racquet and shuttlecock", "🏒": "activities ice hockey stick and puck", "🏑": "activities field hockey stick and ball", "🥍": "activities lacrosse stick and ball", "🏏": "activities cricket bat and ball", "🪃": "activities boomerang", "🥅": "activities goal net", "⛳": "activities flag in hole", "🪁": "activities kite", "🏹": "activities bow and arrow", "🎣": "activities fishing pole and fish", "🤿": "activities diving mask", "🥊": "activities boxing glove", "🥋": "activities martial arts uniform", "🎽": "activities running shirt with sash", "🛹": "activities skateboard", "🛼": "activities roller skate", "🎿": "activities ski and boot", "⛸️": "activities ice skate", "🥌": "activities curling stone", "🎯": "activities direct hit", "🪄": "activities magic wand", "🎮": "activities video game gaming videogame playstation xbox nintendo console controller play arcade", "🕹️": "activities joystick arcade retro game gaming play", "🎲": "activities game die", "🧩": "activities jigsaw puzzle piece", "♟️": "activities black chess pawn", "🏆": "activities trophy winner award first champion victory win gold prize cup contest tournament", "🥇": "activities first place medal gold winner award champion victory 1st number one prize", "🥈": "activities second place medal silver award 2nd runner up prize", "🥉": "activities third place medal bronze award 3rd prize", "🏅": "activities sports medal", "🎖️": "activities military medal", "🎗️": "activities reminder ribbon", "🎭": "activities performing arts", "🎨": "activities artist palette", "🧵": "activities spool of thread", "🪡": "activities sewing needle", "🧶": "activities ball of yarn", "🪢": "activities knot", "🎬": "activities clapper board movie film cinema premiere video show netflix series episode", "🎤": "activities microphone mic singing karaoke music concert voice audio artist vocal live", "🎧": "activities headphone headphones music audio listening listen sound podcast beats earphone tracks", "🎼": "activities musical score", "🎹": "activities musical keyboard piano music keys play concert song notes instrument melody", "🥁": "activities drum with drumsticks", "🪘": "activities long drum", "🎷": "activities saxophone", "🎺": "activities trumpet", "🎸": "activities guitar music rock acoustic electric band concert play song instrument", "🎻": "activities violin", "🪕": "activities banjo", "🪗": "activities accordion", "🪇": "activities maracas", "🎙️": "activities studio microphone", "🎚️": "activities level slider", "🎛️": "activities control knobs", "🎵": "activities musical note music song melody audio sound tune soundtrack rhythm", "🎶": "activities multiple musical notes music songs melody audio tune playlist", "🎉": "activities party popper celebration confetti tada congrats event happy new year", "🎊": "activities confetti ball party celebration event", "🎈": "activities balloon", "🎁": "activities wrapped present gift box birthday christmas surprise package wrap holiday", "🎀": "activities ribbon", "🎫": "activities ticket", "🎟️": "activities admission tickets", "🧨": "activities firecracker", "🎆": "activities fireworks", "🎇": "activities firework sparkler", "✨": "activities sparkles sparkle star magic shine clean new glow glitter wonder special", "🎑": "activities moon viewing ceremony", "🏮": "activities izakaya lantern", "🧧": "activities red gift envelope", "🚗": "travel automobile car vehicle drive auto trip road", "🚕": "travel taxi", "🚙": "travel recreational vehicle", "🚌": "travel bus", "🚎": "travel trolleybus", "🏎️": "travel racing car f1 formula1 fast vehicle drive auto race grand prix motor", "🚓": "travel police car", "🚑": "travel ambulance", "🚒": "travel fire engine", "🚐": "travel minibus", "🛻": "travel pickup truck", "🚚": "travel delivery truck", "🚛": "travel articulated lorry", "🚜": "travel tractor", "🏍️": "travel racing motorcycle", "🛵": "travel motor scooter", "🚲": "travel bicycle", "🛴": "travel scooter", "🛺": "travel auto rickshaw", "🚨": "travel police cars revolving light", "🚔": "travel oncoming police car", "🚍": "travel oncoming bus", "🚘": "travel oncoming automobile", "🚥": "travel horizontal traffic light", "🚦": "travel vertical traffic light", "🚧": "travel construction sign", "🚏": "travel bus stop", "⛽": "travel fuel pump", "⚓": "travel anchor", "🛟": "travel ring buoy", "✈️": "travel airplane plane flight holiday vacation trip fly airport tourism", "🛫": "travel airplane departure", "🛬": "travel airplane arriving", "🛩️": "travel small airplane", "🪂": "travel parachute", "💺": "travel seat", "🚀": "travel rocket launch space blast spaceship startup fast speed countdown", "🛸": "travel flying saucer", "🚁": "travel helicopter", "🚢": "travel ship", "⛴️": "travel ferry", "🛥️": "travel motor boat", "🚤": "travel speedboat", "🛶": "travel canoe", "🚂": "travel steam locomotive", "🚆": "travel train", "🚇": "travel metro", "🚊": "travel tram", "🚝": "travel monorail", "🚞": "travel mountain railway", "🚋": "travel tram car", "🚉": "travel station", "🗺️": "travel world map", "🧭": "travel compass", "🌍": "travel earth globe europe-africa", "🌎": "travel earth globe americas", "🌏": "travel earth globe asia-australia", "🌐": "travel globe with meridians", "🗾": "travel silhouette of japan", "🏔️": "travel snow capped mountain", "⛰️": "travel mountain", "🌋": "travel volcano", "🗻": "travel mount fuji", "🏕️": "travel camping", "🏖️": "travel beach with umbrella holiday vacation summer sand sea ocean trip island sun", "🏜️": "travel desert", "🏝️": "travel desert island beach holiday vacation tropical ocean sea", "🏞️": "travel national park", "🏟️": "travel stadium", "🏛️": "travel classical building", "🏗️": "travel building construction", "🧱": "travel brick", "🛖": "travel hut", "🏠": "travel house building", "🏡": "travel house with garden", "🏢": "travel office building", "🏣": "travel japanese post office", "🏤": "travel european post office", "🏥": "travel hospital", "🏦": "travel bank", "🏨": "travel hotel", "🏩": "travel love hotel", "🏪": "travel convenience store", "🏫": "travel school", "🏬": "travel department store", "🏭": "travel factory", "⛪": "travel church", "🕌": "travel mosque", "🛕": "travel hindu temple", "🕍": "travel synagogue", "⛩️": "travel shinto shrine", "🪞": "travel mirror", "🪟": "travel window", "🛗": "travel elevator", "🚪": "travel door", "🛋️": "travel couch and lamp", "🪑": "travel chair", "🚽": "travel toilet", "🪠": "travel plunger", "🚿": "travel shower", "🛁": "travel bathtub", "⛲": "travel fountain", "⛺": "travel tent", "🌁": "travel foggy", "🌃": "travel night with stars", "🌄": "travel sunrise over mountains", "🌅": "travel sunrise", "🌆": "travel cityscape at dusk", "🌇": "travel sunset over buildings", "🌉": "travel bridge at night", "♨️": "travel hot springs", "🎠": "travel carousel horse", "🎡": "travel ferris wheel", "🎢": "travel roller coaster", "🎪": "travel circus tent", "☀️": "travel black sun with rays weather sunny hot daylight warmth summer ray sunshine", "🌤️": "travel white sun with small cloud", "⛅": "travel sun behind cloud", "🌥️": "travel white sun behind cloud", "☁️": "travel cloud", "🌦️": "travel white sun behind cloud with rain", "🌧️": "travel cloud with rain rainy weather storm wet water drops umbrella drizzle", "⛈️": "travel thunder cloud and rain", "🌩️": "travel cloud with lightning", "🌨️": "travel cloud with snow", "❄️": "travel snowflake snow cold winter frozen ice weather christmas chilly frosty", "☃️": "travel snowman", "⛄": "travel snowman without snow", "🌬️": "travel wind blowing face", "💨": "travel dash symbol", "🌀": "travel cyclone", "🌈": "travel rainbow", "🌂": "travel closed umbrella", "☂️": "travel umbrella", "🔥": "travel fire flame hot trend lit hype warm burn trending viral", "💧": "travel droplet", "🌊": "travel water wave", "⚡": "travel high voltage sign lightning bolt electricity thunder flash energy power fast electric shock storm volt", "🌙": "travel crescent moon night evening sleep dream dark midnight bedtime starry", "🌟": "travel glowing star shine bright favorite rating celebration sparkle magic", "⭐": "travel white medium star favorite rate rating yellow gold night space cosmic", "🌠": "travel shooting star", "⌚": "objects watch", "📱": "objects mobile phone smartphone iphone android call screen device tech", "💻": "objects personal computer laptop macbook pc work code coding developer tech software programming", "⌨️": "objects keyboard", "🖥️": "objects desktop computer", "🖨️": "objects printer", "🖱️": "objects three button mouse", "🖲️": "objects trackball", "💽": "objects minidisc", "💾": "objects floppy disk", "💿": "objects optical disc", "📀": "objects dvd", "📷": "objects camera", "📸": "objects camera with flash", "📹": "objects video camera", "🎥": "objects movie camera cinema film video recording show", "📽️": "objects film projector", "🎞️": "objects film frames", "📞": "objects telephone receiver", "☎️": "objects black telephone", "📟": "objects pager", "📠": "objects fax machine", "📺": "objects television", "📻": "objects radio", "⏰": "objects alarm clock time timer countdown wake alert morning deadline", "⏱️": "objects stopwatch timer countdown time sport race lap speed", "⏲️": "objects timer clock", "🕰️": "objects mantelpiece clock", "⌛": "objects hourglass done sand time timer countdown expired finish", "⏳": "objects hourglass with flowing sand time countdown timer waiting patience remaining", "🔋": "objects battery", "🔌": "objects electric plug", "💡": "objects electric light bulb idea smart think brainstorm innovation create creative", "🔦": "objects electric torch", "🕯️": "objects candle", "🪔": "objects diya lamp", "🧯": "objects fire extinguisher", "🛢️": "objects oil drum", "💸": "objects money with wings", "💵": "objects banknote with dollar sign cash money paper bill usd pay greenback", "💴": "objects banknote with yen sign", "💶": "objects banknote with euro sign cash money bill eur europe pay", "💷": "objects banknote with pound sign", "🪙": "objects coin", "💳": "objects credit card", "💰": "objects money bag rich dollar cash wealth currency finance bank pay profit jackpot", "💎": "objects gem stone diamond jewel rich crystal expensive ring luxury", "🪬": "objects hamsa", "⚖️": "objects scales", "🪜": "objects ladder", "🧰": "objects toolbox", "🪛": "objects screwdriver", "🔧": "objects wrench", "🔨": "objects hammer", "⚒️": "objects hammer and pick", "🛠️": "objects hammer and wrench", "⛏️": "objects pick", "🪚": "objects carpentry saw", "🔩": "objects nut and bolt", "⚙️": "objects gear", "🪤": "objects mouse trap", "🪣": "objects bucket", "⛓️": "objects chains", "⛓️‍💥": "objects chains collision symbol", "🔫": "objects pistol", "💣": "objects bomb", "🪓": "objects axe", "🔪": "objects hocho", "🗡️": "objects dagger knife", "⚔️": "objects crossed swords", "🛡️": "objects shield", "🚬": "objects smoking symbol", "⚰️": "objects coffin", "🪦": "objects headstone", "⚱️": "objects funeral urn", "🏺": "objects amphora", "🔮": "objects crystal ball", "📿": "objects prayer beads", "🧿": "objects nazar amulet", "💈": "objects barber pole", "⚗️": "objects alembic", "🔭": "objects telescope", "🔬": "objects microscope", "🧪": "objects test tube", "🧫": "objects petri dish", "🧬": "objects dna double helix", "🩺": "objects stethoscope doctor medical medicine health hospital nurse checkup clinic", "🩹": "objects adhesive bandage", "💊": "objects pill capsule medicine drug pharmacy health medical doctor cure treatment", "💉": "objects syringe vaccine injection needle medical medicine doctor hospital clinic shot blood", "🩸": "objects drop of blood", "🩻": "objects x-ray", "🩼": "objects crutch", "🪮": "objects hair pick", "🧴": "objects lotion bottle", "🧼": "objects bar of soap", "🫧": "objects bubbles", "🪥": "objects toothbrush", "🧽": "objects sponge", "🧹": "objects broom", "🧺": "objects basket", "🧻": "objects roll of paper", "🪒": "objects razor", "🧷": "objects safety pin", "🧢": "objects billed cap", "🎩": "objects top hat", "🎓": "objects graduation cap graduate university degree school college student diploma study", "⛑️": "objects helmet with white cross", "👒": "objects womans hat", "🪖": "objects military helmet", "👑": "objects crown", "💍": "objects ring wedding diamond propose proposal engagement marriage anniversary married", "💄": "objects lipstick", "👜": "objects handbag", "👛": "objects purse", "💼": "objects briefcase", "🛍️": "objects shopping bags mall store gift boutique fashion purchase buyer", "🎒": "objects school satchel", "🧳": "objects luggage", "👓": "objects eyeglasses", "🕶️": "objects dark sunglasses", "🥽": "objects goggles", "🥼": "objects lab coat", "🦺": "objects safety vest", "👗": "objects dress", "👘": "objects kimono", "🥻": "objects sari", "🩱": "objects one-piece swimsuit", "🩲": "objects briefs", "🩳": "objects shorts", "👙": "objects bikini", "👚": "objects womans clothes", "👔": "objects necktie", "👕": "objects t-shirt", "🧥": "objects coat", "🧤": "objects gloves", "🧣": "objects scarf", "🧦": "objects socks", "👞": "objects mans shoe", "👟": "objects athletic shoe", "🥾": "objects hiking boot", "🥿": "objects flat shoe", "👠": "objects high-heeled shoe", "👡": "objects womans sandal", "🩰": "objects ballet shoes", "👢": "objects womans boots", "✂️": "objects black scissors", "🖊️": "objects lower left ballpoint pen", "🖋️": "objects lower left fountain pen", "✒️": "objects black nib", "🖌️": "objects lower left paintbrush", "🖍️": "objects lower left crayon", "✏️": "objects pencil", "📝": "objects memo", "🔍": "objects left-pointing magnifying glass", "🔎": "objects right-pointing magnifying glass", "🔏": "objects lock with ink pen", "🔒": "objects lock", "🔓": "objects open lock", "🔑": "objects key", "🗝️": "objects old key", "🔔": "objects bell", "🔕": "objects bell with cancellation stroke", "📢": "objects public address loudspeaker", "📣": "objects cheering megaphone", "📯": "objects postal horn", "🔈": "objects speaker", "🔉": "objects speaker with one sound wave", "🔊": "objects speaker with three sound waves", "📡": "objects satellite antenna", "🪫": "objects low battery", "📦": "objects package", "📫": "objects closed mailbox with raised flag", "📪": "objects closed mailbox with lowered flag", "📬": "objects open mailbox with raised flag", "📭": "objects open mailbox with lowered flag", "📮": "objects postbox", "🗳️": "objects ballot box with", "✉️": "objects envelope", "📧": "objects e-mail symbol", "📨": "objects incoming envelope", "📩": "objects envelope with downwards arrow above", "📥": "objects inbox tray", "📤": "objects outbox tray", "📜": "objects scroll", "📃": "objects page with curl", "📄": "objects page facing up", "📑": "objects bookmark tabs", "🗒️": "objects spiral note pad", "🗓️": "objects spiral calendar pad", "📅": "objects calendar date schedule event reminder day month year time agenda planner", "📆": "objects tear-off calendar date schedule day time reminder", "📇": "objects card index", "📈": "objects chart with upwards trend", "📉": "objects chart with downwards trend", "📊": "objects bar chart", "📋": "objects clipboard", "📌": "objects pushpin", "📍": "objects round pushpin", "📎": "objects paperclip", "🖇️": "objects linked paperclips", "📏": "objects straight ruler", "📐": "objects triangular ruler", "🗑️": "objects wastebasket", "📰": "objects newspaper", "🗞️": "objects rolled-up newspaper", "📓": "objects notebook", "📔": "objects notebook with decorative cover", "📒": "objects ledger", "📕": "objects closed book", "📗": "objects green book", "📘": "objects blue book", "📙": "objects orange book", "📚": "objects books study school library reading read learn exam education knowledge course", "🔖": "objects bookmark", "🏷️": "objects label", "🗃️": "objects card file box", "🗄️": "objects file cabinet", "🗂️": "objects card index dividers", "📁": "objects file folder", "📂": "objects open file folder", "🧮": "objects abacus", "🪪": "objects identification card", "🧾": "objects receipt", "🧲": "objects magnet", "❤️": "symbols heavy black heart love romance valentine red like favorite kiss passion", "🧡": "symbols orange heart", "💛": "symbols yellow heart", "💚": "symbols green heart", "💙": "symbols blue heart", "🩵": "symbols light blue heart", "💜": "symbols purple heart", "🖤": "symbols black heart", "🤍": "symbols white heart", "🤎": "symbols brown heart", "🩷": "symbols pink heart", "🩶": "symbols grey heart", "💔": "symbols broken heart", "❣️": "symbols heavy heart exclamation mark ornament", "💕": "symbols two hearts", "💞": "symbols revolving hearts", "💓": "symbols beating heart", "💗": "symbols growing heart", "💖": "symbols sparkling heart", "💘": "symbols heart with arrow", "💝": "symbols heart with ribbon", "💟": "symbols heart decoration", "☮️": "symbols peace symbol", "✝️": "symbols latin cross", "☪️": "symbols star and crescent", "🕉️": "symbols om symbol", "☸️": "symbols wheel of dharma", "🔯": "symbols six pointed star with middle dot", "🕎": "symbols menorah with nine branches", "☯️": "symbols yin yang", "☢️": "symbols radioactive sign", "☣️": "symbols biohazard sign", "♈": "symbols aries", "♉": "symbols taurus", "♊": "symbols gemini", "♋": "symbols cancer", "♌": "symbols leo", "♍": "symbols virgo", "♎": "symbols libra", "♏": "symbols scorpius", "♐": "symbols sagittarius", "♑": "symbols capricorn", "♒": "symbols aquarius", "♓": "symbols pisces", "⛎": "symbols ophiuchus", "🆔": "symbols squared id", "⚠️": "symbols warning sign", "🚸": "symbols children crossing", "⛔": "symbols no entry", "🚫": "symbols no entry sign", "❌": "symbols cross mark", "⭕": "symbols heavy large circle", "✅": "symbols white heavy check mark", "☑️": "symbols ballot box with check", "✔️": "symbols heavy check mark", "❗": "symbols heavy exclamation mark symbol", "❓": "symbols black question mark ornament", "‼️": "symbols double exclamation mark", "⁉️": "symbols exclamation question mark", "🔴": "symbols large red circle", "🟠": "symbols large orange circle", "🟡": "symbols large yellow circle", "🟢": "symbols large green circle", "🔵": "symbols large blue circle", "🟣": "symbols large purple circle", "🟤": "symbols large brown circle", "⚫": "symbols medium black circle", "⚪": "symbols medium white circle", "🔶": "symbols large orange diamond", "🔷": "symbols large blue diamond", "🔸": "symbols small orange diamond", "🔹": "symbols small blue diamond", "🔺": "symbols up-pointing red triangle", "🔻": "symbols down-pointing red triangle", "💠": "symbols diamond shape with a dot inside", "🔘": "symbols radio button", "🔲": "symbols black square button", "🔳": "symbols white square button", "⬛": "symbols black large square", "⬜": "symbols white large square", "◼️": "symbols black medium square", "◻️": "symbols white medium square", "◾": "symbols black medium small square", "◽": "symbols white medium small square", "▪️": "symbols black small square", "▫️": "symbols white small square", "⬆️": "symbols upwards black arrow", "↗️": "symbols north east arrow", "➡️": "symbols black rightwards arrow", "↘️": "symbols south east arrow", "⬇️": "symbols downwards black arrow", "↙️": "symbols south west arrow", "⬅️": "symbols leftwards black arrow", "↖️": "symbols north west arrow", "↕️": "symbols up down arrow", "↔️": "symbols left right arrow", "↩️": "symbols leftwards arrow with hook", "↪️": "symbols rightwards arrow with hook", "⤴️": "symbols arrow pointing rightwards then curving upwards", "⤵️": "symbols arrow pointing rightwards then curving downwards", "🔀": "symbols twisted rightwards arrows", "🔁": "symbols clockwise rightwards and leftwards open circle arrows", "🔂": "symbols clockwise rightwards and leftwards open circle arrows with circled one overlay", "▶️": "symbols black right-pointing triangle", "⏩": "symbols black right-pointing double triangle", "⏭️": "symbols black right-pointing double triangle with vertical bar", "⏯️": "symbols black right-pointing triangle with double vertical bar", "◀️": "symbols black left-pointing triangle", "⏪": "symbols black left-pointing double triangle", "⏮️": "symbols black left-pointing double triangle with vertical bar", "🔼": "symbols up-pointing small red triangle", "⏫": "symbols black up-pointing double triangle", "🔽": "symbols down-pointing small red triangle", "⏬": "symbols black down-pointing double triangle", "⏸️": "symbols double vertical bar", "⏹️": "symbols black square for stop", "⏺️": "symbols black circle for record", "⏏️": "symbols eject symbol", "🎦": "symbols cinema", "🔅": "symbols low brightness symbol", "🔆": "symbols high brightness symbol", "📶": "symbols antenna with bars", "📳": "symbols vibration mode", "📴": "symbols mobile phone off", "📵": "symbols no mobile phones", "🆒": "symbols squared cool", "🆓": "symbols squared free", "🆕": "symbols squared new", "🆙": "symbols squared up with exclamation mark", "🆗": "symbols squared ok", "🆖": "symbols squared ng", "🆘": "symbols squared sos", "🆚": "symbols squared vs", "🆛": "symbols squared three d", "🆜": "symbols squared second screen", "🈶": "symbols squared cjk unified ideograph-6709", "🈯": "symbols squared cjk unified ideograph-6307", "🉐": "symbols circled ideograph advantage", "🈹": "symbols squared cjk unified ideograph-5272", "🈚": "symbols squared cjk unified ideograph-7121", "🈲": "symbols squared cjk unified ideograph-7981", "🉑": "symbols circled ideograph accept", "🈸": "symbols squared cjk unified ideograph-7533", "🈺": "symbols squared cjk unified ideograph-55b6", "🈷️": "symbols squared cjk unified ideograph-6708", "✴️": "symbols eight pointed black star", "㊙️": "symbols circled ideograph secret", "㊗️": "symbols circled ideograph congratulation", "🔟": "symbols keycap ten", "🔠": "symbols input symbol for latin capital letters", "🔡": "symbols input symbol for latin small letters", "🔢": "symbols input symbol for numbers", "🔣": "symbols input symbol for", "🔤": "symbols input symbol for latin letters", "🅰️": "symbols negative squared latin capital letter a", "🅱️": "symbols negative squared latin capital letter b", "🆎": "symbols negative squared ab", "🅾️": "symbols negative squared latin capital letter o", "〰️": "symbols wavy dash", "➰": "symbols curly loop", "➿": "symbols double curly loop", "🔃": "symbols clockwise downwards and upwards open circle arrows", "🔄": "symbols anticlockwise downwards and upwards open circle arrows", "🔙": "symbols back with leftwards arrow above", "🔚": "symbols end with leftwards arrow above", "🔛": "symbols on with exclamation mark left right arrow above", "🔜": "symbols soon with rightwards arrow above", "🔝": "symbols top with upwards arrow above", "🛐": "symbols place of worship", "⚛️": "symbols atom symbol", "♾️": "symbols permanent paper sign", "©️": "symbols copyright sign", "®️": "symbols registered sign", "™️": "symbols trade mark sign", "✳️": "symbols eight spoked asterisk", "❇️": "symbols sparkle", "💯": "symbols hundred points symbol", "🔱": "symbols trident emblem", "📛": "symbols name badge", "🔰": "symbols japanese symbol for beginner", "❎": "symbols negative squared cross mark", "🏁": "symbols chequered flag", "🏳️": "flags waving white flag", "🏴": "flags waving black flag", "🚩": "flags triangular flag on post", "🏳️‍🌈": "flags waving white flag rainbow", "🏳️‍⚧️": "flags waving white flag male with stroke and female sign", "🏴‍☠️": "flags waving black flag skull and crossbones", "🇦🇨": "flags flag ac", "🇦🇩": "flags flag andorra", "🇦🇪": "flags flag united arab emirates uae dubai", "🇦🇫": "flags flag afghanistan", "🇦🇬": "flags flag antigua and barbuda", "🇦🇮": "flags flag ai", "🇦🇱": "flags flag albania", "🇦🇲": "flags flag armenia", "🇦🇴": "flags flag angola", "🇦🇶": "flags flag aq", "🇦🇷": "flags flag argentina", "🇦🇸": "flags flag as", "🇦🇹": "flags flag austria", "🇦🇺": "flags flag australia", "🇦🇼": "flags flag aw", "🇦🇽": "flags flag ax", "🇦🇿": "flags flag azerbaijan", "🇧🇦": "flags flag bosnia herzegovina", "🇧🇧": "flags flag barbados", "🇧🇩": "flags flag bangladesh", "🇧🇪": "flags flag belgium", "🇧🇫": "flags flag burkina faso", "🇧🇬": "flags flag bulgaria", "🇧🇭": "flags flag bahrain", "🇧🇮": "flags flag burundi", "🇧🇯": "flags flag benin", "🇧🇱": "flags flag bl", "🇧🇲": "flags flag bermuda", "🇧🇳": "flags flag brunei", "🇧🇴": "flags flag bolivia", "🇧🇶": "flags flag bq", "🇧🇷": "flags flag brazil", "🇧🇸": "flags flag bahamas", "🇧🇹": "flags flag bhutan", "🇧🇻": "flags flag bv", "🇧🇼": "flags flag botswana", "🇧🇾": "flags flag belarus", "🇧🇿": "flags flag belize", "🇨🇦": "flags flag canada", "🇨🇨": "flags flag cc", "🇨🇩": "flags flag cd", "🇨🇫": "flags flag cf", "🇨🇬": "flags flag cg", "🇨🇭": "flags flag switzerland", "🇨🇮": "flags flag ci", "🇨🇰": "flags flag ck", "🇨🇱": "flags flag chile", "🇨🇲": "flags flag cameroon", "🇨🇳": "flags flag china", "🇨🇴": "flags flag colombia", "🇨🇵": "flags flag cp", "🇨🇷": "flags flag costa rica", "🇨🇺": "flags flag cuba", "🇨🇻": "flags flag cv", "🇨🇼": "flags flag cw", "🇨🇽": "flags flag cx", "🇨🇾": "flags flag cyprus", "🇨🇿": "flags flag czech republic czechia", "🇩🇪": "flags flag germany deutschland", "🇩🇬": "flags flag dg", "🇩🇯": "flags flag djibouti", "🇩🇰": "flags flag denmark", "🇩🇲": "flags flag dominica", "🇩🇴": "flags flag dominican republic", "🇩🇿": "flags flag algeria", "🇪🇦": "flags flag ea", "🇪🇨": "flags flag ecuador", "🇪🇪": "flags flag estonia", "🇪🇬": "flags flag egypt", "🇪🇭": "flags flag eh", "🇪🇷": "flags flag er", "🇪🇸": "flags flag spain espana", "🇪🇹": "flags flag ethiopia", "🇪🇺": "flags flag european union europe", "🇫🇮": "flags flag finland", "🇫🇯": "flags flag fiji", "🇫🇰": "flags flag fk", "🇫🇲": "flags flag fm", "🇫🇴": "flags flag fo", "🇫🇷": "flags flag france", "🇬🇦": "flags flag gabon", "🇬🇧": "flags flag united kingdom uk great britain england london", "🇬🇩": "flags flag gd", "🇬🇪": "flags flag georgia", "🇬🇫": "flags flag gf", "🇬🇬": "flags flag gg", "🇬🇭": "flags flag ghana", "🇬🇮": "flags flag gi", "🇬🇱": "flags flag gl", "🇬🇲": "flags flag gambia", "🇬🇳": "flags flag guinea", "🇬🇵": "flags flag gp", "🇬🇶": "flags flag gq", "🇬🇷": "flags flag greece", "🇬🇸": "flags flag gs", "🇬🇹": "flags flag guatemala", "🇬🇺": "flags flag gu", "🇬🇼": "flags flag gw", "🇬🇾": "flags flag gy", "🇭🇰": "flags flag hk", "🇭🇲": "flags flag hm", "🇭🇳": "flags flag honduras", "🇭🇷": "flags flag croatia", "🇭🇹": "flags flag haiti", "🇭🇺": "flags flag hungary", "🇮🇨": "flags flag ic", "🇮🇩": "flags flag indonesia", "🇮🇪": "flags flag ireland", "🇮🇱": "flags flag israel", "🇮🇲": "flags flag im", "🇮🇳": "flags flag india", "🇮🇴": "flags flag io", "🇮🇶": "flags flag iraq", "🇮🇷": "flags flag iran", "🇮🇸": "flags flag iceland", "🇮🇹": "flags flag italy italia", "🇯🇪": "flags flag je", "🇯🇲": "flags flag jamaica", "🇯🇴": "flags flag jordan", "🇯🇵": "flags flag japan tokyo", "🇰🇪": "flags flag kenya", "🇰🇬": "flags flag kg", "🇰🇭": "flags flag kh", "🇰🇮": "flags flag ki", "🇰🇲": "flags flag km", "🇰🇳": "flags flag kn", "🇰🇵": "flags flag kp", "🇰🇷": "flags flag south korea seoul", "🇰🇼": "flags flag kuwait", "🇰🇾": "flags flag ky", "🇰🇿": "flags flag kazakhstan", "🇱🇦": "flags flag la", "🇱🇧": "flags flag lebanon", "🇱🇨": "flags flag lc", "🇱🇮": "flags flag liechtenstein", "🇱🇰": "flags flag sri lanka", "🇱🇷": "flags flag lr", "🇱🇸": "flags flag ls", "🇱🇹": "flags flag lithuania", "🇱🇺": "flags flag luxembourg", "🇱🇻": "flags flag latvia", "🇱🇾": "flags flag ly", "🇲🇦": "flags flag morocco", "🇲🇨": "flags flag monaco", "🇲🇩": "flags flag moldova", "🇲🇪": "flags flag montenegro", "🇲🇫": "flags flag mf", "🇲🇬": "flags flag madagascar", "🇲🇭": "flags flag mh", "🇲🇰": "flags flag north macedonia", "🇲🇱": "flags flag mali", "🇲🇲": "flags flag mm", "🇲🇳": "flags flag mongolia", "🇲🇴": "flags flag mo", "🇲🇵": "flags flag mp", "🇲🇶": "flags flag mq", "🇲🇷": "flags flag mr", "🇲🇸": "flags flag ms", "🇲🇹": "flags flag malta", "🇲🇺": "flags flag mu", "🇲🇻": "flags flag mv", "🇲🇼": "flags flag mw", "🇲🇽": "flags flag mexico", "🇲🇾": "flags flag malaysia", "🇲🇿": "flags flag mozambique", "🇳🇦": "flags flag namibia", "🇳🇨": "flags flag nc", "🇳🇪": "flags flag niger", "🇳🇫": "flags flag nf", "🇳🇬": "flags flag nigeria", "🇳🇮": "flags flag ni", "🇳🇱": "flags flag netherlands holland amsterdam", "🇳🇴": "flags flag norway", "🇳🇵": "flags flag nepal", "🇳🇷": "flags flag nr", "🇳🇺": "flags flag nu", "🇳🇿": "flags flag new zealand", "🇴🇲": "flags flag oman", "🇵🇦": "flags flag panama", "🇵🇪": "flags flag peru", "🇵🇫": "flags flag pf", "🇵🇬": "flags flag pg", "🇵🇭": "flags flag philippines", "🇵🇰": "flags flag pakistan", "🇵🇱": "flags flag poland", "🇵🇲": "flags flag pm", "🇵🇳": "flags flag pn", "🇵🇷": "flags flag pr", "🇵🇸": "flags flag ps", "🇵🇹": "flags flag portugal", "🇵🇼": "flags flag pw", "🇵🇾": "flags flag paraguay", "🇶🇦": "flags flag qatar", "🇷🇪": "flags flag re", "🇷🇴": "flags flag romania", "🇷🇸": "flags flag serbia", "🇷🇺": "flags flag russia moscow", "🇷🇼": "flags flag rw", "🇸🇦": "flags flag saudi arabia", "🇸🇧": "flags flag sb", "🇸🇨": "flags flag sc", "🇸🇩": "flags flag sd", "🇸🇪": "flags flag sweden", "🇸🇬": "flags flag singapore", "🇸🇭": "flags flag sh", "🇸🇮": "flags flag slovenia", "🇸🇯": "flags flag sj", "🇸🇰": "flags flag slovakia", "🇸🇱": "flags flag sl", "🇸🇲": "flags flag san marino", "🇸🇳": "flags flag senegal", "🇸🇴": "flags flag somalia", "🇸🇷": "flags flag sr", "🇸🇸": "flags flag ss", "🇸🇹": "flags flag st", "🇸🇻": "flags flag sv", "🇸🇽": "flags flag sx", "🇸🇾": "flags flag sy", "🇸🇿": "flags flag sz", "🇹🇦": "flags flag ta", "🇹🇨": "flags flag tc", "🇹🇩": "flags flag td", "🇹🇫": "flags flag tf", "🇹🇬": "flags flag tg", "🇹🇭": "flags flag thailand bangkok", "🇹🇯": "flags flag tj", "🇹🇰": "flags flag tk", "🇹🇱": "flags flag tl", "🇹🇲": "flags flag tm", "🇹🇳": "flags flag tunisia", "🇹🇴": "flags flag to", "🇹🇷": "flags flag turkey turkiye istanbul", "🇹🇹": "flags flag tt", "🇹🇻": "flags flag tv", "🇹🇼": "flags flag tw", "🇹🇿": "flags flag tz", "🇺🇦": "flags flag ukraine", "🇺🇬": "flags flag uganda", "🇺🇲": "flags flag um", "🇺🇳": "flags flag united nations", "🇺🇸": "flags flag united states usa america american", "🇺🇾": "flags flag uruguay", "🇺🇿": "flags flag uzbekistan", "🇻🇦": "flags flag vatican holy see", "🇻🇨": "flags flag vc", "🇻🇪": "flags flag venezuela", "🇻🇬": "flags flag vg", "🇻🇮": "flags flag vi", "🇻🇳": "flags flag vietnam", "🇻🇺": "flags flag vu", "🇼🇫": "flags flag wf", "🇼🇸": "flags flag ws", "🇽🇰": "flags flag xk", "🇾🇪": "flags flag ye", "🇾🇹": "flags flag yt", "🇿🇦": "flags flag south africa", "🇿🇲": "flags flag zm", "🇿🇼": "flags flag zimbabwe", "🏴󠁧󠁢󠁥󠁮󠁧󠁿": "flags waving black flag tag latin small letter g b e n cancel", "🏴󠁧󠁢󠁳󠁣󠁴󠁿": "flags waving black flag tag latin small letter g b s c t cancel", "🏴󠁧󠁢󠁷󠁬󠁳󠁿": "flags waving black flag tag latin small letter g b w l s cancel"};

    const placeholders = [
        "Spider-Man 4 Premiere", "Elder Scrolls VI", "New Daft Punk Album",
        "Stranger Things Season 5", "Batman: Part II", "BioShock 4",
        "Gorillaz New Tour", "The Last of Us Season 3", "Avatar 3 Release",
        "Metal Gear Solid Delta", "Radiohead New Album", "Black Mirror Season 7",
        "Joker: Folie à Deux", "Final Fantasy XVII", "Tool New Single",
        "Euphoria Season 3", "Superman: Legacy", "Hollow Knight: Silksong",
        "Kendrick Lamar Album", "House of the Dragon S3", "OwO", "UwU", "Nwn"
    ];

    const completionMessages = [
        "Mission Accomplished", "Victory Royale", "Game Over", "Time's Up!", "The End",
        "Zero Hour", "Level Complete", "Quest Finished", "Finale",
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

    // Setting up BroadcastChannel for cross-tab synchronization
    const countdownChannel = new BroadcastChannel('countdown_sync_channel');
    
    countdownChannel.onmessage = (event) => {
        if (event.data === 'RELOAD_COUNTDOWNS') {
            loadCountdowns();
        }
    };

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
            countdownChannel.postMessage('RELOAD_COUNTDOWNS');
        } catch (e) {
            console.error('Error saving data', e);
        }
    }

    // Send System Notification
    /**
     * Send a signal to the server to trigger a Nextcloud system notification (the Bell)
     * @param {string} name 
     */
    async function triggerNotification(name) {
        // 1. Android Native Bridge (Immediate mobile notification if running in app)
        if (window.CountdownJsBridge) {
            try {
                window.CountdownJsBridge.triggerNotification(name);
                console.log("Android Bridge notification triggered for:", name);
            } catch (e) {
                console.warn("Android Bridge failed", e);
            }
        }

        // 2. Server Notification (Nextcloud Bell / Push)
        try {
            await fetch(notifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'requesttoken': OC.requestToken
                },
                body: JSON.stringify({ name: name })
            });
            console.log("Server notification triggered for:", name);
        } catch (e) {
            console.error('Error sending server notification', e);
            // Fallback: try simple POST if JSON fails
            try {
                await fetch(notifyUrl, {
                    method: 'POST',
                    headers: { 'requesttoken': OC.requestToken }
                });
            } catch(e2) {}
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
    function renderEmojiItems(emojiList) {
        emojiGrid.innerHTML = '';
        if (!emojiList || emojiList.length === 0) {
            emojiGrid.innerHTML = '<div class="emoji-empty-state">No emojis found</div>';
            return;
        }
        emojiList.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-item';
            btn.textContent = emoji;
            btn.type = 'button';
            btn.onclick = () => {
                emojiTrigger.textContent = emoji;
                emojiPicker.classList.add('hidden');
                resetEmojiSearch();
            };
            emojiGrid.appendChild(btn);
        });
    }

    function renderEmojiCategory(category) {
        const emojis = EMOJI_DATA[category] || [];
        renderEmojiItems(emojis);
    }

    function searchEmojis(query) {
        const q = (query || '').toLowerCase().trim();
        if (!q) {
            if (emojiSearchClear) emojiSearchClear.classList.add('hidden');
            const activeBtn = document.querySelector('.cat-btn.active') || catBtns[0];
            if (activeBtn) renderEmojiCategory(activeBtn.dataset.cat);
            return;
        }
        if (emojiSearchClear) emojiSearchClear.classList.remove('hidden');

        const matched = [];
        for (const [emoji, keywords] of Object.entries(EMOJI_KEYWORDS)) {
            if (keywords.includes(q)) {
                matched.push(emoji);
            }
        }
        renderEmojiItems(matched);
    }

    function resetEmojiSearch() {
        if (emojiSearchInput) {
            emojiSearchInput.value = '';
            if (emojiSearchClear) emojiSearchClear.classList.add('hidden');
        }
    }

    if (emojiSearchInput) {
        emojiSearchInput.addEventListener('input', (e) => {
            searchEmojis(e.target.value);
        });
        emojiSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                if (emojiSearchInput.value) {
                    resetEmojiSearch();
                    searchEmojis('');
                } else {
                    emojiPicker.classList.add('hidden');
                }
            }
        });
    }

    if (emojiSearchClear) {
        emojiSearchClear.addEventListener('click', (e) => {
            e.stopPropagation();
            resetEmojiSearch();
            searchEmojis('');
            emojiSearchInput.focus();
        });
    }

    emojiTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const willShow = emojiPicker.classList.contains('hidden');
        emojiPicker.classList.toggle('hidden');
        if (willShow) {
            resetEmojiSearch();
            catBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
            renderEmojiCategory('faces');
            setTimeout(() => {
                if (emojiSearchInput) emojiSearchInput.focus();
            }, 50);
        }
    });

    catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetEmojiSearch();
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
        if (repeatToggle.checked) {
            customRepeatGroup.classList.toggle('hidden', repeatType.value !== 'custom');
            yearlyRepeatGroup.classList.toggle('hidden', repeatType.value !== 'yearly');
        }
    });

    repeatType.addEventListener('change', () => {
        customRepeatGroup.classList.toggle('hidden', repeatType.value !== 'custom');
        yearlyRepeatGroup.classList.toggle('hidden', repeatType.value !== 'yearly');
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
        yearlyRepeatGroup.classList.add('hidden');
        startingYearInput.value = '';
        modal.classList.remove('hidden');
    });

    function closeAllModals() {
        modal.classList.add('hidden');
        infoModal.classList.add('hidden');
        emojiPicker.classList.add('hidden');
        resetEmojiSearch();
        if (newsModal) newsModal.classList.add('hidden');
        if (deleteModal) deleteModal.classList.add('hidden');
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
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeAllModals);

    // Close on overlay click
    [modal, infoModal, newsModal, deleteModal].forEach(ov => {
        if (ov) {
            ov.addEventListener('click', (e) => {
                if (e.target === ov) {
                    closeAllModals();
                }
            });
        }
    });

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (countdownToDelete) {
                countdowns = countdowns.filter(item => item.id !== countdownToDelete);
                renderCountdowns();
                saveCountdowns();
                countdownToDelete = null;
                showAppNotification('Countdown deleted successfully! 🗑️');
            }
            closeAllModals();
        });
    }

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

        const isYearly = repeatToggle.checked && repeatType.value === 'yearly';
        const startingYearVal = isYearly ? (parseInt(startingYearInput.value, 10) || null) : null;

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
                    startingYear: startingYearVal,
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
                startingYear: startingYearVal,
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
            let msg = "Completed";

            if (msgType === 'random' && typeof completionMessages !== 'undefined' && completionMessages.length > 0) {
                const numericId = Number(cd.id) || 0;
                msg = completionMessages[numericId % completionMessages.length];
            } else if (msgType === 'custom' && customMsg.trim() !== '') {
                msg = customMsg.trim();
            }
            
            timerElement.innerHTML = `<div class="completed-box"><div class="completed-text">${msg}</div></div>`;
            if (!cd.notified) { // Celebration fires the first time the expired event is viewed
                let milestoneTag = '';
                if (cd.repeat === 'yearly' && cd.startingYear) {
                    const milestone = calculateMilestone(cd.startingYear, cd.targetDate);
                    if (milestone) milestoneTag = ` (${milestone.text})`;
                }

                // 1. Show in-app interactive toast (Always works while tab is open)
                showAppNotification(`🎉 ${cd.name}${milestoneTag} is finished!`);

                // 2. Show native browser notification (Might be blocked by browser without user gesture)
                if ("Notification" in window && Notification.permission === "granted") {
                    try {
                        const notif = new Notification("Countdown Finished! 🎉", {
                            body: `The timer "${cd.name}${milestoneTag}" has completed!`,
                            icon: OC.generateUrl('/apps/countdown/img/app.svg'),
                            requireInteraction: true
                        });
                        
                        notif.onclick = () => {
                            window.focus();
                            notif.close();
                        };
                    } catch (err) {
                        console.warn("new Notification() blocked or not supported.", err);
                        // Fallback to service worker if one was registered (PWA mode)
                        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                            navigator.serviceWorker.ready.then(function(registration) {
                                registration.showNotification("Countdown Finished! 🎉", {
                                    body: `The timer "${cd.name}${milestoneTag}" has completed!`,
                                    icon: OC.generateUrl('/apps/countdown/img/app.svg'),
                                    tag: 'countdown-' + cd.id
                                });
                            }).catch(function(e) {});
                        }
                    }
                }

                cd.notified = true;
                triggerNotification(cd.name + milestoneTag);
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

    function getOrdinal(n) {
        const abs = Math.abs(n);
        const lastTwo = abs % 100;
        if (lastTwo >= 11 && lastTwo <= 13) return n + 'th';
        const lastOne = abs % 10;
        if (lastOne === 1) return n + 'st';
        if (lastOne === 2) return n + 'nd';
        if (lastOne === 3) return n + 'rd';
        return n + 'th';
    }

    function calculateMilestone(startingYear, targetDate) {
        if (!startingYear) return null;
        const yearNum = parseInt(startingYear, 10);
        if (isNaN(yearNum) || yearNum <= 0) return null;
        const eventYear = new Date(targetDate).getFullYear();
        const count = eventYear - yearNum;
        if (count > 0) {
            return {
                count,
                text: getOrdinal(count),
                startingYear: yearNum
            };
        }
        return null;
    }

    function renderCountdowns() {
        console.log('Rendering countdowns (Count:', countdowns.length, ')');
        intervals.forEach(id => clearInterval(id));
        intervals = [];
        grid.innerHTML = '';

        if (window.nativex && window.nativex.syncAlarms) {
            window.nativex.syncAlarms(JSON.stringify(countdowns));
        }

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

            const titleSpan = document.createElement('span');
            titleSpan.className = 'cd-title-text';
            titleSpan.textContent = cd.name;
            titleRow.appendChild(titleSpan);

            if (cd.repeat === 'yearly' && cd.startingYear) {
                const milestone = calculateMilestone(cd.startingYear, cd.targetDate);
                if (milestone) {
                    const badge = document.createElement('span');
                    badge.className = 'cd-milestone-badge';
                    badge.title = `Starting / Birth Year: ${milestone.startingYear}`;
                    badge.textContent = milestone.text;
                    titleRow.appendChild(badge);
                }
            }

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
                countdownToDelete = cd.id;
                if (deleteModal) deleteModal.classList.remove('hidden');
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
        yearlyRepeatGroup.classList.toggle('hidden', repeatType.value !== 'yearly' || !repeatToggle.checked);
        startingYearInput.value = cd.startingYear || '';

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

        if (cd.repeat === 'yearly' && cd.startingYear) {
            const milestone = calculateMilestone(cd.startingYear, cd.targetDate);
            if (milestone) {
                infoMilestone.textContent = `${milestone.text} (Starting Year: ${milestone.startingYear})`;
                if (infoMilestoneGroup) infoMilestoneGroup.classList.remove('hidden');
            } else {
                if (infoMilestoneGroup) infoMilestoneGroup.classList.add('hidden');
            }
        } else {
            if (infoMilestoneGroup) infoMilestoneGroup.classList.add('hidden');
        }
        
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
        console.log("%c--- COUNTDOWN APP INITIALIZED ---", "color: #3498db; font-size: 20px; font-weight: bold;");
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

        const reviewAppBtn = document.getElementById('pwa-review-btn');
        const updateAppButtons = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
            if (isStandalone) {
                // Running as PWA
                if (pwaBtn) pwaBtn.classList.add('hidden');
                if (reviewAppBtn) reviewAppBtn.classList.remove('hidden');
            } else if (deferredPrompt) {
                // Not installed yet, can be installed
                if (pwaBtn) pwaBtn.classList.remove('hidden');
                if (reviewAppBtn) reviewAppBtn.classList.add('hidden');
            } else {
                // Already installed or browser doesn't support PWA prompt
                // In this case, we show the Review button as the default
                if (pwaBtn) pwaBtn.classList.add('hidden');
                if (reviewAppBtn) reviewAppBtn.classList.remove('hidden');
            }
        };

        // Check on load
        updateAppButtons();

        // PWA Installation Logic
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            updateAppButtons();
        });

        window.addEventListener('appinstalled', (e) => {
            console.log('PWA was installed');
            deferredPrompt = null;
            updateAppButtons();
            launchConfetti(100);
            showAppNotification("App installed successfully! 🎉");
        });

        if (pwaBtn) {
            pwaBtn.addEventListener('click', async () => {
                if (!deferredPrompt) return;
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                deferredPrompt = null;
                updateAppButtons();
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
                    
                    // Simple Markdown parser for basic formatting
                    const parseMD = (text) => text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/_(.*?)_/g, '<em>$1</em>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/\n/g, '<br>');

                    article.innerHTML = `
                        <h3>${parseMD(item.title)}</h3>
                        <p>${parseMD(item.content)}</p>
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
