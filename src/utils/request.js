import { Authrite } from 'authrite-js'
import { toast } from 'react-toastify'

// Instantiate a new Authrite Client
const client = new Authrite()

export default async (method, url, params) => {
  try {
    // Make an HTTP Request
    // TODO: Replace window.fetch with client.request
    const response = await window.fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    const parsedBody = await response.json()

    // Error Handling
    if (parsedBody.status === 'error') {
      if (parsedBody.description !== 'Register a user account before taking this action!' || url.indexOf('/getOwnProfile') === -1) {
        console.error(parsedBody)
        toast.error(
          parsedBody.description ||
          parsedBody.message ||
          'Request failed!'
        )
      }
    }
    return parsedBody
  } catch (e) {
    console.error(e)
    toast.error(e.message)
  }
}
