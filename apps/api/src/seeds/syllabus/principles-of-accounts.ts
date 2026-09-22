import type { SubjectSeedData } from './types'

/**
 * Principles of Accounts — JAMB, and Financial Accounting for WAEC and NECO.
 *
 * Follows the usual scheme of work: the double-entry foundation and the books
 * it runs through, then the sole trader's final accounts and their
 * adjustments, then the special accounts built on them (manufacturing,
 * not-for-profit, departmental, branch), then partnerships and companies, and
 * finally interpretation and public-sector accounting.
 */
export const principlesOfAccounts: SubjectSeedData = {
  slug: 'principles-of-accounts',
  name: 'Principles of Accounts',
  hue: '#7A3F6B',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Principles of Accounts for JAMB (Financial Accounting for WAEC and NECO): double entry, books of original entry, final accounts and adjustments, special accounts, partnerships, companies, and public-sector accounting.',
  topics: [
    {
      slug: 'nature-of-accounting',
      name: 'Nature and Significance of Accounting',
      order: 1,
      description:
        'What bookkeeping and accounting are, the users of accounting information, the accounting profession, and the concepts and conventions accounts are built on.',
      estimatedMinutes: 45,
      prerequisiteSlugs: [],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'double-entry',
      name: 'Principles of Double Entry',
      order: 2,
      description:
        'The accounting equation, debit and credit rules, and how ledger accounts are opened, posted, balanced and classified.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['nature-of-accounting'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'books-of-original-entry',
      name: 'Source Documents and Books of Original Entry',
      order: 3,
      description:
        'Invoices, receipts, credit and debit notes, and the day books and general journal that record transactions before they reach the ledger.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['double-entry'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'cash-book',
      name: 'Cash Book and Petty Cash',
      order: 4,
      description:
        'Single, two- and three-column cash books, discounts, contra entries, and the imprest petty cash system.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['books-of-original-entry'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'bank-reconciliation',
      name: 'Bank Reconciliation Statement',
      order: 5,
      description:
        'Why the cash book and bank statement disagree - unpresented and uncredited cheques, bank charges, direct credits - and how to reconcile them.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['cash-book'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'trial-balance-and-errors',
      name: 'Trial Balance, Errors and Suspense Account',
      order: 6,
      description:
        'Extracting a trial balance, the errors it does and does not reveal, correcting them through the journal, and the suspense account.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['double-entry'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'final-accounts',
      name: 'Final Accounts of a Sole Trader',
      order: 7,
      description:
        'The trading account, profit and loss account and balance sheet: cost of sales, gross and net profit, and capital and revenue items.',
      estimatedMinutes: 65,
      prerequisiteSlugs: ['trial-balance-and-errors'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'adjustments-and-depreciation',
      name: 'Adjustments and Depreciation',
      order: 8,
      description:
        'Accruals and prepayments, bad debts and provision for doubtful debts, and depreciation by the straight-line and reducing-balance methods.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['final-accounts'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'stock-valuation',
      name: 'Stock Valuation',
      order: 9,
      description:
        'Valuing closing stock by FIFO, LIFO, simple and weighted average, and how the choice moves gross profit.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['final-accounts'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'control-accounts',
      name: 'Control Accounts',
      order: 10,
      description:
        'Sales and purchases ledger control accounts, what goes on each side, and how they localise errors.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['books-of-original-entry'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'incomplete-records',
      name: 'Incomplete Records and Single Entry',
      order: 11,
      description:
        'Statements of affairs, finding profit from changes in capital, and rebuilding sales, purchases and expenses from partial records.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['final-accounts'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'manufacturing-accounts',
      name: 'Manufacturing Accounts',
      order: 12,
      description:
        'Prime cost, factory overheads, work in progress and the cost of goods manufactured, and transfers to the trading account at cost or a mark-up.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['final-accounts'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'not-for-profit-accounts',
      name: 'Accounts of Not-for-Profit Organisations',
      order: 13,
      description:
        'Receipts and payments accounts, income and expenditure accounts, subscriptions in arrears and in advance, and the accumulated fund.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['final-accounts'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'departmental-accounts',
      name: 'Departmental Accounts',
      order: 14,
      description:
        'Trading and profit and loss accounts by department, and apportioning shared expenses on a fair basis.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['final-accounts'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'branch-accounts',
      name: 'Branch Accounts',
      order: 15,
      description:
        'Goods sent to branches at cost or selling price, the branch stock and adjustment accounts, and head office and branch current accounts.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['final-accounts'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'joint-ventures',
      name: 'Joint Venture Accounts',
      order: 16,
      description:
        'Recording a short-term venture shared by two or more parties, and dividing its profit or loss.',
      estimatedMinutes: 35,
      prerequisiteSlugs: ['double-entry'],
      examWeight: 0.02,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'partnership-accounts',
      name: 'Partnership Accounts',
      order: 17,
      description:
        'Capital and current accounts, the appropriation account, goodwill, admission and retirement of partners, dissolution and conversion to a company.',
      estimatedMinutes: 70,
      prerequisiteSlugs: ['adjustments-and-depreciation'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'company-accounts',
      name: 'Company Accounts',
      order: 18,
      description:
        'Share capital and its issue, share premium, debentures, reserves, dividends, and the final accounts of a limited company.',
      estimatedMinutes: 70,
      prerequisiteSlugs: ['adjustments-and-depreciation'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'interpretation-of-accounts',
      name: 'Interpretation of Financial Statements',
      order: 19,
      description:
        'Profitability, liquidity and gearing ratios, stock turnover, and what the ratios say about a business.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['final-accounts'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'public-sector-accounting',
      name: 'Public Sector Accounting',
      order: 20,
      description:
        'Government funds, the consolidated revenue fund, capital and recurrent expenditure, warrants and the budget, and who audits public accounts.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['nature-of-accounting'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'accounting-technology',
      name: 'Information Technology in Accounting',
      order: 21,
      description:
        'Computerised accounting systems, accounting packages, and their advantages and risks.',
      estimatedMinutes: 30,
      prerequisiteSlugs: ['double-entry'],
      examWeight: 0.02,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
