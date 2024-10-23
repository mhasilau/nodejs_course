const express = require('express');
const path = require('path');

const webServer = express();
webServer.use(express.json());

webServer.use(express.static(path.join(__dirname, 'site')));

const mainPage = path.join(__dirname, 'site/index.html');


const port = 7480;

webServer.get('/', (req, res) => {
    console.log(mainPage)
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.resolve(mainPage));
});

webServer.post('/save-request', async (req, res) => {
    const {method, url, headers} = req.body
    let resBody
    let resHeaders = {};

    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
        });

        response.headers.forEach((value, key) => {
            resHeaders[key] = value;
        });
        resBody = await response.json();
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: 'Failed to fetch data', details: e.message });
    }

    res.send({
        resBody,
        resHeaders
    })
})

webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});