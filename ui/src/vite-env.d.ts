/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*.less' {
  const resource: {[key: string]: string};
  export = resource;
}
