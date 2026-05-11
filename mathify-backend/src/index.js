const express = require('express');

const {
    createGame,
    submitAnswer
} = require('./modules/game/game.engine');

const app = express();

app.use(express.json());

app.post('/start-game', (req, res) => {

    const gameId =
        Math.random().toString(36).substring(7);

    const game = createGame(gameId);

    res.json({
        gameId,

        p1Question:
            game.currentQuestions.p1.text,

        p2Question:
            game.currentQuestions.p2.text
    });
});

app.post('/submit-answer', (req, res) => {

    const {
        gameId,
        playerId,
        answer
    } = req.body;

    const result =
        submitAnswer(gameId, playerId, answer);

    res.json(result);
});

app.listen(3000, () => {
    console.log("Server running on 3000");
});