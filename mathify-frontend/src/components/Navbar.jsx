// import { useState } from "react";

// export default function Navbar({ user, onProfile, onLeaderboard, onLogout, onLobby, activePage }) {
//     const [collapsed, setCollapsed] = useState(false);

//     const navItems = [
//         { key: "lobby", label: "Play", icon: "⚡", action: onLobby },
//         { key: "profile", label: "Profile", icon: "◉", action: onProfile },
//         { key: "leaderboard", label: "Leaderboard", icon: "▲", action: onLeaderboard },
//     ];

//     return (
//         <>
//             {/* overlay for mobile when open */}
//             {!collapsed && (
//                 <div
//                     onClick={() => setCollapsed(true)}
//                     style={{
//                         display: "none",
//                         position: "fixed", inset: 0,
//                         background: "rgba(0,0,0,0.5)",
//                         zIndex: 99
//                     }}
//                     className="nav-overlay"
//                 />
//             )}

//             <nav style={{
//                 width: collapsed ? 60 : 220,
//                 minHeight: "100vh",
//                 background: "#0d1117",
//                 borderRight: "1px solid #1f2937",
//                 display: "flex",
//                 flexDirection: "column",
//                 transition: "width 0.2s ease",
//                 flexShrink: 0,
//                 position: "relative",
//                 zIndex: 100,
//                 overflow: "hidden"
//             }}>

//                 {/* Logo + collapse toggle */}
//                 <div style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: collapsed ? "center" : "space-between",
//                     padding: collapsed ? "20px 0" : "20px 16px",
//                     borderBottom: "1px solid #1f2937",
//                     gap: 8
//                 }}>
//                     {!collapsed && (
//                         <span style={{
//                             fontSize: 20,
//                             fontWeight: 700,
//                             color: "#f9fafb",
//                             fontFamily: "'DM Mono','Fira Code',monospace",
//                             whiteSpace: "nowrap"
//                         }}>
//                             Mathify
//                         </span>
//                     )}
//                     <button
//                         onClick={() => setCollapsed(c => !c)}
//                         style={{
//                             background: "none",
//                             border: "none",
//                             color: "#6b7280",
//                             cursor: "pointer",
//                             fontSize: 18,
//                             padding: "4px 6px",
//                             borderRadius: 6,
//                             lineHeight: 1,
//                             flexShrink: 0
//                         }}
//                         aria-label="Toggle sidebar"
//                     >
//                         {collapsed ? "→" : "←"}
//                     </button>
//                 </div>

//                 {/* User info */}
//                 {user && (
//                     <div style={{
//                         padding: collapsed ? "16px 0" : "16px",
//                         borderBottom: "1px solid #1f2937",
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 10,
//                         justifyContent: collapsed ? "center" : "flex-start",
//                         overflow: "hidden"
//                     }}>
//                         <div style={{
//                             width: 36, height: 36,
//                             borderRadius: "50%",
//                             background: "#374151",
//                             display: "flex", alignItems: "center", justifyContent: "center",
//                             fontSize: 14, fontWeight: 700,
//                             color: "#6ee7b7",
//                             flexShrink: 0
//                         }}>
//                             {user.username?.[0]?.toUpperCase()}
//                         </div>
//                         {!collapsed && (
//                             <div style={{ overflow: "hidden" }}>
//                                 <p style={{
//                                     margin: 0, fontSize: 13, fontWeight: 600,
//                                     color: "#f9fafb", whiteSpace: "nowrap",
//                                     overflow: "hidden", textOverflow: "ellipsis"
//                                 }}>
//                                     {user.username}
//                                 </p>
//                                 <p style={{
//                                     margin: 0, fontSize: 11,
//                                     color: "#6ee7b7"
//                                 }}>
//                                     ★ {user.rating ?? 1000}
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Nav items */}
//                 <div style={{
//                     flex: 1,
//                     display: "flex",
//                     flexDirection: "column",
//                     padding: "12px 0",
//                     gap: 2
//                 }}>
//                     {navItems.map(item => {
//                         const isActive = activePage === item.key;
//                         return (
//                             <button
//                                 key={item.key}
//                                 onClick={item.action}
//                                 title={collapsed ? item.label : undefined}
//                                 style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: 12,
//                                     padding: collapsed ? "12px 0" : "12px 16px",
//                                     justifyContent: collapsed ? "center" : "flex-start",
//                                     background: isActive ? "#161b27" : "transparent",
//                                     border: "none",
//                                     borderLeft: isActive ? "2px solid #6ee7b7" : "2px solid transparent",
//                                     color: isActive ? "#6ee7b7" : "#6b7280",
//                                     cursor: "pointer",
//                                     fontSize: 13,
//                                     fontFamily: "'DM Mono','Fira Code',monospace",
//                                     fontWeight: isActive ? 600 : 400,
//                                     transition: "all 0.15s",
//                                     whiteSpace: "nowrap",
//                                     width: "100%"
//                                 }}
//                                 onMouseEnter={e => {
//                                     if (!isActive) e.currentTarget.style.color = "#d1d5db";
//                                 }}
//                                 onMouseLeave={e => {
//                                     if (!isActive) e.currentTarget.style.color = "#6b7280";
//                                 }}
//                             >
//                                 <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
//                                 {!collapsed && item.label}
//                             </button>
//                         );
//                     })}
//                 </div>

//                 {/* Logout */}
//                 <div style={{
//                     borderTop: "1px solid #1f2937",
//                     padding: "12px 0"
//                 }}>
//                     <button
//                         onClick={onLogout}
//                         title={collapsed ? "Log out" : undefined}
//                         style={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 12,
//                             padding: collapsed ? "12px 0" : "12px 16px",
//                             justifyContent: collapsed ? "center" : "flex-start",
//                             background: "transparent",
//                             border: "none",
//                             borderLeft: "2px solid transparent",
//                             color: "#6b7280",
//                             cursor: "pointer",
//                             fontSize: 13,
//                             fontFamily: "'DM Mono','Fira Code',monospace",
//                             width: "100%",
//                             whiteSpace: "nowrap"
//                         }}
//                         onMouseEnter={e => e.currentTarget.style.color = "#fca5a5"}
//                         onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
//                     >
//                         <span style={{ fontSize: 16, flexShrink: 0 }}>✕</span>
//                         {!collapsed && "Log out"}
//                     </button>
//                 </div>
//             </nav>

//             <style>{`
//                 @media (max-width: 640px) {
//                     .nav-overlay { display: block !important; }
//                 }
//             `}</style>
//         </>
//     );
// }
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