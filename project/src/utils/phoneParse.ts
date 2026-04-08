/**
 * Lightweight phone normalization (no libphonenumber) — country hint from dial prefix only.
 */

const PREFIX_REGION: { maxLen: number; prefixes: Record<string, string> }[] = [
  {
    maxLen: 3,
    prefixes: {
      '1': 'United States / Canada',
      '7': 'Russia / Kazakhstan',
      '20': 'Egypt',
      '27': 'South Africa',
      '30': 'Greece',
      '31': 'Netherlands',
      '32': 'Belgium',
      '33': 'France',
      '34': 'Spain',
      '36': 'Hungary',
      '39': 'Italy',
      '40': 'Romania',
      '41': 'Switzerland',
      '43': 'Austria',
      '44': 'United Kingdom',
      '45': 'Denmark',
      '46': 'Sweden',
      '47': 'Norway',
      '48': 'Poland',
      '49': 'Germany',
      '51': 'Peru',
      '52': 'Mexico',
      '53': 'Cuba',
      '54': 'Argentina',
      '55': 'Brazil',
      '56': 'Chile',
      '57': 'Colombia',
      '58': 'Venezuela',
      '60': 'Malaysia',
      '61': 'Australia',
      '62': 'Indonesia',
      '63': 'Philippines',
      '64': 'New Zealand',
      '65': 'Singapore',
      '66': 'Thailand',
      '81': 'Japan',
      '82': 'South Korea',
      '84': 'Vietnam',
      '86': 'China',
      '90': 'Turkey',
      '91': 'India',
      '92': 'Pakistan',
      '93': 'Afghanistan',
      '94': 'Sri Lanka',
      '95': 'Myanmar',
      '98': 'Iran',
      '212': 'Morocco',
      '213': 'Algeria',
      '234': 'Nigeria',
      '254': 'Kenya',
      '255': 'Tanzania',
      '256': 'Uganda',
      '260': 'Zambia',
      '263': 'Zimbabwe',
      '351': 'Portugal',
      '352': 'Luxembourg',
      '353': 'Ireland',
      '354': 'Iceland',
      '355': 'Albania',
      '358': 'Finland',
      '359': 'Bulgaria',
      '370': 'Lithuania',
      '371': 'Latvia',
      '372': 'Estonia',
      '380': 'Ukraine',
      '381': 'Serbia',
      '385': 'Croatia',
      '386': 'Slovenia',
      '420': 'Czech Republic',
      '421': 'Slovakia',
      '852': 'Hong Kong',
      '853': 'Macau',
      '855': 'Cambodia',
      '856': 'Laos',
      '880': 'Bangladesh',
      '886': 'Taiwan',
      '960': 'Maldives',
      '961': 'Lebanon',
      '962': 'Jordan',
      '963': 'Syria',
      '964': 'Iraq',
      '965': 'Kuwait',
      '966': 'Saudi Arabia',
      '967': 'Yemen',
      '968': 'Oman',
      '971': 'United Arab Emirates',
      '972': 'Israel',
      '973': 'Bahrain',
      '974': 'Qatar',
      '975': 'Bhutan',
      '976': 'Mongolia',
      '977': 'Nepal',
      '992': 'Tajikistan',
      '993': 'Turkmenistan',
      '994': 'Azerbaijan',
      '995': 'Georgia',
      '996': 'Kyrgyzstan',
      '998': 'Uzbekistan',
    },
  },
];

export interface PhoneParseResult {
  e164ish: string;
  digitsOnly: string;
  regionGuess: string | null;
  nationalLength: number;
  validLength: boolean;
}

export function parsePhoneInput(raw: string): PhoneParseResult {
  const trimmed = raw.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  let e164ish = trimmed.startsWith('+') ? `+${digitsOnly}` : digitsOnly;

  let regionGuess: string | null = null;
  if (digitsOnly.length >= 2) {
    const withoutLeadingZeros = digitsOnly.replace(/^0+/, '') || digitsOnly;
    const tryDigits = withoutLeadingZeros.startsWith('1') && withoutLeadingZeros.length >= 11
      ? withoutLeadingZeros
      : withoutLeadingZeros;

    for (let len = 3; len >= 1; len--) {
      const prefix = tryDigits.slice(0, len);
      const row = PREFIX_REGION[0].prefixes[prefix];
      if (row) {
        regionGuess = row;
        break;
      }
    }
  }

  const nationalLength = digitsOnly.length;
  const validLength = nationalLength >= 8 && nationalLength <= 15;

  return { e164ish, digitsOnly, regionGuess, nationalLength, validLength };
}
