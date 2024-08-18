import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/apiConfig';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';

const UserDataTable = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchtUsers = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.USERS);
                setUsers(response.data.entries);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchtUsers();
    }, []);

    const columns = [
        {
            name: t('Username'),
            selector: row => t(row.username),
            sortable: true,
        },
    ];

    const tableData = {
        columns,
        data: users,
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
                title={t('Users')}
                columns={columns}
                data={users}
                pagination
                highlightOnHover
                pointerOnHover
                paginationComponentOptions={paginationOptions} // Traducción de la paginación
                noDataComponent={t('No data available')} // Texto cuando no hay datos
            />
        </DataTableExtensions>
    );
};

export default UserDataTable;
