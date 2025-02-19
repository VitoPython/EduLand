import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import PropTypes from 'prop-types';

const AssignmentEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            CodeBlock.configure({
                HTMLAttributes: {
                    class: 'bg-gray-800 rounded-md p-4 font-mono text-sm text-gray-200',
                },
            }),
            Placeholder.configure({
                placeholder: 'Press "/" for commands...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const items = [
        {
            title: "Text",
            icon: "Aa",
            command: () => editor.chain().focus().setParagraph().run(),
        },
        {
            title: "Heading 1",
            icon: "H1",
            command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
            title: "Heading 2",
            icon: "H2",
            command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            title: "Bullet List",
            icon: "•",
            command: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            title: "Numbered List",
            icon: "1.",
            command: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            title: "Code Block",
            icon: "</>",
            command: () => editor.chain().focus().toggleCodeBlock().run(),
        },
    ];

    return (
        <div className="min-h-[300px] border rounded-lg overflow-hidden bg-white">
            <div className="border-b border-gray-200 p-2">
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <button
                            key={item.title}
                            type="button"
                            onClick={() => item.command()}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-2 transition-colors"
                        >
                            <span className={item.icon === "Aa" ? "text-lg" : "font-mono"}>
                                {item.icon}
                            </span>
                            <span>{item.title}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-4 prose max-w-none min-h-[200px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

AssignmentEditor.propTypes = {
    content: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default AssignmentEditor; 