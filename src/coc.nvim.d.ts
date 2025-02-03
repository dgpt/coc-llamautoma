import type { ExtensionContext, Window, Workspace, Commands } from './types'

declare module 'coc.nvim' {
  export { ExtensionContext, Window, Workspace, Commands }
  export const workspace: Workspace
  export const window: Window
  export const commands: Commands
}
