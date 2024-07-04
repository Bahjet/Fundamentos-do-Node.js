import http from 'node:http'

import { json } from './middlewares/json.js' 
import { routes } from './routes.js'
import { extractQueryParams } from './utils/extract-query-params.js'

import { parse } from 'csv-parse'
import fs from 'node:fs'
import { resolve } from 'node:path'


const server = http.createServer(async (req, res) => {
    const { method, url } = req
    
    await json(req, res)

    const route = routes.find(route => {
        return route.method === method && route.path.test(url)
    })

    if(route){
        const routeParams = req.url.match(route.path)

        const {query, ...params} = routeParams.groups

        req.params = params

        req.query = query ? extractQueryParams(query) : {}

        return route.handler(req, res)
    }

    return res.writeHead(404).end('pagina não encontrada')//status codes

})

// csv-------------------------------------------------------------------------------
const csvPath = new URL('./tasks.csv', import.meta.url)
const stream = fs.createReadStream(csvPath)

const csvParse = parse({
    delimiter: ',',
    skipEmptyLines: true,
    formLine: 2// skip the header line
})

async function run(){
    const linesParse = stream.pipe(csvParse)
    for await (const line of linesParse){
        const [title, description] = line
        await fetch('http://localhost:3334/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
            })
        })

    // Uncomment this line to see the import working in slow motion (open the db.json)
    await wait(1000)
    }
}

run()

function wait(ms){
    return new Promise((resolve) => setTimeout(resolve, ms))
}

server.listen(3334)//localhost:3334
