import { isEntityHidden, type PayloadHandler } from 'payload'

type FieldLike = {
  name?: unknown
  type?: string
  fields?: unknown
  tabs?: Array<{ fields?: unknown }>
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })

const collectFieldNames = (fields: unknown, prefix = ''): string[] => {
  if (!Array.isArray(fields)) return []

  const names: string[] = []

  for (const field of fields) {
    if (!field || typeof field !== 'object') {
      continue
    }

    const fieldLike = field as FieldLike

    if (fieldLike.type === 'tabs' && Array.isArray(fieldLike.tabs)) {
      for (const tab of fieldLike.tabs) {
        names.push(...collectFieldNames(tab?.fields, prefix))
      }
      continue
    }

    if (
      fieldLike.type === 'group' ||
      fieldLike.type === 'row' ||
      fieldLike.type === 'collapsible'
    ) {
      const nextPrefix =
        typeof fieldLike.name === 'string' ? `${prefix}${fieldLike.name}.` : prefix
      names.push(...collectFieldNames(fieldLike.fields, nextPrefix))
      continue
    }

    if (typeof fieldLike.name === 'string') {
      names.push(`${prefix}${fieldLike.name}`)
    }
  }

  return names
}

export const collectionsGet: PayloadHandler = async (req) => {
  if (!req.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const collections = (req.payload?.config?.collections || [])
    .filter(
      (collection) =>
        !isEntityHidden({
          hidden: collection?.admin?.hidden,
          user: req.user,
        }),
    )
    .map((collection) => {
      const label =
        typeof collection?.labels?.singular === 'string'
          ? collection.labels.singular
          : typeof collection?.labels?.plural === 'string'
            ? collection.labels.plural
            : collection?.slug

      const hidden =
        typeof collection?.admin?.hidden === 'boolean'
          ? collection.admin.hidden
          : null

      const fieldNames = collectFieldNames(collection?.fields)

      return {
        slug: collection?.slug,
        label,
        fields: fieldNames,
        hidden,
      }
    })

  return jsonResponse({
    total: collections.length,
    collections,
  })
}
