<div id="app-content">
    <div id="app-content-wrapper">
        <div class="countdown-app-container">
            <header class="countdown-header">
                <h1 class="countdown-title" tabindex="0" role="button" aria-label="Countdown title - surprise inside!">Countdown!</h1>
                <div class="header-actions">
                    <button id="add-countdown-btn" class="button primary new-countdown-btn">
                        <span class="btn-icon-plus">+</span>
                        <span class="btn-label">New <span class="mobile-hidden-text">Countdown</span></span>
                    </button>
                </div>
            </header>

            <div id="countdown-grid" class="countdown-grid">
                <!-- The list will be inserted via Javascript -->
            </div>
        </div>

        <!-- New Item Modal -->
        <div id="countdown-modal" class="modal-overlay hidden">
            <div class="modal-content glass-effect">
                <h2 id="modal-title">Create a new Countdown</h2>
                <input type="hidden" id="cd-id">
                <div class="form-group">
                    <label for="cd-name">Event Name</label>
                    <div class="input-with-action">
                        <button type="button" id="emoji-trigger" class="action-btn" title="Add Emoji">😃</button>
                        <input type="text" id="cd-name" placeholder="GTA VI Release" maxlength="30" />
                    </div>
                    <!-- Emoji Picker Grid -->
                    <div id="hud-emoji-picker" class="emoji-picker glass-effect hidden">
                        <div class="emoji-search-wrapper">
                            <span class="emoji-search-icon">🔍</span>
                            <input type="text" id="emoji-search-input" placeholder="Search emoji..." autocomplete="off" />
                            <button type="button" id="emoji-search-clear" class="emoji-search-clear hidden" title="Clear search">✕</button>
                        </div>
                        <div class="emoji-categories">
                            <button class="cat-btn active" data-cat="faces" title="Faces">😀</button>
                            <button class="cat-btn" data-cat="people" title="People">🧑</button>
                            <button class="cat-btn" data-cat="animals" title="Animals">🐱</button>
                            <button class="cat-btn" data-cat="food" title="Food">🍕</button>
                            <button class="cat-btn" data-cat="activities" title="Activities">⚽</button>
                            <button class="cat-btn" data-cat="travel" title="Travel">🚀</button>
                            <button class="cat-btn" data-cat="objects" title="Objects">💡</button>
                            <button class="cat-btn" data-cat="symbols" title="Symbols">✨</button>
                            <button class="cat-btn" data-cat="flags" title="Flags">🏳️‍🌈</button>
                        </div>
                        <div id="emoji-grid" class="emoji-grid"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="cd-description">Description</label>
                    <input type="text" id="cd-description" placeholder="A short description..." />
                </div>
                <div class="form-group" id="date-group">
                    <div class="date-label-row">
                        <label for="cd-date">Event Date and Time</label>
                        <div class="all-day-toggle">
                            <input type="checkbox" id="cd-all-day-toggle" />
                            <label for="cd-all-day-toggle">All-day event</label>
                        </div>
                    </div>
                    <input type="datetime-local" id="cd-date" />
                    <div class="form-group hidden" id="all-day-timing-group" style="margin-top: 10px; margin-bottom: 0;">
                        <label for="cd-all-day-timing">Target Time</label>
                        <select id="cd-all-day-timing">
                            <option value="start">Start of Day (00:00)</option>
                            <option value="end">End of Day (23:59)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" id="units-section">
                    <label>Display Units <span class="label-optional">(Select up to 4)</span></label>
                    <div class="unit-chips-container" id="unit-chips">
                        <button type="button" class="unit-chip" data-unit="years">Years</button>
                        <button type="button" class="unit-chip" data-unit="months">Months</button>
                        <button type="button" class="unit-chip" data-unit="weeks">Weeks</button>
                        <button type="button" class="unit-chip active" data-unit="days">Days</button>
                        <button type="button" class="unit-chip active" data-unit="hours">Hours</button>
                        <button type="button" class="unit-chip active" data-unit="minutes">Minutes</button>
                        <button type="button" class="unit-chip active" data-unit="seconds">Seconds</button>
                    </div>
                    <div id="unit-selection-hint" class="unit-selection-hint">Display order: Days · Hours · Min · Sec</div>
                </div>
                <div class="repeat-section">
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="cd-repeat-toggle">
                        <label for="cd-repeat-toggle">Repeat Countdown</label>
                    </div>
                    <div id="repeat-options" class="hidden">
                        <div class="form-group">
                            <label for="cd-repeat-type">Frequency</label>
                            <select id="cd-repeat-type">
                                <option value="daily">Every Day</option>
                                <option value="weekly">Every Week</option>
                                <option value="monthly">Every Month</option>
                                <option value="yearly">Every Year</option>
                                <option value="custom">Custom Period</option>
                            </select>
                        </div>
                        <div class="form-group hidden" id="custom-repeat-group">
                            <label for="cd-repeat-value">Days</label>
                            <input type="number" id="cd-repeat-value" step="0.001" min="0.001" value="1" />
                        </div>
                        <div class="form-group hidden" id="yearly-repeat-group">
                            <label for="cd-starting-year">Starting / Birth Year <span class="label-optional">(Optional)</span></label>
                            <input type="number" id="cd-starting-year" min="1" max="9999" placeholder="e.g. 1995" />
                            <small class="form-hint">Automatically calculates and displays age or anniversary milestone (e.g. 30th).</small>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <div class="button-group">
                        <button type="button" id="duplicate-btn" class="button hidden" title="Duplicate as new countdown">Duplicate</button>
                        <button type="button" id="cancel-btn" class="button">Cancel</button>
                        <button type="button" id="save-btn" class="button primary">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Info Modal -->
        <div id="info-modal" class="modal-overlay hidden">
            <div class="modal-content glass-effect">
                <h2 id="info-title">Countdown Details</h2>
                <div class="info-body">
                    <div class="form-group">
                        <label>Date Created</label>
                        <div id="info-created" class="info-value"></div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <div id="info-description" class="info-value"></div>
                    </div>
                    <div class="form-group">
                        <label>Repetition</label>
                        <div id="info-repeat" class="info-value"></div>
                    </div>
                    <div class="form-group hidden" id="info-allday-group">
                        <label>Event Type</label>
                        <div id="info-allday" class="info-value"></div>
                    </div>
                    <div class="form-group" id="info-units-group">
                        <label>Display Units</label>
                        <div id="info-units" class="info-value"></div>
                    </div>
                    <div class="form-group hidden" id="info-milestone-group">
                        <label>Milestone / Age</label>
                        <div id="info-milestone" class="info-value"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <div class="button-group">
                        <button id="close-info-btn" class="button">Close</button>
                        <a href="https://apps.nextcloud.com/apps/countdown" target="_blank" rel="noreferrer"
                            class="button review-btn primary">Leave a review</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Modal -->
        <div id="delete-modal" class="modal-overlay hidden">
            <div class="modal-content glass-effect">
                <h2 id="delete-title">Delete Countdown?</h2>
                <div class="info-body">
                    <p style="margin-bottom: 0; font-size: 1.1rem; color: var(--color-main-text);">Are you sure you want to delete this countdown? This action cannot be undone.</p>
                </div>
                <div class="modal-actions">
                    <div class="button-group">
                        <button id="cancel-delete-btn" class="button">Cancel</button>
                        <button id="confirm-delete-btn" class="button primary" style="background: var(--color-error, #e9322d) !important;">Delete</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Settings Modal (Size) -->
        <div id="settings-panel" class="settings-panel glass-effect">
            <button id="settings-toggle" class="settings-toggle" title="Toggle Settings">
                <span class="toggle-icon">▼</span>
            </button>
            <div class="settings-row size-news-row">
                <div class="size-container">
                    <label>SIZE</label>
                    <input type="range" id="size-slider" min="0.5" max="1.5" step="0.05" value="1">
                </div>
                <button id="news-btn" class="news-btn-inline" title="What's New?">📰</button>
            </div>

            <div class="settings-row">
                <label>Layout</label>
                <div class="segmented-control layout-segmented">
                    <button class="layout-opt active" data-layout="grid-1" title="Expanded View">
                        <div class="cd-layout-icon icon-expanded"><span></span><span></span></div>
                    </button>
                    <button class="layout-opt" data-layout="grid-2" title="Grid View">
                        <div class="cd-layout-icon icon-grid"><span></span><span></span><span></span><span></span></div>
                    </button>
                </div>
            </div>
            
            <div class="settings-row">
                <label>Sort</label>
                <div class="sort-controls">
                    <div class="segmented-control">
                        <button class="sort-opt active" data-sort="date" title="Sort by Date">📅</button>
                        <button class="sort-opt" data-sort="name" title="Sort Alphabetical">abc</button>
                        <button class="sort-opt" data-sort="newest" title="Sort by Newest">🆕</button>
                    </div>
                    <button id="sort-direction-btn" class="sort-direction-btn" title="Toggle Direction">
                        <svg class="icon-toggle-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 19V5M5 12l7-7 7 7"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="settings-row">
                <label>Completion Message</label>
                <div class="segmented-control completion-segmented">
                    <button class="msg-opt active" data-msg="default" title="Default: Complete">📍</button>
                    <button class="msg-opt" data-msg="random" title="Random Messages">🎲</button>
                    <button class="msg-opt" data-msg="custom" title="Custom Message">✍️</button>
                </div>
                <input type="text" id="custom-completion-input" class="hidden settings-input" placeholder="Your custom message..." maxlength="30">
            </div>

            <div id="app-debug-row" class="settings-row">
                <label>Extra & Debug</label>
                <div style="display: flex; gap: 10px; align-items: stretch; margin-top: 5px;">
                    <button id="pwa-install-btn" class="button primary hidden">📥 Install PWA</button>
                    <a id="pwa-review-btn" href="https://apps.nextcloud.com/apps/countdown" target="_blank" rel="noreferrer" class="button primary hidden">🧁 Leave a review</a>
                    <button id="debug-notif-btn" class="debug-btn" title="Test notifications">🛠️</button>
                </div>
            </div>
        </div>
        <!-- News Modal -->
        <div id="news-modal" class="modal-overlay hidden">
            <div class="modal-content news-content glass-effect">
                <div class="news-header">
                    <h2>🗞️ Countdown Times</h2>
                    <p class="news-subtitle">Latest Updates & Features</p>
                </div>
                <div id="news-articles" class="news-articles">
                    <!-- Articles will be inserted via Javascript -->
                </div>
                <div class="modal-actions">
                    <div class="button-group">
                        <button id="close-news-btn" class="button">Close</button>
                        <a href="https://github.com/infinit7even/countdown" target="_blank" rel="noreferrer"
                            class="button review-btn primary">⭐ Star this project on GitHub</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Floating Archive Button (Bottom Right) -->
        <button type="button" id="archive-floating-btn" class="archive-floating-btn glass-effect" title="Archived Countdowns">
            <span class="archive-icon">📦</span>
            <span class="archive-label">Archive</span>
            <span id="archive-count-badge" class="archive-count-badge hidden">0</span>
        </button>

        <!-- Archive Modal -->
        <div id="archive-modal" class="modal-overlay hidden">
            <div class="modal-content glass-effect archive-modal-content">
                <div class="archive-modal-header">
                    <h2>📦 Archived Countdowns</h2>
                    <span id="archive-total-count" class="archive-total-count">0 items</span>
                </div>
                <div id="archive-list" class="archive-list">
                    <!-- Rendered dynamically -->
                </div>
                <div class="modal-actions">
                    <div class="button-group">
                        <button type="button" id="close-archive-btn" class="button">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="countdown-notification-container" class="notification-container"></div>
        <canvas id="confetti-canvas"></canvas>
    </div>
</div>