import Navbar from "../components/Navbar";

const MODES = [
    {
        key: "blitz",
        label: "Blitz",
        tag: "10 questions",
        description: "Race your opponent to answer 10 math questions first. Pure speed — first to finish wins.",
        accent: "#6ee7b7",
        accentDim: "#064e3b",
        icon: "⚡",
        cta: "Play Blitz"
    },
    {
        key: "survival",
        label: "Survival",
        tag: "60 seconds",
        description: "Shared questions, one minute on the clock. First correct answer scores. Most points when time's up wins.",
        accent: "#f87171",
        accentDim: "#450a0a",
        icon: "🔥",
        cta: "Play Survival"
    }
];

export default function LobbyPage({ user, onBlitz, onSurvival, onProfile, onLeaderboard, onLogout }) {
    function handleMode(key) {
        if (key === "blitz") onBlitz();
        else onSurvival();
    }

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "#0f1117",
            fontFamily: "'DM Mono','Fira Code',monospace",
            color: "#f3f4f6"
        }}>
            <Navbar
                user={user}
                activePage="lobby"
                onLobby={() => {}}
                onProfile={onProfile}
                onLeaderboard={onLeaderboard}
                onLogout={onLogout}
            />

            {/* Main content */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "48px 48px 48px",
                overflow: "auto"
            }}>
                {/* Page heading */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#f9fafb",
                        letterSpacing: "-0.5px"
                    }}>
                        Choose your mode
                    </h1>
                    <p style={{
                        margin: "8px 0 0",
                        color: "#4b5563",
                        fontSize: 14
                    }}>
                        Pick a game mode and find a match
                    </p>
                </div>

                {/* Mode cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 24,
                    maxWidth: 800
                }}>
                    {MODES.map(mode => (
                        <div
                            key={mode.key}
                            style={{
                                background: "#161b27",
                                border: `1px solid #1f2937`,
                                borderRadius: 12,
                                padding: "36px 32px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                                cursor: "pointer",
                                transition: "border-color 0.2s, transform 0.15s",
                                position: "relative",
                                overflow: "hidden"
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = mode.accent;
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "#1f2937";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            {/* Icon + tag row */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>
                                <span style={{ fontSize: 40 }}>{mode.icon}</span>
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: mode.accent,
                                    background: mode.accentDim,
                                    padding: "4px 10px",
                                    borderRadius: 20,
                                    letterSpacing: "0.05em"
                                }}>
                                    {mode.tag}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 style={{
                                margin: 0,
                                fontSize: 26,
                                fontWeight: 700,
                                color: "#f9fafb",
                                letterSpacing: "-0.3px"
                            }}>
                                {mode.label}
                            </h2>

                            {/* Description */}
                            <p style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#6b7280",
                                lineHeight: 1.7,
                                flex: 1
                            }}>
                                {mode.description}
                            </p>

                            {/* Divider */}
                            <div style={{
                                height: 1,
                                background: "#1f2937"
                            }} />

                            {/* CTA button */}
                            <button
                                onClick={() => handleMode(mode.key)}
                                style={{
                                    padding: "13px 0",
                                    borderRadius: 8,
                                    border: "none",
                                    background: mode.accent,
                                    color: mode.accentDim,
                                    fontWeight: 700,
                                    fontSize: 14,
                                    fontFamily: "'DM Mono','Fira Code',monospace",
                                    cursor: "pointer",
                                    width: "100%",
                                    transition: "opacity 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                            >
                                {mode.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom stats strip */}
                {user && (
                    <div style={{
                        marginTop: 48,
                        display: "flex",
                        gap: 24,
                        maxWidth: 800
                    }}>
                        {[
                            { label: "Rating", value: user.rating ?? 1000, color: "#6ee7b7" },
                            { label: "Wins", value: user.wins ?? 0, color: "#6ee7b7" },
                            { label: "Losses", value: user.losses ?? 0, color: "#f9a8d4" },
                        ].map(stat => (
                            <div key={stat.label} style={{
                                background: "#161b27",
                                border: "1px solid #1f2937",
                                borderRadius: 8,
                                padding: "16px 24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                minWidth: 100
                            }}>
                                <span style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: stat.color
                                }}>
                                    {stat.value}
                                </span>
                                <span style={{
                                    fontSize: 11,
                                    color: "#4b5563",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase"
                                }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}