import { Editor } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/web/components/ui/select";

const headingOptions = [
  { value: "paragraph", label: "Normal text", fontSize: "0.83rem" },
  { value: "h1", label: "Title", fontSize: "1.5rem" },
  { value: "h2", label: "Subtitle", fontSize: "1.17rem" },
  { value: "h3", label: "Heading 3", fontSize: "1rem" },
  { value: "h4", label: "Heading 4", fontSize: "0.85rem" },
  { value: "h5", label: "Heading 5", fontSize: "0.7rem" },
  { value: "h6", label: "Heading 6", fontSize: "0.6rem" },
];

interface HeadingDropdownProps {
  editor?: Editor | null;
}

export default function HeadingSelector({ editor }: HeadingDropdownProps) {
  if (!editor) {
    return null;
  }

  const currentHeading = headingOptions.find((option) =>
    option.value === "paragraph"
      ? editor.isActive("paragraph")
      : editor.isActive("heading", { level: parseInt(option.value.charAt(1)) }),
  );

  const setHeading = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({
          level: parseInt(value.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6,
        })
        .run();
    }
  };

  return (
    <Select onValueChange={setHeading} value={currentHeading?.value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select heading" />
      </SelectTrigger>
      <SelectContent>
        {headingOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span style={{ fontSize: option.fontSize }}>{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
