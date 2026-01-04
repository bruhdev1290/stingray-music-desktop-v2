# Roadmap

## Now (MVP)
- Wire Stingray API auth (token exchange, refresh) in `desktop/src/renderer/api/stingrayClient.ts`.
- Implement catalog browse/search and playback URL retrieval.
- Build playback UI (play/pause/seek, queue, now-playing metadata).
- Add media-key handling and basic tray/dock controls.

## Next (Stability & polish)
- Persist session securely (OS keyring) and add reconnect logic.
- Add error handling, offline-friendly retries, and telemetry opt-in.
- Package auto-update flow for Windows (NSIS) and Linux (AppImage updater or custom).
- Light caching layer for recent items; optional offline downloads.

## Later (Enhancements)
- Equalizer/crossfade/replay gain options if streams permit.
- Multi-account profiles and parental/region gating if required.
- Deeper system integration: notifications with actions, taskbar/dock progress, global shortcuts.
- Theming UX improvements (import/export theme presets, high-contrast modes).

## Nice-to-have
- E2E smoke tests for auth + playback.
- Diagnostics panel with logs/export, network status, and environment info.
- Accessibility pass (keyboard nav, screen reader labels, focus outlines).
