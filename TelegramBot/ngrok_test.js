require("dotenv").config();
const {BOT_TOKEN, NGROK_TOKEN, SERVER_URL} = process.env;
//const BOT_TOKEN = process.env.BOT_TOKEN;

// Require ngrok javascript sdk
const ngrok = require("@ngrok/ngrok");
// import ngrok from '@ngrok/ngrok' // if inside a module

(async function() {
  // Establish connectivity
  const listener = await ngrok.forward({ addr: 8080, authtoken: NGROK_TOKEN });

  // Output ngrok url to consolecd
  console.log(`Ingress established at: ${listener.url()}`);
})();

function custom() {
    console.log(String(NGROK_TOKEN));
}
