declare module 'hast-util-to-html' {
  import type { Root, Element } from 'hast'
  
  export interface Options {
    allowDangerousHtml?: boolean
    [key: string]: any
  }

  export function toHtml(tree: Root | Element, options?: Options): string
}
