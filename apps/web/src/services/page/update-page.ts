import { fetcher } from "@/helpers/fetcher";
import type { Page } from "@tatalaku/shared";

export interface UpdatePagePayload {
  title?: string | undefined;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  parentPageId?: string | null | undefined;
  content?: string | null | undefined;
  isArchived?: boolean | undefined;
}

export interface UpdatePageResponse {
  success: boolean;
  data: Page;
}

export async function updatePage(id: string, body: UpdatePagePayload): Promise<UpdatePageResponse> {
  return fetcher<UpdatePageResponse>({
    url: `/pages/${id}`,
    method: "PATCH",
    body,
  });
}

export default updatePage;
