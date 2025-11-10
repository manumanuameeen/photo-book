

const AdminHeader = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center h-16 w-full">
      <div className="text-xl font-semibold text-gray-800">
        Dashboard Overview
      </div>
      
      <div className="flex items-center space-x-4">
        <p className="hidden sm:block text-gray-600 text-sm">Welcome back! Here's what's happening with your platform.</p>
        
        <div className="relative text-gray-500 hover:text-gray-700 cursor-pointer">
          <i className="fas fa-bell text-lg"></i>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>
        <div className="relative text-gray-500 hover:text-gray-700 cursor-pointer">
          <i className="fas fa-comment-alt text-lg"></i>
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
        </div>
        
        <div className="flex items-center space-x-2 border-l pl-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
            <i className="fas fa-user-circle text-2xl text-gray-600"></i>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;