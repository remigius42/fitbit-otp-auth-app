/**
 * Minimal `URL` type stub for this project.
 *
 * `URL` is missing in TypeScript `lib` `es6`. Enabling it by adding `DOM` to
 * `lib` in `tsconfig.json` causes issues with the types provided by
 * `fitbit-sdk-types`.
 */
declare class URL {
  readonly href: string
  readonly protocol: string
  readonly searchParams: {
    get(key: string): string
  }
  constructor(urlString: string)
}
