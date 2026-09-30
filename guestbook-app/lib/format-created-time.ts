const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// "YYYY-MM-DD HH:mm" in Korea time, whatever the server's time zone.
export function formatCreatedTime(date: Date): string {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    formatter.formatToParts(date).find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}`;
}
