const http = require("http");

const app = require("./app");

const setupSocket =
    require("./config/socket");

const server =
    http.createServer(app);

setupSocket(server);

const PORT = 3000;

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});