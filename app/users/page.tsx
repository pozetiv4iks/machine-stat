"use client";

import { useEffect, useState } from "react";
import { getUsers, deleteUser, getRoles, createRole, updateRole, deleteRole, type User, type Role } from "@/assets/api";
import UserEditModal from "../components/UserEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import RoleEditModal from "../components/RoleEditModal";
import CustomSelect from "../components/CustomSelect";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleType, setRoleType] = useState<"role" | "department">("role");
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isRoleDeleteModalOpen, setIsRoleDeleteModalOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(false);

  useEffect(() => {
    // При первой загрузке сбрасываем на первую вкладку и загружаем все данные
    setActiveTab("users");
    setRoleType("role");
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === "roles") {
      loadRolesAndDepartments();
    }
  }, [activeTab]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем пользователей, роли и отделы параллельно
      const [usersData, rolesData, departmentsData] = await Promise.all([
        getUsers(),
        getRoles("role"),
        getRoles("department")
      ]);
      
      setUsers(usersData);
      setRoles(rolesData);
      setDepartments(departmentsData);
    } catch (err) {
      setError("Не удалось загрузить данные");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Не удалось загрузить пользователей");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRolesAndDepartments = async () => {
    try {
      setRolesLoading(true);
      setError(null);
      const [rolesData, departmentsData] = await Promise.all([
        getRoles("role"),
        getRoles("department")
      ]);
      setRoles(rolesData);
      setDepartments(departmentsData);
    } catch (err) {
      setError("Не удалось загрузить роли и отделы");
      console.error(err);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSaveUser = async () => {
    await loadUsers();
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await deleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (err) {
      console.error("Не удалось удалить пользователя", err);
      alert("Не удалось удалить пользователя");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleSaveRole = async () => {
    await loadRolesAndDepartments();
    setIsRoleModalOpen(false);
    setEditingRole(null);
    setRoleType("role");
  };

  const handleDeleteRole = async (role: Role) => {
    setRoleToDelete(role);
    setIsRoleDeleteModalOpen(true);
  };

  const handleConfirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      setDeletingRole(true);
      await deleteRole(roleToDelete.id!);
      setIsRoleDeleteModalOpen(false);
      setRoleToDelete(null);
      await loadRolesAndDepartments();
    } catch (err) {
      console.error("Не удалось удалить роль", err);
      alert("Не удалось удалить роль");
    } finally {
      setDeletingRole(false);
    }
  };

  const handleCloseDeleteRoleModal = () => {
    if (!deletingRole) {
      setIsRoleDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleAddRole = (type: "role" | "department") => {
    setRoleType(type);
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setRoleType(role.type || "role");
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !selectedRole || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Объединяем роли и отделы для отображения
  const rolesList = [...roles, ...departments];

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Мягкие размытые зеленые области на заднем плане */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute rounded-full bg-[#DBEDAE]"
          style={{
            width: '700px',
            height: '700px',
            filter: 'blur(100px)',
            opacity: 0.5,
            top: '-250px',
            left: '-250px',
          }}
        />
        <div 
          className="absolute rounded-full bg-[#DBEDAE]"
          style={{
            width: '700px',
            height: '700px',
            filter: 'blur(100px)',
            opacity: 0.5,
            bottom: '-250px',
            right: '-250px',
          }}
        />
      </div>

      <div className="px-4 pt-16 pb-16 relative z-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-8">Пользователи</h1>

        {/* Вкладки */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "users"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "roles"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Роли и отделы
          </button>
        </div>

        {/* Контент вкладки пользователей */}
        {activeTab === "users" && (
          <>
        {/* Поисковая строка и фильтр */}
        <div className="mb-16 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-black rounded-lg bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-[#E1F5C6] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <CustomSelect
                value={selectedRole}
                onChange={setSelectedRole}
                options={rolesList.map(r => r.name)}
                placeholder="Все роли"
              />
            </div>
            {selectedRole && (
              <button
                onClick={() => setSelectedRole("")}
                className="text-sm text-gray-600 hover:text-black underline whitespace-nowrap"
              >
                Сбросить фильтр
              </button>
            )}
          </div>
        </div>

        {/* Состояние загрузки и ошибки */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Загрузка пользователей...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Список пользователей */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Добавить пользователя
              </button>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchQuery || selectedRole ? "Пользователи не найдены" : "Нет пользователей"}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-lg">
                      {user.full_name || user.username || "Без имени"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      @{user.username || "без логина"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Роль: {user.role || "Не указана"}
                    </p>
                    {user.telegram_id && (
                      <p className="text-sm text-gray-600">
                        Telegram ID: {user.telegram_id}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="w-8 h-8 bg-[#DBEDAE] rounded-full flex items-center justify-center hover:bg-[#DBEDAE]/80 transition-colors"
                      title="Редактировать"
                    >
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="Удалить"
                    >
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
          </>
        )}

        {/* Контент вкладки ролей */}
        {activeTab === "roles" && (
          <>
            {rolesLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Загрузка ролей и отделов...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={loadRolesAndDepartments}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Попробовать снова
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Роли */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-black">Роли</h2>
                    <button
                      onClick={() => handleAddRole("role")}
                      className="px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Добавить роль
                    </button>
                  </div>
                  {rolesList.filter(r => r.type === "role").length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Нет ролей</p>
                  ) : (
                    <div className="space-y-2">
                      {rolesList.filter(r => r.type === "role").map((role) => (
                        <div
                          key={role.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-black">{role.name}</h3>
                            {role.description && (
                              <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditRole(role)}
                              className="w-8 h-8 bg-[#DBEDAE] rounded-full flex items-center justify-center hover:bg-[#DBEDAE]/80 transition-colors"
                              title="Редактировать"
                            >
                              <svg
                                className="w-4 h-4 text-black"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role)}
                              className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                              title="Удалить"
                            >
                              <svg
                                className="w-4 h-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Отделы */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-black">Отделы</h2>
                    <button
                      onClick={() => handleAddRole("department")}
                      className="px-4 py-2 bg-[#DBEDAE] text-black rounded-lg hover:bg-[#DBEDAE]/80 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Добавить отдел
                    </button>
                  </div>
                  {rolesList.filter(r => r.type === "department").length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Нет отделов</p>
                  ) : (
                    <div className="space-y-2">
                      {rolesList.filter(r => r.type === "department").map((department) => (
                        <div
                          key={department.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-black">{department.name}</h3>
                            {department.description && (
                              <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditRole(department)}
                              className="w-8 h-8 bg-[#DBEDAE] rounded-full flex items-center justify-center hover:bg-[#DBEDAE]/80 transition-colors"
                              title="Редактировать"
                            >
                              <svg
                                className="w-4 h-4 text-black"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteRole(department)}
                              className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                              title="Удалить"
                            >
                              <svg
                                className="w-4 h-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальное окно создания/редактирования пользователя */}
      <UserEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        user={selectedUser}
      />

      {/* Модальное окно подтверждения удаления пользователя */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Удалить пользователя?"
        message={`Вы уверены, что хотите удалить пользователя "${userToDelete?.full_name || userToDelete?.username || ""}"? Это действие нельзя отменить.`}
        loading={deleting}
      />

      {/* Модальное окно создания/редактирования роли */}
      <RoleEditModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingRole(null);
          setRoleType("role");
        }}
        onSave={handleSaveRole}
        role={editingRole}
        type={roleType}
      />

      {/* Модальное окно подтверждения удаления роли */}
      <DeleteConfirmModal
        isOpen={isRoleDeleteModalOpen}
        onClose={handleCloseDeleteRoleModal}
        onConfirm={handleConfirmDeleteRole}
        title="Удалить роль/отдел?"
        message={`Вы уверены, что хотите удалить "${roleToDelete?.name || ""}"? Это действие нельзя отменить.`}
        loading={deletingRole}
      />
    </div>
  );
}
