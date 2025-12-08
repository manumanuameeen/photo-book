import { motion } from 'framer-motion';
import { MouseFollower } from '../../../components/common/MouseFollower';
import { MagneticButton } from '../../../components/common/MagneticButton';
import { TiltCard } from '../../../components/common/TiltCard';

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

const HomePage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const titleText = "Capture Perfect Moments";
  const words = titleText.split(" ");

  return (
    <div className="min-h-screen bg-gray-50">
      <MouseFollower />
      {/* <Header /> */}

      {/* Hero Section with Background Photo */}
      <section className="relative py-24 px-4 overflow-hidden min-h-[500px] flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-gray-900"
        ></div>

        {/* Dark Green Overlay */}
        <div
          className="absolute inset-0 bg-green-900/85"
        ></div>

        {/* Content */}
        <motion.div
          className="relative z-10 bg-white max-w-4xl mx-auto p-8 md:p-12 rounded-xl shadow-2xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-2 text-4xl font-light text-green-900">
            {words.map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block mr-2 ${word === "Perfect" || word === "Moments" ? "font-bold" : ""}`}
                style={{ color: (word === "Perfect" || word === "Moments") ? '#d97706' : '#14532d' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.p
            className="text-gray-600 mb-8 max-w-2xl mx-auto text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Connect with professional photographers for weddings, events, and special occasions. Premium quality, luxury service.
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row gap-3 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.div className="flex-1 w-full" whileHover={{ scale: 1.02 }}>
              <select className="p-3 border border-gray-300 rounded-md w-full text-gray-500 text-sm focus:ring-2 focus:ring-yellow-500 transition-all">
                <option>Event Type...</option>
              </select>
            </motion.div>

            <motion.div className="flex-1 w-full" whileHover={{ scale: 1.02 }}>
              <input
                type="text"
                placeholder="Location..."
                className="p-3 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-yellow-500 transition-all"
              />
            </motion.div>

            <motion.div className="flex-1 w-full" whileHover={{ scale: 1.02 }}>
              <input
                type="text"
                placeholder="Date/Time"
                className="p-3 border border-gray-300 rounded-md w-full text-gray-500 focus:ring-2 focus:ring-yellow-500 transition-all"
              />
            </motion.div>

            <MagneticButton
              className="px-6 py-3 font-bold rounded-md flex-shrink-0 w-full md:w-auto flex items-center justify-center space-x-2 transition duration-200 bg-yellow-500 text-green-900"
            >
              <i className="fas fa-search z-10 relative"></i>
              <span className="z-10 relative">Search</span>
            </MagneticButton>
          </motion.div>
        </motion.div>
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
          <motion.h3
            className="text-3xl font-bold mb-4 drop-shadow-lg text-green-900"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            Popular Categories
          </motion.h3>
          <motion.p
            className="text-gray-700 text-sm mb-8 max-w-2xl mx-auto drop-shadow-md font-medium"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Discover the perfect photography service for your special moments
          </motion.p>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {categories.map((cat) => (
              <TiltCard key={cat.title}>
                <motion.div
                  className="relative overflow-hidden rounded-xl shadow-2xl border-2 border-white transition-all duration-300 group cursor-pointer h-48"
                  variants={fadeInUp}
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
                    className="absolute inset-0 bg-green-800/60 from-green-900 via-green-800/80 to-green-700/60 group-hover:from-green-900/90 group-hover:via-green-800/70 transition-all duration-300"
                  ></div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                    <div
                      className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl shadow-lg bg-yellow-500 text-green-900"
                    >
                      <i className={cat.icon}></i>
                    </div>
                    <h4 className="font-bold text-lg mb-1 text-white">
                      {cat.title}
                    </h4>
                    <p className="text-white/90 text-sm">{cat.subtitle}</p>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Photographers Section */}
      <section className="py-16 px-4 text-center bg-gray-50">
        <motion.h3
          className="text-3xl font-bold mb-4 text-green-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Featured Photographers
        </motion.h3>
        <motion.p
          className="text-gray-600 text-sm mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Meet our top-rated professional photographers
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {photographers.map((p) => (
            <motion.div
              key={p.name}
              className="bg-white p-6 rounded-lg shadow-md w-72 flex flex-col items-center transition-all duration-300 hover:shadow-xl group"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <div className="relative mb-4">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto transition-transform duration-500 group-hover:scale-110 border-4 border-yellow-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + p.name.replace(' ', '+') + '&size=200&background=random';
                  }}
                />
                {p.topPro && (
                  <span
                    className="absolute top-0 -right-2 px-3 py-1 text-xs font-bold rounded-full shadow-lg bg-yellow-500 text-green-900"
                  >
                    TOP PRO
                  </span>
                )}
              </div>

              <h4 className="font-bold text-xl mb-1 text-green-900">
                {p.name}
              </h4>
              <p className="text-gray-500 text-sm mb-3">{p.role}</p>
              <div className="flex items-center text-sm font-semibold mb-4 text-green-700">
                <i className="fas fa-star mr-1"></i> {p.rating} <span className="text-gray-400 ml-1">({p.reviews} reviews)</span>
              </div>
              <MagneticButton
                className="px-8 py-2 font-semibold rounded-md text-white transition-all duration-200 hover:shadow-lg w-full bg-green-700"
              >
                <span className="relative z-10">View Profile</span>
              </MagneticButton>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 text-center bg-white">
        <motion.div
          className="flex flex-wrap justify-center gap-12 md:gap-24 max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center group cursor-default">
              <motion.div
                className={`text-5xl font-extrabold mb-2 ${stat.accent ? 'text-green-700' : 'text-green-900'}`}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stat.number}
              </motion.div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* <Footer /> */}
    </div>
  );
};

export default HomePage;
