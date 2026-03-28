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

import { SearchIcon, Edit, Download } from "lucide-react";
import toast from "react-hot-toast";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/app/servise/api";



const statusColor: Record<string, "success" | "warning" | "danger"> = {
  pending: "warning",
  delivered: "success",
  cancelled: "danger",
};



export default function DashboardPage() {
  const rowsPerPage = 8;

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderEdit, setSelectedOrderEdit] = useState<any>(null);
  const [editOrderStatus, setEditOrderStatus] = useState<string>("pending");

  const viewModal = useDisclosure();
  const editModal = useDisclosure();



  const fetchOrders = async () => {
    try {
      const res = await api.orders.getAll();
      setOrders(res.data || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);


  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);



  const calculateTotalItems = (items: any[] = []) =>
    items.reduce((sum, item) => sum + (item.quantity || 0), 0);



  const filteredOrders = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return orders.filter((order) => {
      const idMatch = order._id?.toLowerCase().includes(search);

      const userName = order.user?.name?.toLowerCase() || "";
      const userMatch = userName.includes(search);

      const statusMatch =
        statusFilter === "all" || order.status === statusFilter;

      return (idMatch || userMatch) && statusMatch;
    });
  }, [orders, searchTerm, statusFilter]);

  const pages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [page, filteredOrders]);



  const handleExportExcel = () => {
    if (!filteredOrders.length) {
      toast.error("No data to export");
      return;
    }

    const data = filteredOrders.map((order) => ({
      ID: order._id,
      User: order.user?.name || "User",
      Status: order.status,
      Date: new Date(order.createdAt).toLocaleDateString(),
      Items: calculateTotalItems(order.orderItems),
      City: order.city,
      Phone: order.phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "orders.xlsx");
  };


  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    viewModal.onOpen();
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrderEdit(order);
    setEditOrderStatus(order.status || "pending");
    editModal.onOpen();
  };

  const handleSaveEdit = async () => {
    if (!selectedOrderEdit) return;

    try {
      await api.orders.update({
        orderId: selectedOrderEdit._id,
        status: editOrderStatus,
      });

      toast.success("Order updated");
      editModal.onClose();

      fetchOrders();
    } catch (error) {
      toast.error("Update failed");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">


        <div>
          <h1 className="text-3xl font-bold">Orders Dashboard</h1>
          <p className="text-sm text-gray-500">Manage Orders</p>
        </div>


   

<Card>
<CardBody>
<div className="flex items-center gap-4 flex-wrap">
  <Input
    placeholder="Search orders..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    startContent={<SearchIcon size={18} />}
    className="flex-none w-[200px] md:w-[400] lg:w-[600] "
    />

  <Select
    selectedKeys={
        statusFilter === "all" ? new Set([]) : new Set([statusFilter])
    }
    onChange={(e) => setStatusFilter(e.target.value)}
    className="flex-none w-[150px]"
  >
    <SelectItem key="all">All</SelectItem>
    <SelectItem key="pending">Pending</SelectItem>
    <SelectItem key="delivered">Delivered</SelectItem>
    <SelectItem key="cancelled">Cancelled</SelectItem>
  </Select>

  <Button
    color="primary"
    onPress={handleExportExcel}
    className="flex-none w-[140px]"
    startContent={<Download size={18} />}
  >
    Export Excel
  </Button>
</div>
</CardBody>
    </Card>
 

    

      <Card>
        <CardBody className="p-0">
          <Table
            bottomContent={
              pages > 1 ? (
                <Pagination page={page} total={pages} onChange={setPage} />
              ) : null
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

            <TableBody emptyContent="No orders found">
              {paginatedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>

                  <TableCell className="flex gap-2 items-center">
                    <Avatar src="/user.png" />
                    {order.user?.name || "User"}
                  </TableCell>

                  <TableCell>
                    <Chip color={statusColor[order.status] || "warning"}>
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
              <ModalHeader>Order Details</ModalHeader>
              <ModalBody>
                <p>User: {selectedOrder.user?.name}</p>
                <p>Status: {selectedOrder.status}</p>
                <p>City: {selectedOrder.city}</p>
                <p>Address: {selectedOrder.address}</p>
                <p>Phone: {selectedOrder.phone}</p>
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
              selectedKeys={new Set([editOrderStatus])}
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
