/**
 * Misc. utility functions.
 */

export const promiseThatResolvesIn = (miliseconds) => {
  return new Promise(resolve => {
    setTimeout(resolve, miliseconds)
  })
}

// taken from: https://gist.github.com/jed/982883
export const generateUuid = placeholder => 
  placeholder
    ? (placeholder ^ Math.random() * 16 >> placeholder / 4).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUuid)
