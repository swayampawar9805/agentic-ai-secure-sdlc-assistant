import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {

        const token =
            localStorage.getItem("access_token");

        if (!token) {

            setLoading(false);
            return;

        }

        try {

            const response =
                await api.get("/auth/me/");

            setUser(response.data);

        } catch (error) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            setUser(null);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        loadUser();

    }, []);

    const login = async (
        username,
        password
    ) => {

        const response =
            await api.post(
                "/auth/login/",
                {
                    username,
                    password,
                }
            );

        localStorage.setItem(
            "access_token",
            response.data.access
        );

        localStorage.setItem(
            "refresh_token",
            response.data.refresh
        );

        const userResponse =
            await api.get("/auth/me/");

        setUser(userResponse.data);

        return userResponse.data;
    };

    const logout = async () => {

        const refreshToken =
            localStorage.getItem(
                "refresh_token"
            );

        try {

            if (refreshToken) {

                await api.post(
                    "/auth/logout/",
                    {
                        refresh: refreshToken,
                    }
                );

            }

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        } finally {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            setUser(null);

        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    return useContext(AuthContext);

}