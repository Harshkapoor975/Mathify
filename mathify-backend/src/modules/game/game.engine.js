// // modules/game/game.engine.js

// const {
//     getGame,
//     setGame
// } = require("./game.store");

// function generateQuestion() {

//     const a =
//         Math.floor(Math.random() * 20) + 1;

//     const b =
//         Math.floor(Math.random() * 20) + 1;

//     const ops = ['+', '-', '*'];

//     const op =
//         ops[Math.floor(Math.random() * ops.length)];

//     let answer;

//     if (op === '+') {
//         answer = a + b;
//     }

//     else if (op === '-') {
//         answer = a - b;
//     }

//     else {
//         answer = a * b;
//     }

//     return {
//         text: `${a} ${op} ${b}`,
//         answer
//     };
// }

// function generateQuestions(count) {

//     const questions = [];

//     for (let i = 0; i < count; i++) {
//         questions.push(generateQuestion());
//     }

//     return questions;
// }

// function createGame(gameId) {

//     const game = {

//         id: gameId,

//         questions: generateQuestions(20),

//         players: {

//             p1: {
//                 progress: 0,
//                 totalTime: 0,
//                 score: 0
//             },

//             p2: {
//                 progress: 0,
//                 totalTime: 0,
//                 score: 0
//             }
//         },

//         questionStartTimes: {

//             p1: Date.now(),
//             p2: Date.now()
//         },

//         winner: null,

//         status: "active"
//     };

//     setGame(gameId, game);

//     return sanitizeGame(game);
// }

// function submitAnswer(
//     gameId,
//     playerId,
//     userAnswer
// ) {

//     const game = getGame(gameId);

//     if (!game) {
//         return {
//             error: "Game not found"
//         };
//     }

//     if (game.winner) {
//         return {
//             error: "Game already finished"
//         };
//     }

//     const player =
//         game.players[playerId];

//     const currentQuestionIndex =
//         player.progress;

//     const currentQuestion =
//         game.questions[currentQuestionIndex];

//     if (!currentQuestion) {

//         return {
//             error: "No more questions"
//         };
//     }

//     const correctAnswer =
//         currentQuestion.answer;

//     const startTime =
//         game.questionStartTimes[playerId];

//     const timeTaken =
//         (Date.now() - startTime) / 1000;

//     if (
//         Number(userAnswer) === correctAnswer
//     ) {

//         player.progress++;

//         player.score++;

//         player.totalTime += timeTaken;

//         game.questionStartTimes[playerId] =
//             Date.now();

//         // WIN CONDITION
//         if (
//             player.progress >= 10
//         ) {
//             game.winner = playerId;
//             game.status = "finished";
//         }

//         const nextQuestion =
//             game.questions[player.progress];

//         return {

//             correct: true,

//             nextQuestion:
//                 nextQuestion
//                     ? nextQuestion.text
//                     : null,

//             progress:
//                 player.progress,

//             score:
//                 player.score,

//             totalTime:
//                 player.totalTime,

//             winner:
//                 game.winner
//         };
//     }

//     else {

//         // penalty
//         player.totalTime += 2;

//         return {

//             correct: false,

//             progress:
//                 player.progress,

//             score:
//                 player.score,

//             totalTime:
//                 player.totalTime
//         };
//     }
// }

// function getPlayerQuestion(
//     gameId,
//     playerId
// ) {

//     const game = getGame(gameId);

//     if (!game) {
//         return null;
//     }

//     const progress =
//         game.players[playerId].progress;

//     const question =
//         game.questions[progress];

//     if (!question) {
//         return null;
//     }

//     return {
//         text: question.text
//     };
// }

// function sanitizeGame(game) {

//     return {

//         id: game.id,

//         players: game.players,

//         winner: game.winner,

//         status: game.status
//     };
// }

// module.exports = {

//     createGame,

//     submitAnswer,

//     getPlayerQuestion
// };
const games =
    require("./game.store");

function generateQuestion() {

    const a =
        Math.floor(
            Math.random() * 20
        ) + 1;

    const b =
        Math.floor(
            Math.random() * 20
        ) + 1;

    const ops =
        ["+", "-", "*"];

    const op =
        ops[
            Math.floor(
                Math.random() *
                ops.length
            )
        ];

    let answer;

    if (op === "+") {
        answer = a + b;
    }

    else if (op === "-") {
        answer = a - b;
    }

    else {
        answer = a * b;
    }

    return {

        text:
            `${a} ${op} ${b}`,

        answer
    };
}

function generateQuestions(count) {

    const questions = [];

    for (
        let i = 0;
        i < count;
        i++
    ) {

        questions.push(
            generateQuestion()
        );
    }

    return questions;
}

function createGame(
    roomId,
    player1Id,
    player2Id
) {

    const game = {

        id: roomId,

        questions:
            generateQuestions(20),

        players: {

            [player1Id]: {

                currentQuestionIndex: 0,

                totalTime: 0
            },

            [player2Id]: {

                currentQuestionIndex: 0,

                totalTime: 0
            }
        },

        winner: null
    };

    games.set(roomId, game);

    return game;
}

function getCurrentQuestion(
    game,
    playerId
) {

    const index =
        game.players[playerId]
            .currentQuestionIndex;

    return game.questions[index];
}

function submitAnswer(
    roomId,
    playerId,
    userAnswer
) {

    const game =
        games.get(roomId);

    if (!game) {

        return {
            error:
                "Game not found"
        };
    }

    if (game.winner) {

        return {
            error:
                "Game finished"
        };
    }

    const player =
        game.players[playerId];

    const question =
        getCurrentQuestion(
            game,
            playerId
        );

    if (
        Number(userAnswer) ===
        question.answer
    ) {

        player.currentQuestionIndex++;

        // win condition
        if (
            player.currentQuestionIndex
            >= 10
        ) {

            game.winner =
                playerId;
        }

        return {

            correct: true,

            nextQuestion:
                getCurrentQuestion(
                    game,
                    playerId
                )?.text,

            progress:
                player.currentQuestionIndex,

            winner:
                game.winner
        };
    }

    return {

        correct: false,

        progress:
            player.currentQuestionIndex
    };
}

module.exports = {

    createGame,

    submitAnswer,

    getCurrentQuestion
};