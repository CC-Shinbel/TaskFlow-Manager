import { useState, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/User";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔐 Verify token on app load
    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem("token");

            console.log("Stored token:", token);

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                const response = await api.get("/user");

                console.log("Verification success:", response.data);

                setUser(response.data.data);
            } catch (error) {
                console.log("Verification failed:", error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post("/login", { email, password });

        const { user, token } = response.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(user);
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => {
        const response = await api.post("/register", {
            name,
            email,
            password,
            password_confirmation,
        });

        const { user, token } = response.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        delete api.defaults.headers.common["Authorization"];

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};