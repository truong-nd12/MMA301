import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Order, orderManagementApi } from '../api/orderManagementApi';

const { width } = Dimensions.get('window');

const statusColors = {
  pending: '#FFA500',
  confirmed: '#3498DB',
  preparing: '#F39C12',
  ready: '#27AE60',
  delivered: '#2ECC71',
  cancelled: '#E74C3C'
};

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  ready: 'Sẵn sàng',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
};

const OrderCard = ({ 
  order, 
  onStatusChange,
  onViewDetails
}: { 
  order: Order; 
  onStatusChange: (orderId: string, status: Order['status']) => void;
  onViewDetails: (order: Order) => void;
}) => {
  const getStatusColor = (status: Order['status']) => {
    return statusColors[status] || '#666';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      style={styles.orderCard}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Đơn hàng #{order._id.slice(-6)}</Text>
          <Text style={styles.customerName}>{order.user.name}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{statusLabels[order.status]}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, index) => (
          <View key={item._id} style={styles.orderItem}>
            <Image
              source={{ uri: item.product.images }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.itemQuantity}>
                Số lượng: {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                {(item.price || 0).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>
            {(order.finalAmount || 0).toLocaleString('vi-VN')}đ
          </Text>
        </View>
        
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onViewDetails(order)}
          >
            <Ionicons name="eye-outline" size={16} color="#3498DB" />
            <Text style={styles.actionText}>Chi tiết</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.statusButton]}
            onPress={() => {
              // Show status change modal
              Alert.alert(
                'Thay đổi trạng thái',
                'Chọn trạng thái mới:',
                [
                  { text: 'Chờ xác nhận', onPress: () => onStatusChange(order._id, 'pending') },
                  { text: 'Đã xác nhận', onPress: () => onStatusChange(order._id, 'confirmed') },
                  { text: 'Đang chuẩn bị', onPress: () => onStatusChange(order._id, 'preparing') },
                  { text: 'Sẵn sàng', onPress: () => onStatusChange(order._id, 'ready') },
                  { text: 'Đã giao', onPress: () => onStatusChange(order._id, 'delivered') },
                  { text: 'Hủy', onPress: () => onStatusChange(order._id, 'cancelled') },
                  { text: 'Hủy', style: 'cancel' }
                ]
              );
            }}
          >
            <Ionicons name="swap-horizontal-outline" size={16} color="#F39C12" />
            <Text style={[styles.actionText, { color: '#F39C12' }]}>Trạng thái</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );
};

const OrderDetailModal = ({ 
  visible, 
  order, 
  onClose 
}: {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}) => {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
              <Text style={styles.detailText}>Tên: {order.user.name}</Text>
              <Text style={styles.detailText}>Email: {order.user.email}</Text>
              {order.deliveryAddress && (
                <Text style={styles.detailText}>Địa chỉ: {order.deliveryAddress}</Text>
              )}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Món ăn</Text>
              {order.items.map((item) => (
                <View key={item._id} style={styles.detailItem}>
                  <Image
                    source={{ uri: item.product.images }}
                    style={styles.detailItemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.detailItemInfo}>
                    <Text style={styles.detailItemName}>{item.product.name}</Text>
                    <Text style={styles.detailItemQuantity}>
                      Số lượng: {item.quantity}
                    </Text>
                    <Text style={styles.detailItemPrice}>
                      {(item.price || 0).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
              <Text style={styles.detailText}>
                Tổng tiền: {(order.totalAmount || 0).toLocaleString('vi-VN')}đ
              </Text>
              <Text style={styles.detailText}>
                Giảm giá: {(order.discount || 0).toLocaleString('vi-VN')}đ
              </Text>
              <Text style={styles.detailText}>
                Thành tiền: {(order.finalAmount || 0).toLocaleString('vi-VN')}đ
              </Text>
              <Text style={styles.detailText}>
                Phương thức: {order.paymentMethod}
              </Text>
              <Text style={styles.detailText}>
                Trạng thái: {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
              <Text style={styles.detailText}>
                Trạng thái: {statusLabels[order.status]}
              </Text>
              {order.deliveryTime && (
                <Text style={styles.detailText}>
                  Thời gian giao: {order.deliveryTime}
                </Text>
              )}
              <Text style={styles.detailText}>
                Tạo lúc: {formatDate(order.createdAt)}
              </Text>
              <Text style={styles.detailText}>
                Cập nhật: {formatDate(order.updatedAt)}
              </Text>
            </View>

            {order.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Ghi chú</Text>
                <Text style={styles.detailText}>{order.notes}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading orders...');
      
      const response = await orderManagementApi.getAllOrders();
      console.log('📥 Orders response:', response);
      setOrders(response.orders || []);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
      await orderManagementApi.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3498DB', '#2980B9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadOrders}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Status Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilter}
        contentContainerStyle={styles.statusFilterContent}
      >
        {Object.entries(statusCounts).map(([status, count]) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterButton,
              selectedStatus === status && styles.statusFilterButtonActive
            ]}
            onPress={() => setSelectedStatus(status as Order['status'] | 'all')}
          >
            <Text style={[
              styles.statusFilterText,
              selectedStatus === status && styles.statusFilterTextActive
            ]}>
              {status === 'all' ? 'Tất cả' : statusLabels[status as Order['status']]}
            </Text>
            <Text style={[
              styles.statusFilterCount,
              selectedStatus === status && styles.statusFilterCountActive
            ]}>
              {count}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#DDD" />
          <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          <Text style={styles.emptySubtext}>
            {selectedStatus === 'all' 
              ? 'Chưa có đơn hàng nào được tạo'
              : `Không có đơn hàng nào ở trạng thái "${statusLabels[selectedStatus as Order['status']]}"`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <OrderDetailModal
        visible={showDetailModal}
        order={selectedOrder}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusFilter: {
    backgroundColor: 'white',
    paddingVertical: 12,
  },
  statusFilterContent: {
    paddingHorizontal: 16,
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusFilterButtonActive: {
    backgroundColor: '#3498DB',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  statusFilterTextActive: {
    color: 'white',
  },
  statusFilterCount: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusFilterCountActive: {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  statusButton: {
    backgroundColor: '#fff3cd',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  detailItemQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailItemPrice: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
});

export default OrderManagementScreen; 