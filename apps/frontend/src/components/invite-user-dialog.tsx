import { UserPlus } from "lucide-react";
import { useState, FormEvent } from "react";
import { DocumentPermission } from "@repo/types";
import { Alert, AlertDescription } from "@/web/components/ui/alert";
import { Button } from "@/web/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/web/components/ui/dialog";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/web/components/ui/select";
import { useInviteUser } from "@/web/hooks/useInviteUser";

interface InviteUserDialogProps {
  documentId: string;
  refetchDocument: VoidFunction;
}

export function InviteUserDialog({
  documentId,
  refetchDocument,
}: InviteUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { inviteUser, isLoading: isInvitingUser } = useInviteUser();

  const handleInviteUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.currentTarget).entries(),
    );
    const email = formData.email as string;
    const role = formData.role as DocumentPermission;

    try {
      setError(null);
      await inviteUser({ documentId, email, permission: role });
      refetchDocument();
      setIsOpen(false);
    } catch (error) {
      setError(
        "It was not possible to invite the user, please verify that the email is correct and try again",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button title="Invite user" type="button" variant="ghost" size="icon">
          <UserPlus className="mr-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user to collaborate</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to invite to
            collaborate on this document (the user must be already registered).
          </DialogDescription>
        </DialogHeader>
        <form id="invite-user-dialog-form" onSubmit={handleInviteUser}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <Select defaultValue="CAN_VIEW" name="role">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select heading" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAN_VIEW">Viewer</SelectItem>
                    <SelectItem value="CAN_EDIT">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            disabled={isInvitingUser}
            form="invite-user-dialog-form"
            type="submit"
          >
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
