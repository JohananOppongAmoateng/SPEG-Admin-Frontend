import React from "react";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";

const Rating = ({ rating }: { rating: number }) => {
  return <span>{'⭐'.repeat(rating)}</span>;
};

const dummyPopularProducts = [
  {
    productId: 1,
    name: "Wireless Earbuds",
    price: 79.99,
    rating: 4,
    stockQuantity: 15000
  },
  {
    productId: 2,
    name: "Smart Watch",
    price: 199.99,
    rating: 5,
    stockQuantity: 8000
  },
  {
    productId: 3,
    name: "Bluetooth Speaker",
    price: 59.99,
    rating: 4,
    stockQuantity: 12000
  }
];

const CardPopularProducts = () => {
  const dashboardMetrics = { popularProducts: dummyPopularProducts };
  const isLoading = false;

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
            Popular Products
          </h3>
          <hr />
          <div className="overflow-auto h-full">
            {dashboardMetrics?.popularProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={`/api/placeholder/48/48`}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-lg w-14 h-14"
                  />
                  <div className="flex flex-col justify-between gap-1">
                    <div className="font-bold text-gray-700">
                      {product.name}
                    </div>
                    <div className="flex text-sm items-center">
                      <span className="font-bold text-blue-500 text-xs">
                        ${product.price}
                      </span>
                      <span className="mx-2">|</span>
                      <Rating rating={product.rating || 0} />
                    </div>
                  </div>
                </div>
                <div className="text-xs flex items-center">
                  <button className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  {Math.round(product.stockQuantity / 1000)}k Sold
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;