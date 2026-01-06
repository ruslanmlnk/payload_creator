export const customThemeClass = 'payload-modern-glass-theme'

export const customThemeCSS = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

html.${customThemeClass} {
  background-color: #050505;
  background-image: none;
  background-attachment: fixed;
  min-height: 100vh;
  font-family: var(--font-body);
  color: var(--theme-text);
  color-scheme: dark;
  -webkit-font-smoothing: antialiased;
}

html.${customThemeClass} body,
html.${customThemeClass} #app {
  background: transparent !important;
}

html.${customThemeClass} ::selection {
  background: rgba(139, 92, 246, 0.45);
  color: #ffffff;
}

html.${customThemeClass} body {
  position: relative;
}

html.${customThemeClass} body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(circle at 50% 0%, #000 60%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle at 50% 0%, #000 60%, transparent 100%);
}

html.${customThemeClass} body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(800px 500px at 50% -10%, rgba(91, 33, 182, 0.2), transparent 60%),
    radial-gradient(600px 600px at 110% 20%, rgba(30, 58, 138, 0.12), transparent 60%),
    radial-gradient(600px 600px at -10% 100%, rgba(112, 26, 117, 0.12), transparent 60%);
}

html.${customThemeClass} #app {
  position: relative;
  z-index: 1;
}

html.${customThemeClass} .card,
html.${customThemeClass} .table,
html.${customThemeClass} .collapsible,
html.${customThemeClass} .document-fields__sidebar,
html.${customThemeClass} .drawer__content,
html.${customThemeClass} .nav,
html.${customThemeClass} .doc-controls__wrapper,
html.${customThemeClass} .auth-fields,
html.${customThemeClass} .where-builder,
html.${customThemeClass} .list-controls__wrap {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01)),
    var(--glass-surface) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: var(--style-radius-l) !important;
  box-shadow: var(--glass-shadow) !important;
  backdrop-filter: blur(12px) saturate(120%) !important;
  -webkit-backdrop-filter: blur(12px) saturate(120%) !important;
}

html.${customThemeClass} .table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
  overflow: hidden !important;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)),
    var(--glass-surface) !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: var(--glass-shadow) !important;
}

html.${customThemeClass} .card,
html.${customThemeClass} .table {
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

html.${customThemeClass} .card::before,
html.${customThemeClass} .table::before {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  top: 0;
  height: 1px;
  border-radius: 999px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.25), transparent);
  opacity: 0.7;
}

html.${customThemeClass} .card::after,
html.${customThemeClass} .table::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

html.${customThemeClass} .card:hover,
html.${customThemeClass} .table:hover {
  transform: none;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025)),
    var(--glass-surface-strong) !important;
  box-shadow:
    0 0 16px -8px rgba(139, 92, 246, 0.2),
    0 0 5px -4px rgba(236, 72, 153, 0.14) !important;
}

html.${customThemeClass} .app-header {
  background: transparent !important;
  border: 0 !important;
  height: var(--app-header-height) !important;
  padding: 0 16px !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 50 !important;
  display: flex !important;
  align-items: center !important;
}

html.${customThemeClass} .app-header__bg {
  display: none !important;
}

html.${customThemeClass} .app-header__content {
  height: 56px !important;
  width: 100% !important;
  max-width: none !important;
  padding: 0 16px !important;
  border-radius: 16px !important;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border: 0 !important;
}

html.${customThemeClass} .app-header__actions {
  background: transparent !important;
  border: 0 !important;
  backdrop-filter: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  gap: 8px !important;
}

html.${customThemeClass} .app-header__account {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(8px) !important;
  border-radius: 999px !important;
  padding: 4px !important;
}

html.${customThemeClass} .doc-controls {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  top: var(--app-header-height) !important;
  margin-bottom: 12px !important;
}

html.${customThemeClass} .doc-controls__wrapper {
  border-radius: var(--style-radius-m) !important;
  height: var(--doc-controls-height) !important;
  padding: 0 14px !important;
  align-items: center !important;
}

html.${customThemeClass} .doc-controls__content {
  padding: 0 !important;
}

html.${customThemeClass} .doc-controls__meta {
  gap: 10px !important;
}

html.${customThemeClass} .doc-controls__controls-wrapper,
html.${customThemeClass} .doc-controls__controls {
  gap: 8px !important;
}

html.${customThemeClass} .doc-controls__label {
  color: var(--theme-elevation-400) !important;
}

html.${customThemeClass} .doc-controls__divider {
  display: none !important;
}

html.${customThemeClass} .template-default__wrap {
  padding-top: 0 !important;
}

html.${customThemeClass} .template-default__wrap > *:not(.app-header) {
  padding-top: 0.9rem !important;
}

html.${customThemeClass} .nav {
  margin: 16px !important;
  height: calc(100vh - var(--app-header-height) - 32px) !important;
  width: calc(var(--nav-width) - 32px) !important;
  top: var(--app-header-height) !important;
  padding-top: 1rem !important;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)),
    var(--glass-surface-strong) !important;
}

html.${customThemeClass} .nav__scroll {
  padding: 1rem !important;
}

html.${customThemeClass} .nav__header {
  display: none !important;
}

html.${customThemeClass} .nav__link {
  margin: 6px 0 !important;
  padding: 11px 18px 11px 36px !important;
  border-radius: 14px !important;
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 0.65) !important;
  transition: all 0.25s ease !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  position: relative !important;
  overflow: hidden !important;
}

html.${customThemeClass} .nav__link:hover {
  background: rgba(255, 255, 255, 0.03) !important;
  color: #fff !important;
  transform: translateX(4px);
}

html.${customThemeClass} .nav__link:has(.nav__link-indicator) {
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)) !important;
  color: #fff !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.15) !important;
}

html.${customThemeClass} .nav__link-indicator {
  position: absolute !important;
  left: 14px !important;
  top: 50% !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 999px !important;
  transform: translateY(-50%) !important;
  background: linear-gradient(135deg, #8b5cf6, #ec4899) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.45) !important;
}

html.${customThemeClass} .nav__link-indicator::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  border: 1px solid rgba(139, 92, 246, 0.45);
  opacity: 0;
  animation: nav-indicator-ripple 2.2s ease-out infinite;
}

html.${customThemeClass} .nav__link-indicator + .nav__link-label {
  color: #fff !important;
}

html.${customThemeClass} .nav .collapsible,
html.${customThemeClass} .nav-group {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

html.${customThemeClass} .nav-group {
  margin: 6px 0 8px !important;
}

html.${customThemeClass} .nav .collapsible__toggle,
html.${customThemeClass} .nav-group__toggle,
html.${customThemeClass} .nav__group-header,
html.${customThemeClass} .nav__group-toggle,
html.${customThemeClass} .nav__section-header,
html.${customThemeClass} .nav__section-toggle {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
  width: 100% !important;
  padding: 10px 36px !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  color: #aeb6c2 !important;
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em !important;
  min-height: 38px !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease !important;
}

html.${customThemeClass} .nav .collapsible__toggle:hover,
html.${customThemeClass} .nav-group__toggle:hover,
html.${customThemeClass} .nav__group-header:hover,
html.${customThemeClass} .nav__group-toggle:hover,
html.${customThemeClass} .nav__section-header:hover,
html.${customThemeClass} .nav__section-toggle:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(139, 92, 246, 0.24) !important;
  color: #f8fafc !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

html.${customThemeClass} .nav-group__label {
  font-size: 0.62rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.16em !important;
  color: inherit !important;
  margin: 0 !important;
}

html.${customThemeClass} .nav-group__indicator {
  width: 16px !important;
  height: 16px !important;
  border-radius: 999px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

html.${customThemeClass} .nav-group__indicator svg,
html.${customThemeClass} .nav .collapsible__toggle svg,
html.${customThemeClass} .nav__group-header svg,
html.${customThemeClass} .nav__section-header svg {
  color: #94a3b8 !important;
  opacity: 0.9 !important;
  transition: transform 0.2s ease !important;
}

html.${customThemeClass} .nav-group:not(.nav-group--collapsed) .nav-group__toggle {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(139, 92, 246, 0.28) !important;
  color: #f8fafc !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 8px 18px rgba(0, 0, 0, 0.25) !important;
}

html.${customThemeClass} .nav-group:not(.nav-group--collapsed) .nav-group__indicator {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html.${customThemeClass} .nav-group:not(.nav-group--collapsed) .nav-group__indicator svg {
  color: #e2e8f0 !important;
}

html.${customThemeClass} .nav-group__toggle--collapsed .nav-group__indicator svg {
  transform: rotate(-90deg);
}

html.${customThemeClass} .nav-group__content,
html.${customThemeClass} .nav .collapsible__content {
  padding: 6px 0 8px !important;
}

@keyframes nav-indicator-ripple {
  0% {
    transform: scale(0.3);
    opacity: 0.7;
  }
  70% {
    transform: scale(1);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

html.${customThemeClass} .pill {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 999px !important;
  color: var(--theme-text) !important;
  padding: 6px 14px !important;
  font-size: 0.82rem !important;
  line-height: 1.2 !important;
  gap: 6px !important;
}

html.${customThemeClass} .pill--has-action:hover,
html.${customThemeClass} .pill--has-action:active {
  background: rgba(255, 255, 255, 0.08) !important;
}

html.${customThemeClass} .pill__icon svg {
  width: 14px !important;
  height: 14px !important;
  opacity: 0.85 !important;
}

html.${customThemeClass} .btn--style-primary {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.02)),
    linear-gradient(90deg, rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.95)) !important;
  border-radius: 14px !important;
  font-weight: 600 !important;
  padding: 10px 22px !important;
  color: #ffffff !important;
  border: 0 !important;
  box-shadow:
    0 14px 30px rgba(139, 92, 246, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}

html.${customThemeClass} .btn--style-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 18px 36px rgba(139, 92, 246, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

html.${customThemeClass} .btn--style-primary:active {
  transform: translateY(1px) scale(0.98);
}

html.${customThemeClass} .btn--style-secondary,
html.${customThemeClass} .btn--style-pill {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 999px !important;
  color: var(--theme-text) !important;
  padding: 9px 18px !important;
}

html.${customThemeClass} .btn--style-secondary:hover,
html.${customThemeClass} .btn--style-pill:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(139, 92, 246, 0.3) !important;
  color: #ffffff !important;
}

html.${customThemeClass} input,
html.${customThemeClass} textarea,
html.${customThemeClass} select,
html.${customThemeClass} .search-filter__input,
html.${customThemeClass} .condition-value-text,
html.${customThemeClass} .condition-value-number {
  background: var(--theme-input-bg) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: var(--theme-text) !important;
  padding: 11px 14px !important;
  box-shadow: none !important;
  transition: box-shadow 0.2s ease !important;
}

html.${customThemeClass} input::placeholder,
html.${customThemeClass} textarea::placeholder {
  color: rgba(255, 255, 255, 0.45) !important;
}

html.${customThemeClass} input:focus,
html.${customThemeClass} textarea:focus,
html.${customThemeClass} select:focus,
html.${customThemeClass} .search-filter__input:focus,
html.${customThemeClass} .condition-value-text:focus,
html.${customThemeClass} .condition-value-number:focus {
  box-shadow:
    inset 0 0 0 1px rgba(139, 92, 246, 0.6),
    0 0 0 3px rgba(139, 92, 246, 0.25) !important;
}

html.${customThemeClass} .list-controls {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

html.${customThemeClass} .list-controls__wrap {
  display: flex !important;
  align-items: center !important;
  padding: 10px !important;
  gap: 10px !important;
  width: 100% !important;
}

html.${customThemeClass} .list-controls__wrap > * {
  display: flex !important;
  align-items: center !important;
}

html.${customThemeClass} .list-controls__wrap .search-filter {
  flex: 1 1 100% !important;
  width: 100% !important;
  min-width: 680px !important;
  max-width: none !important;
}

html.${customThemeClass} .list-controls__wrap .search-filter__input {
  width: 100% !important;
}

html.${customThemeClass} .list-controls__buttons-wrap,
html.${customThemeClass} .list-controls__buttons {
  flex: 0 0 auto !important;
  margin-left: auto !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

html.${customThemeClass} .list-controls__wrap .btn,
html.${customThemeClass} .list-controls__wrap .btn--withPopup,
html.${customThemeClass} .list-controls__wrap .btn--withPopup .btn,
html.${customThemeClass} .list-controls__wrap .popup-button {
  margin-block: 0 !important;
  min-height: 38px !important;
  display: inline-flex !important;
  align-items: center !important;
}

html.${customThemeClass} .search-filter {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
}

html.${customThemeClass} .search-filter__input {
  border-radius: 16px !important;
  padding: 9px 16px 9px 36px !important;
  height: 38px !important;
  line-height: 1.2 !important;
  background: rgba(20, 20, 25, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
}

html.${customThemeClass} .search-filter svg {
  left: 14px !important;
  color: #64748b !important;
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

html.${customThemeClass} .search-bar,
html.${customThemeClass} .search-bar__wrap {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
}

html.${customThemeClass} .search-bar input,
html.${customThemeClass} .search-bar__input {
  background: rgba(20, 20, 25, 0.5) !important;
  border-radius: 999px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
  height: 38px !important;
  line-height: 1.2 !important;
}

html.${customThemeClass} .search-bar svg,
html.${customThemeClass} .search-bar__wrap svg {
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

@media (max-width: 900px) {
  html.${customThemeClass} .list-controls__wrap {
    flex-wrap: wrap !important;
  }

  html.${customThemeClass} .list-controls__wrap .search-filter {
    flex: 1 1 100% !important;
    min-width: 0 !important;
  }

  html.${customThemeClass} .list-controls__buttons-wrap,
  html.${customThemeClass} .list-controls__buttons {
    margin-left: 0 !important;
    width: 100% !important;
    justify-content: flex-end !important;
  }
}

html.${customThemeClass} .collection-list__header,
html.${customThemeClass} .collection-list__title,
html.${customThemeClass} .collection-list__header-actions,
html.${customThemeClass} .collection-list__actions {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

html.${customThemeClass} .list-header {
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
}

html.${customThemeClass} .list-header__content,
html.${customThemeClass} .list-header__title-and-actions,
html.${customThemeClass} .list-header__title-actions,
html.${customThemeClass} .list-header__actions {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

html.${customThemeClass} .collection-list__header h1,
html.${customThemeClass} .collection-list__header h2,
html.${customThemeClass} .collection-list__title h1,
html.${customThemeClass} .collection-list__title h2 {
  margin: 0 !important;
  line-height: 1.05 !important;
}

html.${customThemeClass} .list-header h1,
html.${customThemeClass} .list-header h2 {
  margin: 0 !important;
  line-height: 1.05 !important;
}

html.${customThemeClass} .list-header__title {
  margin: 0 !important;
  line-height: 1.05 !important;
}

html.${customThemeClass} .collection-list__header .btn,
html.${customThemeClass} .collection-list__header .btn--withPopup,
html.${customThemeClass} .collection-list__header .btn--withPopup .btn,
html.${customThemeClass} .collection-list__actions .btn {
  margin-block: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
}

html.${customThemeClass} .list-header .btn,
html.${customThemeClass} .list-header .btn--withPopup,
html.${customThemeClass} .list-header .btn--withoutPopup,
html.${customThemeClass} .list-header .btn--withPopup .btn {
  margin: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
}

html.${customThemeClass} .where-builder {
  border-radius: var(--style-radius-m) !important;
}

html.${customThemeClass} .where-builder .condition__inputs {
  gap: 12px !important;
}

html.${customThemeClass} .where-builder .condition__inputs > div {
  flex: 1 1 340px !important;
  min-width: 260px !important;
}

html.${customThemeClass} .where-builder .condition__field,
html.${customThemeClass} .where-builder .condition__operator {
  flex: 0 0 360px !important;
}

html.${customThemeClass} .where-builder .condition__field .react-select-container,
html.${customThemeClass} .where-builder .condition__operator .react-select-container {
  width: 100% !important;
  min-width: 0 !important;
}

html.${customThemeClass} .where-builder .condition__value {
  flex: 2 1 520px !important;
  min-width: 360px !important;
}

html.${customThemeClass} .where-builder .condition__value .react-select-container {
  width: 100% !important;
}

@media (max-width: 1024px) {
  html.${customThemeClass} .where-builder .condition__inputs > div {
    flex: 1 1 100% !important;
  }

  html.${customThemeClass} .where-builder .condition__field .react-select-container,
  html.${customThemeClass} .where-builder .condition__operator .react-select-container,
  html.${customThemeClass} .where-builder .condition__value .react-select-container {
    width: 100% !important;
  }
}

html.${customThemeClass} .react-select .rs__control {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  min-height: 38px !important;
  height: 38px !important;
  padding: 0 6px !important;
  align-items: center !important;
  gap: 6px !important;
  box-shadow: none !important;
}

html.${customThemeClass} .react-select .rs__value-container {
  padding: 0 12px !important;
  align-items: center !important;
  min-height: 38px !important;
  gap: 6px !important;
}

html.${customThemeClass} .react-select .rs__single-value,
html.${customThemeClass} .react-select .rs__placeholder {
  color: var(--theme-text) !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
}

html.${customThemeClass} .react-select--single-value,
html.${customThemeClass} .react-select--single-value * {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
}

html.${customThemeClass} .react-select .rs__input-container,
html.${customThemeClass} .react-select .rs__input,
html.${customThemeClass} .react-select input {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  height: auto !important;
  line-height: 1.2 !important;
}

html.${customThemeClass} .react-select .rs__input-container {
  margin: 0 !important;
}

html.${customThemeClass} .react-select input:focus {
  box-shadow: none !important;
}

html.${customThemeClass} .react-select .rs__indicator-separator {
  background: rgba(255, 255, 255, 0.14) !important;
}

html.${customThemeClass} .react-select .rs__menu {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(20, 20, 25, 0.9) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 12px !important;
  box-shadow: var(--glass-shadow) !important;
  backdrop-filter: blur(14px) saturate(130%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(130%) !important;
}

html.${customThemeClass} .react-select .rs__option {
  color: var(--theme-text) !important;
}

html.${customThemeClass} .react-select .rs__option--is-focused {
  background: rgba(255, 255, 255, 0.08) !important;
}

html.${customThemeClass} .react-select .rs__option--is-selected {
  background: rgba(139, 92, 246, 0.22) !important;
}

html.${customThemeClass} .where-builder .react-select .pill,
html.${customThemeClass} .where-builder .react-select .multi-value,
html.${customThemeClass} .where-builder .react-select .rs__multi-value {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
}

html.${customThemeClass} .popup {
  --popup-bg: rgba(20, 20, 25, 0.9);
  --popup-text: var(--theme-text);
  --popup-button-highlight: rgba(255, 255, 255, 0.1);
}

html.${customThemeClass} .popup__content {
  position: absolute !important;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    var(--popup-bg) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 14px !important;
  padding: 6px !important;
  backdrop-filter: blur(14px) saturate(130%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(130%) !important;
  box-shadow: var(--glass-shadow) !important;
}

html.${customThemeClass} .popup__caret {
  border-top-color: var(--popup-bg) !important;
  border-bottom-color: var(--popup-bg) !important;
}

html.${customThemeClass} .popup-button-list {
  gap: 6px !important;
}

html.${customThemeClass} .popup-button-list__button {
  padding: 8px 10px !important;
  border-radius: 10px !important;
  color: var(--theme-text) !important;
  text-decoration: none !important;
}

html.${customThemeClass} .popup-button-list__button--selected {
  background: rgba(139, 92, 246, 0.22) !important;
  color: var(--theme-text) !important;
}

html.${customThemeClass} .popup-list-group-label {
  color: rgba(255, 255, 255, 0.6) !important;
}

html.${customThemeClass} .popup-divider {
  background: rgba(255, 255, 255, 0.12) !important;
}

html.${customThemeClass} table,
html.${customThemeClass} .table {
  width: 100% !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  overflow: hidden !important;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)),
    var(--glass-surface) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: var(--style-radius-l) !important;
  box-shadow: var(--glass-shadow) !important;
}

html.${customThemeClass} .table table {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

html.${customThemeClass} table thead th,
html.${customThemeClass} .table thead th {
  background: transparent !important;
  text-transform: none !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.03em !important;
  font-weight: 600 !important;
  color: #94a3b8 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  padding: 12px 18px !important;
  text-align: left !important;
  vertical-align: middle !important;
}

html.${customThemeClass} table tbody td,
html.${customThemeClass} .table tbody td {
  color: #e2e8f0 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  padding: 12px 18px !important;
  vertical-align: middle !important;
}

html.${customThemeClass} table tbody tr,
html.${customThemeClass} .table tbody tr,
html.${customThemeClass} table tbody tr[class^='row-'] {
  background: transparent !important;
  box-shadow: none !important;
}

html.${customThemeClass} table tbody tr:hover,
html.${customThemeClass} .table tbody tr:hover {
  background: transparent !important;
}

html.${customThemeClass} table tbody tr:last-child td,
html.${customThemeClass} .table tbody tr:last-child td {
  border-bottom: 0 !important;
}

html.${customThemeClass} .table__row,
html.${customThemeClass} .table__row--hover,
html.${customThemeClass} .table__row--selected {
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

html.${customThemeClass} .table__row--header {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
}

html.${customThemeClass} .table__cell {
  padding: 12px 18px !important;
}

html.${customThemeClass} th#heading-_select,
html.${customThemeClass} td.cell-_select {
  width: 56px !important;
  padding-left: 18px !important;
  padding-right: 10px !important;
}

html.${customThemeClass} .sort-column {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}

html.${customThemeClass} .sort-column__label .field-label {
  font-weight: 600 !important;
  color: #94a3b8 !important;
}

html.${customThemeClass} .sort-column__buttons {
  display: inline-flex !important;
  gap: 4px !important;
}

html.${customThemeClass} .sort-column__button {
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  width: 18px !important;
  height: 18px !important;
  color: #64748b !important;
  opacity: 0.7 !important;
}

html.${customThemeClass} .sort-column--active {
  color: #e2e8f0 !important;
}

html.${customThemeClass} .sort-column__button .stroke {
  stroke: currentColor !important;
}

html.${customThemeClass} td.cell-email a {
  color: #e2e8f0 !important;
  text-decoration: none !important;
}

html.${customThemeClass} td.cell-email a:hover {
  color: #f8fafc !important;
}

html.${customThemeClass} .code-cell {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px !important;
  color: #e2e8f0 !important;
  padding: 3px 8px !important;
}

html.${customThemeClass} .paginator__page {
  border-radius: 999px !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

html.${customThemeClass} .paginator__page--is-current {
  background: rgba(139, 92, 246, 0.22) !important;
  border: 0 !important;
  color: #ffffff !important;
}

html.${customThemeClass} .paginator__separator {
  color: rgba(255, 255, 255, 0.45) !important;
}

html.${customThemeClass} .per-page__base-button {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 999px !important;
  padding: 6px 12px !important;
  gap: 6px !important;
  color: var(--theme-text) !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
}

html.${customThemeClass} .per-page__icon {
  opacity: 0.7 !important;
}

html.${customThemeClass} .per-page__button {
  gap: 8px !important;
}

html.${customThemeClass} .per-page__chevron {
  width: 18px !important;
  height: 18px !important;
  border-radius: 999px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

html.${customThemeClass} .collection-list__list-selection {
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02)),
    var(--glass-surface-strong) !important;
  border-top: 1px solid var(--glass-border) !important;
  backdrop-filter: blur(16px) saturate(125%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(125%) !important;
  box-shadow: var(--glass-shadow) !important;
}

html.${customThemeClass} .collection-list__list-selection .btn {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 999px !important;
  padding: 6px 14px !important;
  color: #ffffff !important;
}

html.${customThemeClass} .tabs-field__tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
}

html.${customThemeClass} .tabs-field__tab-button {
  background: transparent !important;
  border: 0 !important;
  color: rgba(255, 255, 255, 0.6) !important;
  padding: 10px 14px !important;
  border-radius: 12px 12px 0 0 !important;
}

html.${customThemeClass} .tabs-field__tab-button--active {
  background: rgba(139, 92, 246, 0.15) !important;
  color: #ffffff !important;
  border: 0 !important;
}

html.${customThemeClass} .banner:not(.banner--type-error):not(.banner--type-success) {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: var(--theme-text) !important;
}

html.${customThemeClass} .id-label {
  background: rgba(20, 20, 25, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 999px !important;
  color: var(--theme-text) !important;
}

html.${customThemeClass} .document-fields__edit {
  padding-top: 1.1rem !important;
}

@media (min-width: 1025px) {
  html.${customThemeClass} .document-fields__sidebar-wrap {
    top: calc(var(--app-header-height) + var(--doc-controls-height)) !important;
    height: calc(100vh - var(--app-header-height) - var(--doc-controls-height)) !important;
  }
}

@keyframes glass-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

html.${customThemeClass} .card,
html.${customThemeClass} .table {
  animation: glass-in 0.45s ease-out;
}
`

export const customThemeVars: Record<string, string> = {
  '--theme-elevation-0': '#050505',
  '--theme-elevation-50': 'rgba(255, 255, 255, 0.04)',
  '--theme-elevation-100': 'rgba(255, 255, 255, 0.06)',
  '--theme-elevation-150': 'rgba(255, 255, 255, 0.08)',
  '--theme-elevation-200': 'rgba(255, 255, 255, 0.1)',
  '--theme-elevation-250': 'rgba(255, 255, 255, 0.12)',
  '--theme-elevation-400': '#94a3b8',
  '--theme-elevation-600': '#cbd5e1',
  '--theme-elevation-800': '#e2e8f0',
  '--theme-elevation-900': '#f8fafc',
  '--theme-text': '#f8fafc',
  '--theme-bg': 'transparent',
  '--theme-border-color': 'rgba(255, 255, 255, 0.06)',
  '--theme-input-bg': 'rgba(20, 20, 25, 0.65)',
  '--font-body': '"Inter", sans-serif',
  '--style-radius-s': '10px',
  '--style-radius-m': '16px',
  '--style-radius-l': '20px',
  '--app-header-height': '72px',
  '--doc-controls-height': '64px',
  '--nav-width': '280px',
  '--glass-surface': 'rgba(20, 20, 25, 0.48)',
  '--glass-surface-strong': 'rgba(20, 20, 25, 0.56)',
  '--glass-border': 'rgba(255, 255, 255, 0.06)',
  '--glass-shadow': '0 4px 14px 0 rgba(0, 0, 0, 0.3)',
  '--accent-300': '#c4b5fd',
  '--accent-400': '#8b5cf6',
  '--accent-500': '#ec4899',
}
