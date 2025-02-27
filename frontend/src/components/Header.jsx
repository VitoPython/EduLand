import { useAuth, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import logo from '../assets/logo.svg'; // Добавьте свой логотип в assets

const Header = () => {
    const { userId, user, isLoaded } = useAuth();

    // Ждем загрузку данных пользователя
    if (!isLoaded) {
        return null;
    }

    return (
        <header className="bg-white shadow-md">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Логотип */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/">
                                <img
                                    className="h-8 w-auto"
                                    src={logo}
                                    alt="Logo"
                                />
                            </Link>
                        </div>

                        {/* Основное меню */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Home
                            </Link>
                            {userId && (  // Показываем только авторизованным пользователям
                                <Link
                                    to="/students"
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Students
                                </Link>
                            )}
                            <Link
                                to="/courses"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Courses
                            </Link>
                            <Link
                                to="/groups"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Groups
                            </Link>
                        </div>
                    </div>

                    {/* Правая часть навбара */}
                    <div className="flex items-center">
                        {userId && isLoaded ? (
                            <div className="flex items-center space-x-4">
                                {user && (  // Проверяем наличие user
                                    <div className="text-sm text-gray-700">
                                        {user.firstName} {user.lastName}
                                    </div>
                                )}
                                <Link
                                    to="/profile"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Profile
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        ) : (
                            <Link
                                to="/sign-in"
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header; 