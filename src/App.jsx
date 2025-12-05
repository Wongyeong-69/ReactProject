// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages_temp/Home.jsx";
import TripDetail from "./pages_temp/TripDetail.jsx";
import Stats from "./pages_temp/Stats.jsx";
import "./styles/common.css";
import { TripProvider } from "./context/TripContext.jsx";

function App() {
  return (
    <TripProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trip/:tripId" element={<TripDetail />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </div>
      </Router>
    </TripProvider>
  );
}

export default App;
