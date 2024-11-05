const express = require('express');

const webServer = express()
const port = 7480;

webServer.use(express.urlencoded({ extended: true }));


function createForm(name = '') {
    return `
    <div>
        <form action="/" method="post">
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

const button = `
    <button>
    <a href="/">Назад</a>
</button>
    `

const errorMessageShortName = '    <div>\n' +
    '        <span style="color: red">Тебя не могу звать одной буквой...</span>\n' +
    '    </div>';
const errorMessageEmptyName = '    <div>\n' +
    '        <span style="color: red">Похоже ты забыл представиться...</span>\n' +
    '    </div>';

webServer.get('/', (req, res) => {
    res.send(createForm());
});
webServer.post('/', (req, res) => {
    const userName = req.body.name ? req.body.name.toString().trim() : '';
    let message;
    const mood = req.body.mood;

    if (!userName.length) {
        return res.send(createForm(userName) + errorMessageEmptyName);
    }

    if (userName.length < 2) {
        return res.send(createForm(userName) + errorMessageShortName);
    }

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
        default:
            message = 'Не могу определить твое настроение';
    }

    console.log(`Привет ${userName}. ${message}`);
    res.redirect(`/hello?user=${encodeURIComponent(userName)}&message=${encodeURIComponent(message)}`);
});

webServer.get('/hello', (req, res) => {
    const user = req.query.user;
    const message = req.query.message;
    if (user && message) {
        res.send(`Привет ${decodeURIComponent(user)}. ${decodeURIComponent(message)}` + button);
    } else {
        res.redirect('/');
    }
});

webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});