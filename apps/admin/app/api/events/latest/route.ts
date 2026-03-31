import { NextResponse } from "next/server"
import { EventItem, eventStore } from "../route"

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || ""

async function proxyLatest() {
  if (!EVENT_SERVICE_URL) {
    throw new Error("No EVENT_SERVICE_URL configured")
  }
  const url = `${EVENT_SERVICE_URL.replace(/\/$/, "")}/events/latest`
  const res = await fetch(url)

  if (res.status === 204) {
    return null
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Remote event service latest error: ${res.status} ${text}`)
  }

  return res.json()
}

export async function GET() {
  if (EVENT_SERVICE_URL) {
    try {
      const remote = await proxyLatest()
      if (remote) {
        return NextResponse.json(remote)
      }
    } catch (error) {
      console.warn("EVENT_SERVICE_URL latest fallback:", (error as Error).message)
    }
  }

  const latest = eventStore.find((e: EventItem) => e.type === "AGENT_OUTPUT")

  if (!latest) {
    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.json(latest)
}
