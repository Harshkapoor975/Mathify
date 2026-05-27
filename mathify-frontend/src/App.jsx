import { useEffect, useRef, useState } from "react";
import getSocket from "./socket/socket";

export default function App() {
    const [status, setStatus] = useState("idle");
    const [roomId, setRoomId] = useState(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [winner, setWinner] = useState(null);
    const [progress, setProgress] = useState({});
    const [myId, setMyId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [opponentId, setOpponentId] = useState(null);

    const inputRef = useRef(null);
    const roomIdRef = useRef(null);

    useEffect(() => {
        roomIdRef.current = roomId;
    }, [roomId]);

    useEffect(() => {
        const socket = getSocket();

        function handleConnect() {
            console.log("CONNECTED:", socket.id);
            setMyId(socket.id);
        }

        function handleWaiting() {
            console.log("Waiting for opponent...");
            setStatus("waiting");
        }

        function handleGameStarted(data) {
            console.log("GAME STARTED:", data);
            setRoomId(data.roomId);
            setQuestion(data.question);
            setOpponentId(data.opponentId ?? null);
            setStatus("playing");
            setProgress({});
            setWinner(null);
            setFeedback(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }

        function handleAnswerResult(data) {
            console.log("ANSWER RESULT:", data);

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
            setProgress((prev) => ({
                ...prev,
                [data.playerId]: data.progress
            }));
        }

        function handleGameOver(data) {
            console.log("GAME OVER:", data);
            setWinner(data.winner);
            setStatus("finished");
        }

        function handleConnectError(err) {
            console.error("SOCKET ERROR:", err.message);
            setStatus("idle");
        }

        socket.on("connect", handleConnect);
        socket.on("waiting_for_player", handleWaiting);
        socket.on("game_started", handleGameStarted);
        socket.on("answer_result", handleAnswerResult);
        socket.on("progress_update", handleProgressUpdate);
        socket.on("game_over", handleGameOver);
        socket.on("connect_error", handleConnectError);

        if (socket.connected) {
            setMyId(socket.id);
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("waiting_for_player", handleWaiting);
            socket.off("game_started", handleGameStarted);
            socket.off("answer_result", handleAnswerResult);
            socket.off("progress_update", handleProgressUpdate);
            socket.off("game_over", handleGameOver);
            socket.off("connect_error", handleConnectError);
        };
    }, []);

    function handleFindMatch() {
        if (
            status === "searching" ||
            status === "waiting" ||
            status === "playing"
        ) {
            return;
        }

        const socket = getSocket();
        setStatus("searching");

        const requestMatch = () => {
            socket.emit("find_match");
            console.log("Searching for match...");
        };

        if (socket.connected) {
            requestMatch();
            return;
        }

        socket.once("connect", requestMatch);
        socket.connect();
    }

    function handleSubmitAnswer() {
        const trimmed = answer.trim();

        if (!trimmed || !roomIdRef.current) {
            return;
        }

        const socket = getSocket();
        socket.emit("submit_answer", {
            roomId: roomIdRef.current,
            answer: trimmed
        });

        setAnswer("");
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            handleSubmitAnswer();
        }
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
    }

    const myProgress = progress[myId] ?? 0;
    const opponentProgress = opponentId ? (progress[opponentId] ?? 0) : 0;
    const iWon = winner === myId;

    return (
        <div style={styles.root}>
            <header style={styles.header}>
                <span style={styles.logo}>Mathify</span>
                {myId && (
                    <span style={styles.socketId}>
                        #{myId.slice(0, 6)}
                    </span>
                )}
            </header>

            <main style={styles.main}>
                {status === "idle" && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Ready to race?</h2>
                        <p style={styles.cardSub}>
                            Answer 10 math questions faster than your opponent.
                        </p>
                        <button style={styles.btnPrimary} onClick={handleFindMatch}>
                            Find Match
                        </button>
                    </div>
                )}

                {(status === "searching" || status === "waiting") && (
                    <div style={styles.card}>
                        <div style={styles.spinner} />
                        <h2 style={styles.cardTitle}>
                            {status === "searching" ? "Connecting..." : "Waiting for opponent..."}
                        </h2>
                        <p style={styles.cardSub}>Hang tight, finding you a match.</p>
                    </div>
                )}

                {status === "playing" && (
                    <div style={styles.gameArea}>
                        <div style={styles.progressSection}>
                            <ProgressBar
                                label="You"
                                value={myProgress}
                                max={10}
                                accent="#6ee7b7"
                            />
                            <ProgressBar
                                label="Opponent"
                                value={opponentProgress}
                                max={10}
                                accent="#f9a8d4"
                            />
                        </div>

                        <div style={styles.questionBox}>
                            <span style={styles.questionLabel}>Solve</span>
                            <span style={styles.questionText}>{question}</span>
                        </div>

                        {feedback && (
                            <div
                                style={{
                                    ...styles.feedbackBadge,
                                    background: feedback === "correct" ? "#6ee7b7" : "#fca5a5",
                                    color: feedback === "correct" ? "#064e3b" : "#7f1d1d"
                                }}
                            >
                                {feedback === "correct" ? "Correct!" : "Wrong"}
                            </div>
                        )}

                        <div style={styles.inputRow}>
                            <input
                                ref={inputRef}
                                type="number"
                                value={answer}
                                onChange={(event) => setAnswer(event.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Your answer"
                                style={styles.input}
                                autoFocus
                            />
                            <button
                                style={styles.btnPrimary}
                                onClick={handleSubmitAnswer}
                            >
                                Submit
                            </button>
                        </div>

                        <p style={styles.hint}>Press Enter to submit</p>
                    </div>
                )}

                {status === "finished" && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            {iWon ? "You won!" : "You lost!"}
                        </h2>
                        <p style={styles.cardSub}>
                            {iWon
                                ? "Great speed! You answered 10 questions first."
                                : "Your opponent was faster this time."}
                        </p>
                        <div style={styles.finalScores}>
                            <ScorePill label="You" value={myProgress} accent="#6ee7b7" />
                            <ScorePill label="Opponent" value={opponentProgress} accent="#f9a8d4" />
                        </div>
                        <button style={styles.btnPrimary} onClick={handlePlayAgain}>
                            Play Again
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

function ProgressBar({
    label,
    value,
    max,
    accent
}) {
    const percent = Math.min((value / max) * 100, 100);

    return (
        <div style={{ flex: 1 }}>
            <div style={styles.progressMeta}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
                <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600 }}>
                    {value}/{max}
                </span>
            </div>
            <div style={styles.barTrack}>
                <div
                    style={{
                        ...styles.barFill,
                        width: `${percent}%`,
                        background: accent,
                        transition: "width 0.3s ease"
                    }}
                />
            </div>
        </div>
    );
}

function ScorePill({
    label,
    value,
    accent
}) {
    return (
        <div style={{ ...styles.scorePill, borderColor: accent }}>
            <span style={{ color: accent, fontWeight: 700, fontSize: 24 }}>{value}</span>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
        </div>
    );
}

const styles = {
    root: {
        minHeight: "100vh",
        background: "#0f1117",
        color: "#f3f4f6",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        display: "flex",
        flexDirection: "column"
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 32px",
        borderBottom: "1px solid #1f2937"
    },
    logo: {
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 0,
        color: "#f9fafb"
    },
    socketId: {
        fontSize: 11,
        color: "#4b5563",
        fontFamily: "monospace"
    },
    main: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
    },
    card: {
        background: "#161b27",
        border: "1px solid #1f2937",
        borderRadius: 8,
        padding: "48px 40px",
        maxWidth: 440,
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16
    },
    cardTitle: {
        margin: 0,
        fontSize: 26,
        fontWeight: 600,
        color: "#f9fafb"
    },
    cardSub: {
        margin: 0,
        color: "#6b7280",
        fontSize: 14,
        lineHeight: 1.6
    },
    btnPrimary: {
        marginTop: 8,
        padding: "12px 32px",
        borderRadius: 8,
        border: "none",
        background: "#6ee7b7",
        color: "#064e3b",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        letterSpacing: 0,
        transition: "opacity 0.15s"
    },
    spinner: {
        width: 36,
        height: 36,
        border: "3px solid #1f2937",
        borderTop: "3px solid #6ee7b7",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
    },
    gameArea: {
        width: "100%",
        maxWidth: 500,
        display: "flex",
        flexDirection: "column",
        gap: 24
    },
    progressSection: {
        display: "flex",
        gap: 20
    },
    progressMeta: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4
    },
    barTrack: {
        height: 8,
        background: "#1f2937",
        borderRadius: 4,
        overflow: "hidden"
    },
    barFill: {
        height: "100%",
        borderRadius: 4
    },
    questionBox: {
        background: "#161b27",
        border: "1px solid #1f2937",
        borderRadius: 8,
        padding: "32px 24px",
        textAlign: "center"
    },
    questionLabel: {
        display: "block",
        fontSize: 11,
        color: "#4b5563",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 12
    },
    questionText: {
        fontSize: 42,
        fontWeight: 700,
        color: "#f9fafb",
        letterSpacing: 0
    },
    feedbackBadge: {
        padding: "10px 20px",
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        transition: "all 0.2s"
    },
    inputRow: {
        display: "flex",
        gap: 10
    },
    input: {
        flex: 1,
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid #374151",
        background: "#161b27",
        color: "#f9fafb",
        fontSize: 18,
        fontFamily: "inherit",
        outline: "none"
    },
    hint: {
        margin: 0,
        fontSize: 12,
        color: "#374151",
        textAlign: "center"
    },
    finalScores: {
        display: "flex",
        gap: 16,
        justifyContent: "center",
        margin: "4px 0"
    },
    scorePill: {
        border: "1px solid",
        borderRadius: 8,
        padding: "12px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        minWidth: 80
    }
};
