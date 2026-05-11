// import { useEffect, useState } from "react";

// import socket from "./socket/socket";

// function App() {

//     const [status, setStatus] =
//         useState("idle");

//     const [roomId, setRoomId] =
//         useState(null);

//     useEffect(() => {

//         function handleConnect() {

//             console.log(
//                 "CONNECTED:",
//                 socket.id
//             );
//         }

//         function handleMatchFound(data) {

//             console.log(
//                 "MATCH FOUND:",
//                 data
//             );

//             setStatus("matched");

//             setRoomId(data.roomId);
//         }

//         function handleWaiting() {

//             console.log(
//                 "Waiting for player..."
//             );

//             setStatus("waiting");
//         }

//         function handleError(err) {

//             console.log(
//                 "ERROR:",
//                 err.message
//             );
//         }

//         socket.on(
//             "connect",
//             handleConnect
//         );

//         socket.on(
//             "match_found",
//             handleMatchFound
//         );

//         socket.on(
//             "waiting_for_player",
//             handleWaiting
//         );

//         socket.on(
//             "connect_error",
//             handleError
//         );

//         return () => {

//             socket.off(
//                 "connect",
//                 handleConnect
//             );

//             socket.off(
//                 "match_found",
//                 handleMatchFound
//             );

//             socket.off(
//                 "waiting_for_player",
//                 handleWaiting
//             );

//             socket.off(
//                 "connect_error",
//                 handleError
//             );
//         };

//     }, []);

//     function handleFindMatch() {

//         // prevent spam queueing
//         if (
//             status === "waiting" ||
//             status === "matched"
//         ) {

//             return;
//         }

//         socket.emit("find_match");

//         console.log(
//             "Searching for match..."
//         );

//         setStatus("searching");
//     }

//     return (

//         <div>

//             <h1>
//                 Mathify
//             </h1>

//             <button
//                 onClick={handleFindMatch}
//                 disabled={
//                     status === "waiting" ||
//                     status === "matched"
//                 }
//             >

//                 {
//                     status === "idle" &&
//                     "Find Match"
//                 }

//                 {
//                     status === "searching" &&
//                     "Searching..."
//                 }

//                 {
//                     status === "waiting" &&
//                     "Waiting..."
//                 }

//                 {
//                     status === "matched" &&
//                     "Matched"
//                 }

//             </button>

//             {
//                 roomId && (

//                     <h2>
//                         Room: {roomId}
//                     </h2>
//                 )
//             }

//         </div>
//     );
// }

// export default App;
import { useEffect, useState } from "react";

import socket from "./socket/socket";

function App() {

    const [status, setStatus] =
        useState("idle");

    const [roomId, setRoomId] =
        useState(null);

    const [question, setQuestion] =
        useState("");

    const [answer, setAnswer] =
        useState("");

    const [winner, setWinner] =
        useState(null);

    const [progress, setProgress] =
        useState({});

    useEffect(() => {

        function handleConnect() {

            console.log(
                "CONNECTED:",
                socket.id
            );
        }

        function handleMatchFound(data) {

            console.log(
                "MATCH FOUND:",
                data
            );

            setStatus("matched");

            setRoomId(data.roomId);
        }

        function handleWaiting() {

            console.log(
                "Waiting for player..."
            );

            setStatus("waiting");
        }

        function handleGameStarted(data) {

            console.log(
                "GAME STARTED:",
                data
            );

            setQuestion(
                data.question
            );
        }

        function handleAnswerResult(data) {

            console.log(
                "ANSWER RESULT:",
                data
            );

            if (data.correct) {

                setQuestion(
                    data.nextQuestion
                );
            }
        }

        function handleProgressUpdate(data) {

            console.log(
                "PROGRESS:",
                data
            );

            setProgress((prev) => {

                return {

                    ...prev,

                    [data.playerId]:
                        data.progress
                };
            });
        }

        function handleGameOver(data) {

            console.log(
                "GAME OVER:",
                data
            );

            setWinner(
                data.winner
            );
        }

        function handleError(err) {

            console.log(
                "ERROR:",
                err.message
            );
        }

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "match_found",
            handleMatchFound
        );

        socket.on(
            "waiting_for_player",
            handleWaiting
        );

        socket.on(
            "game_started",
            handleGameStarted
        );

        socket.on(
            "answer_result",
            handleAnswerResult
        );

        socket.on(
            "progress_update",
            handleProgressUpdate
        );

        socket.on(
            "game_over",
            handleGameOver
        );

        socket.on(
            "connect_error",
            handleError
        );

        return () => {

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "match_found",
                handleMatchFound
            );

            socket.off(
                "waiting_for_player",
                handleWaiting
            );

            socket.off(
                "game_started",
                handleGameStarted
            );

            socket.off(
                "answer_result",
                handleAnswerResult
            );

            socket.off(
                "progress_update",
                handleProgressUpdate
            );

            socket.off(
                "game_over",
                handleGameOver
            );

            socket.off(
                "connect_error",
                handleError
            );
        };

    }, []);

    function handleFindMatch() {

        if (
            status === "waiting" ||
            status === "matched"
        ) {

            return;
        }

        socket.emit("find_match");

        console.log(
            "Searching for match..."
        );

        setStatus("searching");
    }

    function handleSubmitAnswer() {

        if (!answer.trim()) {
            return;
        }

        socket.emit(
            "submit_answer",
            {
                roomId,
                answer
            }
        );

        setAnswer("");
    }

    return (

        <div>

            <h1>
                Mathify
            </h1>

            <button
                onClick={handleFindMatch}
                disabled={
                    status === "waiting" ||
                    status === "matched"
                }
            >

                {
                    status === "idle" &&
                    "Find Match"
                }

                {
                    status === "searching" &&
                    "Searching..."
                }

                {
                    status === "waiting" &&
                    "Waiting..."
                }

                {
                    status === "matched" &&
                    "Matched"
                }

            </button>

            {
                roomId && (

                    <h2>
                        Room:
                        {" "}
                        {roomId}
                    </h2>
                )
            }

            {
                question && (

                    <div>

                        <h2>
                            Question:
                            {" "}
                            {question}
                        </h2>

                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => {

                                setAnswer(
                                    e.target.value
                                );
                            }}
                        />

                        <button
                            onClick={
                                handleSubmitAnswer
                            }
                        >
                            Submit Answer
                        </button>

                    </div>
                )
            }

            <div>

                <h2>
                    Progress
                </h2>

                {
                    Object.entries(
                        progress
                    ).map(
                        ([playerId, prog]) => {

                            return (

                                <div
                                    key={playerId}
                                >

                                    {playerId}
                                    {" : "}
                                    {prog}

                                </div>
                            );
                        }
                    )
                }

            </div>

            {
                winner && (

                    <h1>

                        Winner:
                        {" "}
                        {winner}

                    </h1>
                )
            }

        </div>
    );
}

export default App;