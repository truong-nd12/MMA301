import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (n: number) => void;
}) => {
  const [animatedValues] = useState(
    [1, 2, 3, 4, 5].map(() => new Animated.Value(1))
  );

  const animateStar = (index: number) => {
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star, index) => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            setRating(star);
            animateStar(index);
          }}
          style={styles.starButton}
        >
          <Animated.View
            style={{
              transform: [{ scale: animatedValues[index] }],
            }}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={40}
              color={star <= rating ? "#FFD700" : "#E0E0E0"}
            />
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const QuickReviewOptions = ({
  selectedOptions,
  setSelectedOptions,
}: {
  selectedOptions: string[];
  setSelectedOptions: (options: string[]) => void;
}) => {
  const options = [
    { id: "delicious", label: "Ngon", icon: "heart" },
    { id: "fresh", label: "Tươi ngon", icon: "leaf" },
    { id: "hot", label: "Nóng hổi", icon: "flame" },
    { id: "clean", label: "Sạch sẽ", icon: "checkmark-circle" },
    { id: "fast", label: "Phục vụ nhanh", icon: "time" },
    { id: "affordable", label: "Giá hợp lý", icon: "cash" },
  ];

  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  return (
    <View style={styles.quickOptionsContainer}>
      <Text style={styles.label}>Đánh giá nhanh</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionChip,
              selectedOptions.includes(option.id) && styles.optionChipSelected,
            ]}
            onPress={() => toggleOption(option.id)}
          >
            <Ionicons
              name={option.icon as any}
              size={16}
              color={
                selectedOptions.includes(option.id) ? "#fff" : "#667eea"
              }
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionText,
                selectedOptions.includes(option.id) && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function OrderReviewScreen({ route, navigation }: any) {
  const { order } = route.params || {};
  const [star, setStar] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const submitReview = () => {
    if (!order) return;

    const review = {
      orderId: order.id,
      foodName: order.name,
      star,
      comment,
      quickOptions: selectedOptions,
      isAnonymous,
      date: new Date().toISOString(),
    };

    setReviews((prev) => [...prev, review]);
    console.log("Đánh giá đã lưu:", review);
    
    Alert.alert(
      "Cảm ơn bạn! 🎉",
      "Đánh giá của bạn đã được gửi thành công và sẽ giúp cải thiện chất lượng phục vụ của căng tin.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getRatingText = (rating: number) => {
    const texts = {
      1: "Rất không hài lòng 😞",
      2: "Không hài lòng 😕",
      3: "Bình thường 😐",
      4: "Hài lòng 😊",
      5: "Rất hài lòng 😍",
    };
    return texts[rating as keyof typeof texts];
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá món ăn</Text>
        <Text style={styles.headerSubtitle}>Chia sẻ trải nghiệm của bạn</Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {order && (
          <View style={styles.orderInfoBox}>
            <View style={styles.orderHeader}>
              <View style={styles.foodImagePlaceholder}>
                <Ionicons name="restaurant" size={24} color="#667eea" />
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.foodName}>{order.name}</Text>
                <Text style={styles.foodDate}>
                  {order.date} • {order.time}
                </Text>
                <Text style={styles.foodLocation}>
                  <Ionicons name="location" size={12} color="#888" /> {order.location}
                </Text>
              </View>
              <View style={styles.orderStatus}>
                <Text style={styles.statusText}>Hoàn thành</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Bạn cảm thấy thế nào?</Text>
          <StarRating rating={star} setRating={setStar} />
          <Text style={styles.ratingText}>{getRatingText(star)}</Text>
        </View>

        <QuickReviewOptions
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />

        <View style={styles.commentSection}>
          <Text style={styles.label}>Chia sẻ thêm (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="Hãy chia sẻ trải nghiệm cụ thể để giúp căng tin cải thiện chất lượng phục vụ..."
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={300}
            placeholderTextColor="#999"
          />
          <Text style={styles.characterCount}>{comment.length}/300</Text>
        </View>

        <TouchableOpacity
          style={styles.anonymousOption}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <Ionicons
            name={isAnonymous ? "checkbox" : "square-outline"}
            size={20}
            color="#667eea"
          />
          <Text style={styles.anonymousText}>Đánh giá ẩn danh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={submitReview}>
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            style={styles.saveBtnGradient}
          >
            <Ionicons name="send" size={20} color="#333" style={styles.sendIcon} />
            <Text style={styles.saveBtnText}>Gửi đánh giá</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Đánh giá của bạn sẽ giúp cải thiện chất lượng phục vụ của căng tin 💙
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  orderInfoBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f0f2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  orderDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  foodDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  foodLocation: {
    fontSize: 13,
    color: "#666",
  },
  orderStatus: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    color: "#4caf50",
    fontWeight: "600",
  },
  ratingSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
  },
  starButton: {
    marginHorizontal: 8,
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    color: "#667eea",
    fontWeight: "500",
    marginTop: 8,
  },
  quickOptionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e6ff",
  },
  optionChipSelected: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  optionIcon: {
    marginRight: 6,
  },
  optionText: {
    fontSize: 13,
    color: "#667eea",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#fff",
  },
  commentSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e9ecef",
    minHeight: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 8,
  },
  anonymousOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  anonymousText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  saveBtn: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
  },
  sendIcon: {
    marginRight: 8,
  },
  saveBtnText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});