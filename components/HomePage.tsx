import React from 'react';
import type { Page } from '../App';

interface HomePageProps {
  setPage: (page: Page) => void;
}

const HomeButton: React.FC<{ onClick: () => void; children: React.ReactNode; icon: string; description: string }> = ({ onClick, children, icon, description }) => (
    <button
        onClick={onClick}
        className="w-full text-right bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-primary-dark dark:text-white border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-secondary hover:shadow-xl dark:hover:bg-gray-700/50 rounded-xl shadow-md p-4 flex flex-col justify-start gap-3 transition-all duration-300 transform hover:-translate-y-1"
        aria-label={children as string}
    >
        <div className="flex items-center gap-4">
            <span className="text-3xl sm:text-4xl">{icon}</span>
            <span className="font-bold text-md sm:text-lg text-gray-800 dark:text-gray-100">{children}</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 pr-1 sm:pr-0 sm:pl-12">{description}</p>
    </button>
);


const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  return (
    <div className="p-4 sm:p-8 animate-fade-in">
        <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-bold text-primary dark:text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_10%)]">
                المدرسة القرآنية لمسجد الأنصار
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">بوابتك التفاعلية لإتقان الحفظ</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <HomeButton onClick={() => setPage('test')} icon="📝" description="اختبر حفظك للآيات مع إخفاء بعض الكلمات.">
                بدء اختبار جديد
            </HomeButton>
            <HomeButton onClick={() => setPage('progress')} icon="📊" description="تتبع أدائك واطلع على سجل اختباراتك السابقة.">
                مراجعة التقدم
            </HomeButton>
             <HomeButton onClick={() => setPage('connect_verses')} icon="🔗" description="أكمل بداية الآية بناءً على نهاية الآية التي تسبقها.">
                اختبار وصل الآيات
            </HomeButton>
            <HomeButton onClick={() => setPage('competition')} icon="⚔️" description="تنافس مع صديقك في سرعة ودقة الحفظ.">
                مسابقة ثنائية
            </HomeButton>
             <HomeButton onClick={() => setPage('quran_reader')} icon="📚" description="تصفح وقراءة القرآن الكريم كاملاً.">
                قراءة القرآن
            </HomeButton>
            <HomeButton onClick={() => setPage('adhkar')} icon="📿" description="حصنك اليومي من أذكار الصباح والمساء الصحيحة.">
                أذكار الصباح والمساء
            </HomeButton>
            <HomeButton onClick={() => setPage('virtues')} icon="📖" description="تعرف على فضل قراءة القرآن وحفظه من السنة النبوية.">
                فضل القرآن
            </HomeButton>
            <HomeButton onClick={() => setPage('settings')} icon="⚙️" description="خصص تجربتك بتغيير مستوى الصعوبة، والصوت، والوضع الليلي.">
                الإعدادات
            </HomeButton>
        </div>
        <div className="max-w-2xl mx-auto mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">لتحربة أفضل، حمّل التطبيق على جهازك</p>
            <div className="flex justify-center items-center gap-4">
                <a href="#" className="inline-block bg-black text-white py-2 px-5 rounded-lg hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21.2,6.2c-0.5-0.6-1.2-1-2-1.2C17.6,4,15,4.2,14,5.2c-0.8,0.8-1.2,1.8-1,3c-0.2-0.1-0.5-0.2-0.7-0.2c-1.6,0-3,1.3-3,3 c0,0.4,0.1,0.8,0.2,1.2c-1.2,0.1-2.3,0.7-3,1.7c-1.3,1.5-1.3,3.8,0.1,5.3c0.7,0.7,1.6,1.1,2.6,1.1c0.9,0,1.8-0.3,2.5-0.9 c1.5-1.2,1.9-3.2,1-4.8c0.5,0,1-0.1,1.4-0.4c1.4-0.8,2-2.4,1.4-3.8c0.6,0.1,1.1,0.1,1.6,0.1c0.5,0,1-0.2,1.5-0.5 C22,8.9,22,7.2,21.2,6.2z M17.4,11.6c-0.5,0.9-1.6,1.2-2.5,0.7c-0.9-0.5-1.2-1.6-0.7-2.5c0.5-0.9,1.6-1.2,2.5-0.7 C17.6,9.6,17.9,10.7,17.4,11.6z M6.9,18.4c-0.4,0.4-1.1,0.3-1.4-0.1c-0.4-0.4-0.3-1.1,0.1-1.4c0.4-0.4,1.1-0.3,1.4,0.1 C7.3,17.4,7.3,18,6.9,18.4z M20,2H4C2.9,2,2,2.9,2,4v16c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"/></svg>
                        <span>App Store</span>
                    </div>
                </a>
                <a href="#" className="inline-block bg-black text-white py-2 px-5 rounded-lg hover:bg-gray-800 transition-colors">
                     <div className="flex items-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7.6,3.8L15,12L7.6,20.2V3.8 M21.5,12L16.6,9.3v5.5L21.5,12 M5,2C4,2,3,3,3,4v16c0,1,1,2,2,2h1c0.2,0,0.4-0.1,0.6-0.2 L15,12L5.6,2.2C5.4,2.1,5.2,2,5,2z"/></svg>
                        <span>Google Play</span>
                    </div>
                </a>
            </div>
        </div>
    </div>
  );
};

export default HomePage;