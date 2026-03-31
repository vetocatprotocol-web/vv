"use client"

import * as React from "react"
import { fetchEvents } from "../lib/api"

type EventItem = {
  id: string
  type: string
  payload: any
  createdAt: string
}

type ActivityFeedProps = {
  refreshKey: number
}

export default function ActivityFeed({ refreshKey }: ActivityFeedProps) {
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const received = await fetchEvents()
      setEvents(received)
    } catch (err) {
      console.error(err)
      setError("Unable to load recent events.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load, refreshKey])

  React.useEffect(() => {
    const interval = window.setInterval(load, 6500)
    return () => window.clearInterval(interval)
  }, [load])

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">Activity Feed</h2>
      {loading ? (
        <p className="text-slate-500">Loading events...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <ul className="space-y-2">
          {events.length === 0 ? (
            <li className="text-slate-500">No events yet.</li>
          ) : (
            events.slice(0, 10).map((e) => (
              <li key={e.id} className="rounded border border-slate-100 p-2">
                <div className="text-sm font-medium text-slate-700">{e.type}</div>
                <div className="text-xs text-slate-500">{new Date(e.createdAt).toLocaleTimeString()}</div>
                <div className="text-sm text-slate-600 truncate">{JSON.stringify(e.payload)}</div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
