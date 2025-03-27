import { 
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Alert,
    Tooltip
} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import useGradesStore from "../stores/gradesStore";
import PropTypes from "prop-types";
import { useEffect } from "react";

const GradesPanel = ({ groupId, students }) => {
    const { 
        grades, 
        fetchGradesByGroup, 
        createGrade, 
        updateGrade, 
        error 
    } = useGradesStore();

    useEffect(() => {
        if (groupId) {
            fetchGradesByGroup(groupId);
        }
    }, [groupId, fetchGradesByGroup]);

    const handleGradeClick = async (studentId, assignmentId, currentGrade) => {
        try {
            const newGrade = currentGrade === 10 ? 0 : 10;
            const gradeData = {
                student_id: studentId,
                assignment_id: assignmentId,
                grade: newGrade
            };

            const existingGrade = grades.find(
                g => g.student_id === studentId && 
                    g.assignment_id === assignmentId
            );

            if (existingGrade) {
                await updateGrade(existingGrade._id, gradeData);
            } else {
                await createGrade(gradeData);
            }
        } catch (err) {
            console.error('Error updating grade:', err);
        }
    };

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!students || students.length === 0) {
        return <Alert severity="info">No students in this group</Alert>;
    }

    // Получаем все уникальные задания из оценок
    const assignments = [...new Set(grades.map(grade => grade.assignment_id))];

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Student</TableCell>
                        {assignments.map(assignmentId => (
                            <TableCell key={assignmentId} align="center">
                                Assignment {assignmentId}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.student_id}>
                            <TableCell component="th" scope="row">
                                {student.first_name} {student.last_name}
                            </TableCell>
                            {assignments.map(assignmentId => {
                                const grade = grades.find(
                                    g => g.student_id === student.student_id && 
                                        g.assignment_id === assignmentId
                                );
                                return (
                                    <TableCell key={assignmentId} align="center">
                                        <Tooltip title={grade ? `Grade: ${grade.grade}` : 'No grade'}>
                                            <IconButton
                                                onClick={() => handleGradeClick(
                                                    student.student_id,
                                                    assignmentId,
                                                    grade?.grade || 0
                                                )}
                                                size="small"
                                            >
                                                {grade?.grade === 10 ? <StarIcon /> : <StarBorderIcon />}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

GradesPanel.propTypes = {
    groupId: PropTypes.string.isRequired,
    students: PropTypes.arrayOf(
        PropTypes.shape({
            student_id: PropTypes.string.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default GradesPanel; 