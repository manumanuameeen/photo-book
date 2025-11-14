import Footer from "../../layouts/user/Footer";
import Header from "../../layouts/user/Header";

const categories = [
  { 
    icon: 'fas fa-ring', 
    title: 'Wedding', 
    subtitle: 'Capture your special day',
    bgImage: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  { 
    icon: 'fas fa-birthday-cake', 
    title: 'Birthday', 
    subtitle: 'Celebrate life moments',
    bgImage: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  { 
    icon: 'fas fa-briefcase', 
    title: 'Corporate', 
    subtitle: 'Professional photography',
    bgImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  { 
    icon: 'fas fa-mountain', 
    title: 'Outdoor', 
    subtitle: 'Nature & adventure shots',
    bgImage: 'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
];

const photographers = [
  { 
    name: 'Sarah Johnson', 
    role: 'Wedding Photographer', 
    rating: 4.9, 
    reviews: 214, 
    topPro: true,
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  { 
    name: 'Michael Chen', 
    role: 'Portrait Specialist', 
    rating: 4.8, 
    reviews: 305, 
    topPro: true,
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  { 
    name: 'Emma Davis', 
    role: 'Adventure & Nature', 
    rating: 4.7, 
    reviews: 188, 
    topPro: true,
    image: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
];

const stats = [
  { number: '500+', label: 'Professional Photographers' },
  { number: '20K+', label: 'Happy Clients' },
  { number: '4.9/5', label: 'Average Rating', accent: true },
];

const Colors = {
  darkGreen: '#2e4a2d',
  lightGreen: '#5c8c5c',
  gold: '#dfb51dff',
  bgCream: '#e5efe1',
};

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section with Background Photo */}
      <section className="relative py-24 px-4 overflow-hidden min-h-[500px] flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
           backgroundColor:Colors.darkGreen
          }}
        ></div>
        
        {/* Dark Green Overlay */}
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: Colors.darkGreen, opacity: 0.85 }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 bg-white max-w-4xl mx-auto p-8 md:p-12 rounded-xl shadow-2xl text-center">
          <h2 className="text-4xl font-light mb-2" style={{ color: Colors.darkGreen }}>
            Capture <span className="font-bold" style={{ color: Colors.gold }}>Perfect Moments</span>
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-sm">
            Connect with professional photographers for weddings, events, and special occasions. Premium quality, luxury service.
          </p>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            <select className="p-3 border border-gray-300 rounded-md flex-1 w-full text-gray-500 text-sm">
              <option>Event Type...</option>
            </select>
            <input 
              type="text" 
              placeholder="Location..." 
              className="p-3 border border-gray-300 rounded-md flex-1 w-full"
            />
            <input 
              type="text" 
              placeholder="Date/Time" 
              className="p-3 border border-gray-300 rounded-md flex-1 w-full text-gray-500"
            />
            <button 
              className="px-6 py-3 font-bold rounded-md flex-shrink-0 w-full md:w-auto flex items-center justify-center space-x-2 transition duration-200 hover:opacity-90"
              style={{ backgroundColor: Colors.gold, color: Colors.darkGreen }}
            >
              <i className="fas fa-search"></i>
              <span>Search</span>
            </button>
          </div>
        </div>
      </section>
  
      {/* Popular Categories Section with Video Background */}
      <section className="relative py-16 px-4 text-center overflow-hidden min-h-[500px]">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
      
          
          {/* Fallback background if video doesn't load */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)'
            }}
          ></div>
          
          {/* White/Light overlay for elegant wedding theme */}
          <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm"></div>
        </div>

        {/* Content on top of video */}
        <div className="relative z-10">
          <h3 className="text-3xl font-bold mb-4 drop-shadow-lg" style={{ color: Colors.darkGreen }}>
            Popular Categories
          </h3>
          <p className="text-gray-700 text-sm mb-8 max-w-2xl mx-auto drop-shadow-md font-medium">
            Discover the perfect photography service for your special moments
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.map((cat) => (
              <div 
                key={cat.title} 
                className="relative overflow-hidden rounded-xl shadow-2xl border-2 border-white transition-all duration-300 hover:shadow-2xl hover:scale-105 group cursor-pointer h-48"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${cat.bgImage})`
                  }}
                ></div>
                
                {/* Overlay for better text readability - Green tinted */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-800/80 to-green-700/60 group-hover:from-green-900/90 group-hover:via-green-800/70 transition-all duration-300"
                ></div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                  <div 
                    className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl shadow-lg"
                    style={{ backgroundColor: Colors.gold }}
                  >
                    <i className={cat.icon}></i>
                  </div>
                  <h4 className="font-bold text-lg mb-1 text-white">
                    {cat.title}
                  </h4>
                  <p className="text-white/90 text-sm">{cat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Photographers Section */}
      <section className="py-16 px-4 text-center bg-gray-50">
        <h3 className="text-3xl font-bold mb-4" style={{ color: Colors.darkGreen }}>
          Featured Photographers
        </h3>
        <p className="text-gray-600 text-sm mb-10 max-w-2xl mx-auto">
          Meet our top-rated professional photographers
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {photographers.map((p) => (
            <div 
              key={p.name} 
              className="bg-white p-6 rounded-lg shadow-md w-72 flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <div className="relative mb-4">
                <img 
                  src={p.image}
                  alt={p.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto"
                  style={{ border: `4px solid ${Colors.gold}` }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + p.name.replace(' ', '+') + '&size=200&background=random';
                  }}
                />
                {p.topPro && (
                  <span 
                    className="absolute top-0 -right-2 px-3 py-1 text-xs font-bold rounded-full shadow-lg"
                    style={{ backgroundColor: Colors.gold, color: Colors.darkGreen }}
                  >
                    TOP PRO
                  </span>
                )}
              </div>
              
              <h4 className="font-bold text-xl mb-1" style={{ color: Colors.darkGreen }}>
                {p.name}
              </h4>
              <p className="text-gray-500 text-sm mb-3">{p.role}</p>
              <div className="flex items-center text-sm font-semibold mb-4" style={{ color: Colors.lightGreen }}>
                <i className="fas fa-star mr-1"></i> {p.rating} <span className="text-gray-400 ml-1">({p.reviews} reviews)</span>
              </div>
              <button 
                className="px-8 py-2 font-semibold rounded-md text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg w-full"
                style={{ backgroundColor: Colors.lightGreen }}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 text-center bg-white">
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div 
                className="text-5xl font-extrabold mb-2" 
                style={{ color: stat.accent ? Colors.lightGreen : Colors.darkGreen }}
              >
                {stat.number}
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;