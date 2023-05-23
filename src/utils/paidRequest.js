import PacketPay from '@packetpay/js'
import { Authrite } from 'authrite-js'
import { toast } from 'react-toastify'

// Instantiate a new Authrite Client
const client = new Authrite()

export default async (method, url, params) => {
  try {
    // Make an HTTP Request
    // TODO: Replace client.request with PacketPay
    const response = await client.request(url, {
      method,
      body: JSON.stringify(params)
    })
    const parsedBody = await response.json()

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
