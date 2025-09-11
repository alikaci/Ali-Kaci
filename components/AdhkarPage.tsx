import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Spinner from './Spinner';

const morningAdhkar = [
  { text: "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا اليَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا اليَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ، وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.", source: "صحيح مسلم", count: 1 },
  { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.", source: "سنن الترمذي", count: 1 },
  { text: "سَيِّدُ الاِسْتِغْفَارِ أَنْ تَقُولَ: اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.", source: "صحيح البخاري", count: 1 },
  { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.", source: "سنن أبي داود", count: 1 },
  { text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.", source: "صحيح مسلم", count: 3 },
  { text: "قراءة سورة الإخلاص والمعوذتين (الفلق والناس).", source: "سنن الترمذي", count: 3 },
];

const eveningAdhkar = [
  { text: "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ، وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.", source: "صحيح مسلم", count: 1 },
  { text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ المَصِيرُ.", source: "سنن الترمذي", count: 1 },
  { text: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", source: "صحيح مسلم", count: 3 },
  { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.", source: "سنن أبي داود", count: 1 },
  { text: "قراءة آية الكرسي.", source: "صحيح الترغيب", count: 1 },
  { text: "قراءة سورة الإخلاص والمعوذتين (الفلق والناس).", source: "سنن الترمذي", count: 3 },
];

interface AdhkarCardProps {
    dhikr: { text: string; source: string; count?: number };
    isCompleted: boolean;
    onToggle: () => void;
    activeTab: 'morning' | 'evening';
}

const AdhkarCard: React.FC<AdhkarCardProps> = ({ dhikr, isCompleted, onToggle, activeTab }) => {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const getExplanation = async () => {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            setExplanation("مفتاح الواجهة البرمجية (API Key) غير معد. يرجى التأكد من إعداده للمتابعة.");
            setShowExplanation(true);
            return;
        }
        setIsLoading(true);
        setShowExplanation(true);
        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const type = activeTab === 'morning' ? 'الصباح' : 'المساء';
            const prompt = `اشرح هذا الذكر من أذكار ${type} شرحًا مبسطًا وواضحًا على طريقة كتاب "التفسير الميسر"، مع بيان فضله وأهميته: "${dhikr.text}"`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setExplanation(response.text);
        } catch (error) {
            console.error("Error fetching dhikr explanation:", error);
            setExplanation("عذرًا، حدث خطأ أثناء جلب الشرح. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleExplanation = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent the onToggle from firing
        if (!explanation && !isLoading) {
            getExplanation();
        } else {
            setShowExplanation(prev => !prev);
        }
    };

    return (
        <div
            onClick={onToggle}
            className={`cursor-pointer w-full text-right bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-4 transition-all duration-300 transform hover:scale-102 ${isCompleted ? 'opacity-50 bg-gray-50 dark:bg-gray-800/50' : ''}`}
            aria-pressed={isCompleted}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        >
            <p className={`text-xl leading-relaxed font-serif text-gray-800 dark:text-gray-100 ${isCompleted ? 'line-through' : ''}`}>{dhikr.text}</p>
            <div className="flex justify-between items-center mt-4">
                <span className="text-left text-sm text-primary dark:text-secondary font-mono">{dhikr.source}</span>
                {dhikr.count && dhikr.count > 1 && (
                     <span className="text-sm font-bold bg-secondary text-primary-dark px-2 py-1 rounded-full">{`تُقال ${dhikr.count} مرات`}</span>
                )}
            </div>
            
            <div className="mt-4 text-right">
                <button
                    onClick={handleToggleExplanation}
                    className="bg-primary/10 text-primary dark:bg-secondary/20 dark:text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-primary/20 dark:hover:bg-secondary/30 transition-colors text-sm"
                >
                    {showExplanation ? 'إخفاء الشرح' : 'شرح الذكر'}
                </button>
            </div>

            {showExplanation && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-loose">{explanation}</p>
                    )}
                </div>
            )}
        </div>
    );
};

const AdhkarPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
    const [completedAdhkar, setCompletedAdhkar] = useState<Set<string>>(new Set());

    const handleToggleDhikr = (dhikrText: string) => {
        setCompletedAdhkar(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dhikrText)) {
                newSet.delete(dhikrText);
            } else {
                newSet.add(dhikrText);
            }
            return newSet;
        });
    };
    
    const currentAdhkar = activeTab === 'morning' ? morningAdhkar : eveningAdhkar;

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-primary dark:text-white mb-6 border-b-2 border-primary/20 pb-4">
                أذكار الصباح والمساء
            </h2>

            <div className="flex justify-center mb-8 rounded-lg p-1 bg-gray-200 dark:bg-gray-700">
                <button 
                    onClick={() => setActiveTab('morning')}
                    className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${activeTab === 'morning' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    أذكار الصباح
                </button>
                <button 
                    onClick={() => setActiveTab('evening')}
                    className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${activeTab === 'evening' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    أذكار المساء
                </button>
            </div>
            
            <div>
                {currentAdhkar.map((dhikr, index) => (
                    <AdhkarCard
                        key={`${activeTab}-${index}`}
                        dhikr={dhikr}
                        isCompleted={completedAdhkar.has(dhikr.text)}
                        onToggle={() => handleToggleDhikr(dhikr.text)}
                        activeTab={activeTab}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdhkarPage;