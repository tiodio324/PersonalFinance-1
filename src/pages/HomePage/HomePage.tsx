import { observer } from 'mobx-react-lite';
import { dataStore, navigationStore, authStore } from '@/store';
import styles from './HomePage.module.scss';

export const HomePage = observer(() => {
  const { totalBalance, totalIncome, totalExpense, activeAccounts, activeBudgets, filteredTransactions } = dataStore;
  const recentTransactions = filteredTransactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.welcome}>
        <h1>Учёт личных финансов</h1>
        <p>Контролируйте свои доходы и расходы</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.balance}`}>
          <div className={styles.statIcon}>💳</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{formatCurrency(totalBalance)}</span>
            <span className={styles.statLabel}>Общий баланс</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.income}`}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{formatCurrency(totalIncome)}</span>
            <span className={styles.statLabel}>Доходы</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.expense}`}>
          <div className={styles.statIcon}>📉</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{formatCurrency(totalExpense)}</span>
            <span className={styles.statLabel}>Расходы</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏦</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{activeAccounts.length}</span>
            <span className={styles.statLabel}>Счетов</span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Последние транзакции</h2>
            <button 
              className={styles.viewAllBtn}
              onClick={() => navigationStore.navigate('transactions')}
            >
              Все транзакции →
            </button>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className={styles.transactionsList}>
              {recentTransactions.map(transaction => {
                const category = dataStore.getCategoryById(transaction.categoryId);
                const account = dataStore.getAccountById(transaction.accountId);
                return (
                  <div key={transaction.id} className={styles.transactionCard}>
                    <div className={styles.transactionIcon} style={{ backgroundColor: category?.color || '#e2e8f0' }}>
                      {category?.icon || '💵'}
                    </div>
                    <div className={styles.transactionInfo}>
                      <span className={styles.transactionDescription}>{transaction.description}</span>
                      <span className={styles.transactionMeta}>
                        {category?.name} • {account?.name}
                      </span>
                    </div>
                    <div className={`${styles.transactionAmount} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Нет транзакций</p>
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.section}>
            <h2>Счета</h2>
            <div className={styles.accountsList}>
              {activeAccounts.map(account => (
                <div key={account.id} className={styles.accountCard}>
                  <div className={styles.accountIcon} style={{ backgroundColor: account.color }}>
                    {account.type === 'cash' ? '💵' : account.type === 'card' ? '💳' : account.type === 'savings' ? '🏦' : '📈'}
                  </div>
                  <div className={styles.accountInfo}>
                    <span className={styles.accountName}>{account.name}</span>
                    <span className={styles.accountBalance}>{formatCurrency(account.balance)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {authStore.isAuthenticated && activeBudgets.length > 0 && (
            <div className={styles.section}>
              <h2>Бюджеты</h2>
              <div className={styles.budgetsList}>
                {activeBudgets.slice(0, 3).map(budget => {
                  const category = dataStore.getCategoryById(budget.categoryId);
                  const spent = dataStore.getBudgetSpent(budget.id);
                  const percentage = Math.min((spent / budget.amount) * 100, 100);
                  const isOverBudget = spent > budget.amount;

                  return (
                    <div key={budget.id} className={styles.budgetCard}>
                      <div className={styles.budgetHeader}>
                        <span>{category?.name || 'Категория'}</span>
                        <span className={isOverBudget ? styles.overBudget : ''}>
                          {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={`${styles.progressFill} ${isOverBudget ? styles.over : ''}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {authStore.isUser && (
            <div className={styles.section}>
              <h2>Быстрые действия</h2>
              <div className={styles.quickActions}>
                <button 
                  className={styles.actionBtn}
                  onClick={() => navigationStore.navigate('transactions')}
                >
                  ➕ Добавить транзакцию
                </button>
                <button 
                  className={styles.actionBtn}
                  onClick={() => navigationStore.navigate('reports')}
                >
                  📊 Отчёты
                </button>
                <button 
                  className={styles.actionBtn}
                  onClick={() => navigationStore.navigate('admin')}
                >
                  ⚙️ Настройки
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
