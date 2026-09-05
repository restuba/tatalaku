import { fetcher } from "@/helpers/fetcher";
import type { Page } from "@tatalaku/shared";

export interface CreatePagePayload {
  workspaceId: string;
  parentPageId?: string | null | undefined;
  title?: string | undefined;
  icon?: string | null | undefined;
}

export interface CreatePageResponse {
  success: boolean;
  data: Page;
}

export async function createPage(body: CreatePagePayload): Promise<CreatePageResponse> {
  return fetcher<CreatePageResponse>({
    url: "/pages",
    method: "POST",
    body,
  });
}

export default createPage;
