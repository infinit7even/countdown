# Changelog

All notable changes to this project will be documented in this file.

## [1.0.8] - 2026-04-02
### Fixed
- Fixed fatal error "Class not found" for dashboard widget: corrected wrong namespaces `OCP\DashboardModel\*` to `OCP\Dashboard\Model\*` for `WidgetItem` and `WidgetButton`
- Removed unused `WidgetItems` import

## [1.0.7] - 2026-03-30
### Changed
- Updated licence field to SPDX format (AGPL-3.0-or-later)
- Added missing `bugs` and `repository` fields to app metadata

## [1.0.6] - 2026-03-29
### Changed
- Improved UI styling and hover effects on buttons
- Fixed compatibility issues with Nextcloud notification system

## [1.0.5] - 2026-03-28
### Added
- Glassmorphism UI redesign with premium card layout
- User-controlled card size settings panel
- Responsive layout to prevent header overlap

## [1.0.0] - 2026-03-28
### Added
- Initial release
- Create, edit and delete countdown timers
- Modern Nextcloud-style interface with dark mode support
- Dashboard widget support
- Notification support for expired countdowns
