function iso(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("start and end must be valid ISO timestamps");
  return date;
}

function googleDate(date) { return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"); }

export function createCalendarLinks({ title, start, end, location = "", details = "", email = "" }) {
  const startDate = iso(start); const endDate = iso(end);
  if (endDate <= startDate) throw new Error("end must be after start");
  const google = new URL("https://calendar.google.com/calendar/render");
  google.search = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${googleDate(startDate)}/${googleDate(endDate)}`, details, location, add: email }).toString();
  const outlook = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  outlook.search = new URLSearchParams({ subject: title, startdt: startDate.toISOString(), enddt: endDate.toISOString(), body: details, location, to: email }).toString();
  return { google: google.toString(), outlook: outlook.toString() };
}

