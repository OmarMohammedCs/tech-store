"use client";

import { useEffect, useMemo, useState } from "react";
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
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";

import {
  TrendingUp,
  ShoppingCart,
  Users,
  SearchIcon,
  Edit,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import toast from "react-hot-toast";
import api from "../servise/api";

 

const statusColor: Record<string, any> = {
  pending: "warning",
  delivered: "success",
  cancelled: "danger",
};

interface ChartDataItem {
  _id: string;
  totalProfit: number;
}

 

export default function DashboardPage() {
  const rowsPerPage = 8;

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderEdit, setSelectedOrderEdit] = useState<any>(null);
  const [editOrderStatus, setEditOrderStatus] = useState("");

  const viewModal = useDisclosure();
  const editModal = useDisclosure();

  const [users, setUsers] = useState<any[]>([]);

  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

useEffect(() => {
  const fetchChartData = async () => {
    try {
      const res = await api.sales.getAll();
      setChartData(res.data);
    } catch (error) {
      console.error("Fetch chart data error:", error);
    }
  };

  fetchChartData();
}, []);




  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.users.getAll();
        setUsers(res.data);
      } catch (error) {
        console.error("Fetch users error:", error);
      }
    };

    fetchUsers();
  }, []);

 

  const fetchOrders = async () => {
    try {
      const res = await api.orders.getAll();
      setOrders(res.data);
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

 

  const calculateTotalItems = (orderItems: any[]) =>
    orderItems.reduce((sum, item) => sum + item.quantity, 0);

 

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const pages = Math.ceil(filteredOrders.length / rowsPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [page, filteredOrders]);

 

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    viewModal.onOpen();
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrderEdit(order);
    setEditOrderStatus(order.status);
    editModal.onOpen();
  };

  const handleSaveEdit = async () => {
    try {
      await api.orders.update({ status: editOrderStatus,orderId: selectedOrderEdit._id })
      toast.success("Order status updated!");
      editModal.onClose();
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Update order error:", error);
    }
  };

  return (
    <div className="space-y-10">

  
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Stat
          title="Total Revenue"
          value={`EGP ${chartData.reduce((sum, item) => sum + item.totalProfit, 0).toFixed(2)}`}
          icon={<TrendingUp size={20} />}
          color="bg-indigo-100 text-indigo-600"
        />
        <Stat
          title="Orders"
          value={orders.length.toString() || "0"}
          icon={<ShoppingCart size={20} />}
          color="bg-green-100 text-green-600"
        />
        <Stat
          title="Customers"
          value={users.length.toString() || "0"}
          icon={<Users size={20} />}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      
      <Card className="rounded-2xl">
        <CardBody className="p-6">
          <h3 className="font-semibold mb-4">Sales Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="totalProfit"
                  stroke="#6366f1"
                  fill="#6366f1"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

 
      <Card className="rounded-2xl">
        <CardBody className="flex flex-col md:flex-row gap-4 justify-between">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<SearchIcon size={18} />}
          />

          <Select
            selectedKeys={statusFilter === "all" ? [] : [statusFilter]}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="pending">Pending</SelectItem>
            <SelectItem key="delivered">Delivered</SelectItem>
            <SelectItem key="cancelled">Cancelled</SelectItem>
          </Select>
        </CardBody>
      </Card>

    
      <Card className="rounded-2xl">
        <CardBody className="p-0">
          <Table
            bottomContent={
              <Pagination page={page} total={pages} onChange={setPage} />
            }
          >
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>ITEMS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>

            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>

                  <TableCell className="flex gap-2 items-center">
                    <Avatar src="/user.png" />
                    {order?.user?.name || 'user'}
                  </TableCell>

                  <TableCell>
                    <Chip color={statusColor[order.status]}>
                      {order.status}
                    </Chip>
                  </TableCell>

                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    {calculateTotalItems(order.orderItems)} items
                  </TableCell>

                  <TableCell className="flex gap-2">
                    <Button size="sm" onPress={() => handleViewOrder(order)}>
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => handleEditOrder(order)}
                    >
                      <Edit size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

     
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.onClose}>
        <ModalContent>
          {selectedOrder && (
            <>
<ModalHeader className="flex flex-col gap-1">
  <span className="text-lg font-semibold">Order Details</span>
  <span className="text-sm text-gray-500">
    Order ID: {selectedOrder._id}
  </span>
</ModalHeader>

<ModalBody className="space-y-4">

  {/* User */}
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-500">User</span>
    <span className="font-medium">{selectedOrder.user?.name}</span>
  </div>

  {/* Status */}
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-500">Status</span>
    <Chip color={statusColor[selectedOrder.status]}>
      {selectedOrder.status}
    </Chip>
  </div>

  {/* Location */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-sm text-gray-500">City</p>
      <p className="font-medium">{selectedOrder.city}</p>
    </div>

    <div>
      <p className="text-sm text-gray-500">Address</p>
      <p className="font-medium">{selectedOrder.address}</p>
    </div>
  </div>

  {/* Phone */}
  <div>
    <p className="text-sm text-gray-500">Phone</p>
    <p className="font-medium">{selectedOrder.phone}</p>
  </div>

  {/* Items */}
  <div className="flex justify-between items-center border-t pt-3">
    <span className="text-sm text-gray-500">Total Items</span>
    <span className="font-semibold">
      {selectedOrder.orderItems.length}
    </span>
  </div>

</ModalBody>

            </>
          )}
        </ModalContent>
      </Modal>

   
      <Modal isOpen={editModal.isOpen} onClose={editModal.onClose}>
        <ModalContent>
          <ModalHeader>Edit Status</ModalHeader>
          <ModalBody>
            <Select
              selectedKeys={[editOrderStatus]}
              onSelectionChange={(keys) =>
                setEditOrderStatus(Array.from(keys)[0] as string)
              }
            >
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="delivered">Delivered</SelectItem>
              <SelectItem key="cancelled">Cancelled</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={editModal.onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveEdit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

 

function Stat({ title, value, icon, color }: any) {
  return (
    <Card className="rounded-2xl">
      <CardBody className="p-6">
        <div className="flex justify-between">
          <p className="text-sm text-gray-500">{title}</p>
          <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
        </div>
        <h2 className="text-2xl font-bold">{value}</h2>
      </CardBody>
    </Card>
  );
}
