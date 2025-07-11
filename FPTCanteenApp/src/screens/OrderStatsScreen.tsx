import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { OrderStats, getOrderStats } from '../api/orderApi';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, subtitle, icon, color, onPress }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={[styles.statCard, { borderLeftColor: color }]}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.statHeader}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  </TouchableOpacity>
);

const ChartCard = ({ title, children }: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.chartCard}>
    <Text style={styles.chartTitle}>{title}</Text>
    {children}
  </View>
);

const BarChart = ({ data, height = 200 }: {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={[styles.barChart, { height }]}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                height: maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0,
                backgroundColor: item.color || '#3498DB',
              },
            ]}
          />
          <Text style={styles.barLabel}>{item.label}</Text>
          <Text style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const TopItemsList = ({ items }: {
  items: Array<{ id: string; name: string; quantity: number; revenue: number }>;
}) => (
  <View style={styles.topItemsList}>
    {items.map((item, index) => (
      <Animatable.View
        key={item.id}
        animation="fadeInLeft"
        delay={index * 100}
        style={styles.topItem}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            {item.quantity} đơn • {item.revenue.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <View style={styles.itemRevenue}>
          <Text style={styles.revenueText}>
            {item.revenue.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </Animatable.View>
    ))}
  </View>
);

const DateRangePicker = ({ onDateRangeChange }: {
  onDateRangeChange: (range: { start: string; end: string }) => void;
}) => {
  const [selectedRange, setSelectedRange] = useState('today');

  const ranges = [
    { key: 'today', label: 'Hôm nay', days: 0 },
    { key: 'week', label: 'Tuần này', days: 7 },
    { key: 'month', label: 'Tháng này', days: 30 },
    { key: 'quarter', label: 'Quý này', days: 90 },
  ];

  const getDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const handleRangeSelect = (range: typeof ranges[0]) => {
    setSelectedRange(range.key);
    const dateRange = getDateRange(range.days);
    onDateRangeChange(dateRange);
  };

  return (
    <View style={styles.dateRangeContainer}>
      <Text style={styles.dateRangeTitle}>Khoảng thời gian</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {ranges.map((range) => (
          <TouchableOpacity
            key={range.key}
            style={[
              styles.rangeButton,
              { backgroundColor: selectedRange === range.key ? '#3498DB' : '#F8F9FA' },
            ]}
            onPress={() => handleRangeSelect(range)}
          >
            <Text
              style={[
                styles.rangeButtonText,
                { color: selectedRange === range.key ? 'white' : '#666' },
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const OrderStatsScreen = () => {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getOrderStats(dateRange);
      setStats(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
        <Text style={styles.errorText}>Không thể tải dữ liệu thống kê</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prepare chart data
  const ordersByDayData = Object.entries(stats.ordersByDay).map(([day, count]) => ({
    label: day,
    value: count,
    color: '#3498DB',
  }));

  const peakHoursData = stats.peakHours.map(({ hour, orderCount }) => ({
    label: `${hour}h`,
    value: orderCount,
    color: '#E74C3C',
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3498DB', '#2980B9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Thống kê đơn hàng</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadStats}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <DateRangePicker onDateRangeChange={setDateRange} />

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng đơn hàng"
            value={formatNumber(stats.totalOrders)}
            subtitle="đơn hàng"
            icon="receipt-outline"
            color="#3498DB"
          />
          <StatCard
            title="Tổng doanh thu"
            value={formatCurrency(stats.totalRevenue)}
            subtitle="VND"
            icon="cash-outline"
            color="#27AE60"
          />
          <StatCard
            title="Đơn hàng TB"
            value={formatCurrency(stats.averageOrderValue)}
            subtitle="VND/đơn"
            icon="trending-up-outline"
            color="#F39C12"
          />
          <StatCard
            title="Giờ cao điểm"
            value={stats.peakHours[0]?.hour + 'h' || 'N/A'}
            subtitle={`${stats.peakHours[0]?.orderCount || 0} đơn`}
            icon="time-outline"
            color="#E74C3C"
          />
        </View>

        {/* Charts */}
        <ChartCard title="Đơn hàng theo ngày">
          <BarChart data={ordersByDayData} />
        </ChartCard>

        <ChartCard title="Giờ cao điểm">
          <BarChart data={peakHoursData} height={150} />
        </ChartCard>

        {/* Top Selling Items */}
        <ChartCard title="Món bán chạy">
          <TopItemsList items={stats.topSellingItems} />
        </ChartCard>

        {/* Additional Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Thông tin chi tiết</Text>
          
          <View style={styles.insightItem}>
            <Ionicons name="calendar-outline" size={20} color="#3498DB" />
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Ngày bận nhất</Text>
              <Text style={styles.insightValue}>
                {Object.entries(stats.ordersByDay)
                  .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="trending-down-outline" size={20} color="#E74C3C" />
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Giờ thấp điểm</Text>
              <Text style={styles.insightValue}>
                {Object.entries(stats.ordersByHour)
                  .sort(([,a], [,b]) => a - b)[0]?.[0] + 'h' || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="star-outline" size={20} color="#F39C12" />
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Món bán chạy nhất</Text>
              <Text style={styles.insightValue}>
                {stats.topSellingItems[0]?.name || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3498DB',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  dateRangeContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  dateRangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: (width - 32) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#95A5A6',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  barValue: {
    fontSize: 10,
    color: '#95A5A6',
    marginTop: 2,
  },
  topItemsList: {
    marginTop: 8,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  itemRevenue: {
    alignItems: 'flex-end',
  },
  revenueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  insightsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
});

export default OrderStatsScreen; 