import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';

const CodeEditor = ({ value = '', onChange, language = 'python', height = '600px', theme = 'vs-dark', options = {} }) => {
    const [code, setCode] = useState(value);

    // Обновляем код при изменении value prop
    useEffect(() => {
        setCode(value);
    }, [value]);

    const handleEditorChange = (newValue) => {
        setCode(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="h-full">
            <div className="flex items-center justify-between bg-gray-100 px-4 py-2">
                <div className="flex space-x-2">
                    <div className="text-sm text-gray-500">Solution</div>
                </div>
                <button
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                    onClick={() => {/* Добавить логику запуска кода */}}
                >
                    Run ▶
                </button>
            </div>
            <Editor
                height={height}
                defaultLanguage={language}
                theme={theme}
                value={code}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    ...options
                }}
            />
            <div className="bg-gray-800 text-white p-4 h-32 overflow-auto">
                <div className="font-mono text-sm">
                    # And here you can see the result ||
                    #                                 V
                </div>
            </div>
        </div>
    );
};

CodeEditor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    language: PropTypes.string,
    height: PropTypes.string,
    theme: PropTypes.string,
    options: PropTypes.object
};

export default CodeEditor; 