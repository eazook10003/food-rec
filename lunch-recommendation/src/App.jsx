import Login from "./components/Login"
import Signup from "./components/Signup"
import Findpw from "./components/Findpw"
import AppWeather from "./components/AppWeather"
import Cook from "./components/cook"
import Survey from "./components/survey"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<AppWeather/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/survey" element={<Survey/>}/>
          <Route path="/findpw" element={<Findpw/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/Cook" element={<Cook/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;