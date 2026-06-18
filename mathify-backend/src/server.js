const http = require("http");

const app = require("./app");
require("dotenv").config();

const setupSocket =
    require("./config/socket");

const connectDB = require("./config/db");

const User = require("./models/user.model");
const redis = require("./config/redis") ;

const server =
    http.createServer(app);

// setupSocket(server);
const io = setupSocket(server);

app.locals.io = io;

// const PORT = 3000;
const PORT = process.env.PORT || 3000;

async function seedLeaderboard() {
    const users = await User.find().select("username rating");
    console.log("Users found for seed:", users.length);

    if (users.length === 0) return;

    // build args for single zadd call: [score, member, score, member...]
    const args = users.flatMap(u => [u.rating, u.username]);
    await redis.zadd("leaderboard", ...args);

    console.log(`Leaderboard seeded with ${users.length} users`);
}
connectDB().then(async () => {
    await seedLeaderboard();
    server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});
})