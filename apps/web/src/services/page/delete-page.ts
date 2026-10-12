import { fetcher } from "@/helpers/fetcher";

/** Permanently deletes a page and all its descendants. Irreversible. */
export async function deletePagePermanently(id: string): Promise<void> {
  await fetcher<void>({
    url: `/pages/${id}/permanent`,
    method: "DELETE",
  });
}

export default deletePagePermanently;
