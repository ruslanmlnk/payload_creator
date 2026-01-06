import { isEntityHidden, type PayloadHandler } from 'payload'

type MetricOp =
  | 'count'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'earliest'
  | 'latest'

type MetricsRequest = {
  collection?: string
  field?: string
  op?: MetricOp
  where?: Record<string, unknown>
  limit?: number
  page?: number
  depth?: number
  sort?: string
  all?: boolean
  maxDocs?: number
  includeDocs?: boolean
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })

const clampInt = (value: unknown, fallback: number, min: number, max: number) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return fallback
  return Math.max(min, Math.min(max, Math.floor(num)))
}

const getValueAtPath = (input: unknown, path: string) => {
  if (!path) return undefined
  const parts = path.split('.').filter(Boolean)
  let current: unknown = input

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const toDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

const normalizeDate = (value: unknown) => {
  const date = toDate(value)
  return date ? date.toISOString() : null
}

export const metricsGet: PayloadHandler = async (req) => {
  if (!req.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  let body: MetricsRequest = {}
  try {
    body = (await req.json()) as MetricsRequest
  } catch (_err) {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  const collectionSlug =
    typeof body.collection === 'string' ? body.collection : ''

  if (!collectionSlug) {
    return jsonResponse({ error: 'Collection is required' }, 400)
  }

  const collectionConfig = req.payload?.config?.collections?.find(
    (collection) => collection.slug === collectionSlug,
  )

  if (!collectionConfig) {
    return jsonResponse({ error: 'Collection not found' }, 404)
  }

  const isHidden = isEntityHidden({
    hidden: collectionConfig?.admin?.hidden,
    user: req.user,
  })

  if (isHidden) {
    return jsonResponse({ error: 'Collection is hidden' }, 403)
  }

  const op = body.op
  const field = typeof body.field === 'string' ? body.field : undefined
  const where =
    body.where && typeof body.where === 'object'
      ? (body.where as Record<string, unknown>)
      : undefined
  const depth = clampInt(body.depth, 0, 0, 10)
  const limit = clampInt(body.limit, 25, 1, 1000)
  const page = clampInt(body.page, 1, 1, 100000)
  const sort = typeof body.sort === 'string' ? body.sort : undefined
  const all = Boolean(body.all)
  const maxDocs = clampInt(body.maxDocs, 2000, 1, 100000)

  const findPage = (pageNumber: number, pageLimit: number, sortOverride?: string) =>
    req.payload.find({
      collection: collectionSlug,
      where,
      limit: pageLimit,
      page: pageNumber,
      depth,
      sort: sortOverride ?? sort,
      req,
    })

  if (op === 'count') {
    const result = await findPage(1, 1)
    return jsonResponse({
      op,
      collection: collectionSlug,
      value: result.totalDocs,
    })
  }

  if (op === 'earliest' || op === 'latest') {
    if (!field) {
      return jsonResponse({ error: 'Field is required for aggregation' }, 400)
    }
    const sortKey = op === 'earliest' ? field : `-${field}`
    const result = await findPage(1, 1, sortKey)
    const doc = result.docs?.[0]
    const rawValue = doc ? getValueAtPath(doc, field) : undefined

    return jsonResponse({
      op,
      collection: collectionSlug,
      field,
      value: normalizeDate(rawValue),
      totalDocs: result.totalDocs,
      doc: body.includeDocs ? doc : undefined,
    })
  }

  if (op) {
    if (!field) {
      return jsonResponse({ error: 'Field is required for aggregation' }, 400)
    }

    let totalDocs = 0
    let processed = 0
    let validCount = 0
    let sum = 0
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    let pageNumber = all ? 1 : page
    let hasNext = true
    let truncated = false

    while (hasNext) {
      const result = await findPage(pageNumber, all ? limit : limit)
      if (pageNumber === (all ? 1 : page)) {
        totalDocs = result.totalDocs
      }

      for (const doc of result.docs || []) {
        const rawValue = getValueAtPath(doc, field)
        const num = toNumber(rawValue)
        if (num === null) {
          continue
        }
        validCount += 1
        sum += num
        min = Math.min(min, num)
        max = Math.max(max, num)
        processed += 1

        if (all && processed >= maxDocs) {
          truncated = true
          hasNext = false
          break
        }
      }

      if (!all) {
        break
      }

      hasNext = Boolean(result.hasNextPage)
      pageNumber += 1
    }

    let value: number | null = null

    switch (op) {
      case 'sum':
        value = validCount > 0 ? sum : null
        break
      case 'avg':
        value = validCount > 0 ? sum / validCount : null
        break
      case 'min':
        value = validCount > 0 ? min : null
        break
      case 'max':
        value = validCount > 0 ? max : null
        break
      default:
        value = null
        break
    }

    return jsonResponse({
      op,
      collection: collectionSlug,
      field,
      value,
      totalDocs,
      processed,
      validCount,
      truncated,
    })
  }

  if (all) {
    let pageNumber = 1
    let hasNext = true
    let totalDocs = 0
    let processed = 0
    let truncated = false
    const docs: unknown[] = []

    while (hasNext) {
      const result = await findPage(pageNumber, limit)
      if (pageNumber === 1) {
        totalDocs = result.totalDocs
      }

      for (const doc of result.docs || []) {
        docs.push(doc)
        processed += 1
        if (processed >= maxDocs) {
          truncated = true
          hasNext = false
          break
        }
      }

      hasNext = Boolean(result.hasNextPage)
      pageNumber += 1
    }

    return jsonResponse({
      collection: collectionSlug,
      docs,
      totalDocs,
      processed,
      truncated,
    })
  }

  const result = await findPage(page, limit)

  return jsonResponse({
    collection: collectionSlug,
    docs: result.docs,
    totalDocs: result.totalDocs,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  })
}
