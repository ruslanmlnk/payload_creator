'use client'

import React from 'react'
import { Move, ChevronRight } from 'lucide-react'

interface ListWidgetProps {
  dragHandleProps?: any
}

const items = [
  {
    id: 1,
    name: 'Alice Cooper',
    action: 'New Subscription',
    time: '2m ago',
    img: 'https://i.pravatar.cc/150?u=1',
  },
  {
    id: 2,
    name: 'Bob Smith',
    action: 'Upgraded Plan',
    time: '15m ago',
    img: 'https://i.pravatar.cc/150?u=2',
  },
  {
    id: 3,
    name: 'Charlie Day',
    action: 'Project Completed',
    time: '1h ago',
    img: 'https://i.pravatar.cc/150?u=3',
  },
  {
    id: 4,
    name: 'Diana Ross',
    action: 'New Invoice',
    time: '3h ago',
    img: 'https://i.pravatar.cc/150?u=4',
  },
]

export const ListWidget: React.FC<ListWidgetProps> = ({ dragHandleProps }) => {
  return (
    <div className="list-widget group">
      <div {...dragHandleProps} className="list-drag-handle">
        <Move size={14} />
      </div>

      <div className="list-header">
        <h3 className="list-title">Recent Activity</h3>
        <button className="btn-list-view">View All</button>
      </div>

      <div className="list-container custom-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="list-item group/item">
            <img src={item.img} alt={item.name} className="list-avatar" />
            <div className="list-info">
              <h5 className="list-name">{item.name}</h5>
              <p className="list-action">{item.action}</p>
            </div>
            <span className="list-time">{item.time}</span>
            <ChevronRight size={16} className="list-arrow" />
          </div>
        ))}
      </div>
    </div>
  )
}
