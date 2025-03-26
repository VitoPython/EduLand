import { create } from "zustand";
import { gradesApi } from "../services/api";

const useGradesStore = create((set) => ({
  grades: {},
  loading: false,
  error: null,

  fetchGrades: async (assignments) => {
    if (!assignments?.length) return;
    
    set({ loading: true, error: null });
    try {
      const gradesData = {};
      for (const assignment of assignments) {
        const assignmentId = assignment.id || assignment._id;
        if (!assignmentId) continue;

        try {
          const response = await gradesApi.fetchGradesByAssignment(assignmentId);
          if (response?.data) {
            gradesData[assignmentId] = {};
            if (Array.isArray(response.data)) {
              response.data.forEach((grade) => {
                if (grade && grade.student_id) {
                  gradesData[assignmentId][grade.student_id] = grade;
                }
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching grades for assignment ${assignmentId}:`, err);
        }
      }
      set({ grades: gradesData, loading: false });
    } catch (error) {
      console.error('Error in fetchGrades:', error);
      set({ error: error.message || 'Failed to fetch grades', loading: false });
    }
  },

  updateGrade: async (assignmentId, studentId, grade) => {
    if (!assignmentId || !studentId) {
      console.error('Missing required parameters:', { assignmentId, studentId });
      return;
    }

    try {
      const gradeData = {
        assignment_id: assignmentId,
        student_id: studentId,
        grade: grade,
        date: new Date().toISOString().split('T')[0], // Текущая дата в формате YYYY-MM-DD
        status: 'completed'
      };

      const state = useGradesStore.getState();
      const existingGrade = state.grades[assignmentId]?.[studentId];

      let updatedGrade;
      if (existingGrade) {
        updatedGrade = await gradesApi.updateGrade(existingGrade.id, {
          ...gradeData,
          id: existingGrade.id
        });
      } else {
        updatedGrade = await gradesApi.createGrade(gradeData);
      }

      // Обновляем состояние после успешного создания/обновления
      if (updatedGrade?.data) {
        const newGrades = { ...state.grades };
        if (!newGrades[assignmentId]) {
          newGrades[assignmentId] = {};
        }
        newGrades[assignmentId][studentId] = updatedGrade.data;
        set({ grades: newGrades });
      }
    } catch (error) {
      console.error('Error in updateGrade:', error);
      set({ error: error.message || 'Failed to update grade' });
    }
  },

  setMaxGrade: async (assignmentId, students) => {
    if (!assignmentId || !students?.length) return;

    const state = useGradesStore.getState();
    try {
      for (const student of students) {
        const studentId = student.id || student.student_id;
        if (studentId) {
          await state.updateGrade(assignmentId, studentId, 10);
        }
      }
    } catch (error) {
      console.error('Error in setMaxGrade:', error);
      set({ error: error.message || 'Failed to set max grades' });
    }
  },

  setMinGrade: async (assignmentId, students) => {
    if (!assignmentId || !students?.length) return;

    const state = useGradesStore.getState();
    try {
      for (const student of students) {
        const studentId = student.id || student.student_id;
        if (studentId) {
          await state.updateGrade(assignmentId, studentId, 0);
        }
      }
    } catch (error) {
      console.error('Error in setMinGrade:', error);
      set({ error: error.message || 'Failed to set min grades' });
    }
  },
}));

export default useGradesStore; 