export type EventPayload = {
  type: string
  payload: any
}

export async function postEvent(eventPayload: EventPayload) {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventPayload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Event API failed: ${res.status} ${body}`)
  }

  return res.json()
}

export async function fetchLatestOutput() {
  const res = await fetch("/api/events/latest")
  if (!res.ok) {
    if (res.status === 204) return null
    const text = await res.text()
    throw new Error(`Failed fetching latest output: ${res.status} ${text}`)
  }

  return res.json()
}

export async function fetchEvents() {
  const res = await fetch("/api/events")
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed fetching events: ${res.status} ${text}`)
  }
  return res.json()
}
