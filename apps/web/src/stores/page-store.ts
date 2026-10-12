"use client";

import { create } from "zustand";
import type { Page } from "@tatalaku/shared";
import { getListPages } from "@/services/page/get-list-pages";
import { createPage } from "@/services/page/create-page";
import { updatePage } from "@/services/page/update-page";
import { archivePage } from "@/services/page/archive-page";
import { restorePage } from "@/services/page/restore-page";
import { deletePagePermanently } from "@/services/page/delete-page";
import { reorderPages } from "@/services/page/reorder-pages";
import type { JSONContent } from "@tiptap/core";

interface PageState {
  pages: Page[];
  expandedPageIds: string[];
  isLoading: boolean;
  isInitialized: boolean;
  archivedPages: Page[];
}

interface PageActions {
  fetchPages: (workspaceId: string) => Promise<Page[]>;
  createPage: (input: {
    workspaceId: string;
    parentPageId?: string | null;
    title?: string;
    icon?: string | null;
  }) => Promise<Page>;
  updatePage: (
    id: string,
    input: {
      title?: string;
      icon?: string | null;
      coverImage?: string | null;
      parentPageId?: string | null;
      isArchived?: boolean;
      isFavorite?: boolean;
      isFullWidth?: boolean;
    },
  ) => Promise<Page>;
  /** Creates a page pre-filled with editor content (e.g. from a Markdown import). */
  importPage: (input: {
    workspaceId: string;
    parentPageId?: string | null;
    title: string;
    content: JSONContent;
  }) => Promise<Page>;
  archivePage: (id: string) => Promise<void>;
  restorePage: (id: string) => Promise<void>;
  /** Permanently removes an archived page from Trash. Irreversible. */
  deletePagePermanently: (id: string) => Promise<void>;
  /** Reorders (and optionally reparents) a set of sibling pages. */
  reorderPages: (
    workspaceId: string,
    parentPageId: string | null,
    orderedIds: string[],
  ) => Promise<void>;
  toggleExpand: (pageId: string) => void;
  setExpanded: (pageId: string, expanded: boolean) => void;
  fetchArchivedPages: (workspaceId: string) => Promise<Page[]>;
}

export const usePageStore = create<PageState & PageActions>((set, get) => ({
  pages: [],
  expandedPageIds: [],
  isLoading: false,
  isInitialized: false,
  archivedPages: [],

  fetchPages: async (workspaceId: string) => {
    set({ isLoading: true });
    try {
      const res = await getListPages({ workspaceId });
      const pages = res.data;
      set({ pages, isLoading: false, isInitialized: true });
      return pages;
    } catch (err) {
      set({ isLoading: false, isInitialized: true });
      throw err;
    }
  },

  toggleExpand: (pageId: string) => {
    set((state) => {
      const isExpanded = state.expandedPageIds.includes(pageId);
      return {
        expandedPageIds: isExpanded
          ? state.expandedPageIds.filter((id) => id !== pageId)
          : [...state.expandedPageIds, pageId],
      };
    });
  },

  setExpanded: (pageId: string, expanded: boolean) => {
    set((state) => {
      const isExpanded = state.expandedPageIds.includes(pageId);
      if (expanded && !isExpanded) {
        return { expandedPageIds: [...state.expandedPageIds, pageId] };
      }
      if (!expanded && isExpanded) {
        return { expandedPageIds: state.expandedPageIds.filter((id) => id !== pageId) };
      }
      return state;
    });
  },

  createPage: async (input) => {
    // Generate temporary ID for optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticPage: Page = {
      id: tempId,
      workspaceId: input.workspaceId,
      parentPageId: input.parentPageId ?? null,
      title: input.title ?? "Untitled",
      icon: input.icon ?? null,
      coverImage: null,
      content: null,
      createdBy: "current-user",
      order: Number.MAX_SAFE_INTEGER, // optimistically append to the end
      isArchived: false,
      isFavorite: false,
      isFullWidth: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically add page and auto-expand parent if nested
    set((state) => ({
      pages: [...state.pages, optimisticPage],
      expandedPageIds: input.parentPageId
        ? Array.from(new Set([...state.expandedPageIds, input.parentPageId]))
        : state.expandedPageIds,
    }));

    try {
      const res = await createPage(input);
      const createdPage = res.data;

      // Replace optimistic page with actual server page
      set((state) => ({
        pages: state.pages.map((p) => (p.id === tempId ? createdPage : p)),
      }));

      return createdPage;
    } catch (err) {
      // Rollback on failure
      set((state) => ({
        pages: state.pages.filter((p) => p.id !== tempId),
      }));
      throw err;
    }
  },

  importPage: async ({ content, ...createInput }) => {
    const created = await get().createPage(createInput);

    try {
      const res = await updatePage(created.id, { content: JSON.stringify(content) });
      const importedPage = res.data;
      set((state) => ({
        pages: state.pages.map((p) => (p.id === created.id ? importedPage : p)),
      }));
      return importedPage;
    } catch (err) {
      // Don't leave an empty page behind: soft-delete it and drop it from the tree
      set((state) => ({ pages: state.pages.filter((p) => p.id !== created.id) }));
      await archivePage(created.id).catch(() => undefined);
      throw err;
    }
  },

  updatePage: async (id, input) => {
    const previousPages = get().pages;

    // Optimistic update
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? { ...p, ...input } : p)),
    }));

    try {
      const res = await updatePage(id, input);
      const updatedPage = res.data;

      set((state) => ({
        pages: state.pages.map((p) => (p.id === id ? updatedPage : p)),
      }));

      return updatedPage;
    } catch (err) {
      // Rollback
      set({ pages: previousPages });
      throw err;
    }
  },

  archivePage: async (id: string) => {
    const previousPages = get().pages;
    const previousArchived = get().archivedPages;

    // Optimistically remove page and its children
    const getDescendantIds = (parentId: string, allPages: Page[]): string[] => {
      const children = allPages.filter((p) => p.parentPageId === parentId);
      return [parentId, ...children.flatMap((c) => getDescendantIds(c.id, allPages))];
    };

    const idsToRemove = new Set(getDescendantIds(id, previousPages));
    const archivedOnes = previousPages
      .filter((p) => idsToRemove.has(p.id))
      .map((p) => ({ ...p, isArchived: true }));

    set((state) => ({
      pages: state.pages.filter((p) => !idsToRemove.has(p.id)),
      archivedPages: [...state.archivedPages, ...archivedOnes],
    }));

    try {
      await archivePage(id);
    } catch (err) {
      // Rollback
      set({ pages: previousPages, archivedPages: previousArchived });
      throw err;
    }
  },

  restorePage: async (id: string) => {
    const previousPages = get().pages;
    const previousArchived = get().archivedPages;

    const pageToRestore = previousArchived.find((p) => p.id === id);
    if (!pageToRestore) return;

    // Optimistically update
    const updatedPage = { ...pageToRestore, isArchived: false };

    set((state) => ({
      archivedPages: state.archivedPages.filter((p) => p.id !== id),
      pages: [...state.pages, updatedPage],
    }));

    try {
      await restorePage(id);
    } catch (err) {
      // Rollback
      set({ pages: previousPages, archivedPages: previousArchived });
      throw err;
    }
  },

  reorderPages: async (workspaceId, parentPageId, orderedIds) => {
    const previousPages = get().pages;

    // Optimistically apply the new order + parent to the affected pages
    const orderById = new Map(orderedIds.map((id, index) => [id, index]));
    set((state) => ({
      pages: state.pages.map((p) =>
        orderById.has(p.id) ? { ...p, parentPageId, order: orderById.get(p.id)! } : p,
      ),
    }));

    try {
      await reorderPages({ workspaceId, parentPageId, orderedIds });
    } catch (err) {
      set({ pages: previousPages });
      throw err;
    }
  },

  deletePagePermanently: async (id: string) => {
    const previousArchived = get().archivedPages;

    // Optimistically remove the page (and any archived descendants) from Trash
    const descendantIds = new Set<string>();
    const collect = (parentId: string) => {
      descendantIds.add(parentId);
      previousArchived
        .filter((p) => p.parentPageId === parentId)
        .forEach((child) => collect(child.id));
    };
    collect(id);

    set((state) => ({
      archivedPages: state.archivedPages.filter((p) => !descendantIds.has(p.id)),
    }));

    try {
      await deletePagePermanently(id);
    } catch (err) {
      // Rollback
      set({ archivedPages: previousArchived });
      throw err;
    }
  },

  fetchArchivedPages: async (workspaceId: string) => {
    const res = await getListPages({ workspaceId, includeArchived: true });
    const archivedPages = res.data.filter((p) => p.isArchived);
    set({ archivedPages });
    return archivedPages;
  },
}));
