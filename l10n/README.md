# Translations / Localization (L10N)

Welcome to the translation directory of the **Countdown** Nextcloud application!

## 🌍 Supported Languages
- 🇬🇧 **English** (`en`)
- 🇩🇪 **German** (`de`)
- 🇫🇷 **French** (`fr`)
- 🇪🇸 **Spanish** (`es`)
- 🇧🇷 / 🇵🇹 **Portuguese** (`pt_BR`, `pt_PT`)
- 🇨🇳 **Chinese Simplified** (`zh_CN`)
- 🇯🇵 **Japanese** (`ja`)
- 🇷🇺 **Russian** (`ru`)
- 🇹🇷 **Turkish** (`tr`)
- 🇳🇱 **Dutch** (`nl`)
- 🇵🇱 **Polish** (`pl`)
- 🇸🇪 **Swedish** (`sv`)
- 🇩🇰 **Danish** (`da`)
- 🇳🇴 **Norwegian** (`nb_NO`, `nn_NO`)
- 🇸🇦 **Arabic** (`ar`)
- 🇨🇿 **Czech** (`cs`)
- 🏴 **Catalan** (`ca`)
- 🇮🇹 **Italian** (`it`)

## 🛠️ How to Contribute Translations or Fix Typos

We warmly welcome Community Pull Requests!

### Method 1: Edit JSON directly
1. Open or create `l10n/<language_code>.json` (e.g. `l10n/de.json`).
2. Add or update the key-value pairs under `"translations"`.
3. Update the corresponding `l10n/<language_code>.js` file with the same registration mapping.
4. Submit a Pull Request with your language code in the title (e.g., `l10n: improve German translations`).

### Method 2: Use Gettext POT Template
- A master template is available at `translationfiles/templates/countdown.pot`.
- You can open this file using [Poedit](https://poedit.net/) or any gettext editor to produce updated translations.
