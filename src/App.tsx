import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { navigationStore, dataStore } from '@/store';
import { MainLayout, LoginModal, ConfirmModal, Toast } from '@/components';
import { HomePage, TransactionsPage, ReportsPage, AdminPage } from '@/pages';

const PageRouter = observer(() => {
  const { currentPage } = navigationStore;

  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'transactions':
      return <TransactionsPage />;
    case 'reports':
      return <ReportsPage />;
    case 'admin':
    case 'admin-categories':
    case 'admin-accounts':
    case 'admin-budgets':
      return <AdminPage />;
    default:
      return <HomePage />;
  }
});

const App = observer(() => {
  useEffect(() => {
    dataStore.loadAllData();
  }, []);

  return (
    <>
      <MainLayout>
        <PageRouter />
      </MainLayout>

      <LoginModal />
      <ConfirmModal />
      <Toast />
    </>
  );
});

export default App;
