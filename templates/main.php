<?php
// templates/main.php
\OCP\Util::addScript('countdown', 'script');
\OCP\Util::addStyle('countdown', 'style');
?>

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
                <!-- La lista verrà inserita via Javascript -->
            </div>
        </div>
        
        <!-- Modale Nuova Voce -->
        <div id="countdown-modal" class="modal-overlay hidden">
            <div class="modal-content glass-effect">
                <h2 id="modal-title">Create a new Countdown</h2>
                <input type="hidden" id="cd-id">
                <div class="form-group">
                    <label for="cd-name">Event Name</label>
                    <input type="text" id="cd-name" placeholder="Es. Japan Trip" />
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
        <!-- Modale Impostazioni (Grandezza) -->
        <div id="settings-panel" class="settings-panel glass-effect">
            <label for="size-slider">Card Size</label>
            <input type="range" id="size-slider" min="0.7" max="1.5" step="0.05" value="1">
        </div>
        <canvas id="confetti-canvas"></canvas>
	</div>
</div>
