import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BoardsHome from './components/BoardsHome';
import BoardView from './components/BoardView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BoardsHome />} />
        <Route path="/board/:id" element={<BoardView />} />
      </Routes>
    </Router>
  );
}

export default App;
