import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { execaCommand } from 'execa'

const editorDir = path.resolve(__dirname, '../packages/editor')
const appDir = path.resolve(__dirname, '../packages/app')
let didNotStart = true

const logger = {
  info: (msg: string, ...rest: any[]) => console.log(`${chalk.green('[INFO]')} ${msg}`, ...rest),
  warn: (msg: string, ...rest: any[]) => console.log(`${chalk.yellow('[WARN]')} ${msg}`, ...rest),
  error: (msg: string, ...rest: any[]) => console.error(`${chalk.green('[ERROR]')} ${msg}`, ...rest),
  clear: () => {
    console.clear()
    return logger
  },
}
const bundleEditorSpinner = ora(`${chalk.cyan('Bundling editor package ...')}`)

const compileEditor = async ({ onFirstFinish: onFinish }: {
  onFirstFinish?: () => Promise<void>
}) => {
  logger.info('Start bundling editor package ...')
  try {
    const compileProcess = execaCommand(
      'pnpm cross-env NODE_ENV=development && pnpm vite build --watch',
      {
        shell: true,
        cwd: editorDir,
        stdio: 'pipe',
      },
    ).stdout?.on('data', (data) => {
      bundleEditorSpinner.start()
      if (!didNotStart && String(data).includes('build started...'))
        logger.clear().info('Restart bundling editor package ...')

      if (String(data).includes('Declaration files built')) {
        bundleEditorSpinner.stop()
        if (didNotStart) {
          didNotStart = false
          setTimeout(() => onFinish?.())
          logger.clear()
        }
        logger.info('Editor bundling finished ! 🍻')
      }
    })
    await compileProcess
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
        stdio: 'inherit',
      },
    )
  }
  catch {
    console.error('Compile hetero editor Error!')
  }
}

compileEditor({
  onFirstFinish: startApp,
})
