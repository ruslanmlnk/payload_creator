import type { Access, CollectionConfig } from 'payload'

const isLoggedIn: Access = ({ req }) => Boolean(req.user)

const onlySelf: Access = ({ req }) => {
  if (!req.user) return false
  return {
    userID: {
      equals: String(req.user.id),
    },
  }
}

export const DashboardLayouts: CollectionConfig = {
  slug: 'dashboard-layouts',
  admin: {
    hidden: true,
    useAsTitle: 'userID',
  },
  access: {
    read: onlySelf,
    create: isLoggedIn,
    update: onlySelf,
    delete: onlySelf,
  },
  fields: [
    {
      name: 'userID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'layout',
      type: 'json',
      required: true,
    },
  ],
}
