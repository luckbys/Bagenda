import React from 'react';

const LanguageSelector = () => {
  return (
    <div className="language-selector">
      <span className="badge bg-primary d-flex align-items-center">
        <img 
          src="https://flagcdn.com/w20/br.png" 
          alt="Português" 
          className="me-1"
          width="20"
          height="15"
        />
        PT-BR
      </span>
    </div>
  );
};

export default LanguageSelector; 