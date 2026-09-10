/**
 * Prints a fresh VAPID key pair for web push.
 *
 * Run once per environment and paste the output into .env. Changing the keys
 * invalidates every existing subscription, so keep them stable in production.
 */
import webpush from 'web-push'

const { publicKey, privateKey } = webpush.generateVAPIDKeys()

console.log('\nAdd these to apps/api/.env:\n')
console.log(`VAPID_PUBLIC_KEY=${publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${privateKey}`)
console.log('\nAnd to apps/web/.env.local:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`)
console.log('\nThe private key is a secret — never commit it or ship it to the browser.\n')
