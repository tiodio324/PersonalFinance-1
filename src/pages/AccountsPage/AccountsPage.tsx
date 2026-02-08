import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, uiStore } from '@/store';
import { Card, Button, Modal, Input, Select, Badge } from '@/components/UI';
import type { AccountFormData, AccountType } from '@/types';
import { getAccountTypeLabel } from '@/types';
import styles from './AccountsPage.module.scss';

const typeOptions = [{ value: 'cash', label: 'Наличные' }, { value: 'card', label: 'Карта' }, { value: 'savings', label: 'Сбережения' }, { value: 'investment', label: 'Инвестиции' }];

export const AccountsPage = observer(() => {
  const { activeAccounts, accountsLoading, totalBalance, createAccount, deleteAccount } = dataStore;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AccountFormData>({ name: '', type: 'card', balance: 0, currency: 'RUB', color: '#059669' });

  const resetForm = () => { setForm({ name: '', type: 'card', balance: 0, currency: 'RUB', color: '#059669' }); };

  const handleSave = async () => {
    if (!form.name) { uiStore.showError('Введите название'); return; }
    try { await createAccount(form); uiStore.showSuccess('Счёт создан'); setModalOpen(false); resetForm(); }
    catch { uiStore.showError('Ошибка'); }
  };

  const handleDelete = (id: string) => { uiStore.showConfirm('Удаление', 'Удалить счёт?', async () => { await deleteAccount(id); uiStore.showSuccess('Удалено'); }); };

  const formatMoney = (amount: number): string => amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Счета</h1><p className={styles.subtitle}>Управление счетами и балансами</p></div>
        <Button variant="primary" onClick={() => { resetForm(); setModalOpen(true); }}>Добавить счёт</Button>
      </div>

      <Card className={styles.totalCard}>
        <div className={styles.totalLabel}>Общий баланс</div>
        <div className={styles.totalValue}>{formatMoney(totalBalance)}</div>
      </Card>

      {accountsLoading ? <p>Загрузка...</p> : (
        <div className={styles.accountsGrid}>
          {activeAccounts.map(acc => (
            <Card key={acc.id} className={styles.accountCard}>
              <div className={styles.accountHeader}>
                <div className={styles.accountIcon} style={{ backgroundColor: acc.color }}>💳</div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(acc.id)}>🗑</Button>
              </div>
              <h3 className={styles.accountName}>{acc.name}</h3>
              <Badge variant="info">{getAccountTypeLabel(acc.type)}</Badge>
              <div className={styles.accountBalance}>{formatMoney(acc.balance)}</div>
            </Card>
          ))}
          {activeAccounts.length === 0 && <p className={styles.empty}>Нет счетов</p>}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Новый счёт"
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Создать</Button></div>}>
        <div className={styles.form}>
          <Input label="Название *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select label="Тип" options={typeOptions} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as AccountType })} />
          <Input label="Начальный баланс" type="number" value={form.balance} onChange={e => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} />
          <div className={styles.colorPicker}><label>Цвет</label><input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
});
