/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * Component that makes a pop up to allow post creation
 */
import React from 'react';
import '../css/CreatePostPopup.css';

const Popup = ({ children, onClose }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Popup;