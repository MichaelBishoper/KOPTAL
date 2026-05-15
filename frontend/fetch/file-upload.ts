type UploadResponse = {
  url?: string;
  error?: string;
  message?: string;
};

export async function uploadImageFileOnAPI(
  file: File,
  entityType: string,
  entityId: number,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity_type", entityType);
  formData.append("entity_id", String(entityId));

  const res = await fetch("/api/fileupload/upload", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as UploadResponse;
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? data.message ?? "Image upload failed");
  }

  return data.url;
}
