import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, getCurrentUser, logout as logoutService, updateUserProfile } from '../service/auth/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const login = async ({ email, password }) => {
        setLoading(true);
        setError('');
        try {
            const res = await loginService(email, password);
            if (res.status === 'valide') {
                const loggedUser = { 
                    nom: res.nom, 
                    prenom: res.prenom, 
                    email: res.email, 
                    role: res.role,
                    photo_url: res.photo_url 
                };
                setUser(loggedUser);
                localStorage.setItem('user', JSON.stringify(loggedUser));
                return true;
            } else {
                setError(res.detail || "Échec de l'authentification. Vérifiez vos identifiants.");
                return false;
            }
        } catch (err) {
            setError(err.message || 'Erreur de connexion');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutService();
        } catch (err) {
            console.error('Logout failed:', err);
        }
        setUser(null);
        localStorage.removeItem('user');
        setLoading(false);
    };

    const checkSession = async () => {
        setLoading(true);
        setError('');
        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                // Ajouter le rôle depuis localStorage si pas présent dans la réponse
                const storedUser = localStorage.getItem('user');
                const storedUserData = storedUser ? JSON.parse(storedUser) : null;
                const userWithRole = {
                    ...currentUser,
                    role: currentUser.role || storedUserData?.role
                };
                setUser(userWithRole);
                localStorage.setItem('user', JSON.stringify(userWithRole));
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
            return !!currentUser;
        } catch (err) {
            console.error('Session check failed:', err);
            setUser(null);
            localStorage.removeItem('user');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData) => {
        setLoading(true);
        setError('');
        try {
            const updatedUser = await updateUserProfile(userData);
            if (updatedUser) {
                const newUser = { ...user, ...updatedUser };
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
                return true;
            }
            return false;
        } catch (err) {
            setError(err.message || 'Erreur de mise à jour du profil');
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, error, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}


