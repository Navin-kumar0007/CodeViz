import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ClassroomJoinHandler = () => {
    const { code } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            // Save code and redirect to login
            sessionStorage.setItem('pendingClassroomCode', code);
            navigate('/login');
        } else {
            // User is logged in, send them to classroom to auto-join
            navigate('/classroom', { state: { autoJoinCode: code } });
        }
    }, [code, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', background: '#1e1e1e' }}>
            <h2>Joining Classroom {code}...</h2>
        </div>
    );
};

export default ClassroomJoinHandler;
