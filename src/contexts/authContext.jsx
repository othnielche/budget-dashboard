import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('isAuthenticated') === 'true'
    );

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem(`user`)) || null 
    );
    
    /**
     * Log in user with provided user data
     * @param {Object} userData - user data to log in
     * @param {string} userData.token - user token
     * @param {string} userData.groupCode - user group code
     * @param {string} userData.roleCode - user role code
     * @param {string} userData.estateCode - user estate code
     */
    const logIn = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem(`user`, JSON.stringify(userData));
        console.log('User logged in:', userData);
    };

    // Logout function
    const logOut = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem(`user`);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, logIn, logOut }}>
            {children}
        </AuthContext.Provider>

    );
}