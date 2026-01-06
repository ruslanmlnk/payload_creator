'use client'

import { useEffect, useRef } from 'react'
import { useConfig } from '@payloadcms/ui'
import { DashboardGrid } from './dashboard/DashboardGrid.js'

export const Dashboard = () => {
  const hasLogged = useRef(false)
  const configContext = useConfig()
  const collections = configContext?.config?.collections
  console.log('[payload-plugin-template] collections', collections)

  useEffect(() => {
    if (hasLogged.current || !collections) {
      return
    }

    hasLogged.current = true
    console.log('[payload-plugin-template] collections', collections)
  }, [collections])

  return (
    <div className="custom-dashboard">
      <div className="custom-dashboard__content">
        <DashboardGrid />
      </div>
    </div>
  )
}
