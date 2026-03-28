"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
  Divider,
  Input,
  CheckboxGroup,
  Checkbox,
} from "@heroui/react";
import { Filter } from "lucide-react";

type Props = {
  price: number;
  setPrice: (value: number) => void;
  minPrice: number;
  setMinPrice: (value: number) => void;

  categories: any[];
  selectedCategories: string[];
  setSelectedCategories: (val: string[]) => void;

  rating: number | null;
  setRating: (val: number) => void;
};

export default function FilterProducts({
  price,
  setPrice,
  minPrice,
  setMinPrice,
  categories,
  selectedCategories,
  setSelectedCategories,
  rating,
  setRating,
}: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        onPress={onOpen}
        variant="bordered"
        className="capitalize md:hidden"
      >
        <Filter />
      </Button>

      <Drawer isOpen={isOpen} placement="left" onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader>Filter Products</DrawerHeader>

              <DrawerBody>
                {/* Price */}
                <h3 className="font-semibold mb-3">Price Range</h3>

                <input
                  type="range"
                  min={100}
                  max={20000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full"
                />

                <div className="flex items-center gap-3 mt-3">
                  <Input
                    type="number"
                    value={String(minPrice)}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    startContent={<span>$</span>}
                  />
                  <span className="w-6 h-1 bg-gray-400 rounded" />
                  <Input
                    type="number"
                    value={String(price)}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    startContent={<span>$</span>}
                  />
                </div>

                <Divider className="my-6" />

                {/* Categories */}
                <CheckboxGroup
                  label="Categories"
                  value={selectedCategories}
                  onChange={(val) =>
                    setSelectedCategories(val as string[])
                  }
                >
                  {categories.map((cat: any) => (
                    <Checkbox key={cat._id} value={cat._id}>
                      {cat.name}
                    </Checkbox>
                  ))}
                </CheckboxGroup>

                <Divider className="my-6" />

                {/* Rating */}
                <h3 className="font-semibold mb-3">Rating</h3>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={rating === r}
                        onChange={() => setRating(r)}
                        className="accent-blue-500"
                      />

                      <div>
                        {[...Array(r)].map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ★
                          </span>
                        ))}
                        {[...Array(5 - r)].map((_, i) => (
                          <span key={i} className="text-gray-300">
                            ★
                          </span>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </DrawerBody>

              <DrawerFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Apply Filters
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}