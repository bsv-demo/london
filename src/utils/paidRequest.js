import PacketPay from '@packetpay/js'
import { Authrite } from 'authrite-js'
import { toast } from 'react-toastify'

// Instantiate a new Authrite Client
const client = new Authrite()

// For making authenticated, no-payment HTTP Request
const fetch = client.request

// For making authenticated, payment-requesting HTTP Request
// const fetch = PacketPay

export default async (method, url, params) => {
  try {
    // Make an HTTP Request
    const response = await fetch(url, {
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
