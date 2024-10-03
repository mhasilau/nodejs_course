const express = require('express');

const webServer = express()
const port = 7480;

const form ='    <div>\n' +
    '        <form action="http://localhost:7480/mood" method="get">\n' +
    '            <div>\n' +
    '                <label for="name">Представьтесь:</label>\n' +
    '                <input type="text" id="name" name="name">\n' +
    '            </div>\n' +
    '            <div>\n' +
    '                <label for="mood">Настроение:</label>\n' +
    '                <select id="mood" name="mood" required>\n' +
    '                    <option value="excellent">Отличное</option>\n' +
    '                    <option value="good">Хорошее</option>\n' +
    '                    <option value="nothing">Никакое</option>\n' +
    '                    <option value="bad">Плохое</option>\n' +
    '                    <option value="disgusting">Отвратительное</option>\n' +
    '                </select>\n' +
    '            </div>\n' +
    '            <input type="submit" value="Отправить">\n' +
    '        </form>\n' +
    '    </div>'

const errorMessageShortName = '    <div>\n' +
    '        <span style="color: red">Тебя не могу звать одной буквой...</span>\n' +
    '    </div>'
const errorMessageEmptyName = '    <div>\n' +
    '        <span style="color: red">Похоже ты забыл представиться...</span>\n' +
    '    </div>'

webServer.get('/', (req, res) => {
    res.send(form)
})

webServer.get('/mood', (req, res) => {
    const userName = req.query.name.toString()
    const mood = req.query.mood
    let message;

    switch (mood) {
        case 'excellent':
            message = 'Я рад, что у тебя все настолько здорово!';
            break;
        case 'good':
            message = 'Хорошее настроение - это хорошо'
            break;
        case 'nothing':
            message ='Штош... Не вешай нос, это, во всяком случае, не плохо'
            break;
        case 'bad':
            message ='У тебя все наладится!'
            break;
        case 'disgusting':
            message ='Я за плинтусом. Отпустит - позови.'
            break;
    }

    if (!userName.trim().length) {
        return res.send(form + errorMessageEmptyName)
    }

    if (userName.trim().length < 2) {
        return res.send(form + errorMessageShortName)
    }

    res.send(`Привет ${userName}. ${message}`)

    console.log(`Привет ${userName}. ${message}`)
})

webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
})