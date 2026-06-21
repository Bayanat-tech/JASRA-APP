export const countryCityData = {
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'],
  Qatar: ['Doha', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Al Rayyan'],
  Oman: ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur'],
  Kuwait: ['Kuwait City', 'Jahrah', 'Salmiya', 'Hawally'],
  Bahrain: ['Manama', 'Riffa', 'Muharraq', 'Hamad Town']
};

export const countries = Object.keys(countryCityData);
export const getCities = (country: string) => countryCityData[country as keyof typeof countryCityData] || [];
