
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/Auth#2';
import SecondPage from './components/SecondPage';

//import jwt from 'jsonwebtoken'; // Import jwt for token verification

function App() {


  return (
    <div className="App">
      <Router>
        <Routes>
        
          <Route path="/" element={<Auth />} />
          <Route path="/collab-writing-platform" element={<SecondPage />} />
       
        </Routes>
      </Router>
    </div>
  );
}

export default App;
