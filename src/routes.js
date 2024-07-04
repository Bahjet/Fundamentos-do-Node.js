import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { randomUUID } from 'node:crypto'

const database = new Database()
const date = new Date();

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query
            const tasks = database.select('tasks', search ? {
                title: search,
                description: search,
            } : null)

            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body

            if(!title){
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'title is required' }),
                )
            }

            if(!description){
                return res.writeHead(400).end(
                    JSON.stringify({message: 'description is required'})
                )
            }
            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: date.toLocaleDateString(),
                updated_at: null,
            }
            database.insert('tasks', task)

            return res.writeHead(201).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            if(!title && !description){
                return res.writeHead(400).end(
                    JSON.stringify({message: 'title or description are required'})
                )
            }

            const [task] = database.select('tasks', {id})

            if(!task){
                return res.writeHead(404).end()
            }

            database.update('tasks', id, {
                title: title ?? task.title,
                description: description ?? task.description,
                updated_at:date.toLocaleDateString()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()//horario que teve alteração
            })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if(!task){
                return res.writeHead(404).end()
            }

            database.update('tasks', id, {
                completed_at: date.toLocaleDateString()
            })

            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if(!task){
                return res.writeHead(404).end()
            }

            database.delete('tasks', id)

            return res.writeHead(204).end()
        }
    },
]
