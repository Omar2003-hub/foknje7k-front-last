import React, { useContext, useEffect, useMemo, useState } from "react";
import { SnackbarContext } from "../../../config/hooks/use-toast";
import {
  getAllUsersService,
  updateUserService,
  deleteUserService,
} from "../../../services/user-service";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { classesLevel } from "../../../mocks/education-level";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faPen, 
  faTrash, 
  faSearch, 
  faUserShield, 
  faUsers,
  faRefresh,
  faUserGraduate,
  faChalkboardTeacher,
  faUserTie,
  faGraduationCap,
  faCheckCircle,
  faTimesCircle,
  faToggleOn,
  faToggleOff,
  faPhone,
  faEnvelope,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "./management-users.css";
import { getUsersFromIDB, setUsersToIDB } from '../../../utils/idbUsers';

interface User {
  id: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: { name: string } | string;
  educationLevel?: string;
  enabled?: boolean;
  isEnabled?: boolean;
  status?: string;
  createdAt?: string;
}


const ManagementUsers: React.FC = () => {
  const snackbarContext = useContext(SnackbarContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortCreatedAt, setSortCreatedAt] = useState<"asc" | "desc">("desc");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // Helper function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ROLE_ADMIN":
        return faUserTie;
      case "ROLE_SUPER_TEACHER":
        return faChalkboardTeacher;
      case "ROLE_TEACHER":
        return faGraduationCap;
      case "ROLE_STUDENT":
        return faUserGraduate;
      default:
        return faUserShield;
    }
  };

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ROLE_ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "ROLE_SUPER_TEACHER":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ROLE_TEACHER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ROLE_STUDENT":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper function to get user avatar
  const getUserInitials = (fullNameOrFirst?: string, lastNameOpt?: string) => {
    if (lastNameOpt !== undefined) {
      // Classic usage: getUserInitials(firstName, lastName)
      const first = fullNameOrFirst?.charAt(0)?.toUpperCase() || "";
      const last = lastNameOpt?.charAt(0)?.toUpperCase() || "";
      return `${first}${last}` || "U";
    }
    // If only one argument, treat as fullName
    if (fullNameOrFirst) {
      const parts = fullNameOrFirst.trim().split(" ");
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return "U";
  };


  // Helper function to get user status
  const getUserStatus = (user: User) => {
    if (typeof user.isEnabled === 'boolean') {
      return user.isEnabled;
    }
    if (typeof user.enabled === 'boolean') {
      return user.enabled;
    }
    if (user.status !== undefined) {
      return user.status === 'active' || user.status === 'enabled';
    }
    return true;
  };

  // Helper function to get status color and text
  const getStatusDisplay = (isEnabled: boolean) => {
    return {
      color: isEnabled ? "text-green-600" : "text-red-600",
      bgColor: isEnabled ? "bg-green-100" : "bg-red-100",
      borderColor: isEnabled ? "border-green-200" : "border-red-200",
      icon: isEnabled ? faCheckCircle : faTimesCircle,
      text: isEnabled ? "Activé" : "Désactivé"
    };
  };

  const CACHE_MAX_AGE = 10 * 60 * 1000; // 10 minutes
  const fetchUsers = async (forceRefresh = false) => {
    let usedCache = false;
    try {
      setLoading(true);
      // Try to get users from IndexedDB first
      const cached = await getUsersFromIDB();
      if (!forceRefresh && cached && Array.isArray(cached.users)) {
        setUsers(cached.users);
        usedCache = true;
      }
      // If no cache or cache is old, or forceRefresh, fetch from API
      const now = Date.now();
      if (forceRefresh || !cached || !cached.timestamp || now - cached.timestamp > CACHE_MAX_AGE) {
        const res = await getAllUsersService();
        const rawList = res?.data || res || [];
        const list = rawList.map((user: any) => ({
          ...user,
          phoneNumber: user.phoneNumber || user.phone || user.telephone || user.tel || "",
          isEnabled: typeof user.isEnabled === 'boolean' ? user.isEnabled : (typeof user.enabled === 'boolean' ? user.enabled : undefined)
        }));
        setUsers(list);
        setUsersToIDB('users', list, now);
      }
    } catch (e) {
      console.error(e);
      snackbarContext?.showMessage?.("Error", "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openView = (user: User) => {
  console.log('User object on view:', user);
  setSelectedUser(user);
  setViewOpen(true);
  };

  const closeView = () => {
    setSelectedUser(null);
    setViewOpen(false);
  };

  const handleEditOpen = (user: User) => {
    setSelectedUser(user);
    const userRole = typeof user.role === "string" ? user.role : user.role?.name || "";
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      // Only set educationLevel for non-teacher roles
      ...(userRole !== "ROLE_TEACHER" && userRole !== "ROLE_SUPER_TEACHER" ? { educationLevel: user.educationLevel || "" } : {}),
      isEnabled: typeof user.isEnabled === 'boolean' ? user.isEnabled : getUserStatus(user),
    phoneNumber: user.phoneNumber || "",
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setSelectedUser(null);
    setForm({});
    setEditOpen(false);
  };

  const handleDeleteOpen = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setSelectedUser(null);
    setDeleteOpen(false);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const { enabled, ...rest } = form;
      // Remove educationLevel for teacher/super teacher
      const userRole = typeof selectedUser.role === "string" ? selectedUser.role : selectedUser.role?.name || "";
      let payload = { ...rest };
      if (userRole === "ROLE_TEACHER" || userRole === "ROLE_SUPER_TEACHER") {
        const { educationLevel, ...withoutEducation } = payload;
        payload = withoutEducation;
      }
      const updatedUser = await updateUserService(selectedUser.id, payload);
      snackbarContext?.showMessage?.("Success", "User updated", "success");
      // Update local state instantly
      setUsers(prev => {
        const newList = prev.map(u => u.id === selectedUser.id ? { ...u, ...payload } : u);
        setUsersToIDB('users', newList, Date.now());
        return newList;
      });
      handleEditClose();
    } catch (e) {
      console.error(e);
      snackbarContext?.showMessage?.("Error", "Failed to update user", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUserService(selectedUser.id);
      snackbarContext?.showMessage?.("Success", "User deleted", "success");
      handleDeleteClose();
      fetchUsers();
    } catch (e) {
      console.error(e);
      snackbarContext?.showMessage?.("Error", "Failed to delete user", "error");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const currentStatus = getUserStatus(user);
      const newStatus = !currentStatus;
      // Update the user status using isEnabled param
      await updateUserService(user.id, {
        ...user,
        isEnabled: newStatus
      });
      snackbarContext?.showMessage?.("Success", 
        `Utilisateur ${newStatus ? 'activé' : 'désactivé'}`,
        "success"
      );
  await fetchUsers();
  setUsersToIDB('users', users, Date.now());
    } catch (e) {
      console.error(e);
      snackbarContext?.showMessage?.("Error", "Failed to update user status", "error");
    }
  };

  const filtered = useMemo(() => {
    let result = users;
    // Apply text search filter
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((u) => {
        const full = `${u.fullName}`.toLowerCase();
        return (
          full.includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (typeof u.role === "string" ? u.role : u.role?.name || "").toLowerCase().includes(q)
        );
      });
    }
    // Apply role filter
    if (roleFilter) {
      result = result.filter((u) => {
        const userRole = typeof u.role === "string" ? u.role : u.role?.name || "";
        return userRole === roleFilter;
      });
    }
    // Apply status filter
    if (statusFilter) {
      result = result.filter((u) => {
        const isEnabled = getUserStatus(u);
        return statusFilter === "active" ? isEnabled : !isEnabled;
      });
    }
    // Sort by createdAt
    result = result.slice().sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortCreatedAt === "asc" ? dateA - dateB : dateB - dateA;
    });
    return result;
  }, [users, query, roleFilter, statusFilter, sortCreatedAt]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / usersPerPage);
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * usersPerPage;
    return filtered.slice(startIdx, startIdx + usersPerPage);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, roleFilter, statusFilter, sortCreatedAt]);

  // Get unique roles for filter dropdown
  const availableRoles = useMemo(() => {
    const roles = users.map((u) => typeof u.role === "string" ? u.role : u.role?.name || "");
    const uniqueRoles = Array.from(new Set(roles)).filter(Boolean);
    return uniqueRoles;
  }, [users]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 management-users-container">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 shadow-lg rounded-xl floating-btn" style={{ background: '#e6f9f1' }}>
              <FontAwesomeIcon icon={faUsers} className="text-xl" style={{ color: '#53d489' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Gestion des utilisateurs
              </h1>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4 stats-grid">
          <Card className="text-white border-0 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {users.length}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Total Users
                  </Typography>
                </div>
                <FontAwesomeIcon icon={faUsers} className="text-2xl opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="text-white border-0 shadow-xl bg-gradient-to-r from-green-500 to-green-600 stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {users.filter(u => (typeof u.role === "string" ? u.role : u.role?.name) === "ROLE_STUDENT").length}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Students
                  </Typography>
                </div>
                <FontAwesomeIcon icon={faUserGraduate} className="text-2xl opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="text-white border-0 shadow-xl bg-gradient-to-r from-purple-500 to-purple-600 stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {users.filter(u => {
                      const role = typeof u.role === "string" ? u.role : u.role?.name;
                      return role === "ROLE_TEACHER" || role === "ROLE_SUPER_TEACHER";
                    }).length}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Teachers
                  </Typography>
                </div>
                <FontAwesomeIcon icon={faChalkboardTeacher} className="text-2xl opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="text-white border-0 shadow-xl bg-gradient-to-r from-red-500 to-red-600 stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h4" className="font-bold">
                    {users.filter(u => (typeof u.role === "string" ? u.role : u.role?.name) === "ROLE_ADMIN").length}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Admins
                  </Typography>
                </div>
                <FontAwesomeIcon icon={faUserTie} className="text-2xl opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6 border-0 shadow-lg glass-effect">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-between gap-4 lg:flex-row search-controls">
              <div className="flex flex-col w-full gap-4 sm:flex-row lg:w-auto">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full py-3 pl-10 pr-4 transition-all duration-200 bg-white border border-gray-300 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent search-input"
                    placeholder="Rechercher nom, email ou rôle..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                {/* Sort by CreatedAt */}
                <div className="relative min-w-[220px]">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                    <FontAwesomeIcon icon={faRefresh} className="text-lg text-gray-400" />
                  </div>
                  <select
                    value={sortCreatedAt}
                    onChange={e => setSortCreatedAt(e.target.value as "asc" | "desc")}
                    className="block w-full py-3 pl-12 pr-10 font-medium text-gray-700 bg-white border border-gray-300 shadow-sm appearance-none cursor-pointer rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Trier par plus récent</option>
                    <option value="asc">Trier par plus ancien</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div className="relative min-w-[220px]">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                    <FontAwesomeIcon icon={faUserShield} className="text-lg text-gray-400" />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="block w-full py-3 pl-12 pr-10 font-medium text-gray-700 bg-white border border-gray-300 shadow-sm appearance-none cursor-pointer custom-role-select rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" className="text-gray-500">Filtrer par rôle</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role} className="text-gray-700">
                        {role.replace('ROLE_', '').replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {roleFilter && (
                    <div className="absolute inset-y-0 flex items-center pointer-events-none right-8">
                      <FontAwesomeIcon 
                        icon={getRoleIcon(roleFilter)} 
                        className="text-sm text-blue-500" 
                      />
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative min-w-[180px]">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-lg text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="block w-full py-3 pl-12 pr-10 font-medium bg-white border border-gray-300 shadow-sm appearance-none cursor-pointer rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" className="text-gray-500">Filtrer par statut</option>
                    <option value="active" className="font-semibold text-green-600">Activé</option>
                    <option value="inactive" className="font-semibold text-red-600">Désactivé</option>
                  </select>
                  {statusFilter && (
                    <div className="absolute inset-y-0 flex items-center pointer-events-none right-8">
                      <FontAwesomeIcon 
                        icon={statusFilter === "active" ? faCheckCircle : faTimesCircle} 
                        className={statusFilter === "active" ? "text-green-600" : "text-red-600"} 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Tooltip title="Actualiser la liste">
                  <IconButton
                    onClick={() => fetchUsers(true)}
                    className="text-blue-600 floating-btn bg-blue-50 hover:bg-blue-100"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faRefresh} className={loading ? "loading-spinner" : ""} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </CardContent>
          
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden border-0 shadow-xl glass-effect table-container">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    #
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Nom complet
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <CircularProgress size={24} />
                        <span className="text-gray-500">Chargement des utilisateurs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered && filtered.length > 0 ? (
                  paginatedUsers.map((user, index) => {
                    const userRole = typeof user.role === "string" ? user.role : user.role?.name || "";
                    const isEnabled = getUserStatus(user);
                    const statusDisplay = getStatusDisplay(isEnabled);
                    return (
                      <Fade in={true} key={user.id}>
                        <tr className="table-row transition-all duration-200 hover:bg-blue-50/50 group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-700">
                              {(currentPage - 1) * usersPerPage + index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4 user-info">
                              <Avatar className="font-semibold text-white shadow-md bg-gradient-to-r from-blue-400 to-indigo-500">
                                {getUserInitials(user.fullName)}
                              </Avatar>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {(user.fullName || "-").trim()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Chip
                              icon={<FontAwesomeIcon icon={getRoleIcon(userRole)} />}
                              label={userRole.replace('ROLE_', '').replace('_', ' ')}
                              className={`${getRoleColor(userRole)} border font-medium role-badge`}
                              size="small"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Chip
                              icon={<FontAwesomeIcon icon={statusDisplay.icon} />}
                              label={statusDisplay.text}
                              className={`${statusDisplay.bgColor} ${statusDisplay.color} border ${statusDisplay.borderColor} font-medium role-badge`}
                              size="small"
                            />
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex justify-end space-x-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  onClick={() => openView(user)}
                                  className="text-blue-600 transition-all duration-200 floating-btn bg-blue-50 hover:bg-blue-100"
                                  size="small"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <IconButton
                                  onClick={() => handleEditOpen(user)}
                                  className="text-green-600 transition-all duration-200 floating-btn bg-green-50 hover:bg-green-100"
                                  size="small"
                                >
                                  <FontAwesomeIcon icon={faPen} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={isEnabled ? "Désactiver" : "Activer"}>
                                <IconButton
                                  onClick={() => handleToggleStatus(user)}
                                  className={`floating-btn ${isEnabled ? 'bg-orange-50 hover:bg-orange-100 text-orange-600' : 'bg-green-50 hover:bg-green-100 text-green-600'} transition-all duration-200`}
                                  size="small"
                                >
                                  <FontAwesomeIcon icon={isEnabled ? faToggleOff : faToggleOn} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDeleteOpen(user)}
                                  className="text-red-600 transition-all duration-200 floating-btn bg-red-50 hover:bg-red-100"
                                  size="small"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      </Fade>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300" />
                        <div className="text-gray-500">
                          {query || roleFilter ? "Aucun utilisateur trouvé avec ces critères" : "Aucun utilisateur disponible"}
                        </div>
                        {(query || roleFilter) && (
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setQuery("");
                              setRoleFilter("");
                            }}
                            className="mt-2 btn-ripple"
                          >
                            Réinitialiser les filtres
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination Controls */}
        {filtered.length > 0 && (
          <Card className="mt-6 border-0 shadow-lg glass-effect">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Affichage {(currentPage - 1) * usersPerPage + 1} à {Math.min(currentPage * usersPerPage, filtered.length)} sur {filtered.length} utilisateurs
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outlined"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    size="small"
                    style={{
                      minWidth: 80,
                      color: "#09745f",
                      borderColor: "#09745f"
                    }}
                  >
                    Premier
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    size="small"
                    style={{
                      color: "#09745f",
                      borderColor: "#09745f"
                    }}
                  >
                    Précédent
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "contained" : "outlined"}
                          onClick={() => setCurrentPage(pageNum)}
                          size="small"
                          style={{
                            minWidth: 40,
                            padding: "6px 12px",
                            backgroundColor: currentPage === pageNum ? "#09745f" : undefined,
                            color: currentPage === pageNum ? "#fff" : "#09745f",
                            borderColor: "#09745f"
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outlined"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    size="small"
                    style={{
                      color: "#09745f",
                      borderColor: "#09745f"
                    }}
                  >
                    Suivant
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    size="small"
                    style={{
                      minWidth: 80,
                      color: "#09745f",
                      borderColor: "#09745f"
                    }}
                  >
                    Dernier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Dialog */}
      <Dialog 
        open={viewOpen} 
        onClose={closeView} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          className: "rounded-2xl shadow-2xl border-0 overflow-hidden"
        }}
      >
        <DialogTitle className="py-6 text-center text-white bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="w-16 h-16 text-lg font-bold text-white bg-white/20">
              {getUserInitials(selectedUser?.fullName)}
            </Avatar>
            <Typography variant="h5" className="mt-2 font-bold" style={{ color: '#000000', textShadow: '0 2px 8px #0008' }}>
              {(selectedUser?.fullName || "Utilisateur").trim()}
            </Typography>
            <Typography variant="h6" className="font-semibold" style={{ color: '#000000', opacity: 0.95, textShadow: '0 2px 8px #0006' }}>
              Informations sur l'utilisateur
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">

          <div className="space-y-8">
            {/* Hero Card - User Profile */}
            {/* <Card className="overflow-hidden text-white border-0 shadow-xl bg-gradient-to-r from-blue-500 to-indigo-600">
              <CardContent className="relative p-6">
                {/* <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/10"></div> */}
                {/* <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-white/5"></div> */}
                {/* <div className="relative z-10">
                  <div className="flex items-center space-x-6">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <FontAwesomeIcon icon={faUserShield} className="text-3xl text-white" />
                    </div>
                    <div className="flex-1">
                      <Typography variant="h5" className="mb-2 font-bold text-white">
                        {(selectedUser?.fullName || "Utilisateur").trim()}
                      </Typography>
                    </div> 
                  </div>
                </div> 
              </CardContent>
            </Card> */}

            {/* Email Card */}
            {selectedUser?.email && (
              <Card className="transition-shadow duration-300 border-0 shadow-lg hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                      <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <Typography variant="body2" className="mb-1 font-medium text-gray-500">
                        Adresse email
                      </Typography>
                      <Typography variant="h6" className="font-bold text-gray-800">
                        {selectedUser.email}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Phone Card */}

            {selectedUser?.phoneNumber && (
              <Card className="mt-4 transition-shadow duration-300 border-0 shadow-lg hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                      <FontAwesomeIcon icon={faPhone} className="text-2xl text-green-600" />
                    </div>
                    <div className="flex-1">
                      <Typography variant="body2" className="mb-1 font-medium text-gray-500">
                        Numéro de téléphone
                      </Typography>
                      <Typography variant="h6" className="font-bold text-gray-800">
                        {selectedUser.phoneNumber}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education Level Card */}
            {selectedUser?.educationLevel && (
              <Card className="mt-4 transition-shadow duration-300 border-0 shadow-lg hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
                      <FontAwesomeIcon icon={faGraduationCap} className="text-2xl text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <Typography variant="body2" className="mb-1 font-medium text-gray-500">
                        Niveau d'éducation
                      </Typography>
                      <Typography variant="h6" className="font-bold text-gray-800">
                        {selectedUser.educationLevel.replace('_', ' ')}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Role Card */}
            {/* <Card className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 transition-transform duration-300 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl group-hover:scale-110">
                    <FontAwesomeIcon 
                      icon={getRoleIcon(typeof selectedUser?.role === "string" ? selectedUser?.role : selectedUser?.role?.name || "")} 
                      className="text-2xl text-purple-600" 
                    />
                  </div>
                  <div className="flex-1">
                    <Typography variant="body2" className="mb-2 font-medium text-gray-500">
                      Rôle utilisateur
                    </Typography>
                    <Chip
                      icon={<FontAwesomeIcon icon={getRoleIcon(typeof selectedUser?.role === "string" ? selectedUser?.role : selectedUser?.role?.name || "")} />}
                      label={(typeof selectedUser?.role === "string" ? selectedUser?.role : selectedUser?.role?.name || "").replace('ROLE_', '').replace('_', ' ')}
                      className={`${getRoleColor(typeof selectedUser?.role === "string" ? selectedUser?.role : selectedUser?.role?.name || "")} border-2 font-bold text-sm px-4 py-2`}
                      size="medium"
                    />
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Status Card */}
            <Card className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  {(() => {
                    if (!selectedUser) return null;
                    const isEnabled = getUserStatus(selectedUser);
                    const statusDisplay = getStatusDisplay(isEnabled);
                    return (
                      <>
                        <div className={`p-3 ${statusDisplay.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <FontAwesomeIcon 
                            icon={statusDisplay.icon} 
                            className={`${statusDisplay.color} text-2xl`} 
                          />
                        </div>
                        <div className="flex-1">
                          <Typography variant="body2" className="mb-2 font-medium text-gray-500">
                            Statut du compte
                          </Typography>
                          <Chip
                            icon={<FontAwesomeIcon icon={statusDisplay.icon} />}
                            label={statusDisplay.text}
                            className={`${statusDisplay.bgColor} ${statusDisplay.color} border-2 ${statusDisplay.borderColor} font-bold text-sm px-4 py-2`}
                            size="medium"
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* ID Card */}
            <Card className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 transition-transform duration-300 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl group-hover:scale-110">
                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="body2" className="mb-1 font-medium text-gray-500">
                      Identifiant utilisateur
                    </Typography>
                    <Typography variant="h5" className="font-mono font-bold text-gray-800">
                      #{selectedUser?.id}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
        <DialogActions className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <Button 
            onClick={closeView}
            variant="contained"
            className="px-8 py-3 font-semibold text-white transition-all duration-300 transform shadow-lg rounded-xl hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: '#53d489', color: '#fff' }}
            startIcon={<FontAwesomeIcon icon={faEye} />}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={handleEditClose} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          className: "rounded-3xl shadow-2xl border-0 overflow-hidden backdrop-blur-sm"
        }}
      >
        <DialogTitle className="relative py-8 overflow-hidden text-center text-white bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-40 h-40 -mt-20 -mr-20 rounded-full bg-white/5"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 -mb-16 -ml-16 rounded-full bg-white/10"></div>
          <div className="relative z-10 flex flex-col items-center pt-0 space-y-2">
            <Typography variant="h3" className="pt-0 mt-0 font-bold" style={{ color: '#222', textShadow: '0 2px 8px #fff8', fontSize: '2.6rem', marginTop: 0, paddingTop: 0 }}>
              Modifier l'utilisateur
            </Typography>
            <Typography variant="body2" className="max-w-md pt-0 mt-0" style={{ color: '#53d489', fontWeight: 500, textShadow: '0 2px 8px #fff8', marginTop: 0, paddingTop: 0 }}>
              Modifiez les informations de l'utilisateur sélectionné
            </Typography>
            <div className="p-4 mt-2 border bg-white/20 rounded-2xl backdrop-blur-sm border-white/30">
              <FontAwesomeIcon icon={faPen} className="text-2xl text-white" />
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="p-8 bg-gradient-to-br from-gray-50 to-green-50">
          <div className="mt-4 space-y-6">
            
            {/* User Info Section */}
            <Card className="overflow-hidden text-white border-0 shadow-xl bg-gradient-to-r from-green-500 to-emerald-600">
              <CardContent className="relative p-6">
                <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/10"></div>
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FontAwesomeIcon icon={faUser} className="text-2xl" style={{ color: '#222' }} />
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold" style={{ color: '#222', textShadow: '0 2px 8px #fff8' }}>
                      {(selectedUser?.fullName || "Utilisateur").trim()}
                    </Typography>
                    <Typography variant="body2" className="text-green-100">
                      ID: {selectedUser?.id}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Full Name Field */}
              <Card className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4 space-x-3">
                    <div className="p-2 transition-colors duration-300 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                      <FontAwesomeIcon icon={faUserShield} className="text-blue-600" />
                    </div>
                    <Typography variant="h6" className="font-semibold text-gray-800">
                      Nom complet
                    </Typography>
                  </div>
                  <TextField 
                    label="Nom complet" 
                    value={form.fullName || selectedUser?.fullName || ""} 
                    fullWidth 
                    variant="outlined"
                    className="bg-white rounded-xl"
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': { borderColor: '#10b981' },
                        '&.Mui-focused fieldset': { borderColor: '#10b981' }
                      }
                    }}
                  />
                </CardContent>
              </Card>

                {/* Phone Number Field */}
                <Card className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4 space-x-3">
                      <div className="p-2 transition-colors duration-300 bg-yellow-100 rounded-lg group-hover:bg-yellow-200">
                        <FontAwesomeIcon icon={faPhone} className="text-yellow-600" />
                      </div>
                      <Typography variant="h6" className="font-semibold text-gray-800">
                        Numéro de téléphone
                      </Typography>
                    </div>
                    <TextField 
                      label="Numéro de téléphone" 
                      type="tel"
                      value={form.phoneNumber || ""}
                      onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                      fullWidth 
                      variant="outlined"
                      className="bg-white rounded-xl"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': { borderColor: '#10b981' },
                          '&.Mui-focused fieldset': { borderColor: '#10b981' }
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              {/* Email Field */}
              <Card className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4 space-x-3">
                    <div className="p-2 transition-colors duration-300 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                      <FontAwesomeIcon icon={faEnvelope} className="text-purple-600" />
                    </div>
                    <Typography variant="h6" className="font-semibold text-gray-800">
                      Email
                    </Typography>
                  </div>
                  <TextField 
                    label="Adresse email" 
                    type="email"
                    value={form.email || ""} 
                    fullWidth 
                    variant="outlined"
                    className="bg-white rounded-xl"
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': { borderColor: '#10b981' },
                        '&.Mui-focused fieldset': { borderColor: '#10b981' }
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Education Level (only for non-teacher roles) */}
            {(() => {
              const userRole = typeof selectedUser?.role === "string" ? selectedUser?.role : selectedUser?.role?.name || "";
              if (userRole === "ROLE_TEACHER" || userRole === "ROLE_SUPER_TEACHER") return null;
              return (
                <Card className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4 space-x-3">
                      <div className="p-2 transition-colors duration-300 bg-green-100 rounded-lg group-hover:bg-green-200">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-green-600" />
                      </div>
                      <Typography variant="h6" className="font-semibold text-gray-800">
                        Niveau d'éducation
                      </Typography>
                    </div>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="education-level-label" sx={{ color: '#10b981' }}>Sélectionner un niveau</InputLabel>
                      <Select
                        labelId="education-level-label"
                        value={form.educationLevel || ""}
                        label="Sélectionner un niveau"
                        onChange={e => setForm({ ...form, educationLevel: e.target.value })}
                        className="bg-white rounded-xl"
                        sx={{
                          borderRadius: '12px',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' }
                        }}
                      >
                        {classesLevel.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Status Toggle */}
            <Card className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4 space-x-3">
                  <div className={`p-2 rounded-lg transition-colors duration-300 ${form.isEnabled ? 'bg-green-100 group-hover:bg-green-200' : 'bg-red-100 group-hover:bg-red-200'}`}>
                    <FontAwesomeIcon 
                      icon={form.isEnabled ? faCheckCircle : faTimesCircle} 
                      className={form.isEnabled ? 'text-green-600' : 'text-red-600'} 
                    />
                  </div>
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    Statut du compte
                  </Typography>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <Typography variant="body1" className="font-semibold text-gray-900">
                      {form.isEnabled ? 'Compte activé' : 'Compte désactivé'}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {form.isEnabled ? 'L\'utilisateur peut accéder au système' : 'L\'accès au système est bloqué'}
                    </Typography>
                  </div>
                  <IconButton
                    onClick={() => setForm({ ...form, isEnabled: !form.isEnabled })}
                    className={`p-3 transition-all duration-300 transform hover:scale-110 ${form.isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                    size="large"
                  >
                    <FontAwesomeIcon 
                      icon={form.isEnabled ? faToggleOn : faToggleOff} 
                      className="text-3xl"
                    />
                  </IconButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
        <DialogActions className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex w-full space-x-4">
            <Button 
              onClick={handleEditClose}
              variant="outlined"
              className="flex-1 py-3 font-semibold transition-all duration-300 border-2 rounded-xl"
              style={{ borderColor: '#53d489', color: '#53d489' }}
              startIcon={<FontAwesomeIcon icon={faTimesCircle} />}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdate} 
              variant="contained"
              className="flex-1 py-3 font-semibold transition-all duration-300 transform shadow-lg rounded-xl hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: '#53d489', color: '#fff' }}
              startIcon={<FontAwesomeIcon icon={faCheckCircle} />}
            >
              Sauvegarder les modifications
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog  */}
      <Dialog 
        open={deleteOpen} 
        onClose={handleDeleteClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-2xl border-0 overflow-hidden dialog-enter"
        }}
      >
        <DialogTitle className="py-6 text-center text-white bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex items-center justify-center space-x-3">
            <FontAwesomeIcon icon={faTrash} className="text-xl" />
            <Typography variant="h6" className="font-semibold">
              Confirmer la suppression
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent className="p-6 bg-gray-50 dialog-content">
          <Card className="border-0 shadow-md bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                  <FontAwesomeIcon icon={faTrash} className="text-xl text-red-600" />
                </div>
                <Typography variant="h6" className="mb-2 font-semibold text-gray-900">
                  Êtes-vous sûr ?
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Cette action supprimera définitivement l'utilisateur{" "}
                  <span className="font-semibold">
                    {(selectedUser?.fullName || "").trim()}
                  </span>
                  . Cette action ne peut pas être annulée.
                </Typography>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions className="p-6 space-x-3 bg-white">
          <Button 
            onClick={handleDeleteClose}
            variant="outlined"
            className="px-6 py-2 font-semibold border-2 rounded-xl btn-ripple"
            style={{ borderColor: '#53d489', color: '#53d489' }}
            sx={{
              '&:hover': {
                backgroundColor: '#e6f9f1',
                borderColor: '#10b981',
                color: '#10b981',
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained"
            className="px-6 py-2 font-semibold rounded-xl btn-ripple"
            style={{ background: 'linear-gradient(to right, #53d489, #10b981)', color: '#fff' }}
            sx={{
              '&:hover': {
                background: 'linear-gradient(to right, #10b981, #53d489)',
                color: '#fff',
                boxShadow: '0 4px 16px #10b98133',
              }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManagementUsers;
