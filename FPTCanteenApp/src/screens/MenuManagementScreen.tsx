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
import { Product, productApi } from '../api/productApi';

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

const ProductCard = ({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: Product; 
  onEdit: (item: Product) => void; 
  onDelete: (id: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (stock: number) => {
    if (stock === 0) return '#E74C3C';
    if (stock < 10) return '#F39C12';
    return '#27AE60';
  };

  const getStatusText = (stock: number) => {
    if (stock === 0) return 'Hết hàng';
    if (stock < 10) return 'Sắp hết';
    return 'Có sẵn';
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      style={styles.productCard}
    >
      <Image
        source={{ uri: item.images || 'https://via.placeholder.com/100' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString('vi-VN')}đ
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.stock) }]}>
            <Text style={styles.statusText}>{getStatusText(item.stock)}</Text>
          </View>
          <Text style={styles.stockText}>Còn: {item.stock}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </TouchableOpacity>

      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              onEdit(item);
            }}
          >
            <Ionicons name="create-outline" size={16} color="#3498DB" />
            <Text style={styles.menuItemText}>Sửa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              onDelete(item._id);
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#E74C3C" />
            <Text style={[styles.menuItemText, { color: '#E74C3C' }]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animatable.View>
  );
};

const AddEditModal = ({ visible, item, onClose, onSave }: {
  visible: boolean;
  item?: Product;
  onClose: () => void;
  onSave: (item: any) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    calories: '',
    stock: '',
    category: '',
    images: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        calories: item.calories.toString(),
        stock: item.stock.toString(),
        category: item.category._id,
        images: item.images,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        calories: '',
        stock: '',
        category: '',
        images: '',
      });
    }
  }, [item, visible]);

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      calories: Number(formData.calories) || 0,
      stock: Number(formData.stock) || 0,
      category: formData.category,
      images: formData.images,
      isActive: true,
    };

    onSave(productData);
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
            <Text style={styles.modalTitle}>
              {item ? 'Sửa món ăn' : 'Thêm món ăn mới'}
            </Text>
            <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

          <ScrollView style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Tên món ăn *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Mô tả"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            
              <TextInput
              style={styles.input}
              placeholder="Giá (VNĐ) *"
                value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
              />
            
              <TextInput
              style={styles.input}
              placeholder="Calories"
              value={formData.calories}
              onChangeText={(text) => setFormData({ ...formData, calories: text })}
                keyboardType="numeric"
              />

            <TextInput
              style={styles.input}
              placeholder="Số lượng tồn kho"
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="URL hình ảnh"
              value={formData.images}
              onChangeText={(text) => setFormData({ ...formData, images: text })}
            />
            
              <TextInput
              style={styles.input}
              placeholder="ID danh mục *"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {item ? 'Cập nhật' : 'Thêm mới'}
              </Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MenuManagementScreen = () => {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | undefined>();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAllProducts();
      setMenuItems(response.products);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      await productApi.createProduct(itemData);
      setShowAddModal(false);
      loadMenuItems();
      Alert.alert('Thành công', 'Đã thêm món ăn mới');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm món ăn');
    }
  };

  const handleEditItem = async (itemData: any) => {
    if (!editingItem) return;
    
    try {
      await productApi.updateProduct(editingItem._id, itemData);
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
              await productApi.deleteProduct(id);
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
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onEdit={(item) => setEditingItem(item)}
            onDelete={handleDeleteItem}
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
  },
  menuButton: {
    padding: 8,
  },
  menuOverlay: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
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
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3498DB',
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MenuManagementScreen; 