import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import TableUser from '../components/Tables/TableUser';
import { useTranslation } from 'react-i18next';

const User = () => {
  const { t } = useTranslation();
  return (
    <>
      <Breadcrumb pageName={t('Users')} />

      <div className="flex flex-col gap-10">
        <TableUser />
      </div>
    </>
  );
};

export default User;
