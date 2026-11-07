import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Simulator } from './pages/Simulator';
import { Scanner } from './pages/Scanner';
import { Visualizer } from './pages/Visualizer';
import { Playground } from './pages/Playground';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { Learning } from './pages/Learning';
import { Documentation } from './pages/Documentation';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="visualizer" element={<Visualizer />} />
          <Route path="playground" element={<Playground />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="learning" element={<Learning />} />
          <Route path="docs" element={<Documentation />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
