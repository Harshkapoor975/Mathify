const games =
    require("./game.store");

const GAME_STATES = {
    WAITING: "Waiting",
    PLAYING: "Playing",
    PAUSED: "Paused",
    COMPLETED: "Completed",
    ABORTED: "Aborted"
};

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

        state: GAME_STATES.PLAYING ,

        playerIds: [player1Id, player2Id] ,

        disconnectedPlayerId: null,

        pausedAt: null,

        abortedBy: null,

        persisted: false,

        startedAt: Date.now(),

        endedAt: null,

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

    if (game.state === GAME_STATES.PAUSED) {

        return {
            error:
                "Game paused"
        };
    }

    if (game.state === GAME_STATES.ABORTED) {

        return {
            error:
                "Game aborted"
        };
    }

    if (game.state !== GAME_STATES.PLAYING) {

        return {
            error:
                "Game is not accepting answers"
        };
    }

    const player =
        game.players[playerId];

    if (!player) {

        return {
            error:
                "Player not in game"
        };
    }

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

            game.state =
                GAME_STATES.COMPLETED;

            game.endedAt =
                Date.now();
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

function pauseGame(
    roomId,
    playerId
) {

    const game =
        games.get(roomId);

    if (
        !game ||
        game.state !== GAME_STATES.PLAYING
    ) {
        return game;
    }

    game.state =
        GAME_STATES.PAUSED;

    game.disconnectedPlayerId =
        playerId;

    game.pausedAt =
        Date.now();

    return game;
}

function resumeGame(
    roomId,
    playerId
) {

    const game =
        games.get(roomId);

    if (
        !game ||
        game.state !== GAME_STATES.PAUSED
    ) {
        return game;
    }

    if (
        game.disconnectedPlayerId &&
        game.disconnectedPlayerId !== playerId
    ) {
        return game;
    }

    game.state =
        GAME_STATES.PLAYING;

    game.disconnectedPlayerId =
        null;

    game.pausedAt =
        null;

    return game;
}

function abortGame(
    roomId,
    abortedBy
) {

    const game =
        games.get(roomId);

    if (
        !game ||
        game.state === GAME_STATES.COMPLETED ||
        game.state === GAME_STATES.ABORTED
    ) {
        return game;
    }

    game.state =
        GAME_STATES.ABORTED;

    game.abortedBy =
        abortedBy;

    game.endedAt =
        Date.now();

    return game;
}

module.exports = {

    GAME_STATES,

    createGame,

    submitAnswer,

    getCurrentQuestion,

    pauseGame,

    resumeGame,

    abortGame
};
