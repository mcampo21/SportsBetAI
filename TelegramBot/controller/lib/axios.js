require("dotenv").config({path: './TelegramBot/.env'});

const axios = require("axios");
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

function getAxiosInstance() {
    return {
        get(method, params) {
            return axios.get(`/${method}`, {
                baseURL: TELEGRAM_API,  
                params,
            });
        },
        post(method, data) {
            return axios({
                method: "post",
                baseURL: TELEGRAM_API,
                url: `/${method}`,
                data,
            });
        },
    };
}

module.exports = { axiosInstance : getAxiosInstance() };