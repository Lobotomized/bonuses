export interface Bonus {
    id: string;
    name: string;
    description: string;
    includedCountries: string[];
    excludedCountries: string[];
    minDeposits: number;
    maxDeposits: number;
    minAmount: number;
    maxAmount: number;
    isActive: boolean;
    }