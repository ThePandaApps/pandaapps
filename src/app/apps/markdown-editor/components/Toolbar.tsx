"use client";

import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  Quote, Code, FileCode, Link, ImageIcon, List, ListOrdered,
  Table, Minus, Edit3, Columns, Eye,
} from "lucide-react";

export type ViewMode = "edit" | "split" | "preview";
export type ToolbarAction =
  | "bold" | "italic" | "strike"
  | "h1" | "h2" | "h3"
  | "quote" | "code" | "codeblock"
  | "link" | "image"
  | "ul" | "ol"
  | "table" | "hr";

interface ToolbarButton {
  action: ToolbarAction;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface ToolbarGroup {
  buttons: ToolbarButton[];
}

const GROUPS: ToolbarGroup[] = [
  {
    buttons: [
      { action: "bold",   icon: Bold,          label: "Bold"          },
      { action: "italic", icon: Italic,        label: "Italic"        },
      { action: "strike", icon: Strikethrough, label: "Strikethrough" },
    ],
  },
  {
    buttons: [
      { action: "h1", icon: Heading1, label: "Heading 1" },
      { action: "h2", icon: Heading2, label: "Heading 2" },
      { action: "h3", icon: Heading3, label: "Heading 3" },
    ],
  },
  {
    buttons: [
      { action: "quote",     icon: Quote,    label: "Blockquote"  },
      { action: "code",      icon: Code,     label: "Inline Code" },
      { action: "codeblock", icon: FileCode, label: "Code Block"  },
    ],
  },
  {
    buttons: [
      { action: "link",  icon: Link,      label: "Link"  },
      { action: "image", icon: ImageIcon, label: "Image" },
    ],
  },
  {
    buttons: [
      { action: "ul", icon: List,         label: "Bullet List"  },
      { action: "ol", icon: ListOrdered,  label: "Ordered List" },
    ],
  },
  {
    buttons: [
      { action: "table", icon: Table, label: "Table" },
      { action: "hr",    icon: Minus, label: "Divider" },
    ],
  },
];

const VIEW_BUTTONS: { mode: ViewMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { mode: "edit",    icon: Edit3,   label: "Edit"    },
  { mode: "split",   icon: Columns, label: "Split"   },
  { mode: "preview", icon: Eye,     label: "Preview" },
];

interface Props {
  onAction: (action: ToolbarAction) => void;
  viewMode: ViewMode;
  onViewMode: (mode: ViewMode) => void;
}

export default function Toolbar({ onAction, viewMode, onViewMode }: Props) {
  return (
    <div className="flex items-center gap-1 flex-wrap border-b border-border/30 bg-card/30 px-3 py-2">
      {/* Formatting groups */}
      <div className="flex items-center gap-0.5 flex-wrap flex-1">
        {GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {group.buttons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.action}
                  onClick={() => onAction(btn.action)}
                  title={btn.label}
                  className="rounded-md p-1.5 text-muted hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
            {gi < GROUPS.length - 1 && (
              <div className="mx-1 h-4 w-px bg-border/40" />
            )}
          </div>
        ))}
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/40 bg-card/20 p-0.5">
        {VIEW_BUTTONS.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewMode(mode)}
            title={label}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === mode
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
