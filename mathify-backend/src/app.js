const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const { ApiError } = require('./utils/ApiError');
const cors = require('cors');
const waitingPlayers = require('./modules/matchmaking/queue.store');
const games = require('./modules/game/game.store') ;
// const getMatchesCreated = require('./modules/game/game.engine').getMatchesCreated ;
const {
    GAME_STATES,
    createGame,
    submitAnswer ,
    getMatchesCreated 
} = require('./modules/game/game.engine');
const { getActiveSessionsCount } = require('./modules/user/user.session.store') ;
const leaderboardRoutes = require("./modules/leaderboard/leaderboard.routes") ;
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
app.use("/api/leaderboard",leaderboardRoutes) ;

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

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const registerGameHandlers =
    require("./modules/game/game.socket");


app.get("/metrics", (req, res) => {
    const io = req.app.locals.io;
    res.json({
        activeSockets: io.engine.clientsCount,
        waitingPlayers: waitingPlayers.length,
        activeGames: games.size,
        matchesCreated : getMatchesCreated() ,
        activeSessions: getActiveSessionsCount(),
        // roomsCreated,
        memoryMB: Math.round(
            process.memoryUsage().heapUsed /
            1024 /
            1024
        )
    });
});


module.exports = app;
