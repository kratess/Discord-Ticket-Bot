export function log(msg: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Ticket]: ${msg}`);
}

export function formatMessage(
  template: string,
  data: Record<string, string>
): string {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => data[key] || "");
}
