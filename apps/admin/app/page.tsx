"use client"

import * as React from "react"
import CommandPanel from "../components/CommandPanel"
import ResponseViewer from "../components/ResponseViewer"
import ActivityFeed from "../components/ActivityFeed"

export default function HomePage() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold">KARYO OS Admin Control Panel</h1>
          <p className="text-slate-600 mt-1">Event-driven UI layer for input, activity and agent outputs.</p>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CommandPanel onEventSent={() => setRefreshKey((v) => v + 1)} />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 gap-4">
            <ResponseViewer refreshKey={refreshKey} />
            <ActivityFeed refreshKey={refreshKey} />
          </div>
        </section>
      </div>
    </main>
  )
}
