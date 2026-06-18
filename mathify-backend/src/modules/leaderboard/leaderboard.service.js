const redis = require("../../config/redis");

async function getTopPlayers(limit = 10) {
    const raw = await redis.zrevrange("leaderboard", 0, limit - 1, "WITHSCORES");

    const players = [];
    for (let i = 0; i < raw.length; i += 2) {
        players.push({
            rank: i / 2 + 1,
            username: raw[i],
            rating: Number(raw[i + 1])
        });
    }

    return players;
}

async function getPlayerRank(username) {
    const rank = await redis.zrevrank("leaderboard", username);
    const score = await redis.zscore("leaderboard", username);

    if (rank === null) return null;

    return {
        username,
        rank: rank + 1,      // 0-indexed so add 1
        rating: Number(score)
    };
}

module.exports = { getTopPlayers, getPlayerRank };