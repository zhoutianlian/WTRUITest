// src/components/dashboard/WidgetWrapper.tsx
import React from 'react';
import './WidgetWrapper.css';

interface WidgetWrapperProps {
  title: string;
  children: React.ReactNode;
  // TODO: Add props for settings, remove actions, etc. in future iterations
  // onSettings?: () => void;
  // onRemove?: () => void;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ title, children }) => {
  return (
    <div className="widget-wrapper">
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        <div className="widget-actions">
          {/* Placeholder for action icons. Using text for now. */}
          <button className="widget-action-button" title="Settings">⚙️</button>
          <button className="widget-action-button" title="More options">⋮</button>
          {/* <button className="widget-action-button" title="Remove">❌</button> */}
        </div>
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};
export default WidgetWrapper;
