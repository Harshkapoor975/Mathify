import { useState } from "react";
import { getRank } from "../utils/ranks";

export default function Navbar({ user, onProfile, onLeaderboard, onLogout, onLobby, activePage }) {
    const [open, setOpen] = useState(false);

    // Get mathematician rank details based on user rating
    const rank = getRank(user?.rating ?? 1000);

    const navItems = [
        { key: "lobby", label: "Play Blitz", icon: "⚡", action: () => { onLobby(); setOpen(false); } },
        { key: "profile", label: "My Profile", icon: "◉", action: () => { onProfile(); setOpen(false); } },
        { key: "leaderboard", label: "Leaderboard", icon: "▲", action: () => { onLeaderboard(); setOpen(false); } },
    ];

    return (
        <div className="corner-nav-container">
            {/* Toggle Button */}
            <button
                className="corner-nav-toggle"
                onClick={() => setOpen(prev => !prev)}
                title="Navigation Menu"
                aria-label="Toggle navigation menu"
            >
                {open ? "✕" : "☰"}
            </button>

            {/* Backdrop overlay when open to handle clicking outside */}
            {open && (
                <div
                    className="corner-nav-overlay"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Floating Dropdown/Slide-out Menu */}
            {open && (
                <nav className="corner-nav-menu">
                    {/* User profile card in Navbar */}
                    {user && (
                        <div className="corner-nav-header">
                            <div className="corner-nav-avatar">
                                {user.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="corner-nav-userinfo">
                                <span className="corner-nav-username">{user.username}</span>
                                <span className="corner-nav-rating" title={`${rank.character} - ${rank.discovery}`}>
                                    {rank.badge} {rank.title} (★{user.rating ?? 1000})
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Nav Items */}
                    <div className="corner-nav-items">
                        {navItems.map(item => {
                            const isActive = activePage === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={item.action}
                                    className={`corner-nav-item ${isActive ? "active" : ""}`}
                                >
                                    <span style={{ fontSize: "14px" }}>{item.icon}</span>
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Logout Footer */}
                    <div className="corner-nav-footer">
                        <button
                            onClick={() => { onLogout(); setOpen(false); }}
                            className="corner-nav-logout"
                        >
                            <span>✕</span>
                            Log Out
                        </button>
                    </div>
                </nav>
            )}
        </div>
    );
}