import React from 'react';

interface ActivityItem {
  date: string;
  action: string;
  details: string;
}

const DashboardSummary: React.FC = () => {
  // Przykładowe ostatnie aktywności
  const recentActivity: ActivityItem[] = [
    {
      date: '28 kwi',
      action: 'Quiz ukończony',
      details: 'Angielski: Czasy przeszłe - 85%'
    },
    {
      date: '27 kwi',
      action: 'Fiszki dodane',
      details: 'Dodano 15 nowych fiszek'
    },
    {
      date: '26 kwi',
      action: 'Quiz ukończony',
      details: 'Programowanie: JavaScript - 92%'
    },
    {
      date: '25 kwi',
      action: 'Fiszki wygenerowane',
      details: 'Historia: II Wojna Światowa'
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-5 text-white">Podsumowanie</h2>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3 text-zinc-300">Obecny postęp</h3>
        <div className="mb-2 flex justify-between">
          <span className="text-zinc-400 text-sm">Ukończone sesje: 28/30</span>
          <span className="text-zinc-400 text-sm">93%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2.5">
          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '93%' }}></div>
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-3 text-zinc-300">Ostatnia aktywność</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
              <div className="text-center mr-4 min-w-[40px]">
                <div className="text-xs text-zinc-400">{activity.date}</div>
              </div>
              <div>
                <div className="font-medium text-white">{activity.action}</div>
                <div className="text-sm text-zinc-400">{activity.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
