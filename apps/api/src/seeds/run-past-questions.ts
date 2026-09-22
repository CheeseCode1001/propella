import { connectDB, disconnectDB } from '../config/db'
import { seedPastQuestions } from './past-questions'

/**
 * Loads only the past-question bank, for when the data files change and the
 * rest of the seed does not need to run. `pnpm seed` includes this too.
 */
connectDB()
  .then(() => seedPastQuestions())
  .then(async () => {
    await disconnectDB()
    process.exit(0)
  })
  .catch(async (err: unknown) => {
    console.error('Past-question seed failed:', err)
    await disconnectDB().catch(() => undefined)
    process.exit(1)
  })
