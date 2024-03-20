require("dotenv").config();

const express = require("express");
const axios = require("axios");
const ngrok = require("@ngrok/ngrok");

const { handler } = require("./controller");

const PORT = process.env.PORT || 8080;
const {BOT_TOKEN, NGROK_TOKEN, SERVER_URL} = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;

const app = express();
app.use(express.json());


const setupWebhook = async() => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${SERVER_URL}`);
    console.log(res.data);
}


app.post("*", async (req, res) => {
    console.log(req.body);
    res.status(200).send(await handler(req));
});

app.get("*", async (req, res) => {
    res.status(200).send("server is live")
}); 

app.listen(PORT, async () => {
    console.log("Server listening on PORT", PORT);
    await setupWebhook();
});
