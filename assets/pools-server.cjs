const { createHash } = require('node:crypto')
const { readFileSync } = require('node:fs')
const { createServer } = require('node:http')

const pools = readFileSync('/assets/pools-v2.json')
// Mempool keeps this in `state.pools_json_sha` and re-imports only when it
// changes, so it has to track the file's content. Git's blob hash is what
// api.github.com reports for the same bytes, so the two sources agree.
const sha = createHash('sha1')
  .update(`blob ${pools.length}\0`)
  .update(pools)
  .digest('hex')

const routes = {
  '/pools-v2.json': pools,
  '/tree': Buffer.from(
    JSON.stringify({ tree: [{ path: 'pools-v2.json', sha }] }),
  ),
}

createServer((req, res) => {
  const body = routes[req.url]
  if (!body) return res.writeHead(404).end()
  res.writeHead(200, {
    'content-type': 'application/json',
    'content-length': body.length,
  })
  res.end(body)
}).listen(Number(process.env.PORT), '127.0.0.1')
