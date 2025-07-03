import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const dummyPurchaseData = [
  { date: "2024-09-01", totalPurchased: 15000 },
  { date: "2024-09-02", totalPurchased: 17500 },
  { date: "2024-09-03", totalPurchased: 16800 },
  { date: "2024-09-04", totalPurchased: 18200 },
  { date: "2024-09-05", totalPurchased: 19500 },
  { date: "2024-09-06", totalPurchased: 21000 },
  { date: "2024-09-07", totalPurchased: 20500 },
];

const lastDataPoint = dummyPurchaseData[dummyPurchaseData.length - 1];
const previousDataPoint = dummyPurchaseData[dummyPurchaseData.length - 2];
const changePercentage = ((lastDataPoint.totalPurchased - previousDataPoint.totalPurchased) / previousDataPoint.totalPurchased) * 100;

const dummyDashboardMetrics = {
  purchaseSummary: dummyPurchaseData.map(item => ({
    ...item,
    changePercentage: changePercentage.toFixed(2)
  }))
};

const CardPurchaseSummary = () => {
  const { data, isLoading } = { data: dummyDashboardMetrics, isLoading: false };
  const purchaseData = data?.purchaseSummary || [];

  const lastDataPoint = purchaseData[purchaseData.length - 1] || null;

  return (
    <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-white shadow-md rounded-2xl">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              Purchase Summary
            </h2>
            <hr />
          </div>

          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="mb-4 mt-7 px-7">
              <p className="text-xs text-gray-400">Purchased</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold">
                  ${lastDataPoint ? (lastDataPoint.totalPurchased / 1000).toFixed(2) + 'k' : "0"}
                </p>
                {lastDataPoint && (
                  <p
                    className={`text-sm ${
                      parseFloat(lastDataPoint.changePercentage) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    } flex ml-3`}
                  >
                    {parseFloat(lastDataPoint.changePercentage) >= 0 ? (
                      <TrendingUp className="w-5 h-5 mr-1" />
                    ) : (
                      <TrendingDown className="w-5 h-5 mr-1" />
                    )}
                    {Math.abs(parseFloat(lastDataPoint.changePercentage)).toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
            {/* CHART */}
            <ResponsiveContainer width="100%" height={200} className="p-2">
              <AreaChart
                data={purchaseData}
                margin={{ top: 0, right: 0, left: -50, bottom: 45 }}
              >
                <XAxis dataKey="date" tick={false} axisLine={false} />
                <YAxis tickLine={false} tick={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString("en")}`,
                  ]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  }}
                />
                <Area
                  type="linear"
                  dataKey="totalPurchased"
                  stroke="#8884d8"
                  fill="#8884d8"
                  dot={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;