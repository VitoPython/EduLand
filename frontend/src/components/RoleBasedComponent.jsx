import { useUserStore } from '../stores';

/**
 * Компонент для условного отображения содержимого в зависимости от роли пользователя
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое, которое будет отображено при соответствии роли
 * @param {boolean} props.adminOnly - Если true, содержимое будет показано только для администраторов
 * @param {boolean} props.staffOnly - Если true, содержимое будет показано только для персонала
 * @param {boolean} props.fallback - Компонент для отображения, если условие не выполняется (необязательно)
 */
const RoleBasedComponent = ({ children, adminOnly = false, staffOnly = false, fallback = null }) => {
  const { isAdmin, userRole } = useUserStore();

  // Если требуется роль admin и пользователь не админ, не показываем ничего
  if (adminOnly && !isAdmin) {
    return fallback;
  }

  // Если требуется роль staff и у пользователя другая роль, не показываем ничего
  if (staffOnly && userRole !== 'staff') {
    return fallback;
  }

  // Во всех остальных случаях показываем содержимое
  return children;
};

export default RoleBasedComponent; 