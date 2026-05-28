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

    // Add this field inside createGame(), alongside winner: null

    const game = {

        id: roomId,

        playerIds: [player1Id, player2Id] ,

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