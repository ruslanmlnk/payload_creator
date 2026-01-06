import type { Config as PayloadConfig } from 'payload'
import { analyticsScript } from './endpoints/analytics/analyticsScript.js'
import { analyticsTrack } from './endpoints/analytics/analyticsTrack.js'
import { dashboardLayoutGet, dashboardLayoutSave } from './endpoints/dashboardLayout.js'
import { collectionsGet } from './endpoints/collectionsGet.js'
import { metricsGet } from './endpoints/metricsGet.js'
import { storageGet } from './endpoints/storageGet.js'
import { DashboardLayouts } from './collections/DashboardLayouts.js'

export type PluginOptions = {
  disabled?: boolean
}

export const myPlugin =
  (pluginOptions: PluginOptions = {}) =>
    (config: PayloadConfig): PayloadConfig => {
      if (pluginOptions.disabled) {
        return config
      }

      if (!config.admin) {
        config.admin = {}
      }

      if (!config.admin.components) {
        config.admin.components = {}
      }

      if (!config.admin.components.actions) {
        config.admin.components.actions = []
      }

      config.admin.components.actions.push(
        `payload-plugin-template/client#ThemeSelector`,
      )

      if (!config.admin.components.providers) {
        config.admin.components.providers = []
      }

      if (!config.endpoints) {
        config.endpoints = []
      }

      config.endpoints.push({
        handler: analyticsScript,
        method: 'get',
        path: '/analytics.js',
      });

      config.endpoints.push({
        handler: analyticsTrack,
        method: 'post',
        path: '/analytics/track',
      });

      config.endpoints.push({
        handler: dashboardLayoutGet,
        method: 'get',
        path: '/dashboard-layout',
      });

      config.endpoints.push({
        handler: dashboardLayoutSave,
        method: 'post',
        path: '/dashboard-layout',
      });

      config.endpoints.push({
        handler: collectionsGet,
        method: 'post',
        path: '/collections-get',
      });

      config.endpoints.push({
        handler: metricsGet,
        method: 'post',
        path: '/metrics-get',
      });

      config.endpoints.push({
        handler: storageGet,
        method: 'get',
        path: '/storage-get',
      });

      const themeProviderPath = `payload-plugin-template/server#ThemeBootstrap`
      if (!config.admin.components.providers.includes(themeProviderPath)) {
        config.admin.components.providers.unshift(themeProviderPath)
      }

      if (!config.admin.components.views) {
        config.admin.components.views = {}
      }

      if (!config.admin.components.views.dashboard) {
        config.admin.components.views.dashboard = {
          Component: `payload-plugin-template/client#Dashboard`,
        }
      }

      if (!config.collections) {
        config.collections = []
      }

      const hasDashboardLayouts = config.collections.some(
        (collection) => collection.slug === DashboardLayouts.slug,
      )

      if (!hasDashboardLayouts) {
        config.collections.push(DashboardLayouts)
      }

      return config
    }
