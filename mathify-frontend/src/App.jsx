import "./App.css";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { resetSocket } from "./socket/socket";
import GamePage from "./pages/GamePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LobbyPage from "./pages/LobbyPage";
import SurvivalPage from "./pages/SurvivalPage";

function parseJwt(token) {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function isJwtExpired(token) {
    const payload = parseJwt(token);
    if (!payload || typeof payload.exp !== "number") return true;
    return Date.now() >= payload.exp * 1000;
}

function saveAuth(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

function loadAuth() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user || isJwtExpired(token)) {
        clearAuth();
        return null;
    }
    return { token, user: JSON.parse(user) };
}

function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Inner App Component with Routes
function AppRoutes() {
    const navigate = useNavigate();
    const saved = loadAuth();

    const [token, setToken] = useState(saved?.token ?? null);
    const [user, setUser] = useState(saved?.user ?? null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!saved);

    function handleLoginSuccess(token, user) {
        saveAuth(token, user);
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        navigate("/lobby");
    }

    function handleLogout() {
        clearAuth();
        resetSocket();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        navigate("/login");
    }

    const navProps = {
        onLobby: () => navigate("/lobby"),
        onProfile: () => navigate("/profile/:username"),
        onLeaderboard: () => navigate("/leaderboard"),
        onLogout: handleLogout
    };

    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/lobby" replace /> : 
                <LoginPage onSuccess={handleLoginSuccess} onSwitch={() => navigate("/signup")} />
            } />
            <Route path="/signup" element={
                isAuthenticated ? <Navigate to="/lobby" replace /> : 
                <SignupPage onSuccess={handleLoginSuccess} onSwitch={() => navigate("/login")} />
            } />

            {/* Protected Routes */}
            <Route path="/lobby" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <LobbyPage
                        user={user}
                        onBlitz={() => navigate("/game")}
                        onSurvival={() => navigate("/survival")}
                        {...navProps}
                    />
                </ProtectedRoute>
            } />

            <Route path="/game" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <GamePage user={user} token={token} onBack={() => navigate("/lobby")} {...navProps} />
                </ProtectedRoute>
            } />

            <Route path="/survival" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <SurvivalPage user={user} token={token} onBack={() => navigate("/lobby")} {...navProps} />
                </ProtectedRoute>
            } />

            <Route path="/profile/:username" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <ProfilePage token={token} onBack={() => navigate("/lobby")} {...navProps} />
                </ProtectedRoute>
            } />

            <Route path="/leaderboard" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <LeaderboardPage token={token} onBack={() => navigate("/lobby")} {...navProps} />
                </ProtectedRoute>
            } />

            {/* Default Route */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/lobby" : "/login"} replace />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/lobby" : "/login"} replace />} />
        </Routes>
    );
}

// Main App Component
export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}