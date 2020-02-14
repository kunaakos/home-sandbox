/**
 * Misc. utility functions.
 */

export const promiseThatResolvesIn = (miliseconds) => {
  return new Promise(resolve => {
    setTimeout(resolve, miliseconds)
  })
}
