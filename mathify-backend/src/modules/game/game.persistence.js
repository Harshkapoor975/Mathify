const mongoose = require("mongoose");

const User = require("../../models/user.model");
const { Match } = require("../../models/match.model");
const { GAME_STATES } = require("./game.engine");
const { updateRatings } = require("../user/rating.service");

function isPersistableUserId(userId) {
    return mongoose.Types.ObjectId.isValid(userId);
}

function canPersistGame(game) {
    return (
        game &&
        !game.persisted &&
        Array.isArray(game.playerIds) &&
        game.playerIds.length === 2 &&
        game.playerIds.every(isPersistableUserId)
    );
}

function getScores(game) {
    return Object.fromEntries(
        game.playerIds.map((playerId) => [
            playerId,
            game.players[playerId]?.currentQuestionIndex ?? 0
        ])
    );
}

async function persistTerminalGame(game) {
    if (!canPersistGame(game)) {
        return null;
    }

    game.persisted = true;

    const [player1Id, player2Id] = game.playerIds;
    const scores = getScores(game);
    const duration = game.startedAt && game.endedAt
        ? Math.max(0, Math.round((game.endedAt - game.startedAt) / 1000))
        : undefined;

    if (game.state === GAME_STATES.COMPLETED && game.winner) {
        const winnerId = game.winner;
        const loserId = game.playerIds.find((playerId) => playerId !== winnerId);
        const ratingResult = await updateRatings(winnerId, loserId);

        if (!ratingResult) {
            return null;
        }

        const ratingByUser = {
            [winnerId]: {
                before: ratingResult.winnerRatingBefore,
                after: ratingResult.winnerRatingAfter
            },
            [loserId]: {
                before: ratingResult.loserRatingBefore,
                after: ratingResult.loserRatingAfter
            }
        };

        return Match.create({
            roomId: game.id,
            gameType: "math-race",
            players: game.playerIds.map((playerId) => ({
                user: playerId,
                score: scores[playerId],
                ratingBefore: ratingByUser[playerId].before,
                ratingAfter: ratingByUser[playerId].after
            })),
            winner: winnerId,
            status: "completed",
            duration
        });
    }

    if (game.state === GAME_STATES.ABORTED) {
        const users = await User.find({
            _id: {
                $in: [player1Id, player2Id]
            }
        }).select("rating");

        const ratingByUser = Object.fromEntries(
            users.map((user) => [
                user._id.toString(),
                user.rating
            ])
        );

        return Match.create({
            roomId: game.id,
            gameType: "math-race",
            players: game.playerIds.map((playerId) => ({
                user: playerId,
                score: scores[playerId],
                ratingBefore: ratingByUser[playerId] ?? 1000,
                ratingAfter: ratingByUser[playerId] ?? 1000
            })),
            status: "abandoned",
            duration
        });
    }

    game.persisted = false;
    return null;
}

module.exports = {
    persistTerminalGame,
    isPersistableUserId
};
