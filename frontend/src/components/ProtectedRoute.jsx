// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Optionally show a loading spinner or message
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-700">Loading...</div>
            </div>
        );
    }

    if (!user) {
        // Not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but unauthorized role, redirect to dashboard or an unauthorized page
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
