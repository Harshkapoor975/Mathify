const games =
    require("./game.store");

const GAME_STATES = {
    WAITING: "Waiting",
    PLAYING: "Playing",
    PAUSED: "Paused",
    COMPLETED: "Completed",
    ABORTED: "Aborted"
};

const GAME_TYPES = {
    BLITZ : "Blitz" ,
    Survival : "Survival" ,
    FlashAnzan : "FlashAnzan" ,
    Classic : "Classic" 
}

let matchesCreated = 0 ;
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

    if(games.has(roomId)){
        return games.get(roomId) ;
    }
    games.set(roomId, game);

    matchesCreated++ ;

    return game;
}

function createSurvivalGame(roomId, player1Id, player2Id) {
    if (games.has(roomId)) {
        return games.get(roomId);
    }

    const question = generateQuestion();

    const game = {
        id: roomId,
        type: GAME_TYPES.Survival,
        state: GAME_STATES.PLAYING,
        playerIds: [player1Id, player2Id],

        currentQuestion: question,

        players: {
            [player1Id]: { score: 0 },
            [player2Id]: { score: 0 }
        },

        lastScorer: null,
        questionLocked: false,

        startedAt: Date.now(),
        endsAt: Date.now() + 60_000,
        endedAt: null,
        winner: null,
        persisted: false,
        disconnectedPlayerId: null,
        pausedAt: null,
        abortedBy: null
    };

    games.set(roomId, game);
    matchesCreated++;
    return game;
}

// we will create new create game function which will take gameType as parameter and will be easier to debug
function createGameWithType(roomId,player1Id,player2Id,gameType){
    if(gameType === GAME_TYPES.BLITZ){
        return createGame(roomId,player1Id,player2Id) ;
    }
    else if(gameType === GAME_TYPES.Survival){
        return createSurvivalGame(roomId,player1Id,player2Id) ;
    }
    else if(gameType === GAME_TYPES.FlashAnzan){
        return createFlashAnzanGame(roomId,player1Id,player2Id) ;
    }
    else if(gameType === GAME_TYPES.Classic){
        return createClassicGame(roomId,player1Id,player2Id) ;
    }
    else{
        return createGame(roomId,player1Id,player2Id) ;
    }
}



// function getCurrentQuestion(
//     game,
//     playerId
// ) {

//     const index =
//         game.players[playerId]
//             .currentQuestionIndex;

//     return game.questions[index];
// }
function getCurrentQuestion(game, playerId) {
    // survival games store currentQuestion on the game itself, not per-player
    if (game.type === GAME_TYPES.Survival) {
        return game.currentQuestion;
    }

    const index = game.players[playerId]?.currentQuestionIndex;
    if (index === undefined) return null;

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

            setTimeout(() => {
                    games.delete(roomId);
                }, 60000);

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

function submitSurvivalAnswer(roomId, playerId, userAnswer) {
    const game = games.get(roomId);

    if (!game) return { error: "Game not found" };
    if (game.state === GAME_STATES.PAUSED) return { error: "Game paused" };
    if (game.state === GAME_STATES.ABORTED) return { error: "Game aborted" };
    if (game.state !== GAME_STATES.PLAYING) return { error: "Game not active" };

    const player = game.players[playerId];
    if (!player) return { error: "Player not in game" };

    // wrong answer — try again, nothing changes
    if (Number(userAnswer) !== game.currentQuestion.answer) {
        return { correct: false };
    }

    // question is already being processed by the other player
    if (game.questionLocked) {
        return { correct: false };
    }

    // lock so simultaneous answer from other player doesn't also score
    game.questionLocked = true;

    player.score++;
    game.lastScorer = playerId;
    game.currentQuestion = generateQuestion();
    game.questionLocked = false;

    return {
        correct: true,
        scorerId: playerId,
        scores: Object.fromEntries(
            game.playerIds.map(id => [id, game.players[id].score])
        ),
        nextQuestion: game.currentQuestion.text
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

function endSurvivalGame(roomId) {
    const game = games.get(roomId);

    if (!game || game.state !== GAME_STATES.PLAYING) return null;

    const [p1, p2] = game.playerIds;
    const score1 = game.players[p1].score;
    const score2 = game.players[p2].score;

    game.winner = score1 > score2
        ? p1
        : score2 > score1
        ? p2
        : game.lastScorer;   // tiebreak

    game.state = GAME_STATES.COMPLETED;
    game.endedAt = Date.now();

    return game;
}


function getMatchesCreated() {
    return matchesCreated;
}
module.exports = {

    GAME_STATES,

    GAME_TYPES ,

    createGame,

    createGameWithType ,

    submitAnswer,

    getCurrentQuestion,

    submitSurvivalAnswer,
    
    endSurvivalGame,

    createSurvivalGame,

    pauseGame,

    resumeGame,

    abortGame ,

    getMatchesCreated
     
};
