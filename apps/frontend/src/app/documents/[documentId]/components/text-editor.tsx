import { EditorContent, type Editor } from "@tiptap/react";

interface TextEditorProps {
  editor: Editor | null;
}

export default function TextEditor({ editor }: TextEditorProps) {
  return (
    <div className="bg-[#f9fbfd] max-w-full min-h-screen px-12 pb-6 w-full print:bg-white print:overflow-visible print:p-0">
      <EditorContent editor={editor} />
    </div>
  );
}
