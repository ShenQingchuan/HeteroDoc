/**
 * IMPORTANT NOTICE
 *
 * THIS DEVELOPMENT SCRIPT CAN ONLY RUN ON UNIX OPERATING SYSTEMS
 */

import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { execaCommand } from 'execa'

const rootDir = path.resolve(__dirname, '..')
// const editorDir = path.resolve(__dirname, '../packages/editor')
// const sharedDir = path.resolve(__dirname, '../packages/shared')

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

const watchBuildLibByVite = async (
  projectName: string,
  projectBuildCmd: string,
  onFirstFinished?: () => void,
) => {
  let isFirstBundle = true
  const bundleLibSpinner = ora(`${chalk.cyan(`Bundling ${projectName}... \n`)}`)
  bundleLibSpinner.start()

  try {
    await execaCommand(
      projectBuildCmd,
      {
        shell: true,
        cwd: rootDir,
        stdio: 'pipe',
      },
    ).stdout?.on('data', (data) => {
      bundleLibSpinner.clear()
      // logger.plain(String(data).replace(/\n/g, ''))

      if (!isFirstBundle && String(data).includes('build started...')) {
        logger.info(`Restart bundling ${projectName} package ...`)
      }
      if (isFirstBundle && String(data).includes('Declaration files built')) {
        bundleLibSpinner.text = `${projectName} build finished`
        bundleLibSpinner.succeed()
        logger.info(`${projectName} types definitions generation finished`)
      }
      if (/Declaration files built in/.test(String(data))) {
        if (isFirstBundle) {
          isFirstBundle = false
          onFirstFinished?.()
        }
        else {
          logger.info(`✔ ${projectName} rebuild finished`)
        }
      }
    })
  }
  catch (err) {
    logger.error('Compile hetero editor Error!', err)
  }
}

process.on('SIGINT', () => {
  logger.plain(`\n${chalk.yellow('Exiting watching ...')}`)
})
watchBuildLibByVite(
  'Shared lib',
  'pnpm dev:shared',
  () => {
    watchBuildLibByVite(
      'Editor',
      'pnpm dev:editor',
    )
  },
)
