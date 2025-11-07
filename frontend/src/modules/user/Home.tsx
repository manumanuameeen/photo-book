// const HomePage = () => {
//   return (
//     <div className="min-h-screen">

//       {/* ============================================================
//         1. HEADER
//         ============================================================
//       */}
//       <header className="bg-white shadow-sm py-4 px-6 md:px-12 border-b border-gray-100">
//         <div className="flex justify-between items-center max-w-7xl mx-auto">
//           {/* Logo */}
//           <div className="text-xl font-bold" style={{ color: Colors.darkGreen }}>
//             PhotoBook
//           </div>

//           {/* Navigation Links */}
//           <nav className="hidden md:flex space-x-8 text-sm font-medium">
//             {/* <a href="#" className="text-gray-700 font-semibold" style={{ color: Colors.darkGreen }}>Home</a> */}
//             <a href="#" className="text-gray-600 hover:text-gray-900">Photographers</a>
//             <a href="#" className="text-gray-600 hover:text-gray-900">Book Session</a>
//             <a href="#" className="text-gray-600 hover:text-gray-900">Equipment</a>
//           </nav>

//           {/* Auth Buttons */}
//           <div className="flex items-center space-x-4">
//             <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Login</a>
//             <button 
//               className="px-4 py-2 text-sm font-semibold rounded transition duration-200"
//               style={{ backgroundColor: Colors.gold, color: Colors.darkGreen }}
//             >
//               Sign Up
//             </button>
//           </div>
//         </div>
//       </header>

//       <main>
//         {/* ============================================================
//           2. HERO SECTION (Search Card)
//           ============================================================
//         */}
//         <section className="py-24 px-4" style={{ backgroundColor: Colors.bgCream }}> 
//           <div className="bg-white max-w-4xl mx-auto p-8 md:p-12 rounded-xl shadow-xl text-center">
            
//             {/* Title */}
//             <h2 className="text-4xl font-light mb-2" style={{ color: Colors.darkGreen }}>
//               Capture <span className="font-bold" style={{ color: Colors.gold }}>Perfect Moments</span>
//             </h2>
//             <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-sm">
//               Connect with professional photographers for weddings, events, and special occasions. Premium quality, luxury service.
//             </p>

//             {/* Search Bar */}
//             <div className="flex flex-col md:flex-row gap-3 items-center">
//               <select className="p-3 border border-gray-300 rounded-md flex-1 w-full text-gray-500 text-sm">
//                 <option>Event Type...</option>
//               </select>
//               <input 
//                 type="text" 
//                 placeholder="Location..." 
//                 className="p-3 border border-gray-300 rounded-md flex-1 w-full"
//               />
//               <input 
//                 type="text" 
//                 placeholder="Date/Time" 
//                 className="p-3 border border-gray-300 rounded-md flex-1 w-full text-gray-500"
//               />
//               <button 
//                 className="px-6 py-3 font-bold rounded-md flex-shrink-0 w-full md:w-auto flex items-center justify-center space-x-2 transition duration-200 hover:opacity-90"
//                 style={{ backgroundColor: Colors.gold, color: Colors.darkGreen }}
//               >
//                 <i className="fas fa-search"></i>
//                 <span>Search</span>
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* ============================================================
//           3. POPULAR CATEGORIES
//           ============================================================
//         */}
//         <section className="py-16 px-4 text-center">
//           <h3 className="text-2xl font-semibold mb-8" style={{ color: Colors.darkGreen }}>Popular Categories</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
//             {categories.map((cat) => (
//               <div key={cat.title} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition duration-300 hover:shadow-lg">
//                 <div 
//                   className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl"
//                   style={{ backgroundColor: Colors.lightGreen }}
//                 >
//                   <i className={cat.icon}></i>
//                 </div>
//                 <h4 className="font-bold text-lg mb-1" style={{ color: Colors.darkGreen }}>{cat.title}</h4>
//                 <p className="text-gray-500 text-sm">{cat.subtitle}</p>
//               </div>
//             ))}
//           </div>
//         </section>
        
//         {/* ============================================================
//           4. FEATURED PHOTOGRAPHERS
//           ============================================================
//         */}
//         <section className="py-16 px-4 text-center" style={{ backgroundColor: Colors.bgCream }}>
//           <h3 className="text-2xl font-semibold mb-8" style={{ color: Colors.darkGreen }}>Featured Photographers</h3>
//           <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
//             {photographers.map((p) => (
//               <div key={p.name} className="bg-white p-6 rounded-lg shadow-md w-72 flex flex-col items-center">
//                 <div className="relative mb-3">
//                   <div 
//                     className="w-24 h-24 rounded-full bg-gray-300 mx-auto"
//                     style={{ border: `3px solid ${Colors.gold}` }}
//                   >
//                     {/* Placeholder for Profile Image */}
//                                       </div>
//                   {p.topPro && (
//                     <span 
//                       className="absolute top-0 -right-2 px-2 py-1 text-xs font-bold rounded-full"
//                       style={{ backgroundColor: Colors.gold, color: Colors.darkGreen }}
//                     >
//                       🔥 TOP PRO
//                     </span>
//                   )}
//                 </div>
                
//                 <h4 className="font-bold text-xl" style={{ color: Colors.darkGreen }}>{p.name}</h4>
//                 <p className="text-gray-500 text-sm mb-2">{p.role}</p>
//                 <div className="flex items-center text-sm font-semibold mb-4" style={{ color: Colors.lightGreen }}>
//                   <i className="fas fa-star mr-1"></i> {p.rating} ({p.reviews})
//                 </div>
//                 <button 
//                   className="px-8 py-2 font-semibold rounded-md text-white transition duration-200 hover:opacity-90"
//                   style={{ backgroundColor: Colors.lightGreen }}
//                 >
//                   View Profile
//                 </button>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ============================================================
//           5. STATS SECTION
//           ============================================================
//         */}
//         <section className="py-16 px-4 text-center">
//           <div className="flex flex-wrap justify-center gap-12 md:gap-24 max-w-4xl mx-auto">
//             {stats.map((stat) => (
//               <div key={stat.label} className="flex flex-col items-center">
//                 <div 
//                   className="text-4xl font-extrabold mb-1" 
//                   style={{ color: stat.accent ? Colors.lightGreen : Colors.darkGreen }}
//                 >
//                   {stat.number}
//                 </div>
//                 <p className="text-gray-600 text-sm">{stat.label}</p>
//               </div>
//             ))}
//           </div>
//         </section>
//       </main>