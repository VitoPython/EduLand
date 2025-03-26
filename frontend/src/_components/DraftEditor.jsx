import { useState, useCallback } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, AtomicBlockUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Определяем доступные цвета
const COLORS = [
    { label: 'Красный', style: 'red' },
    { label: 'Зеленый', style: 'green' },
    { label: 'Синий', style: 'blue' },
    { label: 'Желтый', style: 'yellow' },
    { label: 'Черный', style: 'black' }
];

// Стили для цветов
const colorStyleMap = {
    red: { color: '#FF0000' },
    green: { color: '#00FF00' },
    blue: { color: '#0000FF' },
    yellow: { color: '#FFFF00' },
    black: { color: '#000000' }
};

// Доступные языки программирования
const CODE_LANGUAGES = [
    { label: 'Python', value: 'python' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' }
];

const DraftEditor = ({ initialContent, onChange }) => {
    const [editorState, setEditorState] = useState(() => {
        if (initialContent) {
            try {
                const contentState = convertFromRaw(JSON.parse(initialContent));
                return EditorState.createWithContent(contentState);
            } catch {
                return EditorState.createEmpty();
            }
        }
        return EditorState.createEmpty();
    });

    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlValue, setUrlValue] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [codeValue, setCodeValue] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('python');

    const handleEditorChange = useCallback((newEditorState) => {
        setEditorState(newEditorState);
        if (onChange) {
            const contentState = newEditorState.getCurrentContent();
            const rawContent = JSON.stringify(convertToRaw(contentState));
            onChange(rawContent);
        }
    }, [onChange]);

    const handleKeyCommand = useCallback((command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            handleEditorChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }, [handleEditorChange]);

    const toggleInlineStyle = useCallback((style) => {
        handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
    }, [editorState, handleEditorChange]);

    const toggleBlockType = useCallback((blockType) => {
        handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
    }, [editorState, handleEditorChange]);

    const addImage = useCallback((e) => {
        e.preventDefault();
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'IMAGE',
            'IMMUTABLE',
            { src: urlValue }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
            editorState,
            { currentContent: contentStateWithEntity }
        );
        handleEditorChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
        setShowUrlInput(false);
        setUrlValue('');
    }, [editorState, urlValue, handleEditorChange]);

    const addCode = useCallback((e) => {
        e.preventDefault();
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'CODE',
            'IMMUTABLE',
            { code: codeValue, language: selectedLanguage }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
            editorState,
            { currentContent: contentStateWithEntity }
        );
        handleEditorChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
        setShowCodeInput(false);
        setCodeValue('');
    }, [editorState, codeValue, selectedLanguage, handleEditorChange]);

    const blockRenderer = (block) => {
        if (block.getType() === 'atomic') {
            const contentState = editorState.getCurrentContent();
            const entity = contentState.getEntity(block.getEntityAt(0));
            const type = entity.getType();
            
            if (type === 'IMAGE') {
                return {
                    component: Media,
                    editable: false,
                };
            } else if (type === 'CODE') {
                return {
                    component: CodeBlock,
                    editable: false,
                };
            }
        }
        return null;
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-white">
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={() => toggleInlineStyle('BOLD')}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    <strong>B</strong>
                </button>
                <button
                    onClick={() => toggleInlineStyle('ITALIC')}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    <em>I</em>
                </button>
                <button
                    onClick={() => toggleInlineStyle('UNDERLINE')}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    <u>U</u>
                </button>
                <button
                    onClick={() => toggleBlockType('header-one')}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    H1
                </button>
                <button
                    onClick={() => toggleBlockType('header-two')}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    H2
                </button>
                <button
                    onClick={() => toggleBlockType('unordered-list-item')}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    • List
                </button>
                <button
                    onClick={() => toggleBlockType('ordered-list-item')}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    1. List
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                {COLORS.map((color) => (
                    <button
                        key={color.style}
                        onClick={() => toggleInlineStyle(color.style)}
                        className="p-2 rounded hover:bg-gray-100"
                        style={{ color: colorStyleMap[color.style].color }}
                    >
                        A
                    </button>
                ))}
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <button
                    onClick={() => setShowCodeInput(true)}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    &lt;/&gt;
                </button>
                <button
                    onClick={() => setShowUrlInput(true)}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    🖼️
                </button>
            </div>
            {showUrlInput && (
                <div className="mb-4 flex gap-2">
                    <input
                        type="text"
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                        placeholder="Введите URL изображения..."
                    />
                    <button
                        onClick={addImage}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Добавить
                    </button>
                    <button
                        onClick={() => setShowUrlInput(false)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Отмена
                    </button>
                </div>
            )}
            {showCodeInput && (
                <div className="mb-4 space-y-2">
                    <div className="flex gap-2">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded"
                        >
                            {CODE_LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={addCode}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Вставить код
                        </button>
                        <button
                            onClick={() => setShowCodeInput(false)}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                            Отмена
                        </button>
                    </div>
                    <textarea
                        value={codeValue}
                        onChange={(e) => setCodeValue(e.target.value)}
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded font-mono"
                        placeholder="Введите ваш код здесь..."
                    />
                </div>
            )}
            <div className="prose max-w-none">
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    handleKeyCommand={handleKeyCommand}
                    customStyleMap={colorStyleMap}
                    blockRendererFn={blockRenderer}
                    placeholder="Начните писать здесь..."
                />
            </div>
        </div>
    );
};

// Компонент для отображения медиа-контента
const Media = (props) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src } = entity.getData();
    const type = entity.getType();

    if (type === 'IMAGE') {
        return <img src={src} alt="" className="max-w-full h-auto" />;
    }
    return null;
};

// Компонент для отображения блоков кода
const CodeBlock = (props) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { code, language } = entity.getData();

    return (
        <div className="my-4">
            <SyntaxHighlighter
                language={language}
                style={docco}
                className="rounded-lg"
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

Media.propTypes = {
    block: PropTypes.object.isRequired,
    contentState: PropTypes.object.isRequired
};

CodeBlock.propTypes = {
    block: PropTypes.object.isRequired,
    contentState: PropTypes.object.isRequired
};

DraftEditor.propTypes = {
    initialContent: PropTypes.string,
    onChange: PropTypes.func
};

export default DraftEditor; 