import fetch from 'node-fetch'

const DEBUG = true

export const AioFeed = ({
  id,
  label,
  apiPath = 'https://io.adafruit.com/api/v2',
  username,
  aioKey,
  feedKey
}) => {

  DEBUG && console.log('AIO: initializing')

  if (!username || !aioKey || !feedKey) {
    DEBUG && console.log('AIO: config missing, continuing in mock mode')
    return { update: () => null }
  }

  const update = async data => {
    DEBUG && console.log(`AIO: updating ${feedKey}`)
    const response = await fetch(
      `${apiPath}/${username}/feeds/${feedKey}/data`,
      {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
          'X-AIO-KEY': aioKey
        },
        body: JSON.stringify({ datum: { value: data } })
      }
    )

    const responseBody = await response.json()

    if (responseBody.error) {
      throw new Error(responseBody.error)
    }

    return responseBody
  }

  return { 
    type: 'datafeed',
    id,
    label,
    update
  }
}
