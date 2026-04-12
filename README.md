# 🕒 Countdown for Nextcloud

**Track your most anticipated game releases, movie premieres, and TV episodes — all in one place, fully under your control.**

**Built for Nextcloud**, this app keeps all your data fully private. Your events and most anticipated releases stay exclusively on your instance — no tracking, no profiling, no third-party access.

---

## ✨ Features

* 🕒 **Hyped Tracking**: Manage countdowns for games, movies, series, and personal events.
* 📊 **Dashboard Widget**: View all your upcoming releases directly on your Nextcloud Dashboard.
* 🔄 **Smart Recurrence**: Repeat events daily, weekly, monthly, or yearly (perfect for weekly show releases!).
* 🔔 **Stay Notified**: Receive automatic alerts through the Nextcloud Activity stream when a countdown expires.
* 🖼️ **Dual Layout**: Switch between **Stacked** (compact) and **Grid** (side-by-side) views to fit your style.
* 📱 **PWA Ready**: Install the app on your phone or desktop for a native-like, full-screen experience.
* 🎮 **Easter Eggs**: Keep clicking the title to discover secrets inspired by pop culture!

Organize events by creation date, follow recurring schedules, and access everything instantly. Designed to feel natural in both **Light and Dark themes**.

---

## 📸 Screenshots

### Main Dashboard
![Countdown main view](screenshots/countdown.png)

### Dashboard Widget
![Countdown widget view](screenshots/widget.png)

### Edit Panel
![Countdown edit view](screenshots/edit.png)

### Mobile View
![Countdown mobile view](screenshots/mobile.png)

---

## 🚀 Installation & Download

### Option 1: Nextcloud App Store (Recommended)
You can find **Countdown** directly in your Nextcloud instance:
1. Log in to your Nextcloud as an **Administrator**.
2. Click on your profile icon (top right) and select **Apps**.
3. Use the search bar to look for **"Countdown"**.
4. Click **Download and enable**.

### Option 2: Manual Installation
If you prefer to install it manually or want to use a specific version:
1. **Download**: Get the latest release from the [GitHub Releases](https://github.com/infinit7even/countdown/releases) page or the [Nextcloud App Store](https://apps.nextcloud.com/apps/countdown).
2. **Extract**: Unpack the `countdown.tar.gz` (or clone the repo) into your Nextcloud's `apps/` directory.
3. **Permissions**: Ensure the folder permissions are correct (usually `www-data` for Linux servers).
   ```bash
   chown -R www-data:www-data /path/to/nextcloud/apps/countdown
   ```
4. **Enable**: Go to the **Apps** section in your Nextcloud and click **Enable** on the Countdown app, or use the command line:
   ```bash
   sudo -u www-data php /path/to/nextcloud/occ app:enable countdown
   ```

---

## 🛠️ Configuration & Usage
No complex configuration is needed! Once enabled, you'll see the **Countdown** icon in your top navigation bar.

### Creating your first Countdown
1. **Name & Date**: Simply click the "+" button, enter a title (e.g., "GTA VI Release"), and pick the target date and time.
2. **Add some Magic**: You can choose a custom **emoji** to represent your event and add a **description** for more details.
3. **Go Recurrent**: Enable the **Repeat** toggle if you want the countdown to restart automatically (Daily, Weekly, Monthly, or Yearly).
4. **The Celebration**: When the timer reaches zero, you'll receive a **Nextcloud Notification** and be greeted by a **burst of confetti**! 🎉

### Dashboard Widget
To see your countdowns at a glance:
1. Go to your **Nextcloud Dashboard**.
2. Scroll to the bottom and click **Edit widgets**.
3. Enable the **Countdown** widget.

---

## ⭐ Support the Project

If you find **Countdown** useful and want to support its development:
*   **Star the Project**: Give us a star on [GitHub](https://github.com/infinit7even/countdown) to help others discover it.
*   **Leave a Review**: Share your experience and feedback on the [Nextcloud App Store](https://apps.nextcloud.com/apps/countdown).
*   **Support on Ko-fi**: Help me keep the project active and always updated to the latest Nextcloud versions by [buying me a coffee](https://ko-fi.com/infinit7even). ☕

Your support helps me keep improving the app and adding new "magic" features! 🦊✨

---

## 🤝 Contributing & Feedback

* **Bugs & Features**: Found a bug or have a great idea? Open an issue on [GitHub Issues](https://github.com/infinit7even/countdown/issues).
* **Discussions**: Join the community for questions and tips on [GitHub Discussions](https://github.com/infinit7even/countdown/discussions).
* **Source Code**: Explore the code or fork the project at [GitHub Repository](https://github.com/infinit7even/countdown).

---

## ⚖️ License
This project is licensed under the **AGPL-3.0-or-later** license. See the [LICENSE](LICENSE) file for details.