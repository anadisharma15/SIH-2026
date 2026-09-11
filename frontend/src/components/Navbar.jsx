import { NavLink } from "react-router-dom";


import "../styles/navbar.css";

function Navbar() {

  return (
    <nav className="navbar">

      <div className="navbar-container">

        {/* LOGO */}

        <div className="logo">

          <div className="logo-icon">
            <img src="/logo.png" alt="Vaani AI" className="logo-img" />
          </div>

          <span>
            <span style={{ color: 'black' }}>Vaani</span> <span style={{ color: 'blue' }}>AI</span>
          </span>

        </div>


        {/* NAVIGATION */}

        <div className="nav-links">

          <NavLink to="/home">
            Home
          </NavLink>

          <NavLink to="/detect">
            Detect
          </NavLink>

          <NavLink to="/live-detection">
            Live Detection
          </NavLink>

          <NavLink to="/about">
            About
          </NavLink>

        </div>


        {/* BUTTON */}

        <NavLink
          to="/detect"
          className="get-started-btn"
        >
          Get Started
        </NavLink>

      </div>

    </nav>
  );
}

export default Navbar;