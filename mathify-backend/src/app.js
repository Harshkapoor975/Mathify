const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const cors = require('cors');

const {
    createGame,
    submitAnswer
} = require('./modules/game/game.engine');

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

module.exports = app;
