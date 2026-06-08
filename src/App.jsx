import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/layout/Nav';
import Today from './pages/Today';
import Calendar from './pages/Calendar';
import Weekly from './pages/Weekly';
import Progress from './pages/Progress';
import Strength from './pages/Strength';
import StravaCallback from './pages/StravaCallback';
import { PlanProvider } from './context/PlanContext';
import { LogProvider } from './context/LogContext';
import { StravaProvider } from './context/StravaContext';
import { StrengthProvider } from './context/StrengthContext';

export default function App() {
  return (
    <PlanProvider>
      <LogProvider>
        <StravaProvider>
          <StrengthProvider>
            <BrowserRouter basename="/MarathonTrainer">
              <Nav />
              <Routes>
                <Route path="/" element={<Today />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/weekly" element={<Weekly />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/strength" element={<Strength />} />
                <Route path="/strava/callback" element={<StravaCallback />} />
              </Routes>
            </BrowserRouter>
          </StrengthProvider>
        </StravaProvider>
      </LogProvider>
    </PlanProvider>
  );
}
