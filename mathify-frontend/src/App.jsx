import "./App.css";
import { useState } from "react";
import { resetSocket } from "./socket/socket";
import GamePage from "./pages/GamePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import LeaderboardPage from "./pages/LeaderboardPage";

const AUTH_VIEWS = {
  LOGIN: "login",
  SIGNUP: "signup",
  GAME: "game",
  PROFILE: "profile",
  LEADERBOARD: "leaderboard"
};

function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function parseJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

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
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

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
  const [view, setView] = useState(saved ? AUTH_VIEWS.GAME : AUTH_VIEWS.LOGIN);
  const [token, setToken] = useState(saved?.token ?? null);
  const [user, setUser] = useState(saved?.user ?? null);

  function handleLoginSuccess(token, user) {
    saveAuth(token, user);
    setToken(token);
    setUser(user);
    setView(AUTH_VIEWS.GAME);
  }

  function handleLogout() {
    clearAuth();
    resetSocket();
    setToken(null);
    setUser(null);
    setView(AUTH_VIEWS.LOGIN);
  }

  if (view === AUTH_VIEWS.LOGIN) {
    return <LoginPage onSuccess={handleLoginSuccess} onSwitch={() => setView(AUTH_VIEWS.SIGNUP)} />;
  }

  if (view === AUTH_VIEWS.SIGNUP) {
    return <SignupPage onSuccess={handleLoginSuccess} onSwitch={() => setView(AUTH_VIEWS.LOGIN)} />;
  }

  if (view === AUTH_VIEWS.PROFILE) {
    return <ProfilePage token={token} onBack={() => setView(AUTH_VIEWS.GAME)} onLogout={handleLogout} onLeaderboard={() => setView(AUTH_VIEWS.LEADERBOARD)} />;
  }

  if (view === AUTH_VIEWS.LEADERBOARD) {
    return <LeaderboardPage token={token} onBack={() => setView(AUTH_VIEWS.GAME)} />;
  }

  // return <GamePage user={user} token={token} onProfile={() => setView(AUTH_VIEWS.PROFILE)} onLogout={handleLogout} />;
  return <GamePage user={user} token={token} onProfile={() => setView(AUTH_VIEWS.PROFILE)} onLogout={handleLogout} onLeaderboard={() => setView(AUTH_VIEWS.LEADERBOARD)} />;
}
