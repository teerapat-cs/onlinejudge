/// <reference types="expo/types" />

declare module 'markdown-it' {
  class MarkdownIt {
    constructor(presetName?: string, options?: Record<string, unknown>);
    parse(src: string, env: unknown): unknown[];
  }
  export default MarkdownIt;
}

declare module 'markdown-it/lib/token' {
  interface Token {
    type: string;
    tag: string;
    attrs: [string, string][] | null;
    map: [number, number] | null;
    nesting: 1 | 0 | -1;
    level: number;
    children: Token[] | null;
    content: string;
    markup: string;
    info: string;
    meta: unknown;
    block: boolean;
    hidden: boolean;
  }
  export default Token;
}
