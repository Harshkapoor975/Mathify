// import Navbar from "../components/Navbar";

// const MODES = [
//     {
//         key: "blitz",
//         label: "Blitz",
//         tag: "10 questions",
//         description: "Race your opponent to answer 10 math questions first. Pure speed — first to finish wins.",
//         accent: "#6ee7b7",
//         accentDim: "#064e3b",
//         icon: "⚡",
//         cta: "Play Blitz"
//     },
//     {
//         key: "survival",
//         label: "Survival",
//         tag: "60 seconds",
//         description: "Shared questions, one minute on the clock. First correct answer scores. Most points when time's up wins.",
//         accent: "#f87171",
//         accentDim: "#450a0a",
//         icon: "🔥",
//         cta: "Play Survival"
//     }
// ];

// export default function LobbyPage({ user, onBlitz, onSurvival, onProfile, onLeaderboard, onLogout }) {
//     function handleMode(key) {
//         if (key === "blitz") onBlitz();
//         else onSurvival();
//     }

//     return (
//         <div style={{
//             display: "flex",
//             minHeight: "100vh",
//             background: "#0f1117",
//             fontFamily: "'DM Mono','Fira Code',monospace",
//             color: "#f3f4f6"
//         }}>
//             <Navbar
//                 user={user}
//                 activePage="lobby"
//                 onLobby={() => {}}
//                 onProfile={onProfile}
//                 onLeaderboard={onLeaderboard}
//                 onLogout={onLogout}
//             />

//             {/* Main content */}
//             <div style={{
//                 flex: 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 padding: "48px 48px 48px",
//                 overflow: "auto"
//             }}>
//                 {/* Page heading */}
//                 <div style={{ marginBottom: 40 }}>
//                     <h1 style={{
//                         margin: 0,
//                         fontSize: 32,
//                         fontWeight: 700,
//                         color: "#f9fafb",
//                         letterSpacing: "-0.5px"
//                     }}>
//                         Choose your mode
//                     </h1>
//                     <p style={{
//                         margin: "8px 0 0",
//                         color: "#4b5563",
//                         fontSize: 14
//                     }}>
//                         Pick a game mode and find a match
//                     </p>
//                 </div>

//                 {/* Mode cards */}
//                 <div style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//                     gap: 24,
//                     maxWidth: 800
//                 }}>
//                     {MODES.map(mode => (
//                         <div
//                             key={mode.key}
//                             style={{
//                                 background: "#161b27",
//                                 border: `1px solid #1f2937`,
//                                 borderRadius: 12,
//                                 padding: "36px 32px",
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 gap: 16,
//                                 cursor: "pointer",
//                                 transition: "border-color 0.2s, transform 0.15s",
//                                 position: "relative",
//                                 overflow: "hidden"
//                             }}
//                             onMouseEnter={e => {
//                                 e.currentTarget.style.borderColor = mode.accent;
//                                 e.currentTarget.style.transform = "translateY(-2px)";
//                             }}
//                             onMouseLeave={e => {
//                                 e.currentTarget.style.borderColor = "#1f2937";
//                                 e.currentTarget.style.transform = "translateY(0)";
//                             }}
//                         >
//                             {/* Icon + tag row */}
//                             <div style={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "space-between"
//                             }}>
//                                 <span style={{ fontSize: 40 }}>{mode.icon}</span>
//                                 <span style={{
//                                     fontSize: 11,
//                                     fontWeight: 600,
//                                     color: mode.accent,
//                                     background: mode.accentDim,
//                                     padding: "4px 10px",
//                                     borderRadius: 20,
//                                     letterSpacing: "0.05em"
//                                 }}>
//                                     {mode.tag}
//                                 </span>
//                             </div>

//                             {/* Title */}
//                             <h2 style={{
//                                 margin: 0,
//                                 fontSize: 26,
//                                 fontWeight: 700,
//                                 color: "#f9fafb",
//                                 letterSpacing: "-0.3px"
//                             }}>
//                                 {mode.label}
//                             </h2>

//                             {/* Description */}
//                             <p style={{
//                                 margin: 0,
//                                 fontSize: 13,
//                                 color: "#6b7280",
//                                 lineHeight: 1.7,
//                                 flex: 1
//                             }}>
//                                 {mode.description}
//                             </p>

//                             {/* Divider */}
//                             <div style={{
//                                 height: 1,
//                                 background: "#1f2937"
//                             }} />

//                             {/* CTA button */}
//                             <button
//                                 onClick={() => handleMode(mode.key)}
//                                 style={{
//                                     padding: "13px 0",
//                                     borderRadius: 8,
//                                     border: "none",
//                                     background: mode.accent,
//                                     color: mode.accentDim,
//                                     fontWeight: 700,
//                                     fontSize: 14,
//                                     fontFamily: "'DM Mono','Fira Code',monospace",
//                                     cursor: "pointer",
//                                     width: "100%",
//                                     transition: "opacity 0.15s"
//                                 }}
//                                 onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
//                                 onMouseLeave={e => e.currentTarget.style.opacity = "1"}
//                             >
//                                 {mode.cta}
//                             </button>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Bottom stats strip */}
//                 {user && (
//                     <div style={{
//                         marginTop: 48,
//                         display: "flex",
//                         gap: 24,
//                         maxWidth: 800
//                     }}>
//                         {[
//                             { label: "Rating", value: user.rating ?? 1000, color: "#6ee7b7" },
//                             { label: "Wins", value: user.wins ?? 0, color: "#6ee7b7" },
//                             { label: "Losses", value: user.losses ?? 0, color: "#f9a8d4" },
//                         ].map(stat => (
//                             <div key={stat.label} style={{
//                                 background: "#161b27",
//                                 border: "1px solid #1f2937",
//                                 borderRadius: 8,
//                                 padding: "16px 24px",
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 gap: 4,
//                                 minWidth: 100
//                             }}>
//                                 <span style={{
//                                     fontSize: 22,
//                                     fontWeight: 700,
//                                     color: stat.color
//                                 }}>
//                                     {stat.value}
//                                 </span>
//                                 <span style={{
//                                     fontSize: 11,
//                                     color: "#4b5563",
//                                     letterSpacing: "0.08em",
//                                     textTransform: "uppercase"
//                                 }}>
//                                     {stat.label}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
import Navbar from "../components/Navbar";
import { getRank } from "../utils/ranks";

const MODES = [
    {
        key: "blitz",
        label: "Blitz",
        tag: "10 questions",
        description: "Race your opponent to answer 10 math questions first. Pure speed — first to finish wins.",
        accent: "#ffd700",
        accentDim: "rgba(255, 215, 0, 0.12)",
        icon: "⚡",
        cta: "Play Blitz"
    },
    {
        key: "survival",
        label: "Survival",
        tag: "60 seconds",
        description: "Shared questions, one minute on the clock. First correct answer scores. Most points when time's up wins.",
        accent: "#c5a85c",
        accentDim: "rgba(197, 168, 92, 0.12)",
        icon: "🔥",
        cta: "Play Survival"
    }
];

export default function LobbyPage({ user, onBlitz, onSurvival, onProfile, onLeaderboard, onLogout }) {
    // Get mathematician rank
    const rank = getRank(user?.rating ?? 1000);

    function handleMode(key) {
        if (key === "blitz") onBlitz();
        else onSurvival();
    }

    return (
        <div className="root" style={{ minHeight: "100vh", position: "relative" }}>
            {/* Floating operators decoration background */}
            <div className="bg-operator-watermarks">
                <span className="op-plus">+</span>
                <span className="op-minus">−</span>
                <span className="op-mul">×</span>
                <span className="op-div">÷</span>
            </div>

            {/* Corner collapsible Navbar */}
            <Navbar
                user={user}
                activePage="lobby"
                onLobby={() => {}}
                onProfile={onProfile}
                onLeaderboard={onLeaderboard}
                onLogout={onLogout}
            />

            {/* Main content - padded left to avoid overlap with floating toggle */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "80px 48px 48px",
                maxWidth: "1200px",
                width: "100%",
                margin: "0 auto",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10
            }}>
                {/* Page heading */}
                <div style={{ marginBottom: 48, textAlign: "center" }}>
                    <div className="agon-tech-tag">Agon Matchmaking</div>
                    <h1 style={{
                        margin: "8px 0 0",
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: 36,
                        fontWeight: 900,
                        letterSpacing: "1px",
                        color: "#ffffff"
                    }}>
                        Choose Your Arena
                    </h1>
                    <p style={{
                        margin: "12px 0 0",
                        color: "#64748b",
                        fontSize: 14,
                        letterSpacing: "0.5px"
                    }}>
                        Select a battle mode to find an online opponent and rise in the ranks
                    </p>
                </div>

                {/* Mode cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 32,
                    width: "100%",
                    maxWidth: "800px"
                }}>
                    {MODES.map(mode => (
                        <div
                            key={mode.key}
                            className="card"
                            style={{
                                maxWidth: "none",
                                padding: "40px 32px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 20,
                                cursor: "pointer",
                                border: "1px solid #1f2535"
                            }}
                            onClick={() => handleMode(mode.key)}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = mode.accent;
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.boxShadow = `0 15px 40px rgba(0, 0, 0, 0.8), 0 0 20px ${mode.accentDim}`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#1f2535";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            {/* Icon + tag row */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>
                                <span style={{ fontSize: 44, filter: "drop-shadow(0 0 8px rgba(255,215,0,0.2))" }}>
                                    {mode.icon}
                                </span>
                                <span style={{
                                    fontSize: 10,
                                    fontFamily: "'Orbitron', sans-serif",
                                    fontWeight: 900,
                                    color: mode.accent,
                                    background: mode.accentDim,
                                    border: `1px solid ${mode.accent}33`,
                                    padding: "4px 12px",
                                    borderRadius: 4,
                                    letterSpacing: "1px",
                                    textTransform: "uppercase"
                                }}>
                                    {mode.tag}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 style={{
                                margin: 0,
                                fontFamily: "'Orbitron', sans-serif",
                                fontSize: 24,
                                fontWeight: 800,
                                color: "#ffffff",
                                letterSpacing: "0.5px"
                            }}>
                                {mode.label}
                            </h2>

                            {/* Description */}
                            <p style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#94a3b8",
                                lineHeight: 1.7,
                                flex: 1
                            }}>
                                {mode.description}
                            </p>

                            {/* Divider */}
                            <div style={{
                                height: 1,
                                background: "#1f2535"
                            }} />

                            {/* CTA button */}
                            <button
                                style={{
                                    padding: "13px 0",
                                    borderRadius: 8,
                                    border: "none",
                                    background: mode.accent,
                                    color: "#06070a",
                                    fontWeight: 900,
                                    fontSize: 13,
                                    fontFamily: "'Orbitron', sans-serif",
                                    letterSpacing: "1px",
                                    cursor: "pointer",
                                    width: "100%",
                                    textTransform: "uppercase",
                                    boxShadow: `0 4px 12px ${mode.accent}33`,
                                    transition: "opacity 0.15s"
                                }}
                            >
                                {mode.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom stats strip */}
                {user && (
                    <div style={{
                        marginTop: 56,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        width: "100%"
                    }}>
                        {/* Mathematician Subtitle Card */}
                        <div className="agon-tech-tag" style={{ background: "rgba(197, 168, 92, 0.08)", textTransform: "none", fontSize: 11, padding: "6px 14px" }}>
                            Current Rank: <span style={{ color: "#ffffff", fontWeight: 700 }}>{rank.badge} {rank.title}</span> — Discoverer of <span style={{ fontStyle: "italic", color: "#ffd700" }}>{rank.discovery}</span>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: 20,
                            flexWrap: "wrap",
                            justifyContent: "center",
                            width: "100%",
                            maxWidth: "800px"
                        }}>
                            {[
                                { label: "Rating", value: `★ ${user.rating ?? 1000}`, color: "#ffd700" },
                                { label: "Wins", value: user.wins ?? 0, color: "#10b981" },
                                { label: "Losses", value: user.losses ?? 0, color: "#ef4444" },
                            ].map(stat => (
                                <div key={stat.label} className="stat-card" style={{ minWidth: 140, padding: "16px 24px" }}>
                                    <span style={{ color: stat.color, fontSize: 20 }}>
                                        {stat.value}
                                    </span>
                                    <span style={{ fontSize: 9 }}>
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}