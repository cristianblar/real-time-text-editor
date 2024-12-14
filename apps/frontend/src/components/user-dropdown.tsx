"use client";

import { ChevronDown, Edit2, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { DocumentPermission } from "@repo/types";
import { Alert, AlertDescription } from "@/web/components/ui/alert";
import { Button } from "@/web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/web/components/ui/dropdown-menu";
import { useInviteUser } from "@/web/hooks/useInviteUser";
import { useRemoveUser } from "@/web/hooks/useRemoveUser";

interface UserDropdownProps {
  documentId: string;
  users: { email: string; permission: DocumentPermission }[];
  refetchDocument: VoidFunction;
}

export function UserDropdown({
  documentId,
  users,
  refetchDocument,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { inviteUser, isLoading: isInvitingUser } = useInviteUser();
  const { removeUser, isLoading: isRemovingUser } = useRemoveUser();

  const handleRoleUpdate = async (
    email: string,
    permission: DocumentPermission,
  ) => {
    setError(null);
    try {
      await inviteUser({ documentId, email, permission });
      refetchDocument();
    } catch (error) {
      setError("Failed to update user role, please try again");
    }
  };

  const handleUserRemove = async (email: string) => {
    setError(null);
    try {
      await removeUser({ documentId, email });
      refetchDocument();
    } catch (error) {
      setError("Failed to remove user, please try again");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Share... <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Invited Users</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {error && (
          <>
            <DropdownMenuItem disabled>
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {users.length !== 0 ? (
          users?.map((user) => (
            <DropdownMenuItem
              key={`invited-user-${user.email}-${user.permission}`}
            >
              <span className="flex-grow">{user.email}</span>
              <Button
                disabled={isInvitingUser || isRemovingUser}
                title="Change role"
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleRoleUpdate(
                    user.email,
                    user.permission === DocumentPermission.CAN_EDIT
                      ? DocumentPermission.CAN_VIEW
                      : DocumentPermission.CAN_EDIT,
                  )
                }
              >
                {user.permission === DocumentPermission.CAN_EDIT ? (
                  <Edit2 className="h-2 w-2" />
                ) : (
                  <Eye className="h-2 w-2" />
                )}
              </Button>
              <Button
                disabled={isInvitingUser || isRemovingUser}
                title="Remove user"
                variant="ghost"
                size="icon"
                onClick={() => handleUserRemove(user.email)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No invited users</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
