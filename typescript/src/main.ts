const API_BASE_URL = 'https://getpocket.com/v3/'

function doGet() {
    const picked: any = pickRandomItem(fetchAllPocketItem())
    const result = {
        title: picked['given_title'],
        url: picked['given_url'],
    }
    console.log(result)
    return returnJson(result)
}

function fetchAllPocketItem() {
    const count = 1000
    let resultList: object = {}

    for (let i = 0; i < 50; i++) {
        const payload = {
            count: count,
            offset: i * count,
            favorite: 1,
        }
        const apiResult = fetchPocketApi('get', payload, 'post')
        const nowList = apiResult['list'] as object
        resultList = Object.assign(resultList,apiResult['list'])
        if (Object.keys(nowList).length < count) {
            break
        }
    }
    return resultList
}

function fetchPocketApi(path: string, payload: object, method: string) {
    const url = API_BASE_URL + path
    const _payload = Object.assign(
        {
            consumer_key: Environment.CONSUMER_KEY,
            access_token: Environment.ACCESS_TOKEN,
        },
        payload
    )
    const _header = {
        'Content-Type': 'application/json',
        'X-Accept': 'application/json',
    }
    const option = {
        method: method,
        payload: _payload,
        header: _header,
    }
    return fetchApi(url, option)
}

function fetchApi(
    url: string,
    option: Record<string, unknown>
): Record<string, unknown> {
    const apiResult = UrlFetchApp.fetch(url, option)
    return JSON.parse(apiResult.getContentText())
}

function returnJson(result: Record<string, unknown>) {
    const data = JSON.stringify(result)
    const output = ContentService.createTextOutput()
    output.setMimeType(ContentService.MimeType.JSON)
    output.setContent(data)
    return output
}

function pickRandomItem(apiResult: any) {
    const length = Object.keys(apiResult).length
    const picked_index = Math.floor(Math.random() * length)
    const picked_key = Object.keys(apiResult)[picked_index]
    const picked = apiResult[picked_key]
    return picked
}