'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import './HeroCard.scss'

export const HeroCard = () => {
  return (
    <div className="hero-card">
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
          alt="Model"
        />
        <div className="hero-overlay-r"></div>
        <div className="hero-overlay-t"></div>
      </div>

      <div className="hero-content">
        <div className="hero-text-section">
          <span className="hero-subtitle">Popular Solution</span>
          <h2>
            Optimize <br />
            <span className="text-highlight">Your Metrics</span>
          </h2>

          <button className="btn-learn">Learn now</button>
        </div>

        <div className="glass-stats">
          <div className="stats-group">
            <div className="stat-item">
              <span className="stat-value">76k</span>
              <div className="stat-label text-blue">
                <div className="stat-dot bg-blue"></div> Users
              </div>
            </div>

            <div className="divider"></div>

            <div className="stat-item">
              <span className="stat-value">1.5m</span>
              <div className="stat-label text-pink">
                <div className="stat-dot bg-pink"></div> Clicks
              </div>
            </div>

            <div className="divider"></div>

            <div className="stat-item stat-item--highlight">
              <div className="stat-highlight-glow"></div>
              <span className="stat-value">$3.6k</span>
              <div className="stat-label text-orange">
                <div className="stat-dot bg-orange"></div> Sales
              </div>
            </div>

            <div className="divider"></div>

            <div className="stat-item">
              <span className="stat-value">47</span>
              <div className="stat-label text-gray">
                <div className="stat-dot bg-gray"></div> Items
              </div>
            </div>
          </div>

          <button className="btn-arrow">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
