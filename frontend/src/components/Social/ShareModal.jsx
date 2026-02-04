import React, { useState } from 'react';

const ShareModal = ({ isOpen, onClose, onShare, snippetTitle }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={styles.title}>Share Code Snippet</h3>
                <p style={styles.text}>Are you sure you want to make "<strong>{snippetTitle}</strong>" public?</p>
                <p style={styles.subtext}>Anyone with the link or browsing the community page will be able to view it.</p>

                <div style={styles.actions}>
                    <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                    <button onClick={onShare} style={styles.shareBtn}>🚀 Share Publicly</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        background: '#252526',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        border: '1px solid #444',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    },
    title: {
        marginTop: 0,
        color: '#fff',
        fontSize: '18px'
    },
    text: {
        color: '#ccc',
        marginBottom: '10px'
    },
    subtext: {
        color: '#888',
        fontSize: '12px',
        marginBottom: '20px'
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    },
    cancelBtn: {
        background: 'transparent',
        border: '1px solid #555',
        color: '#aaa',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    shareBtn: {
        background: 'linear-gradient(135deg, #007acc, #005f9e)',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};

export default ShareModal;
