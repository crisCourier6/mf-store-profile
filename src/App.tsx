import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Profile from "./components/Profile";

function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
              <Route path="/profile" element={<Profile />}/>
          </Routes>
        
      </Router>
    </div>
  );
}

export default App;