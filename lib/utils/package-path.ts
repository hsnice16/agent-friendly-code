export const PACKAGE_PATH = "/package";

// A scoped npm name holds a slash, which unencoded would be two path segments.
export function packagePath(registry: string, name: string): string {
  return `${PACKAGE_PATH}/${registry}/${encodeURIComponent(name)}`;
}
