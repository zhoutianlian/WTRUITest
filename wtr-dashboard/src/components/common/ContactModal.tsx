import React from 'react';
import './ContactModal.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="contact-modal-header">
          <h2>Contact WTR</h2>
          <button onClick={onClose} className="contact-modal-close-btn">&times;</button>
        </div>
        <div className="contact-modal-body">
          <p>For any inquiries, please reach out to the appropriate department below:</p>
          <ul>
            <li><strong>General Inquiries:</strong> <a href="mailto:info@wtr.com">info@wtr.com</a></li>
            <li><strong>Research Desk:</strong> <a href="mailto:research@wtr.com">research@wtr.com</a></li>
            <li><strong>Partnerships:</strong> <a href="mailto:partners@wtr.com">partners@wtr.com</a></li>
            <li><strong>Technical Support:</strong> <a href="mailto:support@wtr.com">support@wtr.com</a></li>
            <li><strong>Careers:</strong> <a href="mailto:careers@wtr.com">careers@wtr.com</a></li>
          </ul>
        </div>
        <div className="contact-modal-footer">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
