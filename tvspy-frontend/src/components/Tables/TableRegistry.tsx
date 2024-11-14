import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import axios from 'axios';
import Loader from '../../common/Loader/index';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { useFormatter } from '../../utils/formatters';
import { useDebug } from '../../context/DebugContext';

interface Registry {
    username: string;
    channel: string;
    hostname: string;
    client: string;
    service: string;
    title: string;
    errors: string;
    total_in: number;
    start: string;
    end: string;
}

const TableRegistry: React.FC = () => {
    const { t } = useTranslation();
    const { formatBytes } = useFormatter();
    const { debugMode } = useDebug();
    const [registry, setRegistry] = useState<Registry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.REGISTRY);

                if (debugMode) {
                    console.log('TableRegistry', response);
                }

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
            selector: row => row.username,
            sortable: true,
            wrap: true,      
        },
        {
            name: t('Channel'),
            selector: row => row.channel,
            sortable: true,
            wrap: true              
        },
        {
            name: t('Hostname'),
            selector: row => row.hostname,
            sortable: true,
            wrap: true              
        },
        {
            name: t('Client'),
            selector: row => row.client,
            sortable: true,
            wrap: true     
        },
        {
            name: t('Service'),
            selector: row => row.service,
            sortable: true,
            wrap: true   
        },
        {
            name: t('Title'),
            selector: row => row.title,
            sortable: true,
            wrap: true   
        },
        {
            name: t('Errors'),
            selector: row => row.errors,
            sortable: true,
            wrap: true   
        },
        {
            name: t('Total in'),
            selector: row => formatBytes(row.total_in),
            sortable: true,
            wrap: true           
        },
        {
            name: t('Start'),
            selector: row => row.start,
            sortable: true,
            wrap: true,
        },
        {
            name: t('End'),
            selector: row => row.end,
            sortable: true,
            wrap: true   
        }
    ];

    const tableData = {
      columns,
      data: registry,
    };

    if (loading) return <Loader/>;
    if (error) return <div className="text-red-500"><p>{t('Error')}: {error}</p></div>;

    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1" style={{ overflowX: 'auto' }}>
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
                dense={false}
                paginationComponentOptions={{
                    rowsPerPageText: t('Rows per page'),
                    rangeSeparatorText: t('of'),
                    selectAllRowsItem: true,
                    selectAllRowsItemText: t('All'),
                }}
                noDataComponent={t('No data available')}
                responsive
                defaultSortFieldId={9}
                defaultSortAsc={false}
            />
        </DataTableExtensions>
      </div>
    );
};

export default TableRegistry;
