"use client"

import * as React from "react"
import { fetchLatestOutput } from "../lib/api"

type AgentOutput = {
  id: string
  type: string
  payload: { text: string }
  createdAt: string
}

type ResponseViewerProps = {
  refreshKey: number
}

export default function ResponseViewer({ refreshKey }: ResponseViewerProps) {
  const [output, setOutput] = React.useState<AgentOutput | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const latest = await fetchLatestOutput()
      setOutput(latest)
    } catch (err) {
      console.error(err)
      setError("Unable to load latest agent output.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load, refreshKey])

  React.useEffect(() => {
    const interval = window.setInterval(load, 6000)
    return () => window.clearInterval(interval)
  }, [load])

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">Response Viewer</h2>
      {loading ? (
        <p className="text-slate-500">Loading latest output...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : output ? (
        <div>
          <div className="mb-3 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-3 text-sm">
            {output.payload?.text ?? "(empty)"}
          </div>
          <p className="text-xs text-slate-500">{new Date(output.createdAt).toLocaleString()}</p>
        </div>
      ) : (
        <p className="text-slate-500">No agent output yet.</p>
      )}
    </div>
  )
}
