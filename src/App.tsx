import { useState } from 'react';
import gamesData from './data/games.json';
import { Game } from './types';
import CalendarView from './components/CalendarView';

function App() {
  const [games] = useState<Game[]>(gamesData);

  return (
    <>
      <CalendarView games={games} />
    </>
  );
}

export default App;
