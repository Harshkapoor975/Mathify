// import { useEffect, useRef, useState } from "react";
// import getSocket from "./socket/socket";

// export default function App() {
//     const [status, setStatus] = useState("idle");
//     const [roomId, setRoomId] = useState(null);
//     const [question, setQuestion] = useState("");
//     const [answer, setAnswer] = useState("");
//     const [winner, setWinner] = useState(null);
//     const [progress, setProgress] = useState({});
//     const [myId, setMyId] = useState(null);
//     const [feedback, setFeedback] = useState(null);
//     const [opponentId, setOpponentId] = useState(null);

//     const inputRef = useRef(null);
//     const roomIdRef = useRef(null);

//     useEffect(() => {
//         roomIdRef.current = roomId;
//     }, [roomId]);

//     useEffect(() => {
//         const socket = getSocket();

//         function handleConnect() {
//             console.log("CONNECTED:", socket.id);
//             setMyId(socket.id);
//         }

//         function handleWaiting() {
//             console.log("Waiting for opponent...");
//             setStatus("waiting");
//         }

//         function handleGameStarted(data) {
//             console.log("GAME STARTED:", data);
//             setRoomId(data.roomId);
//             setQuestion(data.question);
//             setOpponentId(data.opponentId ?? null);
//             setStatus("playing");
//             setProgress({});
//             setWinner(null);
//             setFeedback(null);
//             setTimeout(() => inputRef.current?.focus(), 100);
//         }

//         function handleAnswerResult(data) {
//             console.log("ANSWER RESULT:", data);

//             if (data.correct) {
//                 setFeedback("correct");
//                 setQuestion(data.nextQuestion ?? "");
//             } else {
//                 setFeedback("wrong");
//             }

//             setTimeout(() => {
//                 setFeedback(null);
//                 inputRef.current?.focus();
//             }, 600);
//         }

//         function handleProgressUpdate(data) {
//             setProgress((prev) => ({
//                 ...prev,
//                 [data.playerId]: data.progress
//             }));
//         }

//         function handleGameOver(data) {
//             console.log("GAME OVER:", data);
//             setWinner(data.winner);
//             setStatus("finished");
//         }

//         function handleConnectError(err) {
//             console.error("SOCKET ERROR:", err.message);
//             setStatus("idle");
//         }

//         socket.on("connect", handleConnect);
//         socket.on("waiting_for_player", handleWaiting);
//         socket.on("game_started", handleGameStarted);
//         socket.on("answer_result", handleAnswerResult);
//         socket.on("progress_update", handleProgressUpdate);
//         socket.on("game_over", handleGameOver);
//         socket.on("connect_error", handleConnectError);

//         if (socket.connected) {
//             setMyId(socket.id);
//         }

//         return () => {
//             socket.off("connect", handleConnect);
//             socket.off("waiting_for_player", handleWaiting);
//             socket.off("game_started", handleGameStarted);
//             socket.off("answer_result", handleAnswerResult);
//             socket.off("progress_update", handleProgressUpdate);
//             socket.off("game_over", handleGameOver);
//             socket.off("connect_error", handleConnectError);
//         };
//     }, []);

//     function handleFindMatch() {
//         if (
//             status === "searching" ||
//             status === "waiting" ||
//             status === "playing"
//         ) {
//             return;
//         }

//         const socket = getSocket();
//         setStatus("searching");

//         const requestMatch = () => {
//             socket.emit("find_match");
//             console.log("Searching for match...");
//         };

//         if (socket.connected) {
//             requestMatch();
//             return;
//         }

//         socket.once("connect", requestMatch);
//         socket.connect();
//     }

//     function handleSubmitAnswer() {
//         const trimmed = answer.trim();

//         if (!trimmed || !roomIdRef.current) {
//             return;
//         }

//         const socket = getSocket();
//         socket.emit("submit_answer", {
//             roomId: roomIdRef.current,
//             answer: trimmed
//         });

//         setAnswer("");
//     }

//     function handleKeyDown(event) {
//         if (event.key === "Enter") {
//             handleSubmitAnswer();
//         }
//     }

//     function handlePlayAgain() {
//         setStatus("idle");
//         setRoomId(null);
//         setQuestion("");
//         setAnswer("");
//         setWinner(null);
//         setProgress({});
//         setFeedback(null);
//         setOpponentId(null);
//     }

//     const myProgress = progress[myId] ?? 0;
//     const opponentProgress = opponentId ? (progress[opponentId] ?? 0) : 0;
//     const iWon = winner === myId;

//     return (
//         <div style={styles.root}>
//             <header style={styles.header}>
//                 <span style={styles.logo}>Mathify</span>
//                 {myId && (
//                     <span style={styles.socketId}>
//                         #{myId.slice(0, 6)}
//                     </span>
//                 )}
//             </header>

//             <main style={styles.main}>
//                 {status === "idle" && (
//                     <div style={styles.card}>
//                         <h2 style={styles.cardTitle}>Ready to race?</h2>
//                         <p style={styles.cardSub}>
//                             Answer 10 math questions faster than your opponent.
//                         </p>
//                         <button style={styles.btnPrimary} onClick={handleFindMatch}>
//                             Find Match
//                         </button>
//                     </div>
//                 )}

//                 {(status === "searching" || status === "waiting") && (
//                     <div style={styles.card}>
//                         <div style={styles.spinner} />
//                         <h2 style={styles.cardTitle}>
//                             {status === "searching" ? "Connecting..." : "Waiting for opponent..."}
//                         </h2>
//                         <p style={styles.cardSub}>Hang tight, finding you a match.</p>
//                     </div>
//                 )}

//                 {status === "playing" && (
//                     <div style={styles.gameArea}>
//                         <div style={styles.progressSection}>
//                             <ProgressBar
//                                 label="You"
//                                 value={myProgress}
//                                 max={10}
//                                 accent="#6ee7b7"
//                             />
//                             <ProgressBar
//                                 label="Opponent"
//                                 value={opponentProgress}
//                                 max={10}
//                                 accent="#f9a8d4"
//                             />
//                         </div>

//                         <div style={styles.questionBox}>
//                             <span style={styles.questionLabel}>Solve</span>
//                             <span style={styles.questionText}>{question}</span>
//                         </div>

//                         {feedback && (
//                             <div
//                                 style={{
//                                     ...styles.feedbackBadge,
//                                     background: feedback === "correct" ? "#6ee7b7" : "#fca5a5",
//                                     color: feedback === "correct" ? "#064e3b" : "#7f1d1d"
//                                 }}
//                             >
//                                 {feedback === "correct" ? "Correct!" : "Wrong"}
//                             </div>
//                         )}

//                         <div style={styles.inputRow}>
//                             <input
//                                 ref={inputRef}
//                                 type="number"
//                                 value={answer}
//                                 onChange={(event) => setAnswer(event.target.value)}
//                                 onKeyDown={handleKeyDown}
//                                 placeholder="Your answer"
//                                 style={styles.input}
//                                 autoFocus
//                             />
//                             <button
//                                 style={styles.btnPrimary}
//                                 onClick={handleSubmitAnswer}
//                             >
//                                 Submit
//                             </button>
//                         </div>

//                         <p style={styles.hint}>Press Enter to submit</p>
//                     </div>
//                 )}

//                 {status === "finished" && (
//                     <div style={styles.card}>
//                         <h2 style={styles.cardTitle}>
//                             {iWon ? "You won!" : "You lost!"}
//                         </h2>
//                         <p style={styles.cardSub}>
//                             {iWon
//                                 ? "Great speed! You answered 10 questions first."
//                                 : "Your opponent was faster this time."}
//                         </p>
//                         <div style={styles.finalScores}>
//                             <ScorePill label="You" value={myProgress} accent="#6ee7b7" />
//                             <ScorePill label="Opponent" value={opponentProgress} accent="#f9a8d4" />
//                         </div>
//                         <button style={styles.btnPrimary} onClick={handlePlayAgain}>
//                             Play Again
//                         </button>
//                     </div>
//                 )}
//             </main>
//         </div>
//     );
// }

// function ProgressBar({
//     label,
//     value,
//     max,
//     accent
// }) {
//     const percent = Math.min((value / max) * 100, 100);

//     return (
//         <div style={{ flex: 1 }}>
//             <div style={styles.progressMeta}>
//                 <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
//                 <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600 }}>
//                     {value}/{max}
//                 </span>
//             </div>
//             <div style={styles.barTrack}>
//                 <div
//                     style={{
//                         ...styles.barFill,
//                         width: `${percent}%`,
//                         background: accent,
//                         transition: "width 0.3s ease"
//                     }}
//                 />
//             </div>
//         </div>
//     );
// }

// function ScorePill({
//     label,
//     value,
//     accent
// }) {
//     return (
//         <div style={{ ...styles.scorePill, borderColor: accent }}>
//             <span style={{ color: accent, fontWeight: 700, fontSize: 24 }}>{value}</span>
//             <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
//         </div>
//     );
// }

// const styles = {
//     root: {
//         minHeight: "100vh",
//         background: "#0f1117",
//         color: "#f3f4f6",
//         fontFamily: "'DM Mono', 'Fira Code', monospace",
//         display: "flex",
//         flexDirection: "column"
//     },
//     header: {
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         padding: "18px 32px",
//         borderBottom: "1px solid #1f2937"
//     },
//     logo: {
//         fontSize: 22,
//         fontWeight: 700,
//         letterSpacing: 0,
//         color: "#f9fafb"
//     },
//     socketId: {
//         fontSize: 11,
//         color: "#4b5563",
//         fontFamily: "monospace"
//     },
//     main: {
//         flex: 1,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 24
//     },
//     card: {
//         background: "#161b27",
//         border: "1px solid #1f2937",
//         borderRadius: 8,
//         padding: "48px 40px",
//         maxWidth: 440,
//         width: "100%",
//         textAlign: "center",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         gap: 16
//     },
//     cardTitle: {
//         margin: 0,
//         fontSize: 26,
//         fontWeight: 600,
//         color: "#f9fafb"
//     },
//     cardSub: {
//         margin: 0,
//         color: "#6b7280",
//         fontSize: 14,
//         lineHeight: 1.6
//     },
//     btnPrimary: {
//         marginTop: 8,
//         padding: "12px 32px",
//         borderRadius: 8,
//         border: "none",
//         background: "#6ee7b7",
//         color: "#064e3b",
//         fontWeight: 700,
//         fontSize: 15,
//         cursor: "pointer",
//         letterSpacing: 0,
//         transition: "opacity 0.15s"
//     },
//     spinner: {
//         width: 36,
//         height: 36,
//         border: "3px solid #1f2937",
//         borderTop: "3px solid #6ee7b7",
//         borderRadius: "50%",
//         animation: "spin 0.8s linear infinite"
//     },
//     gameArea: {
//         width: "100%",
//         maxWidth: 500,
//         display: "flex",
//         flexDirection: "column",
//         gap: 24
//     },
//     progressSection: {
//         display: "flex",
//         gap: 20
//     },
//     progressMeta: {
//         display: "flex",
//         justifyContent: "space-between",
//         marginBottom: 4
//     },
//     barTrack: {
//         height: 8,
//         background: "#1f2937",
//         borderRadius: 4,
//         overflow: "hidden"
//     },
//     barFill: {
//         height: "100%",
//         borderRadius: 4
//     },
//     questionBox: {
//         background: "#161b27",
//         border: "1px solid #1f2937",
//         borderRadius: 8,
//         padding: "32px 24px",
//         textAlign: "center"
//     },
//     questionLabel: {
//         display: "block",
//         fontSize: 11,
//         color: "#4b5563",
//         letterSpacing: "0.1em",
//         textTransform: "uppercase",
//         marginBottom: 12
//     },
//     questionText: {
//         fontSize: 42,
//         fontWeight: 700,
//         color: "#f9fafb",
//         letterSpacing: 0
//     },
//     feedbackBadge: {
//         padding: "10px 20px",
//         borderRadius: 8,
//         fontWeight: 700,
//         fontSize: 14,
//         textAlign: "center",
//         transition: "all 0.2s"
//     },
//     inputRow: {
//         display: "flex",
//         gap: 10
//     },
//     input: {
//         flex: 1,
//         padding: "12px 16px",
//         borderRadius: 8,
//         border: "1px solid #374151",
//         background: "#161b27",
//         color: "#f9fafb",
//         fontSize: 18,
//         fontFamily: "inherit",
//         outline: "none"
//     },
//     hint: {
//         margin: 0,
//         fontSize: 12,
//         color: "#374151",
//         textAlign: "center"
//     },
//     finalScores: {
//         display: "flex",
//         gap: 16,
//         justifyContent: "center",
//         margin: "4px 0"
//     },
//     scorePill: {
//         border: "1px solid",
//         borderRadius: 8,
//         padding: "12px 24px",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         gap: 4,
//         minWidth: 80
//     }
// };

import { useEffect, useRef, useState } from "react";
import getSocket, { resetSocket } from "./socket/socket";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── tiny auth helpers ────────────────────────────────────────────────────────
function saveAuth(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}
function loadAuth() {
    const token = localStorage.getItem("token");
    const user  = localStorage.getItem("user");
    return token && user ? { token, user: JSON.parse(user) } : null;
}
function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

// ─── root ─────────────────────────────────────────────────────────────────────
export default function App() {
    const saved = loadAuth();
    const [view,  setView]  = useState(saved ? "game" : "login"); // login | signup | game | profile
    const [token, setToken] = useState(saved?.token ?? null);
    const [user,  setUser]  = useState(saved?.user  ?? null);

    function handleLoginSuccess(tok, usr) {
        saveAuth(tok, usr);
        setToken(tok);
        setUser(usr);
        setView("game");
    }

    function handleLogout() {
        clearAuth();
        resetSocket();
        setToken(null);
        setUser(null);
        setView("login");
    }

    if (view === "login")   return <LoginView   onSuccess={handleLoginSuccess} onSwitch={() => setView("signup")} />;
    if (view === "signup")  return <SignupView  onSuccess={handleLoginSuccess} onSwitch={() => setView("login")} />;
    if (view === "profile") return <ProfileView token={token} user={user} onBack={() => setView("game")} onLogout={handleLogout} />;
    return <GameView user={user} token={token} onProfile={() => setView("profile")} onLogout={handleLogout} />;
}

// ─── login ────────────────────────────────────────────────────────────────────
function LoginView({ onSuccess, onSwitch }) {
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError]    = useState(null);
    const [loading,  setLoading]  = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res  = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");
            onSuccess(data.data.token, data.data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={s.page}>
            <div style={s.card}>
                <h2 style={s.cardTitle}>Welcome back</h2>
                <p style={s.cardSub}>Log in to Mathify</p>
                {error && <div style={s.errorBox}>{error}</div>}
                <form onSubmit={handleSubmit} style={s.form}>
                    <input style={s.input} type="email"    placeholder="Email"    value={email}    onChange={e => setEmail(e.target.value)}    required />
                    <input style={s.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button style={s.btnPrimary} type="submit" disabled={loading}>
                        {loading ? "Logging in…" : "Log in"}
                    </button>
                </form>
                <p style={s.switchText}>
                    No account?{" "}
                    <button style={s.linkBtn} onClick={onSwitch}>Sign up</button>
                </p>
            </div>
        </div>
    );
}

// ─── signup ───────────────────────────────────────────────────────────────────
function SignupView({ onSuccess, onSwitch }) {
    const [form,    setForm]    = useState({ username: "", fullName: "", email: "", password: "" });
    const [error,   setError]   = useState(null);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Signup failed");

            // auto-login after signup
            const loginRes  = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const loginData = await loginRes.json();
            if (!loginRes.ok) throw new Error("Signup worked but login failed");
            onSuccess(loginData.data.token, loginData.data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={s.page}>
            <div style={s.card}>
                <h2 style={s.cardTitle}>Create account</h2>
                <p style={s.cardSub}>Join Mathify</p>
                {error && <div style={s.errorBox}>{error}</div>}
                <form onSubmit={handleSubmit} style={s.form}>
                    {[
                        { name: "username", placeholder: "Username",  type: "text" },
                        { name: "fullName", placeholder: "Full name", type: "text" },
                        { name: "email",    placeholder: "Email",     type: "email" },
                        { name: "password", placeholder: "Password",  type: "password" },
                    ].map(f => (
                        <input key={f.name} style={s.input} type={f.type} name={f.name}
                            placeholder={f.placeholder} value={form[f.name]}
                            onChange={handleChange} required />
                    ))}
                    <button style={s.btnPrimary} type="submit" disabled={loading}>
                        {loading ? "Creating account…" : "Sign up"}
                    </button>
                </form>
                <p style={s.switchText}>
                    Already have an account?{" "}
                    <button style={s.linkBtn} onClick={onSwitch}>Log in</button>
                </p>
            </div>
        </div>
    );
}

// ─── profile ──────────────────────────────────────────────────────────────────
function ProfileView({ token, user, onBack, onLogout }) {
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [pRes, mRes] = await Promise.all([
                    fetch(`${API}/api/users/me`,         { headers }),
                    fetch(`${API}/api/users/me/matches`, { headers }),
                ]);
                if (!pRes.ok) throw new Error("Failed to load profile");
                const pData = await pRes.json();
                const mData = mRes.ok ? await mRes.json() : { data: [] };
                setProfile(pData.data);
                setMatches(mData.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [token]);

    if (loading) return <div style={s.page}><div style={s.spinner} /></div>;
    if (error)   return <div style={s.page}><p style={{ color: "#fca5a5" }}>{error}</p></div>;

    const total   = profile.wins + profile.losses;
    const winRate = total > 0 ? Math.round((profile.wins / total) * 100) : 0;

    return (
        <div style={s.root}>
            <header style={s.header}>
                <span style={s.logo}>Mathify</span>
                <div style={{ display: "flex", gap: 10 }}>
                    <button style={s.btnSecondary} onClick={onBack}>Play</button>
                    <button style={s.btnDanger}    onClick={onLogout}>Log out</button>
                </div>
            </header>

            <main style={{ ...s.main, flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* identity */}
                    <div style={{ ...s.card, flexDirection: "row", gap: 20, textAlign: "left", padding: "24px" }}>
                        <div style={s.avatar}>{profile.username[0].toUpperCase()}</div>
                        <div>
                            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f9fafb" }}>{profile.username}</p>
                            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>{profile.email}</p>
                        </div>
                    </div>

                    {/* stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                        {[
                            { label: "Rating",   value: profile.rating, color: "#6ee7b7" },
                            { label: "Wins",     value: profile.wins,   color: "#6ee7b7" },
                            { label: "Losses",   value: profile.losses, color: "#f9a8d4" },
                            { label: "Win rate", value: `${winRate}%`,  color: "#a5b4fc" },
                        ].map(stat => (
                            <div key={stat.label} style={s.statCard}>
                                <span style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</span>
                                <span style={{ fontSize: 12, color: "#6b7280" }}>{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* match history */}
                    <div style={s.card}>
                        <p style={{ margin: "0 0 14px", fontWeight: 600, color: "#f9fafb" }}>Recent matches</p>
                        {matches.length === 0
                            ? <p style={{ color: "#4b5563", fontSize: 14, margin: 0 }}>No matches yet — go play!</p>
                            : matches.map(m => {
                                const won      = m.winner === profile._id || m.winner?._id === profile._id;
                                const opponent = won ? m.loser : m.winner;
                                const opName   = opponent?.username ?? "Unknown";
                                const delta    = won ? `+${m.ratingDelta}` : `-${m.ratingDelta}`;
                                return (
                                    <div key={m._id} style={s.matchRow}>
                                        <span style={{ color: won ? "#6ee7b7" : "#f9a8d4", fontWeight: 700, width: 16 }}>{won ? "W" : "L"}</span>
                                        <span style={{ flex: 1, color: "#d1d5db", fontSize: 14 }}>vs {opName}</span>
                                        <span style={{ color: won ? "#6ee7b7" : "#f9a8d4", fontWeight: 600, width: 40, textAlign: "right" }}>{delta}</span>
                                        <span style={{ color: "#4b5563", fontSize: 12 }}>{new Date(m.endedAt).toLocaleDateString()}</span>
                                    </div>
                                );
                            })
                        }
                    </div>

                </div>
            </main>
        </div>
    );
}

// ─── game (your original logic, updated for userId) ───────────────────────────
function GameView({ user, token, onProfile, onLogout }) {
    const [status,   setStatus]   = useState("idle");
    const [roomId,   setRoomId]   = useState(null);
    const [question, setQuestion] = useState("");
    const [answer,   setAnswer]   = useState("");
    const [winner,   setWinner]   = useState(null);
    const [progress, setProgress] = useState({});
    const [myUserId, setMyUserId] = useState(null);   // ← now userId not socket.id
    const [feedback, setFeedback] = useState(null);
    const [opponentId, setOpponentId] = useState(null);

    const inputRef  = useRef(null);
    const roomIdRef = useRef(null);

    useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

    useEffect(() => {
        const socket = getSocket();

        // server now sends myUserId in game_started
        function handleGameStarted(data) {
            setRoomId(data.roomId);
            setQuestion(data.question);
            setOpponentId(data.opponentId ?? null);
            setMyUserId(data.myUserId);           // ← stable userId from server
            setStatus("playing");
            setProgress({});
            setWinner(null);
            setFeedback(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }

        function handleWaiting()       { setStatus("waiting"); }
        function handleAnswerResult(data) {
            if (data.correct) {
                setFeedback("correct");
                setQuestion(data.nextQuestion ?? "");
            } else {
                setFeedback("wrong");
            }
            setTimeout(() => { setFeedback(null); inputRef.current?.focus(); }, 600);
        }
        function handleProgressUpdate(data) {
            setProgress(prev => ({ ...prev, [data.playerId]: data.progress }));
        }
        function handleGameOver(data) {
            setWinner(data.winner);
            setStatus("finished");
        }
        function handleConnectError() { setStatus("idle"); }

        socket.on("waiting_for_player",  handleWaiting);
        socket.on("game_started",        handleGameStarted);
        socket.on("answer_result",       handleAnswerResult);
        socket.on("progress_update",     handleProgressUpdate);
        socket.on("game_over",           handleGameOver);
        socket.on("connect_error",       handleConnectError);

        return () => {
            socket.off("waiting_for_player",  handleWaiting);
            socket.off("game_started",        handleGameStarted);
            socket.off("answer_result",       handleAnswerResult);
            socket.off("progress_update",     handleProgressUpdate);
            socket.off("game_over",           handleGameOver);
            socket.off("connect_error",       handleConnectError);
        };
    }, []);

    function handleFindMatch() {
        if (["searching","waiting","playing"].includes(status)) return;
        const socket = getSocket();
        setStatus("searching");
        const go = () => socket.emit("find_match");
        if (socket.connected) { go(); return; }
        socket.once("connect", go);
        socket.connect();
    }

    function handleSubmitAnswer() {
        const trimmed = answer.trim();
        if (!trimmed || !roomIdRef.current) return;
        getSocket().emit("submit_answer", { roomId: roomIdRef.current, answer: trimmed });
        setAnswer("");
    }

    function handlePlayAgain() {
        setStatus("idle");
        setRoomId(null);
        setQuestion("");
        setAnswer("");
        setWinner(null);
        setProgress({});
        setFeedback(null);
        setOpponentId(null);
        setMyUserId(null);
    }

    const myProgress       = progress[myUserId] ?? 0;
    const opponentProgress = opponentId ? (progress[opponentId] ?? 0) : 0;
    const iWon             = winner !== null && winner === myUserId;

    return (
        <div style={s.root}>
            <header style={s.header}>
                <span style={s.logo}>Mathify</span>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {user && (
                        <button style={s.btnSecondary} onClick={onProfile}>
                            {user.username} · {user.rating ?? "—"}
                        </button>
                    )}
                    <button style={s.btnDanger} onClick={onLogout}>Log out</button>
                </div>
            </header>

            <main style={s.main}>
                {status === "idle" && (
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>Ready to race?</h2>
                        <p style={s.cardSub}>Answer 10 math questions faster than your opponent.</p>
                        <button style={s.btnPrimary} onClick={handleFindMatch}>Find Match</button>
                    </div>
                )}

                {(status === "searching" || status === "waiting") && (
                    <div style={s.card}>
                        <div style={s.spinner} />
                        <h2 style={s.cardTitle}>
                            {status === "searching" ? "Connecting…" : "Waiting for opponent…"}
                        </h2>
                        <p style={s.cardSub}>Hang tight, finding you a match.</p>
                    </div>
                )}

                {status === "playing" && (
                    <div style={s.gameArea}>
                        <div style={s.progressSection}>
                            <ProgressBar label="You"      value={myProgress}       max={10} accent="#6ee7b7" />
                            <ProgressBar label="Opponent" value={opponentProgress} max={10} accent="#f9a8d4" />
                        </div>

                        <div style={s.questionBox}>
                            <span style={s.questionLabel}>Solve</span>
                            <span style={s.questionText}>{question}</span>
                        </div>

                        {feedback && (
                            <div style={{
                                ...s.feedbackBadge,
                                background: feedback === "correct" ? "#6ee7b7" : "#fca5a5",
                                color:      feedback === "correct" ? "#064e3b" : "#7f1d1d",
                            }}>
                                {feedback === "correct" ? "Correct!" : "Wrong"}
                            </div>
                        )}

                        <div style={s.inputRow}>
                            <input
                                ref={inputRef}
                                type="number"
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSubmitAnswer()}
                                placeholder="Your answer"
                                style={s.input}
                                autoFocus
                            />
                            <button style={s.btnPrimary} onClick={handleSubmitAnswer}>Submit</button>
                        </div>
                        <p style={s.hint}>Press Enter to submit</p>
                    </div>
                )}

                {status === "finished" && (
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>{iWon ? "You won! 🎉" : "You lost!"}</h2>
                        <p style={s.cardSub}>
                            {iWon ? "Great speed! You answered 10 questions first." : "Your opponent was faster this time."}
                        </p>
                        <div style={s.finalScores}>
                            <ScorePill label="You"      value={myProgress}       accent="#6ee7b7" />
                            <ScorePill label="Opponent" value={opponentProgress} accent="#f9a8d4" />
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button style={s.btnPrimary}    onClick={handlePlayAgain}>Play Again</button>
                            <button style={s.btnSecondary}  onClick={onProfile}>View Profile</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// ─── shared sub-components ────────────────────────────────────────────────────
function ProgressBar({ label, value, max, accent }) {
    const percent = Math.min((value / max) * 100, 100);
    return (
        <div style={{ flex: 1 }}>
            <div style={s.progressMeta}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
                <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600 }}>{value}/{max}</span>
            </div>
            <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${percent}%`, background: accent, transition: "width 0.3s ease" }} />
            </div>
        </div>
    );
}

function ScorePill({ label, value, accent }) {
    return (
        <div style={{ ...s.scorePill, borderColor: accent }}>
            <span style={{ color: accent, fontWeight: 700, fontSize: 24 }}>{value}</span>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
        </div>
    );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = {
    root:            { minHeight: "100vh", background: "#0f1117", color: "#f3f4f6", fontFamily: "'DM Mono','Fira Code',monospace", display: "flex", flexDirection: "column" },
    page:            { minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" },
    header:          { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid #1f2937" },
    logo:            { fontSize: 22, fontWeight: 700, color: "#f9fafb" },
    main:            { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
    card:            { background: "#161b27", border: "1px solid #1f2937", borderRadius: 8, padding: "48px 40px", maxWidth: 440, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
    cardTitle:       { margin: 0, fontSize: 26, fontWeight: 600, color: "#f9fafb" },
    cardSub:         { margin: 0, color: "#6b7280", fontSize: 14, lineHeight: 1.6 },
    form:            { display: "flex", flexDirection: "column", gap: 12, width: "100%" },
    input:           { padding: "12px 16px", borderRadius: 8, border: "1px solid #374151", background: "#0f1117", color: "#f9fafb", fontSize: 15, fontFamily: "inherit", outline: "none" },
    btnPrimary:      { padding: "12px 32px", borderRadius: 8, border: "none", background: "#6ee7b7", color: "#064e3b", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" },
    btnSecondary:    { padding: "8px 16px", borderRadius: 6, border: "1px solid #374151", background: "transparent", color: "#d1d5db", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
    btnDanger:       { padding: "8px 16px", borderRadius: 6, border: "none", background: "#450a0a", color: "#fca5a5", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
    linkBtn:         { background: "none", border: "none", color: "#6ee7b7", cursor: "pointer", fontFamily: "inherit", fontSize: 13, padding: 0 },
    errorBox:        { background: "#450a0a", border: "1px solid #991b1b", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: 13, width: "100%", boxSizing: "border-box" },
    switchText:      { margin: 0, color: "#6b7280", fontSize: 13 },
    spinner:         { width: 36, height: 36, border: "3px solid #1f2937", borderTop: "3px solid #6ee7b7", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    avatar:          { width: 52, height: 52, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#6ee7b7", flexShrink: 0 },
    statCard:        { background: "#161b27", border: "1px solid #1f2937", borderRadius: 8, padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
    matchRow:        { display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid #1f2937" },
    gameArea:        { width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 24 },
    progressSection: { display: "flex", gap: 20 },
    progressMeta:    { display: "flex", justifyContent: "space-between", marginBottom: 4 },
    barTrack:        { height: 8, background: "#1f2937", borderRadius: 4, overflow: "hidden" },
    barFill:         { height: "100%", borderRadius: 4 },
    questionBox:     { background: "#161b27", border: "1px solid #1f2937", borderRadius: 8, padding: "32px 24px", textAlign: "center" },
    questionLabel:   { display: "block", fontSize: 11, color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 },
    questionText:    { fontSize: 42, fontWeight: 700, color: "#f9fafb" },
    feedbackBadge:   { padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 14, textAlign: "center" },
    inputRow:        { display: "flex", gap: 10 },
    hint:            { margin: 0, fontSize: 12, color: "#374151", textAlign: "center" },
    finalScores:     { display: "flex", gap: 16, justifyContent: "center" },
    scorePill:       { border: "1px solid", borderRadius: 8, padding: "12px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 80 },
};