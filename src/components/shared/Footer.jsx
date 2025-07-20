import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-base-200 border-t text-base-content">
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <aside>
          <h2 className="text-2xl font-bold mb-2">Strive</h2>
          <p className="text-sm leading-relaxed text-gray-500">
            Your one-stop shop for premium sports gear.
            <br />
            Quality. Speed. Passion.
          </p>
        </aside>

        {/* Contact Info */}
        <nav>
          <h3 className="footer-title">Contact</h3>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <Mail size={16} />
              support@strive.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Calicut, India
            </li>
          </ul>
        </nav>

        {/* Social Media */}
        <nav>
          <h3 className="footer-title">Follow Us</h3>
          <div className="grid grid-flow-col gap-4 mt-1">
            <a href="#" aria-label="Facebook" className="hover:text-primary">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-primary">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-primary">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-primary">
              <Youtube size={20} />
            </a>
          </div>
        </nav>

        {/* Payment Methods */}
        <nav>
          <h3 className="footer-title">We Accept</h3>
          <div className="flex flex-wrap gap-2 items-center mt-1">
            <img
              src="/payments/visa.png"
              alt="Visa"
              className="h-6 w-auto"
            />
            <img
              src="/payments/mastercard.png"
              alt="Mastercard"
              className="h-6 w-auto"
            />
            <img
              src="/payments/paytm.png"
              alt="Paytm"
              className="h-6 w-auto"
            />
            <img
              src="/payments/upi.png"
              alt="UPI"
              className="h-6 w-auto"
            />
          </div>
        </nav>
      </div>

      {/* Copyright */}
      <div className="border-t border-base-300">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © 2025 Strive. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
