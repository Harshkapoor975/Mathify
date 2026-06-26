// import { useEffect, useRef, useState, useCallback } from "react";
// import getSocket from "../socket/socket";
// import ScorePill from "../components/ScorePill";

// function Countdown({ endsAt }) {
//     const [secondsLeft, setSecondsLeft] = useState(() =>
//         Math.max(0, Math.round((endsAt - Date.now()) / 1000))
//     );

//     useEffect(() => {
//         const interval = setInterval(() => {
//             const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
//             setSecondsLeft(remaining);
//             if (remaining === 0) clearInterval(interval);
//         }, 500);

//         return () => clearInterval(interval);
//     }, [endsAt]);

//     const isUrgent = secondsLeft <= 10;

//     return (
//         <div style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 2
//         }}>
//             <span style={{
//                 fontSize: 11,
//                 color: "#4b5563",
//                 letterSpacing: "0.1em",
//                 textTransform: "uppercase"
//             }}>
//                 Time left
//             </span>
//             <span style={{
//                 fontSize: 32,
//                 fontWeight: 700,
//                 fontFamily: "inherit",
//                 color: isUrgent ? "#fca5a5" : "#6ee7b7",
//                 transition: "color 0.3s",
//                 minWidth: 48,
//                 textAlign: "center"
//             }}>
//                 {secondsLeft}
//             </span>
//         </div>
//     );
// }

// function ScoreBoard({ scores, myUserId, opponentId, lastScorerId }) {
//     const myScore = scores[myUserId] ?? 0;
//     const opponentScore = opponentId ? scores[opponentId] ?? 0 : 0;

//     return (
//         <div style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             background: "#161b27",
//             border: "1px solid #1f2937",
//             borderRadius: 8,
//             padding: "16px 24px",
//             width: "100%"
//         }}>
//             {/* My score */}
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
//                 <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase" }}>
//                     You
//                 </span>
//                 <span style={{
//                     fontSize: 36,
//                     fontWeight: 700,
//                     color: lastScorerId === myUserId ? "#6ee7b7" : "#f9fafb",
//                     transition: "color 0.4s"
//                 }}>
//                     {myScore}
//                 </span>
//             </div>

//             {/* VS divider */}
//             <span style={{ color: "#374151", fontSize: 13, fontWeight: 600 }}>VS</span>

//             {/* Opponent score */}
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
//                 <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase" }}>
//                     Opponent
//                 </span>
//                 <span style={{
//                     fontSize: 36,
//                     fontWeight: 700,
//                     color: lastScorerId === opponentId ? "#f9a8d4" : "#f9fafb",
//                     transition: "color 0.4s"
//                 }}>
//                     {opponentScore}
//                 </span>
//             </div>
//         </div>
//     );
// }

// export default function SurvivalPage({ user, onProfile, onLogout, onLeaderboard, onBack }) {
//     const [status, setStatus] = useState("idle");
//     const [roomId, setRoomId] = useState(null);
//     const [question, setQuestion] = useState("");
//     const [answer, setAnswer] = useState("");
//     const [winner, setWinner] = useState(null);
//     const [scores, setScores] = useState({});
//     const [myUserId, setMyUserId] = useState(null);
//     const [opponentId, setOpponentId] = useState(null);
//     const [feedback, setFeedback] = useState(null);
//     const [endsAt, setEndsAt] = useState(null);
//     const [lastScorerId, setLastScorerId] = useState(null);
//     const [finalScores, setFinalScores] = useState(null);

//     const inputRef = useRef(null);
//     const roomIdRef = useRef(null);

//     useEffect(() => {
//         roomIdRef.current = roomId;
//     }, [roomId]);

//     useEffect(() => {
//         const socket = getSocket();

//         function handleWaiting() {
//             setStatus("waiting");
//         }

//         function handleGameStarted(data) {
//             setRoomId(data.roomId);
//             setQuestion(data.question);
//             setOpponentId(data.opponentId ?? null);
//             setMyUserId(data.myUserId);
//             setEndsAt(data.endsAt);
//             setScores({
//                 [data.myUserId]: 0,
//                 [data.opponentId]: 0
//             });
//             setStatus("playing");
//             setWinner(null);
//             setFeedback(null);
//             setLastScorerId(null);
//             setFinalScores(null);
//             setTimeout(() => inputRef.current?.focus(), 100);
//         }

//         function handleAnswerResult(data) {
//             // only fires for wrong answers in survival
//             if (!data.correct) {
//                 setFeedback("wrong");
//                 setTimeout(() => {
//                     setFeedback(null);
//                     inputRef.current?.focus();
//                 }, 600);
//             }
//         }

//         function handleSurvivalPoint(data) {
//             // correct answer — update question and scores for both players
//             setQuestion(data.nextQuestion);
//             setScores(data.scores);
//             setLastScorerId(data.scorerId);

//             // flash green if I scored, pink if opponent scored
//             const iScored = data.scorerId === myUserId;
//             setFeedback(iScored ? "correct" : "opponent_scored");

//             setTimeout(() => {
//                 setFeedback(null);
//                 inputRef.current?.focus();
//             }, 600);
//         }

//         function handleGameOver(data) {
//             setWinner(data.winner);
//             setFinalScores(data.scores ?? scores);
//             setStatus("finished");
//         }

//         function handleGamePaused() {
//             setStatus("paused");
//         }

//         function handleGameAborted() {
//             setStatus("aborted");
//         }

//         function handleConnectError(err) {
//             if (err?.message?.includes("Unauthorized")) {
//                 onLogout();
//                 return;
//             }
//             setStatus("idle");
//         }
//         function handleGameResumed(data) {
//     if (data.roomId) setRoomId(data.roomId);
//     if (data.question) setQuestion(data.question);
//     if (data.opponentId !== undefined) setOpponentId(data.opponentId ?? null);
//     if (data.myUserId) setMyUserId(data.myUserId);
//     if (data.progress) {
//         // survival sends progress as scores keyed by userId
//         setScores(data.progress);
//     }
//     setStatus("playing");
//     setTimeout(() => inputRef.current?.focus(), 100);
// }

//         socket.on("waiting_for_player", handleWaiting);
//         socket.on("game_started", handleGameStarted);
//         socket.on("answer_result", handleAnswerResult);
//         socket.on("survival_point", handleSurvivalPoint);
//         socket.on("game_over", handleGameOver);
//         socket.on("game_paused", handleGamePaused);
//         socket.on("game_aborted", handleGameAborted);
//         socket.on("connect_error", handleConnectError);
//         socket.on("game_resumed", handleGameResumed);

//         return () => {
//             socket.off("waiting_for_player", handleWaiting);
//             socket.off("game_started", handleGameStarted);
//             socket.off("answer_result", handleAnswerResult);
//             socket.off("survival_point", handleSurvivalPoint);
//             socket.off("game_over", handleGameOver);
//             socket.off("game_paused", handleGamePaused);
//             socket.off("game_aborted", handleGameAborted);
//             socket.off("connect_error", handleConnectError);
//             socket.off("game_resumed", handleGameResumed);
//         };
//     }, []);

//     function handleFindMatch() {
//         if (["searching", "waiting", "playing"].includes(status)) return;
//         const socket = getSocket();
//         setStatus("searching");

//         const requestMatch = () => socket.emit("find_survival_match");
//         if (socket.connected) {
//             requestMatch();
//             return;
//         }

//         socket.once("connect", requestMatch);
//         socket.connect();
//     }

//     function handleSubmitAnswer() {
//         const trimmed = answer.trim();
//         if (!trimmed || !roomIdRef.current) return;
//         getSocket().emit("submit_answer", { roomId: roomIdRef.current, answer: trimmed });
//         setAnswer("");
//     }

//     function handlePlayAgain() {
//         setStatus("idle");
//         setRoomId(null);
//         setQuestion("");
//         setAnswer("");
//         setWinner(null);
//         setScores({});
//         setFeedback(null);
//         setOpponentId(null);
//         setMyUserId(null);
//         setEndsAt(null);
//         setLastScorerId(null);
//         setFinalScores(null);
//     }

//     const myScore = finalScores?.[myUserId] ?? scores[myUserId] ?? 0;
//     const opponentScore = finalScores?.[opponentId] ?? scores[opponentId] ?? 0;
//     const iWon = winner !== null && winner === myUserId;
//     const isDraw = winner === null;

//     return (
//         <div className="root">
//             <header className="header">
//                 <span className="logo">Mathify</span>
//                 <div className="header-actions">
//                     {user && (
//                         <button className="btn-secondary" type="button" onClick={onProfile}>
//                             {user.username} · {user.rating ?? "—"}
//                         </button>
//                     )}
//                     <button className="btn-secondary" type="button" onClick={onLeaderboard}>
//                         Leaderboard
//                     </button>
//                     <button className="btn-secondary" type="button" onClick={onBack}>
//                         ← Blitz
//                     </button>
//                     <button className="btn-danger" type="button" onClick={onLogout}>Log out</button>
//                 </div>
//             </header>

//             <main className="main">

//                 {status === "idle" && (
//                     <div className="card">
//                         <div style={{
//                             background: "#450a0a",
//                             color: "#fca5a5",
//                             padding: "6px 14px",
//                             borderRadius: 20,
//                             fontSize: 12,
//                             fontWeight: 600,
//                             letterSpacing: "0.08em"
//                         }}>
//                             SURVIVAL MODE
//                         </div>
//                         <h2 className="card-title">60 second showdown</h2>
//                         <p className="card-sub">
//                             Both players see the same question. First correct answer scores a point and advances to the next question. Most points when time runs out wins.
//                         </p>
//                         <button className="btn-primary" type="button" onClick={handleFindMatch}>
//                             Find Match
//                         </button>
//                         <button className="btn-secondary" type="button" onClick={onBack}>
//                             Switch to Blitz
//                         </button>
//                     </div>
//                 )}

//                 {(status === "searching" || status === "waiting") && (
//                     <div className="card">
//                         <div className="spinner" />
//                         <h2 className="card-title">
//                             {status === "searching" ? "Connecting…" : "Waiting for opponent…"}
//                         </h2>
//                         <p className="card-sub">Finding you a survival match.</p>
//                     </div>
//                 )}

//                 {status === "paused" && (
//                     <div className="card">
//                         <div className="spinner" />
//                         <h2 className="card-title">Opponent disconnected</h2>
//                         <p className="card-sub">The game is paused. They have 30 seconds to reconnect.</p>
//                     </div>
//                 )}

//                 {status === "playing" && (
//                     <div className="game-area">

//                         {/* Timer + scoreboard */}
//                         <div style={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 16
//                         }}>
//                             <div style={{ flex: 1 }}>
//                                 <ScoreBoard
//                                     scores={scores}
//                                     myUserId={myUserId}
//                                     opponentId={opponentId}
//                                     lastScorerId={lastScorerId}
//                                 />
//                             </div>
//                             {endsAt && <Countdown endsAt={endsAt} />}
//                         </div>

//                         {/* Question */}
//                         <div className="question-box">
//                             <span className="question-label">Solve first</span>
//                             <span className="question-text">{question}</span>
//                         </div>

//                         {feedback && (
//                             <div className={`feedback-badge ${
//                                 feedback === "correct" ? "correct" :
//                                 feedback === "opponent_scored" ? "wrong" :
//                                 "wrong"
//                             }`}>
//                                 {feedback === "correct" ? "Point!" :
//                                  feedback === "opponent_scored" ? "Opponent scored" :
//                                  "Wrong"}
//                             </div>
//                         )}

//                         <div className="input-row">
//                             <input
//                                 ref={inputRef}
//                                 className="input"
//                                 type="number"
//                                 value={answer}
//                                 onChange={e => setAnswer(e.target.value)}
//                                 onKeyDown={e => e.key === "Enter" && handleSubmitAnswer()}
//                                 placeholder="Your answer"
//                                 autoFocus
//                             />
//                             <button className="btn-primary" type="button" onClick={handleSubmitAnswer}>
//                                 Submit
//                             </button>
//                         </div>
//                         <p className="hint">Press Enter to submit</p>
//                     </div>
//                 )}

//                 {status === "finished" && (
//                     <div className="card">
//                         <h2 className="card-title">
//                             {isDraw ? "It's a draw!" : iWon ? "You won! 🎉" : "You lost!"}
//                         </h2>
//                         <p className="card-sub">
//                             {isDraw
//                                 ? "Perfectly matched. Same score when time ran out."
//                                 : iWon
//                                 ? "More points when the clock hit zero."
//                                 : "Your opponent scored more this time."}
//                         </p>
//                         <div className="final-scores">
//                             <ScorePill label="You" value={myScore} accent="#6ee7b7" />
//                             <ScorePill label="Opponent" value={opponentScore} accent="#f9a8d4" />
//                         </div>
//                         <div className="finish-actions">
//                             <button className="btn-primary" type="button" onClick={handlePlayAgain}>
//                                 Play Again
//                             </button>
//                             <button className="btn-secondary" type="button" onClick={onProfile}>
//                                 View Profile
//                             </button>
//                             <button className="btn-secondary" type="button" onClick={onBack}>
//                                 Switch to Blitz
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {status === "aborted" && (
//                     <div className="card">
//                         <h2 className="card-title">Game aborted</h2>
//                         <p className="card-sub">A player did not reconnect in time.</p>
//                         <div className="finish-actions">
//                             <button className="btn-primary" type="button" onClick={handlePlayAgain}>
//                                 Play Again
//                             </button>
//                             <button className="btn-secondary" type="button" onClick={onBack}>
//                                 Switch to Blitz
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </main>
//         </div>
//     );
// }
import { useEffect, useRef, useState, useCallback } from "react";
import getSocket from "../socket/socket";
import ScorePill from "../components/ScorePill";
import Navbar from "../components/Navbar";
import RotatingTarget from "../components/RotatingTarget";
import VerticalQuestion from "../components/VerticalQuestion";

function Countdown({ endsAt }) {
    const [secondsLeft, setSecondsLeft] = useState(() =>
        Math.max(0, Math.round((endsAt - Date.now()) / 1000))
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0) clearInterval(interval);
        }, 500);

        return () => clearInterval(interval);
    }, [endsAt]);

    const isUrgent = secondsLeft <= 10;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2
        }}>
            <span style={{
                fontSize: 11,
                color: "#4b5563",
                letterSpacing: "0.1em",
                textTransform: "uppercase"
            }}>
                Time left
            </span>
            <span style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "inherit",
                color: isUrgent ? "#fca5a5" : "#6ee7b7",
                transition: "color 0.3s",
                minWidth: 48,
                textAlign: "center"
            }}>
                {secondsLeft}
            </span>
        </div>
    );
}

function ScoreBoard({ scores, myUserId, opponentId, lastScorerId }) {
    const myScore = scores[myUserId] ?? 0;
    const opponentScore = opponentId ? scores[opponentId] ?? 0 : 0;

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#161b27",
            border: "1px solid #1f2937",
            borderRadius: 8,
            padding: "16px 24px",
            width: "100%"
        }}>
            {/* My score */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    You
                </span>
                <span style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: lastScorerId === myUserId ? "#6ee7b7" : "#f9fafb",
                    transition: "color 0.4s"
                }}>
                    {myScore}
                </span>
            </div>

            {/* VS divider */}
            <span style={{ color: "#374151", fontSize: 13, fontWeight: 600 }}>VS</span>

            {/* Opponent score */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Opponent
                </span>
                <span style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: lastScorerId === opponentId ? "#f9a8d4" : "#f9fafb",
                    transition: "color 0.4s"
                }}>
                    {opponentScore}
                </span>
            </div>
        </div>
    );
}

export default function SurvivalPage({ user, onProfile, onLogout, onLeaderboard, onBack }) {
    const [status, setStatus] = useState("idle");
    const [roomId, setRoomId] = useState(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [winner, setWinner] = useState(null);
    const [scores, setScores] = useState({});
    const [myUserId, setMyUserId] = useState(null);
    const [opponentId, setOpponentId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [endsAt, setEndsAt] = useState(null);
    const [lastScorerId, setLastScorerId] = useState(null);
    const [finalScores, setFinalScores] = useState(null);

    const inputRef = useRef(null);
    const roomIdRef = useRef(null);

    useEffect(() => {
        roomIdRef.current = roomId;
    }, [roomId]);

    useEffect(() => {
        const socket = getSocket();

        function handleWaiting() {
            setStatus("waiting");
        }

        function handleGameStarted(data) {
            setRoomId(data.roomId);
            setQuestion(data.question);
            setOpponentId(data.opponentId ?? null);
            setMyUserId(data.myUserId);
            setEndsAt(data.endsAt);
            setScores({
                [data.myUserId]: 0,
                [data.opponentId]: 0
            });
            setStatus("playing");
            setWinner(null);
            setFeedback(null);
            setLastScorerId(null);
            setFinalScores(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }

        function handleAnswerResult(data) {
            // only fires for wrong answers in survival
            if (!data.correct) {
                setFeedback("wrong");
                setTimeout(() => {
                    setFeedback(null);
                    inputRef.current?.focus();
                }, 600);
            }
        }

        function handleSurvivalPoint(data) {
            // correct answer — update question and scores for both players
            setQuestion(data.nextQuestion);
            setScores(data.scores);
            setLastScorerId(data.scorerId);

            // flash green if I scored, pink if opponent scored
            const iScored = data.scorerId === myUserId;
            setFeedback(iScored ? "correct" : "opponent_scored");

            setTimeout(() => {
                setFeedback(null);
                inputRef.current?.focus();
            }, 600);
        }

        function handleGameOver(data) {
            setWinner(data.winner);
            setFinalScores(data.scores ?? scores);
            setStatus("finished");
        }

        function handleGamePaused() {
            setStatus("paused");
        }

        function handleGameAborted() {
            setStatus("aborted");
        }

        function handleConnectError(err) {
            if (err?.message?.includes("Unauthorized")) {
                onLogout();
                return;
            }
            setStatus("idle");
        }
        function handleGameResumed(data) {
    if (data.roomId) setRoomId(data.roomId);
    if (data.question) setQuestion(data.question);
    if (data.opponentId !== undefined) setOpponentId(data.opponentId ?? null);
    if (data.myUserId) setMyUserId(data.myUserId);
    if (data.progress) {
        // survival sends progress as scores keyed by userId
        setScores(data.progress);
    }
    setStatus("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
}

        socket.on("waiting_for_player", handleWaiting);
        socket.on("game_started", handleGameStarted);
        socket.on("answer_result", handleAnswerResult);
        socket.on("survival_point", handleSurvivalPoint);
        socket.on("game_over", handleGameOver);
        socket.on("game_paused", handleGamePaused);
        socket.on("game_aborted", handleGameAborted);
        socket.on("connect_error", handleConnectError);
        socket.on("game_resumed", handleGameResumed);

        return () => {
            socket.off("waiting_for_player", handleWaiting);
            socket.off("game_started", handleGameStarted);
            socket.off("answer_result", handleAnswerResult);
            socket.off("survival_point", handleSurvivalPoint);
            socket.off("game_over", handleGameOver);
            socket.off("game_paused", handleGamePaused);
            socket.off("game_aborted", handleGameAborted);
            socket.off("connect_error", handleConnectError);
            socket.off("game_resumed", handleGameResumed);
        };
    }, []);

    function handleFindMatch() {
        if (["searching", "waiting", "playing"].includes(status)) return;
        const socket = getSocket();
        setStatus("searching");

        const requestMatch = () => socket.emit("find_survival_match");
        if (socket.connected) {
            requestMatch();
            return;
        }

        socket.once("connect", requestMatch);
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
        setScores({});
        setFeedback(null);
        setOpponentId(null);
        setMyUserId(null);
        setEndsAt(null);
        setLastScorerId(null);
        setFinalScores(null);
    }

    const myScore = finalScores?.[myUserId] ?? scores[myUserId] ?? 0;
    const opponentScore = finalScores?.[opponentId] ?? scores[opponentId] ?? 0;
    const iWon = winner !== null && winner === myUserId;
    const isDraw = winner === null;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-pitch)", position: "relative" }}>
            {status !== "playing" && (
                <Navbar
                    user={user}
                    activePage="lobby"
                    onLobby={onBack}
                    onProfile={onProfile}
                    onLeaderboard={onLeaderboard}
                    onLogout={onLogout}
                />
            )}

            <main className="main">

                {status === "idle" && (
                    <div className="card">
                        <div style={{
                            background: "#450a0a",
                            color: "#fca5a5",
                            padding: "6px 14px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.08em"
                        }}>
                            SURVIVAL MODE
                        </div>
                        <h2 className="card-title">60 second showdown</h2>
                        <p className="card-sub">
                            Both players see the same question. First correct answer scores a point and advances to the next question. Most points when time runs out wins.
                        </p>
                        <button className="btn-primary" type="button" onClick={handleFindMatch}>
                            Find Match
                        </button>
                        <button className="btn-secondary" type="button" onClick={onBack}>
                            Switch to Blitz
                        </button>
                    </div>
                )}

                {(status === "searching" || status === "waiting") && (
                    <div className="card">
                        <RotatingTarget />
                        <h2 className="card-title">
                            {status === "searching" ? "Connecting…" : "Waiting for opponent…"}
                        </h2>
                        <p className="card-sub">Finding you a survival match.</p>
                    </div>
                )}

                {status === "paused" && (
                    <div className="card">
                        <div className="spinner" />
                        <h2 className="card-title">Opponent disconnected</h2>
                        <p className="card-sub">The game is paused. They have 30 seconds to reconnect.</p>
                    </div>
                )}

                {status === "playing" && (
                    <div className="game-area">

                        {/* Timer + scoreboard */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16
                        }}>
                            <div style={{ flex: 1 }}>
                                <ScoreBoard
                                    scores={scores}
                                    myUserId={myUserId}
                                    opponentId={opponentId}
                                    lastScorerId={lastScorerId}
                                />
                            </div>
                            {endsAt && <Countdown endsAt={endsAt} />}
                        </div>

                        {/* Question */}
                        <div className="question-box">
                            <span className="question-label">Solve first</span>
                            <VerticalQuestion question={question} />
                        </div>

                        {feedback && (
                            <div className={`feedback-badge ${
                                feedback === "correct" ? "correct" :
                                feedback === "opponent_scored" ? "wrong" :
                                "wrong"
                            }`}>
                                {feedback === "correct" ? "Point!" :
                                 feedback === "opponent_scored" ? "Opponent scored" :
                                 "Wrong"}
                            </div>
                        )}

                        <div className="input-row">
                            <input
                                ref={inputRef}
                                className="input"
                                type="number"
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSubmitAnswer()}
                                placeholder="Your answer"
                                autoFocus
                            />
                            <button className="btn-primary" type="button" onClick={handleSubmitAnswer}>
                                Submit
                            </button>
                        </div>
                        <p className="hint">Press Enter to submit</p>
                    </div>
                )}

                {status === "finished" && (
                    <div className="card">
                        <h2 className="card-title">
                            {isDraw ? "It's a draw!" : iWon ? "You won! 🎉" : "You lost!"}
                        </h2>
                        <p className="card-sub">
                            {isDraw
                                ? "Perfectly matched. Same score when time ran out."
                                : iWon
                                ? "More points when the clock hit zero."
                                : "Your opponent scored more this time."}
                        </p>
                        <div className="final-scores">
                            <ScorePill label="You" value={myScore} accent="#6ee7b7" />
                            <ScorePill label="Opponent" value={opponentScore} accent="#f9a8d4" />
                        </div>
                        <div className="finish-actions">
                            <button className="btn-primary" type="button" onClick={handlePlayAgain}>
                                Play Again
                            </button>
                            <button className="btn-secondary" type="button" onClick={onProfile}>
                                View Profile
                            </button>
                            <button className="btn-secondary" type="button" onClick={onBack}>
                                Switch to Blitz
                            </button>
                        </div>
                    </div>
                )}

                {status === "aborted" && (
                    <div className="card">
                        <h2 className="card-title">Game aborted</h2>
                        <p className="card-sub">A player did not reconnect in time.</p>
                        <div className="finish-actions">
                            <button className="btn-primary" type="button" onClick={handlePlayAgain}>
                                Play Again
                            </button>
                            <button className="btn-secondary" type="button" onClick={onBack}>
                                Switch to Blitz
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}