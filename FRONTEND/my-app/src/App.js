//import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom' ; 
import Auth from './components/Auth';
import SecondPage from './components/SecondPage';

function App() {
  return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth/>} /> <Route/>
            <Route path="/secondpage" element={<SecondPage/>} /> <Route/>
          </Routes>
        </BrowserRouter>
      </>
  );
}

export default App;