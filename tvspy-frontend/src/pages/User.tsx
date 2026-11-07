import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tvheadendApi } from '../api';
import { UserItem } from '../types';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import UserProfileModal from '../components/common/UserProfileModal';
import { FiUsers, FiSearch, FiRefreshCw, FiUserCheck, FiUserX, FiShield, FiChevronRight } from 'react-icons/fi';

const User: React.FC = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

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

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 transition shadow-sm w-fit"
        >
          <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          {t('Refresh')}
        </button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body dark:text-bodydark" />
            <input
              type="text"
              placeholder={t('Filter users...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-body dark:text-bodydark text-sm">
            {t('No data available')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, idx) => {
              const isEnabled = user.enabled !== false;
              return (
                <div
                  key={user.uuid || idx}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center justify-between p-4 rounded-xl border border-stroke bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-primary/50 transition duration-200 dark:border-strokedark dark:bg-meta-4/20 dark:hover:bg-boxdark cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm ${
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
                        <FiUserCheck className="text-xs" /> {t('Active') || 'Activo'}
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <FiUserX className="text-xs" /> {t('Disabled') || 'Deshabilitado'}
                      </Badge>
                    )}
                    <FiChevronRight className="text-body dark:text-bodydark group-hover:translate-x-0.5 group-hover:text-primary transition" />
                  </div>
                </div>
              );
            })}
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
