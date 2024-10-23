// Получение нужных элементов
// Блоки
const savedMethodsDiv = document.querySelector('.saved-methods')
const reqBodyDiv = document.querySelector('.req-body')
const reqParamsDiv = document.querySelector('.req-params')
const reqHeadersDiv = document.querySelector('.req-headers')

const paramsDiv = document.querySelector('.params')
const headersDiv = document.querySelector('.headers')




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


function collectAndSubmitData() {
    
    const requestData = {
        method: httpMethodSelect.value,
        url: httpUrl.value,
        body: httpBody.value,
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
        console.log(row);
        
        const select = row.querySelector('select');
        const input = row.querySelector('input');

        if (select.value && input.value) {
            const headerKey = select.value
            const headerValue = input.value
            headersReq[headerKey] = headerValue
        }
    });
    requestData.headers = headersReq
    saveOptions(requestData)
}

submitBtn.onclick = collectAndSubmitData

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

function saveOptions(data) {
    fetch('/save-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Set the correct content type
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(res => console.log(res))
}