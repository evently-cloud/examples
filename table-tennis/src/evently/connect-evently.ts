import env from "env-sanitize"
import assert from "node:assert"
import {Client, Dispatcher, Pool} from "undici"

import {SendToEvently} from "./index.ts"


export function createEventlyConnection(poolSize: number): SendToEvently {
  const urlPrefix = env("EVENTLY_URL")
  let token = env("EVENTLY_TOKEN", "")
  if (!token) {
    const ledgerId = env("EVENTLY_LEDGER_ID")
    assert(ledgerId, "Cannot find or create an access token")
    token = Buffer
      .from(`{"roles":["client","registrar","admin"],"ledger":"${ledgerId}"}`)
      .toString("base64url")
  }

  // token needs client and registrar roles, and admin role if resetting ledger
  const authToken = `Bearer ${token}`
  console.info('Connecting to %s with Authorization: %s', urlPrefix, authToken)

  // set long timeouts for debugging.
  const options = {
    bodyTimeout: 6000e3,
    headersTimeout: 6000e3
  }
  const client = poolSize == 1
    ? new Client(urlPrefix, options)
    : new Pool(urlPrefix, options)

  return (r) => _fetch(client, authToken, r)
}


async function _fetch(dispatcher:     Dispatcher,
                      authorization:  string,
                      request:        Dispatcher.DispatchOptions): Promise<Dispatcher.ResponseData> {
  const options = {
    ...request,
    headers: {
      ...request.headers,
      authorization,
      "Content-Type": "application/json"
    }
  }

  const result = await dispatcher.request(options)

  if (result.statusCode === 401) {
    throw new Error(`401 Unauthorized, WWW-Authenticate: ${result.headers["www-authenticate"]}`)
  }
  return result
}
