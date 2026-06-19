import "./App.css";
import { useState } from "react";
import { resetSocket } from "./socket/socket";
import GamePage from "./pages/GamePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LobbyPage from "./pages/LobbyPage";
import SurvivalPage from "./pages/SurvivalPage";

const VIEWS = {
    LOGIN: "login",
    SIGNUP: "signup",
    LOBBY: "lobby",
    GAME: "game",
    SURVIVAL: "survival",
    PROFILE: "profile",
    LEADERBOARD: "leaderboard"
};

function saveAuth(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

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

export default function App() {
    const saved = loadAuth();
    const savedView = localStorage.getItem("view");

    const initialView = saved
        ? (Object.values(VIEWS).includes(savedView) ? savedView : VIEWS.LOBBY)
        : VIEWS.LOGIN;

    const [view, setViewState] = useState(initialView);
    const [token, setToken] = useState(saved?.token ?? null);
    const [user, setUser] = useState(saved?.user ?? null);

    function setView(newView) {
        localStorage.setItem("view", newView);
        setViewState(newView);
    }

    function handleLoginSuccess(token, user) {
        saveAuth(token, user);
        setToken(token);
        setUser(user);
        setView(VIEWS.LOBBY);
    }

    function handleLogout() {
        clearAuth();
        localStorage.removeItem("view");
        resetSocket();
        setToken(null);
        setUser(null);
        setView(VIEWS.LOGIN);
    }

    const nav = {
        onLobby: () => setView(VIEWS.LOBBY),
        onProfile: () => setView(VIEWS.PROFILE),
        onLeaderboard: () => setView(VIEWS.LEADERBOARD),
        onLogout: handleLogout
    };

    if (view === VIEWS.LOGIN) {
        return <LoginPage onSuccess={handleLoginSuccess} onSwitch={() => setView(VIEWS.SIGNUP)} />;
    }

    if (view === VIEWS.SIGNUP) {
        return <SignupPage onSuccess={handleLoginSuccess} onSwitch={() => setView(VIEWS.LOGIN)} />;
    }

    if (view === VIEWS.LOBBY) {
        return (
            <LobbyPage
                user={user}
                onBlitz={() => setView(VIEWS.GAME)}
                onSurvival={() => setView(VIEWS.SURVIVAL)}
                {...nav}
            />
        );
    }

    if (view === VIEWS.GAME) {
        return <GamePage user={user} token={token} onBack={() => setView(VIEWS.LOBBY)} {...nav} />;
    }

    if (view === VIEWS.SURVIVAL) {
        return <SurvivalPage user={user} token={token} onBack={() => setView(VIEWS.LOBBY)} {...nav} />;
    }

    if (view === VIEWS.PROFILE) {
        return <ProfilePage token={token} onBack={() => setView(VIEWS.LOBBY)} {...nav} />;
    }

    if (view === VIEWS.LEADERBOARD) {
        return <LeaderboardPage token={token} onBack={() => setView(VIEWS.LOBBY)} {...nav} />;
    }
}