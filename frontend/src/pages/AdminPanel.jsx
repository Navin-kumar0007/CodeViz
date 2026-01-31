import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AdminPanel - User and role management dashboard
 * Only accessible by admin users
 */

const AdminPanel = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Data
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Modals
    const [deleteModal, setDeleteModal] = useState(null);
    const [roleModal, setRoleModal] = useState(null);

    // Get user info
    const getUserInfo = () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch {
            return null;
        }
    };

    const user = getUserInfo();

    // Check admin access
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, []);

    // Fetch on filter/page change
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [searchQuery, roleFilter, pagination.page, pagination.limit]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchUsers()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (roleFilter !== 'all') params.append('role', roleFilter);
            params.append('page', pagination.page);
            params.append('limit', pagination.limit);

            const res = await fetch(`http://localhost:5001/api/admin/users?${params}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const confirmRoleChange = (userId, userName, currentRole, newRole) => {
        if (currentRole === newRole) return;
        setRoleModal({ userId, userName, currentRole, newRole });
    };

    const updateRole = async () => {
        if (!roleModal) return;

        try {
            const res = await fetch(`http://localhost:5001/api/admin/users/${roleModal.userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ role: roleModal.newRole })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                setRoleModal(null);
                fetchUsers();
                fetchStats();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message);
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            setError('Failed to update role');
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                fetchUsers();
                fetchStats();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message);
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            setError('Failed to update status');
        }
    };

    const deleteUser = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                setDeleteModal(null);
                fetchUsers();
                fetchStats();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message);
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            setError('Failed to delete user');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateStr) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'admin': return { background: '#e53935', color: '#fff' };
            case 'instructor': return { background: '#4caf50', color: '#fff' };
            default: return { background: '#667eea', color: '#fff' };
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading admin panel...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <button onClick={() => navigate('/')} style={styles.backBtn}>
                    ← Dashboard
                </button>
                <h2 style={styles.title}>🛡️ Admin Panel</h2>
                <div style={styles.userBadge}>
                    {user?.name}
                    <span style={styles.adminBadge}>Admin</span>
                </div>
            </header>

            {/* Messages */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={styles.error}
                    >
                        {error}
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={styles.success}
                    >
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Cards */}
            {stats && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>👥</div>
                        <div style={styles.statValue}>{stats.totalUsers}</div>
                        <div style={styles.statLabel}>Total Users</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🎓</div>
                        <div style={styles.statValue}>{stats.students}</div>
                        <div style={styles.statLabel}>Students</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>👨‍🏫</div>
                        <div style={styles.statValue}>{stats.instructors}</div>
                        <div style={styles.statLabel}>Instructors</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🛡️</div>
                        <div style={styles.statValue}>{stats.admins}</div>
                        <div style={styles.statLabel}>Admins</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🏫</div>
                        <div style={styles.statValue}>{stats.totalClassrooms}</div>
                        <div style={styles.statLabel}>Classrooms</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🚫</div>
                        <div style={{ ...styles.statValue, color: stats.suspendedUsers > 0 ? '#e53935' : '#667eea' }}>
                            {stats.suspendedUsers}
                        </div>
                        <div style={styles.statLabel}>Suspended</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    style={styles.searchInput}
                />
                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    style={styles.filterSelect}
                >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="instructor">Instructors</option>
                    <option value="admin">Admins</option>
                </select>
                <select
                    value={pagination.limit}
                    onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                    style={styles.filterSelect}
                >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                </select>
            </div>

            {/* Users Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>User</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Last Login</th>
                            <th style={styles.th}>Joined</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={styles.noData}>No users found</td>
                            </tr>
                        ) : (
                            users.map((u, idx) => (
                                <tr key={u._id} style={idx % 2 === 0 ? styles.evenRow : {}}>
                                    <td style={styles.td}>
                                        <div style={styles.userName}>{u.name}</div>
                                        <div style={styles.userEmail}>{u.email}</div>
                                    </td>
                                    <td style={styles.td}>
                                        {u._id !== user._id ? (
                                            <button
                                                onClick={() => toggleUserStatus(u._id, u.isActive)}
                                                style={{
                                                    ...styles.statusBadge,
                                                    background: u.isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(229, 57, 53, 0.2)',
                                                    color: u.isActive ? '#4caf50' : '#e53935',
                                                    border: `1px solid ${u.isActive ? 'rgba(76, 175, 80, 0.4)' : 'rgba(229, 57, 53, 0.4)'}`
                                                }}
                                            >
                                                {u.isActive ? '✓ Active' : '✕ Suspended'}
                                            </button>
                                        ) : (
                                            <span style={{ ...styles.statusBadge, background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}>
                                                ✓ Active
                                            </span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <select
                                            value={u.role}
                                            onChange={(e) => confirmRoleChange(u._id, u.name, u.role, e.target.value)}
                                            style={{
                                                ...styles.roleSelect,
                                                ...getRoleBadgeStyle(u.role)
                                            }}
                                            disabled={u._id === user._id}
                                        >
                                            <option value="student">Student</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ color: u.lastLogin ? '#ccc' : '#666' }}>
                                            {formatDateShort(u.lastLogin)}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{formatDateShort(u.createdAt)}</td>
                                    <td style={styles.td}>
                                        {u._id !== user._id ? (
                                            <button
                                                onClick={() => setDeleteModal(u)}
                                                style={styles.deleteBtn}
                                            >
                                                🗑️
                                            </button>
                                        ) : (
                                            <span style={{ color: '#666' }}>You</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        style={{ ...styles.pageBtn, opacity: pagination.page === 1 ? 0.5 : 1 }}
                    >
                        ← Previous
                    </button>
                    <span style={styles.pageInfo}>
                        Page {pagination.page} of {pagination.pages} ({pagination.total} users)
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                        style={{ ...styles.pageBtn, opacity: pagination.page === pagination.pages ? 0.5 : 1 }}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Role Change Confirmation Modal */}
            <AnimatePresence>
                {roleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            style={styles.modal}
                        >
                            <h3 style={styles.modalTitle}>🔄 Confirm Role Change</h3>
                            <p style={styles.modalText}>
                                Change <strong>{roleModal.userName}</strong>'s role from{' '}
                                <span style={{ ...styles.rolePill, ...getRoleBadgeStyle(roleModal.currentRole) }}>
                                    {roleModal.currentRole}
                                </span>{' '}
                                to{' '}
                                <span style={{ ...styles.rolePill, ...getRoleBadgeStyle(roleModal.newRole) }}>
                                    {roleModal.newRole}
                                </span>?
                            </p>
                            {roleModal.newRole === 'admin' && (
                                <p style={styles.modalWarning}>
                                    ⚠️ Admin users have full system access!
                                </p>
                            )}
                            <div style={styles.modalActions}>
                                <button onClick={() => setRoleModal(null)} style={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button onClick={updateRole} style={styles.confirmBtn}>
                                    Confirm Change
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            style={styles.modal}
                        >
                            <h3 style={styles.modalTitle}>⚠️ Confirm Delete</h3>
                            <p style={styles.modalText}>
                                Are you sure you want to delete <strong>{deleteModal.name}</strong> ({deleteModal.email})?
                            </p>
                            <p style={styles.modalWarning}>This action cannot be undone!</p>
                            <div style={styles.modalActions}>
                                <button onClick={() => setDeleteModal(null)} style={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button onClick={() => deleteUser(deleteModal._id)} style={styles.confirmDeleteBtn}>
                                    Delete User
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        padding: '20px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    title: { margin: 0, fontSize: '24px' },
    userBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(229, 57, 53, 0.2)',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px'
    },
    adminBadge: {
        background: '#e53935',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold'
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        color: '#888'
    },
    error: {
        background: 'rgba(255, 100, 100, 0.2)',
        border: '1px solid rgba(255, 100, 100, 0.5)',
        color: '#ff6b6b',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    success: {
        background: 'rgba(76, 175, 80, 0.2)',
        border: '1px solid rgba(76, 175, 80, 0.5)',
        color: '#4caf50',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '15px',
        marginBottom: '25px'
    },
    statCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
    },
    statIcon: { fontSize: '24px', marginBottom: '8px' },
    statValue: { fontSize: '28px', fontWeight: 'bold', color: '#667eea' },
    statLabel: { fontSize: '11px', color: '#888', marginTop: '5px', textTransform: 'uppercase' },
    filters: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px'
    },
    searchInput: {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontSize: '14px'
    },
    filterSelect: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px 20px',
        color: '#fff',
        fontSize: '14px',
        cursor: 'pointer'
    },
    tableContainer: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        textAlign: 'left',
        padding: '15px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#888',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    td: {
        padding: '15px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
    },
    evenRow: {
        background: 'rgba(255, 255, 255, 0.02)'
    },
    noData: {
        textAlign: 'center',
        color: '#666',
        padding: '40px'
    },
    userName: { fontWeight: '500', marginBottom: '2px' },
    userEmail: { fontSize: '12px', color: '#888' },
    statusBadge: {
        padding: '5px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500',
        cursor: 'pointer',
        border: 'none'
    },
    roleSelect: {
        padding: '6px 12px',
        borderRadius: '15px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '11px',
        cursor: 'pointer',
        outline: 'none'
    },
    deleteBtn: {
        background: 'rgba(229, 57, 53, 0.2)',
        border: '1px solid rgba(229, 57, 53, 0.4)',
        borderRadius: '6px',
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '20px',
        padding: '15px'
    },
    pageBtn: {
        background: 'rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.4)',
        color: '#667eea',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px'
    },
    pageInfo: {
        color: '#888',
        fontSize: '13px'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        background: '#1e1e2e',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '450px',
        width: '90%',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    modalTitle: { margin: '0 0 15px 0', fontSize: '20px' },
    modalText: { color: '#ccc', marginBottom: '10px', lineHeight: 1.6 },
    modalWarning: { color: '#e53935', fontSize: '13px', marginBottom: '20px' },
    modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    cancelBtn: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    confirmBtn: {
        background: '#667eea',
        border: 'none',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    confirmDeleteBtn: {
        background: '#e53935',
        border: 'none',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    rolePill: {
        padding: '3px 10px',
        borderRadius: '10px',
        fontSize: '12px',
        fontWeight: 'bold'
    }
};

export default AdminPanel;
