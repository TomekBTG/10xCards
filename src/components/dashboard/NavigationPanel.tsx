import React from 'react';

interface NavItem {
  title: string;
  description: string;
  icon: string;
  path: string;
}

const NavigationPanel: React.FC = () => {
  const navItems: NavItem[] = [
    {
      title: 'Generuj fiszki',
      description: 'Utwórz nowe fiszki za pomocą AI',
      icon: '🤖',
      path: '/generate'
    },
    {
      title: 'Dodaj fiszki',
      description: 'Dodaj własne fiszki ręcznie',
      path: '/flashcards/add',
      icon: '✏️'
    },
    {
      title: 'Biblioteka',
      description: 'Przeglądaj swoją kolekcję fiszek',
      path: '/library',
      icon: '📚'
    },
    {
      title: 'Quiz',
      description: 'Sprawdź swoją wiedzę',
      path: '/quiz',
      icon: '🧠'
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5 text-white">Nawigacja</h2>
      <div className="grid gap-4">
        {navItems.map((item) => (
          <a 
            key={item.path}
            href={item.path}
            className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-300"
          >
            <div className="flex-shrink-0 text-3xl">{item.icon}</div>
            <div>
              <h3 className="font-medium text-white">{item.title}</h3>
              <p className="text-sm text-zinc-400">{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NavigationPanel;
