const express = require('express');

const webServer = express()
const port = 7480;

function createForm(name = '') {
    return `
    <div>
        <form action="/mood" method="get">
            <div>
                <label for="name">Представьтесь:</label>
                <input type="text" id="name" name="name" value="${name}">
            </div>
            <div>
                <label for="mood">Настроение:</label>
                <select id="mood" name="mood" required>
                    <option value="excellent">Отличное</option>
                    <option value="good">Хорошее</option>
                    <option value="nothing">Никакое</option>
                    <option value="bad">Плохое</option>
                    <option value="disgusting">Отвратительное</option>
                </select>
            </div>
            <input type="submit" value="Отправить">
        </form>
    </div>`;
}

const errorMessageShortName = '    <div>\n' +
    '        <span style="color: red">Тебя не могу звать одной буквой...</span>\n' +
    '    </div>';
const errorMessageEmptyName = '    <div>\n' +
    '        <span style="color: red">Похоже ты забыл представиться...</span>\n' +
    '    </div>';

webServer.get('/', (req, res) => {
    res.send(createForm());
});

webServer.get('/mood', (req, res) => {
    const userName = req.query.name ? req.query.name.toString().trim() : '';
    const mood = req.query.mood;
    let message;

    switch (mood) {
        case 'excellent':
            message = 'Я рад, что у тебя все настолько здорово!';
            break;
        case 'good':
            message = 'Хорошее настроение - это хорошо';
            break;
        case 'nothing':
            message = 'Штош... Не вешай нос, это, во всяком случае, не плохо';
            break;
        case 'bad':
            message = 'У тебя все наладится!';
            break;
        case 'disgusting':
            message = 'Я за плинтусом. Отпустит - позови.';
            break;
    }

    if (!userName.length) {
        return res.send(createForm(userName) + errorMessageEmptyName);
    }

    if (userName.length < 2) {
        return res.send(createForm(userName) + errorMessageShortName);
    }

    res.send(`Привет ${userName}. ${message}`);

    console.log(`Привет ${userName}. ${message}`);
});

webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});