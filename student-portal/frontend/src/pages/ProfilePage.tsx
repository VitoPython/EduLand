import { useAuth } from '../utils/auth';
import Layout from '../components/layout/Layout';
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { student } = useAuth();
  
  if (!student) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Не удалось загрузить данные профиля
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Профиль студента</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Информация профиля */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <UserIcon className="h-6 w-6 mr-2 text-primary-600" />
                Личная информация
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Имя пользователя</label>
                  <p className="text-gray-800 font-medium">{student.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Имя</label>
                  <p className="text-gray-800 font-medium">{student.first_name || '—'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Фамилия</label>
                  <p className="text-gray-800 font-medium">{student.last_name || '—'}</p>
                </div>
              </div>
            </div>
            
            {/* Контактная информация */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <EnvelopeIcon className="h-6 w-6 mr-2 text-primary-600" />
                Контактная информация
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-800 font-medium">{student.email || '—'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Информация о курсах */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Записанные курсы</h2>
            
            {student.course_ids && student.course_ids.length > 0 ? (
              <p className="text-gray-800">Вы записаны на {student.course_ids.length} курс(ов)</p>
            ) : (
              <p className="text-gray-600">Вы не записаны ни на один курс</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 