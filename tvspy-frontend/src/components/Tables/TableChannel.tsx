import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import axios from 'axios';
import Loader from '../../common/Loader/index';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/apiConfig';
import imgNotFound from '../../images/notfound.png';

interface Channel {
    name: string;
    icon_public_url: string;
}

const TableChannel: React.FC = () => {
    const { t } = useTranslation();
    const [channel, seChannel] = useState<Channel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChannel = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.CHANNEL);
                seChannel(response.data.entries);
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

        fetchChannel();
    }, []);

    const columns = [
        {
            name: t('Name'),
            selector: (row: Channel) => row.name,
            sortable: true,
        },
        {
            name: t('Logo'),
            selector: (row: Channel) => row.icon_public_url,
            cell: (row: Channel) => (
                <img
                    src={row.icon_public_url}
                    alt={row.name}
                    height="84px"
                    width="56px"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = imgNotFound;
                    }}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
            ),
        },
    ];

    const tableData = {
      columns,
      data: channel,
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
              data={channel}
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

export default TableChannel;
