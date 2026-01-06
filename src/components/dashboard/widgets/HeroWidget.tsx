'use client'

import React from 'react'
import { ArrowRight, Move, Globe, ShieldCheck } from 'lucide-react'

interface HeroWidgetProps {
  dragHandleProps?: any
}

export const HeroWidget: React.FC<HeroWidgetProps> = ({ dragHandleProps }) => {
  return (
    <div className="hero-widget group">
      <div {...dragHandleProps} className="hero-drag-handle">
        <Move size={16} />
      </div>

      <div className="hero-bg-layer">
        <div className="hero-gradient-orb"></div>
        <div className="hero-gradient-bottom"></div>
        <div className="hero-noise"></div>
      </div>

      <div className="hero-content">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div className="hero-badge">
            <span className="status-dot">
              <span className="status-ping"></span>
              <span className="status-solid"></span>
            </span>
            System Operational
          </div>

          <div>
            <h2 className="hero-title">
              Welcome back, <br />
              <span className="text-gradient">Administrator</span>
            </h2>
            <p className="hero-description">
              Your platform is performing well. Traffic is up by 12% compared to yesterday. No
              critical alerts found.
            </p>
          </div>
        </div>

        <div className="hero-footer">
          <button className="btn-analytics">
            Open Analytics <ArrowRight size={16} />
          </button>

          <div className="hero-divider"></div>

          <div className="hero-stats">
            <div className="stat-item">
              <Globe size={16} style={{ color: '#60a5fa' }} />
              <span>
                Region: <strong style={{ color: 'white' }}>EU-West</strong>
              </span>
            </div>
            <div className="stat-item">
              <ShieldCheck size={16} style={{ color: '#34d399' }} />
              <span>
                Security: <strong style={{ color: 'white' }}>Optimal</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
