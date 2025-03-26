import PropTypes from 'prop-types';

const StudentProgress = ({ progress }) => {
    return (
        <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="text-xs text-gray-500 mt-1">
                {progress}% completed
            </div>
        </div>
    );
};

StudentProgress.propTypes = {
    progress: PropTypes.number.isRequired
};

export default StudentProgress; 