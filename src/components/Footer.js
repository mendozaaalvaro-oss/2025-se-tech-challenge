import React from "react";
import logo from "../assets/pizza42.png";

const Footer = () => (
  <footer className="bg-light p-3 text-center">
    <img src={logo} alt="Pizza42 Logo" className="logo" />
    <p>
      Proof of Concept for Pizza 42 by Auth0
    </p>
  </footer>
);

export default Footer;
