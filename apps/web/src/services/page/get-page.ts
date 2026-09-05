import { fetcher } from "@/helpers/fetcher";
import type { Page } from "@tatalaku/shared";

export interface GetPageResponse {
  success: boolean;
  data: Page;
}

export async function getPage(id: string): Promise<GetPageResponse> {
  return fetcher<GetPageResponse>({
    url: `/pages/${id}`,
    method: "GET",
  });
}

export default getPage;
