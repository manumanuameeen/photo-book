

import { Link } from "@tanstack/react-router";
import { ROUTES } from "../../constants/routes";

const Colors = {
  darkGreen: "#2e4a2d",
  gold: "#f7b731",
};

const Footer = () => {
  return (
    <footer className="py-8 px-6" style={{ backgroundColor: Colors.darkGreen }}>
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto text-white">

        <div className="flex space-x-5 mb-4 md:mb-0">
          <i className="fab fa-twitter text-lg hover:text-gray-300"></i>
          <i className="fab fa-pinterest text-lg hover:text-gray-300"></i>
          <i className="fab fa-instagram text-lg hover:text-gray-300"></i>
        </div>

        <div className="flex mb-4 md:mb-0">
          <input
            type="email"
            placeholder="Enter your email"
            className="p-2 rounded-l-md text-gray-800 focus:outline-none w-48"
          />
          <button
            className="px-4 py-2 font-semibold rounded-r-md transition duration-200"
            style={{ backgroundColor: Colors.gold, color: Colors.darkGreen }}
          >
            Subscribe
          </button>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to={ROUTES.USER.HOW_IT_WORKS}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            How It Works
          </Link>
          <p className="text-xs text-gray-400">
            © 2024 PhotoBook, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
