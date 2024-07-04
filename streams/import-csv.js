import { parse } from 'csv-parse'
import fs from 'node:fs'
import http from 'node:http'
import { resolve } from 'node:path'

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
            body:JSON.stringify({
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

