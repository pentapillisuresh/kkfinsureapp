// KK FINSURE – Mock Data

export const INVESTOR = {
  investorId: 'KK10245',
  name: 'Suresh Kumar',
  mobile: '+91 98765 43210',
  email: 'suresh.kumar@email.com',
  dob: '15 Mar 1980',
  gender: 'Male',
  address: {
    house: 'B-204',
    street: 'MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  bank: {
    bankName: 'HDFC Bank',
    accountNumber: '****  ****  4521',
    ifsc: 'HDFC0001234',
    branch: 'Bandra West',
  },
  nominee: {
    name: 'Priya Kumar',
    relationship: 'Spouse',
    mobile: '+91 98765 11111',
  },
  username: 'rajesh.kumar',
  tier: 'Premium Investor',
};

export const INVESTMENTS = [
  {
    id: 'INV0001',
    product: 'Falcon Hedge Fund',
    amount: 100000,
    roi: 4,
    monthlyROI: 4000,
    investmentDate: '01 Jan 2026',
    maturityDate: '01 Jan 2028',
    status: 'Active',
    agreementUrl: null,
    certificateUrl: null,
  },
  {
    id: 'INV0002',
    product: 'Falcon Hedge Fund',
    amount: 300000,
    roi: 3,
    monthlyROI: 9000,
    investmentDate: '01 Mar 2026',
    maturityDate: '01 Mar 2028',
    status: 'Active',
    agreementUrl: null,
    certificateUrl: null,
  },
];

export const PORTFOLIO_SUMMARY = {
  totalInvestment: 400000,
  monthlyROI: 13000,
  receivedROI: 30000,
  pendingROI: 13000,
  totalProducts: 1,
  maturityDate: '01 Jan 2028',
};

export const ROI_HISTORY = [
  { month: 'Jan 2026', investment: 100000, roi: 4000, status: 'Paid' },
  { month: 'Feb 2026', investment: 100000, roi: 4000, status: 'Paid' },
  { month: 'Mar 2026', investment: 400000, roi: 13000, status: 'Paid' },
  { month: 'Apr 2026', investment: 400000, roi: 13000, status: 'Pending' },
  { month: 'May 2026', investment: 400000, roi: 13000, status: 'Pending' },
];

export const ROI_BAR_DATA = [
  { month: 'Jan', amount: 4000 },
  { month: 'Feb', amount: 4000 },
  { month: 'Mar', amount: 13000 },
  { month: 'Apr', amount: 13000 },
  { month: 'May', amount: 13000 },
];

export const GROWTH_DATA = [
  { month: 'Jan', amount: 100000 },
  { month: 'Mar', amount: 400000 },
  { month: 'Jun', amount: 400000 },
  { month: 'Dec', amount: 700000 },
];

export const QUARTERLY_PERFORMANCE = [
  { quarter: 'Q1', performance: 8 },
  { quarter: 'Q2', performance: 10 },
  { quarter: 'Q3', performance: 9 },
  { quarter: 'Q4', performance: 11 },
];

export const DOCUMENTS = {
  kyc: [
    { name: 'PAN Card', date: '01 Jan 2026', type: 'KYC' },
    { name: 'Aadhaar Card', date: '01 Jan 2026', type: 'KYC' },
    { name: 'Passport Photo', date: '01 Jan 2026', type: 'KYC' },
    { name: 'Signature', date: '01 Jan 2026', type: 'KYC' },
  ],
  investment: [
    { name: 'Investment Agreement (INV0001)', date: '01 Jan 2026', type: 'Agreement' },
    { name: 'Investment Certificate (INV0001)', date: '01 Jan 2026', type: 'Certificate' },
    { name: 'Investment Agreement (INV0002)', date: '01 Mar 2026', type: 'Agreement' },
    { name: 'Investment Certificate (INV0002)', date: '01 Mar 2026', type: 'Certificate' },
  ],
  statements: [
    { name: 'Monthly Statement – Mar 2026', date: '01 Apr 2026', type: 'Statement' },
    { name: 'Quarterly Report Q1 2026', date: '15 Apr 2026', type: 'Report' },
    { name: 'Annual Statement 2025', date: '01 Jan 2026', type: 'Annual' },
  ],
  company: [
    { name: 'SEBI Registration', date: '01 Jan 2025', type: 'Compliance' },
    { name: 'PMS Certificate', date: '01 Jan 2025', type: 'Compliance' },
    { name: 'AIF Certificate', date: '01 Jan 2025', type: 'Compliance' },
    { name: 'NSE Membership', date: '01 Jan 2025', type: 'Compliance' },
    { name: 'BSE Membership', date: '01 Jan 2025', type: 'Compliance' },
  ],
};

export const OFFERS = [
  {
    id: '1',
    title: 'Festival Cashback',
    description:
      'Get 2% cashback on your next top-up investment above ₹1 Lakh during the festive season.',
    expiry: 'Valid till 31 Aug 2026',
    tag: 'CASHBACK',
    eligible: true,
  },
  {
    id: '2',
    title: 'Gift Voucher',
    description:
      'Receive a ₹5,000 Amazon gift voucher on completing 6 months of continuous investment.',
    expiry: 'Valid till 30 Jul 2026',
    tag: 'GIFT',
    eligible: true,
  },
  {
    id: '3',
    title: 'Special Cashback',
    description: 'Exclusive 1.5% bonus ROI for quarterly reinvestment of matured funds.',
    expiry: 'Valid till 15 Aug 2026',
    tag: 'BONUS ROI',
    eligible: false,
  },
  {
    id: '4',
    title: 'Monthly Login Rewards',
    description: 'Login daily for 30 days to earn 500 reward points redeemable as cashback.',
    expiry: 'Ongoing',
    tag: 'REWARDS',
    eligible: true,
  },
];

export const REFERRAL = {
  referralId: 'KK10245',
  referralLink: 'https://kkfinsure.com/ref/KK10245',
  totalReferrals: 15,
  successfulInvestments: 8,
  referralPoints: 8000,
  referralEarnings: 8000,
  history: [
    { name: 'Amit Sharma', amount: 100000, date: '15 Feb 2026', points: 1000, status: 'Converted' },
    { name: 'Priya Mehta', amount: 200000, date: '01 Mar 2026', points: 2000, status: 'Converted' },
    { name: 'Suresh Rao', amount: 150000, date: '20 Mar 2026', points: 1500, status: 'Converted' },
    { name: 'Neha Gupta', amount: 500000, date: '05 Apr 2026', points: 5000, status: 'Pending' },
    { name: 'Ravi Joshi', amount: 0, date: '10 Apr 2026', points: 0, status: 'Invited' },
  ],
};

export const NOTIFICATIONS = [
  {
    id: '1',
    title: 'ROI Credited',
    description: '₹13,000 Monthly ROI for Mar 2026 has been credited to your account.',
    datetime: '01 Apr 2026, 10:00 AM',
    read: false,
    type: 'roi',
  },
  {
    id: '2',
    title: 'New Investment Added',
    description: 'Your investment of ₹3,00,000 in Falcon Hedge Fund has been activated (INV0002).',
    datetime: '01 Mar 2026, 09:30 AM',
    read: false,
    type: 'investment',
  },
  {
    id: '3',
    title: 'Quarterly Report Available',
    description: 'Q1 2026 Quarterly Performance Report is now available in Documents.',
    datetime: '15 Apr 2026, 11:00 AM',
    read: true,
    type: 'document',
  },
  {
    id: '4',
    title: 'New Offer',
    description:
      'Festival Cashback Offer – Get 2% cashback on top-up investments. Valid till 31 Aug 2026.',
    datetime: '10 Apr 2026, 08:00 AM',
    read: true,
    type: 'offer',
  },
  {
    id: '5',
    title: 'Maturity Reminder',
    description:
      'Your investment INV0001 (₹1,00,000) matures on 01 Jan 2028. Plan your reinvestment.',
    datetime: '17 Jul 2026, 09:00 AM',
    read: false,
    type: 'maturity',
  },
];
