import type { ChildProcessWithoutNullStreams } from 'child_process'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useRef, useState } from 'react'
import type blessed from 'blessed'

const bindProcessOutputToReactState = (
  process: ChildProcessWithoutNullStreams,
  setState: Dispatch<SetStateAction<string>>,
) => {
  process.stdout.on('data', (data) => {
    setState(prevOutput => prevOutput + data.toString())
  })
  process.stderr.on('data', (data) => {
    console.error(data.toString())
  })
}

export function useSpawnProcessOutput(process: ChildProcessWithoutNullStreams) {
  const [output, setOutput] = useState('')
  const logRef = useRef<blessed.Widgets.Log>(null)
  useEffect(() => {
    bindProcessOutputToReactState(process, setOutput)
  }, [])
  useEffect(() => {
    if (logRef.current) {
      logRef.current.setContent(output)
    }
  }, [output])

  return logRef
}
