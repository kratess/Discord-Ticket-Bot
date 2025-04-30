export function formatMessage(template: string, data: Record<string, string>): string {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => data[key] || "");
}
