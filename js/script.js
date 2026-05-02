/**
 * Nextcloud Countdown Logic
 * Data saved via API (Nextcloud Backend DB)
 * Features: Edit, All Day, Particles and Notifications
 */

const NEWS_ARTICLES = [
    {
        title: "🚨Fixed System Notifications v2",
        content: "Notification system upgraded to utilize Nextcloud Background Jobs integration with system crontab. For more info read the [user documentation↗️](https://github.com/infinit7even/countdown/blob/master/README.md#how-notifications-work)."
    },
    {
        title: "🆕Custom Completion Messages",
        content: "Configurable completion messages with support for default presets, random selections, or personalized text."
    },
    {
        title: "🆕OCC Command Integration",
        content: "Command-line management for administrators. Supports listing, adding, and deleting countdowns, as well as manual notification checks."
    },
    {
        title: "🆕Collapsible Settings Panel",
        content: "Hideable settings panel on both mobile and desktop for an optimized workspace."
    },
    {
        title: "✅Three Layout Views",
        content: "Multiple display modes: Expanded (stacked), Grid (side-by-side), and Compact. Layout preferences are preserved across sessions."
    },
    {
        title: "✅Emoji Picker",
        content: "Integrated emoji support with a categorized picker. Allows selecting from hundreds of icons during countdown creation."
    },
    {
        title: "✅Smart Sorting",
        content: "Sorting capabilities by date, name, or creation order. Includes a directional toggle for ascending or descending results."
    },
    {
        title: "✅Recurrent Countdowns",
        content: "Support for automatic countdown restarts. Available intervals include daily, weekly, monthly, yearly, or custom day counts."
    },
    {
        title: "✅System Notifications",
        content: "Automated Nextcloud system notifications triggered upon countdown expiration."
    },
    {
        title: "✅Interactive Toast Notifications",
        content: "Sleek, interactive in-app toast notifications with click-to-dismiss support."
    },
    {
        title: "✅Confetti Celebrations",
        content: "Visual feedback via confetti bursts on save or expiration events. Includes a title-based interaction challenge."
    },
    {
        title: "✅Countdown Description Field",
        content: "Support for optional notes or context via a dedicated description field, viewable in the details panel."
    },
    {
        title: "✅PWA Install Support",
        content: "Direct Progressive Web App (PWA) installation from the settings panel for standalone home screen access."
    },
    {
        title: "✅ESC Key & Click-Outside to Close",
        content: "Global support for closing modals and panels via the ESC key or by clicking the backdrop."
    },
    {
        title: "✅Keyboard Accessibility",
        content: "Full keyboard navigation support for all interactive elements, enhanced by high-visibility focus highlights."
    },
    {
        title: "✅Dashboard Widget",
        content: "Seamless integration with the Nextcloud Dashboard via a dedicated summary widget."
    },
    {
        title: "✅Theme-Aware Design",
        content: "Full compatibility with Nextcloud light, dark, and accessibility themes."
    },
    {
        title: "✅Mobile-First Responsive Layout",
        content: "Refined mobile experience featuring an adaptive header, responsive grid, and optimized modal windows."
    }
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
            let msg = "Completed";

            if (msgType === 'random' && typeof completionMessages !== 'undefined' && completionMessages.length > 0) {
                const numericId = Number(cd.id) || 0;
                msg = completionMessages[numericId % completionMessages.length];
            } else if (msgType === 'custom' && customMsg.trim() !== '') {
                msg = customMsg.trim();
            }
            
            timerElement.innerHTML = `<div class="completed-box"><div class="completed-text">${msg}</div></div>`;
            if (!cd.notified) { // Celebration fires the first time the expired event is viewed
                // 1. Show in-app interactive toast (Always works while tab is open)
                showAppNotification(`🎉 ${cd.name} is finished!`);

                // 2. Show native browser notification (Might be blocked by browser without user gesture)
                if ("Notification" in window && Notification.permission === "granted") {
                    try {
                        const notif = new Notification("Countdown Finished! 🎉", {
                            body: `The timer "${cd.name}" has completed!`,
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
                                    body: `The timer "${cd.name}" has completed!`,
                                    icon: OC.generateUrl('/apps/countdown/img/app.svg'),
                                    tag: 'countdown-' + cd.id
                                });
                            }).catch(function(e) {});
                        }
                    }
                }

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
