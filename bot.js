const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const fetchLiveSeries = require('./modules/fetchLiveSeries');

const sendMainMenu = (chatId) => {
    bot.sendMessage(chatId, 'Main Menu', {
        reply_markup: {
            keyboard: [
                [{ text: '1. Live Series' }],
                [{ text: '2. Get Stats' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
};

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText === "/start") {
        sendMainMenu(chatId);
    } else if (messageText === '1. Live Series') {
        bot.sendMessage(chatId, 'Fetching Live Series...');

        fetchLiveSeries()
            .then(liveSeries => {
                const seriesOptions = liveSeries.map((item, index) => ({
                    text: `${item.name}`,
                    callback_data: `series_${item.ID}`
                }));

                bot.sendMessage(chatId, 'Select a live series:', {
                    reply_markup: {
                        inline_keyboard: seriesOptions.map(option => [option])
                    }
                });
                bot.sendMessage(chatId, 'Choose an option or go back:', {
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Back to Main Menu' }]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching live series:', error);
                bot.sendMessage(chatId, 'Error fetching live series. Please try again later.');
            });
    } else if (messageText === 'Back to Main Menu') {
        sendMainMenu(chatId);
    } else if (messageText.startsWith('Option')) {
        bot.sendMessage(chatId, `You selected ${messageText}`);
    } else {
        bot.sendMessage(chatId, 'Please choose an option from the menu.');
    }

    console.log(messageText);
});

bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;

    if (data.startsWith('series_')) {
        const seriesId = data.split('_')[1];
        console.log(`User selected series with ID: ${seriesId}`);

        bot.sendMessage(message.chat.id, `You selected series with ID: ${seriesId}`);
    }

    bot.answerCallbackQuery(callbackQuery.id);
});
