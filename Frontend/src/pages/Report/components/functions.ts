export const  spellNumber = (value?: number, currencyCode: string = 'QAR'): string => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return '';
  const ones  = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens  = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const currencyMap: Record<string, { major: string; minor: string }> = {
    QAR: { major: 'Qatari Riyal', minor: 'Dirham' },
    USD: { major: 'US Dollar',    minor: 'Cent'    },
    EUR: { major: 'Euro',         minor: 'Cent'    },
    AED: { major: 'UAE Dirham',   minor: 'Fils'    },
    SAR: { major: 'Saudi Riyal',  minor: 'Halala'  },
    OMR: { major: 'Omani Rial',   minor: 'Baisa'   },
    INR: { major: 'Rupee',        minor: 'Paise'   },
  };
  const currency = currencyMap[currencyCode?.toUpperCase()] ?? currencyMap['QAR'];
  const convertHundreds = (n: number): string => {
    let result = '';
    if (n >= 100) { result += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20)  { result += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    else if (n >= 10) { result += teens[n - 10] + ' '; n = 0; }
    if (n > 0) result += ones[n] + ' ';
    return result.trim();
  };
  const convertNumber = (n: number): string => {
    if (n === 0) return '';
    const places = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
    let word = ''; let i = 0;
    while (n > 0) {
      const chunk = n % 1000;
      if (chunk) word = `${convertHundreds(chunk)} ${places[i]} ${word}`.trim();
      n = Math.floor(n / 1000); i++;
    }
    return word.trim();
  };
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let majorText = convertNumber(intPart);
  let minorText = decPart ? convertHundreds(decPart) : '';
  majorText = !majorText ? `No ${currency.major}` : majorText === 'One' ? `One ${currency.major}` : `${majorText} ${currency.major}s`;
  minorText = minorText ? (minorText === 'One' ? ` and One ${currency.minor}` : ` and ${minorText} ${currency.minor}s`) : '';
  return `${majorText}${minorText} only`.replace(/\s+/g, ' ').trim();
};

export const formatAmount = (value?: number | string): number => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return 0;
  return Number(amount.toFixed(2));
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr.trim())) return dateStr.trim();
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime())
    ? dateStr
    : parsed.toLocaleDateString('en-GB');
};