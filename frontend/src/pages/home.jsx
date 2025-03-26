import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-gray-50 text-gray-800">
      {/* Хедер */}
      <header className="flex flex-col md:flex-row items-center justify-between min-h-screen bg-gradient-to-br from-gray-800 via-blue-900 to-gray-900 px-4 sm:px-6 md:px-10 lg:px-16 text-white">
        <div className="max-w-full md:max-w-md text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 animate-[gradient_4s_ease_infinite] bg-gradient-to-r from-blue-300 via-gray-200 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent tracking-tight">
            CodeMaster School
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 animate-[fadeIn_1.5s_ease-in] text-gray-200">
          The future of programming starts here
          </p>
          <button className="px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg font-semibold rounded-full bg-gradient-to-r from-blue-600 to-gray-600 text-white hover:scale-105 transition-transform duration-300 animate-[pulse_1.8s_infinite] shadow-lg">
          Start the journey
          </button>
        </div>
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c" // Заменил первую картинку на рабочую
          alt="Программист за работой"
          className="w-full sm:w-3/4 md:w-1/2 lg:w-2/5 rounded-3xl shadow-xl animate-[slideInRight_1.2s_ease-out] border border-gray-700/50"
        />
      </header>

      {/* Секция преимуществ */}
      <section className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16 text-center bg-gray-100">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-10 bg-gradient-to-r from-blue-500 to-gray-300 bg-clip-text text-transparent animate-[fadeIn_1s_ease]">
          Your advantages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:-translate-y-2 transition-all duration-300 animate-[bounceIn_1s_ease] border border-gray-200/50">
            <i className="fas fa-laptop-code text-3xl sm:text-4xl text-blue-500 mb-3"></i>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Practice</h3>
            <p className="text-xs sm:text-sm text-gray-600">Code from the first day</p>
          </div>
          <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:-translate-y-2 transition-all duration-300 animate-[bounceIn_1.1s_ease] border border-gray-200/50">
            <i className="fas fa-users text-3xl sm:text-4xl text-blue-500 mb-3"></i>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Community</h3>
            <p className="text-xs sm:text-sm text-gray-600">Support 24/7</p>
          </div>
          <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:-translate-y-2 transition-all duration-300 animate-[bounceIn_1.2s_ease] border border-gray-200/50">
            <i className="fas fa-certificate text-3xl sm:text-4xl text-blue-500 mb-3"></i>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Certificates</h3>
            <p className="text-xs sm:text-sm text-gray-600">For a career</p>
          </div>
          <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:-translate-y-2 transition-all duration-300 animate-[bounceIn_1.3s_ease] border border-gray-200/50">
            <i className="fas fa-rocket text-3xl sm:text-4xl text-blue-500 mb-3"></i>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Career</h3>
                <p className="text-xs sm:text-sm text-gray-600">Work in IT</p>
          </div>
        </div>
      </section>

      {/* Секция курсов */}
      <section className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16 bg-gradient-to-b from-gray-50 to-blue-50">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-10 text-center bg-gradient-to-r from-blue-500 to-gray-300 bg-clip-text text-transparent animate-[fadeIn_1s_ease]">
          New generation courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 animate-[fadeInUp_1s_ease] border border-gray-200/50">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
              alt="Frontend development"
              className="w-full h-40 sm:h-48 object-cover"
            />
            <div className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1">Frontend</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">React and modern UI</p>
              <button className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Learn more
              </button>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 animate-[fadeInUp_1.1s_ease] border border-gray-200/50">
            <img
              src="https://images.unsplash.com/photo-1516116216624-53e697fedbea"
              alt="Backend development"
              className="w-full h-40 sm:h-48 object-cover"
            />
            <div className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1">Backend</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">Node.js and servers</p>
              <button className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Learn more
              </button>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 animate-[fadeInUp_1.2s_ease] border border-gray-200/50">
            <img
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485"
              alt="Data Science"
              className="w-full h-40 sm:h-48 object-cover"
            />
            <div className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1">Data Science</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">ML and analytics</p>
              <button className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Секция отзывов */}
      <section className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16 bg-gray-200">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-10 text-center bg-gradient-to-r from-blue-500 to-gray-300 bg-clip-text text-transparent animate-[fadeIn_1s_ease]">
          Student reviews
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md rounded-xl shadow-md animate-[slideInLeft_1s_ease] border border-gray-200/50">
            <p className="text-xs sm:text-sm text-gray-600 mb-3">&quot;React became my ticket to IT!&quot;</p>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                alt="Аватар студента"
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="text-sm font-semibold">Anna</span>
            </div>
          </div>
          <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md rounded-xl shadow-md animate-[slideInLeft_1.1s_ease] border border-gray-200/50">
            <p className="text-xs sm:text-sm text-gray-600 mb-3">&quot;The mentors are fire, the projects are top!&quot;</p>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
                alt="Аватар студента"
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="text-sm font-semibold">Igor</span>
            </div>
          </div>
          <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md rounded-xl shadow-md animate-[slideInLeft_1.2s_ease] border border-gray-200/50">
            <p className="text-xs sm:text-sm text-gray-600 mb-3">&quot;I&apos;ve been working in IT for 4 months!&quot;</p>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                alt="Аватар студента"
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="text-sm font-semibold">Maria</span>
            </div>
          </div>
        </div>
      </section>

      {/* Секция призыва к действию */}
      <section className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10 lg:px-16 text-center bg-gradient-to-br from-blue-900 to-gray-800 text-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 animate-[fadeIn_1s_ease] tracking-tight">
          Step into the future of IT
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 animate-[fadeIn_1.3s_ease] text-gray-300">
          Become part of the new era of technology
        </p>
        <button className="px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-semibold rounded-full bg-gradient-to-r from-blue-600 to-gray-600 hover:scale-105 transition-transform duration-300 animate-[pulse_1.8s_infinite] shadow-lg">
          Join the community
        </button>
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
          alt="Team at work"
          className="mt-6 sm:mt-8 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 mx-auto rounded-3xl shadow-xl animate-[slideInUp_1.5s_ease] border border-gray-700/50"
        />
      </section>

      {/* Футер */}
      <footer className="py-6 sm:py-8 text-center bg-gray-900 text-white">
        <p className="text-sm sm:text-base animate-[gradient_4s_ease_infinite] bg-gradient-to-r from-blue-300 via-gray-200 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent">
                CodeMaster School © 2025
        </p>
      </footer>
    </div>
  );
};

export default Home;