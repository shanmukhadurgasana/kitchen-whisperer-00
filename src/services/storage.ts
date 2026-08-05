import { supabase } from "@/integrations/supabase/client";

const SIGNED_URL_TTL = 60 * 60; // 1 hour

/** Resolves a storage path (`<bucket>/<path>`) to a temporary signed URL. */
export async function resolveImageUrl(stored: string | null): Promise<string | null> {
  if (!stored) return null;
  if (stored.startsWith("http")) return stored;

  const [bucket, ...rest] = stored.split("/");
  const path = rest.join("/");
  if (!bucket || !path) return null;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
  if (error) return null;
  return data.signedUrl;
}

export async function uploadImage(
  bucket: "recipe-images" | "avatars",
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  return `${bucket}/${path}`;
}

export async function removeImage(stored: string | null) {
  if (!stored || stored.startsWith("http")) return;
  const [bucket, ...rest] = stored.split("/");
  if (!bucket) return;
  await supabase.storage.from(bucket).remove([rest.join("/")]);
}
