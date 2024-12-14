import { FileQuestion, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";

export function DocumentNotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex items-center justify-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-center mt-4">Document Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            We couldn&apos;t find the document you&apos;re looking for. It may
            have been moved or deleted.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to my documents
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
