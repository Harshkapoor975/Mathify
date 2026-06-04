import { useEffect, useRef, useState } from "react";
import getSocket from "../socket/socket";
import ProgressBar from "../components/ProgressBar";
import ScorePill from "../components/ScorePill";

export default function GamePage({ user, onProfile, onLogout }) {
    const [status, setStatus] = useState("idle");
    const [roomId, setRoomId] = useState(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [winner, setWinner] = useState(null);
    const [progress, setProgress] = useState({});
    const [myUserId, setMyUserId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [opponentId, setOpponentId] = useState(null);

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
            setStatus("playing");
            setProgress({});
            setWinner(null);
            setFeedback(null);
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

        function handleGamePaused() {
            setStatus("paused");
        }

        function handleGameResumed(data) {
            setRoomId(data.roomId);
            setQuestion(data.question);
            setOpponentId(data.opponentId ?? null);
            setMyUserId(data.myUserId);
            setProgress(data.progress ?? {});
            setStatus("playing");
            setTimeout(() => inputRef.current?.focus(), 100);
        }

        function handleGameAborted() {
            setStatus("aborted");
        }

        function handleConnectError() {
            setStatus("idle");
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
        };
    }, []);

    function handleFindMatch() {
        if (["searching", "waiting", "playing"].includes(status)) return;
        const socket = getSocket();
        setStatus("searching");

        const requestMatch = () => socket.emit("find_match");
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
        setProgress({});
        setFeedback(null);
        setOpponentId(null);
        setMyUserId(null);
    }

    const myProgress = progress[myUserId] ?? 0;
    const opponentProgress = opponentId ? progress[opponentId] ?? 0 : 0;
    const iWon = winner !== null && winner === myUserId;

    return (
        <div className="root">
            <header className="header">
                <span className="logo">Mathify</span>
                <div className="header-actions">
                    {user && (
                        <button className="btn-secondary" type="button" onClick={onProfile}>
                            {user.username} · {user.rating ?? "—"}
                        </button>
                    )}
                    <button className="btn-danger" type="button" onClick={onLogout}>Log out</button>
                </div>
            </header>

            <main className="main">
                {status === "idle" && (
                    <div className="card">
                        <h2 className="card-title">Ready to race?</h2>
                        <p className="card-sub">Answer 10 math questions faster than your opponent.</p>
                        <button className="btn-primary" type="button" onClick={handleFindMatch}>Find Match</button>
                    </div>
                )}

                {(status === "searching" || status === "waiting") && (
                    <div className="card">
                        <div className="spinner" />
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
                            <span className="question-text">{question}</span>
                        </div>

                        {feedback && (
                            <div className={`feedback-badge ${feedback}`}>{feedback === "correct" ? "Correct!" : "Wrong"}</div>
                        )}

                        <div className="input-row">
                            <input
                                ref={inputRef}
                                className="input"
                                type="number"
                                value={answer}
                                onChange={event => setAnswer(event.target.value)}
                                onKeyDown={event => event.key === "Enter" && handleSubmitAnswer()}
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
                            <button className="btn-primary" type="button" onClick={handlePlayAgain}>Play Again</button>
                            <button className="btn-secondary" type="button" onClick={onProfile}>View Profile</button>
                        </div>
                    </div>
                )}

                {status === "aborted" && (
                    <div className="card">
                        <h2 className="card-title">Game aborted</h2>
                        <p className="card-sub">A player did not reconnect in time, so this match was saved as abandoned.</p>
                        <div className="finish-actions">
                            <button className="btn-primary" type="button" onClick={handlePlayAgain}>Play Again</button>
                            <button className="btn-secondary" type="button" onClick={onProfile}>View Profile</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
