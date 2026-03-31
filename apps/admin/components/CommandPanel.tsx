"use client"

import * as React from "react"
import { postEvent } from "../lib/api"

type CommandPanelProps = {
  onEventSent?: () => void
}

export default function CommandPanel({ onEventSent }: CommandPanelProps) {
  const [text, setText] = React.useState("")
  const [status, setStatus] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!text.trim()) {
      setStatus("Please enter a command or task.")
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      await postEvent({ type: "USER_INPUT", payload: { text: text.trim() } })
      setStatus("Event sent successfully.")
      setText("")
      onEventSent?.()
    } catch (error) {
      setStatus("Failed to send event, please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">Command / Input Panel</h2>
      <form onSubmit={handleSend} className="space-y-3">
        <textarea
          className="w-full rounded-md border p-2 text-sm focus:border-sky-500 focus:outline-none"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter task, command, or prompt..."
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Event"}
          </button>
          {status ? <span className="text-sm text-slate-500">{status}</span> : null}
        </div>
      </form>
    </div>
  )
}
