import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import FavoriteStats from "../components/FavoriteStats";

interface FavoriteFood {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  orderCount: number;
  lastOrdered: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function FavoriteFoodsScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("name"); // name, price, rating, orderCount
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Dữ liệu mẫu món yêu thích
  const [favoriteFoods] = useState<FavoriteFood[]>([
    {
      id: "1",
      name: "Cơm gà xối mỡ",
      price: 45000,
      image: "🍗",
      category: "Món chính",
      rating: 4.8,
      orderCount: 15,
      lastOrdered: "2 ngày trước",
      calories: 650,
      protein: 25,
      carbs: 85,
      fat: 22,
    },
    {
      id: "2",
      name: "Phở bò",
      price: 35000,
      image: "🍜",
      category: "Món chính",
      rating: 4.6,
      orderCount: 12,
      lastOrdered: "1 tuần trước",
      calories: 450,
      protein: 18,
      carbs: 65,
      fat: 15,
    },
    {
      id: "3",
      name: "Bún chả",
      price: 40000,
      image: "🥢",
      category: "Món chính",
      rating: 4.7,
      orderCount: 8,
      lastOrdered: "3 ngày trước",
      calories: 550,
      protein: 20,
      carbs: 75,
      fat: 18,
    },
    {
      id: "4",
      name: "Sinh tố trái cây",
      price: 25000,
      image: "🥤",
      category: "Đồ uống",
      rating: 4.5,
      orderCount: 20,
      lastOrdered: "Hôm nay",
      calories: 120,
      protein: 2,
      carbs: 25,
      fat: 0,
    },
    {
      id: "5",
      name: "Salad gà",
      price: 30000,
      image: "🥗",
      category: "Món chính",
      rating: 4.4,
      orderCount: 6,
      lastOrdered: "1 tuần trước",
      calories: 300,
      protein: 25,
      carbs: 15,
      fat: 12,
    },
  ]);

  const categories = ["Tất cả", "Món chính", "Đồ uống", "Tráng miệng"];

  // Tính toán thống kê
  const totalSpent = favoriteFoods.reduce(
    (sum, food) => sum + food.price * food.orderCount,
    0
  );
  const averageRating =
    favoriteFoods.reduce((sum, food) => sum + food.rating, 0) /
    favoriteFoods.length;
  const mostOrdered = favoriteFoods.reduce((max, food) =>
    food.orderCount > max.orderCount ? food : max
  ).name;

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
        selectedCategory === "Tất cả" || food.category === selectedCategory;
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

  const handleOrderNow = (food: FavoriteFood) => {
    Alert.alert(
      "Đặt hàng nhanh",
      `Bạn có muốn đặt "${food.name}" ngay bây giờ?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đặt hàng",
          onPress: () => {
            // Convert FavoriteFood to food object for OrderScreen
            const foodForOrder = {
              id: food.id,
              name: food.name,
              price: food.price,
              image:
                "https://via.placeholder.com/300x200/667eea/ffffff?text=" +
                encodeURIComponent(food.name),
              desc: `${food.category} - ${food.calories} calo`,
            };
            navigation.navigate("Order", { food: foodForOrder });
          },
        },
      ]
    );
  };

  const handleRemoveFavorite = (food: FavoriteFood) => {
    Alert.alert(
      "Xóa khỏi yêu thích",
      `Bạn có muốn xóa "${food.name}" khỏi danh sách yêu thích?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            Alert.alert("Thành công", "Đã xóa khỏi danh sách yêu thích!");
          },
        },
      ]
    );
  };

  const handleShareFavorites = async () => {
    try {
      const favoriteList = favoriteFoods
        .map(
          (food, index) =>
            `${index + 1}. ${food.name} - ${formatCurrency(food.price)}`
        )
        .join("\n");

      const message = `🍽️ Danh sách món yêu thích của tôi:\n\n${favoriteList}\n\nTổng cộng: ${favoriteFoods.length} món`;

      await Share.share({
        message,
        title: "Món yêu thích của tôi",
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chia sẻ danh sách món yêu thích");
    }
  };

  const renderFoodCard = (food: FavoriteFood) => (
    <View key={food.id} style={styles.foodCard}>
      <View style={styles.foodHeader}>
        <View style={styles.foodImageContainer}>
          <Text style={styles.foodImage}>{food.image}</Text>
        </View>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodCategory}>{food.category}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{food.rating}</Text>
            <Text style={styles.orderCount}>({food.orderCount} lần)</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(food)}
        >
          <Ionicons name="heart" size={20} color="#E91E63" />
        </TouchableOpacity>
      </View>

      <View style={styles.nutritionInfo}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Calo</Text>
          <Text style={styles.nutritionValue}>{food.calories}</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Protein</Text>
          <Text style={styles.nutritionValue}>{food.protein}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Carbs</Text>
          <Text style={styles.nutritionValue}>{food.carbs}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Fat</Text>
          <Text style={styles.nutritionValue}>{food.fat}g</Text>
        </View>
      </View>

      <View style={styles.foodFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(food.price)}</Text>
          <Text style={styles.lastOrdered}>
            Đặt lần cuối: {food.lastOrdered}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => handleOrderNow(food)}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.orderButtonText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Món yêu thích</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareFavorites}
          >
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.favoriteCount}>{favoriteFoods.length} món</Text>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món yêu thích..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Category Filter and Sort */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons name="funnel-outline" size={20} color="#666" />
          <Text style={styles.sortButtonText}>
            {sortBy === "name" && "Tên"}
            {sortBy === "price" && "Giá"}
            {sortBy === "rating" && "Đánh giá"}
            {sortBy === "orderCount" && "Số lần đặt"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortBy === "name" && styles.sortOptionActive,
            ]}
            onPress={() => {
              setSortBy("name");
              setShowSortMenu(false);
            }}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === "name" && styles.sortOptionTextActive,
              ]}
            >
              Sắp xếp theo tên
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortBy === "price" && styles.sortOptionActive,
            ]}
            onPress={() => {
              setSortBy("price");
              setShowSortMenu(false);
            }}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === "price" && styles.sortOptionTextActive,
              ]}
            >
              Sắp xếp theo giá
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortBy === "rating" && styles.sortOptionActive,
            ]}
            onPress={() => {
              setSortBy("rating");
              setShowSortMenu(false);
            }}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === "rating" && styles.sortOptionTextActive,
              ]}
            >
              Sắp xếp theo đánh giá
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortOption,
              sortBy === "orderCount" && styles.sortOptionActive,
            ]}
            onPress={() => {
              setSortBy("orderCount");
              setShowSortMenu(false);
            }}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === "orderCount" && styles.sortOptionTextActive,
              ]}
            >
              Sắp xếp theo số lần đặt
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Food List */}
      <ScrollView style={styles.foodList} showsVerticalScrollIndicator={false}>
        {/* Thống kê */}
        <FavoriteStats
          totalFavorites={favoriteFoods.length}
          mostOrdered={mostOrdered}
          totalSpent={totalSpent}
          averageRating={averageRating}
        />

        {filteredFoods.length > 0 ? (
          filteredFoods.map(renderFoodCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Không tìm thấy món yêu thích</Text>
            <Text style={styles.emptySubtitle}>
              Thử thay đổi từ khóa tìm kiếm hoặc danh mục
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  shareButton: {
    marginBottom: 8,
  },
  favoriteCount: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryContainer: {
    flex: 1,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  categoryButtonActive: {
    backgroundColor: "#667eea",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  sortMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortOptionActive: {
    backgroundColor: "#667eea15",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#333",
  },
  sortOptionTextActive: {
    color: "#667eea",
    fontWeight: "500",
  },
  foodList: {
    flex: 1,
    padding: 16,
  },
  foodCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  foodImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  foodImage: {
    fontSize: 32,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  orderCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  removeButton: {
    padding: 8,
  },
  nutritionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 12,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 2,
  },
  lastOrdered: {
    fontSize: 12,
    color: "#666",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  orderButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
