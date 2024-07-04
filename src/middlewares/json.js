
export async function json(req, res){
    const buffers = []

    for await (const chunk of req){//os dados que vem estão em binario pq o node trabalha com stream e é assim
        buffers.push(chunk)
    }
    
    try{
        req.body = JSON.parse(Buffer.concat(buffers).toString())
    }catch{
        req.body = null
    }

    res.setHeader('Content-type', 'application/json')//froma de definir os dados que vamos trabalhar no caso do tipo json
}
