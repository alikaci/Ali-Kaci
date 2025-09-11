
import React from 'react';
import { Settings, Difficulty } from '../types';

interface SettingsPageProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, setSettings }) => {
  
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, difficulty: e.target.value as Difficulty });
  };

  const handleVoiceToggle = () => {
    setSettings({ ...settings, isVoiceEnabled: !settings.isVoiceEnabled });
  };

  const handleThemeToggle = () => {
    setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' });
  };
  
  const difficultyMap = {
    [Difficulty.Easy]: 'سهل (كلمة واحدة)',
    [Difficulty.Medium]: 'متوسط (عدة كلمات)',
    [Difficulty.Hard]: 'صعب (نصف الآية)',
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-primary dark:text-white mb-8 border-b-2 border-primary/20 pb-4">الإعدادات</h2>

      <div className="space-y-8">
        {/* Difficulty Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor="difficulty" className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 sm:mb-0">مستوى الصعوبة</label>
          <select
            id="difficulty"
            value={settings.difficulty}
            onChange={handleDifficultyChange}
            className="w-full sm:w-60 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {Object.entries(difficultyMap).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>

        {/* Voice Setting */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">تفعيل القراءة الصوتية</span>
          <button
            onClick={handleVoiceToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              settings.isVoiceEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                settings.isVoiceEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Theme Setting */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">الوضع الليلي</span>
           <button
            onClick={handleThemeToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              settings.theme === 'dark' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
