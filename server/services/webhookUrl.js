import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function privateIpv4(value) {
  const octets = value.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19));
}

function privateIp(value) {
  const normalized = value.toLowerCase().replace(/^\[|\]$/g, "");
  if (isIP(normalized) === 4) return privateIpv4(normalized);
  if (isIP(normalized) === 6) return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:") || normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.");
  return true;
}

export async function validateWebhookUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value || ""));
  } catch {
    throw new Error("webhook URL must use a public https:// host");
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.hostname === "localhost") throw new Error("webhook URL must use a public https:// host");
  let addresses;
  try {
    addresses = await lookup(parsed.hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("webhook host could not be resolved");
  }
  if (!addresses.length || addresses.some(({ address }) => privateIp(address))) throw new Error("webhook host must resolve only to public IP addresses");
  return parsed.href;
}
