// import PacketPay from '@packetpay/js'
import { Authrite } from 'authrite-js'
import { toast } from 'react-toastify'

// Instantiate a new Authrite Client
const client = new Authrite()

export default async (method, url, params) => {
  try {
    // Make an HTTP Request
    const response = await client.request(url, {
      method,
      body: JSON.stringify(params)
    })
    const parsedBody = JSON.parse(Buffer.from(response.body).toString('utf8'))

    // Error Handling
    if (parsedBody.status === 'error') {
      console.error(parsedBody)
      toast.error(
        parsedBody.description ||
        parsedBody.message ||
        'Request failed!'
      )
    }
    return parsedBody
  } catch (e) {
    console.error(e)
    toast.error(e.message)
  }
}

// TEMPLATE CODE ----------------------------------------------------------------------

/**
 * TODO: Use PacketPay client for micropayments ----------------------------
 */
// const response = await PacketPay(url, {
//   method,
//   body: JSON.stringify(params)
// })

// -------------------------------------------------------------------------------------
