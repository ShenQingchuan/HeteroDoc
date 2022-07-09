/**
 * IMPORTANT NOTICE
 *
 * THIS DEVELOPMENT SCRIPT CAN ONLY RUN ON UNIX OPERATING SYSTEMS
 */

import path from 'path'
import { existsSync, rmSync } from 'fs'
import chalk from 'chalk'
import ora from 'ora'
import { execaCommand } from 'execa'

const editorDir = path.resolve(__dirname, '../packages/editor')
const appDir = path.resolve(__dirname, '../packages/app')
let didNotStart = true

const logger = {
  plain: (...rest: any[]) => console.log(...rest),
  info: (msg: string, ...rest: any[]) => console.log(`${chalk.green('[INFO]')} ${msg}`, ...rest),
  warn: (msg: string, ...rest: any[]) => console.log(`${chalk.yellow('[WARN]')} ${msg}`, ...rest),
  error: (msg: string, ...rest: any[]) => console.error(` ${chalk.green('[ERROR]')} ${msg}`, ...rest),
  clear: () => {
    console.clear()
    return logger
  },
}
const bundleEditorSpinner = ora(`${chalk.cyan('Bundling editor package ...\n')}`)

const compileEditor = async ({ onFirstFinish }: {
  onFirstFinish?: () => Promise<void>
}) => {
  logger.info('Start bundling editor package ...')
  bundleEditorSpinner.start()

  try {
    const compileProcess = execaCommand(
      'pnpm cross-env NODE_ENV=development && pnpm vite build --watch',
      {
        shell: true,
        cwd: editorDir,
        stdio: 'pipe',
      },
    )

    const compiling = compileProcess.stdout?.on('data', (data) => {
      bundleEditorSpinner.clear()
      logger.plain(String(data).replace(/\n/g, ''))

      if (!didNotStart && String(data).includes('build started...')) {
        logger.info('Restart bundling editor package ...')
      }
      else if (String(data).includes('Declaration files built')) {
        bundleEditorSpinner.succeed()
        if (didNotStart) {
          didNotStart = false
          setTimeout(() => onFirstFinish?.())
        }
        logger.info('Editor types generation finished ! 🛫')
      }
      else if (String(data).includes('built in')) {
        logger.info('Editor bundling finished ! 🍻')
      }
    })

    await compiling
  }
  catch (err) {
    logger.error('Compile hetero editor Error!', err)
  }
}
const startApp = async () => {
  logger.info('Start web app ...')
  try {
    await execaCommand(
      'pnpm vite',
      {
        shell: true,
        cwd: appDir,
        stdio: 'pipe',
      },
    ).stdout?.on('data', (data) => {
      logger.plain(String(data))
    })
  }
  catch {
    console.error('Compile hetero editor Error!')
  }
}

const distDirs = [
  path.resolve(__dirname, '../packages/app/dist'),
  path.resolve(__dirname, '../packages/editor/dist'),
]
const cleanDist = () => {
  distDirs.forEach(async (distDir) => {
    if (existsSync(distDir)) {
      logger.plain(`Deleting: ${distDir}`)
      rmSync(distDir, { recursive: true, force: true })
    }
  })
}

process.on('SIGINT', () => {
  logger.plain(`\n${chalk.yellow('Exiting development ...')}`)
  cleanDist()
})
compileEditor({
  onFirstFinish: startApp,
})
