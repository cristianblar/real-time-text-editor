import {
  Bold,
  Code,
  CornerDownLeft,
  Italic,
  List,
  ListOrdered,
  Minus,
  Printer,
  Redo,
  RemoveFormatting,
  SquareTerminal,
  Strikethrough,
  TextQuote,
  Undo,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import type { FC, ReactNode } from "react";
import { Separator } from "@/web/components/ui/separator";
import ToolbarButton from "./toolbar-button";
import HeadingSelector from "./heading-selector";

function withEditor(
  editor: Editor | null,
  Component: FC<{ className?: string; editor?: Editor | null }> | null,
) {
  return Component ? () => <Component editor={editor} /> : null;
}

interface TextEditorToolbarProps {
  editor: Editor | null;
}

export default function TextEditorToolbar({ editor }: TextEditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    [
      {
        icon: Undo,
        onClick: () => editor.chain().focus().undo().run(),
        label: "Undo",
      },
      {
        icon: Redo,
        onClick: () => editor.chain().focus().redo().run(),
        label: "Redo",
      },
      {
        icon: Printer,
        onClick: () => window.print(),
        label: "Print",
      },
    ],
    [
      {
        icon: withEditor(editor, HeadingSelector),
        label: "Heading",
      },
      {
        icon: Minus,
        onClick: () => editor.chain().focus().setHorizontalRule().run(),
        label: "Horizontal Rule",
      },
      {
        icon: CornerDownLeft,
        onClick: () => editor.chain().focus().setHardBreak().run(),
        label: "Line Break",
      },
    ],
    [
      {
        icon: Bold,
        isActive: editor.isActive("bold"),
        onClick: () => editor.chain().focus().toggleBold().run(),
        label: "Bold",
      },
      {
        icon: Italic,
        isActive: editor.isActive("italic"),
        onClick: () => editor.chain().focus().toggleItalic().run(),
        label: "Italic",
      },
      {
        icon: Strikethrough,
        isActive: editor.isActive("strike"),
        onClick: () => editor.chain().focus().toggleStrike().run(),
        label: "Strikethrough",
      },
      {
        icon: Code,
        onClick: () => editor.chain().focus().toggleCode().run(),
        label: "Code",
      },
    ],
    [
      {
        icon: List,
        onClick: () => editor.chain().focus().toggleBulletList().run(),
        label: "List",
      },
      {
        icon: ListOrdered,
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        label: "Numbered List",
      },
      {
        icon: TextQuote,
        onClick: () => editor.chain().focus().toggleBlockquote().run(),
        label: "Quote",
      },
      {
        icon: SquareTerminal,
        onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        label: "Code Block",
      },
    ],
    [
      {
        icon: RemoveFormatting,
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
        label: "Remove Formatting",
      },
    ],
  ];

  return (
    <div className="bg-[#f9fbfd] fixed overflow-x-auto px-2 py-4 top-[80px] w-full print:hidden">
      <div className="bg-[#f0f4f9] flex gap-x-1 items-center h-10 mx-auto overflow-x-auto px-4 py-2 rounded-3xl w-fit">
        {toolbarButtons.reduce((acc: ReactNode, section, idx, outterArr) => {
          if (acc && Array.isArray(acc)) {
            section.forEach((btn, index) => {
              acc.push(
                <ToolbarButton
                  key={`text-editor-toolbar-button-${btn.label}-${index}`}
                  {...btn}
                />,
              );
            });

            if (idx !== outterArr.length - 1) {
              acc.push(
                <Separator
                  key={`text-editor-toolbar-separator-${idx}`}
                  orientation="vertical"
                />,
              );
            }
          }

          return acc;
        }, [])}
      </div>
    </div>
  );
}
