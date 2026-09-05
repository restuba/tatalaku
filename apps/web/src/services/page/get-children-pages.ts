import { fetcher } from "@/helpers/fetcher";
import type { Page } from "@tatalaku/shared";

export interface GetChildrenPagesResponse {
  success: boolean;
  data: Page[];
}

export async function getChildrenPages(pageId: string): Promise<GetChildrenPagesResponse> {
  return fetcher<GetChildrenPagesResponse>({
    url: `/pages/${pageId}/children`,
    method: "GET",
  });
}

export default getChildrenPages;
