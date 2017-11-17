'use strict'

const qs = require('querystring')
const url = require('url')
const BodyStream = require('./body-stream')

const MEDIATOR_RESPONSE = JSON.stringify({
  'x-mediator-urn': 'urn:uuid:5411f30d-3416-44dc-83f9-406ec5c6a259',
  status: 'Successful',
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{"message": "Hello world\\n"}',
    timestamp: Date.now()
  },
  orchestrations: [
    {
      name: 'Test',
      request: {
        method: 'POST',
        path: '/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'name=world',
        timestamp: Date.now()
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Hello world\n',
        timestamp: Date.now()
      }
    }
  ]
})

function respondImmediately (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'})
  res.end('Hello world\n')
}

function respondWithBody (req, res, length) {
  if (!Number.isInteger(length)) {
    length = 1024
  }
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'})
  new BodyStream(length).pipe(res)
}

function respondAsMediator (req, res, delay) {
  if (!Number.isInteger(delay)) {
    delay = 500
  }
  setTimeout(() => {
    res.writeHead(200, {'Content-Type': 'application/json+openhim; charset=utf-8'})
    res.end(MEDIATOR_RESPONSE)
  }, delay)
}

function handleRequest (req, res) {
  const parsed = url.parse(req.url)
  if (parsed.pathname === '/immediate') {
    return respondImmediately(req, res)
  }
  if (parsed.pathname === '/body') {
    const query = qs.parse(parsed.query)
    return respondWithBody(req, res, +query.length)
  }
  if (parsed.pathname === '/mediator') {
    const query = qs.parse(parsed.query)
    return respondAsMediator(req, res, +query.delay)
  }
  res.writeHead(404)
  res.end('Not found\n')
}

exports.handleRequest = handleRequest
