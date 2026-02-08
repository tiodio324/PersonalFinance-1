import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, uiStore } from '@/store';
import { Card, Button, Table, Modal, Input, Select } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Category, Account, Budget, CategoryFormData, AccountFormData, BudgetFormData, AccountType } from '@/types';
import styles from './AdminPage.module.scss';

type AdminTab = 'categories' | 'accounts' | 'budgets';

export const AdminPage = observer(() => {
  const { 
    categories, 
    accounts, 
    budgets,
    activeCategories,
    loadAllData,
    createCategory,
    updateCategory,
    deleteCategory,
    createAccount,
    updateAccount,
    deleteAccount,
    createBudget,
    updateBudget,
    deleteBudget,
    getCategoryById,
    categoriesLoading,
    accountsLoading,
    budgetsLoading
  } = dataStore;

  const [activeTab, setActiveTab] = useState<AdminTab>('categories');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', type: 'expense', color: '#4CAF50', icon: '💰' });
  const [accountForm, setAccountForm] = useState<AccountFormData>({ name: '', type: 'card', balance: 0, currency: 'RUB', color: '#059669' });
  const [budgetForm, setBudgetForm] = useState<BudgetFormData>({ categoryId: '', amount: 0, period: 'monthly', startDate: new Date().toISOString().slice(0, 10) });

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const handleOpenModal = (mode: 'create' | 'edit', id?: string) => {
    setModalMode(mode);
    setEditingId(id || null);
    if (mode === 'edit' && id) {
      if (activeTab === 'categories') {
        const item = categories.find(c => c.id === id);
        if (item) setCategoryForm({ name: item.name, type: item.type, color: item.color, icon: item.icon });
      } else if (activeTab === 'accounts') {
        const item = accounts.find(a => a.id === id);
        if (item) setAccountForm({ name: item.name, type: item.type, balance: item.balance, currency: item.currency, color: item.color });
      } else {
        const item = budgets.find(b => b.id === id);
        if (item) setBudgetForm({ categoryId: item.categoryId, amount: item.amount, period: item.period, startDate: item.startDate });
      }
    } else {
      setCategoryForm({ name: '', type: 'expense', color: '#4CAF50', icon: '💰' });
      setAccountForm({ name: '', type: 'card', balance: 0, currency: 'RUB', color: '#059669' });
      setBudgetForm({ categoryId: activeCategories[0]?.id || '', amount: 0, period: 'monthly', startDate: new Date().toISOString().slice(0, 10) });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (activeTab === 'categories') {
      if (modalMode === 'edit' && editingId) await updateCategory(editingId, categoryForm);
      else await createCategory(categoryForm);
    } else if (activeTab === 'accounts') {
      if (modalMode === 'edit' && editingId) await updateAccount(editingId, accountForm);
      else await createAccount(accountForm);
    } else {
      if (modalMode === 'edit' && editingId) await updateBudget(editingId, budgetForm);
      else await createBudget(budgetForm);
    }
    setModalOpen(false);
    uiStore.showSuccess(modalMode === 'edit' ? 'Успешно обновлено' : 'Успешно создано');
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удаление', 'Вы уверены?', async () => {
      if (activeTab === 'categories') await deleteCategory(id);
      else if (activeTab === 'accounts') await deleteAccount(id);
      else await deleteBudget(id);
      uiStore.showSuccess('Удалено');
    });
  };

  const categoryColumns: TableColumn<Category>[] = [
    { key: 'name', title: 'Название', render: (c: Category) => c.name },
    { key: 'type', title: 'Тип', render: (c: Category) => c.type === 'income' ? 'Доход' : 'Расход' },
    { key: 'icon', title: 'Иконка', render: (c: Category) => c.icon },
    { key: 'actions', title: '', render: (c: Category) => (
      <div className={styles.actions}>
        <Button size="sm" onClick={() => handleOpenModal('edit', c.id)}>✏️</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>🗑️</Button>
      </div>
    )}
  ];

  const accountTypeLabels: Record<AccountType, string> = { cash: 'Наличные', card: 'Карта', savings: 'Сбережения', investment: 'Инвестиции' };
  
  const accountColumns: TableColumn<Account>[] = [
    { key: 'name', title: 'Название', render: (a: Account) => a.name },
    { key: 'type', title: 'Тип', render: (a: Account) => accountTypeLabels[a.type] || a.type },
    { key: 'balance', title: 'Баланс', render: (a: Account) => `${a.balance.toLocaleString()} ₽` },
    { key: 'actions', title: '', render: (a: Account) => (
      <div className={styles.actions}>
        <Button size="sm" onClick={() => handleOpenModal('edit', a.id)}>✏️</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>🗑️</Button>
      </div>
    )}
  ];

  const periodLabels = { monthly: 'Месяц', weekly: 'Неделя', yearly: 'Год' };

  const budgetColumns: TableColumn<Budget>[] = [
    { key: 'categoryId', title: 'Категория', render: (b: Budget) => getCategoryById(b.categoryId)?.name || '-' },
    { key: 'amount', title: 'Лимит', render: (b: Budget) => `${b.amount.toLocaleString()} ₽` },
    { key: 'period', title: 'Период', render: (b: Budget) => periodLabels[b.period] || b.period },
    { key: 'actions', title: '', render: (b: Budget) => (
      <div className={styles.actions}>
        <Button size="sm" onClick={() => handleOpenModal('edit', b.id)}>✏️</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}>🗑️</Button>
      </div>
    )}
  ];

  const tabs = [
    { id: 'categories' as AdminTab, label: 'Категории', count: categories.filter(c => c.isActive).length },
    { id: 'accounts' as AdminTab, label: 'Счета', count: accounts.filter(a => a.isActive).length },
    { id: 'budgets' as AdminTab, label: 'Бюджеты', count: budgets.filter(b => b.isActive).length },
  ];

  const isLoading = activeTab === 'categories' ? categoriesLoading : activeTab === 'accounts' ? accountsLoading : budgetsLoading;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Администрирование</h1>
        <Button variant="primary" onClick={() => handleOpenModal('create')}>
          + Добавить {activeTab === 'categories' ? 'категорию' : activeTab === 'accounts' ? 'счёт' : 'бюджет'}
        </Button>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button key={tab.id} className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label} <span className={styles.count}>{tab.count}</span>
          </button>
        ))}
      </div>

      <Card className={styles.tableCard}>
        {activeTab === 'categories' && <Table columns={categoryColumns} data={categories.filter(c => c.isActive)} keyField="id" loading={isLoading} />}
        {activeTab === 'accounts' && <Table columns={accountColumns} data={accounts.filter(a => a.isActive)} keyField="id" loading={isLoading} />}
        {activeTab === 'budgets' && <Table columns={budgetColumns} data={budgets.filter(b => b.isActive)} keyField="id" loading={isLoading} />}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'edit' ? 'Редактирование' : 'Создание'}>
        <div className={styles.form}>
          {activeTab === 'categories' && (
            <>
              <Input label="Название" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
              <Select label="Тип" options={[{ value: 'income', label: 'Доход' }, { value: 'expense', label: 'Расход' }]} 
                value={categoryForm.type} onChange={e => setCategoryForm({ ...categoryForm, type: e.target.value as 'income' | 'expense' })} />
              <Input label="Иконка" value={categoryForm.icon} onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })} />
              <Input label="Цвет" type="color" value={categoryForm.color} onChange={e => setCategoryForm({ ...categoryForm, color: e.target.value })} />
            </>
          )}
          {activeTab === 'accounts' && (
            <>
              <Input label="Название" value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} required />
              <Select label="Тип" options={[{ value: 'cash', label: 'Наличные' }, { value: 'card', label: 'Карта' }, { value: 'savings', label: 'Сбережения' }, { value: 'investment', label: 'Инвестиции' }]}
                value={accountForm.type} onChange={e => setAccountForm({ ...accountForm, type: e.target.value as AccountType })} />
              <Input label="Баланс" type="number" value={accountForm.balance} onChange={e => setAccountForm({ ...accountForm, balance: parseFloat(e.target.value) || 0 })} />
              <Input label="Цвет" type="color" value={accountForm.color} onChange={e => setAccountForm({ ...accountForm, color: e.target.value })} />
            </>
          )}
          {activeTab === 'budgets' && (
            <>
              <Select label="Категория" options={activeCategories.filter(c => c.type === 'expense').map(c => ({ value: c.id, label: c.name }))}
                value={budgetForm.categoryId} onChange={e => setBudgetForm({ ...budgetForm, categoryId: e.target.value })} />
              <Input label="Лимит" type="number" value={budgetForm.amount} onChange={e => setBudgetForm({ ...budgetForm, amount: parseFloat(e.target.value) || 0 })} />
              <Select label="Период" options={[{ value: 'weekly', label: 'Неделя' }, { value: 'monthly', label: 'Месяц' }, { value: 'yearly', label: 'Год' }]}
                value={budgetForm.period} onChange={e => setBudgetForm({ ...budgetForm, period: e.target.value as 'weekly' | 'monthly' | 'yearly' })} />
              <Input label="Дата начала" type="date" value={budgetForm.startDate} onChange={e => setBudgetForm({ ...budgetForm, startDate: e.target.value })} />
            </>
          )}
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button variant="primary" onClick={handleSubmit}>Сохранить</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});
