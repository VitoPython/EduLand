import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';

const CodeEditor = ({ initialCode, onCodeChange }) => {
    const [code, setCode] = useState(initialCode);

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    const handleEditorChange = (value) => {
        setCode(value);
        onCodeChange(value);
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
                height="600px"
                defaultLanguage="python"
                theme="vs-light"
                value={code}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                }}
            />
            <div className="bg-gray-800 text-white p-4 h-32 overflow-auto">
                <div className="font-mono text-sm">
                    {/* Здесь будет вывод результатов выполнения кода */}
                    # And here you can see the result ||
                    #                                 V
                </div>
            </div>
        </div>
    );
};

CodeEditor.propTypes = {
    initialCode: PropTypes.string,
    onCodeChange: PropTypes.func.isRequired
};

CodeEditor.defaultProps = {
    initialCode: ''
};

export default CodeEditor; 