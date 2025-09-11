import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSurahs, getSurahVerses } from '../services/quranService';
import { Surah, Verse, Settings, Difficulty } from '../types';
import Spinner from './Spinner';

type VersePart = { type: 'word'; content: string } | { type: 'input'; correct: string; id: number };

const prepareVerseForCompetition = (verseText: string): VersePart[] => {
    const words = verseText.split(' ').filter(w => w.length > 0);
    const parts: VersePart[] = [];
    let hiddenIndices = new Set<number>();
    if (words.length <= 1) return words.map(w => ({ type: 'word', content: w }));

    const half = Math.ceil(words.length / 2);
    const start = Math.floor(Math.random() * (words.length - half + 1));
    for (let i = 0; i < half; i++) {
        hiddenIndices.add(start + i);
    }

    words.forEach((word, index) => {
        if (hiddenIndices.has(index)) {
            parts.push({ type: 'input', correct: word, id: index });
        } else {
            parts.push({ type: 'word', content: word });
        }
    });
    return parts;
};

// FIX: Define props for the CompetitionPage component to accept settings.
interface CompetitionPageProps {
  settings: Settings;
}

const CompetitionPage: React.FC<CompetitionPageProps> = ({ settings }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [buzzerWinner, setBuzzerWinner] = useState<1 | 2 | null>(null);
  const [showScoring, setShowScoring] = useState(false);
  const [isCompetitionFinished, setIsCompetitionFinished] = useState(false);

  useEffect(() => {
    const fetchSurahs = async () => {
      setIsLoading(true);
      const surahList = await getSurahs();
      setSurahs(surahList);
      setIsLoading(false);
    };
    fetchSurahs();
  }, []);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer]);
  
  useEffect(() => {
    if (verses.length > 0) {
        setIsTimerRunning(true);
    }
  }, [currentVerseIndex, verses]);

  const handleSurahChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahNumber = e.target.value;
    setSelectedSurah(surahNumber);
    if (surahNumber) {
      setIsVerseLoading(true);
      const verseList = await getSurahVerses(parseInt(surahNumber, 10));
      setVerses(verseList);
      resetGame();
      setIsVerseLoading(false);
    } else {
      setVerses([]);
    }
  };
  
  const resetGame = () => {
    setCurrentVerseIndex(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setIsCompetitionFinished(false);
    resetRound();
  };
  
  const resetRound = () => {
      setTimer(30);
      setIsTimerRunning(false);
      setBuzzerWinner(null);
      setShowScoring(false);
  };
  
  const handleBuzzer = (player: 1 | 2) => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setBuzzerWinner(player);
      setShowScoring(true);
    }
  };
  
  const handleAwardPoint = (isCorrect: boolean) => {
    if (isCorrect && buzzerWinner) {
      if (buzzerWinner === 1) setPlayer1Score(s => s + 1);
      else setPlayer2Score(s => s + 1);
    }
    setShowScoring(false);
  };

  const handleEndCompetition = () => {
    setIsTimerRunning(false);
    setIsCompetitionFinished(true);
  };

  const handleRequestEndCompetition = () => {
    const isConfirmed = window.confirm('هل أنت متأكد أنك تريد إنهاء المسابقة؟');
    if (isConfirmed) {
      handleEndCompetition();
    }
  };
  
  const handleNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(prev => prev + 1);
      resetRound();
    } else {
      handleEndCompetition();
    }
  };

  const currentVerseParts = useMemo(() => {
    if (verses.length > 0 && currentVerseIndex < verses.length) {
      return prepareVerseForCompetition(verses[currentVerseIndex].text);
    }
    return [];
  }, [currentVerseIndex, verses]);

  if (isLoading) return <Spinner />;

  if (isCompetitionFinished) {
    const winner = player1Score > player2Score ? 1 : player2Score > player1Score ? 2 : 0;
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto animate-fade-in text-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-primary dark:text-white mb-4">انتهت المسابقة!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            {winner === 1 && '🏆 المتسابق 1 هو الفائز!'}
            {winner === 2 && '🏆 المتسابق 2 هو الفائز!'}
            {winner === 0 && '🤝 انتهت المسابقة بالتعادل!'}
          </p>
          <div className="flex justify-around items-center max-w-sm mx-auto my-8">
            <div className="text-center">
              <p className="text-lg font-semibold text-green-800 dark:text-green-200">المتسابق 1</p>
              <p className="text-5xl font-bold text-primary dark:text-white">{player1Score}</p>
            </div>
            <div className="border-l-2 border-gray-300 dark:border-gray-600 h-16"></div>
            <div className="text-center">
              <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">المتسابق 2</p>
              <p className="text-5xl font-bold text-secondary dark:text-white">{player2Score}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setSelectedSurah('');
              setVerses([]);
              resetGame();
            }}
            className="mt-6 w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            بدء مسابقة جديدة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-primary dark:text-white mb-6">مسابقة ثنائية ⚔️</h2>
      
      <div className="grid grid-cols-2 gap-4 text-center mb-6">
        <div className="bg-green-100 dark:bg-green-900/80 backdrop-blur-sm p-4 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-lg font-semibold text-green-800 dark:text-green-200">المتسابق 1</p>
          <p className="text-3xl font-bold text-primary dark:text-white">{player1Score}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/80 backdrop-blur-sm p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">المتسابق 2</p>
          <p className="text-3xl font-bold text-secondary dark:text-white">{player2Score}</p>
        </div>
      </div>
      
      {!selectedSurah && (
        <div className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
          <label htmlFor="surah-select" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">اختر السورة لبدء المسابقة:</label>
          <select
            id="surah-select"
            value={selectedSurah}
            onChange={handleSurahChange}
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">-- اختر --</option>
            {surahs.map(surah => (
              <option key={surah.number} value={surah.number}>{surah.number} - {surah.name}</option>
            ))}
          </select>
        </div>
      )}

      {isVerseLoading && <Spinner />}

      {verses.length > 0 && !isVerseLoading && (
        <>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    الآية {verses[currentVerseIndex].numberInSurah} من سورة {surahs.find(s => s.number === parseInt(selectedSurah))?.name}
                </p>
                <div dir="rtl" className="text-2xl md:text-3xl my-6 leading-loose font-serif text-gray-800 dark:text-gray-100 flex flex-wrap justify-center items-center gap-2">
                    {currentVerseParts.map((part, index) => 
                        part.type === 'word' ? <span key={index}>{part.content}</span> : <span key={index} className="text-gray-400">[.....]</span>
                    )}
                </div>

                <div className="my-4">
                    <p className={`text-5xl font-bold font-mono transition-colors ${timer <= 10 ? 'text-red-500' : 'text-primary dark:text-white'}`}>{timer}</p>
                    <p className="text-gray-500">{timer > 0 ? 'ثوانٍ متبقية' : 'انتهى الوقت!'}</p>
                </div>

                {!showScoring && isTimerRunning && (
                    <div className="flex justify-center gap-4 my-4">
                        <button onClick={() => handleBuzzer(1)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg">أنا أسرع! (لاعب 1)</button>
                        <button onClick={() => handleBuzzer(2)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg">أنا أسرع! (لاعب 2)</button>
                    </div>
                )}
                
                {showScoring && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="font-bold text-gray-700 dark:text-gray-200 mb-4">المتسابق {buzzerWinner} كان الأسرع. هل كانت إجابته صحيحة؟</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => handleAwardPoint(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg">نعم</button>
                            <button onClick={() => handleAwardPoint(false)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">لا</button>
                        </div>
                    </div>
                )}
                
                {(!isTimerRunning || showScoring) && (
                    <div className="mt-8">
                        <button onClick={handleNextVerse} className="w-full bg-secondary hover:bg-yellow-500 text-primary-dark font-bold py-3 px-4 rounded-lg transition-colors">
                            {currentVerseIndex === verses.length - 1 ? 'عرض النتيجة النهائية' : 'الآية التالية'}
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-4">
                <button
                onClick={handleRequestEndCompetition}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                إنهاء المسابقة
                </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CompetitionPage;
