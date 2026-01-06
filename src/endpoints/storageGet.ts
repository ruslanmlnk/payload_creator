import path from 'path'
import { isEntityHidden, type PayloadHandler } from 'payload'

type StorageSlice = {
  id: string
  label: string
  usedGB: number
  color: string
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })

const bytesToGB = (value: number) => value / (1024 * 1024 * 1024)
const bytesToMB = (value: number) => value / (1024 * 1024)

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (typeof value === 'bigint') {
    return Number(value)
  }
  return null
}

const sumUploadDocBytes = (doc: Record<string, unknown>) => {
  let total = 0
  const base = toNumber(doc.filesize ?? doc.fileSize ?? doc.size)
  if (base) {
    total += base
  }

  const sizes = doc.sizes
  if (sizes && typeof sizes === 'object') {
    for (const size of Object.values(sizes as Record<string, unknown>)) {
      if (!size || typeof size !== 'object') {
        continue
      }
      const sizeBytes = toNumber((size as Record<string, unknown>).filesize)
      if (sizeBytes) {
        total += sizeBytes
      }
    }
  }

  return total
}

const getDebugValue = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }
  if (typeof value === 'bigint') {
    return Number(value)
  }
  return null
}

const extractSizesDebug = (sizes: unknown) => {
  if (!sizes || typeof sizes !== 'object') {
    return null
  }
  const output: Record<string, number | string | null> = {}
  for (const [key, value] of Object.entries(sizes as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') {
      continue
    }
    const raw = (value as Record<string, unknown>).filesize
    output[key] = getDebugValue(raw)
  }
  return Object.keys(output).length > 0 ? output : null
}

const parseQueryFlag = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) {
    return value.some((entry) => parseQueryFlag(entry))
  }
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
  }
  return false
}

const extractFirstNumericValue = (row: unknown) => {
  if (!row || typeof row !== 'object') return null
  const values = Object.values(row as Record<string, unknown>)
  for (const value of values) {
    const numeric = toNumber(value)
    if (numeric !== null) {
      return numeric
    }
  }
  return null
}

type PayloadLike = {
  db?: Record<string, any>
}

type DiskUsage = {
  path: string
  totalBytes: number
  freeBytes: number
  usedBytes: number
  totalGB: number
  freeGB: number
  usedGB: number
  freePercent: number
  usedPercent: number
}

type CheckDiskSpace = (target: string) => Promise<{ free: number; size: number }>

const getDiskUsage = async (
  projectPath: string,
): Promise<{ disk: DiskUsage | null; error?: string }> => {
  const root = path.parse(projectPath).root || projectPath
  const diskPath = root.length > 1 && root.endsWith(path.sep) ? root.slice(0, -1) : root

  try {
    const mod = (await import('check-disk-space')) as unknown
    const checkDiskSpace: CheckDiskSpace | null =
      typeof mod === 'function'
        ? (mod as CheckDiskSpace)
        : typeof (mod as { default?: unknown }).default === 'function'
          ? (mod as { default: CheckDiskSpace }).default
          : null

    if (!checkDiskSpace) {
      return { disk: null, error: 'Disk usage module is unavailable.' }
    }

    const result = await checkDiskSpace(diskPath)
    const totalBytes = toNumber(result?.size)
    const freeBytes = toNumber(result?.free)

    if (totalBytes === null || freeBytes === null) {
      return { disk: null, error: 'Disk usage result missing size/free values.' }
    }

    const usedBytes = Math.max(0, totalBytes - freeBytes)
    const totalGB = Number(bytesToGB(totalBytes).toFixed(2))
    const freeGB = Number(bytesToGB(freeBytes).toFixed(2))
    const usedGB = Number(bytesToGB(usedBytes).toFixed(2))
    const freePercent = totalBytes > 0 ? Math.round((freeBytes / totalBytes) * 100) : 0
    const usedPercent = totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0

    return {
      disk: {
        path: diskPath,
        totalBytes,
        freeBytes,
        usedBytes,
        totalGB,
        freeGB,
        usedGB,
        freePercent,
        usedPercent,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read disk usage'
    return { disk: null, error: message }
  }
}

const getDatabaseUsage = async (payload: PayloadLike | undefined) => {
  const db = payload?.db as Record<string, any> | undefined
  if (!db) return null

  const pool = db.pool
  if (pool && typeof pool.query === 'function') {
    try {
      const result = await pool.query('select pg_database_size(current_database()) as size_bytes')
      const sizeValue = result?.rows?.[0]?.size_bytes ?? result?.rows?.[0]?.pg_database_size
      const bytes = toNumber(sizeValue)
      if (bytes !== null) {
        return { type: 'Postgres', bytes }
      }
    } catch {}
  }

  const mongoDb =
    db.connection?.db ??
    db.mongo?.db ??
    (typeof db.client?.db === 'function' ? db.client.db() : undefined)
  if (mongoDb && typeof mongoDb.stats === 'function') {
    try {
      const stats = await mongoDb.stats()
      const bytes =
        toNumber(stats?.storageSize) ?? toNumber(stats?.dataSize) ?? toNumber(stats?.indexSize)
      if (bytes !== null) {
        return { type: 'MongoDB', bytes }
      }
    } catch {}
  }

  const libSqlClient = db.drizzle?.$client
  if (libSqlClient && typeof libSqlClient.execute === 'function') {
    try {
      const pageCountResult = await libSqlClient.execute('PRAGMA page_count;')
      const pageSizeResult = await libSqlClient.execute('PRAGMA page_size;')
      const pageCount = extractFirstNumericValue(pageCountResult?.rows?.[0])
      const pageSize = extractFirstNumericValue(pageSizeResult?.rows?.[0])
      if (pageCount !== null && pageSize !== null) {
        return { type: 'SQLite', bytes: pageCount * pageSize }
      }
    } catch {}
  }

  return null
}

export const storageGet: PayloadHandler = async (req) => {
  if (!req.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const projectPath =
    typeof process.env.PAYLOAD_STORAGE_PATH === 'string' && process.env.PAYLOAD_STORAGE_PATH.trim()
      ? process.env.PAYLOAD_STORAGE_PATH
      : typeof process.env.ROOT_DIR === 'string' && process.env.ROOT_DIR.trim()
        ? process.env.ROOT_DIR
        : process.cwd()

  const query = (req as { query?: Record<string, unknown> }).query
  let debugFlag = parseQueryFlag(query?.debug)
  let debugLimit = Number(query?.debugLimit ?? 25)

  if (!debugFlag && typeof req.url === 'string') {
    try {
      const url = new URL(req.url, 'http://localhost')
      debugFlag = parseQueryFlag(url.searchParams.get('debug'))
      const limitParam = url.searchParams.get('debugLimit')
      if (limitParam) {
        debugLimit = Number(limitParam)
      }
    } catch {}
  }

  if (!Number.isFinite(debugLimit)) {
    debugLimit = 25
  }
  debugLimit = Math.max(1, Math.min(200, Math.floor(debugLimit)))

  const configCollections = req.payload?.config?.collections || []
  const uploadCollections = configCollections.filter(
    (collection) =>
      Boolean(collection?.upload) &&
      !isEntityHidden({
        hidden: collection?.admin?.hidden,
        user: req.user,
      }),
  )

  const palette = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#22d3ee']
  const slices: StorageSlice[] = []
  const debugCollections: Array<{
    collection: string
    label: string
    files: Array<{
      id: string
      filename: string | null
      filesize: string | number | null
      sizes: Record<string, number | string | null> | null
      totalBytes: number
      totalMB: number
    }>
  }> = []
  const maxDocs = 10000
  const pageSize = 200
  let usedBytesTotal = 0

  for (const collection of uploadCollections) {
    if (!collection?.slug) continue

    let page = 1
    let hasNext = true
    let processed = 0
    let bytes = 0

    const debugFiles: Array<{
      id: string
      filename: string | null
      filesize: string | number | null
      sizes: Record<string, number | string | null> | null
      totalBytes: number
      totalMB: number
    }> = []

    while (hasNext && processed < maxDocs) {
      const result = await req.payload.find({
        collection: collection.slug,
        page,
        limit: pageSize,
        depth: 0,
        req,
      })

      for (const doc of result.docs || []) {
        if (!doc || typeof doc !== 'object') {
          continue
        }
        const record = doc as Record<string, unknown>
        const totalBytes = sumUploadDocBytes(record)
        bytes += totalBytes
        processed += 1
        if (processed >= maxDocs) {
          break
        }

        if (debugFlag && debugFiles.length < debugLimit) {
          const id = String(record.id ?? record._id ?? `${collection.slug}-${processed}`)
          const filename =
            typeof record.filename === 'string'
              ? record.filename
              : typeof record.fileName === 'string'
                ? record.fileName
                : null
          const filesize = getDebugValue(record.filesize ?? record.fileSize ?? record.size)
          const sizes = extractSizesDebug(record.sizes)
          debugFiles.push({
            id,
            filename,
            filesize,
            sizes,
            totalBytes,
            totalMB: Number(bytesToMB(totalBytes).toFixed(2)),
          })
        }
      }

      if (!result.hasNextPage || processed >= maxDocs) {
        hasNext = false
      } else {
        page += 1
      }
    }

    const label =
      typeof collection?.labels?.plural === 'string'
        ? collection.labels.plural
        : typeof collection?.labels?.singular === 'string'
          ? collection.labels.singular
          : collection.slug

    const color = palette[slices.length % palette.length]

    slices.push({
      id: collection.slug,
      label,
      usedGB: Number(bytesToGB(bytes).toFixed(2)),
      color,
    })

    usedBytesTotal += bytes

    if (debugFlag) {
      debugCollections.push({
        collection: collection.slug,
        label,
        files: debugFiles,
      })
    }
  }

  const dbInfo = await getDatabaseUsage(req.payload)
  const diskResult = await getDiskUsage(projectPath)
  const diskInfo = diskResult.disk
  if (dbInfo?.bytes !== null && dbInfo?.bytes !== undefined) {
    slices.push({
      id: 'database',
      label: `Database (${dbInfo.type})`,
      usedGB: Number(bytesToGB(dbInfo.bytes).toFixed(2)),
      color: '#10b981',
    })
    usedBytesTotal += dbInfo.bytes
  }

  const usedGBRaw = bytesToGB(usedBytesTotal)
  const usedGB = Number(usedGBRaw.toFixed(2))
  const envTotal = Number(process.env.PAYLOAD_STORAGE_TOTAL_GB)
  const diskFreeGBRaw =
    diskInfo && Number.isFinite(diskInfo.freeBytes) ? bytesToGB(diskInfo.freeBytes) : null

  const totalGBRaw =
    diskFreeGBRaw !== null
      ? usedGBRaw + diskFreeGBRaw
      : Number.isFinite(envTotal) && envTotal > 0
        ? envTotal
        : Math.max(usedGBRaw, 1)

  const totalGB = Number(totalGBRaw.toFixed(2))
  const usedPercent = totalGBRaw > 0 ? Math.min(100, Math.round((usedGBRaw / totalGBRaw) * 100)) : 0

  return jsonResponse({
    totalGB,
    usedGB,
    usedPercent,
    slices,
    database: dbInfo,
    disk: diskInfo,
    debug: debugFlag
      ? {
          collections: debugCollections,
          diskError: diskResult.error,
          diskPath: projectPath,
        }
      : undefined,
  })
}
