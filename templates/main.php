<div id="app-content">
	<div id="app-content-wrapper">
        <div class="countdown-app-container">
            <header class="countdown-header">
                <h1 class="countdown-title">Countdown!</h1>
                <button id="add-countdown-btn" class="button primary new-countdown-btn">
                    New Countdown
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
                    <input type="text" id="cd-name" placeholder="GTA VI Release" />
                </div>
                <div class="form-group">
                    <label for="cd-description">Description</label>
                    <input type="text" id="cd-description" placeholder="A short description..." />
                </div>
                 <div class="form-group" id="date-group">
                    <label for="cd-date">Event Date and Time</label>
                    <input type="datetime-local" id="cd-date" />
                </div>
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="cd-allday">
                    <label for="cd-allday">All Day</label>
                </div>
                <div class="modal-actions">
                    <button id="cancel-btn" class="button">Cancel</button>
                    <button id="save-btn" class="button primary">Save</button>
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
                </div>
                <div class="modal-actions">
                    <button id="close-info-btn" class="button primary">Close</button>
                </div>
            </div>
        </div>
        <!-- Settings Modal (Size) -->
        <div id="settings-panel" class="settings-panel glass-effect">
            <label for="size-slider">Card Size</label>
            <input type="range" id="size-slider" min="0.7" max="1.5" step="0.05" value="1">
        </div>
        <canvas id="confetti-canvas"></canvas>
	</div>
</div>
