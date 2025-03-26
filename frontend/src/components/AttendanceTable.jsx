import { useState, useEffect } from 'react';
import { HiCheck, HiExclamation, HiX, HiMinus, HiAcademicCap, HiClock } from 'react-icons/hi';
import PropTypes from 'prop-types';
import api from '../api/api';

const AttendanceTable = ({ groupId, students, courseName, totalLessonsCount }) => {
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const totalLessons = totalLessonsCount > 0 ? totalLessonsCount : 0;

    const ATTENDANCE_STATUS = {
        UNASSIGNED: 'unassigned',
        PRESENT: 'present',
        NOTIFIED: 'notified',
        ABSENT: 'absent'
    };

    const statusColors = {
        [ATTENDANCE_STATUS.UNASSIGNED]: 'bg-white border-2 border-gray-200',
        [ATTENDANCE_STATUS.PRESENT]: 'bg-emerald-100 border-2 border-emerald-200',
        [ATTENDANCE_STATUS.NOTIFIED]: 'bg-amber-100 border-2 border-amber-200',
        [ATTENDANCE_STATUS.ABSENT]: 'bg-rose-100 border-2 border-rose-200'
    };

    const statusIcons = {
        [ATTENDANCE_STATUS.UNASSIGNED]: <HiMinus className="h-5 w-5 text-gray-400" />,
        [ATTENDANCE_STATUS.PRESENT]: <HiCheck className="h-5 w-5 text-emerald-600" />,
        [ATTENDANCE_STATUS.NOTIFIED]: <HiExclamation className="h-5 w-5 text-amber-600" />,
        [ATTENDANCE_STATUS.ABSENT]: <HiX className="h-5 w-5 text-rose-600" />
    };

    const statusLabels = {
        [ATTENDANCE_STATUS.UNASSIGNED]: 'Not assigned',
        [ATTENDANCE_STATUS.PRESENT]: 'Present',
        [ATTENDANCE_STATUS.NOTIFIED]: 'Notified',
        [ATTENDANCE_STATUS.ABSENT]: 'Absent'
    };

    console.log('Total lessons count in AttendanceTable:', totalLessonsCount);

    useEffect(() => {
        if (groupId) {
            fetchAttendance();
        }
    }, [groupId]);

    const fetchAttendance = async () => {
        console.log('Fetching attendance for group:', groupId);
        try {
            const response = await api.get(`/attendance/group/${groupId}`);
            console.log('Attendance data:', response.data);
            const attendanceMap = {};
            response.data.forEach(record => {
                const studentId = record.student_id || record._id;
                attendanceMap[studentId] = record.attendance;
            });
            setAttendance(attendanceMap);
            console.log('Updated attendance state:', attendanceMap);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (studentId, lessonNumber, currentStatus) => {
        console.log('Changing status for student:', studentId, 'lesson:', lessonNumber, 'current status:', currentStatus);
        const statusOrder = Object.values(ATTENDANCE_STATUS);
        const currentIndex = statusOrder.indexOf(currentStatus);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

        try {
            await api.post(`/attendance/${groupId}/record`, {
                student_id: studentId,
                group_id: groupId,
                lesson_number: lessonNumber,
                status: nextStatus,
                date: new Date().toISOString()
            });
            console.log('Status changed to:', nextStatus);
            await fetchAttendance();
        } catch (error) {
            console.error('Error updating attendance:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Attendance Record</h3>
                        {courseName && (
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                <HiAcademicCap className="mr-1 h-5 w-5" />
                                <span>Course: {courseName}</span>
                                <span className="mx-2">•</span>
                                <HiClock className="mr-1 h-5 w-5" />
                                <span>Total Lessons: {totalLessons}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Student
                                </th>
                                {[...Array(totalLessons)].map((_, i) => (
                                    <th
                                        key={i}
                                        scope="col"
                                        className="px-3 py-3 text-center text-sm font-semibold text-gray-900 bg-gray-50"
                                    >
                                        {i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {students.map(student => (
                                <tr key={student.student_id} className="hover:bg-gray-50">
                                    <td className="sticky left-0 z-10 bg-white whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {student.first_name} {student.last_name}
                                    </td>
                                    {[...Array(totalLessons)].map((_, i) => {
                                        const lessonRecord = attendance[student.student_id]?.find(
                                            a => a.lesson_number === i + 1
                                        );
                                        const status = lessonRecord?.status || ATTENDANCE_STATUS.UNASSIGNED;

                                        return (
                                            <td key={i} className="px-3 py-4 text-sm text-center">
                                                <button
                                                    onClick={() => handleStatusChange(student.student_id, i + 1, status)}
                                                    className={`
                                                        ${statusColors[status]}
                                                        inline-flex items-center justify-center
                                                        w-8 h-8 rounded-lg
                                                        transition-all duration-200
                                                        hover:scale-110 hover:shadow-md
                                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                                    `}
                                                >
                                                    {statusIcons[status]}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-end space-x-6 text-sm">
                    {Object.entries(ATTENDANCE_STATUS).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded ${statusColors[value]}`}></div>
                            <span className="text-gray-600">{statusLabels[value]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

AttendanceTable.propTypes = {
    groupId: PropTypes.string.isRequired,
    students: PropTypes.arrayOf(
        PropTypes.shape({
            student_id: PropTypes.string.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired
        })
    ).isRequired,
    courseName: PropTypes.string,
    totalLessonsCount: PropTypes.number
};

export default AttendanceTable; 