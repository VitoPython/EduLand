import { useState, useEffect } from 'react';
import { 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useGradesStore } from '../stores/gradesStore';
import PropTypes from 'prop-types';

const GradesPanel = ({ groupId, students }) => {
    const { grades, loading, error, fetchGrades, updateGrade } = useGradesStore();
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        if (groupId) {
            fetchGrades(groupId);
        }
    }, [groupId, fetchGrades]);

    const handleGradeChange = async (studentId, value) => {
        if (selectedAssignment) {
            await updateGrade(groupId, studentId, selectedAssignment, value);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <Alert severity="error" className="m-4">
                {error}
            </Alert>
        );
    }

    return (
        <Paper className="mt-4 p-4">
            <h3 className="text-xl font-semibold mb-4">Grades</h3>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell align="center">Grade</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.student_id}>
                                <TableCell>
                                    {student.first_name} {student.last_name}
                                </TableCell>
                                <TableCell align="center">
                                    {selectedAssignment && grades[student.student_id]?.[selectedAssignment] || '-'}
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex justify-end space-x-2">
                                        <Tooltip title="Set Maximum Grade (10)">
                                            <IconButton
                                                onClick={() => handleGradeChange(student.student_id, 10)}
                                                size="small"
                                            >
                                                <Star />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Set Minimum Grade (0)">
                                            <IconButton
                                                onClick={() => handleGradeChange(student.student_id, 0)}
                                                size="small"
                                            >
                                                <StarBorder />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

GradesPanel.propTypes = {
    groupId: PropTypes.string.isRequired,
    students: PropTypes.arrayOf(PropTypes.shape({
        student_id: PropTypes.string.isRequired,
        first_name: PropTypes.string.isRequired,
        last_name: PropTypes.string.isRequired
    })).isRequired
};

export default GradesPanel; 