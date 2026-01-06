'use client'

import React from 'react'
import { Move, Image, Settings, FilePlus, RefreshCw } from 'lucide-react'

interface QuickActionsWidgetProps {
  dragHandleProps?: any
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ dragHandleProps }) => {
  return (
    <div className="qa-widget group">
      <div {...dragHandleProps} className="qa-drag-handle">
        <Move size={14} />
      </div>

      <h3 className="qa-title">Quick Actions</h3>

      <div className="qa-grid">
        <button className="qa-btn qa-blue group/btn">
          <div className="qa-icon-circle">
            <FilePlus size={20} />
          </div>
          <span className="qa-label">New Post</span>
        </button>

        <button className="qa-btn qa-emerald group/btn">
          <div className="qa-icon-circle">
            <Image size={20} />
          </div>
          <span className="qa-label">Upload Media</span>
        </button>

        <button className="qa-btn qa-purple group/btn">
          <div className="qa-icon-circle">
            <RefreshCw size={20} />
          </div>
          <span className="qa-label">Clear Cache</span>
        </button>

        <button className="qa-btn qa-gray group/btn">
          <div className="qa-icon-circle">
            <Settings size={20} />
          </div>
          <span className="qa-label">Settings</span>
        </button>
      </div>
    </div>
  )
}
