
const Colors = {
  darkGreen: "#2e4a2d",
  gold: "#f7b731",
};

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-4 px-6 md:px-12 border-b border-gray-100">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-xl font-bold" style={{ color: Colors.darkGreen }}>
          PhotoBook
        </div>

        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#" className="text-gray-700 font-semibold" style={{ color: Colors.darkGreen }}>Home</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Photographers</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Book Session</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Equipment</a>
        </nav>

        <div className="flex items-center space-x-4">
          <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Login</a>
          <button
            className="px-4 py-2 text-sm font-semibold rounded transition duration-200"
            style={{ backgroundColor: Colors.gold, color: Colors.darkGreen }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
