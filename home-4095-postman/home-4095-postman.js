const express = require('express');
const path = require('path');
const {json} = require("body-parser");

const webServer = express();
webServer.use(express.json());

// Обслуживание статических файлов из каталога 'public'
webServer.use(express.static(path.join(__dirname, 'site')));

const mainPage = path.join(__dirname, 'site/index.html');


const port = 7480;

webServer.get('/', (req, res) => {
    console.log(mainPage)
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.resolve(mainPage));
});

webServer.post('/save-request', async (req, res) => {
    const {method, url, body, params, headers} = req.body
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
        // console.log(resHeaders)
        // console.log(response.headers)
        resBody = await response.json();
        // console.log('Fetched Data:', data);
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: 'Failed to fetch data', details: e.message });
    }

    res.send({
        resBody,
        resHeaders
    })
    // console.log('response',data)

    // console.log(req.body)
    // let from = await fetch(url, {
    //     method: method,
    //     // body: JSON.stringify(body),
    //     headers: headers,
    // }).then(res => res.json())
    // console.log(from)
    // console.log(JSON.stringify(from))
    // res.setHeader("Content-Type", "application/json");
    // res.json(from)

})

webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});