import Image from "next/image";
import Link from "next/link";
import { DocumentPermission } from "@repo/types";
import { Button } from "@/web/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";
import { SaveStatus } from "@/web/hooks/useDebouncedSave";
import { Cloud, CloudOff, LogOut } from "lucide-react";
import { useLogout } from "../hooks/useLogout";
import { InviteUserDialog } from "./invite-user-dialog";
import { UserDropdown } from "./user-dropdown";

type NavbarProps =
  | {
      mode: "documents";
    }
  | {
      mode: "document";
      documentId: string;
      invitedUsers?: { email: string; permission: DocumentPermission }[];
      ownerEmail: string;
      saveStatus: SaveStatus;
      refetchDocument: VoidFunction;
    };

export function Navbar(props: NavbarProps) {
  const { handleLogout, isPending } = useLogout();
  const { mode } = props;
  const isDocumentPage = mode === "document";

  return (
    <nav className="bg-gray-100 fixed flex h-20 items-center justify-between p-4 overflow-x-auto w-full print:hidden">
      <div className="flex items-center space-x-4">
        {isDocumentPage ? (
          <>
            <Link href="/documents">
              <Image
                priority
                src="/logo.svg"
                alt="Logo"
                width={32}
                height={32}
              />
            </Link>
            <span className="text-base font-semibold">
              {props.ownerEmail} document
            </span>
            {props.saveStatus >= 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {props.saveStatus === SaveStatus.IDLE ? (
                      <Cloud />
                    ) : props.saveStatus === SaveStatus.SAVING ? (
                      <Cloud className="animate-spin" />
                    ) : (
                      <CloudOff />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {props.saveStatus === SaveStatus.IDLE
                      ? "All changes were saved"
                      : props.saveStatus === SaveStatus.SAVING
                        ? "Changes are being saved"
                        : "The latest changes have not been saved"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        ) : (
          <Image priority src="/logo.svg" alt="Logo" width={32} height={32} />
        )}
      </div>
      <div className="flex items-center space-x-4">
        {isDocumentPage && props.invitedUsers && (
          <>
            <UserDropdown
              documentId={props.documentId}
              users={props.invitedUsers}
              refetchDocument={props.refetchDocument}
            />

            <InviteUserDialog
              documentId={props.documentId}
              refetchDocument={props.refetchDocument}
            />
          </>
        )}
        <form onSubmit={handleLogout}>
          <Button
            disabled={isPending}
            title="Log out"
            type="submit"
            variant="ghost"
            size="icon"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </form>
      </div>
    </nav>
  );
}
