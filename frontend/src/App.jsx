import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Signup from './pages/Signup';
import Login from './pages/Login';

function App() {
  return (
    <>
    <Navbar/>
    <div className='min-h-screen'>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
    </Routes>
    </div>
    <Footer/>
    </>
    
    
  );
}

export default App;
