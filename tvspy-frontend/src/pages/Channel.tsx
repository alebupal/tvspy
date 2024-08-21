import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import TableChannel from '../components/Tables/TableChannel';
import { useTranslation } from 'react-i18next';

const Channel = () => {
  const { t } = useTranslation();
  return (
    <>
      <Breadcrumb pageName={t('Channels')} />

      <div className="flex flex-col gap-10">
        <TableChannel />
      </div>
    </>
  );
};

export default Channel;
