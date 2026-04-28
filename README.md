# 🕒 Countdown for Nextcloud

**Your most anticipated releases, in one place.**

**Built for Nextcloud**, this app keeps all your data fully private. Your events and most anticipated releases stay exclusively on your instance — no tracking, no profiling, no third-party access.

## ✨ Features

* 🕒 **Hyped Tracking**: Manage countdowns for games, movies, series, and personal events.
* 📊 **Dashboard Widget**: View all your upcoming releases directly on your Nextcloud Dashboard.
* 🔄 **Smart Recurrence**: Repeat events daily, weekly, monthly, or yearly (perfect for weekly show releases!).
* 🔔 **Stay Notified**: Receive automatic alerts through the Nextcloud Activity stream when a countdown expires.
* 🖼️ **Dual Layout**: Switch between **Stacked** (compact) and **Grid** (side-by-side) views to fit your style.
* 📱 **PWA Ready**: Install the app on your phone or desktop for a native-like, full-screen experience.
* ✏️ **Custom Completion**: Choose between default, random, or custom messages when a countdown finishes.
* 🎮 **Easter Eggs**: Keep clicking the title to discover secrets inspired by pop culture!

Organize events by creation date, follow recurring schedules, and access everything instantly. Designed to feel natural in both **Light and Dark themes**.

## 🔔 How Notifications Work

Countdown uses the **Nextcloud Background Job** system to send notifications server-side. This ensures you receive alerts even when the app is not open, including on the **Nextcloud mobile app**.
Notifications are checked every **5 minutes** by a background job (`TimerJob`). For reliable delivery, your Nextcloud instance should use **System Cron** mode.
Administrators can also trigger checks manually with: **occ countdown:check-timers**

## 📸 Screenshots

### Main Dashboard
<p align="center">
  <img src="screenshots/desktop_dashboard.png" width="100%" alt="Countdown main view" />
</p>

### Dashboard Widget
<p align="center">
  <img src="screenshots/desktop_widget.png" width="100%" alt="Countdown widget view" />
</p>  

### Edit Panel
<p align="center">
  <img src="screenshots/desktop_edit.png" width="100%" alt="Countdown edit view" />
</p>

### Mobile View
<p align="center">
  <img src="screenshots/mobile_dashboard.png" width="30%" alt="Mobile Home" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="screenshots/mobile_widget.png" width="30%" alt="Mobile Widget" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="screenshots/mobile_create.png" width="30%" alt="Mobile Create" />
</p>

## 🚀 Installation

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

## 🛠️ Configuration

No complex configuration is needed to start! Once enabled, you'll see the **Countdown** icon in your top navigation bar.

### Creating your first Countdown
1. **Name & Date**: Simply click the "+" button, enter a title (e.g., "GTA VI Release"), and pick the target date and time.
2. **Add some Magic**: You can choose a custom **emoji** to represent your event and add a **description** for more details.
3. **Go Recurrent**: Enable the **Repeat** toggle if you want the countdown to restart automatically (Daily, Weekly, Monthly, or Yearly).
4. **The Celebration**: When the timer reaches zero, you'll receive a **Nextcloud Notification** and be greeted by a **burst of confetti**! 🎉

### Configuring Notifications (CRON)

To receive notifications accurately when a countdown expires, you need to add a cron job to your host system. The check frequency is **fully customizable**: while 5 minutes is usually enough, you can increase precision by running it every minute.

#### Examples:
*   **Every 5 minutes (Recommended)**:
    ```bash
    */5 * * * * sudo docker exec --user www-data nextcloud php occ countdown:check-timers
    ```
*   **Every minute (High precision)**:
    ```bash
    * * * * * sudo docker exec --user www-data nextcloud php occ countdown:check-timers
    ```

> [!TIP]
> If you're new to cron syntax, use [crontab.guru](https://crontab.guru/) to verify your schedule or browse their [examples](https://crontab.guru/examples.html).

1. Open your host crontab: `sudo crontab -e`
2. Add the desired line from the examples above.

### Administrative Commands
Administrators can use the `occ` command line tool to manage countdowns and trigger notification checks manually.

*   **Check notifications immediately**:
    ```bash
    php occ countdown:check-timers
    ```
*   **List countdowns for a user**:
    ```bash
    php occ countdown:list <user_id>
    ```
*   **Add/Delete countdowns**: Use `php occ countdown:add --help` or `php occ countdown:delete --help` for details.

### Dashboard Widget
To see your countdowns at a glance:
1. Go to your **Nextcloud Dashboard**.
2. Scroll to the bottom and click **Edit widgets**.
3. Enable the **Countdown** widget.

## ⭐ Support the Project

If you find **Countdown** useful and want to support its development:
*   **Star the Project**: Give us a star on [GitHub](https://github.com/infinit7even/countdown) to help others discover it.
*   **Leave a Review**: Share your experience and feedback on the [Nextcloud App Store](https://apps.nextcloud.com/apps/countdown).
*   **Support on Ko-fi**: Help me keep the project active and always updated to the latest Nextcloud versions by [buying me a coffee](https://ko-fi.com/infinit7even). ☕

Your support helps me keep improving the app and adding new "magic" features! 🦊✨

## 🤝 Contributing & Feedback

* **Bugs & Features**: Found a bug or have a great idea? Open an issue on [GitHub Issues](https://github.com/infinit7even/countdown/issues).
* **Discussions**: Join the community for questions and tips on [GitHub Discussions](https://github.com/infinit7even/countdown/discussions).
* **Source Code**: Explore the code or fork the project at [GitHub Repository](https://github.com/infinit7even/countdown).

## ⚖️ License
This project is licensed under the **AGPL-3.0-or-later** license. See the [LICENSE](LICENSE) file for details.
