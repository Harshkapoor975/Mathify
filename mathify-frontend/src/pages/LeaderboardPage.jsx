import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CROWN_COLORS = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32"
};

const PODIUM_HEIGHTS = {
  1: 160,
  2: 120,
  3: 90
};

const PODIUM_ORDER = [2, 1, 3];

function Crown({ color, size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <polygon
        points="4,28 8,14 14,20 18,8 22,20 28,14 32,28"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="4" y="27" width="28" height="4" rx="2" fill={color} />
      <circle cx="4" cy="14" r="2.5" fill={color} />
      <circle cx="18" cy="8" r="2.5" fill={color} />
      <circle cx="32" cy="14" r="2.5" fill={color} />
    </svg>
  );
}

function Avatar({ username, size = 48 }) {
  const initials = username ? username.slice(0, 2).toUpperCase() : "??";
  const colors = [
    ["#1a3a5c", "#4a90d9"],
    ["#1a3d2e", "#3dba7a"],
    ["#3d1a2e", "#d94a8c"],
    ["#3d2e1a", "#d9924a"],
    ["#2e1a3d", "#8c4ad9"],
  ];
  const idx = username ? username.charCodeAt(0) % colors.length : 0;
  const [bg, text] = colors[idx];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.33,
      fontWeight: 500,
      color: text,
      flexShrink: 0,
      border: "2px solid rgba(255,255,255,0.08)"
    }}>
      {initials}
    </div>
  );
}

function PodiumCard({ player, rank }) {
  if (!player) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          border: "2px dashed rgba(255,255,255,0.1)"
        }} />
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 12,
          width: 100,
          height: PODIUM_HEIGHTS[rank],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.2)",
          fontSize: 28,
          fontWeight: 700
        }}>
          {rank}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Crown color={CROWN_COLORS[rank]} size={rank === 1 ? 40 : 30} />
      <Avatar username={player.username} size={rank === 1 ? 72 : 56} />
      <span style={{
        color: "#fff",
        fontWeight: 600,
        fontSize: rank === 1 ? 16 : 14,
        marginTop: 2
      }}>
        @{player.username}
      </span>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 13,
        color: "#f0c040",
        fontWeight: 600
      }}>
        ★ {player.rating}
      </div>
      <div style={{
        background: rank === 1
          ? "linear-gradient(180deg, #2a4a7f 0%, #1a2f55 100%)"
          : "rgba(255,255,255,0.06)",
        borderRadius: "10px 10px 0 0",
        width: rank === 1 ? 130 : 110,
        height: PODIUM_HEIGHTS[rank],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: rank === 1 ? 36 : 28,
        fontWeight: 800,
        border: rank === 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
        marginTop: 6
      }}>
        {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
      </div>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: rank === 1 ? "#7c5c10" : rank === 2 ? "#3a3a3a" : "#5c3210",
        color: CROWN_COLORS[rank],
        fontSize: 13,
        fontWeight: 700
      }}>
        {rank}
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      color: "rgba(255,255,255,0.4)",
      fontSize: 13,
      fontWeight: 600
    }}>
      {rank}
    </span>
  );
}

export default function LeaderboardPage({ token, onBack }) {
  const [players, setPlayers] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/leaderboard?limit=30`);
        const data = await res.json();
        if (data.success) {
          setPlayers(data.data);
        } else {
          setError("Failed to load leaderboard");
        }
      } catch (err) {
        setError("Could not connect to server");
      } finally {
        setLoading(false);
      }
    }

    async function fetchMyRank() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/leaderboard/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMyRank(data.data);
      } catch {}
    }

    fetchLeaderboard();
    fetchMyRank();
  }, []);

  const top3 = PODIUM_ORDER.map(rank => players.find(p => p.rank === rank) || null);
  const rest = players.filter(p => p.rank > 3);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
      padding: "0 0 60px"
    }}>

      {/* Header */}
      
      <div style={{
        padding: "32px 40px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            background: "linear-gradient(135deg, #fff 60%, #4a90d9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Leaderboard
          </h1>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            Top players ranked by ELO rating
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 24,
          padding: 4,
          gap: 2
        }}>
          {["all", "weekly"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "rgba(255,255,255,0.12)" : "transparent",
                border: "none",
                borderRadius: 20,
                color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
                padding: "6px 20px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.15s"
              }}
            >
              {f === "all" ? "All time" : "Weekly"}
            </button>
          ))}
          <button
  onClick={onBack}
  style={{
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer"
  }}
>
  ← Back
</button>
        </div>
      </div>

      {/* My rank banner */}
      {myRank && (
        <div style={{
          margin: "24px 40px 0",
          background: "linear-gradient(135deg, #1a2f55, #0f1e38)",
          border: "1px solid rgba(74,144,217,0.3)",
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{
            background: "rgba(74,144,217,0.2)",
            borderRadius: 8,
            padding: "4px 12px",
            fontSize: 12,
            color: "#4a90d9",
            fontWeight: 600
          }}>
            YOUR RANK
          </div>
          <span style={{ fontWeight: 700, fontSize: 22, color: "#4a90d9" }}>
            #{myRank.rank}
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            @{myRank.username}
          </span>
          <span style={{ marginLeft: "auto", color: "#f0c040", fontWeight: 600, fontSize: 16 }}>
            ★ {myRank.rating}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          color: "rgba(255,255,255,0.3)",
          fontSize: 15
        }}>
          Loading leaderboard...
        </div>
      ) : error ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          color: "#e24b4a",
          fontSize: 15
        }}>
          {error}
        </div>
      ) : (
        <>
          {/* Podium */}
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 16,
            padding: "48px 40px 0",
          }}>
            {top3.map((player, i) => (
              <PodiumCard key={PODIUM_ORDER[i]} player={player} rank={PODIUM_ORDER[i]} />
            ))}
          </div>

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <div style={{
              margin: "32px 40px 0",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              overflow: "hidden"
            }}>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr 120px 100px",
                padding: "12px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.3)",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                <span>Rank</span>
                <span>Player</span>
                <span style={{ textAlign: "center" }}>Games</span>
                <span style={{ textAlign: "right" }}>Rating</span>
              </div>

              {/* Rows */}
              {rest.map((player, idx) => (
                <div
                  key={player.username}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 1fr 120px 100px",
                    padding: "14px 20px",
                    alignItems: "center",
                    borderBottom: idx < rest.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                    transition: "background 0.15s",
                    cursor: "default"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <RankBadge rank={player.rank} />

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar username={player.username} size={36} />
                    <span style={{ fontWeight: 500, fontSize: 15 }}>
                      @{player.username}
                    </span>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    {/* console.log: asset needed — gamesPlayed not in leaderboard payload yet */}
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>—</span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      color: "#f0c040",
                      fontWeight: 600,
                      fontSize: 15
                    }}>
                      ★ {player.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {players.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "80px 0",
              color: "rgba(255,255,255,0.2)",
              fontSize: 15
            }}>
              No players yet. Be the first to sign up!
            </div>
          )}
        </>
      )}
    </div>
  );
}