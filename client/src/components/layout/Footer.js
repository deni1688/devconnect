import React from 'react';

const Footer =  () => {
  return (
    <footer className="bg-dark text-white mt-5 p-4 text-center fixed-bottom">
        Copyright &copy; { new Date().getFullYear() } Denis Junuzovic
    </footer>
  )
}

export default Footer;
