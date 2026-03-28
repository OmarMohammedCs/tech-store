"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { Delete, Edit, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/app/servise/api";


type Category = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  numReviews: number;
  description: string;
  category: Category;
  images: string[];
  countInStock: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type CategoryOption = {
  _id: string;
  name: string;
};

export default function ProductsDashboard() {
  const rowsPerPage = 8;


  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Add Product States
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductImages, setNewProductImages] = useState<FileList | null>(null);
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductCountInStock, setNewProductCountInStock] = useState(0);
  const [addingProduct, setAddingProduct] = useState(false);

  // Update Product States
  const [isUpdating, setIsUpdating] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);
  const [updateProductName, setUpdateProductName] = useState("");
  const [updateProductPrice, setUpdateProductPrice] = useState("");
  const [updateProductDescription, setUpdateProductDescription] = useState("");
  const [updateProductCountInStock, setUpdateProductCountInStock] = useState(0);

  // Delete Product States
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Category States
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

 
  const productDetails = useDisclosure();
  const addProductModal = useDisclosure();
  const addCategoryModal = useDisclosure();
  const updateModal = useDisclosure();
  const deleteModal = useDisclosure();

 
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product._id.includes(searchTerm);

      const matchesCategory =
        categoryFilter === "all" || 
        (product.category && product.category._id === categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const pages = Math.ceil(filteredProducts.length / rowsPerPage) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [page, filteredProducts]);
 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.products.getAll(),
          api.categories.getAll()
        ]);

        setProducts(productsRes.data.data || []);

        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

 
  if (!isMounted) {
    return (
      <div className="p-6 space-y-6 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

 
       
  const handleAddProduct = async () => {
    if (!newProductName || !newProductPrice || !newProductCategory || !newProductDescription || !newProductImages) {
      toast.error("All fields are required");
      return;
    }

    setAddingProduct(true);
    try {
      const formData = new FormData();
      formData.append("name", newProductName);
      formData.append("price", newProductPrice);
      formData.append("category", newProductCategory);
      formData.append("description", newProductDescription);
      formData.append("countInStock", newProductCountInStock.toString());
      
      for (let i = 0; i < newProductImages.length; i++) {
        formData.append("images", newProductImages[i]);
      }

      const { data } = await api.products.create(formData);

      setProducts((prev) => [data, ...prev]);
      addProductModal.onClose();

      // Reset form
      setNewProductName("");
      setNewProductPrice("");
      setNewProductCategory("");
      setNewProductImages(null);
      setNewProductDescription("");
      setNewProductCountInStock(0);

      toast.success("Product added successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error adding product");
      console.error("Error adding product:", error);
    } finally {
      setAddingProduct(false);
    }
  };

  const openUpdateModal = (product: Product) => {
    setProductToUpdate(product);
    setUpdateProductName(product.name);
    setUpdateProductPrice(product.price.toString());
    setUpdateProductDescription(product.description);
    setUpdateProductCountInStock(product.countInStock);
    updateModal.onOpen();
  };

  const handleUpdateProduct = async () => {
    if (!productToUpdate) return;

    setIsUpdating(true);
    try {
      const { data } = await api.products.update(productToUpdate._id, {
        name: updateProductName,
        price: Number(updateProductPrice),
        description: updateProductDescription,
        countInStock: updateProductCountInStock,
      });



      setProducts((prev) =>
        prev.map((p) => (p._id === productToUpdate._id ? data : p))
      );

      toast.success("Product updated successfully");
      updateModal.onClose();
      setProductToUpdate(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update product");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await api.products.delete(productToDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      toast.success("Product deleted successfully");
      deleteModal.onClose();
      setProductToDelete(null);
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) {
      toast.error("Category name is required");
      return;
    }

    setAddingCategory(true);
    try {
      const { data } = await api.categories.create({ name: newCategoryName });

      setCategories((prev) => [...prev, data]);
      addCategoryModal.onClose();
      toast.success("Category created successfully");
      setNewCategoryName("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error adding category");
      console.error("Error adding category:", error);
    } finally {
      setAddingCategory(false);
    }
  };

 
  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products Dashboard</h1>
          <p className="text-sm text-gray-500">Manage products & categories</p>
        </div>

        <div className="flex gap-3">
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onPress={addProductModal.onOpen}
            isLoading={addingProduct}
          >
            Add Product
          </Button>

          <Button
            color="secondary"
            startContent={<Plus size={18} />}
            onPress={addCategoryModal.onOpen}
            isLoading={addingCategory}
          >
            Create Category
          </Button>
        </div>
      </div>

      {/* FILTER */}
      <Card>
        <CardBody className="flex flex-col md:flex-row gap-4 items-center">
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            startContent={<Search size={18} className="text-gray-400" />}
            className="md:w-64"
          />

          <Select
            label="Category"
            aria-label="Select Category"
            selectedKeys={
              categoryFilter === "all"
                ? new Set(["all"])
                : new Set([categoryFilter])
            }
            onSelectionChange={(keys) => {
              const keyArray = Array.from(keys);
              const value = keyArray[0] as string;
              setCategoryFilter(value);
              setPage(1);
            }}
            className="md:w-56"
            isDisabled={loading}
          >
            <SelectItem key="all" textValue="All Categories">
              All Categories
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} textValue={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </Select>

          <span className="text-sm text-gray-500 ml-auto">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </CardBody>
      </Card>

      {/* TABLE */}
      <Card>
        <CardBody className="p-0">
          <Table
            removeWrapper
            aria-label="Products table"
            bottomContent={
              pages > 1 ? (
                <div className="flex justify-center p-4">
                  <Pagination
                    page={page}
                    total={pages}
                    onChange={setPage}
                    showControls
                    color="primary"
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Category</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn>Stock</TableColumn>
              <TableColumn>Created At</TableColumn>
              <TableColumn align="center">Action</TableColumn>
            </TableHeader>

            <TableBody
              isLoading={loading}
              loadingContent={<span>Loading...</span>}
              emptyContent={
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found</p>
                  <Button
                    color="primary"
                    variant="flat"
                    className="mt-2"
                    onPress={addProductModal.onOpen}
                  >
                    Add Your First Product
                  </Button>
                </div>
              }
            >
              {paginatedProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-mono text-sm">
                    {product._id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category?.name || "No Category"}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{product.price} EGP</span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.countInStock}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="flex justify-center items-center gap-2">
                    <Button
                      size="sm"
                      onPress={() => {
                        setSelectedProduct(product);
                        productDetails.onOpen();
                      }}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="light"
                      className="text-red-600 hover:text-red-800"
                      onPress={() => {
                        setProductToDelete(product);
                        deleteModal.onOpen();
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>

                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => openUpdateModal(product)}
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

      {/* VIEW PRODUCT MODAL */}
      <Modal
        isOpen={productDetails.isOpen}
        onClose={productDetails.onClose}
        size="lg"
      >
        <ModalContent>
          {selectedProduct && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedProduct.name}
              </ModalHeader>
              <ModalBody className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-6">
                  {selectedProduct.images && selectedProduct.images[0] && (
                    <div className="w-full sm:w-1/3">
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="font-mono text-sm">{selectedProduct._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p>{selectedProduct.category?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-xl font-bold">{selectedProduct.price} EGP</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stock</p>
                      <p className={`font-semibold ${selectedProduct.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProduct.countInStock} items
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p>{new Date(selectedProduct.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-700">{selectedProduct.description}</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={productDetails.onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={addProductModal.isOpen}
        onClose={addProductModal.onClose}
        size="xl"
      >
        <ModalContent>
          <ModalHeader>Add New Product</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Product Name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              isRequired
              placeholder="Enter product name"
            />

            
              <Input
                label="Price (EGP)"
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                isRequired
                placeholder="0.00"
                startContent={<span className="text-default-400">EGP</span>}
              />


            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stock Count"
                type="number"
                value={newProductCountInStock.toString()}
                onChange={(e) => setNewProductCountInStock(Number(e.target.value))}
                placeholder="0"
              />

              <Select
                label="Category *"
                selectedKeys={newProductCategory ? new Set([newProductCategory]) : new Set()}
                onSelectionChange={(keys) => {
                  const keyArray = Array.from(keys);
                  setNewProductCategory(keyArray[0] as string);
                }}
                isRequired
                placeholder="Select a category"
              >
                {categories.map((cat) => (
                  <SelectItem key={cat._id} textValue={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Textarea
              label="Description"
              value={newProductDescription}
              onChange={(e) => setNewProductDescription(e.target.value)}
              placeholder="Enter product description"
              minRows={3}
            />

            <div>
              <label className="block mb-2 font-medium text-default-700">
                Product Images *
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewProductImages(e.target.files)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary-600"
              />
              {newProductImages && newProductImages.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {newProductImages.length} file(s)
                </p>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="light"
              onPress={addProductModal.onClose}
              isDisabled={addingProduct}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddProduct}
              isLoading={addingProduct}
              isDisabled={!newProductName || !newProductPrice || !newProductCategory || !newProductImages}
            >
              Add Product
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* UPDATE PRODUCT MODAL */}
      <Modal isOpen={updateModal.isOpen} onClose={updateModal.onClose} size="xl">
        <ModalContent>
          <ModalHeader>Update Product</ModalHeader>

          <ModalBody className="space-y-4">
            <Input
              label="Product Name"
              value={updateProductName}
              onChange={(e) => setUpdateProductName(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                value={updateProductPrice}
                onChange={(e) => setUpdateProductPrice(e.target.value)}
              />

            </div>

            <Input
              label="Stock Count"
              type="number"
              value={updateProductCountInStock.toString()}
              onChange={(e) => setUpdateProductCountInStock(Number(e.target.value))}
            />

            <Textarea
              label="Description"
              value={updateProductDescription}
              onChange={(e) => setUpdateProductDescription(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={updateModal.onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isUpdating}
              onPress={handleUpdateProduct}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalContent>
          {(closeModal) => (
            <>
              <ModalHeader className="text-danger">
                Confirm Deletion
              </ModalHeader>

              <ModalBody>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{productToDelete?.name}</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => {
                    closeModal();
                    setProductToDelete(null);
                  }}
                  isDisabled={isDeleting}
                >
                  Cancel
                </Button>

                <Button
                  color="danger"
                  isLoading={isDeleting}
                  onPress={handleDeleteProduct}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ADD CATEGORY MODAL */}
      <Modal
        isOpen={addCategoryModal.isOpen}
        onClose={addCategoryModal.onClose}
      >
        <ModalContent>
          <ModalHeader>Create New Category</ModalHeader>
          <ModalBody>
            <Input
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              isRequired
              placeholder="Enter category name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategoryName) {
                  handleAddCategory();
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={addCategoryModal.onClose}
              isDisabled={addingCategory}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddCategory}
              isLoading={addingCategory}
              isDisabled={!newCategoryName}
            >
              Create Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}