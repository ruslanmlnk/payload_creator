'use client'

import React from 'react'
import { Move, MessageSquare, Check, Trash2 } from 'lucide-react'

interface RecentCommentsWidgetProps {
  dragHandleProps?: any
}

const comments = [
  {
    id: 1,
    user: 'Sarah J.',
    avatar: 'https://i.pravatar.cc/150?u=30',
    text: 'Great article! Helped me set up my environment.',
    time: '2m',
    status: 'pending',
  },
  {
    id: 2,
    user: 'Mike T.',
    avatar: 'https://i.pravatar.cc/150?u=22',
    text: 'Is this compatible with version 18?',
    time: '15m',
    status: 'pending',
  },
  {
    id: 3,
    user: 'Alex Dev',
    avatar: 'https://i.pravatar.cc/150?u=12',
    text: 'Found a small bug in the second example.',
    time: '1h',
    status: 'pending',
  },
]

export const RecentCommentsWidget: React.FC<RecentCommentsWidgetProps> = ({ dragHandleProps }) => {
  return (
    <div className="comments-widget group">
      <div {...dragHandleProps} className="comments-drag-handle">
        <Move size={14} />
      </div>

      <div className="comments-header">
        <h3 className="comments-title">
          <div className="icon-badge">
            <MessageSquare size={16} />
          </div>
          Pending Comments
        </h3>
        <span className="count-badge">3</span>
      </div>

      <div className="comments-list custom-scrollbar">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <img src={comment.avatar} alt={comment.user} className="comment-avatar" />

            <div className="comment-content">
              <div className="comment-meta">
                <span className="comment-user">{comment.user}</span>
                <span className="comment-time">{comment.time}</span>
              </div>
              <p className="comment-text">{comment.text}</p>

              <div className="comment-actions">
                <button className="btn-action btn-approve">
                  <Check size={12} /> Approve
                </button>
                <button className="btn-action btn-reject">
                  <Trash2 size={12} /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
