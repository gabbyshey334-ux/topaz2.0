import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import CompetitionSetup from './pages/CompetitionSetup';
import JudgeSelection from './pages/JudgeSelection';
import ScoringInterface from './pages/ScoringInterface';
import ResultsPage from './pages/ResultsPage';
import ArchivedCompetitions from './pages/ArchivedCompetitions';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/setup" element={<CompetitionSetup />} />
        <Route path="/judge-selection" element={<JudgeSelection />} />
        <Route path="/scoring" element={<ScoringInterface />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/archived-competitions" element={<ArchivedCompetitions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
