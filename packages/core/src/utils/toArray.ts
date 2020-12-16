export default function toArray(val: any) {
  if (Array.isArray(val)) {
    return val
  }
  return [val]
}
