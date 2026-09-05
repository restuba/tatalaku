"use client";

import { useMemo } from "react";
import type { Workspace, User } from "@tatalaku/shared";

export interface CanMutateResult {
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  isOwner: boolean;
  isMember: boolean;
}

/**
 * Hook to check mutation permissions for a given workspace and user.
 */
export function useCanMutate(
  workspace: Workspace | null | undefined,
  user: User | null | undefined,
): CanMutateResult {
  return useMemo(() => {
    if (!workspace || !user) {
      return {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        isOwner: false,
        isMember: false,
      };
    }

    const isOwner = workspace.ownerId === user.id;
    const isMember = isOwner || (workspace.memberIds ?? []).includes(user.id);

    return {
      canEdit: isMember,
      canDelete: isOwner,
      canInvite: isOwner,
      isOwner,
      isMember,
    };
  }, [workspace, user]);
}

export default useCanMutate;
