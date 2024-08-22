import { useTranslation } from 'react-i18next';

const Button = () => {
  const { t } = useTranslation();
  return (
    <button
        className="w-full flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
        type="submit"
    >
        {t('Save')}
    </button>    
  );
};

export default Button;
