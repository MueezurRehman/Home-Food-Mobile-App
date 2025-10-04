import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface Order {
  id: string;
  name: string;
  qty: number;
  customer: string;
  status?: 'pending' | 'delivered' | 'canceled';
  metaRight?: string; // e.g., "Hostel (Meal)" or with status
}

interface OrdersPanelProps {
  orders: Order[];
  panelHeight?: number;
  panelColor?: string;
  textColor?: string;
  emptyText?: string;
  orderItemColor?: string;
  orderTextColor?: string;
  customerTextColor?: string;
  onOrderPress?: (order: Order) => void;
  customTitle?: string;
  statusColorMap?: { [key in 'delivered' | 'canceled']?: string };
  borderColor?: string;
  mealFilter?: 'all' | 'Lunch' | 'Dinner';
  onMealFilterChange?: (filter: 'all' | 'Lunch' | 'Dinner') => void;
}

const OrdersPanel: React.FC<OrdersPanelProps> = ({ 
  orders, 
  panelColor, 
  textColor, 
  emptyText, 
  orderItemColor, 
  orderTextColor, 
  customerTextColor, 
  onOrderPress, 
  customTitle, 
  statusColorMap, 
  borderColor,
  mealFilter,
  onMealFilterChange
}) => {
  const isPendingPanel = customTitle === "Today's Pending Orders" || customTitle?.includes("Today's Pending Orders");
  return (
    <View
      style={[
        styles.panel,
        panelColor ? { backgroundColor: panelColor } : null,
        borderColor ? { borderColor, borderWidth: 2 } : null,
        isPendingPanel ? styles.pendingPanelAdvanced : null,
      ]}
    >
      {isPendingPanel && <View style={styles.pendingAccent} />}
      <Text style={[styles.panelTitle, textColor ? { color: textColor } : null]}>{customTitle || "Today's Orders:"}</Text>
      
      {/* Meal Filter for Pending Orders Panel */}
      {isPendingPanel && mealFilter && onMealFilterChange && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
            {(['all', 'Lunch', 'Dinner'] as const).map((meal) => (
              <TouchableOpacity
                key={meal}
                onPress={() => onMealFilterChange(meal)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: mealFilter === meal ? '#A67C52' : '#F0F0F0',
                  borderWidth: 1,
                  borderColor: mealFilter === meal ? '#A67C52' : '#E0E0E0',
                  shadowColor: mealFilter === meal ? '#A67C52' : '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: mealFilter === meal ? 0.2 : 0.1,
                  shadowRadius: 2,
                  elevation: mealFilter === meal ? 3 : 1,
                }}
              >
                <Text style={{
                  color: mealFilter === meal ? '#FFF' : '#5C4032',
                  fontWeight: mealFilter === meal ? 'bold' : '500',
                  fontSize: 12,
                }}>
                  {meal === 'all' ? 'All' : meal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, textColor ? { color: textColor } : null]}>{emptyText || 'No orders yet.'}</Text>
        </View>
      ) : (
        <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={true}>
          {orders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={[
                styles.orderItem,
                orderItemColor ? { backgroundColor: orderItemColor } : null,
                isPendingPanel ? styles.pendingOrderCard : null,
              ]}
              onPress={() => onOrderPress && onOrderPress(order)}
              activeOpacity={0.7}
            >
              {/* Line 1: Customer name */}
              <Text
                style={[
                  styles.customerText,
                  customerTextColor ? { color: customerTextColor } : null,
                ]}
                numberOfLines={1}
              >
                {order.customer}
              </Text>
              {/* Line 2: Left -> qty x item, Right -> metaRight (Hostel (Meal)) */}
              <View style={styles.rowBetween}>
                <Text style={[styles.orderText, orderTextColor ? { color: orderTextColor } : null]}>
                  {order.qty} x {order.name}
                </Text>
                {!!order.metaRight && (
                  <Text
                    style={[
                      styles.customerText,
                      customerTextColor ? { color: customerTextColor } : null,
                      statusColorMap && order.status && statusColorMap[order.status as 'delivered' | 'canceled']
                        ? { color: statusColorMap[order.status as 'delivered' | 'canceled'] }
                        : null,
                    ]}
                    numberOfLines={1}
                  >
                    {order.metaRight}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    borderRadius: 18,
    padding: 20,
    marginTop: 40,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: '#FFF7ED',
    overflow: 'hidden',
    position: 'relative',
  },
  pendingPanelAdvanced: {
    backgroundColor: 'linear-gradient(90deg, #FFF7ED 80%, #F8EDE3 100%)', // fallback for web, not RN, but keeps intent
    borderLeftWidth: 8,
    borderLeftColor: '#A67C52',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  pendingAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: '#A67C52',
    zIndex: 1,
  },
  panelTitle: {
    color: '#5C4032',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1.2,
    marginLeft: 12,
  },
  ordersList: {
    maxHeight: 320, // Approximately 4 orders * 80px per order
  },
  orderItem: {
    backgroundColor: '#E2B07A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  rowBetween: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  pendingOrderCard: {
    shadowColor: '#A67C52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#A67C52',
  },
  orderText: {
    color: '#5C4032',
    fontSize: 16,
    fontWeight: '600',
  },
  customerText: {
    color: '#7C5E3C',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default OrdersPanel; 