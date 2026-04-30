import React from "react";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>© 2025 CivicFix | Smart Municipality Management System</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#2c2c54",
    color: "white",
    textAlign: "center",
    padding: "10px",
    marginTop: "40px"
  }
};

export default Footer;
