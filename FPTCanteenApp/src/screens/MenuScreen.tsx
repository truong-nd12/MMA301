import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import * as Animatable from "react-native-animatable";
import * as Haptics from "expo-haptics";
import { getMenuItems, type MenuItem } from "../api/menuApi";
import { userApi } from "../api/userApi";

const { width } = Dimensions.get("window");

const vendors = [
  { id: "v1", name: "Quầy Cơm", icon: "restaurant-outline", color: "#FF6B6B" },
  { id: "v2", name: "Quầy Bún", icon: "bowl-outline", color: "#4ECDC4" },
  { id: "v3", name: "Quầy Chay", icon: "leaf-outline", color: "#45B7D1" },
  { id: "v4", name: "Quầy Đồ Uống", icon: "cafe-outline", color: "#96CEB4" },
  {
    id: "v5",
    name: "Quầy Tráng Miệng",
    icon: "ice-cream-outline",
    color: "#FFEAA7",
  },
];

const categories = [
  { id: "chay", name: "Chay", icon: "leaf", color: "#27AE60" },
  { id: "man", name: "Mặn", icon: "restaurant", color: "#E74C3C" },
  { id: "an_nhe", name: "Ăn nhẹ", icon: "fast-food", color: "#F39C12" },
  { id: "nuoc", name: "Nước", icon: "water", color: "#3498DB" },
];

const types = [
  { id: "com", name: "Cơm", icon: "bowl" },
  { id: "bun", name: "Bún", icon: "restaurant" },
  { id: "mi", name: "Mì", icon: "nutrition" },
  { id: "trangmieng", name: "Tráng miệng", icon: "ice-cream" },
];

const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const dayNames: Record<string, string> = {
  T2: "Thứ 2",
  T3: "Thứ 3",
  T4: "Thứ 4",
  T5: "Thứ 5",
  T6: "Thứ 6",
  T7: "Thứ 7",
  CN: "Chủ nhật",
};

const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const getMenuForDay = (
  day: keyof typeof dayNames,
  menuItems: MenuItem[]
): MenuItem[] => menuItems.filter((item) => item.days.includes(day));

const MenuCard = ({
  item,
  onOrder,
  onToggleFavorite,
  isFavorite,
}: {
  item: MenuItem;
  onOrder?: (item: MenuItem) => void;
  onToggleFavorite?: (item: MenuItem) => void;
  isFavorite?: boolean;
}) => {
  const statusMap: Record<
    string,
    { text: string; color: string; bgColor: string }
  > = {
    available: { text: "Còn hàng", color: "#27AE60", bgColor: "#E8F5E8" },
    almost_out: { text: "Sắp hết", color: "#F39C12", bgColor: "#FFF8E1" },
    out: { text: "Hết món", color: "#E74C3C", bgColor: "#FFEBEE" },
  };

  const cat = categories.find((c) => c.id === item.category);
  const vendor = vendors.find((v) => v.id === item.vendorId);

  const renderSpicyLevel = () => {
    if (item.spicyLevel === 0) return null;
    return (
      <View style={styles.spicyContainer}>
        {[...Array(3)].map((_, i) => (
          <Ionicons
            key={i}
            name="flame"
            size={12}
            color={i < item.spicyLevel ? "#FF6347" : "#DDD"}
          />
        ))}
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.card}>
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />

        {/* Badges */}
        <View style={styles.badgeContainer}>
          {item.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>MỚI</Text>
            </View>
          )}
          {item.isPopular && (
            <View style={[styles.badge, styles.popularBadge]}>
              <Ionicons name="flame" size={12} color="#fff" />
              <Text style={styles.badgeText}>HOT</Text>
            </View>
          )}
        </View>

        {/* Favorite button */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => onToggleFavorite?.(item)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#FF6347" : "#666"}
          />
        </TouchableOpacity>

        {/* Student discount */}
        {item.studentDiscount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.studentDiscount}%</Text>
            <Text style={styles.discountSubText}>SV</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.foodName}>{item.name}</Text>
          {renderSpicyLevel()}
        </View>

        <Text style={styles.foodDesc} numberOfLines={2}>
          {item.desc}
        </Text>

        {/* Vendor info */}
        <View style={styles.vendorInfo}>
          <Ionicons
            name={vendor?.icon as any}
            size={14}
            color={vendor?.color}
          />
          <Text style={[styles.vendorText, { color: vendor?.color }]}>
            {vendor?.name}
          </Text>
        </View>

        {/* Price and rating row */}
        <View style={styles.priceRatingRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                {item.originalPrice.toLocaleString()}đ
              </Text>
            )}
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* Status and category */}
        <View style={styles.statusCategoryRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusMap[item.status]?.bgColor },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusMap[item.status]?.color },
              ]}
            >
              {statusMap[item.status]?.text}
            </Text>
          </View>
          <View
            style={[styles.categoryTag, { backgroundColor: cat?.color + "20" }]}
          >
            <Ionicons name={cat?.icon as any} size={12} color={cat?.color} />
            <Text style={[styles.categoryTagText, { color: cat?.color }]}>
              {cat?.name}
            </Text>
          </View>
        </View>

        {/* Order button */}
        <TouchableOpacity
          style={[
            styles.orderBtn,
            item.status === "out" && styles.orderBtnDisabled,
          ]}
          onPress={() => onOrder?.(item)}
          disabled={item.status === "out"}
          activeOpacity={item.status === "out" ? 1 : 0.8}
        >
          <Text style={styles.orderBtnText}>
            {item.status === "out" ? "Hết món" : "ĐẶT MÓN"}
          </Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );
};

const PromoBanner = () => (
  <View style={styles.promoBanner}>
    <View style={styles.promoContent}>
      <View style={styles.promoTextContainer}>
        <Text style={styles.promoLabel}>ĐẶC BIỆT CHO BẠN</Text>
        <Text style={styles.promoTitle}>Giảm giá đặc biệt hôm nay</Text>
        <Text style={styles.promoSubtitle}>Nhà hàng Flamingo</Text>
        <View style={styles.discountContainer}>
          <Text style={styles.discountPercentage}>45%</Text>
          <Text style={styles.discountLabel}>giảm giá</Text>
        </View>
      </View>
      <View style={styles.promoImageContainer}>
        <Image
          source={{ uri: "/placeholder.svg?height=120&width=120" }}
          style={styles.promoImage}
        />
      </View>
    </View>
    <TouchableOpacity style={styles.promoButton}>
      <Text style={styles.promoButtonText}>ĐẶT NGAY</Text>
    </TouchableOpacity>
  </View>
);

const MenuScreen = ({ navigation }: any) => {
  const [selectedDay, setSelectedDay] = useState<keyof typeof dayNames>(
    days[todayIdx] as keyof typeof dayNames
  );
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempVendor, setTempVendor] = useState<string | null>(selectedVendor);
  const [tempCategory, setTempCategory] = useState<string | null>(
    selectedCategory
  );
  const [tempType, setTempType] = useState<string | null>(selectedType);
  const [tempDay, setTempDay] = useState<string | null>(selectedDay);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const fetchMenu = async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      setMenuItems([]);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await userApi.getFavorites();
      // Extract product IDs from favorites
      const favoriteIds = data.favorites.map((fav: any) => fav._id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMenu();
      fetchFavorites();
    }, [])
  );

  const filterMenu = (menu: MenuItem[]) => {
    return menu.filter((item) => {
      const searchMatch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc?.toLowerCase().includes(searchQuery.toLowerCase());
      const vendorMatch = !selectedVendor || item.vendorId === selectedVendor;
      const categoryMatch =
        !selectedCategory || item.category === selectedCategory;
      const typeMatch = !selectedType || item.type === selectedType;
      const favoriteMatch = !showFavoritesOnly || favorites.includes(item.id);

      return (
        searchMatch &&
        vendorMatch &&
        categoryMatch &&
        typeMatch &&
        favoriteMatch
      );
    });
  };

  const toggleFavorite = async (item: MenuItem) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const isFavorite = favorites.includes(item.id);

      if (isFavorite) {
        // Remove from favorites
        await userApi.removeFavorite(item.id);
        setFavorites((prev) => prev.filter((id) => id !== item.id));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
          "💔 Đã xóa",
          `Đã xóa "${item.name}" khỏi danh sách yêu thích`
        );
      } else {
        // Add to favorites
        await userApi.addFavorite(item.id);
        setFavorites((prev) => [...prev, item.id]);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
          "💖 Đã thêm",
          `Đã thêm "${item.name}" vào danh sách yêu thích`
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert(
        "❌ Lỗi",
        "Không thể cập nhật danh sách yêu thích. Vui lòng thử lại."
      );
    }
  };

  const weekSections = days.map((d) => ({
    title: dayNames[d as keyof typeof dayNames],
    data: filterMenu(getMenuForDay(d as keyof typeof dayNames, menuItems)),
  }));

  const applyFilter = () => {
    setSelectedVendor(tempVendor);
    setSelectedCategory(tempCategory);
    setSelectedType(tempType);
    setSelectedDay(tempDay as keyof typeof dayNames);
    setModalVisible(false);
  };

  const resetFilter = () => {
    setTempVendor(null);
    setTempCategory(null);
    setTempType(null);
    setTempDay(null);
  };

  const handleOrder = (item: MenuItem) => {
    if (navigation?.navigate) {
      navigation.navigate("Order", { food: item });
    } else {
      alert(`Đặt món: ${item.name}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trang chủ</Text>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{ uri: "/placeholder.svg?height=32&width=32" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.filterButton}
          >
            <Ionicons name="options" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Promo Banner */}
        <PromoBanner />

        {/* Restaurant Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>NHÀ HÀNG</Text>

          <SectionList
            sections={weekSections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MenuCard
                item={item}
                onOrder={handleOrder}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(item.id)}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.daySectionHeader}>
                <Text style={styles.daySectionTitle}>{title}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant-outline" size={64} color="#DDD" />
                <Text style={styles.emptyText}>
                  Không có món nào trong tuần này
                </Text>
              </View>
            }
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc thực đơn</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Day filter */}
              <Text style={styles.modalLabel}>📅 Chọn ngày</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    tempDay === null && styles.filterChipActive,
                  ]}
                  onPress={() => setTempDay(null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      tempDay === null && styles.filterChipTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.filterChip,
                      tempDay === day && styles.filterChipActive,
                    ]}
                    onPress={() => setTempDay(day)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        tempDay === day && styles.filterChipTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Vendor filter */}
              <Text style={styles.modalLabel}>🏪 Chọn quầy</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    tempVendor === null && styles.filterChipActive,
                  ]}
                  onPress={() => setTempVendor(null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      tempVendor === null && styles.filterChipTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {vendors.map((vendor) => (
                  <TouchableOpacity
                    key={vendor.id}
                    style={[
                      styles.filterChip,
                      tempVendor === vendor.id && styles.filterChipActive,
                    ]}
                    onPress={() => setTempVendor(vendor.id)}
                  >
                    <Ionicons
                      name={vendor.icon as any}
                      size={16}
                      color={tempVendor === vendor.id ? "#fff" : vendor.color}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        tempVendor === vendor.id && styles.filterChipTextActive,
                      ]}
                    >
                      {vendor.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Category filter */}
              <Text style={styles.modalLabel}>🍽️ Chọn thể loại</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    tempCategory === null && styles.filterChipActive,
                  ]}
                  onPress={() => setTempCategory(null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      tempCategory === null && styles.filterChipTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.filterChip,
                      tempCategory === category.id && styles.filterChipActive,
                    ]}
                    onPress={() => setTempCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={16}
                      color={
                        tempCategory === category.id ? "#fff" : category.color
                      }
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        tempCategory === category.id &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Type filter */}
              <Text style={styles.modalLabel}>🥘 Chọn loại món</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    tempType === null && styles.filterChipActive,
                  ]}
                  onPress={() => setTempType(null)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      tempType === null && styles.filterChipTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {types.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.filterChip,
                      tempType === type.id && styles.filterChipActive,
                    ]}
                    onPress={() => setTempType(type.id)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={16}
                      color={tempType === type.id ? "#fff" : "#666"}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        tempType === type.id && styles.filterChipTextActive,
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            {/* Modal actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={resetFilter}
              >
                <Text style={styles.modalBtnSecondaryText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={applyFilter}
              >
                <Text style={styles.modalBtnPrimaryText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  promoBanner: {
    backgroundColor: "#FF6347",
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: "#FF6347",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  promoContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
    marginBottom: 5,
  },
  promoTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  promoSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 10,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  discountPercentage: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  discountLabel: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
    opacity: 0.9,
  },
  promoImageContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  promoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  promoButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
  },
  promoButtonText: {
    color: "#FF6347",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },
  cardImageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0f0f0",
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: "#27AE60",
  },
  popularBadge: {
    backgroundColor: "#E74C3C",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  favoriteBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  discountBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  discountSubText: {
    color: "#fff",
    fontSize: 10,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  spicyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 10,
  },
  vendorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  vendorText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  priceRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6347",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  statusCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  orderBtn: {
    backgroundColor: "#FF6347",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#FF6347",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  orderBtnDisabled: {
    backgroundColor: "#CCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  orderBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  daySectionHeader: {
    paddingVertical: 15,
    paddingTop: 25,
  },
  daySectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  filterRow: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterChipActive: {
    backgroundColor: "#FF6347",
    borderColor: "#FF6347",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    marginRight: 12,
  },
  modalBtnSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalBtnPrimary: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FF6347",
    alignItems: "center",
  },
  modalBtnPrimaryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default MenuScreen;
