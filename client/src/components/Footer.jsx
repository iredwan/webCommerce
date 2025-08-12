import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    // Update the footer element to use the theme colors
    <footer className="bg-background text-text py-12 pb-20 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="flex items-center space-x-3">
              <FaPhone className="text-primary" />
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-primary" />
              <p>info@webcommerce.com</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-xl font-bold mb-4">Our Location</h3>
              <FaMapMarkerAlt className="text-primary mt-1" />
            <div className="flex items-start space-x-3">
              <p className="text-center">
                123 Commerce Street<br />
                Business District<br />
                New York, NY 10001<br />
                United States
              </p>
            </div>
          </div>

          {/* Google Maps */}
          <div className="h-43">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2102.954391418323!2d90.41910426774105!3d23.97817805089695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755db889ef3ea2d%3A0x67d9a75d05b51cb6!2sNoorvilla!5e1!3m2!1sen!2sbd!4v1749032589754!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" 
              title="Google Maps Location"
            ></iframe>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-text text-center">
          <p>&copy; {new Date().getFullYear()} WebCommerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
