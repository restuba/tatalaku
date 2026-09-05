import { fetcher } from "@/helpers/fetcher";
import type { Page } from "@tatalaku/shared";

export interface ArchivePageResponse {
  success: boolean;
  data: Page;
}

export async function archivePage(id: string): Promise<ArchivePageResponse> {
  return fetcher<ArchivePageResponse>({
    url: `/pages/${id}`,
    method: "DELETE",
  });
}

export default archivePage;
