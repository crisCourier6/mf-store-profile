import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import StoreList from "./components/StoreList";

function App() {
  return (
    <div className="App">
      <Router basename="mf-store-profile">
          <Routes>
              <Route path="/profile" element={<StoreList isAppBarVisible={false} />}/>
          </Routes>
        
      </Router>
    </div>
  );
}

export default App;