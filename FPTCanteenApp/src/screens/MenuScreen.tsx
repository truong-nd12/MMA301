import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
  SectionList,
  TextInput,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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

const mockMenu = [
  {
    id: "1",
    name: "Cơm sườn nướng mật ong",
    price: 30000,
    originalPrice: 35000,
    desc: "Cơm sườn nướng tẩm mật ong, ăn kèm dưa leo, trứng kho",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    vendorId: "v1",
    days: ["T2", "T3", "T4"],
    category: "man",
    type: "com",
    status: "available",
    servingTime: "11:00 - 13:00",
    rating: 4.5,
    reviewCount: 230,
    isPopular: true,
    isNew: false,
    studentDiscount: 15,
    estimatedWaitTime: "5-10 phút",
    calories: 650,
    spicyLevel: 1,
  },
  {
    id: "2",
    name: "Bún chay đặc biệt",
    price: 30000,
    originalPrice: 30000,
    desc: "Bún, đậu hũ, nấm, rau thơm, nước dùng chay thanh mát",
    image:
      "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
    vendorId: "v3",
    days: ["T2", "T5", "T6"],
    category: "chay",
    type: "bun",
    status: "almost_out",
    servingTime: "11:00 - 13:00",
    rating: 4.7,
    reviewCount: 120,
    isPopular: false,
    isNew: true,
    studentDiscount: 10,
    estimatedWaitTime: "3-7 phút",
    calories: 420,
    spicyLevel: 0,
  },
  {
    id: "3",
    name: "Mì xào bò đặc biệt",
    price: 40000,
    originalPrice: 45000,
    desc: "Mì trứng, thịt bò tươi, rau củ, nước sốt đặc biệt của quán",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
    vendorId: "v1",
    days: ["T3", "T4", "T5"],
    category: "man",
    type: "mi",
    status: "available",
    servingTime: "11:00 - 13:00",
    rating: 4.2,
    reviewCount: 80,
    isPopular: true,
    isNew: false,
    studentDiscount: 20,
    estimatedWaitTime: "8-12 phút",
    calories: 580,
    spicyLevel: 2,
  },
  {
    id: "4",
    name: "Salad rau củ tươi",
    price: 25000,
    originalPrice: 25000,
    desc: "Xà lách, cà chua cherry, dưa leo, sốt mè rang thơm ngon",
    image:
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    vendorId: "v3",
    days: ["T2", "T6", "CN"],
    category: "chay",
    type: "an_nhe",
    status: "out",
    servingTime: "11:00 - 13:00",
    rating: 4.8,
    reviewCount: 60,
    isPopular: false,
    isNew: false,
    studentDiscount: 5,
    estimatedWaitTime: "2-5 phút",
    calories: 180,
    spicyLevel: 0,
  },
  {
    id: "5",
    name: "Trà đào cam sả",
    price: 18000,
    originalPrice: 22000,
    desc: "Trà đào tươi, cam ngọt, sả thơm, đá mát lạnh - thức uống giải khát tuyệt vời",
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80",
    vendorId: "v4",
    days: ["T4", "T5", "T6", "T7"],
    category: "nuoc",
    type: "nuoc",
    status: "available",
    servingTime: "07:00 - 17:00",
    rating: 4.6,
    reviewCount: 150,
    isPopular: true,
    isNew: false,
    studentDiscount: 18,
    estimatedWaitTime: "1-3 phút",
    calories: 120,
    spicyLevel: 0,
  },
  {
    id: "6",
    name: "Chè đậu xanh dừa",
    price: 15000,
    originalPrice: 18000,
    desc: "Chè đậu xanh mềm, nước cốt dừa thơm, đá bào mát lạnh",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
    vendorId: "v5",
    days: ["T6", "T7", "CN"],
    category: "an_nhe",
    type: "trangmieng",
    status: "available",
    servingTime: "11:00 - 13:00",
    rating: 4.9,
    reviewCount: 45,
    isPopular: false,
    isNew: true,
    studentDiscount: 17,
    estimatedWaitTime: "2-4 phút",
    calories: 280,
    spicyLevel: 0,
  },
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
const getNextDayIdx = () => (todayIdx + 1) % 7;

const tabOptions = [
  { key: "today", label: "Hôm nay", icon: "today" },
  { key: "tomorrow", label: "Ngày mai", icon: "calendar" },
  { key: "week", label: "Toàn tuần", icon: "calendar-outline" },
];

const getMenuForDay = (day: keyof typeof dayNames): typeof mockMenu =>
  mockMenu.filter((item) => item.days.includes(day));

const MenuCard = ({
  item,
  onOrder,
  onToggleFavorite,
  isFavorite,
}: {
  item: (typeof mockMenu)[0];
  onOrder?: (item: (typeof mockMenu)[0]) => void;
  onToggleFavorite?: (item: (typeof mockMenu)[0]) => void;
  isFavorite?: boolean;
}) => {
  const statusMap: Record<
    string,
    { text: string; color: string; bgColor: string }
  > = {
    available: { text: "Còn hàng", color: "#27AE60", bgColor: "#D5EDDA" },
    almost_out: { text: "Sắp hết", color: "#F39C12", bgColor: "#FFF3CD" },
    out: { text: "Hết món", color: "#E74C3C", bgColor: "#F8D7DA" },
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
            color={i < item.spicyLevel ? "#E74C3C" : "#DDD"}
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
            color={isFavorite ? "#E74C3C" : "#666"}
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

        {/* Price and category */}
        <View style={styles.rowBetween}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                {item.originalPrice.toLocaleString()}đ
              </Text>
            )}
          </View>
          <View
            style={[styles.categoryTag, { backgroundColor: cat?.color + "20" }]}
          >
            <Ionicons name={cat?.icon as any} size={14} color={cat?.color} />
            <Text style={[styles.categoryTagText, { color: cat?.color }]}>
              {cat?.name}
            </Text>
          </View>
        </View>

        {/* Status and time */}
        <View style={styles.rowBetween}>
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
          <Text style={styles.servingTime}>
            <Ionicons name="time-outline" size={14} color="#666" />{" "}
            {item.servingTime}
          </Text>
        </View>

        {/* Rating, calories, and wait time */}
        <View style={styles.infoRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewText}>({item.reviewCount})</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="fitness-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.calories} cal</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="timer-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.estimatedWaitTime}</Text>
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
          <LinearGradient
            colors={
              item.status === "out" ? ["#CCC", "#999"] : ["#667eea", "#764ba2"]
            }
            style={styles.orderBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.orderBtnText}>
              {item.status === "out" ? "Hết món" : "Đặt món"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );
};

const MenuScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState<string>("today");
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
  const [vendorDropdownVisible, setVendorDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Search and filter functions
  const filterMenu = (menu: typeof mockMenu) => {
    return menu.filter((item) => {
      const searchMatch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
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

  const toggleFavorite = (item: (typeof mockMenu)[0]) => {
    setFavorites((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };

  // Get popular items
  const popularItems = mockMenu.filter((item) => item.isPopular).slice(0, 3);

  // SectionList data cho toàn tuần
  const weekSections = days.map((d) => ({
    title: dayNames[d as keyof typeof dayNames],
    data: filterMenu(getMenuForDay(d as keyof typeof dayNames)),
  }));

  let content = null;

  if (tab === "today") {
    const todayMenu = filterMenu(
      getMenuForDay(days[todayIdx] as keyof typeof dayNames)
    );
    content = (
      <FlatList
        data={todayMenu}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <MenuCard
            item={item}
            onOrder={handleOrder}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>Không có món nào hôm nay</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  } else if (tab === "tomorrow") {
    const tomorrowMenu = filterMenu(
      getMenuForDay(days[getNextDayIdx()] as keyof typeof dayNames)
    );
    content = (
      <FlatList
        data={tomorrowMenu}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <MenuCard
            item={item}
            onOrder={handleOrder}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>Không có món nào ngày mai</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  } else {
    content = (
      <SectionList
        sections={weekSections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <MenuCard
            item={item}
            onOrder={handleOrder}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(item.id)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>{title}</Text>
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
        showsVerticalScrollIndicator={false}
      />
    );
  }

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

  const handleOrder = (item: (typeof mockMenu)[0]) => {
    if (navigation?.navigate) {
      navigation.navigate("Order", { food: item });
    } else {
      alert(`Đặt món: ${item.name}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header với gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Căng tin ĐH</Text>
            <Text style={styles.headerSubtitle}>Thực đơn hôm nay</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
              style={[
                styles.headerBtn,
                showFavoritesOnly && styles.headerBtnActive,
              ]}
            >
              <Ionicons
                name={showFavoritesOnly ? "heart" : "heart-outline"}
                size={24}
                color={showFavoritesOnly ? "#E74C3C" : "#fff"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.headerBtn}
            >
              <Ionicons name="filter" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Popular items section */}
      {!searchQuery && !showFavoritesOnly && tab === "today" && (
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>🔥 Món phổ biến</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.popularCard}
                onPress={() => handleOrder(item)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.popularImage}
                />
                <Text style={styles.popularName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.popularPrice}>
                  {item.price.toLocaleString()}đ
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.modalBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalBtnPrimaryText}>Áp dụng</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabOptions.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Ionicons
              name={t.icon as any}
              size={20}
              color={tab === t.key ? "#fff" : "#666"}
            />
            <Text
              style={[styles.tabText, tab === t.key && styles.tabTextActive]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  headerBtnActive: {
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  popularSection: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingLeft: 20,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  popularCard: {
    width: 120,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  popularImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  popularName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  popularPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#667eea",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 4,
  },
  tabBtnActive: {
    backgroundColor: "#667eea",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  tabTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  cardImageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
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
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
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
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  foodName: {
    fontSize: 18,
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
    marginBottom: 12,
  },
  vendorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  vendorText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
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
  servingTime: {
    fontSize: 12,
    color: "#666",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  reviewText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 2,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  orderBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  orderBtnDisabled: {
    opacity: 0.6,
  },
  orderBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  orderBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  sectionHeaderContainer: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
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
    backgroundColor: "#667eea",
    borderColor: "#667eea",
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
    borderRadius: 12,
    overflow: "hidden",
  },
  modalBtnGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnPrimaryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default MenuScreen;
