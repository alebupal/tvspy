import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import axios from 'axios';
import Loader from '../../common/Loader/index';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/apiConfig';

interface User {
    username: string;
}

const TableUser: React.FC = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.USER);
                setUser(response.data.entries);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const columns = [
        {
            name: t('Username'),
            selector: (row: User) => row.username,
            sortable: true,
        },
    ];

    const tableData = {
      columns,
      data: user,
    };

    if (loading) return <Loader/>;
    if (error) return <div className="text-red-500"><p>{t('Error')}: {error}</p></div>;

    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <DataTableExtensions
            {...tableData}
            export={false}
            print={false}
            filterPlaceholder={t('Search')}
        >
          <DataTable
              columns={columns}
              data={user}
              pagination
              highlightOnHover
              pointerOnHover
              paginationComponentOptions={{
                  rowsPerPageText: t('Rows per page'),
                  rangeSeparatorText: t('of'),
                  selectAllRowsItem: true,
                  selectAllRowsItemText: t('All'),
              }}
              noDataComponent={t('No data available')}
            />
        </DataTableExtensions>
      </div>
    );
};

export default TableUser;
