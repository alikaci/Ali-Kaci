import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getSurahs, getSurahVerses } from '../services/quranService';
import { Surah, Verse, Settings } from '../types';
import Spinner from './Spinner';

interface ConnectVersesPageProps {
  settings: Settings;
}

const ConnectVersesPage: React.FC<ConnectVersesPageProps> = ({ settings }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      setIsLoading(true);
      const surahList = await getSurahs();
      setSurahs(surahList);
      setIsLoading(false);
    };
    fetchSurahs();
  }, []);

  const handleSurahChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahNumber = e.target.value;
    setSelectedSurah(surahNumber);
    if (surahNumber) {
      setIsVerseLoading(true);
      const verseList = await getSurahVerses(parseInt(surahNumber, 10));
      setVerses(verseList);
      setCurrentVerseIndex(0);
      resetRound();
      setIsVerseLoading(false);
    } else {
      setVerses([]);
    }
  };

  const resetRound = () => {
    setUserInput('');
    setIsSubmitted(false);
    setIsCorrect(false);
  };
  
  const cleanText = (text: string) => {
    return text.normalize('NFD').replace(/[\u064B-\u0652]/g, "").replace(/[أإآ]/g, 'ا').replace(/[ة]/g, 'ه').replace(/[^\u0621-\u064A\s]/g, '').trim();
  };

  const { question, answer } = useMemo(() => {
    if (verses.length > 0 && currentVerseIndex < verses.length - 1) {
      const currentVerseWords = verses[currentVerseIndex].text.split(' ');
      const nextVerseWords = verses[currentVerseIndex + 1].text.split(' ');

      const questionWords = currentVerseWords.slice(-3).join(' ');
      const answerWords = nextVerseWords.slice(0, 3).join(' ');

      return {
        question: `... ${questionWords}`,
        answer: answerWords
      };
    }
    return { question: '', answer: '' };
  }, [currentVerseIndex, verses]);

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    const cleanedUserInput = cleanText(userInput);
    const cleanedAnswer = cleanText(answer);
    
    setIsCorrect(cleanedUserInput === cleanedAnswer);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentVerseIndex < verses.length - 2) {
      setCurrentVerseIndex(prev => prev + 1);
      resetRound();
    } else {
       alert(`انتهى اختبار وصل الآيات لسورة ${surahs.find(s=>s.number === parseInt(selectedSurah))?.name}!`);
       setSelectedSurah('');
       setVerses([]);
    }
  };

  const handleSpeak = () => {
    if (settings.isVoiceEnabled && verses[currentVerseIndex] && audioRef.current) {
        audioRef.current.src = verses[currentVerseIndex].audio;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-primary dark:text-white mb-6">اختبار وصل الآيات 🔗</h2>
      <audio ref={audioRef} style={{ display: 'none' }} />
      <div className="mb-6">
        <label htmlFor="surah-select" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">اختر السورة:</label>
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

      {isVerseLoading && <Spinner />}

      {verses.length > 0 && !isVerseLoading && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">أكمل الآية التالية:</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center mb-6">
              <p className="text-xl sm:text-2xl font-serif text-gray-800 dark:text-gray-100">{question} <span className="text-primary font-bold">{`\uFD3F${verses[currentVerseIndex].numberInSurah}\uFD3E`}</span></p>
          </div>

          <input
            type="text"
            dir="rtl"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isSubmitted}
            placeholder="اكتب بداية الآية التالية هنا..."
            className={`w-full text-center p-3 text-xl font-serif rounded-lg border-2
              ${isSubmitted ? '' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'}
              ${isSubmitted && isCorrect ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200' : ''}
              ${isSubmitted && !isCorrect ? 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200' : ''}`}
          />
          
          {isSubmitted && (
            <div className={`mt-4 p-4 rounded-lg text-center ${isCorrect ? 'bg-green-50 dark:bg-green-900/50' : 'bg-red-50 dark:bg-red-900/50'}`}>
                <p className="font-bold">{isCorrect ? 'أحسنت!' : 'إجابة خاطئة'}</p>
                <p>الإجابة الصحيحة: <span className="font-serif font-semibold">{answer}</span></p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {!isSubmitted ? (
              <button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors">
                تحقق
              </button>
            ) : (
              <button onClick={handleNext} className="flex-1 bg-secondary hover:bg-yellow-500 text-primary-dark font-bold py-3 px-4 rounded-lg transition-colors">
                {currentVerseIndex === verses.length - 2 ? 'إنهاء الاختبار' : 'السؤال التالي'}
              </button>
            )}
             {settings.isVoiceEnabled && (
                <button onClick={handleSpeak} title="قراءة الآية (عبد الباسط)" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg transition-colors">
                🔊
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectVersesPage;