
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getSurahs, getSurahVerses } from '../services/quranService';
import { Surah, Verse, Difficulty, Settings, TestResult } from '../types';
import Spinner from './Spinner';
import { getDb } from '../services/db';
import MicrophoneIcon from './icons/MicrophoneIcon';

type VersePart = { type: 'word'; content: string } | { type: 'input'; correct: string; id: number };

interface TestPageProps {
  settings: Settings;
}

const PermissionInfoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mic-permission-title"
    >
        <div 
            className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-11/12 text-right" 
            onClick={(e) => e.stopPropagation()}
        >
            <h3 id="mic-permission-title" className="text-2xl font-bold text-primary dark:text-white mb-4">الوصول إلى الميكروفون مطلوب</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                لاستخدام ميزة الإدخال الصوتي، يحتاج التطبيق إلى إذن للوصول إلى الميكروفون. يبدو أنك قمت برفض هذا الإذن سابقًا.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="font-semibold text-gray-800 dark:text-gray-200">كيفية السماح بالوصول:</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    انقر على أيقونة القفل (🔒) في شريط عنوان المتصفح، ثم قم بتفعيل خيار الميكروفون لهذا الموقع. قد تحتاج إلى إعادة تحميل الصفحة بعد ذلك.
                </p>
            </div>
            <button
                onClick={onClose}
                className="mt-6 w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-gray-800"
            >
                فهمت
            </button>
        </div>
    </div>
);

const PrePermissionModal: React.FC<{ onContinue: () => void; onClose: () => void }> = ({ onContinue, onClose }) => (
    <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mic-pre-permission-title"
    >
        <div 
            className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-11/12 text-right" 
            onClick={(e) => e.stopPropagation()}
        >
            <h3 id="mic-pre-permission-title" className="text-2xl font-bold text-primary dark:text-white mb-4">استخدام الميكروفون</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                لتمكين ميزة الإدخال الصوتي، سنطلب إذنًا لاستخدام الميكروفون.
                <br />
                الرجاء النقر على "السماح" (Allow) في النافذة التي ستظهر من المتصفح.
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-3">
                 <button
                    onClick={onContinue}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    متابعة
                </button>
                <button
                    onClick={onClose}
                    className="w-full sm:w-auto bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    إلغاء
                </button>
            </div>
        </div>
    </div>
);


const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Component for displaying progress circle from ProgressPage, with slight style adjustments
const CircularProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const scoreColor = progress >= 90 ? 'text-green-500' : progress >= 70 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="relative inline-flex items-center justify-center w-[140px] h-[140px]">
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
      <span className={`absolute text-3xl font-bold ${scoreColor}`}>
        {progress}%
      </span>
    </div>
  );
};


const TestPage: React.FC<TestPageProps> = ({ settings }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [sessionResults, setSessionResults] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeRecordingInputId, setActiveRecordingInputId] = useState<number | null>(null);
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const [showMicPermissionInfo, setShowMicPermissionInfo] = useState(false);
  const [showPrePermissionPrompt, setShowPrePermissionPrompt] = useState(false);
  const recognitionRef = useRef<any>(null);
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

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((permissionStatus) => {
        setMicPermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          setMicPermission(permissionStatus.state);
        };
      }).catch((err) => {
        console.error("Permission API error:", err);
      });
    }
  }, []);

  const handleSurahChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahNumber = e.target.value;

    if (verses.length > 0 && !isSessionFinished && surahNumber !== selectedSurah) {
      const isConfirmed = window.confirm(
        'لديك جلسة اختبار نشطة. تغيير السورة سيعيد تعيين تقدمك. هل أنت متأكد أنك تريد المتابعة؟'
      );
      if (!isConfirmed) {
        e.target.value = selectedSurah; // Revert selection
        return; 
      }
    }

    setSelectedSurah(surahNumber);
    if (surahNumber) {
      setIsVerseLoading(true);
      const verseList = await getSurahVerses(parseInt(surahNumber, 10));
      setVerses(shuffleArray(verseList));
      setCurrentVerseIndex(0);
      resetVerseState();
      setSessionResults({ correct: 0, total: 0 });
      setIsSessionFinished(false);
      setIsVerseLoading(false);
    } else {
      setVerses([]);
    }
  };

  const resetVerseState = () => {
    setUserInputs([]);
    setIsSubmitted(false);
    setScore({ correct: 0, total: 0 });
  };

  const prepareVerse = useCallback((verseText: string): VersePart[] => {
    const words = verseText.split(' ').filter(w => w.length > 0);
    const parts: VersePart[] = [];
    let hiddenIndices = new Set<number>();
    let inputId = 0;

    if (words.length > 1) {
        switch (settings.difficulty) {
        case Difficulty.Easy:
            if (words.length > 2) {
                hiddenIndices.add(Math.floor(Math.random() * (words.length - 2)) + 1);
            } else {
                hiddenIndices.add(0);
            }
            break;
        case Difficulty.Medium:
            const numToHide = Math.max(1, Math.min(4, Math.floor(words.length / 4)));
            while (hiddenIndices.size < numToHide) {
                hiddenIndices.add(Math.floor(Math.random() * words.length));
            }
            break;
        case Difficulty.Hard:
            const half = Math.ceil(words.length / 2);
            const start = Math.floor(Math.random() * (words.length - half + 1));
            for (let i = 0; i < half; i++) {
                hiddenIndices.add(start + i);
            }
            break;
        }
    }


    words.forEach((word, index) => {
      if (hiddenIndices.has(index)) {
        parts.push({ type: 'input', correct: word, id: inputId++ });
      } else {
        parts.push({ type: 'word', content: word });
      }
    });

    setUserInputs(Array(inputId).fill(''));
    return parts;
  }, [settings.difficulty]);

  const currentVerseParts = useMemo(() => {
    if (verses.length > 0 && currentVerseIndex < verses.length) {
      return prepareVerse(verses[currentVerseIndex].text);
    }
    return [];
  }, [currentVerseIndex, verses, prepareVerse]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };
  
  const cleanWord = (word: string) => {
    // Basic Arabic character normalization and removal of diacritics
    return word.normalize('NFD').replace(/[\u064B-\u0652]/g, "").replace(/[أإآ]/g, 'ا').replace(/[ة]/g, 'ه');
  };

  const startRecognition = useCallback(() => {
    const findNextEmptyInputId = () => {
      const hiddenInputs = currentVerseParts.filter(p => p.type === 'input') as { type: 'input', correct: string, id: number }[];
      const sortedInputs = [...hiddenInputs].sort((a, b) => a.id - b.id);
      for (const part of sortedInputs) {
        if (!userInputs[part.id] || userInputs[part.id].trim() === '') {
          return part.id;
        }
      }
      return null;
    };

    const targetInputId = findNextEmptyInputId();
    if (targetInputId === null) {
      alert('كل الفراغات مملوءة.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم خاصية التعرف على الصوت.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setActiveRecordingInputId(targetInputId);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange(targetInputId, transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setShowMicPermissionInfo(true);
      } else {
        alert(`حدث خطأ في التعرف على الصوت: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setActiveRecordingInputId(null);
      recognitionRef.current = null;
    };

    recognition.start();
  }, [currentVerseParts, userInputs, handleInputChange]);

  const handleVoiceInput = () => {
    if (micPermission === 'denied') {
        setShowMicPermissionInfo(true);
        return;
    }
    
    if (micPermission === 'prompt') {
        setShowPrePermissionPrompt(true);
        return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    
    startRecognition();
  };
  
  const handleContinueAndRequestPermission = () => {
      setShowPrePermissionPrompt(false);
      startRecognition();
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const hiddenWords = currentVerseParts.filter(p => p.type === 'input') as { type: 'input', correct: string, id: number }[];
    hiddenWords.forEach((part, index) => {
      if (cleanWord(userInputs[index].trim()) === cleanWord(part.correct)) {
        correctCount++;
      }
    });
    const newScore = { correct: correctCount, total: hiddenWords.length };
    setScore(newScore);
    setSessionResults(prev => ({ correct: prev.correct + newScore.correct, total: prev.total + newScore.total }));
    setIsSubmitted(true);
  };

  const finishSession = async () => {
    const surahInfo = surahs.find(s => s.number === parseInt(selectedSurah));
    const finalScore = (sessionResults.total > 0) ? Math.round((sessionResults.correct / sessionResults.total) * 100) : 100;
    const surahName = surahInfo?.name || "غير معروف";

    // Save result to DB
    try {
      const db = getDb();
      const newTestResult: TestResult = {
        surahName,
        score: finalScore,
        difficulty: settings.difficulty,
        date: new Date().toLocaleDateString('ar-EG'),
      };
      await db.testResults.add(newTestResult);
    } catch (error) {
      console.error("Failed to save test result:", error);
    }
    setIsSessionFinished(true);
  };

  const handleNextVerse = async () => {
     if (!isSubmitted) {
      // This is a skip. Score 0 for the current verse.
      const hiddenWords = currentVerseParts.filter(p => p.type === 'input');
      if (hiddenWords.length > 0) {
        setSessionResults(prev => ({ 
          correct: prev.correct, 
          total: prev.total + hiddenWords.length 
        }));
      }
    }
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(prev => prev + 1);
      resetVerseState();
    } else {
       await finishSession();
    }
  };

  const handleEndTest = async () => {
    const isConfirmed = window.confirm('هل أنت متأكد أنك تريد إنهاء الاختبار؟ سيتم حفظ نتيجتك الحالية.');
    if (isConfirmed) {
      await finishSession();
    }
  };

  const handleStartNewTest = () => {
    setSelectedSurah('');
    setVerses([]);
    setCurrentVerseIndex(0);
    resetVerseState();
    setSessionResults({ correct: 0, total: 0 });
    setIsSessionFinished(false);
  };

  const handleSpeak = () => {
    if (settings.isVoiceEnabled && verses[currentVerseIndex] && audioRef.current) {
        audioRef.current.src = verses[currentVerseIndex].audio;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };

  if (isLoading) return <Spinner />;

  if (isSessionFinished) {
    const surahInfo = surahs.find(s => s.number === parseInt(selectedSurah));
    const surahName = surahInfo?.name || "غير معروف";
    const finalScore = (sessionResults.total > 0) ? Math.round((sessionResults.correct / sessionResults.total) * 100) : 100;

    return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto animate-fade-in text-center">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-primary dark:text-white mb-4">اكتمل الاختبار!</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">هذه هي نتيجتك في سورة {surahName}:</p>
                
                <div className="my-8">
                    <CircularProgressBar progress={finalScore} />
                </div>
                
                <div className="flex justify-around items-center text-lg max-w-xs mx-auto bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div>
                        <p className="font-bold text-2xl text-gray-700 dark:text-gray-200">{sessionResults.correct}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">إجابات صحيحة</p>
                    </div>
                    <div className="border-l-2 border-gray-200 dark:border-gray-600 h-12"></div>
                    <div>
                        <p className="font-bold text-2xl text-gray-700 dark:text-gray-200">{sessionResults.total}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الأسئلة</p>
                    </div>
                </div>

                <button 
                    onClick={handleStartNewTest} 
                    className="mt-10 w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    اختبار سورة أخرى
                </button>
            </div>
        </div>
    );
  }


  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      {showMicPermissionInfo && <PermissionInfoModal onClose={() => setShowMicPermissionInfo(false)} />}
      {showPrePermissionPrompt && <PrePermissionModal onContinue={handleContinueAndRequestPermission} onClose={() => setShowPrePermissionPrompt(false)} />}
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
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                الآية {currentVerseIndex + 1} من {verses.length} (ترتيب عشوائي)
            </p>
          </div>
          <div dir="rtl" className="text-2xl md:text-3xl leading-loose font-serif text-right text-gray-800 dark:text-gray-100 flex flex-wrap items-center gap-x-2 gap-y-4">
            {currentVerseParts.map((part, index) => {
              if (part.type === 'word') {
                return <span key={index}>{part.content}</span>;
              } else {
                const isCorrect = isSubmitted && cleanWord(userInputs[part.id].trim()) === cleanWord(part.correct);
                const isIncorrect = isSubmitted && !isCorrect;
                return (
                  <input
                    key={part.id}
                    type="text"
                    value={userInputs[part.id]}
                    onChange={(e) => handleInputChange(part.id, e.target.value)}
                    disabled={isSubmitted}
                    className={`inline-block w-28 text-center bg-gray-100 dark:bg-gray-700 rounded-md border-2 p-1 text-2xl font-serif
                      ${isSubmitted ? '' : 'border-dashed border-gray-400 focus:border-solid focus:ring-primary focus:border-primary'}
                      ${activeRecordingInputId === part.id ? 'ring-2 ring-blue-500' : ''}
                      ${isCorrect ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200' : ''}
                      ${isIncorrect ? 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200' : ''}`}
                    />
                );
              }
            })}
             <span className="text-primary font-bold">{`\uFD3F${verses[currentVerseIndex].numberInSurah}\uFD3E`}</span>
          </div>

          {isSubmitted && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-bold text-green-700 dark:text-green-200">الإجابة الصحيحة:</p>
              <p className="text-xl font-serif mt-2 text-green-900 dark:text-green-100">{verses[currentVerseIndex].text}</p>
              <p className="mt-2 font-bold text-primary dark:text-secondary">نتيجتك لهذه الآية: {score.correct} / {score.total}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {!isSubmitted ? (
              <>
                <button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  تحقق من الإجابة
                </button>
                <button onClick={handleNextVerse} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  الآية التالية (تخطي)
                </button>
              </>
            ) : (
              <button onClick={handleNextVerse} className="flex-1 bg-secondary hover:bg-yellow-500 text-primary-dark font-bold py-3 px-4 rounded-lg transition-colors">
                {currentVerseIndex === verses.length - 1 ? 'إنهاء الاختبار' : 'الآية التالية'}
              </button>
            )}
             <div className="flex items-center gap-2">
                {!isSubmitted && (
                    <button
                        onClick={handleVoiceInput}
                        title={micPermission === 'denied' ? 'تم رفض إذن الميكروفون - انقر للمساعدة' : "إكمال بالصوت"}
                        className={`p-3 rounded-lg transition-colors flex items-center justify-center ${
                            isRecording 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : micPermission === 'denied' 
                            ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-help' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        aria-label={isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}
                    >
                        <MicrophoneIcon className="w-6 h-6" />
                    </button>
                )}
                {settings.isVoiceEnabled && (
                    <button onClick={handleSpeak} title="قراءة الآية (عبد الباسط)" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg transition-colors">
                    🔊
                  </button>
                )}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleEndTest}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              إنهاء الاختبار
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
