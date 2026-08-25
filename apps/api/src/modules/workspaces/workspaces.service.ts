// Workspaces service: all business logic including membership/ownership authorization.
// Never rely solely on middleware to check authorization — always verify in service layer.
export class WorkspacesService {
  // TODO: implement getWorkspacesForUser(), createWorkspace(),
  //       getWorkspaceById(), updateWorkspace(), deleteWorkspace()
}

export const workspacesService = new WorkspacesService();
