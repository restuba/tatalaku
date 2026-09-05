import { fetcher } from "@/helpers/fetcher";
import type { Page } from "@tatalaku/shared";

export interface RestorePageResponse {
  success: boolean;
  data: Page;
}

export async function restorePage(id: string): Promise<RestorePageResponse> {
  return fetcher<RestorePageResponse>({
    url: `/pages/${id}/restore`,
    method: "POST",
  });
}

export default restorePage;
