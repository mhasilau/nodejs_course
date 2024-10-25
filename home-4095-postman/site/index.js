// Получение нужных элементов
// Блоки
const savedMethodsDiv = document.querySelector('.saved-methods')
const reqBodyDiv = document.querySelector('.req-body')
const reqParamsDiv = document.querySelector('.req-params')
const reqHeadersDiv = document.querySelector('.req-headers')

const paramsDiv = document.querySelector('.params')
const headersDiv = document.querySelector('.headers')
const responseDiv = document.querySelector('.response')




// Кнопки и элементы
const httpMethodSelect = document.getElementById('http-method');
const httpUrl = document.getElementById('req-url');
const httpBody = document.getElementById('req-body');

const addHeaderButton = document.querySelector('#add-header');
const addParamButton = document.querySelector('#add-param');

const saveBtn = document.querySelector('#save');
const submitBtn = document.querySelector('#submit');
const cleanBtn = document.querySelector('#clean');



hideParams()



let methodSelect;
httpMethodSelect.onchange = () => {
    methodSelect = httpMethodSelect.value;

    if (methodSelect) {
        showParams()
    }

    switch (methodSelect) {
        case 'GET':
            reqBodyDiv.style.display = 'none'
            break;

        case 'POST':
            reqBodyDiv.style.display = 'block'
            break;

        case 'PUT':
            
            break;

        case 'DELETE':
            
            break;
    
        default:
            break;
    }


}


function hideParams() {
    reqBodyDiv.style.display = 'none'
    reqParamsDiv.style.display = 'none'
    reqHeadersDiv.style.display = 'none'
}

function showParams() {
    reqBodyDiv.style.display = 'block'
    reqParamsDiv.style.display = 'block'
    reqHeadersDiv.style.display = 'block'
}


addParamButton.onclick = () => {
    const newRow = addNewParams();
    paramsDiv.appendChild(newRow);
}

function addNewParams() {
    const row = document.createElement('div');
    row.className = 'param w-100';
    row.innerHTML = `
      <input type="text" class="w-40" placeholder="limit">
      <input type="text" class="w-40" placeholder="100">
                <button id="del-param" class="request-btn delete-btn">Удалить</button>
    `;
    
    const deleteButton = row.querySelector('#del-param');
    deleteButton.addEventListener('click', () => row.remove());
  
    return row;
}

addHeaderButton.onclick = () => {
    const newRow = addNewHeaders();
    headersDiv.appendChild(newRow);
}

function addNewHeaders() {
    const row = document.createElement('div');
    row.className = 'header w-100';
    row.innerHTML = `
                <select id="http-header" class="w-40">
                    <option value="" disabled selected>Выберите заголовок</option>
                    <option value="Accept">Accept</option>
                    <option value="Content-Type">Content-Type</option>
                </select>
                <input type="text" class="w-40">
                <button id="del-header" class="request-btn delete-btn">Удалить</button>
    `;
    
    const deleteButton = row.querySelector('#del-header');
    deleteButton.addEventListener('click', () => row.remove());
  
    return row;
}


function collectAndSubmitData(todo) {
    let body = httpBody.value ? JSON.parse(httpBody.value) : '{}'

    if (httpBody.value) {
        console.log('val')
    } else {
        console.log('none')
    }

    const requestData = {
        method: httpMethodSelect.value,
        url: httpUrl.value,
        body: body,
        params: {},
        headers: {}
    };


    const paramsReq = {}
    // Collect params
    const paramRows = paramsDiv.querySelectorAll('.param');
    paramRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs[0].value && inputs[1].value) {
            const paramKey = inputs[0].value
            const paramValue = inputs[1].value
            paramsReq[paramKey] = paramValue
        }
    });
    requestData.params = paramsReq;

    const headersReq = {}
    // Collect headers
    const headerRows = headersDiv.querySelectorAll('.header');
    headerRows.forEach(row => {

        const select = row.querySelector('select');
        const input = row.querySelector('input');

        if (select.value && input.value) {
            const headerKey = select.value
            const headerValue = input.value
            headersReq[headerKey] = headerValue
        }
    });
    requestData.headers = headersReq
    requestData.id = new Date().getTime()

    switch (todo) {
        case 'POST':
            console.log('post')
            sendRequest(requestData)
            break;
        case 'SAVE':
            saveRequest(requestData)
            break;
    }

}

submitBtn.onclick = () => collectAndSubmitData('POST')
saveBtn.onclick = () => collectAndSubmitData('SAVE')
cleanBtn.onclick = clearForm;

function clearForm() {
  httpMethodSelect.selectedIndex = 0;
  httpUrl.value = '';
  httpBody.value = '';
  paramsDiv.innerHTML = '';
  headersDiv.innerHTML = '';

  hideParams();

  reqBodyDiv.style.display = 'none';
}

function sendRequest(data) {
    responseDiv.innerHTML = ''

    fetch('/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Set the correct content type
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(res => {
        renderResponseData(res)
    }).catch(error => console.error('Ошибка:', error));
}

function renderResponseData(data) {
    responseDiv.innerHTML = ''
    const h2 = document.createElement('h2');
    h2.innerHTML = `Ответ на запрос`;
    responseDiv.appendChild(h2);

    const status = document.createElement('h5');
    status.innerHTML = `Статус ответа ${data.resStatus}`;
    responseDiv.appendChild(status);

    const headers = document.createElement('div');
    headers.classList.add('res-headers')

    const ul = document.createElement('ul');
    for (let header in data.resHeaders) {
        console.log(header)
        const li = document.createElement('li');
        li.innerText = header +" : "+ data.resHeaders[header]
        ul.appendChild(li)
    }
    headers.appendChild(ul);
    responseDiv.appendChild(status);

    const bodyDiv = document.createElement('div');
    bodyDiv.classList.add('res-body')

    const body_h5 = document.createElement('h5');
    body_h5.innerHTML = 'Тело ответа:';


    bodyDiv.appendChild(body_h5);

    const text = document.createElement('textarea');
    text.innerText = JSON.stringify(data.resBody)
    text.classList.add('w-100')
    bodyDiv.appendChild(text);

    responseDiv.appendChild(headers);
    responseDiv.appendChild(bodyDiv);
}

function renderSavedRequests(reqs) {
    savedMethodsDiv.innerHTML = '';
    console.log('render', reqs)
    reqs.forEach(req => {
        const method = document.createElement('div')
        method.classList.add('method')
        method.classList.add(req.method.toLowerCase())

        const h5 = document.createElement('h5');
        h5.innerHTML = `Метод: <span>${req.method}</span>`;
        method.appendChild(h5);

        const p = document.createElement('p');
        p.textContent = req.url;
        method.appendChild(p);

        const del = document.createElement('button');
        del.className = 'delete-save-method';
        del.textContent = 'x';
        del.onclick = () => {
            deleteSavedRequest(req.id)
        }
        method.appendChild(del);

        const post = document.createElement('button');
        post.className = 'save-submit';
        post.textContent = 'Отправить запрос';
        post.onclick = () => {
            sendRequest(req)
        }
        method.appendChild(post);

        savedMethodsDiv.appendChild(method);
    })
}

function saveRequest(data) {
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Set the correct content type
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(res => renderSavedRequests(res))
}

function deleteSavedRequest(id) {
    console.log(id)

    fetch(`/delete-request/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'  // Set the correct content type
        },
    }).then(res => res.json()).then(res => renderSavedRequests(res))
}

function getSavedRequest() {
    fetch('/get-saved-requests', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'  // Set the correct content type
        },
    }).then(res => res.json()).then(res => renderSavedRequests(res))
}
getSavedRequest()