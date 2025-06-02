// src/components/dashboard/widgets/SimpleTextWidget.tsx
import React from 'react';

interface SimpleTextWidgetProps {
  content: string;
  className?: string; // Allow passing custom class for specific styling
}

const SimpleTextWidget: React.FC<SimpleTextWidgetProps> = ({ content, className }) => {
  return (
    <p className={`simple-text-widget ${className || ''}`}>
      {content}
    </p>
  );
};

export default SimpleTextWidget;
