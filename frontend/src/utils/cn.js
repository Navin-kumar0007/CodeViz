/** Join truthy class strings. Tiny classnames helper for the UI library. */
export function cn(...args) {
  return args.filter(Boolean).join(' ');
}
export default cn;
