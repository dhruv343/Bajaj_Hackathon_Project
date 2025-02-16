import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">FLEX-IT-OUT</Link>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          <li><Link to="/" className="hover:text-gray-200">Home</Link></li>
          <li><Link to="/features" className="hover:text-gray-200">Features</Link></li>
          <li><Link to="/about" className="hover:text-gray-200">About</Link></li>
        </ul>

        {/* Auth Buttons */}
        <div className="hidden md:flex space-x-4">
          <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100">Login</Link>
          <Link to="/signup" className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Signup</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="md:hidden flex flex-col items-center bg-blue-700 py-4">
          <li><Link to="/" className="py-2" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/features" className="py-2" onClick={() => setMenuOpen(false)}>Features</Link></li>
          <li><Link to="/about" className="py-2" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/login" className="py-2" onClick={() => setMenuOpen(false)}>Login</Link></li>
          <li><Link to="/signup" className="py-2" onClick={() => setMenuOpen(false)}>Signup</Link></li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
