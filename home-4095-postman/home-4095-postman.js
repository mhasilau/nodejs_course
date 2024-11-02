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
            if (fileData) {
                const allData = fileData.trim().split('\n').map(line => JSON.parse(line));
                res.json(allData);
            } else {
                res.json([]);
            }

        });
    });
});

// webServer.post('/request', async (req, res) => {
//     const {method, url, params, body, headers} = req.body;
//     let resBody;
//     let clonedResponse;
//     let resHeaders = {};
//
//     try {
//         let query = '';
//         if (Object.values(params).length) {
//             query = objectToQueryString(params);
//         }
//
//         const response = await fetch(url + query, {
//             method: method,
//             headers: headers,
//             body: method === 'POST' || method === 'PUT' ? JSON.stringify(body) : undefined,
//             redirect: 'manual'
//         });
//
//         clonedResponse = response.clone();
//         console.log(clonedResponse)
//
//         clonedResponse.headers.forEach((value, key) => {
//             resHeaders[key] = value;
//         });
//
//
//             try {
//                 const arrayBuffer = await response.arrayBuffer();
//                 const buffer = Buffer.from(arrayBuffer);
//                 resBody = buffer.toString('base64');
//             } catch (jsonError) {
//                 resBody = await clonedResponse.text();
//             }
//         console.log(
//             {
//                 info: {
//                     status: clonedResponse.status,
//                     message: clonedResponse.statusText,
//                 },
//                 headers: resHeaders,
//                 body: resBody
//             }
//         )
//         res.send({
//             info: {
//                 status: clonedResponse.status,
//                 message: clonedResponse.statusText,
//             },
//             headers: resHeaders,
//             body: resBody
//         });
//
//     } catch (e) {
//         console.log(e);
//         return res.status(500).json({ error: 'Failed to fetch data', details: e.message });
//     }
// });


webServer.post('/request', async (req, res) => {
    const {method, url, params, body, headers} = req.body;
    let resBody;
    let resHeaders = {};

    try {
        let query = '';
        if (Object.values(params).length) {
            query = objectToQueryString(params);
        }

        const response = await fetch(url + query, {
            method: method,
            headers: headers,
            body: method === 'POST' || method === 'PUT' ? JSON.stringify(body) : undefined,
            redirect: 'manual'
        });

        // Преобразуем заголовки в обычный объект
        response.headers.forEach((value, key) => {
            resHeaders[key] = value;
        });

        // Проверяем тип контента
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('text/css')) {
            // Для CSS-файлов возвращаем как текст
            resBody = await response.text();
        } else {
            // Для других типов пробуем получить как arrayBuffer и конвертировать в base64
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            resBody = buffer.toString('base64');
        }

        console.log({
            info: {
                status: response.status,
                message: response.statusText,
            },
            headers: resHeaders,
            body: resBody.substring(0, 100) + '...' // Логируем только первые 100 символов
        });

        res.send({
            info: {
                status: response.status,
                message: response.statusText,
            },
            headers: resHeaders,
            body: resBody
        });

    } catch (e) {
        console.error('Ошибка fetch:', e);
        return res.status(500).json({ error: 'Не удалось получить данные', details: e.message });
    }
});


webServer.delete('/delete-request/:id', (req, res) => {
    const id = req.params.id;
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