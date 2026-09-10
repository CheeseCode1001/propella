import './config/env' // Validates env vars immediately — throws if invalid
import { env } from './config/env'
import { logger } from './config/logger'
import { connectDB, disconnectDB } from './config/db'
import app from './app'
import { startScheduler } from './lib/scheduler'

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down')
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled promise rejection — shutting down')
  process.exit(1)
})

async function startServer(): Promise<void> {
  await connectDB()
  startScheduler()

  const server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        pid: process.pid,
      },
      `Propella API listening on port ${env.PORT}`,
    )
  })

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal')
    server.close(() => {
      logger.info('HTTP server closed')
      void disconnectDB()
        .catch(() => undefined)
        .then(() => process.exit(0))
    })

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Could not close connections in time, forcing exit')
      process.exit(1)
    }, 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

startServer().catch((err: Error) => {
  logger.fatal({ err }, 'Failed to start server')
  process.exit(1)
})
