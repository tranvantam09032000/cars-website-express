require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRouters = require("./routes/chatRouters");
const morgan = require("morgan");
const logger = require("./logger/logger");
const errorHandler = require("./middlewares/errorHandler");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

connectDB();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
    console.log("🟢 Client connected");

    socket.on("chatMessage", (msg) => {
        console.log("📩 Received message: ", msg);
        io.emit("chatMessage", msg);
    });

    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected");
    });
});

app.use(cors());
app.use(bodyParser.json());

const morganFormat = ":method :url :status :response-time ms";
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const logObject = {
                    method: message.split(" ")[0],
                    url: message.split(" ")[1],
                    status: message.split(" ")[2],
                    responseTime: message.split(" ")[3],
                };
                logger.info(JSON.stringify(logObject));
            },
        },
    })
);

app.use(errorHandler);

app.use("/api/users", userRoutes);
app.use("/chat", chatRouters);
app.use("/api", authRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
