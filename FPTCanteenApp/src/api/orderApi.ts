// API mẫu cho đơn hàng
export type OrderStatus =
  | "preparing"
  | "delivering"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  foodName: string;
  total: number;
  status: OrderStatus;
  canEdit: boolean;
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    foodName: "Cơm gà",
    total: 35000,
    status: "preparing",
    canEdit: true,
    createdAt: "2024-06-01T10:00:00Z",
  },
  {
    id: "2",
    foodName: "Bún bò",
    total: 40000,
    status: "delivering",
    canEdit: false,
    createdAt: "2024-06-01T09:30:00Z",
  },
  {
    id: "3",
    foodName: "Phở bò",
    total: 30000,
    status: "delivered",
    canEdit: false,
    createdAt: "2024-05-31T18:00:00Z",
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getOrders = async (userId: string): Promise<Order[]> => {
  await delay(700);
  return mockOrders;
};

export const getOrderDetail = async (
  orderId: string
): Promise<Order | undefined> => {
  await delay(500);
  return mockOrders.find((o) => o.id === orderId);
};

export const cancelOrder = async (
  orderId: string
): Promise<Order | undefined> => {
  await delay(500);
  const idx = mockOrders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    mockOrders[idx].status = "cancelled";
    mockOrders[idx].canEdit = false;
    return mockOrders[idx];
  }
  return undefined;
};
