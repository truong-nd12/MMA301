import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import * as Haptics from "expo-haptics";
import { Product, productApi } from "../api/productApi";
import { userApi } from "../api/userApi";
import FavoriteStats from "../components/FavoriteStats";

const { width } = Dimensions.get("window");

export default function FavoriteFoodsScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("name"); // name, price, rating, orderCount
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [favoriteFoods, setFavoriteFoods] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productApi.getCategories();
        setCategories(["Tất cả", ...data.categories.map((cat) => cat.name)]);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu món yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await userApi.getFavorites();
        setFavoriteFoods(data.favorites);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu món yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const data = await userApi.getFavorites();
      setFavoriteFoods(data.favorites);
    } catch (error) {
      console.error("Lỗi khi refresh món yêu thích:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Tính toán thống kê
  const totalSpent = favoriteFoods.reduce(
    (sum, food) => sum + food.price * food.orderCount,
    0
  );
  const averageRating =
    favoriteFoods.length > 0
      ? favoriteFoods.reduce((sum, food) => sum + food.rating, 0) /
        favoriteFoods.length
      : 0;

  const mostOrdered =
    favoriteFoods.length > 0
      ? favoriteFoods.reduce((max, food) =>
          food.orderCount > max.orderCount ? food : max
        ).name
      : "Không có món";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredFoods = favoriteFoods
    .filter((food) => {
      const matchesSearch = food.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tất cả" ||
        food.category.name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "rating":
          return b.rating - a.rating;
        case "orderCount":
          return b.orderCount - a.orderCount;
        default:
          return 0;
      }
    });

  const handleOrderNow = async (food: Product) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      "🍽️ Đặt hàng nhanh",
      `Bạn có muốn đặt "${food.name}" ngay bây giờ?\n\n💰 Giá: ${formatCurrency(
        food.price
      )}\n⭐ Đánh giá: ${food.rating}/5\n🔥 Calories: ${food.calories}`,
      [
        {
          text: "Hủy",
          style: "cancel",
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: "Đặt hàng",
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            // Convert FavoriteFood to food object for OrderScreen
            const foodForOrder = {
              id: food._id,
              name: food.name,
              price: food.price,
              image:
                food.images ||
                "https://via.placeholder.com/300x200/FF6B6B/ffffff?text=" +
                  encodeURIComponent(food.name),
              desc: `${food.category.name} - ${food.calories} calo`,
              calories: food.calories,
              rating: food.rating,
            };
            navigation.navigate("Order", { food: foodForOrder });
          },
        },
      ]
    );
  };

  const handleRemoveFavorite = async (food: Product) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      "💔 Xóa khỏi yêu thích",
      `Bạn có muốn xóa "${food.name}" khỏi danh sách yêu thích?`,
      [
        {
          text: "Hủy",
          style: "cancel",
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await userApi.removeFavorite(food._id); // Gọi API
              Alert.alert("✅ Thành công", "Đã xóa khỏi danh sách yêu thích!");

              // ✅ Cập nhật danh sách nếu dùng state
              setFavoriteFoods((prev) =>
                prev.filter((item) => item._id !== food._id)
              );
            } catch (error) {
              console.error("❌ Lỗi xóa:", error);
              Alert.alert("❌ Lỗi", "Không thể xóa món yêu thích.");
            }
          },
        },
      ]
    );
  };

  const handleShareFavorites = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const favoriteList = favoriteFoods
        .map(
          (food, index) =>
            `${index + 1}. ${food.name} - ${formatCurrency(food.price)} ⭐${
              food.rating
            }`
        )
        .join("\n");

      const message = `🍽️ Danh sách món yêu thích của tôi tại FPT Canteen:\n\n${favoriteList}\n\n📊 Thống kê:\n• Tổng cộng: ${
        favoriteFoods.length
      } món\n• Tổng chi tiêu: ${formatCurrency(
        totalSpent
      )}\n• Đánh giá trung bình: ${averageRating.toFixed(
        1
      )}/5\n• Món được đặt nhiều nhất: ${mostOrdered}\n\n💝 Được chia sẻ từ FPT Canteen App`;

      await Share.share({
        message,
        title: "Món yêu thích của tôi - FPT Canteen",
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chia sẻ danh sách món yêu thích");
    }
  };

  const handleClearSearch = () => {
    setSearchText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderFoodCard = (food: Product, index: number) => (
    <Animatable.View
      key={food._id}
      animation="fadeInUp"
      delay={index * 100}
      style={styles.foodCard}
    >
      <LinearGradient
        colors={["#fff", "#fafbff"]}
        style={styles.foodCardGradient}
      >
        <View style={styles.foodHeader}>
          <View style={styles.foodImageContainer}>
            <Image
              source={{
                uri:
                  food.images ||
                  `https://via.placeholder.com/80x80/FF6B6B/ffffff?text=${encodeURIComponent(
                    food.name.charAt(0)
                  )}`,
              }}
              style={styles.foodImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.3)"]}
                style={styles.imageGradient}
              />
            </View>
          </View>

          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{food.name}</Text>
            <View style={styles.categoryContainer}>
              <LinearGradient
                colors={["#FF6B6B20", "#FF8E5310"]}
                style={styles.categoryBadge}
              >
                <Ionicons name="restaurant-outline" size={12} color="#FF6B6B" />
                <Text style={styles.foodCategory}>{food.category.name}</Text>
              </LinearGradient>
            </View>

            <View style={styles.ratingContainer}>
              <LinearGradient
                colors={["#FFD700", "#FFA500"]}
                style={styles.ratingBadge}
              >
                <Ionicons name="star" size={14} color="#fff" />
                <Text style={styles.rating}>{food.rating}</Text>
              </LinearGradient>
              <Text style={styles.orderCount}>({food.orderCount} lần đặt)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(food)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.removeButtonGradient}
            >
              <Ionicons name="heart" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.nutritionInfo}>
          <View style={styles.nutritionItem}>
            <LinearGradient
              colors={["#4ECDC4", "#45B7D1"]}
              style={styles.nutritionIcon}
            >
              <Ionicons name="flame-outline" size={16} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>{food.calories}</Text>
            </View>
          </View>

          <View style={styles.nutritionItem}>
            <LinearGradient
              colors={["#96CEB4", "#FFEAA7"]}
              style={styles.nutritionIcon}
            >
              <Ionicons name="time-outline" size={16} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.nutritionLabel}>Thời gian</Text>
              <Text style={styles.nutritionValue}>15-20p</Text>
            </View>
          </View>
        </View>

        <View style={styles.foodFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(food.price)}</Text>
            <Text style={styles.priceLabel}>Giá hiện tại</Text>
          </View>

          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => handleOrderNow(food)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.orderButtonGradient}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.orderButtonText}>Đặt ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />

      {/* Enhanced Header */}
      <Animatable.View animation="fadeIn" duration={1000}>
        <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>💖 Món yêu thích</Text>
            <Text style={styles.headerSubtitle}>
              Những món bạn yêu thích nhất
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareFavorites}
            >
              <Ionicons name="share-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.countBadge}>
              <Text style={styles.favoriteCount}>{favoriteFoods.length}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animatable.View>

      {/* Enhanced Search Bar */}
      <Animatable.View
        animation="slideInDown"
        delay={200}
        style={styles.searchContainer}
      >
        <LinearGradient
          colors={["#fff", "#fafbff"]}
          style={styles.searchBarGradient}
        >
          <Ionicons name="search" size={20} color="#FF6B6B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món yêu thích..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animatable.View>

      {/* Enhanced Filter Container */}
      <Animatable.View
        animation="slideInLeft"
        delay={300}
        style={styles.filterContainer}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map((category, index) => (
            <Animatable.View
              key={category}
              animation="fadeInRight"
              delay={400 + index * 50}
            >
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(category);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedCategory === category
                      ? ["#FF6B6B", "#FF8E53"]
                      : ["#f8f9fa", "#f8f9fa"]
                  }
                  style={styles.categoryButtonGradient}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSortMenu(!showSortMenu);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#f8f9fa", "#f0f2f5"]}
            style={styles.sortButtonGradient}
          >
            <Ionicons name="funnel-outline" size={18} color="#FF6B6B" />
            <Text style={styles.sortButtonText}>
              {sortBy === "name" && "Tên"}
              {sortBy === "price" && "Giá"}
              {sortBy === "rating" && "Đánh giá"}
              {sortBy === "orderCount" && "Phổ biến"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>

      {/* Enhanced Sort Menu */}
      {showSortMenu && (
        <Animatable.View animation="fadeInDown" style={styles.sortMenu}>
          <LinearGradient
            colors={["#fff", "#fafbff"]}
            style={styles.sortMenuGradient}
          >
            {[
              { key: "name", label: "Sắp xếp theo tên", icon: "text-outline" },
              {
                key: "price",
                label: "Sắp xếp theo giá",
                icon: "pricetag-outline",
              },
              {
                key: "rating",
                label: "Sắp xếp theo đánh giá",
                icon: "star-outline",
              },
              {
                key: "orderCount",
                label: "Sắp xếp theo độ phổ biến",
                icon: "trending-up-outline",
              },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  sortBy === option.key && styles.sortOptionActive,
                ]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortBy(option.key);
                  setShowSortMenu(false);
                }}
              >
                <Ionicons
                  name={option.icon as any}
                  size={18}
                  color={sortBy === option.key ? "#FF6B6B" : "#666"}
                />
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.key && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </Animatable.View>
      )}

      {/* Food List */}
      <ScrollView
        style={styles.foodList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B6B"]}
            tintColor="#FF6B6B"
          />
        }
      >
        {/* Enhanced Stats */}
        <Animatable.View animation="fadeInUp" delay={500}>
          <FavoriteStats
            totalFavorites={favoriteFoods.length}
            mostOrdered={mostOrdered}
            totalSpent={totalSpent}
            averageRating={averageRating}
          />
        </Animatable.View>

        {filteredFoods.length > 0 ? (
          <View style={styles.foodGrid}>
            {filteredFoods.map((food, index) => renderFoodCard(food, index))}
          </View>
        ) : (
          <Animatable.View
            animation="fadeIn"
            delay={800}
            style={styles.emptyState}
          >
            <LinearGradient
              colors={["#fff", "#fafbff"]}
              style={styles.emptyStateGradient}
            >
              <View style={styles.emptyIconContainer}>
                <LinearGradient
                  colors={["#FF6B6B20", "#FF8E5310"]}
                  style={styles.emptyIconBackground}
                >
                  <Ionicons name="heart-outline" size={48} color="#FF6B6B" />
                </LinearGradient>
              </View>

              <Text style={styles.emptyTitle}>
                {searchText ? "Không tìm thấy món ăn" : "Chưa có món yêu thích"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc danh mục"
                  : "Hãy thêm món yêu thích từ menu để xem tại đây"}
              </Text>

              {!searchText && (
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={async () => {
                    await Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium
                    );
                    navigation.navigate("Menu");
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E53"]}
                    style={styles.exploreButtonGradient}
                  >
                    <Ionicons
                      name="restaurant-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.exploreButtonText}>Khám phá menu</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </Animatable.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "center",
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favoriteCount: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBarGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  categoryContainer: {
    flex: 1,
    marginRight: 15,
  },
  categoryButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  categoryButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryButtonActive: {},
  categoryText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  sortButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  sortButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginLeft: 6,
    fontWeight: "500",
  },
  sortMenu: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sortMenuGradient: {
    padding: 8,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  sortOptionActive: {
    backgroundColor: "rgba(255,107,107,0.1)",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  sortOptionTextActive: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  foodList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodGrid: {
    paddingBottom: 20,
  },
  foodCard: {
    marginBottom: 20,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },
  foodCardGradient: {
    padding: 20,
  },
  foodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  foodImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 15,
    position: "relative",
  },
  foodImage: {
    width: 80,
    height: 80,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  imageGradient: {
    flex: 1,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foodCategory: {
    fontSize: 12,
    color: "#FF6B6B",
    marginLeft: 4,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 2,
  },
  orderCount: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  removeButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  removeButtonGradient: {
    padding: 12,
  },
  nutritionInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,107,107,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,107,107,0.1)",
    marginBottom: 15,
  },
  nutritionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  nutritionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  nutritionLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  nutritionValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  foodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  orderButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  orderButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  emptyState: {
    marginTop: 40,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyStateGradient: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  exploreButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 30,
  },
});
