

import "../styles/footer.css";

function Footer() {

  return (

    <footer className="footer">

      <div className="footer-container">


        {/* TOP */}

        <div className="footer-top">

          <div className="footer-logo">

            <div className="footer-icon">

              <img src="/logo.png" alt="Vaani AI" className="footer-logo-img" />

            </div>

            <span>
              <span style={{ color: 'black' }}>Vaani</span> <span style={{ color: 'blue' }}>AI</span>
            </span>

          </div>


          <div className="footer-links">

            <a href="#privacy">
              Privacy Policy
            </a>

            <a href="#terms">
              Terms of Service
            </a>

            <a href="#documentation">
              Documentation
            </a>

            <a href="#contact">
              Contact
            </a>

          </div>

        </div>


        {/* BOTTOM */}

        <div className="footer-bottom">

          <span>
            © Vaani AI.
          </span>

          <span>
            Designed & Built to Prevent Digital Threat & Scam
          </span>

        </div>

      </div>

    </footer>
  );
}

export default Footer;