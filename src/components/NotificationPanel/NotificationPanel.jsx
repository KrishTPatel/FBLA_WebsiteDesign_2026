/* src/components/NotificationPanel/NotificationPanel.jsx */
import React from 'react';
import './NotificationPanel.css';
import { NOTIFICATIONS } from '../../Data/constants.js';

export default function NotificationPanel({ closePanel }) {
  // Use the data you already have
  const notifications = NOTIFICATIONS; 

  return (
    <>
      {/* This invisible layer closes the menu if you click anywhere else */}
      <div className="notif-backdrop" onClick={closePanel} />
      
      <div className="notif-panel">
        <div className="notif-header">
          <div className="h4">Notifications</div>
        </div>
        <div className="notif-body">
          {notifications.map(notif => (
            <div key={notif.id} className="notif-item">
              <div className="notif-icon-wrap" style={{ background: notif.bg }}>
                {notif.icon}
              </div>
              <div className="notif-content">
                <div className="notif-title">{notif.title}</div>
                <div className="notif-desc">{notif.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}