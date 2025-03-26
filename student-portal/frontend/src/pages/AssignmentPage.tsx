import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { Assignment } from '../types';

const API_URL = 'http://localhost:8001';

const AssignmentPage = () => {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const response = await axios.get(`${API_URL}/assignments/${assignmentId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
                    }
                });
                setAssignment(response.data);
                setCode(response.data.code_editor || '');
            } catch (err) {
                setError('Не удалось загрузить задание');
                console.error('Error fetching assignment:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignment();
    }, [assignmentId]);

    const handleRunCode = () => {
        // Здесь будет логика запуска кода
        console.log('Running code:', code);
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen">Загрузка...</div>
            </Layout>
        );
    }

    if (error || !assignment) {
        return (
            <Layout>
                <div className="text-red-500 text-center p-4">{error || 'Задание не найдено'}</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link to={`/lessons/${assignment.lesson_id}/assignments`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
                        ← Back to Assignments
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Левая колонка - описание задания */}
                    <div className="lg:w-1/2">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-2xl font-bold">{assignment.title}</h1>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">Assignment {assignment.number}</p>
                                <div className="prose max-w-none mt-6">
                                    <div dangerouslySetInnerHTML={{ __html: assignment.description }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка - редактор кода */}
                    <div className="lg:w-1/2">
                        <div className="bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                                <h2 className="text-white text-lg font-semibold">Code Editor</h2>
                                <button
                                    onClick={handleRunCode}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Run Code
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="bg-[#2D2D2D] rounded-md">
                                    <textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full h-[500px] bg-transparent text-white font-mono p-4 focus:outline-none"
                                        spellCheck="false"
                                    />
                                </div>
                                <div className="mt-4 p-4 bg-[#2D2D2D] rounded-md text-gray-300">
                                    <p className="font-mono text-sm"># And here you can see the result || # V</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AssignmentPage; 