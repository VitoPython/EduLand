import { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';
import 'react-quill/dist/quill.snow.css';

// Конфигурация highlight.js
hljs.configure({
    languages: ['javascript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'php']
});

const AssignmentModal = ({ assignment, onClose, onSubmit }) => {
    const quillRef = useRef(null);
    const [formData, setFormData] = useState({
        id: assignment?.id || '',
        title: assignment?.title || '',
        description: assignment?.description || '',
        code_editor: assignment?.code_editor || ''
    });

    // Функция для обработки вставки изображений
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    // Создаем превью изображения
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection(true);
                        quill.insertEmbed(range.index, 'image', e.target.result);
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
            }
        };
    };

    const modules = useMemo(() => ({
        syntax: {
            highlight: text => hljs.highlightAuto(text).value
        },
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'align',
        'blockquote', 'code-block',
        'list', 'bullet',
        'link', 'image'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
    };

    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.root.setAttribute('spellcheck', 'false');
            
            // Отключаем автоматическое изменение размера
            editor.root.style.height = '300px';
            editor.root.style.minHeight = '300px';
            editor.root.style.maxHeight = '300px';
            editor.root.style.overflow = 'auto';
            
            // Отключаем авто-скролл
            editor.root.style.overflowY = 'auto';
            
            // Устанавливаем размер контейнера
            const container = editor.container;
            container.style.height = '350px';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
        }
    }, []);

    useEffect(() => {
        const highlights = document.querySelectorAll('pre.ql-syntax');
        highlights.forEach((block) => {
            hljs.highlightElement(block);
        });
    }, [formData.description]);

    // Добавляем стили для изображений
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .ql-editor img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1em 0;
            }
            .ql-editor p {
                margin-bottom: 1em;
            }
            .ql-snow .ql-tooltip {
                z-index: 100;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-8 border w-[95%] max-w-4xl shadow-2xl rounded-2xl bg-white mb-10">
                {/* Заголовок */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {assignment?.id ? 'Редактировать задание' : 'Добавить задание'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {assignment?.id ? 'Обновите детали задания ниже' : 'Заполните детали нового задания'}
                    </p>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title поле */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Название
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                            placeholder="Введите название задания..."
                            required
                        />
                    </div>

                    {/* Description поле с ReactQuill */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                            Описание
                        </label>
                        <div className="quill-container border border-gray-300 rounded-lg overflow-hidden">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                modules={modules}
                                formats={formats}
                                style={{ height: '300px' }}
                            />
                        </div>
                    </div>

                    {/* Initial Code поле */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Начальный код
                        </label>
                        <div className="relative">
                            <textarea
                                name="code_editor"
                                value={formData.code_editor}
                                onChange={handleChange}
                                rows={8}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 font-mono bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                                placeholder="# Напишите начальный код здесь..."
                            />
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-200 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {assignment?.id ? 'Сохранить изменения' : 'Добавить задание'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AssignmentModal.propTypes = {
    assignment: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        code_editor: PropTypes.string
    }),
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default AssignmentModal; 