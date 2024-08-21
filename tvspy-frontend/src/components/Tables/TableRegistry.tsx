import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import axios from 'axios';
import Loader from '../../common/Loader/index';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/apiConfig';

interface Registry {
    val: string;
}

const TableRegistry: React.FC = () => {
    const { t } = useTranslation();
    const [registry, setRegistry] = useState<Registry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.REGISTRY);
                setRegistry(response.data);
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

        fetchRegistry();
    }, []);

    const columns = [
        {
            name: t('Username'),
            selector: row => t(row.username),
            sortable: true,
        },
        {
            name: t('Channel'),
            selector: row => t(row.channel),
            sortable: true,
        },
        {
            name: t('Hostname'),
            selector: row => t(row.hostname),
            sortable: true,
        },
        {
            name: t('Client'),
            selector: row => t(row.client),
            sortable: true,
        },
        {
            name: t('Service'),
            selector: row => t(row.service),
            sortable: true,
        },
        {
            name: t('Erros'),
            selector: row => t(row.errors),
            sortable: true,
        },
        {
            name: t('Total in'),
            selector: row => t(row.total_in),
            sortable: true,
        },
        {
            name: t('Start'),
            selector: row => t(row.start),
            sortable: true,
        },
        {
            name: t('End'),
            selector: row => t(row.end),
            sortable: true,
        }
    ];

    const tableData = {
      columns,
      data: registry,
    };

    if (loading) return <Loader/>;
    if (error) return <p>{t('Error')}: {error}</p>;

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
              data={registry}
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

export default TableRegistry;
