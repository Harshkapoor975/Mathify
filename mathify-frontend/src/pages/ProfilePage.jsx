// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "react-router-dom";
// const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// export default function ProfilePage({ token, onBack, onLogout,onLeaderboard }) {
//     const [profile, setProfile] = useState(null);
//     const [matches, setMatches] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     // const username = useParams().username;

//     useEffect(() => {
//         if (!token) return;

//         async function parseResponseError(response) {
//             try {
//                 const data = await response.json();
//                 return data.message || JSON.stringify(data);
//             } catch {
//                 return await response.text();
//             }
//         }

//         async function loadProfile() {
//             try {
//                 const headers = { Authorization: `Bearer ${token}` };
//                 const [profileRes, matchesRes] = await Promise.all([
//                     fetch(`${API}/api/users/me`, { headers, credentials: 'include' }),
//                     fetch(`${API}/api/users/me/matches`, { headers, credentials: 'include' }),
//                 ]);

//                 if (!profileRes.ok) {
//                     const body = await parseResponseError(profileRes);
//                     throw new Error(`Profile request failed: ${profileRes.status} ${profileRes.statusText} - ${body}`);
//                 }

//                 if (!matchesRes.ok) {
//                     const body = await parseResponseError(matchesRes);
//                     throw new Error(`Matches request failed: ${matchesRes.status} ${matchesRes.statusText} - ${body}`);
//                 }

//                 const profileData = await profileRes.json();
//                 const matchesData = await matchesRes.json();
//                 setProfile(profileData.data);
//                 setMatches(matchesData.data || []);
//             } catch (err) {
//                 console.error("Profile load error", err);
//                 setError(err.message || "Failed to load profile");
//             } finally {
//                 setLoading(false);
//             }
//         }

//         loadProfile();
//     }, [token]);

//     if (loading) {
//         return (
//             <div className="page">
//                 <div className="spinner" />
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="page">
//                 <div style={{ maxWidth: 520, textAlign: 'left' }}>
//                     <p className="error-text">{error}</p>
//                     <div style={{ marginTop: 16, color: '#9ca3af', fontSize: 13, lineHeight: 1.5 }}>
//                         <p><strong>Backend URL:</strong> {API}</p>
//                         <p><strong>Token present:</strong> {token ? 'yes' : 'no'}</p>
//                         <p><strong>Note:</strong> If this shows a local URL, your deployed app is still using the fallback value.</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const total = profile.gamesPlayed ?? profile.wins + profile.losses;
//     const winRate = total > 0 ? Math.round((profile.wins / total) * 100) : 0;

//     return (
//         <div className="root profile-root">
//             <header className="header">
//                 <span className="logo">Mathify</span>
//                 <div className="profile-actions">
//                     <button className="btn-secondary" onClick={onBack}>Play</button>
//                      <button className="btn-secondary" onClick={onLeaderboard}>Leaderboard</button>
//                     <button className="btn-danger" onClick={onLogout}>Log out</button>
//                 </div>
//             </header>

//             <main className="main profile-main">
//                 <div className="profile-column">
//                     <div className="profile-card profile-identity">
//                         <div className="avatar">{profile.username[0].toUpperCase()}</div>
//                         <div>
//                             <p className="profile-name">{profile.username}</p>
//                             <p className="profile-email">{profile.email}</p>
//                         </div>
                        
//                     </div>

//                     <div className="profile-grid">
//                         {[
//                             { label: "Rating", value: profile.rating, color: "#6ee7b7" },
//                             { label: "Wins", value: profile.wins, color: "#6ee7b7" },
//                             { label: "Losses", value: profile.losses, color: "#f9a8d4" },
//                             { label: "Win rate", value: `${winRate}%`, color: "#a5b4fc" },
//                         ].map((stat) => (
//                             <div key={stat.label} className="stat-card">
//                                 <span style={{ color: stat.color }}>{stat.value}</span>
//                                 <span>{stat.label}</span>
//                             </div>
//                         ))}
//                     </div>

//                     <div className="profile-card match-history">
//                         <p className="match-history-title">Recent matches</p>
//                         {matches.length === 0 ? (
//                             <p className="no-matches">No matches yet — go play!</p>
//                         ) : (
//                             matches.map((match) => {
//                                 const won = match.winner === profile._id || match.winner?._id === profile._id;
//                                 const abandoned = match.status === "abandoned";
//                                 const opponentName = match.opponent?.username ?? "Unknown";
//                                 const delta = match.ratingDelta > 0 ? `+${match.ratingDelta}` : `${match.ratingDelta}`;
//                                 return (
//                                     <div key={match._id} className="match-row">
//                                         <span className={won ? "match-status win" : "match-status loss"}>
//                                             {abandoned ? "A" : won ? "W" : "L"}
//                                         </span>
//                                         <span className="match-opponent">vs {opponentName}</span>
//                                         <span className="match-delta">{delta}</span>
//                                         <span className="match-date">{new Date(match.endedAt).toLocaleDateString()}</span>
//                                     </div>
//                                 );
//                             })
//                         )}
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getRank } from "../utils/ranks";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProfilePage({ token, onBack, onLogout, onLeaderboard }) {
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [leaderboardRank, setLeaderboardRank] = useState(null);
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
                
                // Fetch user info, match history, and user leaderboard ranking
                const [profileRes, matchesRes, rankRes] = await Promise.all([
                    fetch(`${API}/api/users/me`, { headers, credentials: 'include' }),
                    fetch(`${API}/api/users/me/matches`, { headers, credentials: 'include' }),
                    fetch(`${API}/api/leaderboard/me`, { headers, credentials: 'include' }).catch(() => null)
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
                
                let rank = "Unranked";
                if (rankRes && rankRes.ok) {
                    const rankData = await rankRes.json();
                    if (rankData.success && rankData.data) {
                        rank = rankData.data.rank;
                    }
                }

                setProfile(profileData.data);
                setMatches(matchesData.data || []);
                setLeaderboardRank(rank);
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

    const total = profile.gamesPlayed ?? (profile.wins + profile.losses);
    const winRate = total > 0 ? Math.round((profile.wins / total) * 100) : 0;
    
    // Get Mathematician rank configuration
    const mathematicianRank = getRank(profile.rating);

    return (
        <div className="root" style={{ minHeight: "100vh", position: "relative" }}>
            {/* Background watermarks for operator symbols */}
            <div className="bg-operator-watermarks">
                <span className="op-plus">+</span>
                <span className="op-minus">−</span>
                <span className="op-mul">×</span>
                <span className="op-div">÷</span>
            </div>

            {/* Floating corner navbar */}
            <Navbar
                user={profile}
                activePage="profile"
                onLobby={onBack}
                onProfile={() => {}}
                onLeaderboard={onLeaderboard}
                onLogout={onLogout}
            />

            <main className="main profile-main" style={{ padding: "80px 24px 48px" }}>
                <div className="profile-column">
                    
                    {/* Tech-savvy Agon Banner */}
                    <div className="agon-banner">
                        <div className="agon-tech-tag">Agon Core Profile</div>
                        <div className="agon-identity">
                            <div className="avatar">
                                {profile.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="profile-name">{profile.username}</p>
                                <p className="profile-email">{profile.email}</p>
                            </div>
                            {leaderboardRank && (
                                <div className="profile-rank-badge">
                                    <span className="profile-rank-num">#{leaderboardRank}</span>
                                    <span className="profile-rank-lbl">Leaderboard Rank</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Predefined rating system based on mathematicians */}
                    <div className="mathematician-card" style={{ borderLeft: `4px solid ${mathematicianRank.color}` }}>
                        <div className="mathematician-header">
                            <div className="mathematician-badge">{mathematicianRank.badge}</div>
                            <div className="mathematician-meta">
                                <span className="mathematician-title" style={{ color: mathematicianRank.color }}>
                                    {mathematicianRank.title}
                                </span>
                                <span className="mathematician-name" style={{ color: "#ffffff", fontWeight: 600 }}>
                                    {mathematicianRank.character}
                                </span>
                            </div>
                        </div>
                        <div className="mathematician-discovery">
                            <span className="discovery-lbl">Predefined Achievement</span>
                            <span className="discovery-val">{mathematicianRank.discovery}</span>
                        </div>
                        <p className="mathematician-desc">
                            {mathematicianRank.description}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="profile-grid">
                        {[
                            { label: "Rating", value: profile.rating ?? 1000, color: "#ffd700" },
                            { label: "Wins", value: profile.wins ?? 0, color: "#10b981" },
                            { label: "Losses", value: profile.losses ?? 0, color: "#ef4444" },
                            { label: "Win rate", value: `${winRate}%`, color: "#60a5fa" },
                        ].map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <span style={{ color: stat.color }}>{stat.value}</span>
                                <span>{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Friends Card (Built Later) */}
                    <div className="friends-card">
                        <div className="friends-header">
                            <span className="friends-title">Squad Network</span>
                            <span className="friends-badge">Coming Soon</span>
                        </div>
                        <div className="friends-placeholder">
                            <span className="friends-placeholder-icon">👥</span>
                            <span className="friends-placeholder-txt">
                                Friends lists, custom challenger invites, and clan tags are currently offline and will be integrated in a future interface.
                            </span>
                        </div>
                    </div>

                    {/* Recent Matches */}
                    <div className="match-history">
                        <p className="match-history-title">Combat History</p>
                        {matches.length === 0 ? (
                            <p className="no-matches">No math races recorded yet. Enter lobby to play!</p>
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
                                        <span className="match-delta" style={{ color: won ? "#10b981" : "#ef4444" }}>
                                            {delta}
                                        </span>
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
