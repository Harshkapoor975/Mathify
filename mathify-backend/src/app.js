const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const { ApiError } = require('./utils/ApiError');
const cors = require('cors');

const {
    createGame,
    submitAnswer
} = require('./modules/game/game.engine');

const app = express();

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins in development
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// app.get('/', (req, res) => {
//     res.json({ message: 'Backend is running!' });
// });

// app.post('/start-game', (req, res) => {
//     const gameId = Math.random().toString(36).substring(7);
//     const game = createGame(gameId);

//     res.json({
//         gameId,
//         p1Question: game.currentQuestions.p1.text,
//         p2Question: game.currentQuestions.p2.text
//     });
// });

// app.post('/submit-answer', (req, res) => {
//     const {
//         gameId,
//         playerId,
//         answer
//     } = req.body;

//     const result = submitAnswer(gameId, playerId, answer);
//     res.json(result);
// });

module.exports = app;
