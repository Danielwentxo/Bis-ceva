/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AboutRouteImport } from './routes/about'
import { Route as AddRouteImport } from './routes/add'
import { Route as ArtistsRouteImport } from './routes/artists'
import { Route as ContactRouteImport } from './routes/contact'
import { Route as ForgotPasswordRouteImport } from './routes/forgot-password'
import { Route as LoginRouteImport } from './routes/login'
import { Route as PrivacyRouteImport } from './routes/privacy'
import { Route as ResetPasswordRouteImport } from './routes/reset-password'
import { Route as StatsRouteImport } from './routes/stats'
import { Route as TransferRouteImport } from './routes/transfer'
import { Route as VenuesRouteImport } from './routes/venues'
import { Route as ArtistsIndexRouteImport } from './routes/artists.index'
import { Route as ArtistsSlugRouteImport } from './routes/artists.$slug'
import { Route as ConcertsIdRouteImport } from './routes/concerts.$id'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AboutRoute = AboutRouteImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRouteImport,
} as any)
const AddRoute = AddRouteImport.update({
  id: '/add',
  path: '/add',
  getParentRoute: () => rootRouteImport,
} as any)
const ArtistsRoute = ArtistsRouteImport.update({
  id: '/artists',
  path: '/artists',
  getParentRoute: () => rootRouteImport,
} as any)
const ContactRoute = ContactRouteImport.update({
  id: '/contact',
  path: '/contact',
  getParentRoute: () => rootRouteImport,
} as any)
const ForgotPasswordRoute = ForgotPasswordRouteImport.update({
  id: '/forgot-password',
  path: '/forgot-password',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const PrivacyRoute = PrivacyRouteImport.update({
  id: '/privacy',
  path: '/privacy',
  getParentRoute: () => rootRouteImport,
} as any)
const ResetPasswordRoute = ResetPasswordRouteImport.update({
  id: '/reset-password',
  path: '/reset-password',
  getParentRoute: () => rootRouteImport,
} as any)
const StatsRoute = StatsRouteImport.update({
  id: '/stats',
  path: '/stats',
  getParentRoute: () => rootRouteImport,
} as any)
const TransferRoute = TransferRouteImport.update({
  id: '/transfer',
  path: '/transfer',
  getParentRoute: () => rootRouteImport,
} as any)
const VenuesRoute = VenuesRouteImport.update({
  id: '/venues',
  path: '/venues',
  getParentRoute: () => rootRouteImport,
} as any)
const ArtistsIndexRoute = ArtistsIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => ArtistsRoute,
} as any)
const ArtistsSlugRoute = ArtistsSlugRouteImport.update({
  id: '/$slug',
  path: '/$slug',
  getParentRoute: () => ArtistsRoute,
} as any)
const ConcertsIdRoute = ConcertsIdRouteImport.update({
  id: '/concerts/$id',
  path: '/concerts/$id',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/add': typeof AddRoute
  '/artists': typeof ArtistsRouteWithChildren
  '/contact': typeof ContactRoute
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/privacy': typeof PrivacyRoute
  '/reset-password': typeof ResetPasswordRoute
  '/stats': typeof StatsRoute
  '/transfer': typeof TransferRoute
  '/venues': typeof VenuesRoute
  '/artists/': typeof ArtistsIndexRoute
  '/artists/$slug': typeof ArtistsSlugRoute
  '/concerts/$id': typeof ConcertsIdRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/add': typeof AddRoute
  '/artists': typeof ArtistsIndexRoute
  '/contact': typeof ContactRoute
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/privacy': typeof PrivacyRoute
  '/reset-password': typeof ResetPasswordRoute
  '/stats': typeof StatsRoute
  '/transfer': typeof TransferRoute
  '/venues': typeof VenuesRoute
  '/artists/$slug': typeof ArtistsSlugRoute
  '/concerts/$id': typeof ConcertsIdRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/add': typeof AddRoute
  '/artists': typeof ArtistsRouteWithChildren
  '/contact': typeof ContactRoute
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/privacy': typeof PrivacyRoute
  '/reset-password': typeof ResetPasswordRoute
  '/stats': typeof StatsRoute
  '/transfer': typeof TransferRoute
  '/venues': typeof VenuesRoute
  '/artists/': typeof ArtistsIndexRoute
  '/artists/$slug': typeof ArtistsSlugRoute
  '/concerts/$id': typeof ConcertsIdRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/about'
    | '/add'
    | '/artists'
    | '/contact'
    | '/forgot-password'
    | '/login'
    | '/privacy'
    | '/reset-password'
    | '/stats'
    | '/transfer'
    | '/venues'
    | '/artists/'
    | '/artists/$slug'
    | '/concerts/$id'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/about'
    | '/add'
    | '/artists'
    | '/contact'
    | '/forgot-password'
    | '/login'
    | '/privacy'
    | '/reset-password'
    | '/stats'
    | '/transfer'
    | '/venues'
    | '/artists/$slug'
    | '/concerts/$id'
  id:
    | '__root__'
    | '/'
    | '/about'
    | '/add'
    | '/artists'
    | '/contact'
    | '/forgot-password'
    | '/login'
    | '/privacy'
    | '/reset-password'
    | '/stats'
    | '/transfer'
    | '/venues'
    | '/artists/'
    | '/artists/$slug'
    | '/concerts/$id'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AboutRoute: typeof AboutRoute
  AddRoute: typeof AddRoute
  ArtistsRoute: typeof ArtistsRouteWithChildren
  ContactRoute: typeof ContactRoute
  ForgotPasswordRoute: typeof ForgotPasswordRoute
  LoginRoute: typeof LoginRoute
  PrivacyRoute: typeof PrivacyRoute
  ResetPasswordRoute: typeof ResetPasswordRoute
  StatsRoute: typeof StatsRoute
  TransferRoute: typeof TransferRoute
  VenuesRoute: typeof VenuesRoute
  ConcertsIdRoute: typeof ConcertsIdRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/add': {
      id: '/add'
      path: '/add'
      fullPath: '/add'
      preLoaderRoute: typeof AddRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/artists': {
      id: '/artists'
      path: '/artists'
      fullPath: '/artists'
      preLoaderRoute: typeof ArtistsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/contact': {
      id: '/contact'
      path: '/contact'
      fullPath: '/contact'
      preLoaderRoute: typeof ContactRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/forgot-password': {
      id: '/forgot-password'
      path: '/forgot-password'
      fullPath: '/forgot-password'
      preLoaderRoute: typeof ForgotPasswordRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/privacy': {
      id: '/privacy'
      path: '/privacy'
      fullPath: '/privacy'
      preLoaderRoute: typeof PrivacyRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/reset-password': {
      id: '/reset-password'
      path: '/reset-password'
      fullPath: '/reset-password'
      preLoaderRoute: typeof ResetPasswordRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/stats': {
      id: '/stats'
      path: '/stats'
      fullPath: '/stats'
      preLoaderRoute: typeof StatsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/transfer': {
      id: '/transfer'
      path: '/transfer'
      fullPath: '/transfer'
      preLoaderRoute: typeof TransferRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/venues': {
      id: '/venues'
      path: '/venues'
      fullPath: '/venues'
      preLoaderRoute: typeof VenuesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/artists/': {
      id: '/artists/'
      path: '/'
      fullPath: '/artists/'
      preLoaderRoute: typeof ArtistsIndexRouteImport
      parentRoute: typeof ArtistsRoute
    }
    '/artists/$slug': {
      id: '/artists/$slug'
      path: '/$slug'
      fullPath: '/artists/$slug'
      preLoaderRoute: typeof ArtistsSlugRouteImport
      parentRoute: typeof ArtistsRoute
    }
    '/concerts/$id': {
      id: '/concerts/$id'
      path: '/concerts/$id'
      fullPath: '/concerts/$id'
      preLoaderRoute: typeof ConcertsIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

interface ArtistsRouteChildren {
  ArtistsIndexRoute: typeof ArtistsIndexRoute
  ArtistsSlugRoute: typeof ArtistsSlugRoute
}

const ArtistsRouteChildren: ArtistsRouteChildren = {
  ArtistsIndexRoute: ArtistsIndexRoute,
  ArtistsSlugRoute: ArtistsSlugRoute,
}

const ArtistsRouteWithChildren =
  ArtistsRoute._addFileChildren(ArtistsRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AboutRoute: AboutRoute,
  AddRoute: AddRoute,
  ArtistsRoute: ArtistsRouteWithChildren,
  ContactRoute: ContactRoute,
  ForgotPasswordRoute: ForgotPasswordRoute,
  LoginRoute: LoginRoute,
  PrivacyRoute: PrivacyRoute,
  ResetPasswordRoute: ResetPasswordRoute,
  StatsRoute: StatsRoute,
  TransferRoute: TransferRoute,
  VenuesRoute: VenuesRoute,
  ConcertsIdRoute: ConcertsIdRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
