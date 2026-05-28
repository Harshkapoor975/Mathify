const http = require("http");

const app = require("./app");
require("dotenv").config();

const setupSocket =
    require("./config/socket");

const connectDB = require("./config/db");

const server =
    http.createServer(app);

setupSocket(server);

const PORT = 3000;

connectDB().then(()=>{
    server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});
})