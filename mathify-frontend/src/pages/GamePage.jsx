import { useEffect, useRef, useState } from "react";
import getSocket from "../socket/socket";
import ProgressBar from "../components/ProgressBar";
import ScorePill from "../components/ScorePill";
import Navbar from "../components/Navbar";
import RotatingTarget from "../components/RotatingTarget";
import VerticalQuestion from "../components/VerticalQuestion";

export default function GamePage({ user, onProfile, onLogout, onLeaderboard, onLobby }) {
    const [status, setStatus] = useState("idle");
    const [roomId, setRoomId] = useState(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [winner, setWinner] = useState(null);
    const [progress, setProgress] = useState({});
    const [myUserId, setMyUserId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [opponentId, setOpponentId] = useState(null);

    const [rematchStatus, setRematchStatus] = useState("idle");
    const [rematchError, setRematchError] = useState(null);

    const inputRef = useRef(null);
    const roomIdRef = useRef(null);

    useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

    useEffect(() => {
        const socket = getSocket();

        function handleWaiting() { setStatus("waiting"); }
        function handleGameStarted(data) {
            setRoomId(data.roomId);
            setQuestion(data.question);
            setOpponentId(data.opponentId ?? null);
            setMyUserId(data.myUserId);
            setStatus("playing");
            setProgress({});
            setWinner(null);
            setFeedback(null);
            setRematchStatus("idle");
            setRematchError(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        function handleAnswerResult(data) {
            if (data.correct) {
                setFeedback("correct");
                setQuestion(data.nextQuestion ?? "");
            } else {
                setFeedback("wrong");
            }
            setTimeout(() => {
                setFeedback(null);
                inputRef.current?.focus();
            }, 600);
        }
        function handleProgressUpdate(data) {
            setProgress(prev => ({ ...prev, [data.playerId]: data.progress }));
        }
        function handleGameOver(data) {
            setWinner(data.winner);
            setStatus("finished");
        }
        function handleGamePaused() { setStatus("paused"); }
        function handleGameResumed(data) {
            if (data.roomId) setRoomId(data.roomId);
            if (data.question) setQuestion(data.question);
            if (data.opponentId !== undefined) setOpponentId(data.opponentId ?? null);
            if (data.myUserId) setMyUserId(data.myUserId);
            if (data.progress) setProgress(data.progress);
            setStatus("playing");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        function handleGameAborted() { setStatus("aborted"); }
        function handleConnectError(err) {
            if (err?.message?.includes("Unauthorized")) { onLogout(); return; }
            setStatus("idle");
        }

        function handleOpponentRequestedRematch(data) {
            console.log("[REMATCH CLIENT] Received opponent_requested_rematch event:", data);
            setRematchStatus("opponent_requested");
        }
        function handleRematchAccepted(data) {
            console.log("[REMATCH CLIENT] Received rematch_accepted event:", data);
            setRematchStatus("idle");
            setRematchError(null);
            setAnswer("");
        }
        function handleRematchDeclined(data) {
            console.log("[REMATCH CLIENT] Received rematch_declined event:", data);
            setRematchStatus("idle");
            setRematchError("Rematch request declined by opponent.");
        }
        function handleRematchError(err) {
            console.log("[REMATCH CLIENT] Received rematch_error event:", err);
            setRematchStatus("idle");
            setRematchError(err || "Rematch expired or failed.");
        }

        socket.on("waiting_for_player", handleWaiting);
        socket.on("game_started", handleGameStarted);
        socket.on("answer_result", handleAnswerResult);
        socket.on("progress_update", handleProgressUpdate);
        socket.on("game_over", handleGameOver);
        socket.on("game_paused", handleGamePaused);
        socket.on("game_resumed", handleGameResumed);
        socket.on("game_aborted", handleGameAborted);
        socket.on("connect_error", handleConnectError);
        socket.on("opponent_requested_rematch", handleOpponentRequestedRematch);
        socket.on("rematch_accepted", handleRematchAccepted);
        socket.on("rematch_declined", handleRematchDeclined);
        socket.on("rematch_error", handleRematchError);

        return () => {
            socket.off("waiting_for_player", handleWaiting);
            socket.off("game_started", handleGameStarted);
            socket.off("answer_result", handleAnswerResult);
            socket.off("progress_update", handleProgressUpdate);
            socket.off("game_over", handleGameOver);
            socket.off("game_paused", handleGamePaused);
            socket.off("game_resumed", handleGameResumed);
            socket.off("game_aborted", handleGameAborted);
            socket.off("connect_error", handleConnectError);
            socket.off("opponent_requested_rematch", handleOpponentRequestedRematch);
            socket.off("rematch_accepted", handleRematchAccepted);
            socket.off("rematch_declined", handleRematchDeclined);
            socket.off("rematch_error", handleRematchError);
        };
    }, []);

    function handleFindMatch() {
        if (["searching", "waiting", "playing"].includes(status)) return;
        const socket = getSocket();
        setStatus("searching");
        const requestMatch = () => socket.emit("find_match");
        if (socket.connected) { requestMatch(); return; }
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
        setProgress({});
        setFeedback(null);
        setOpponentId(null);
        setMyUserId(null);
        setRematchStatus("idle");
        setRematchError(null);
    }

    function handleRequestRematch() {
        if (rematchStatus === "requesting") return;
        setRematchStatus("waiting_opponent");
        setRematchError(null);
        getSocket().emit("rematch_request", { roomId });
    }

    function handleRespondRematch(accept) {
        setRematchStatus(accept ? "requesting" : "idle");
        getSocket().emit("rematch_response", { roomId, accept });
    }

    const myProgress = progress[myUserId] ?? 0;
    const opponentProgress = opponentId ? progress[opponentId] ?? 0 : 0;
    const iWon = winner !== null && winner === myUserId;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-pitch)", position: "relative" }}>
            {status !== "playing" && (
                <Navbar
                    user={user}
                    activePage="lobby"
                    onLobby={onLobby}
                    onProfile={onProfile}
                    onLeaderboard={onLeaderboard}
                    onLogout={onLogout}
                />
            )}

            {/* right side takes all remaining space */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <main className="main">
                    {status === "idle" && (
                        <div className="card">
                            <h2 className="card-title">Blitz</h2>
                            <p className="card-sub">Answer 10 math questions faster than your opponent.</p>
                            <button className="btn-primary" type="button" onClick={handleFindMatch}>Find Match</button>
                            <button className="btn-secondary" type="button" onClick={onLobby}>← Back to lobby</button>
                        </div>
                    )}

                    {(status === "searching" || status === "waiting") && (
                        <div className="card">
                            <RotatingTarget />
                            <h2 className="card-title">
                                {status === "searching" ? "Connecting…" : "Waiting for opponent…"}
                            </h2>
                            <p className="card-sub">Hang tight, finding you a match.</p>
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
                            <div className="progress-section">
                                <ProgressBar label="You" value={myProgress} max={10} accent="#6ee7b7" />
                                <ProgressBar label="Opponent" value={opponentProgress} max={10} accent="#f9a8d4" />
                            </div>
                            <div className="question-box">
                                <span className="question-label">Solve</span>
                                <VerticalQuestion question={question} />
                            </div>
                            {feedback && (
                                <div className={`feedback-badge ${feedback}`}>
                                    {feedback === "correct" ? "Correct!" : "Wrong"}
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
                                <button className="btn-primary" type="button" onClick={handleSubmitAnswer}>Submit</button>
                            </div>
                            <p className="hint">Press Enter to submit</p>
                        </div>
                    )}

                    {status === "finished" && (
                        <div className="card">
                            <h2 className="card-title">{iWon ? "You won! 🎉" : "You lost!"}</h2>
                            <p className="card-sub">
                                {iWon ? "Great speed! You answered 10 questions first." : "Your opponent was faster this time."}
                            </p>
                            <div className="final-scores">
                                <ScorePill label="You" value={myProgress} accent="#6ee7b7" />
                                <ScorePill label="Opponent" value={opponentProgress} accent="#f9a8d4" />
                            </div>
                            <div className="finish-actions">
                                {rematchStatus === "idle" && (
                                    <button className="btn-primary" type="button" onClick={handleRequestRematch}>Rematch</button>
                                )}
                                {rematchStatus === "waiting_opponent" && (
                                    <button className="btn-primary" type="button" disabled style={{ opacity: 0.7 }}>Waiting for opponent...</button>
                                )}
                                {rematchStatus === "opponent_requested" && (
                                    <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "center" }}>
                                        <button className="btn-primary" type="button" onClick={() => handleRespondRematch(true)}>Accept Rematch</button>
                                        <button className="btn-danger" type="button" onClick={() => handleRespondRematch(false)}>Decline</button>
                                    </div>
                                )}
                                {rematchStatus === "requesting" && (
                                    <button className="btn-primary" type="button" disabled style={{ opacity: 0.7 }}>Starting match...</button>
                                )}
                                <button className="btn-secondary" type="button" onClick={handlePlayAgain}>New Match</button>
                                <button className="btn-secondary" type="button" onClick={onProfile}>View Profile</button>
                                <button className="btn-secondary" type="button" onClick={onLobby}>← Lobby</button>
                            </div>
                            {rematchError && (
                                <p style={{ color: "#fca5a5", fontSize: "13px", marginTop: "12px", textAlign: "center" }}>{rematchError}</p>
                            )}
                        </div>
                    )}

                    {status === "aborted" && (
                        <div className="card">
                            <h2 className="card-title">Game aborted</h2>
                            <p className="card-sub">A player did not reconnect in time.</p>
                            <div className="finish-actions">
                                <button className="btn-primary" type="button" onClick={handlePlayAgain}>Play Again</button>
                                <button className="btn-secondary" type="button" onClick={onLobby}>← Lobby</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}