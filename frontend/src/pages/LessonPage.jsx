import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import LessonGrades from '../components/Grades/LessonGrades';
import api from '../api/api';

const LessonPage = () => {
  const { lessonId, groupId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [students, setStudents] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [lessonResponse, studentsResponse] = await Promise.all([
          api.get(`/lessons/${lessonId}`),
          api.get(`/groups/${groupId}/students`)
        ]);
        setLesson(lessonResponse.data);
        setStudents(studentsResponse.data);
      } catch (error) {
        console.error('Error loading lesson data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && groupId) {
      loadData();
    }
  }, [lessonId, groupId]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleBack = () => {
    navigate(`/groups/${groupId}`);
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (!lesson) {
    return <Typography>Урок не найден</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body1"
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={handleBack}
        >
          ← Вернуться к группе
        </Typography>
      </Box>

      <Typography variant="h4" gutterBottom>
        {lesson.title}
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Содержание урока" />
          <Tab label="Оценки" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && (
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          )}
          
          {currentTab === 1 && (
            <LessonGrades
              lessonId={lessonId}
              groupId={groupId}
              students={students}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LessonPage; 