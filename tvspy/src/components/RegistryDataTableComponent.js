import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/apiConfig';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';

const RegistryDataTable = () => {
    const { t } = useTranslation();
    const [registry, setRegistry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.REGISTRY);
                setRegistry(response.data);
            } catch (err) {
                setError(err.message);
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

    const paginationOptions = {
        rowsPerPageText: t('Rows per page'),
        rangeSeparatorText: t('of'),
        selectAllRowsItem: true,
        selectAllRowsItemText: t('All'),
    };

    if (loading) return <p>{t('Loading...')}</p>;
    if (error) return <p>{t('Error')}: {error}</p>;

    return (
        <DataTableExtensions
            {...tableData}
            export={false}
            print={false}
            filterPlaceholder={t('Search')}
        >
            <DataTable
                title={t('Registry')}
                columns={columns}
                data={registry}
                pagination
                highlightOnHover
                pointerOnHover
                paginationComponentOptions={paginationOptions} // Traducción de la paginación
                noDataComponent={t('No data available')} // Texto cuando no hay datos
            />
        </DataTableExtensions>
    );
};

export default RegistryDataTable;
