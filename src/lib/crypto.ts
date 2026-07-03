import crypto from "crypto";
// App-layer encryption for sensitive payloads (interview transcripts, personal notes).
// AES-256-GCM with a key derived from NEXTAUTH_SECRET. For true E2E, swap in a
// client-held key (WebCrypto) and store only ciphertext server-side.
const key = crypto.createHash("sha256").update(process.env.NEXTAUTH_SECRET ?? "dev").digest();

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64");
}
export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12), tag = buf.subarray(12, 28), data = buf.subarray(28);
  const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString("utf8");
}
