import api from "@/lib/axios";

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

  try {
    const res = await api.post<UploadResponse>("/api/fileupload/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = res.data;
    if (!data.url) {
      throw new Error(data.error ?? data.message ?? "Image upload failed");
    }

    // Transform absolute file-service URL (http://localhost:3002/files/123)
    // to a relative Next.js proxy path (/api/fileupload/files/123).
    const match = data.url.match(/\/files\/(.+)$/);
    if (match) return `/api/fileupload/files/${match[1]}`;

    return data.url;
  } catch (err: any) {
    const data = err.response?.data as UploadResponse | undefined;
    throw new Error(data?.error ?? data?.message ?? "Image upload failed");
  }
}
