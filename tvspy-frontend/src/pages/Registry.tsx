import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import TableRegistry from '../components/Tables/TableRegistry';
import { useTranslation } from 'react-i18next';

const Registry = () => {
  const { t } = useTranslation();
  return (
    <>
      <Breadcrumb pageName={t('Registry')} />

      <div className="flex flex-col gap-10">
        <TableRegistry />
      </div>
    </>
  );
};

export default Registry;
