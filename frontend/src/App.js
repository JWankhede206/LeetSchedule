import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Student from './student';
import TextBox from './textbox';  

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path='/' element={
            <>
              <Student />
              <TextBox />
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;