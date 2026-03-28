"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Input,
  Pagination,
  useDisclosure,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  SearchIcon,
  Eye,
  Calendar,
  UserPlus,
  MoreVertical,
  MessageCircle,
  Download,
  Trash2,
  Edit,
  Shield,
  Clock,
  Mail,
  User,
  Lock,
} from "lucide-react";
import downloadExcel from "@/lib/Excel";
import toast from "react-hot-toast";
import api from "@/app/servise/api";

 
interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  avatar?: string;
  status: "active" | "inactive" | "pending" | "suspended";
  failedLoginAttempts: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lastFailedLogin?: string;
}

 
const statusColor: Record<User["status"], "success" | "warning" | "danger"> = {
  active: "success",
  inactive: "danger",
  pending: "warning",
  suspended: "danger",
};

const roleColor: Record<User["role"], "primary" | "secondary" | "warning"> = {
  admin: "primary",
  user: "secondary",
  moderator: "warning",
};

 
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getTimeAgo = (dateString?: string) => {
  if (!dateString) return "Never logged in";

  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return formatDate(dateString);
};

 
export default function UsersDashboard() {
  const rowsPerPage = 8;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [usersData, setUsersData] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states for edit
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user" as User["role"],
    status: "active" as User["status"],
  });

  // Modals
  const viewModal = useDisclosure();
  const deleteModal = useDisclosure();
  const editModal = useDisclosure();
  const addModal = useDisclosure();

  /* ===== FETCH USERS ===== */
useEffect(() => {
  async function fetchUsers() {
    const res = await api.users.getAll();

    const sanitized = res.data.map((u: any) => ({
      ...u,
      name: u.name || "Unnamed User",
      email: u.email || "No email",
    }));

    setUsersData(sanitized);
  }

  fetchUsers();
}, []);


  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.users.getAll();
      setUsersData(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===== FILTER ===== */
const filteredUsers = useMemo(() => {
  const term = searchTerm.toLowerCase();

  return usersData.filter((user) => {
    const name = user.name?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const id = user._id?.toLowerCase() || "";

    const matchesSearch =
      name.includes(term) ||
      email.includes(term) ||
      id.includes(term);

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });
}, [usersData, searchTerm, statusFilter, roleFilter]);


  /* ===== PAGINATION ===== */
  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [page, filteredUsers]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, roleFilter]);

  /* ===== ACTIONS ===== */
  const handleDownloadExcel = () => {
    const data = usersData.map((u) => ({
      ID: u._id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      CreatedAt: formatDateTime(u.createdAt),
      LastLogin: u.lastLogin ? formatDateTime(u.lastLogin) : "Never",
      FailedLoginAttempts: u.failedLoginAttempts,
    }));
    downloadExcel(data);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    viewModal.onOpen();
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    editModal.onOpen();
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      const res = await api.users.update(editForm)
      
      setUsersData((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, ...editForm } : u))
      );
      
      editModal.onClose();
      setSelectedUser(null);
    } catch (err) {
      toast.error("Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    deleteModal.onOpen();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsDeleting(true);
      await api.users.delete(selectedUser.email);
      setUsersData((prev) => prev.filter((u) => u._id !== selectedUser._id));
      toast.success("User deleted successfully");
      deleteModal.onClose();
      setSelectedUser(null);
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const {
  isOpen: isAddOpen,
  onOpen: onAddOpen,
  onClose: onAddClose,
} = useDisclosure();

const [newUser, setNewUser] = useState({
  name: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
});


const handleAddUser = async () => {
  if (newUser.password.length < 8) {
    toast.error("Password must be at least 8 characters");
    return;
  }

  try {
    const res = await api.users.create(newUser);

    setUsersData((prev) => [res.data, ...prev]);
    onAddClose();

    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "user",
      status: "active",
    });
  } catch (error) {
    console.error("Failed to add user", error);
    toast.error("Failed to add user");
  }
};

const capitalize = (text?: string) => {
  if (!text) return "Unknown";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

 
  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users Dashboard</h1>
          <p className="text-sm text-gray-500">Manage {usersData.length} users</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="flat"
            startContent={<Download size={18} />}
            onClick={handleDownloadExcel}
            isDisabled={usersData.length === 0}
            className="rounded-xl"
          >
            Export
          </Button>
          <Button
            color="primary"
            startContent={<UserPlus size={18} />}
            className="rounded-xl"
             onClick={onAddOpen}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="rounded-2xl shadow-sm">
        <CardBody className="flex flex-col md:flex-row gap-4 md:gap-6 items-center p-6">
          <Input
            placeholder="Search by name, email or ID..."
            startContent={<SearchIcon size={18} className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            isClearable
            onClear={() => setSearchTerm("")}
            className="w-full md:w-64"
            classNames={{
              inputWrapper: "rounded-xl bg-white dark:bg-gray-800",
            }}
          />

          <Select
            label="Status"
            className="w-40"
            classNames={{ trigger: "rounded-xl" }}
            selectedKeys={statusFilter === "all" ? [] : [statusFilter]}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="inactive">Inactive</SelectItem>
            <SelectItem key="pending">Pending</SelectItem>
            <SelectItem key="suspended">Suspended</SelectItem>
          </Select>

          <Select
            label="Role"
            className="w-40"
            classNames={{ trigger: "rounded-xl" }}
            selectedKeys={roleFilter === "all" ? [] : [roleFilter]}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="admin">Admin</SelectItem>
            <SelectItem key="user">User</SelectItem>
            <SelectItem key="moderator">Moderator</SelectItem>
          </Select>

          <span className="text-sm text-gray-500 ml-auto">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
          </span>
        </CardBody>
      </Card>

      {/* TABLE */}
      <Card className="rounded-2xl shadow-sm">
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Users table"
            bottomContent={
              pages > 1 && (
                <div className="flex justify-center p-4 border-t">
                  <Pagination page={page} total={pages} onChange={setPage} showControls />
                </div>
              )
            }
          >
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>ROLE & STATUS</TableColumn>
              <TableColumn>ACTIVITY</TableColumn>
              <TableColumn>SECURITY</TableColumn>
              <TableColumn align="end">ACTIONS</TableColumn>
            </TableHeader>

            <TableBody isLoading={isLoading} emptyContent="No users found">
              {paginatedUsers.map((user) => (
                <TableRow key={user._id}>
                  {/* USER */}
                  <TableCell>
                    <div className="flex gap-3 items-center">
                      <Avatar
                        name={user.name}
                        src={user.avatar}
                        showFallback
                        className="flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MessageCircle size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* ROLE & STATUS */}
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={roleColor[user.role]}
                        startContent={<Shield size={12} />}
                      >
                       {capitalize(user.role)}
                      </Chip>
                      <Chip size="sm" variant="dot" color={statusColor[user.status]}>
                          {capitalize(user.status)}

                      </Chip>
                    </div>
                  </TableCell>

                  {/* ACTIVITY */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        Joined {formatDate(user.createdAt)}
                      </p>
                      <p className="text-xs flex items-center gap-2">
                        <Clock size={14} className="text-green-500" />
                        {getTimeAgo(user.lastLogin)}
                      </p>
                    </div>
                  </TableCell>

                  {/* SECURITY */}
                  <TableCell>
                    {user.failedLoginAttempts > 0 ? (
                      <Chip
                        size="sm"
                        color={user.failedLoginAttempts > 5 ? "danger" : "warning"}
                        variant="flat"
                      >
                        {user.failedLoginAttempts} failed
                      </Chip>
                    ) : (
                      <span className="text-xs text-gray-500">✓ Secure</span>
                    )}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="User actions">
                        <DropdownItem
                          key="view"
                          startContent={<Eye size={14} />}
                          onClick={() => handleViewUser(user)}
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Edit size={14} />}
                          onClick={() => handleEditClick(user)}
                        >
                          Edit User
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          className="text-danger"
                          startContent={<Trash2 size={14} />}
                          onClick={() => handleDeleteClick(user)}
                        >
                          Delete User
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

   
      <Modal
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">User Details</h2>
              </ModalHeader>

              <ModalBody>
                {selectedUser && (
                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={selectedUser.avatar}
                        name={selectedUser.name}
                        className="w-20 h-20"
                        showFallback
                      />
                      <div>
                        <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Chip size="sm" color={roleColor[selectedUser.role]}>
                            {selectedUser.role}
                          </Chip>
                          <Chip size="sm" color={statusColor[selectedUser.status]}>
                            {selectedUser.status}
                          </Chip>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">User ID</p>
                          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {selectedUser._id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Role</p>
                          <p className="text-sm font-semibold">{selectedUser.role}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Status</p>
                          <p className="text-sm font-semibold">{selectedUser.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Failed Login Attempts</p>
                          <p className="text-sm font-semibold">
                            {selectedUser.failedLoginAttempts}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Created At</p>
                          <p className="text-sm">{formatDateTime(selectedUser.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Last Login</p>
                          <p className="text-sm">
                            {selectedUser.lastLogin
                              ? formatDateTime(selectedUser.lastLogin)
                              : "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Updated At</p>
                          <p className="text-sm">{formatDateTime(selectedUser.updatedAt)}</p>
                        </div>
                        {selectedUser.lastFailedLogin && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Last Failed Login</p>
                            <p className="text-sm">
                              {formatDateTime(selectedUser.lastFailedLogin)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    if (selectedUser) handleEditClick(selectedUser);
                  }}
                  startContent={<Edit size={16} />}
                >
                  Edit User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

 
      <Modal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        isDismissable={!isUpdating}
        isKeyboardDismissDisabled={isUpdating}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit User</ModalHeader>

              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Enter user name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    startContent={<User size={18} />}
                    isRequired
                  />

                  <Input
                    label="Email"
                    placeholder="Enter email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    startContent={<Mail size={18} />}
                    isRequired
                  />

                  <Select
                    label="Role"
                    selectedKeys={[editForm.role]}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value as User["role"],
                      })
                    }
                    startContent={<Shield size={18} />}
                  >
                    <SelectItem key="user">User</SelectItem>
                    <SelectItem key="admin">Admin</SelectItem>
                    <SelectItem key="moderator">Moderator</SelectItem>
                  </Select>

                  <Select
                    label="Status"
                    selectedKeys={[editForm.status]}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as User["status"],
                      })
                    }
                  >
                    <SelectItem key="active">Active</SelectItem>
                    <SelectItem key="inactive">Inactive</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="suspended">Suspended</SelectItem>
                  </Select>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleUpdateUser}
                  isLoading={isUpdating}
                >
                  Update User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

{/* ADD USER */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader>Add New User</ModalHeader>

        <ModalBody className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={newUser.name}
            onChange={(e) =>
              setNewUser({ ...newUser, name: e.target.value })
            }
            isRequired
          />

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
            isRequired
          />

          <Input
  label="Password"
  type="password"
  placeholder="••••••••"
  value={newUser.password}
  onChange={(e) =>
    setNewUser({ ...newUser, password: e.target.value })
  }
  isRequired
/>


          <Select
            label="Role"
            selectedKeys={[newUser.role]}
            onChange={(e) =>
              setNewUser({ ...newUser, role: e.target.value })
            }
          >
            <SelectItem key="admin">Admin</SelectItem>
            <SelectItem key="user">User</SelectItem>
            <SelectItem key="moderator">Moderator</SelectItem>
          </Select>

          <Select
            label="Status"
            selectedKeys={[newUser.status]}
            onChange={(e) =>
              setNewUser({ ...newUser, status: e.target.value })
            }
          >
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="inactive">Inactive</SelectItem>
            <SelectItem key="pending">Pending</SelectItem>
            <SelectItem key="suspended">Suspended</SelectItem>
          </Select>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleAddUser}>
            Create User
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>


   
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        isDismissable={!isDeleting}
        isKeyboardDismissDisabled={isDeleting}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-danger">Confirm Deletion</ModalHeader>

              <ModalBody>
                {selectedUser && (
                  <>
                    <p>
                      Are you sure you want to delete{" "}
                      <strong>{selectedUser.name}</strong>?
                    </p>
                    <p className="text-sm text-gray-500">
                      This action cannot be undone. All user data will be permanently
                      removed.
                    </p>
                  </>
                )}
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteUser}
                  isLoading={isDeleting}
                  startContent={!isDeleting && <Trash2 size={16} />}
                >
                  Delete User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}