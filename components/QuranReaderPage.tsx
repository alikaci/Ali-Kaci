import React, { useState, useEffect } from 'react';
import { getSurahs, getSurahVerses } from '../services/quranService';
import { Surah, Verse } from '../types';
import Spinner from './Spinner';

const QuranReaderPage: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  const [fontSize, setFontSize] = useState(24); // Initial font size in pixels

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
      setIsVerseLoading(false);
    } else {
      setVerses([]);
    }
  };

  const changeFontSize = (delta: number) => {
    setFontSize(prev => Math.max(16, Math.min(48, prev + delta))); // Clamp font size between 16 and 48
  };
  
  const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-primary dark:text-white mb-6 border-b-2 border-primary/20 pb-4">
        القرآن الكريم
      </h2>
      
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg mb-6 sticky top-2 z-10 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-1/2">
            <label htmlFor="surah-select-reader" className="sr-only">اختر السورة</label>
            <select
              id="surah-select-reader"
              value={selectedSurah}
              onChange={handleSurahChange}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">-- اختر السورة --</option>
              {surahs.map(surah => (
                <option key={surah.number} value={surah.number}>{surah.number} - {surah.name}</option>
              ))}
            </select>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">حجم الخط:</span>
            <button onClick={() => changeFontSize(-2)} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-lg">-</button>
            <button onClick={() => changeFontSize(2)} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-lg">+</button>
        </div>
      </div>

      {isLoading && !selectedSurah && <Spinner />}
      
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg min-h-[300px]">
        {isVerseLoading ? <Spinner /> : (
            <>
              {verses.length > 0 ? (
                <div>
                   { selectedSurah !== '1' && selectedSurah !== '9' && (
                        <p className="text-center font-serif text-2xl sm:text-3xl font-bold mb-8" style={{fontSize: `${fontSize + 2}px`}}>{BISMILLAH}</p>
                   )}
                  <div dir="rtl" className="text-right leading-loose font-serif text-gray-800 dark:text-gray-100" style={{ fontSize: `${fontSize}px`, lineHeight: '2.5' }}>
                      {verses.map((verse) => (
                        <span key={verse.number}>
                          {verse.text}
                          <span className="text-primary dark:text-secondary font-bold mx-1 select-none">{`\uFD3F${verse.numberInSurah}\uFD3E`}</span>
                        </span>
                      ))}
                  </div>
                </div>
              ) : selectedSurah ? null : (
                <div className="flex items-center justify-center h-full text-center min-h-[300px]">
                    <div>
                        <p className="text-5xl mb-4">📚</p>
                        <p className="text-xl text-gray-600 dark:text-gray-300">الرجاء اختيار سورة لعرضها.</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">ابدأ رحلتك في قراءة كلام الله.</p>
                    </div>
                </div>
              )}
            </>
        )}
      </div>
    </div>
  );
};

export default QuranReaderPage;