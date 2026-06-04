import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProfilePage({ token, onBack, onLogout }) {
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        async function parseResponseError(response) {
            try {
                const data = await response.json();
                return data.message || JSON.stringify(data);
            } catch {
                return await response.text();
            }
        }

        async function loadProfile() {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [profileRes, matchesRes] = await Promise.all([
                    fetch(`${API}/api/users/me`, { headers, credentials: 'include' }),
                    fetch(`${API}/api/users/me/matches`, { headers, credentials: 'include' }),
                ]);

                if (!profileRes.ok) {
                    const body = await parseResponseError(profileRes);
                    throw new Error(`Profile request failed: ${profileRes.status} ${profileRes.statusText} - ${body}`);
                }

                if (!matchesRes.ok) {
                    const body = await parseResponseError(matchesRes);
                    throw new Error(`Matches request failed: ${matchesRes.status} ${matchesRes.statusText} - ${body}`);
                }

                const profileData = await profileRes.json();
                const matchesData = await matchesRes.json();
                setProfile(profileData.data);
                setMatches(matchesData.data || []);
            } catch (err) {
                console.error("Profile load error", err);
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [token]);

    if (loading) {
        return (
            <div className="page">
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div style={{ maxWidth: 520, textAlign: 'left' }}>
                    <p className="error-text">{error}</p>
                    <div style={{ marginTop: 16, color: '#9ca3af', fontSize: 13, lineHeight: 1.5 }}>
                        <p><strong>Backend URL:</strong> {API}</p>
                        <p><strong>Token present:</strong> {token ? 'yes' : 'no'}</p>
                        <p><strong>Note:</strong> If this shows a local URL, your deployed app is still using the fallback value.</p>
                    </div>
                </div>
            </div>
        );
    }

    const total = profile.gamesPlayed ?? profile.wins + profile.losses;
    const winRate = total > 0 ? Math.round((profile.wins / total) * 100) : 0;

    return (
        <div className="root profile-root">
            <header className="header">
                <span className="logo">Mathify</span>
                <div className="profile-actions">
                    <button className="btn-secondary" onClick={onBack}>Play</button>
                    <button className="btn-danger" onClick={onLogout}>Log out</button>
                </div>
            </header>

            <main className="main profile-main">
                <div className="profile-column">
                    <div className="profile-card profile-identity">
                        <div className="avatar">{profile.username[0].toUpperCase()}</div>
                        <div>
                            <p className="profile-name">{profile.username}</p>
                            <p className="profile-email">{profile.email}</p>
                        </div>
                    </div>

                    <div className="profile-grid">
                        {[
                            { label: "Rating", value: profile.rating, color: "#6ee7b7" },
                            { label: "Wins", value: profile.wins, color: "#6ee7b7" },
                            { label: "Losses", value: profile.losses, color: "#f9a8d4" },
                            { label: "Win rate", value: `${winRate}%`, color: "#a5b4fc" },
                        ].map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <span style={{ color: stat.color }}>{stat.value}</span>
                                <span>{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="profile-card match-history">
                        <p className="match-history-title">Recent matches</p>
                        {matches.length === 0 ? (
                            <p className="no-matches">No matches yet — go play!</p>
                        ) : (
                            matches.map((match) => {
                                const won = match.winner === profile._id || match.winner?._id === profile._id;
                                const abandoned = match.status === "abandoned";
                                const opponentName = match.opponent?.username ?? "Unknown";
                                const delta = match.ratingDelta > 0 ? `+${match.ratingDelta}` : `${match.ratingDelta}`;
                                return (
                                    <div key={match._id} className="match-row">
                                        <span className={won ? "match-status win" : "match-status loss"}>
                                            {abandoned ? "A" : won ? "W" : "L"}
                                        </span>
                                        <span className="match-opponent">vs {opponentName}</span>
                                        <span className="match-delta">{delta}</span>
                                        <span className="match-date">{new Date(match.endedAt).toLocaleDateString()}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
