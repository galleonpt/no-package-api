const http = require('http')
const routes = require('./routes')
const { URL } = require('url')
const bodyParser = require('./helpers/bodyParser')

const server = http.createServer((request, response) => {
	const parsedUrl = new URL(`http://localhost:9999${request.url}`)
	console.log(`request method: ${request.method} | Endpoint: ${parsedUrl.pathname}`)

	let { pathname } = parsedUrl
	let id = null;

	const splitEndpoint = pathname.split('/').filter(Boolean) //remover a primeira posiçao do array(é '' e isso é igual a falso)

	if(splitEndpoint.length>1){
		pathname = `/${splitEndpoint[0]}/:id`
		id = splitEndpoint[1]
	}

	const route = routes.find((atual) => (
		atual.endpoint === pathname && atual.method === request.method
	))

	if(route){
		request.query = Object.fromEntries(parsedUrl.searchParams)
		request.params = { id }

		response.send = (statusCode, body) => {
			response.writeHead(statusCode, { 'Content-Type': 'application/json' })
			response.end(JSON.stringify(body))
		}

		if(['POST', 'PUT'].includes(request.method)){
			bodyParser(request, () => route.handler(request, response))
		} else {
			route.handler(request, response)
		}
	} else {
		response.writeHead(404, { 'Content-type': 'text/html' })
		response.end(`Cannot ${request.method} ${pathname}`)
	}

})

server.listen(9999, () => console.log('Server on'))