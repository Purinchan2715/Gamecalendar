import { useState } from 'react';
import gamesData from './data/games.json';
import { Game } from './types';
import CalendarView from './components/CalendarView';
import EditView from './components/EditView';

function App() {
  const [games, setGames] = useState<Game[]>(gamesData);
  const [currentView, setCurrentView] = useState<'calendar' | 'edit'>('calendar');

  const navigateToEdit = () => setCurrentView('edit');
  const navigateToCalendar = () => setCurrentView('calendar');

  // GitHubへの保存成功時に、アプリのステートも更新する
  const handleSaveSuccess = (updatedGames: Game[]) => {
    setGames(updatedGames);
  };

  return (
    <>
      {currentView === 'calendar' ? (
        <CalendarView games={games} onNavigateToEdit={navigateToEdit} />
      ) : (
        <EditView 
          initialGames={games} 
          onNavigateToCalendar={navigateToCalendar}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
}

export default App;
