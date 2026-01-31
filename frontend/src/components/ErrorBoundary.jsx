import React, { Component } from 'react';

/**
 * ErrorBoundary - Catches JavaScript errors in child component tree
 * Displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div style={styles.container}>
                    <div style={styles.icon}>⚠️</div>
                    <h3 style={styles.title}>Something went wrong</h3>
                    <p style={styles.message}>
                        {this.props.fallbackMessage || 'An error occurred while rendering this component.'}
                    </p>
                    {this.state.error && (
                        <details style={styles.details}>
                            <summary style={styles.summary}>Error Details</summary>
                            <pre style={styles.errorText}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={this.handleRetry}
                        style={styles.retryButton}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'rgba(255, 107, 107, 0.1)',
        border: '1px solid rgba(255, 107, 107, 0.3)',
        borderRadius: '12px',
        margin: '10px',
        textAlign: 'center'
    },
    icon: {
        fontSize: '48px',
        marginBottom: '15px'
    },
    title: {
        color: '#ff6b6b',
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 10px 0'
    },
    message: {
        color: '#888',
        fontSize: '14px',
        margin: '0 0 15px 0'
    },
    details: {
        width: '100%',
        maxWidth: '400px',
        textAlign: 'left',
        marginBottom: '15px'
    },
    summary: {
        color: '#666',
        fontSize: '12px',
        cursor: 'pointer',
        marginBottom: '10px'
    },
    errorText: {
        background: 'rgba(0, 0, 0, 0.3)',
        color: '#ff6b6b',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '11px',
        overflow: 'auto',
        maxHeight: '100px'
    },
    retryButton: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s'
    }
};

export default ErrorBoundary;
