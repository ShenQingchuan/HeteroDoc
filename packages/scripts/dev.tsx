import { spawn } from 'child_process'
import { join, resolve } from 'path'
import React from 'react'
import { render } from 'react-blessed'
import blessed from 'blessed'
import { useSpawnProcessOutput } from './hooks'

const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'Terminal Layout',
})

const WORKSPACE_ROOT = resolve(__dirname, '../..')
const SHARED_ROOT = join(WORKSPACE_ROOT, 'packages/shared')
const EDITOR_ROOT = join(WORKSPACE_ROOT, 'packages/editor')
const WEB_APP_ROOT = join(WORKSPACE_ROOT, 'packages/app')

const createDevProcess = (cmd: string, args: readonly string[], cwd: string) => {
  return spawn(cmd, [...args], {
    shell: true,
    cwd,
    stdio: 'pipe',
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  })
}

const processShared = createDevProcess('pnpm', ['dev'], SHARED_ROOT)
const processEditorBuild = createDevProcess('pnpm', ['dev-tsup'], EDITOR_ROOT)
const processEditorTypes = createDevProcess('pnpm', ['dev-dts'], EDITOR_ROOT)
const processWebApp = createDevProcess('pnpm', ['dev'], WEB_APP_ROOT)
const colorfulLabel = (name: string, color: 'blue' | 'cyan' | 'green' | 'yellow') => `{${color}-fg}${name}{/${color}-fg}`

const DevShared: React.FC = () => {
  const logRef = useSpawnProcessOutput(processShared)

  return (
    <log
      tags
      ref={logRef}
      width="33.33%"
      label={colorfulLabel('Dev: Shared', 'yellow')}
      border={{ type: 'line' }} height="100%"
      scrollOnInput={true}
    />
  )
}

const DevEditorBuild: React.FC = () => {
  const logRef = useSpawnProcessOutput(processEditorBuild)

  return (
    <log
      tags
      ref={logRef}
      width="33.33%"
      left="33.33%"
      label={colorfulLabel('Dev: Editor build', 'cyan')}
      height="60%"
      border={{ type: 'line' }}
      scrollOnInput={true}
    />
  )
}

const DevEditorTypes: React.FC = () => {
  const logRef = useSpawnProcessOutput(processEditorTypes)

  return (
    <log
      tags
      ref={logRef}
      width="33.33%"
      left="33.33%"
      top="60%"
      label={colorfulLabel('Dev: Editor types', 'cyan')}
      border={{ type: 'line' }}
      height="40%"
      scrollOnInput={true}
    />
  )
}

const DevWebApp: React.FC = () => {
  const logRef = useSpawnProcessOutput(processWebApp)

  return (
    <log
      tags
      ref={logRef}
      width="33.33%"
      left="66.66%"
      label={colorfulLabel('Dev: Web app', 'blue')}
      border={{ type: 'line' }}
      height="100%"
      scrollOnInput={true}
    />
  )
}

function DevDashboard() {
  return (
    <element>
      <DevWebApp />
      <DevEditorBuild />
      <DevEditorTypes />
      <DevShared />
    </element>
  )
}

screen.key(['escape', 'q', 'C-c'], () => {
  processShared.kill()
  processEditorBuild.kill()
  processEditorTypes.kill()
  processWebApp.kill()
  return process.exit(0)
})

render(<DevDashboard />, screen)
