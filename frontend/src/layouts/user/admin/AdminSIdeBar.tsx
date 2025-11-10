
const AdminSidebar = () => {
  const primaryColor = '#4caf50'; 

  const navItems = [
    { icon: 'fas fa-chart-line', label: 'Dashboard', active: true },
    { icon: 'fas fa-users', label: 'Users' },
    { icon: 'fas fa-camera-retro', label: 'Photographers' },
    { icon: 'fas fa-calendar-check', label: 'Bookings' },
    { icon: 'fas fa-boxes', label: 'Rentals' },
    { icon: 'fas fa-comment-dots', label: 'Chat' },
    { icon: 'fas fa-wallet', label: 'Wallet' },
    { icon: 'fas fa-cogs', label: 'Settings' },
    { icon: 'fas fa-layer-group', label: 'Category' },
  ];

  return (
    <div className="w-56 h-screen p-4" style={{ backgroundColor: '#212121', color: 'rgba(255, 255, 255, 0.8)' }}>
      <div className="text-2xl font-bold mb-8 text-white">dashboard</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              item.active
                ? 'text-white font-semibold'
                : 'hover:bg-gray-700'
            }`}
            style={item.active ? { backgroundColor: primaryColor, color: 'white' } : {}}
          >
            <i className={`${item.icon} w-5`}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;