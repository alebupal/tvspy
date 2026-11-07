import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tvheadendApi } from '../api';
import { UserItem } from '../types';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import UserProfileModal from '../components/common/UserProfileModal';
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiChevronRight,
  FiChevronLeft,
  FiGrid,
  FiList,
} from 'react-icons/fi';

const User: React.FC = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('tvspy_user_view') as 'grid' | 'list') || 'grid';
  });
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(viewMode === 'grid' ? 24 : 20);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    setLimit(mode === 'grid' ? 24 : 20);
    setPage(1);
    localStorage.setItem('tvspy_user_view', mode);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tvheadendApi.getUsers();
      setUsers(data?.entries || []);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener usuarios de TVHeadend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.comment?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <FiUsers className="text-primary" />
            {t('Users')}
          </h2>
          <p className="text-xs text-body dark:text-bodydark mt-0.5">
            {t('Users configured in TVHeadend')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de tipo de vista: Grid vs List */}
          <div className="inline-flex rounded-lg border border-stroke bg-gray-100 p-1 dark:border-strokedark dark:bg-meta-4">
            <button
              onClick={() => handleViewChange('grid')}
              title={t('Grid view')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-sm dark:bg-boxdark dark:text-secondary'
                  : 'text-body hover:text-black dark:text-bodydark dark:hover:text-white'
              }`}
            >
              <FiGrid className="text-sm" />
              <span className="hidden sm:inline">{t('Grid')}</span>
            </button>
            <button
              onClick={() => handleViewChange('list')}
              title={t('List view')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm dark:bg-boxdark dark:text-secondary'
                  : 'text-body hover:text-black dark:text-bodydark dark:hover:text-white'
              }`}
            >
              <FiList className="text-sm" />
              <span className="hidden sm:inline">{t('List')}</span>
            </button>
          </div>

          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 transition shadow-sm w-fit"
          >
            <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            {t('Refresh')}
          </button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body dark:text-bodydark" />
            <input
              type="text"
              placeholder={t('Filter users...')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-stroke bg-transparent pl-9 pr-4 py-2 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          <div className="text-xs text-body dark:text-bodydark font-medium">
            {t('Total')}: <b>{filteredUsers.length}</b> {t('Users').toLowerCase()}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-body dark:text-bodydark">
            <FiRefreshCw className="inline-block animate-spin text-2xl mb-2 text-primary" />
            <div className="text-sm">{t('Loading...')}</div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-danger text-sm">
            {t('Error')}: {error}
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-16 text-center text-body dark:text-bodydark text-sm">
            {t('No data available')}
          </div>
        ) : viewMode === 'grid' ? (
          /* VISTA 1: CUADRÍCULA (GRID) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedUsers.map((user, idx) => {
              const isEnabled = user.enabled !== false;
              return (
                <div
                  key={user.uuid || idx}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center justify-between p-4 rounded-xl border border-stroke bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-primary/50 transition duration-200 dark:border-strokedark dark:bg-meta-4/20 dark:hover:bg-boxdark cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm group-hover:scale-105 transition-transform ${
                        isEnabled
                          ? 'bg-gradient-to-tr from-primary to-blue-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-black dark:text-white group-hover:text-primary transition">
                        {user.username || 'Sin nombre'}
                      </h4>
                      {user.comment && (
                        <p className="text-xs text-body dark:text-bodydark line-clamp-1">
                          {user.comment}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEnabled ? (
                      <Badge variant="success">
                        <FiUserCheck className="text-xs flex-shrink-0" />
                        <span>{t('Active')}</span>
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <FiUserX className="text-xs flex-shrink-0" />
                        <span>{t('Disabled')}</span>
                      </Badge>
                    )}
                    <FiChevronRight className="text-body dark:text-bodydark group-hover:translate-x-0.5 group-hover:text-primary transition" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VISTA 2: LISTA / TABLA COMPACTA DETALLADA */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stroke bg-gray-50/70 dark:border-strokedark dark:bg-meta-4/30">
                  <th className="py-3 px-3 font-semibold text-black dark:text-white w-14">Avatar</th>
                  <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Username')}</th>
                  <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Comment')}</th>
                  <th className="py-3 px-3 font-semibold text-black dark:text-white">{t('Status')}</th>
                  <th className="py-3 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {paginatedUsers.map((user, idx) => {
                  const isEnabled = user.enabled !== false;
                  return (
                    <tr
                      key={user.uuid || idx}
                      onClick={() => setSelectedUser(user)}
                      className="hover:bg-gray-50/70 dark:hover:bg-meta-4/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs text-white shadow-sm group-hover:scale-105 transition-transform ${
                            isEnabled
                              ? 'bg-gradient-to-tr from-primary to-blue-500'
                              : 'bg-gray-400'
                          }`}
                        >
                          {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-black dark:text-white group-hover:text-primary transition">
                        {user.username || 'Sin nombre'}
                      </td>
                      <td className="py-2.5 px-3 text-body dark:text-bodydark">
                        {user.comment || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {isEnabled ? (
                          <Badge variant="success">
                            <FiUserCheck className="text-xs flex-shrink-0" />
                            <span>{t('Active')}</span>
                          </Badge>
                        ) : (
                          <Badge variant="default">
                            <FiUserX className="text-xs flex-shrink-0" />
                            <span>{t('Disabled')}</span>
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <FiChevronRight className="text-body dark:text-bodydark group-hover:text-primary group-hover:translate-x-0.5 transition" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-stroke dark:border-strokedark text-xs text-body dark:text-bodydark">
            <div>
              Página <b>{page}</b> de <b>{totalPages}</b>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-stroke px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4 transition"
              >
                <FiChevronLeft /> Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded-lg border border-stroke px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4 transition"
              >
                Siguiente <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Detalle de Usuario */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default User;
