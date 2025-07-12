import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { OrderStats, orderManagementApi } from '../api/orderManagementApi';

const { width } = Dimensions.get('window');

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  icon: string; 
  color: string; 
}) => {
  return (
    <Animatable.View
      animation="fadeInUp"
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={20} color="white" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </Animatable.View>
  );
};

const ChartCard = ({ 
  title, 
  data, 
  type 
}: { 
  title: string; 
  data: any; 
  type: 'bar' | 'pie' | 'line'; 
}) => {
  const renderBarChart = () => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>Không có dữ liệu</Text>
        </View>
      );
    }

    const values = Object.values(data).map(v => Number(v) || 0);
    const maxValue = Math.max(...values, 1); // Prevent division by zero
    
    return (
      <View style={styles.chartContainer}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.barItem}>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: (Number(value) || 0) / maxValue * 100,
                    backgroundColor: '#3498DB'
                  }
                ]} 
              />
            </View>
            <Text style={styles.barLabel}>{key}</Text>
            <Text style={styles.barValue}>{String(value || 0)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPieChart = () => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>Không có dữ liệu</Text>
        </View>
      );
    }

    const colors = ['#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6'];
    
    return (
      <View style={styles.chartContainer}>
        {Object.entries(data).map(([key, value], index) => (
          <View key={key} style={styles.pieItem}>
            <View style={[styles.pieColor, { backgroundColor: colors[index % colors.length] }]} />
            <Text style={styles.pieLabel}>{key}</Text>
            <Text style={styles.pieValue}>{String(value || 0)}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      style={styles.chartCard}
    >
      <Text style={styles.chartTitle}>{title}</Text>
      {type === 'bar' ? renderBarChart() : renderPieChart()}
    </Animatable.View>
  );
};

const TopSellingItem = ({ 
  item, 
  rank 
}: { 
  item: { productId: string; productName: string; quantity: number; revenue: number }; 
  rank: number; 
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#E0E0E0';
    }
  };

  return (
    <View style={styles.topItem}>
      <View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) }]}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.itemStats}>
          {item.quantity || 0} đơn • {(item.revenue || 0).toLocaleString('vi-VN')}đ
        </Text>
      </View>
    </View>
  );
};

const AdminStatsScreen = () => {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading admin statistics...');
      
      // Calculate date range based on selected period
      const now = new Date();
      let startDate: string;
      
      switch (selectedPeriod) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          break;
      }
      
      const response = await orderManagementApi.getOrderStats({
        start: startDate,
        end: now.toISOString()
      });
      
      console.log('📥 Stats response:', response);
      setStats(response.stats);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      setError('Không thể tải thống kê. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="stats-chart-outline" size={64} color="#DDD" />
        <Text style={styles.emptyText}>Không có dữ liệu thống kê</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tải lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3498DB', '#2980B9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Thống kê</Text>
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period === 'today' ? 'Hôm nay' : 
                 period === 'week' ? 'Tuần này' : 'Tháng này'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng đơn hàng"
            value={(stats.totalOrders || 0).toString()}
            subtitle="đơn hàng"
            icon="receipt-outline"
            color="#3498DB"
          />
          <StatCard
            title="Tổng doanh thu"
            value={`${((stats.totalRevenue || 0) / 1000000).toFixed(1)}M`}
            subtitle="VNĐ"
            icon="cash-outline"
            color="#27AE60"
          />
          <StatCard
            title="Giá trị TB"
            value={`${((stats.averageOrderValue || 0) / 1000).toFixed(0)}K`}
            subtitle="VNĐ/đơn"
            icon="trending-up-outline"
            color="#F39C12"
          />
          <StatCard
            title="Đơn hàng mới"
            value={(stats.ordersByStatus?.pending || 0).toString()}
            subtitle="chờ xử lý"
            icon="time-outline"
            color="#E74C3C"
          />
        </View>

        {/* Charts */}
        <View style={styles.chartsSection}>
          <ChartCard
            title="Đơn hàng theo trạng thái"
            data={stats.ordersByStatus || {}}
            type="pie"
          />
          
          <ChartCard
            title="Đơn hàng theo ngày"
            data={stats.ordersByDay || {}}
            type="bar"
          />
        </View>

        {/* Top Selling Items */}
        <View style={styles.topItemsSection}>
          <Text style={styles.sectionTitle}>Món bán chạy nhất</Text>
          {(stats.topSellingItems || []).map((item, index) => (
            <TopSellingItem
              key={item.productId}
              item={item}
              rank={index + 1}
            />
          ))}
          {(!stats.topSellingItems || stats.topSellingItems.length === 0) && (
            <Text style={styles.emptyChartText}>Không có dữ liệu món bán chạy</Text>
          )}
        </View>

        {/* Peak Hours */}
        <View style={styles.peakHoursSection}>
          <Text style={styles.sectionTitle}>Giờ cao điểm</Text>
          <View style={styles.peakHoursGrid}>
            {(stats.peakHours || []).map((peak) => (
              <View key={peak.hour} style={styles.peakHourItem}>
                <Text style={styles.peakHour}>{peak.hour}:00</Text>
                <Text style={styles.peakCount}>{peak.orderCount || 0} đơn</Text>
              </View>
            ))}
            {(!stats.peakHours || stats.peakHours.length === 0) && (
              <Text style={styles.emptyChartText}>Không có dữ liệu giờ cao điểm</Text>
            )}
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'white',
  },
  periodText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#3498DB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: (width - 48) / 2,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#999',
  },
  chartsSection: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  emptyChart: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: 20,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  barValue: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  pieLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  pieValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  topItemsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
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
  itemStats: {
    fontSize: 12,
    color: '#666',
  },
  peakHoursSection: {
    marginBottom: 24,
  },
  peakHoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  peakHourItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: (width - 48) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  peakHour: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  peakCount: {
    fontSize: 12,
    color: '#666',
  },
});

export default AdminStatsScreen; 