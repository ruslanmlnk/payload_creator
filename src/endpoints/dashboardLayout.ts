import type { PayloadHandler } from 'payload'

const COLLECTION_SLUG = 'dashboard-layouts'

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })

export const dashboardLayoutGet: PayloadHandler = async (req) => {
  if (!req.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const userID = String(req.user.id)

  const result = await req.payload.find({
    collection: COLLECTION_SLUG,
    where: {
      userID: {
        equals: userID,
      },
    },
    limit: 1,
    req,
  })

  const doc = result.docs?.[0]

  return jsonResponse({
    layout: Array.isArray(doc?.layout) ? doc.layout : [],
  })
}

export const dashboardLayoutSave: PayloadHandler = async (req) => {
  if (!req.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  let body: { layout?: unknown } = {}
  try {
    body = await req.json()
  } catch (_err) {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  const layout = body?.layout
  if (!Array.isArray(layout)) {
    return jsonResponse({ error: 'Layout must be an array' }, 400)
  }

  const userID = String(req.user.id)

  const existing = await req.payload.find({
    collection: COLLECTION_SLUG,
    where: {
      userID: {
        equals: userID,
      },
    },
    limit: 1,
    req,
  })

  const doc = existing.docs?.[0]

  if (doc) {
    const updated = await req.payload.update({
      collection: COLLECTION_SLUG,
      id: doc.id,
      data: {
        layout,
      },
      req,
    })

    return jsonResponse({ layout: updated.layout })
  }

  const created = await req.payload.create({
    collection: COLLECTION_SLUG,
    data: {
      userID,
      layout,
    },
    req,
  })

  return jsonResponse({ layout: created.layout })
}
