const { axiosInstance } = require("./axios");
const { getPrediction } = require("./predict");

function sendMessage(messageObj, messageText) {
    return axiosInstance.get("sendMessage", {
        chat_id: messageObj.chat.id,
        text: messageText,
    })
}

let conversationState = {};
let statTypes = new Set(['points', 'assits', 'rebounds', 'steals', 'blocks', 'all']);

function handleMessage(messageObj) {
    const messageText = messageObj.text.toLowerCase() || "";
    const userId = messageObj.from.id;

    if (conversationState[userId]) { // User currently in coversation

        switch (conversationState[userId].state) {
            case 'playerInput':
                conversationState[userId].name = messageText;
                conversationState[userId].state = 'statInput';
                return sendMessage(
                    messageObj,
                    "What type of stat?"
                );
                break;

            case 'statInput':
                const inlineKeyboard = {
                    inline_keyboard: [
                        [
                            { text: 'Points', callback_data: 'button1'},
                            { text: 'Assists', callback_data: 'button2'},
                            { text: 'Rebounds', callback_data: 'button3'},
                            { text: 'Steals', callback_data: 'button4'},
                            { text: 'Blocks', callback_data: 'button5'},
                            { text: 'All', callback_data: 'button6'}
                        ]
                    ]
                };

                if (!statTypes.has(messageText)) {
                    sendMessage(messageObj,
                        "Sorry, please select from the following stat types:\
                        \nPoints, Assits, Rebounds, Steals, Blocks, All")
                } else {
                    conversationState[userId].stat = messageText;
                    // call python script
                    getPrediction(conversationState[userId].name, conversationState[userId].stat, (result) => {
                        sendMessage(messageObj, result);
                        sendMessage(messageObj, "Would you like to predict another player?");
                    });
                    conversationState[userId].state = 'repeat';
                }
                break;

            case 'repeat':
                if (messageText === "yes" || messageText === 'y'){
                    conversationState[userId].state = 'playerInput';
                    return sendMessage(
                        messageObj,
                        "What player would you like to predict?"
                    );
                } else {
                    delete conversationState[userId];
                    console.log(conversationState)
                    return sendMessage(
                        messageObj,
                        "Good luck!"
                    );
                }
                break;

            default:
                // End conversation
                delete conversationState[userId];
                break;
        }
    } else if (messageText.charAt(0) === '/') { // Bot commands
        const command = messageText.substr(1);
        switch (command) {
            case "start": 
                conversationState[userId] = {state: 'playerInput', name: "", stat: ""}
                return sendMessage(
                    messageObj,
                    "What player would you like to predict?"
                );
            case "help":
                return sendMessage(
                    messageObj,
                    "Hi, I'm the NBA Prop Bot!\nHere to predict player stats for prop bets. Let's get started.\
                    \n\nTo begin, send a '/start' message where you will be prompted to enter the name of your desired player.\
                    \nNext, send the stat type that you want. A list of options is provided at the bottom.\
                    \nAnd thats it! If you want to get another prediction immediately after, send 'yes' or send 'no' to quit.\n\
                    \nStat Types: Points, Assits, Rebounds, Steals, Blocks, All"
                )
            default:
                return sendMessage(
                    messageObj,
                    "I don't know that command. Why don't you try again."
                );
        }
    } else {
        return sendMessage(messageObj, messageText);
    }
}

module.exports = { handleMessage };