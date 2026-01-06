import React from 'react'

import {
  customThemeClass,
  customThemeCSS,
  customThemeVars,
} from '../theme/customTheme.js'

const storageKey = 'payload-plugin-theme'
const customThemeStyleId = 'payload-plugin-custom-theme-styles'

const themeBootstrapScript = `(function () {
  try {
    var stored = localStorage.getItem('${storageKey}');
    if (!stored) return;
    var root = document.documentElement;
    if (stored === 'custom') {
      root.classList.add('${customThemeClass}');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      var vars = ${JSON.stringify(customThemeVars)};
      for (var key in vars) {
        root.style.setProperty(key, vars[key]);
      }
    } else if (stored === 'light' || stored === 'dark') {
      root.classList.remove('${customThemeClass}');
      root.setAttribute('data-theme', stored);
      root.style.colorScheme = stored;
    }
  } catch (e) {}
})();`

type ThemeBootstrapProps = {
  children?: React.ReactNode
}

export const ThemeBootstrap = ({ children }: ThemeBootstrapProps) => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: customThemeCSS }}
        id={customThemeStyleId}
      />
      <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      {children}
    </>
  )
}
