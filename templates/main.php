<div id="app-content">
    <div id="app-content-wrapper">
        <div class="countdown-app-container">
            <header class="countdown-header">
                <h1 class="countdown-title" tabindex="0" role="button" aria-label="Countdown title - surprise inside!">Countdown!</h1>
                <button id="add-countdown-btn" class="button primary new-countdown-btn">
                    <span class="btn-icon-plus">+</span>
                    <span class="btn-label">New <span class="mobile-hidden-text">Countdown</span></span>
                </button>
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
                        <input type="text" id="cd-name" placeholder="GTA VI Release" maxlength="30" />
                        <button type="button" id="emoji-trigger" class="action-btn" title="Add Emoji">😃</button>
                    </div>
                    <!-- Emoji Picker Grid -->
                    <div id="hud-emoji-picker" class="emoji-picker glass-effect hidden">
                        <div class="emoji-categories">
                            <button class="cat-btn active" data-cat="faces">😀</button>
                            <button class="cat-btn" data-cat="gaming">🎮</button>
                            <button class="cat-btn" data-cat="objects">💡</button>
                            <button class="cat-btn" data-cat="symbols">✨</button>
                        </div>
                        <div id="emoji-grid" class="emoji-grid"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="cd-description">Description</label>
                    <input type="text" id="cd-description" placeholder="A short description..." />
                </div>
                <div class="form-group" id="date-group">
                    <label for="cd-date">Event Date and Time</label>
                    <input type="datetime-local" id="cd-date" />
                </div>
                <div class="repeat-section">
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="cd-repeat-toggle">
                        <label for="cd-repeat-toggle">Repeat Countdown (NEW!)</label>
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
                    </div>
                </div>
                <div class="modal-actions">
                    <div class="button-group">
                        <button id="cancel-btn" class="button">Cancel</button>
                        <button id="save-btn" class="button primary">Save Changes</button>
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
                </div>
                <div class="modal-actions">
                    <button id="close-info-btn" class="button">Close</button>
                    <a href="https://apps.nextcloud.com/apps/countdown" target="_blank" rel="noreferrer"
                        class="button review-btn primary">Leave a review or comment :D</a>
                </div>
            </div>
        </div>
        <!-- Settings Modal (Size) -->
        <div id="settings-panel" class="settings-panel glass-effect">
            <button id="settings-toggle" class="settings-toggle" title="Toggle Settings">
                <span class="toggle-icon">▼</span>
            </button>
            <div class="settings-row">
                <label for="size-slider">Size</label>
                <input type="range" id="size-slider" min="0.7" max="1.5" step="0.05" value="1">
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
                        <span class="icon-toggle-arrow">↑</span>
                    </button>
                </div>
                <div id="pwa-install-row" class="settings-row hidden">
                <label>PWA</label>
                <button id="pwa-install-btn" class="button primary">
                    Install web app
                </button>
            </div>
        </div>
        </div>
        <div id="countdown-notification-container" class="notification-container"></div>
        <canvas id="confetti-canvas"></canvas>
    </div>
</div>