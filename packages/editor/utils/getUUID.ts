export function getUUID(len?: number): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const uuid: string[] = []
  const alphabetLen = alphabet.length
  const radix = alphabetLen
  if (len) {
    // Compact form
    for (let i = 0; i < len; i++) {
      const randomNum = 0 | (Math.random() * radix)
      uuid[i] = alphabet.charAt(randomNum)
    }
  }
  else {
    // rfc4122, version 4 form
    // rfc4122 requires these characters
    uuid[8] = '-'
    uuid[13] = '-'
    uuid[18] = '-'
    uuid[23] = '-'
    uuid[14] = '4'
    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        const r = 0 | (Math.random() * 16)
        uuid[i] = alphabet.charAt(i === 19 ? (r & 0x3) | 0x8 : r)
      }
    }
  }
  return uuid.join('')
}
