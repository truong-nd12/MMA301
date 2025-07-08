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
import { MenuItem, createMenuItem, deleteMenuItem, getMenuItems, updateMenuItem, updateMenuItemQuantity, updateMenuItemStatus } from '../api/menuApi';

const { width } = Dimensions.get('window');

const vendors = [
  { id: "v1", name: "Quầy Cơm", color: "#FF6B6B" },
  { id: "v2", name: "Quầy Bún", color: "#4ECDC4" },
  { id: "v3", name: "Quầy Chay", color: "#45B7D1" },
  { id: "v4", name: "Quầy Đồ Uống", color: "#96CEB4" },
  { id: "v5", name: "Quầy Tráng Miệng", color: "#FFEAA7" },
];

const categories = [
  { id: "chay", name: "Chay", color: "#27AE60" },
  { id: "man", name: "Mặn", color: "#E74C3C" },
  { id: "an_nhe", name: "Ăn nhẹ", color: "#F39C12" },
  { id: "nuoc", name: "Nước", color: "#3498DB" },
];

const types = [
  { id: "com", name: "Cơm" },
  { id: "bun", name: "Bún" },
  { id: "mi", name: "Mì" },
  { id: "trangmieng", name: "Tráng miệng" },
];

const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const statusOptions = [
  { value: 'available', label: 'Có sẵn', color: '#27AE60' },
  { value: 'almost_out', label: 'Sắp hết', color: '#F39C12' },
  { value: 'out', label: 'Hết hàng', color: '#E74C3C' },
];

const MenuItemCard = ({ item, onEdit, onDelete, onStatusChange, onQuantityChange }: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: MenuItem['status']) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: MenuItem['status']) => {
    switch (status) {
      case 'available': return '#27AE60';
      case 'almost_out': return '#F39C12';
      case 'out': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getStatusText = (status: MenuItem['status']) => {
    switch (status) {
      case 'available': return 'Có sẵn';
      case 'almost_out': return 'Sắp hết';
      case 'out': return 'Hết hàng';
      default: return 'Không xác định';
    }
  };

  return (
    <Animatable.View animation="fadeInUp" style={styles.menuCard}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image }} style={styles.menuImage} />
        <View style={styles.cardInfo}>
          <Text style={styles.menuName}>{item.name}</Text>
          <Text style={styles.menuPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowActions(!showActions)} style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {showActions && (
        <Animatable.View animation="fadeIn" style={styles.actionMenu}>
          <TouchableOpacity style={styles.actionItem} onPress={() => onEdit(item)}>
            <Ionicons name="create-outline" size={16} color="#3498DB" />
            <Text style={styles.actionText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={16} color="#E74C3C" />
            <Text style={styles.actionText}>Xóa</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Số lượng:</Text>
          <TextInput
            style={styles.quantityInput}
            value={item.availableQuantity?.toString() || '0'}
            keyboardType="numeric"
            onChangeText={(text) => {
              const quantity = parseInt(text) || 0;
              onQuantityChange(item.id, quantity);
            }}
          />
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Trạng thái:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusOption,
                  { backgroundColor: item.status === status.value ? status.color : '#F8F9FA' }
                ]}
                onPress={() => onStatusChange(item.id, status.value as MenuItem['status'])}
              >
                <Text style={[
                  styles.statusOptionText,
                  { color: item.status === status.value ? 'white' : '#666' }
                ]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngày bán:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
            {days.map((day) => (
              <View
                key={day}
                style={[
                  styles.dayBadge,
                  { backgroundColor: item.days.includes(day) ? '#3498DB' : '#F8F9FA' }
                ]}
              >
                <Text style={[
                  styles.dayText,
                  { color: item.days.includes(day) ? 'white' : '#666' }
                ]}>
                  {day}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Animatable.View>
  );
};

const AddEditModal = ({ visible, item, onClose, onSave }: {
  visible: boolean;
  item?: MenuItem;
  onClose: () => void;
  onSave: (item: Omit<MenuItem, 'id'>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    desc: '',
    image: '',
    vendorId: 'v1',
    category: 'man',
    type: 'com',
    servingTime: '11:00 - 13:00',
    studentDiscount: '0',
    estimatedWaitTime: '5-10 phút',
    calories: '0',
    spicyLevel: '0',
    availableQuantity: '50',
    maxQuantity: '100',
    days: [] as string[],
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price.toString(),
        originalPrice: item.originalPrice.toString(),
        desc: item.desc,
        image: item.image,
        vendorId: item.vendorId,
        category: item.category,
        type: item.type,
        servingTime: item.servingTime,
        studentDiscount: item.studentDiscount.toString(),
        estimatedWaitTime: item.estimatedWaitTime,
        calories: item.calories.toString(),
        spicyLevel: item.spicyLevel.toString(),
        availableQuantity: item.availableQuantity?.toString() || '50',
        maxQuantity: item.maxQuantity?.toString() || '100',
        days: item.days,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        desc: '',
        image: '',
        vendorId: 'v1',
        category: 'man',
        type: 'com',
        servingTime: '11:00 - 13:00',
        studentDiscount: '0',
        estimatedWaitTime: '5-10 phút',
        calories: '0',
        spicyLevel: '0',
        availableQuantity: '50',
        maxQuantity: '100',
        days: [],
      });
    }
  }, [item, visible]);

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    onSave({
      name: formData.name,
      price: parseInt(formData.price),
      originalPrice: parseInt(formData.originalPrice) || parseInt(formData.price),
      desc: formData.desc,
      image: formData.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      vendorId: formData.vendorId,
      days: formData.days,
      category: formData.category,
      type: formData.type,
      status: 'available',
      servingTime: formData.servingTime,
      rating: 0,
      reviewCount: 0,
      isPopular: false,
      isNew: true,
      studentDiscount: parseInt(formData.studentDiscount),
      estimatedWaitTime: formData.estimatedWaitTime,
      calories: parseInt(formData.calories),
      spicyLevel: parseInt(formData.spicyLevel),
      availableQuantity: parseInt(formData.availableQuantity),
      maxQuantity: parseInt(formData.maxQuantity),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{item ? 'Sửa món ăn' : 'Thêm món ăn mới'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Tên món *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Nhập tên món ăn"
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá bán *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá gốc</Text>
              <TextInput
                style={styles.formInput}
                value={formData.originalPrice}
                onChangeText={(text) => setFormData(prev => ({ ...prev, originalPrice: text }))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Mô tả</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={formData.desc}
              onChangeText={(text) => setFormData(prev => ({ ...prev, desc: text }))}
              placeholder="Mô tả món ăn"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Hình ảnh URL</Text>
            <TextInput
              style={styles.formInput}
              value={formData.image}
              onChangeText={(text) => setFormData(prev => ({ ...prev, image: text }))}
              placeholder="URL hình ảnh"
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Quầy</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {vendors.map((vendor) => (
                  <TouchableOpacity
                    key={vendor.id}
                    style={[
                      styles.optionButton,
                      { backgroundColor: formData.vendorId === vendor.id ? vendor.color : '#F8F9FA' }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, vendorId: vendor.id }))}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: formData.vendorId === vendor.id ? 'white' : '#666' }
                    ]}>
                      {vendor.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Danh mục</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.optionButton,
                      { backgroundColor: formData.category === category.id ? category.color : '#F8F9FA' }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: formData.category === category.id ? 'white' : '#666' }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Ngày bán</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    { backgroundColor: formData.days.includes(day) ? '#3498DB' : '#F8F9FA' }
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    { color: formData.days.includes(day) ? 'white' : '#666' }
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số lượng có sẵn</Text>
              <TextInput
                style={styles.formInput}
                value={formData.availableQuantity}
                onChangeText={(text) => setFormData(prev => ({ ...prev, availableQuantity: text }))}
                placeholder="50"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số lượng tối đa</Text>
              <TextInput
                style={styles.formInput}
                value={formData.maxQuantity}
                onChangeText={(text) => setFormData(prev => ({ ...prev, maxQuantity: text }))}
                placeholder="100"
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{item ? 'Cập nhật' : 'Thêm mới'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MenuManagementScreen = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData: Omit<MenuItem, 'id'>) => {
    try {
      await createMenuItem(itemData);
      setShowAddModal(false);
      loadMenuItems();
      Alert.alert('Thành công', 'Đã thêm món ăn mới');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm món ăn');
    }
  };

  const handleEditItem = async (itemData: Omit<MenuItem, 'id'>) => {
    if (!editingItem) return;
    
    try {
      await updateMenuItem(editingItem.id, itemData);
      setEditingItem(undefined);
      loadMenuItems();
      Alert.alert('Thành công', 'Đã cập nhật món ăn');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật món ăn');
    }
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa món ăn này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenuItem(id);
              loadMenuItems();
              Alert.alert('Thành công', 'Đã xóa món ăn');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa món ăn');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (id: string, status: MenuItem['status']) => {
    try {
      await updateMenuItemStatus(id, status);
      loadMenuItems();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleQuantityChange = async (id: string, quantity: number) => {
    try {
      await updateMenuItemQuantity(id, quantity);
      loadMenuItems();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng');
    }
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
        <Text style={styles.headerTitle}>Quản lý món ăn</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onEdit={(item) => setEditingItem(item)}
            onDelete={handleDeleteItem}
            onStatusChange={handleStatusChange}
            onQuantityChange={handleQuantityChange}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <AddEditModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddItem}
      />

      <AddEditModal
        visible={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(undefined)}
        onSave={handleEditItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  menuCard: {
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
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
  },
  actionMenu: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2C3E50',
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    width: 80,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    textAlign: 'center',
  },
  statusScroll: {
    flex: 1,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  daysScroll: {
    flex: 1,
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#3498DB',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default MenuManagementScreen; 