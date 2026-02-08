import { observer } from 'mobx-react-lite';
import { dataStore } from '@/store';
import { Card } from '@/components/UI';
import styles from './ReportsPage.module.scss';

export const ReportsPage = observer(() => {
  const { filteredTransactions, getCategoryById } = dataStore;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = filteredTransactions.filter(t => t.date.startsWith(currentMonth));
  const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const expensesByCategory = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => { acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount; return acc; }, {});

  const sortedExpenses = Object.entries(expensesByCategory)
    .map(([categoryId, amount]) => ({ category: getCategoryById(categoryId), amount }))
    .filter(e => e.category)
    .sort((a, b) => b.amount - a.amount);

  const maxExpense = sortedExpenses.length > 0 ? sortedExpenses[0].amount : 1;
  const formatMoney = (amount: number): string => amount.toLocaleString('ru-RU') + ' ₽';
  const savings = monthIncome - monthExpense;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Отчёты</h1>
        <p className={styles.subtitle}>Аналитика за текущий месяц</p>
      </div>

      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Доходы</div>
          <div className={`${styles.summaryValue} ${styles.income}`}>{formatMoney(monthIncome)}</div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Расходы</div>
          <div className={`${styles.summaryValue} ${styles.expense}`}>{formatMoney(monthExpense)}</div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Баланс месяца</div>
          <div className={`${styles.summaryValue} ${savings >= 0 ? styles.income : styles.expense}`}>
            {savings >= 0 ? '+' : ''}{formatMoney(savings)}
          </div>
        </Card>
      </div>

      <Card className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Расходы по категориям</h2>
        {sortedExpenses.length > 0 ? (
          <div className={styles.barChart}>
            {sortedExpenses.map(({ category, amount }) => (
              <div key={category!.id} className={styles.barRow}>
                <div className={styles.barLabel}><span className={styles.barIcon} style={{ backgroundColor: category!.color }}>{category!.icon}</span>{category!.name}</div>
                <div className={styles.barContainer}>
                  <div className={styles.bar} style={{ width: `${(amount / maxExpense) * 100}%`, backgroundColor: category!.color }} />
                </div>
                <div className={styles.barValue}>{formatMoney(amount)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Нет данных о расходах</p>
        )}
      </Card>
    </div>
  );
});
