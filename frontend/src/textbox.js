import React, { useState } from 'react';

const TextBox = () => {
  const [text, setText] = useState('');

  const handleChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter text"
        value={text}
        onChange={handleChange}
        className="form-control"
      />
      <p>You entered: {text}</p>
    </div>
  );
};

export default TextBox;