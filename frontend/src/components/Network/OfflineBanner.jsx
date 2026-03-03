import React, { useState, useEffect } from 'react';

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div style={styles.banner}>
            <span style={styles.icon}>📶</span>
            <span>You are currently offline. Changes will be saved locally and synced when you reconnect. (Note: C++ & Java execution require internet).</span>
        </div>
    );
};

const styles = {
    banner: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#ed8936',
        color: '#fff',
        textAlign: 'center',
        padding: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
    },
    icon: {
        fontSize: '18px'
    }
};

export default OfflineBanner;
