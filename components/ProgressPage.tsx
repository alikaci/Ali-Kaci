import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../services/db';
import { TestResult, Difficulty } from '../types';
import Spinner from './Spinner';

const CircularProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const scoreColor = progress >= 90 ? 'text-green-500' : progress >= 70 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="relative inline-flex items-center justify-center w-[120px] h-[120px]">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className={scoreColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className={`absolute text-2xl font-bold ${scoreColor}`}>
        {progress}%
      </span>
    </div>
  );
};

const LinearProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const scoreColor = progress >= 90 ? 'bg-green-500' : progress >= 70 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
                className={`${scoreColor} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};


const ProgressPage: React.FC = () => {
  const testHistory = useLiveQuery(() => getDb().testResults.toArray());

  const difficultyMap: Record<Difficulty, string> = {
    [Difficulty.Easy]: 'سهل',
    [Difficulty.Medium]: 'متوسط',
    [Difficulty.Hard]: 'صعب',
  };

  const { overallStats, surahProgress } = useMemo(() => {
    if (!testHistory || testHistory.length === 0) {
      return {
        overallStats: { averageScore: 0, totalTests: 0, surahsTestedCount: 0 },
        surahProgress: []
      };
    }

    const totalScore = testHistory.reduce((acc, r) => acc + r.score, 0);
    const averageScore = Math.round(totalScore / testHistory.length);
    const totalTests = testHistory.length;

    const progressBySurah: { [key: string]: { highestScore: number; difficulty: Difficulty } } = {};
    const testedSurahNames = new Set<string>();

    testHistory.forEach(result => {
      testedSurahNames.add(result.surahName);
      if (!progressBySurah[result.surahName] || result.score > progressBySurah[result.surahName].highestScore) {
        progressBySurah[result.surahName] = { highestScore: result.score, difficulty: result.difficulty };
      }
    });
    
    const surahsTestedCount = testedSurahNames.size;

    const sortedSurahProgress = Object.entries(progressBySurah)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.highestScore - a.highestScore);

    return {
      overallStats: { averageScore, totalTests, surahsTestedCount },
      surahProgress: sortedSurahProgress
    };
  }, [testHistory]);

  if (!testHistory) {
      return <Spinner />;
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-primary dark:text-white mb-8 border-b-2 border-primary/20 pb-4">
        مراجعة التقدم
      </h2>
      {testHistory.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
          <p className="text-xl text-gray-600 dark:text-gray-300">لم تقم بأي اختبارات بعد.</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">ابدأ اختبارًا جديدًا لرؤية تقدمك هنا.</p>
        </div>
      ) : (
        <div className="space-y-12">
            {/* Overall Progress Section */}
            <div>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">نظرة عامة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col items-center justify-center">
                        <CircularProgressBar progress={overallStats.averageScore} />
                        <p className="mt-2 font-bold text-lg text-gray-600 dark:text-gray-300">متوسط الأداء</p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-4xl font-bold text-primary dark:text-secondary">{overallStats.totalTests}</p>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">اختبارًا مكتملًا</p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-4xl font-bold text-primary dark:text-secondary">{overallStats.surahsTestedCount}</p>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">سورة تم اختبارها</p>
                    </div>
                </div>
            </div>

            {/* Progress by Surah */}
            <div>
                 <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">التقدم حسب السورة</h3>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                    {surahProgress.map((surah) => (
                        <div key={surah.name}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-800 dark:text-gray-100">{surah.name}</span>
                                <span className="text-sm font-semibold text-primary dark:text-secondary">{surah.highestScore}%</span>
                            </div>
                            <LinearProgressBar progress={surah.highestScore} />
                        </div>
                    ))}
                 </div>
            </div>
            
            {/* Detailed History Table */}
            <div>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">سجل الاختبارات</h3>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">السورة</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">النتيجة</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">المستوى</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-200">التاريخ</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[...testHistory].reverse().map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="p-4 text-gray-800 dark:text-gray-100">{result.surahName}</td>
                        <td className="p-4 font-bold text-gray-700 dark:text-gray-200">{result.score}%</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{difficultyMap[result.difficulty]}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400">{result.date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;