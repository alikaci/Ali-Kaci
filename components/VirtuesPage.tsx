import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Spinner from './Spinner';

const hadiths = [
  {
    text: "عَنْ عُثْمَانَ ـ رضى الله عنه ـ عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ: «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ».",
    source: "صحيح البخاري"
  },
  {
    text: "عن أبي أمامة الباهلي رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول: «اقرَؤوا القرآنَ فإنه يأتي يومَ القيامةِ شفيعًا لأصحابه».",
    source: "صحيح مسلم"
  },
  {
    text: "عن عائشة رضي الله عنها قالت: قال رسول الله صلى الله عليه وسلم: «الماهرُ بالقرآنِ مع السفرةِ الكرامِ البررةِ، والذي يقرأُ القرآنَ ويتتعتعُ فيه وهو عليه شاقٌّ له أجران».",
    source: "متفق عليه"
  },
  {
    text: "عن عمر بن الخطاب رضي الله عنه أن النبي صلى الله عليه وسلم قال: «إنَّ اللهَ يَرْفَعُ بِهذا الكِتابِ أقْوامًا، ويَضَعُ بِهِ آخَرِينَ».",
    source: "صحيح مسلم"
  }
];

const HadithCard: React.FC<{ hadith: { text: string; source: string } }> = ({ hadith }) => {
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
            const prompt = `اشرح هذا الحديث النبوي شرحًا مبسطًا وواضحًا على طريقة كتاب "التفسير الميسر"، مع التركيز على فضائل القرآن: "${hadith.text}"`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setExplanation(response.text);
        } catch (error) {
            console.error("Error fetching hadith explanation:", error);
            setExplanation("عذرًا، حدث خطأ أثناء جلب الشرح. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleExplanation = () => {
        if (!explanation && !isLoading) {
            getExplanation();
        } else {
            setShowExplanation(prev => !prev);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6 transition transform hover:scale-102">
            <p className="text-xl leading-relaxed text-right font-serif text-gray-800 dark:text-gray-100">{hadith.text}</p>
            <p className="text-left text-sm text-primary dark:text-secondary mt-4 font-mono">{hadith.source}</p>
            <div className="mt-4 text-right">
                <button
                    onClick={handleToggleExplanation}
                    className="bg-primary/10 text-primary dark:bg-secondary/20 dark:text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-primary/20 dark:hover:bg-secondary/30 transition-colors text-sm"
                >
                    {showExplanation ? 'إخفاء الشرح' : 'شرح الحديث'}
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

const VirtuesPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-primary dark:text-white mb-8 border-b-2 border-primary/20 pb-4">
        فضل القرآن الكريم
      </h2>
      <div>
        {hadiths.map((hadith, index) => (
          <HadithCard key={index} hadith={hadith} />
        ))}
      </div>
    </div>
  );
};

export default VirtuesPage;