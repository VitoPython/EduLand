import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGroupStore } from '../stores/groupStore';
import PropTypes from 'prop-types';
import { 
    Paper, 
    Button, 
    CircularProgress,
    Alert,
    Divider,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import AddStudentModal from './AddStudentModal';
import StudentsList from './StudentsList';
import GradesPanel from './GradesPanel';
import SubmitsTable from './SubmitsTable';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const GroupDetail = () => {
    const { id } = useParams();
    const { currentGroup, fetchGroup } = useGroupStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    // Загрузка данных группы
    useEffect(() => {
        const loadGroup = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                setError(null);
                await fetchGroup(id);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadGroup();
    }, [id, fetchGroup]);

    // Обработчики модального окна
    const openAddModal = () => setShowAddModal(true);
    const closeAddModal = () => setShowAddModal(false);

    // Обработчик успешного добавления студента
    const handleStudentAdded = async () => {
        closeAddModal();
        try {
            await fetchGroup(id);
        } catch (err) {
            console.error('Error reloading group:', err);
        }
    };

    // Обработчик изменения вкладки
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Отображение загрузки
    if (loading && !currentGroup) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </div>
        );
    }

    // Отображение ошибки
    if (error) {
        return (
            <div className="p-6">
                <Alert severity="error">
                    {error}
                </Alert>
            </div>
        );
    }

    // Отображение отсутствия группы
    if (!currentGroup) {
        return (
            <div className="p-6">
                <Alert severity="info">
                    Group not found
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6">
            <Paper className="p-6">
                {/* Заголовок и кнопка добавления */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {currentGroup.name}
                    </h1>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={openAddModal}
                    >
                        Add Student
                    </Button>
                </div>

                {/* Информация о группе */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <p className="text-sm text-gray-600">Type: {currentGroup.type}</p>
                        <p className="text-sm text-gray-600">Language: {currentGroup.language}</p>
                        <p className="text-sm text-gray-600">Funnel: {currentGroup.funnel}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">
                            Students: {currentGroup.students_count} / {currentGroup.max_students}
                        </p>
                        <p className="text-sm text-gray-600">
                            Lessons completed: {currentGroup.lessons_completed} / {currentGroup.total_lessons}
                        </p>
                        <p className="text-sm text-gray-600">
                            Paid students: {currentGroup.paid_count}
                        </p>
                    </div>
                </div>

                <Divider className="my-6" />

                {/* Список студентов */}
                <StudentsList 
                    students={currentGroup.students} 
                    groupId={id} 
                />

                <Divider className="my-6" />

                {/* Вкладки для оценок и отправки заданий */}
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange}
                            aria-label="grades and submits tabs"
                        >
                            <Tab label="Grades" />
                            <Tab label="Submissions" />
                        </Tabs>
                    </Box>
                    <TabPanel value={tabValue} index={0}>
                        <GradesPanel 
                            groupId={id} 
                            students={currentGroup.students} 
                        />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <SubmitsTable
                            lessonId={currentGroup.current_lesson?._id}
                            assignments={currentGroup.current_lesson?.assignments || []}
                            students={currentGroup.students}
                        />
                    </TabPanel>
                </Box>
            </Paper>

            {/* Модальное окно добавления студента */}
            {showAddModal && (
                <AddStudentModal
                    groupId={id}
                    onClose={closeAddModal}
                    onSuccess={handleStudentAdded}
                />
            )}
        </div>
    );
};

export default GroupDetail; 