import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { dataStore, uiStore } from '@/store';
import { TransactionFormData } from '@/types';
import styles from './TransactionsPage.module.scss';

export const TransactionsPage = observer(() => {
  const { filteredTransactions, activeAccounts, incomeCategories, expenseCategories, transactionsLoading } = dataStore;
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    categoryId: '',
    accountId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    dataStore.setFilter('search', value || undefined);
  };

  const handleTypeFilter = (type: 'all' | 'income' | 'expense') => {
    setTypeFilter(type);
    dataStore.setFilter('type', type === 'all' ? undefined : type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.categoryId || !form.accountId) return;

    const result = await dataStore.createTransaction(form);
    if (result) {
      uiStore.showToast('success', 'Транзакция добавлена');
      setForm({
        type: 'expense',
        amount: 0,
        categoryId: '',
        accountId: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
    }
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удалить транзакцию?', 'Это действие нельзя отменить', async () => {
      const success = await dataStore.deleteTransaction(id);
      if (success) {
        uiStore.showToast('success', 'Транзакция удалена');
      }
    });
  };

  const availableCategories = form.type === 'income' ? incomeCategories : expenseCategories;

  if (transactionsLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка транзакций...</p>
      </div>
    );
  }

  return (
    <div className={styles.transactionsPage}>
      <div className={styles.header}>
        <h1>💳 Транзакции</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Отмена' : '➕ Добавить'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.typeSelector}>
              <button
                type="button"
                className={`${styles.typeBtn} ${form.type === 'expense' ? styles.active : ''}`}
                onClick={() => setForm({ ...form, type: 'expense', categoryId: '' })}
              >
                📉 Расход
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${form.type === 'income' ? styles.active : ''}`}
                onClick={() => setForm({ ...form, type: 'income', categoryId: '' })}
              >
                📈 Доход
              </button>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Сумма *</label>
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Дата *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Категория *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">Выберите категорию</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Счёт *</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                required
              >
                <option value="">Выберите счёт</option>
                {activeAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Описание</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Описание транзакции"
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Добавить транзакцию
          </button>
        </form>
      )}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Поиск по описанию..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        <div className={styles.typeFilters}>
          <button
            className={`${styles.filterBtn} ${typeFilter === 'all' ? styles.active : ''}`}
            onClick={() => handleTypeFilter('all')}
          >
            Все
          </button>
          <button
            className={`${styles.filterBtn} ${typeFilter === 'income' ? styles.active : ''}`}
            onClick={() => handleTypeFilter('income')}
          >
            📈 Доходы
          </button>
          <button
            className={`${styles.filterBtn} ${typeFilter === 'expense' ? styles.active : ''}`}
            onClick={() => handleTypeFilter('expense')}
          >
            📉 Расходы
          </button>
        </div>
      </div>

      {filteredTransactions.length > 0 ? (
        <div className={styles.transactionsList}>
          {filteredTransactions.map(transaction => {
            const category = dataStore.getCategoryById(transaction.categoryId);
            const account = dataStore.getAccountById(transaction.accountId);
            return (
              <div key={transaction.id} className={styles.transactionCard}>
                <div className={styles.transactionIcon} style={{ backgroundColor: category?.color || '#e2e8f0' }}>
                  {category?.icon || '💵'}
                </div>
                <div className={styles.transactionInfo}>
                  <span className={styles.transactionDescription}>
                    {transaction.description || category?.name || 'Без описания'}
                  </span>
                  <span className={styles.transactionMeta}>
                    {new Date(transaction.date).toLocaleDateString('ru-RU')} • {account?.name}
                  </span>
                </div>
                <div className={`${styles.transactionAmount} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(transaction.id)}
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h3>Транзакции не найдены</h3>
          <p>Добавьте первую транзакцию или измените фильтры</p>
        </div>
      )}
    </div>
  );
});
