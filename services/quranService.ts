import { Surah, Verse } from '../types';

const API_BASE_URL = 'https://api.alquran.cloud/v1';

interface ApiSurahListResponse {
  data: Surah[];
}

interface ApiSurahEdition {
    ayahs: {
        number: number;
        text: string;
        numberInSurah: number;
        audio?: string;
    }[];
}

interface ApiSurahVersesResponse {
  data: ApiSurahEdition[];
}

export const getSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/surah`);
    if (!response.ok) {
      throw new Error('Failed to fetch surahs');
    }
    const data: ApiSurahListResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return [];
  }
};

export const getSurahVerses = async (surahNumber: number): Promise<Verse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,ar.abdulbasitmurattal`);
    if (!response.ok) {
      throw new Error(`Failed to fetch verses for surah ${surahNumber}`);
    }
    const data: ApiSurahVersesResponse = await response.json();
    const textEdition = data.data[0];
    const audioEdition = data.data[1];

    const verses: Verse[] = textEdition.ayahs.map((ayah, index) => ({
      number: ayah.number,
      text: ayah.text,
      numberInSurah: ayah.numberInSurah,
      audio: audioEdition.ayahs[index].audio || '',
    }));
    
    return verses;

  } catch (error) {
    console.error(`Error fetching verses for surah ${surahNumber}:`, error);
    return [];
  }
};