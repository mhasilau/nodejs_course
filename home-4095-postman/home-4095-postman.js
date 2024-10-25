const express = require('express');
const path = require('path');
const fs = require("fs");
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const webServer = express();
webServer.use(express.json());
webServer.use(cors());

webServer.use(express.static(path.join(__dirname, 'site')));

const mainPage = path.join(__dirname, 'site/index.html');

const port = 7480;
const savedFilePath = path.join(__dirname, 'saved-requests');

function saveFile(data, callback) {
    // Convert data to string format
    const dataString = JSON.stringify(data) + '\n';

    // Append data to the file, creating it if it doesn't exist
    fs.appendFile(savedFilePath, dataString, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return callback(err);
        }
        console.log('Data has been added to file!');

        // Read the updated file and return its contents
        fs.readFile(savedFilePath, 'utf8', (err, fileData) => {
            if (err) {
                console.error('Error reading file:', err);
                return callback(err);
            }
            // Split file content by lines and parse each line as JSON
            const allData = fileData.trim().split('\n').map(line => JSON.parse(line));
            callback(null, allData);
        });
    });
}

function objectToQueryString(obj) {
    let queryString = "?";
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (queryString !== "") {
                queryString += "&";
            }
            queryString += encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
        }
    }
    return queryString;
}

function deleteFileObject(id, callback) {
    console.log('id', id)
    fs.readFile(savedFilePath, 'utf8', (err, fileData) => {
        if (err) {
            console.error('Error reading file:', err);
            return callback(err);
        }

        let allData;
        try {
            allData = fileData.trim().split('\n').map(line => JSON.parse(line));
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            return callback(parseErr);
        }
        // Filter out the object with the specified ID
        allData = allData.filter(obj => Number(obj.id) !== Number(id));
        allData = []
        // Write the updated data back to the file
        const updatedDataString = allData.map(obj => JSON.stringify(obj)).join('\n');
        fs.writeFile(savedFilePath, updatedDataString, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                return callback(err);
            }
            callback(null, allData);
        });
    });
}

webServer.get('/', (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.resolve(mainPage));
});

webServer.post('/save', (req, res) => {
    saveFile(req.body, (err, allData) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json(allData); // Return the entire content of the file as JSON
    });
});

webServer.get('/get-saved-requests', (req, res) => {
    fs.access(savedFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, return an empty array
            console.log('File does not exist, returning empty array.');
            return res.json([]);
        }

        // File exists, read its contents
        fs.readFile(savedFilePath, 'utf8', (err, fileData) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Failed to read saved requests' });
            }
            console.log('aaaa',fileData)
            if (fileData) {
                const allData = fileData.trim().split('\n').map(line => JSON.parse(line));
                console.log('allData', allData)
                res.json(allData);
            } else {
                res.json([]);
            }

        });
    });
});

webServer.post('/request', async (req, res) => {
    const {method, url, params, body, headers} = req.body;
    let resStatus;
    let resMessage;
    let resBody;
    let resHeaders = {};


    if(method === 'GET') {

        let query = '';
        if (Object.values(params).length) {
            query = objectToQueryString(params);
        }
        console.log(url + query);

        try {
            const response = await fetch(url + query, {
                method: method,
                headers: headers,
            });

            // Захват статуса ответа
            resStatus = response.status;
            resMessage = response.message


            // Захват заголовков ответа
            response.headers.forEach((value, key) => {
                resHeaders[key] = value;
            });

            // Парсинг тела ответа как JSON
            resBody = await response.json();

        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: 'Failed to fetch data', details: e.message });
        }

// Отправка обратно ответа с полученным статусом, заголовками и телом
        return res.status(resStatus).send({
            resStatus,
            resMessage,
            resBody,
            resHeaders,
        });
    }

    if (method === 'POST') {
        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(body)
            });

            // Захват статуса ответа
            resStatus = response.status;
            resMessage = response.message


            // Захват заголовков ответа
            response.headers.forEach((value, key) => {
                resHeaders[key] = value;
            });

            // Парсинг тела ответа как JSON
            resBody = await response.json();

        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: 'Failed to fetch data', details: e.message });
        }

        return res.status(resStatus).send({
            resStatus,
            resMessage,
            resBody,
            resHeaders,
        });
    }

    // Handling other HTTP methods like DELETE and PUT can be added here

});

webServer.delete('/delete-request/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    deleteFileObject(id, (err, updatedData) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete data' });
        }
        res.json(updatedData); // Return the updated content of the file as JSON
    });
});

webServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});