import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/auth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import LessonsPage from './pages/LessonsPage';
import LessonAssignments from './pages/LessonAssignments';
import AssignmentView from './components/assignments/AssignmentView';
import { ProtectedRoute } from './utils/auth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
          <Route path="/courses/:courseId/lessons" element={<ProtectedRoute><LessonsPage /></ProtectedRoute>} />
          <Route path="/lessons/:lessonId/assignments" element={<ProtectedRoute><LessonAssignments /></ProtectedRoute>} />
          <Route path="/assignments/:assignmentId" element={<ProtectedRoute><AssignmentView /></ProtectedRoute>} />
          <Route path="*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
