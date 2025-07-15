import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const AdminSwitchScreen = ({ navigation }: any) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSwitchToAdmin = () => {
    Alert.alert(
      'Chuyển sang Admin Mode',
      'Bạn có chắc chắn muốn chuyển sang chế độ quản trị?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chuyển',
          onPress: () => {
            setIsAdmin(true);
            navigation.navigate('AdminTabs');
          },
        },
      ]
    );
  };

  const handleSwitchToUser = () => {
    Alert.alert(
      'Chuyển sang User Mode',
      'Bạn có chắc chắn muốn chuyển về chế độ người dùng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chuyển',
          onPress: () => {
            setIsAdmin(false);
            Alert.alert('Thành công', 'Đã chuyển về User Mode');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3498DB', '#2980B9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Chế độ ứng dụng</Text>
        <Text style={styles.headerSubtitle}>
          Chọn chế độ phù hợp với vai trò của bạn
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Animatable.View
          animation="fadeInUp"
          delay={300}
          style={styles.modeCard}
        >
          <View style={styles.modeHeader}>
            <View style={[styles.modeIcon, { backgroundColor: '#FF6F00' }]}>
              <Ionicons name="person-outline" size={32} color="white" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>User Mode</Text>
              <Text style={styles.modeDescription}>
                Chế độ người dùng - Đặt món, theo dõi đơn hàng
              </Text>
            </View>
          </View>
          
          <View style={styles.modeFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>Xem menu và đặt món</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>Theo dõi đơn hàng</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>Chat với AI</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>Quản lý profile</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.modeButton,
              { backgroundColor: isAdmin ? '#BDC3C7' : '#FF6F00' }
            ]}
            onPress={handleSwitchToUser}
            disabled={!isAdmin}
          >
            <Text style={styles.modeButtonText}>
              {isAdmin ? 'Chuyển về User Mode' : 'Đang ở User Mode'}
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          delay={600}
          style={styles.modeCard}
        >
          <View style={styles.modeHeader}>
            <View style={[styles.modeIcon, { backgroundColor: '#3498DB' }]}>
              <Ionicons name="settings-outline" size={32} color="white" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Admin Mode</Text>
              <Text style={styles.modeDescription}>
                Chế độ quản trị - Quản lý món ăn và thống kê
              </Text>
            </View>
          </View>
          
          <View style={styles.modeFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>Thêm/sửa/xóa món ăn</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>Thiết lập ngày bán</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>Quản lý số lượng</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>Xem thống kê đơn hàng</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.modeButton,
              { backgroundColor: isAdmin ? '#3498DB' : '#BDC3C7' }
            ]}
            onPress={handleSwitchToAdmin}
            disabled={isAdmin}
          >
            <Text style={styles.modeButtonText}>
              {isAdmin ? 'Đang ở Admin Mode' : 'Chuyển sang Admin Mode'}
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          delay={900}
          style={styles.infoCard}
        >
          <Ionicons name="information-circle-outline" size={24} color="#3498DB" />
          <Text style={styles.infoText}>
            Bạn có thể chuyển đổi giữa các chế độ bất cứ lúc nào. 
            Admin Mode cần quyền truy cập đặc biệt.
          </Text>
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  modeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  modeFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
  },
  modeButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default AdminSwitchScreen; 