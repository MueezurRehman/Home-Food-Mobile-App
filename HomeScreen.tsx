import React, { useEffect, useState } from 'react';
import { useColorScheme, View, StatusBar, Text, Image, Modal, TouchableOpacity, ScrollView, SafeAreaView, Linking, TextInput, ActivityIndicator, FlexAlignType, StyleProp, ViewStyle, TextStyle } from 'react-native';
import OrdersPanel from './OrdersPanel';
import FuturisticButton from './FuturisticButton';
import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  FirestoreError,
  Timestamp,
  getDoc,
} from '@react-native-firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { HomeScreenStyles } from './HomeScreenStyles';
import RNBootSplash from 'react-native-bootsplash';

interface Order {
  order_id: string;
  name: string;
  phone: string;
  hostel: string;
  meal: string;
  item: string;
  quantity: number;
  status: 'pending' | 'delivered' | 'canceled';
  price?: number;
  cost?: number;
  margin?: number;
  createdAt?: Timestamp;
}

const initialOrders: Order[] = [];

const HomeScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [processedOrders, setProcessedOrders] = useState<Order[]>(initialOrders);
  const [error, setError] = useState<string | null>(null);

  // Modal state for order actions
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    name: string;
    qty: number;
    customer: string;
    phone?: string;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // State for Edit Menu modal
  const [editMenuModalVisible, setEditMenuModalVisible] = useState(false);

  // State for Add Menu Item screen
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuCost, setMenuCost] = useState('');
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [menuSuccess, setMenuSuccess] = useState(false);
  const [touched, setTouched] = useState<{ name: boolean; price: boolean; cost: boolean; desc: boolean }>({ name: false, price: false, cost: false, desc: false });
  const [menuDesc, setMenuDesc] = useState('');

  // State for Today's Menu page
  const [showMenuList, setShowMenuList] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoadingList, setMenuLoadingList] = useState(false);
  const [menuListError, setMenuListError] = useState<string | null>(null);

  // Add state for menu item modal
  const [selectedMenuItem, setSelectedMenuItem] = useState<any | null>(null);
  const [menuItemModalVisible, setMenuItemModalVisible] = useState(false);
  const [menuItemUpdating, setMenuItemUpdating] = useState(false);
  const [menuItemUpdateError, setMenuItemUpdateError] = useState<string | null>(null);

  const [resettingAvailability, setResettingAvailability] = useState(false);
  const [resetAvailabilityError, setResetAvailabilityError] = useState<string | null>(null);

  // Add state for Today's Sales
  const [todaysSalesData, setTodaysSalesData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProfit: 0,
    totalCost: 0,
    profitMargin: 0,
    pieChartData: [] as { name: string; sales: number; color: string; legendFontColor: string; legendFontSize: number }[]
  });
  const [todaysSalesLoading, setTodaysSalesLoading] = useState(false);

  // Add state for Update Menu page
  const [showUpdateMenuPage, setShowUpdateMenuPage] = useState(false);
  const [updateMenuItems, setUpdateMenuItems] = useState<any[]>([]);
  const [updateMenuLoading, setUpdateMenuLoading] = useState(false);
  const [updateMenuError, setUpdateMenuError] = useState<string | null>(null);
  const [updateMenuSearch, setUpdateMenuSearch] = useState('');

  const [editingMenuItem, setEditingMenuItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', cost: '', availability: false, desc: '' });
  const [editFormTouched, setEditFormTouched] = useState({ name: false, price: false, cost: false });
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editFormSuccess, setEditFormSuccess] = useState(false);

  // Add state for Delete Menu page
  const [showDeleteMenuPage, setShowDeleteMenuPage] = useState(false);
  const [deleteMenuItems, setDeleteMenuItems] = useState<any[]>([]);
  const [deleteMenuLoading, setDeleteMenuLoading] = useState(false);
  const [deleteMenuError, setDeleteMenuError] = useState<string | null>(null);
  const [deleteMenuSearch, setDeleteMenuSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Add state for delete confirmation modal
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ visible: boolean; item: any | null }>({ visible: false, item: null });
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Add state for Sale Report page
  const [showSaleReport, setShowSaleReport] = useState(false);
  const [saleReportData, setSaleReportData] = useState<any>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalProfit: 0,
    profitMargin: 0,
    topItems: [],
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
  });
  const [saleReportLoading, setSaleReportLoading] = useState(false);
  const [saleReportError, setSaleReportError] = useState<string | null>(null);
  const [saleReportPeriod, setSaleReportPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Add state for delivery loading and success
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  // Add state for meal filter
  const [mealFilter, setMealFilter] = useState<'all' | 'Lunch' | 'Dinner'>('all');

  // Add state for Place Order page
  const [showPlaceOrderPage, setShowPlaceOrderPage] = useState(false);
  const [placeOrderItems, setPlaceOrderItems] = useState<any[]>([]);
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
  const [placeOrderSearch, setPlaceOrderSearch] = useState('');

  // Add state for order form
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerHostel: '',
    meal: 'Lunch',
    selectedItem: null as any,
    quantity: 1,
  });
  const [orderFormTouched, setOrderFormTouched] = useState({
    customerName: false,
    customerPhone: false,
    customerHostel: false,
  });
  const [orderFormLoading, setOrderFormLoading] = useState(false);
  const [orderFormError, setOrderFormError] = useState<string | null>(null);
  const [orderFormSuccess, setOrderFormSuccess] = useState(false);

  const colors = {
    background: '#F8EDE3', // light caramel
    title: '#8D5524', // deep brown
    panel: '#FFF7ED', // soft panel
    text: '#5C4032', // brown text
    button: '#A67C52', // main button
    buttonText: '#FFF',
    saleButton: '#8D5524', // dark brown
    saleButtonText: '#FFF',
    testButton: '#C68642', // lighter brown
    testButtonText: '#FFF',
    orderItem: '#E2B07A', // caramel for order item
    orderText: '#5C4032',
    customerText: '#7C5E3C',
  };

  useEffect(() => {
    // Hide the bootsplash when the component mounts
    RNBootSplash.hide({ fade: true });
    
    const app = getApp();
    const db = getFirestore(app);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allOrders: Order[] = snapshot.docs
          .map((doc: any) => ({
            order_id: doc.id,
            ...doc.data(),
          }) as Order);
        // Only show pending orders from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setOrders(
          allOrders.filter(order => {
            if (order.status !== 'pending') return false;
            if (!order.createdAt) return false;
            let orderDate;
            if (order.createdAt instanceof Timestamp) {
              orderDate = order.createdAt.toDate();
            } else if (order.createdAt && typeof order.createdAt === 'object' && 'seconds' in order.createdAt) {
              orderDate = new Date((order.createdAt as any).seconds * 1000);
            } else {
              orderDate = new Date(order.createdAt);
            }
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          })
        );
        // Only show processed orders from today
        setProcessedOrders(
          allOrders.filter(order => {
            if (order.status !== 'delivered' && order.status !== 'canceled') return false;
            if (!order.createdAt) return false;
            let orderDate;
            if (order.createdAt instanceof Timestamp) {
              orderDate = order.createdAt.toDate();
            } else if (order.createdAt && typeof order.createdAt === 'object' && 'seconds' in order.createdAt) {
              orderDate = new Date((order.createdAt as any).seconds * 1000);
            } else {
              orderDate = new Date(order.createdAt);
            }
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          })
        );
        setError(null);
      },
      (err: FirestoreError) => {
        setError('Error fetching orders: ' + err.message);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch today's sales data on component mount
  useEffect(() => {
    fetchTodaysSales();
  }, []);



  // Function to fetch today's sales data
  const fetchTodaysSales = async () => {
    setTodaysSalesLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const salesSnapshot = await firestore()
        .collection('sales')
        .where('createdAt', '>=', firestore.Timestamp.fromDate(today))
        .orderBy('createdAt', 'asc')
        .get();

      const sales = salesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Calculate totals
      const totalSales = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
      const totalOrders = sales.length;
      const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
      const totalCost = sales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0);
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
      
      // Calculate pie chart data - breakdown by item categories
      const itemSales: { [key: string]: number } = {};
      sales.forEach(sale => {
        const itemName = sale.itemName || 'Unknown Item';
        if (!itemSales[itemName]) {
          itemSales[itemName] = 0;
        }
        itemSales[itemName] += sale.totalPrice || 0;
      });
      
      // Convert to pie chart format
      const colors = ['#C68642', '#A67C52', '#8D5524', '#E2B07A', '#F3E1C7', '#BCA17A', '#7C5E3C', '#5C4032'];
      const pieChartData = Object.entries(itemSales)
        .map(([name, sales], index) => ({
          name: name.length > 15 ? name.substring(0, 15) + '...' : name, // just item name
          sales: sales, // numeric value
          color: colors[index % colors.length],
          legendFontColor: '#5C4032',
          legendFontSize: 12
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 8); // Limit to top 8 items for better visibility
      
      setTodaysSalesData({
        totalSales,
        totalOrders,
        totalProfit,
        totalCost,
        profitMargin,
        pieChartData
      });
    } catch (error) {
      console.error('Error fetching today\'s sales:', error);
    } finally {
      setTodaysSalesLoading(false);
    }
  };



  // Handle order tap
  const handleOrderPress = (order: { id: string; name: string; qty: number; customer: string }) => {
    // Find the full order (with phone) from allOrders
    const fullOrder = [...orders, ...processedOrders].find(o => o.order_id === order.id);
    setSelectedOrder({ ...order, phone: fullOrder?.phone });
    setModalVisible(true);
  };

  // Handle call customer
  const handleCallCustomer = () => {
    if (selectedOrder?.phone) {
      Linking.openURL(`tel:${selectedOrder.phone}`);
      setModalVisible(false);
      setSelectedOrder(null);
    }
  };

  // Handle WhatsApp customer
  const handleWhatsAppCustomer = () => {
    if (selectedOrder?.phone) {
      // WhatsApp expects country code, so ensure number is in international format
      let phone = selectedOrder.phone;
      if (!phone.startsWith('+')) {
        phone = '+92' + phone; // Default to Pakistan's country code, adjust as needed
      }
      Linking.openURL(`https://wa.me/${phone.replace(/[^\d+]/g, '')}`);
      setModalVisible(false);
      setSelectedOrder(null);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (status: 'delivered' | 'canceled') => {
    if (!selectedOrder) return;
    
    if (status === 'delivered') {
      setDeliveryLoading(true);
      setDeliverySuccess(false);
    }
    
    try {
      console.log('Updating order status:', selectedOrder.id, 'to:', status);
      const app = getApp();
      const db = getFirestore(app);
      
      // Check if the order document exists before updating
      const orderDoc = await getDoc(doc(db, 'orders', selectedOrder.id));
      if (!orderDoc.exists()) {
        console.log('Order document not found:', selectedOrder.id);
        setError('Order not found in database. It may have been deleted.');
        setModalVisible(false);
        setSelectedOrder(null);
        setDeliveryLoading(false);
        return;
      }
      
      await updateDoc(doc(db, 'orders', selectedOrder.id), { status });
      
      // If order is delivered, add it to sales collection
      if (status === 'delivered') {
        console.log('Order delivered, adding to sales collection...');
        // Find the full order details
        const fullOrder = [...orders, ...processedOrders].find(o => o.order_id === selectedOrder.id);
        console.log('Full order found:', fullOrder);
        
        if (fullOrder) {
          // Use the pricing data directly from the order
          const unitPrice = fullOrder.price || 0;
          const unitCost = fullOrder.cost || 0;
          const totalPrice = unitPrice;
          const totalCost = unitCost;
          const profit = totalPrice - totalCost;
          
          const saleData = {
            orderId: selectedOrder.id,
            itemName: fullOrder.item,
            customerName: fullOrder.name,
            customerPhone: fullOrder.phone,
            customerHostel: fullOrder.hostel,
            meal: fullOrder.meal,
            quantity: fullOrder.quantity,
            unitPrice: unitPrice,
            totalPrice: fullOrder.price,
            unitCost: unitCost,
            totalCost: fullOrder.cost,
            profit: profit,
            profitMargin: totalPrice > 0 ? (profit / totalPrice) * 100 : 0,
            orderMargin: fullOrder.margin || 0, // Store the original margin from order
            createdAt: firestore.FieldValue.serverTimestamp(),
            orderCreatedAt: fullOrder.createdAt,
          };
          
          console.log('Adding sale data:', saleData);
          
          // Add to sales collection
          const saleRef = await firestore().collection('sales').add(saleData);
          console.log('Sale added successfully with ID:', saleRef.id);
          
          // Refresh the pie chart data immediately after adding sale
          await fetchTodaysSales();
        } else {
          console.log('Full order not found for ID:', selectedOrder.id);
        }
        
        // Show success message for delivered orders
        setDeliverySuccess(true);
        setTimeout(() => {
          setDeliveryLoading(false);
          setDeliverySuccess(false);
          setError(null);
          setModalVisible(false);
          setSelectedOrder(null);
        }, 1500);
        return;
      }
      
      setError(null);
      setModalVisible(false);
      setSelectedOrder(null);
      setDeliveryLoading(false);
    } catch (e: any) {
      console.error('Error in handleUpdateStatus:', e);
      setError('Error updating order: ' + (e.message || e.toString()));
      setModalVisible(false);
      setSelectedOrder(null);
      setDeliveryLoading(false);
    }
  };

  // Handle Edit Menu button press
  const handleEditMenuPress = () => {
    setEditMenuModalVisible(true);
  };

  // Handle Edit Menu option selection
  const handleEditMenuOption = (option: string) => {
    setEditMenuModalVisible(false);
    if (option === 'add') {
      setShowAddMenuItem(true);
      return;
    }
    if (option === 'update') {
      setShowUpdateMenuPage(true);
      setUpdateMenuLoading(true);
      setUpdateMenuError(null);
      firestore()
        .collection('menuItems')
        .orderBy('created_at', 'desc')
        .get()
        .then(snapshot => {
          setUpdateMenuItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
          setUpdateMenuLoading(false);
        })
        .catch(err => {
          setUpdateMenuError('Error loading menu items: ' + err.message);
          setUpdateMenuLoading(false);
        });
      return;
    }
    if (option === 'delete') {
      setShowDeleteMenuPage(true);
      setDeleteMenuLoading(true);
      setDeleteMenuError(null);
      firestore()
        .collection('menuItems')
        .orderBy('created_at', 'desc')
        .get()
        .then(snapshot => {
          setDeleteMenuItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
          setDeleteMenuLoading(false);
        })
        .catch(err => {
          setDeleteMenuError('Error loading menu items: ' + err.message);
          setDeleteMenuLoading(false);
        });
      return;
    }
    // For now, just log the option
    console.log('Selected menu option:', option);
    // TODO: Implement actual menu logic
  };

  // Fetch menu items when showing menu list
  useEffect(() => {
    if (!showMenuList) return;
    setMenuLoadingList(true);
    setMenuListError(null);
    const unsubscribe = firestore()
      .collection('menuItems')
      .orderBy('created_at', 'desc')
      .onSnapshot(
        (snapshot) => {
          setMenuItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
          setMenuLoadingList(false);
        },
        (err) => {
          setMenuListError('Error loading menu items: ' + err.message);
          setMenuLoadingList(false);
        }
      );
    return () => unsubscribe();
  }, [showMenuList]);

  // Handle Today's Menu button press
  const handleShowMenuList = () => setShowMenuList(true);

  // Home screen button style
  const homeButtonStyle: StyleProp<ViewStyle> = {
    backgroundColor: '#A67C52',
    borderRadius: 18,
    paddingVertical: 16,
    marginHorizontal: 4,
    marginVertical: 8,
    alignItems: 'center' as FlexAlignType,
    shadowColor: '#A67C52',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0,
    flex: 1,
  };
  const homeButtonTextStyle: StyleProp<TextStyle> = {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  };

  // AddMenuItem screen with form
  if (showAddMenuItem) {
    const margin = menuPrice && menuCost ? Number(menuPrice) - Number(menuCost) : '';
    const isNameInvalid = touched.name && !menuName.trim();
    const isPriceInvalid = touched.price && (!menuPrice || isNaN(Number(menuPrice)));
    const isCostInvalid = touched.cost && (!menuCost || isNaN(Number(menuCost)));
    const isDescInvalid = touched.desc && !menuDesc.trim();

    const handleSubmit = async () => {
      setMenuError(null);
      setMenuSuccess(false);
      // Mark all as touched to trigger validation
      setTouched({ name: true, price: true, cost: true, desc: true });
      if (!menuName.trim() || !menuPrice || !menuCost || isNaN(Number(menuPrice)) || isNaN(Number(menuCost)) || !menuDesc.trim()) {
        setMenuError('Please fill all fields correctly.');
        return;
      }
      setMenuLoading(true);
      try {
        await firestore().collection('menuItems').add({
          name: menuName.trim(),
          price: Number(menuPrice),
          cost: Number(menuCost),
          margin: Number(menuPrice) - Number(menuCost),
          desc: menuDesc.trim(),
          created_at: firestore.FieldValue.serverTimestamp(),
          availability: false,
        });
        setMenuSuccess(true);
        setMenuName('');
        setMenuPrice('');
        setMenuCost('');
        setMenuDesc('');
        setTouched({ name: false, price: false, cost: false, desc: false });
      } catch (e: any) {
        setMenuError('Error adding menu item: ' + (e.message || e.toString()));
      } finally {
        setMenuLoading(false);
      }
    };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8EDE3', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: 320,
          backgroundColor: '#FFF',
          borderRadius: 18,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#8D5524', letterSpacing: 1.1 }}>Add Menu Item</Text>

          <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Item Name</Text>
          <TextInput
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: isNameInvalid ? 'red' : '#A67C52',
              borderRadius: 10,
              padding: 12,
              marginBottom: 4,
              backgroundColor: '#F8F6F2',
              fontSize: 16,
            }}
            placeholder="e.g. Chicken Biryani"
            value={menuName}
            onChangeText={setMenuName}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            placeholderTextColor="#BCA17A"
          />
          {isNameInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Name is required.</Text>}

          <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Selling Price</Text>
          <TextInput
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: isPriceInvalid ? 'red' : '#A67C52',
              borderRadius: 10,
              padding: 12,
              marginBottom: 4,
              backgroundColor: '#F8F6F2',
              fontSize: 16,
            }}
            placeholder="e.g. 250"
            value={menuPrice}
            onChangeText={setMenuPrice}
            onBlur={() => setTouched(t => ({ ...t, price: true }))}
            keyboardType="numeric"
            placeholderTextColor="#BCA17A"
          />
          {isPriceInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Valid price is required.</Text>}

          <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Cost to Make</Text>
          <TextInput
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: isCostInvalid ? 'red' : '#A67C52',
              borderRadius: 10,
              padding: 12,
              marginBottom: 4,
              backgroundColor: '#F8F6F2',
              fontSize: 16,
            }}
            placeholder="e.g. 180"
            value={menuCost}
            onChangeText={setMenuCost}
            onBlur={() => setTouched(t => ({ ...t, cost: true }))}
            keyboardType="numeric"
            placeholderTextColor="#BCA17A"
          />
          {isCostInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Valid cost is required.</Text>}

          <Text style={{ fontSize: 16, marginBottom: 18, color: '#8D5524', fontWeight: '600' }}>Margin: {margin !== '' ? margin : '--'}</Text>

          <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Description</Text>
          <TextInput
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: isDescInvalid ? 'red' : '#A67C52',
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              backgroundColor: '#F8F6F2',
              fontSize: 16,
              minHeight: 70,
              textAlignVertical: 'top',
            }}
            placeholder="Short description"
            value={menuDesc}
            onChangeText={setMenuDesc}
            onBlur={() => setTouched(t => ({ ...t, desc: true }))}
            multiline
            numberOfLines={3}
            placeholderTextColor="#BCA17A"
          />
          {isDescInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Description is required.</Text>}

          {menuError && <Text style={{ color: 'red', marginBottom: 8 }}>{menuError}</Text>}
          {menuSuccess && <Text style={{ color: 'green', marginBottom: 8 }}>Menu item added!</Text>}

          {menuLoading ? (
            <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
          ) : (
            <FuturisticButton onPress={handleSubmit} style={{ width: '100%', height: 48, backgroundColor: '#A67C52', marginBottom: 12, borderRadius: 12, justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Add Item</Text>
            </FuturisticButton>
          )}
          <FuturisticButton onPress={() => setShowAddMenuItem(false)} style={{ width: '100%', height: 48, backgroundColor: '#888', marginTop: 4, borderRadius: 12, justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Go Back</Text>
          </FuturisticButton>
        </View>
      </SafeAreaView>
    );
  }

  // Today's Menu page
  if (showMenuList) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8EDE3', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: 340,
          backgroundColor: '#FFF',
          borderRadius: 18,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          alignItems: 'center',
          marginTop: 32,
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#8D5524', letterSpacing: 1.1 }}>Menu Availability</Text>
          {menuLoadingList ? (
            <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
          ) : menuListError ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{menuListError}</Text>
          ) : menuItems.length === 0 ? (
            <Text style={{ color: '#7C5E3C', fontStyle: 'italic', marginBottom: 8 }}>No menu items found.</Text>
          ) : (
            <ScrollView style={{ width: '100%', maxHeight: 500, marginBottom: 8 }}>
              {menuItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedMenuItem(item);
                    setMenuItemModalVisible(true);
                    setMenuItemUpdateError(null);
                  }}
                  style={{
                    backgroundColor: '#F8F6F2',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 14,
                    shadowColor: '#A67C52',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.10,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#E2B07A',
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', marginBottom: 2 }}>{item.name}</Text>
                  <Text style={{ color: '#7C5E3C', fontSize: 15 }}>Price: <Text style={{ fontWeight: 'bold' }}>Rs {item.price}</Text></Text>
                  <Text style={{ color: '#BCA17A', fontSize: 14 }}>Cost: Rs {item.cost} | Margin: Rs {item.margin}</Text>
                  <Text style={{ color: item.availability ? '#388E3C' : '#C0392B', fontSize: 14, marginTop: 2 }}>
                    {item.availability ? 'Available' : 'Not Available'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {/* Reset Availability Button */}
          {resetAvailabilityError && <Text style={{ color: 'red', marginBottom: 8 }}>{resetAvailabilityError}</Text>}
          <FuturisticButton
            onPress={async () => {
              setResettingAvailability(true);
              setResetAvailabilityError(null);
              try {
                const batch = firestore().batch();
                menuItems.forEach(item => {
                  const ref = firestore().collection('menuItems').doc(item.id);
                  batch.update(ref, { availability: false });
                });
                await batch.commit();
              } catch (e: any) {
                setResetAvailabilityError('Error resetting: ' + (e.message || e.toString()));
              } finally {
                setResettingAvailability(false);
              }
            }}
            style={{ width: '100%', height: 48, backgroundColor: '#C0392B', marginBottom: 8, borderRadius: 12, justifyContent: 'center' }}
            disabled={resettingAvailability || menuItems.length === 0}
          >
            {resettingAvailability ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Reset Availability</Text>
            )}
          </FuturisticButton>
          {/* Go Back Button */}
          <FuturisticButton onPress={() => setShowMenuList(false)} style={{ width: '100%', height: 48, backgroundColor: '#888', marginTop: 0, borderRadius: 12, justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Go Back</Text>
          </FuturisticButton>
        </View>
        {/* Menu Item Action Modal overlays the menu list */}
        <Modal
          visible={menuItemModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuItemModalVisible(false)}
        >
          <View style={HomeScreenStyles.modalOverlay}>
            <View style={[HomeScreenStyles.modalBox, { backgroundColor: colors.panel, borderColor: colors.orderItem }]}> 
              <Text style={[HomeScreenStyles.modalTitle, { color: colors.title }]}>Update Menu Item</Text>
              {selectedMenuItem && (
                                  <>
                    <Text style={[HomeScreenStyles.modalOrderText, { color: colors.text }]}>{selectedMenuItem.name}</Text>
                    <Text style={[HomeScreenStyles.modalOrderText, { color: '#7C5E3C' }]}>Price: Rs {selectedMenuItem.price}</Text>
                    <Text style={[HomeScreenStyles.modalOrderText, { color: selectedMenuItem.availability ? '#388E3C' : '#C0392B' }]}> {selectedMenuItem.availability ? 'Available' : 'Not Available'} </Text>
                  </>
                )}
                {menuItemUpdateError && <Text style={{ color: 'red', marginBottom: 8 }}>{menuItemUpdateError}</Text>}
                {menuItemUpdating ? (
                  <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[HomeScreenStyles.modalButton, { backgroundColor: selectedMenuItem?.availability ? '#C0392B' : '#388E3C' }]}
                    onPress={async () => {
                      if (!selectedMenuItem) return;
                      setMenuItemUpdating(true);
                      setMenuItemUpdateError(null);
                      try {
                        await firestore().collection('menuItems').doc(selectedMenuItem.id).update({ availability: !selectedMenuItem.availability });
                        setMenuItemModalVisible(false);
                      } catch (e: any) {
                        setMenuItemUpdateError('Error updating: ' + (e.message || e.toString()));
                      } finally {
                        setMenuItemUpdating(false);
                      }
                    }}
                                      >
                      <Text style={[HomeScreenStyles.modalButtonText, { color: '#FFF' }]}>Mark as {selectedMenuItem?.availability ? 'Unavailable' : 'Available'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[HomeScreenStyles.modalButton, { backgroundColor: colors.button }]}
                      onPress={() => setMenuItemModalVisible(false)}
                    >
                      <Text style={[HomeScreenStyles.modalButtonText, { color: colors.buttonText }]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Add Update Menu page rendering
  if (showUpdateMenuPage) {
    // Filter menu items by search (declare only once)
    const filteredMenuItems = updateMenuItems.filter(item =>
      item.name && item.name.toLowerCase().includes(updateMenuSearch.toLowerCase())
    );
    // If editing a menu item, show the edit form
    if (editingMenuItem) {
      const isNameInvalid = editFormTouched.name && !editForm.name.trim();
      const isPriceInvalid = editFormTouched.price && (!editForm.price || isNaN(Number(editForm.price)));
      const isCostInvalid = editFormTouched.cost && (!editForm.cost || isNaN(Number(editForm.cost)));
      const margin = editForm.price && editForm.cost ? Number(editForm.price) - Number(editForm.cost) : '';
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8EDE3', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: '90%',
            maxWidth: 420,
            backgroundColor: '#FFF',
            borderRadius: 18,
            padding: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
            alignItems: 'center',
            marginTop: 32,
            minHeight: 420,
          }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#8D5524', letterSpacing: 1.1 }}>Edit Menu Item</Text>
            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Item Name</Text>
            <TextInput
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: isNameInvalid ? 'red' : '#A67C52',
                borderRadius: 10,
                padding: 12,
                marginBottom: 4,
                backgroundColor: '#F8F6F2',
                fontSize: 16,
              }}
              placeholder="e.g. Chicken Biryani"
              value={editForm.name}
              onChangeText={v => setEditForm(f => ({ ...f, name: v }))}
              onBlur={() => setEditFormTouched(t => ({ ...t, name: true }))}
              placeholderTextColor="#BCA17A"
            />
            {isNameInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Name is required.</Text>}
            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Selling Price</Text>
            <TextInput
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: isPriceInvalid ? 'red' : '#A67C52',
                borderRadius: 10,
                padding: 12,
                marginBottom: 4,
                backgroundColor: '#F8F6F2',
                fontSize: 16,
              }}
              placeholder="e.g. 250"
              value={editForm.price}
              onChangeText={v => setEditForm(f => ({ ...f, price: v }))}
              onBlur={() => setEditFormTouched(t => ({ ...t, price: true }))}
              keyboardType="numeric"
              placeholderTextColor="#BCA17A"
            />
            {isPriceInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Valid price is required.</Text>}
            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Cost to Make</Text>
            <TextInput
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: isCostInvalid ? 'red' : '#A67C52',
                borderRadius: 10,
                padding: 12,
                marginBottom: 4,
                backgroundColor: '#F8F6F2',
                fontSize: 16,
              }}
              placeholder="e.g. 180"
              value={editForm.cost}
              onChangeText={v => setEditForm(f => ({ ...f, cost: v }))}
              onBlur={() => setEditFormTouched(t => ({ ...t, cost: true }))}
              keyboardType="numeric"
              placeholderTextColor="#BCA17A"
            />
            {isCostInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Valid cost is required.</Text>}
            <Text style={{ fontSize: 16, marginBottom: 18, color: '#8D5524', fontWeight: '600' }}>Margin: {margin !== '' ? margin : '--'}</Text>
            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Description</Text>
            <TextInput
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: '#A67C52',
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#F8F6F2',
                fontSize: 16,
                minHeight: 70,
                textAlignVertical: 'top',
              }}
              placeholder="Short description"
              value={editForm.desc}
              onChangeText={v => setEditForm(f => ({ ...f, desc: v }))}
              multiline
              numberOfLines={3}
              placeholderTextColor="#BCA17A"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#7C5E3C', fontWeight: '600', marginRight: 8 }}>Available:</Text>
              <TouchableOpacity
                onPress={() => setEditForm(f => ({ ...f, availability: !f.availability }))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: editForm.availability ? '#388E3C' : '#C0392B',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>{editForm.availability ? '✓' : '✗'}</Text>
              </TouchableOpacity>
            </View>
            {editFormError && <Text style={{ color: 'red', marginBottom: 8 }}>{editFormError}</Text>}
            {editFormSuccess && <Text style={{ color: 'green', marginBottom: 8 }}>Menu item updated!</Text>}
            {editFormLoading ? (
              <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
            ) : (
              <FuturisticButton
                onPress={async () => {
                  setEditFormTouched({ name: true, price: true, cost: true });
                  setEditFormError(null);
                  setEditFormSuccess(false);
                  if (!editForm.name.trim() || !editForm.price || !editForm.cost || isNaN(Number(editForm.price)) || isNaN(Number(editForm.cost))) {
                    setEditFormError('Please fill all fields correctly.');
                    return;
                  }
                  setEditFormLoading(true);
                  try {
                    await firestore().collection('menuItems').doc(editingMenuItem.id).update({
                      name: editForm.name.trim(),
                      price: Number(editForm.price),
                      cost: Number(editForm.cost),
                      margin: Number(editForm.price) - Number(editForm.cost),
                      availability: editForm.availability,
                      desc: (editForm.desc || '').trim(),
                    });
                    setEditFormSuccess(true);
                  } catch (e: any) {
                    setEditFormError('Error updating menu item: ' + (e.message || e.toString()));
                  } finally {
                    setEditFormLoading(false);
                  }
                }}
                style={{ width: '100%', height: 56, paddingVertical: 12, backgroundColor: '#A67C52', marginBottom: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Update Item</Text>
              </FuturisticButton>
            )}
            <FuturisticButton onPress={() => { setEditingMenuItem(null); setEditFormError(null); setEditFormSuccess(false); }} style={{ width: '100%', height: 48, backgroundColor: '#888', marginTop: 4, borderRadius: 12, justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Go Back</Text>
            </FuturisticButton>
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8EDE3', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: '90%',
          maxWidth: 600,
          backgroundColor: '#FFF',
          borderRadius: 18,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          alignItems: 'center',
          marginTop: 32,
          minHeight: 520,
        }}>
          {/* Search Bar */}
          <View style={{ width: '100%', marginBottom: 18 }}>
            <TextInput
              value={updateMenuSearch}
              onChangeText={setUpdateMenuSearch}
              placeholder="Search menu item..."
              placeholderTextColor="#BCA17A"
              style={{
                width: '100%',
                backgroundColor: '#F8F6F2',
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: '#E2B07A',
                paddingVertical: 12,
                paddingHorizontal: 16,
                fontSize: 16,
                color: '#8D5524',
                fontWeight: '500',
                shadowColor: '#A67C52',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 2,
              }}
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#8D5524', letterSpacing: 1.1 }}>Update Menu Items</Text>
          {updateMenuLoading ? (
            <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
          ) : updateMenuError ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{updateMenuError}</Text>
          ) : filteredMenuItems.length === 0 ? (
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <Image source={require('./no-results.png')} style={{ width: 120, height: 120, marginBottom: 10, opacity: 0.5 }} resizeMode="contain" />
              <Text style={{ color: '#7C5E3C', fontStyle: 'italic', fontSize: 16 }}>No menu items found.</Text>
            </View>
          ) : (
            <ScrollView style={{ width: '100%', maxHeight: 500, marginBottom: 8 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredMenuItems.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setEditingMenuItem(item);
                    setEditForm({
                      name: item.name || '',
                      price: item.price ? String(item.price) : '',
                      cost: item.cost ? String(item.cost) : '',
                      availability: !!item.availability,
                      desc: item.desc ? String(item.desc) : '',
                    });
                    setEditFormTouched({ name: false, price: false, cost: false });
                    setEditFormError(null);
                    setEditFormSuccess(false);
                  }}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#F8F6F2',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: '#A67C52',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.10,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#E2B07A',
                    alignItems: 'center',
                    width: '48%',
                    marginRight: (idx % 2 === 0) ? '4%' : 0,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', textAlign: 'center' }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <FuturisticButton onPress={() => setShowUpdateMenuPage(false)} style={{ width: '100%', height: 48, backgroundColor: '#888', marginTop: 0, borderRadius: 12, justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Go Back</Text>
          </FuturisticButton>
        </View>
      </SafeAreaView>
    );
  }

  // Add Delete Menu page rendering
  if (showDeleteMenuPage) {
    // Filter menu items by search
    const filteredDeleteItems = deleteMenuItems.filter(item =>
      item.name && item.name.toLowerCase().includes(deleteMenuSearch.toLowerCase())
    );
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8EDE3', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: '90%',
          maxWidth: 600,
          backgroundColor: '#FFF',
          borderRadius: 18,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          alignItems: 'center',
          marginTop: 32,
          minHeight: 520,
        }}>
          {/* Search Bar */}
          <View style={{ width: '100%', marginBottom: 18 }}>
            <TextInput
              value={deleteMenuSearch}
              onChangeText={setDeleteMenuSearch}
              placeholder="Search menu item..."
              placeholderTextColor="#BCA17A"
              style={{
                width: '100%',
                backgroundColor: '#F8F6F2',
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: '#E2B07A',
                paddingVertical: 12,
                paddingHorizontal: 16,
                fontSize: 16,
                color: '#8D5524',
                fontWeight: '500',
                shadowColor: '#A67C52',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 2,
              }}
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#8D5524', letterSpacing: 1.1 }}>Delete Menu Items</Text>
          {deleteMenuLoading ? (
            <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
          ) : deleteMenuError ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{deleteMenuError}</Text>
          ) : filteredDeleteItems.length === 0 ? (
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <Image source={require('./no-results.png')} style={{ width: 120, height: 120, marginBottom: 10, opacity: 0.5 }} resizeMode="contain" />
              <Text style={{ color: '#7C5E3C', fontStyle: 'italic', fontSize: 16 }}>No menu items found.</Text>
            </View>
          ) : (
            <ScrollView style={{ width: '100%', maxHeight: 500, marginBottom: 8 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredDeleteItems.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setDeleteConfirmModal({ visible: true, item });
                  }}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#F8F6F2',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: '#A67C52',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.10,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#E2B07A',
                    alignItems: 'center',
                    width: '48%',
                    marginRight: (idx % 2 === 0) ? '4%' : 0,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', textAlign: 'center' }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {deleteSuccess && (
            <View style={{
              backgroundColor: '#388E3C',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600', flex: 1 }}>{deleteSuccess}</Text>
              <TouchableOpacity onPress={() => setDeleteSuccess(null)}>
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          {deleteError && <Text style={{ color: 'red', marginBottom: 8 }}>{deleteError}</Text>}
          <FuturisticButton onPress={() => setShowDeleteMenuPage(false)} style={{ width: '100%', height: 48, backgroundColor: '#888', marginTop: 0, borderRadius: 12, justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Go Back</Text>
          </FuturisticButton>
        </View>
        {/* Delete Confirmation Modal overlays the delete page */}
        <Modal
          visible={deleteConfirmModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteConfirmModal({ visible: false, item: null })}
        >
          <View style={HomeScreenStyles.modalOverlay}>
            <View style={[HomeScreenStyles.modalBox, { backgroundColor: colors.panel, borderColor: colors.orderItem }]}> 
              <Text style={[HomeScreenStyles.modalTitle, { color: colors.title }]}>Delete Menu Item</Text>
              <Text style={[HomeScreenStyles.modalOrderText, { color: colors.text, textAlign: 'center', marginBottom: 16 }]}>
                Are you sure you want to delete "{deleteConfirmModal.item?.name}"?
              </Text>
              <Text style={[HomeScreenStyles.modalOrderText, { color: '#C0392B', fontSize: 14, textAlign: 'center', fontStyle: 'italic' }]}>
                This action cannot be undone.
              </Text>
              <TouchableOpacity
                style={[HomeScreenStyles.modalButton, { backgroundColor: '#C0392B' }]}
                onPress={async () => {
                  setDeleteError(null);
                  setDeleteConfirmModal({ visible: false, item: null });
                  try {
                    await firestore().collection('menuItems').doc(deleteConfirmModal.item?.id).delete();
                    setDeleteMenuItems(prev => prev.filter(i => i.id !== deleteConfirmModal.item?.id));
                    setDeleteSuccess(`"${deleteConfirmModal.item?.name}" has been deleted successfully!`);
                    setTimeout(() => setDeleteSuccess(null), 3000);
                  } catch (e: any) {
                    setDeleteError('Error deleting item: ' + (e.message || e.toString()));
                  }
                }}
                              >
                  <Text style={[HomeScreenStyles.modalButtonText, { color: '#FFF' }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[HomeScreenStyles.modalButton, { backgroundColor: colors.button }]}
                  onPress={() => setDeleteConfirmModal({ visible: false, item: null })}
                >
                  <Text style={[HomeScreenStyles.modalButtonText, { color: colors.buttonText }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Add Menu Item Action Modal
  if (modalVisible) {
    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={HomeScreenStyles.modalOverlay}>
          <View style={[HomeScreenStyles.modalBox, { backgroundColor: colors.panel, borderColor: colors.orderItem }]}> 
            <Text style={[HomeScreenStyles.modalTitle, { color: colors.title }]}>Update Order</Text>
            {selectedOrder && (
              <>
                <Text style={[HomeScreenStyles.modalOrderText, { color: colors.text }]}>{selectedOrder.qty} x {selectedOrder.name}</Text>
                <Text style={[HomeScreenStyles.modalOrderText, { color: colors.customerText }]}>{selectedOrder.customer}</Text>
              </>
            )}
            {deliveryLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
                <Text style={{ color: '#7C5E3C', fontSize: 16 }}>Marking as delivered...</Text>
              </View>
            ) : deliverySuccess ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: '#388E3C', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>✓ Delivered!</Text>
                <Text style={{ color: '#7C5E3C', fontSize: 14 }}>Order has been marked as delivered</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[HomeScreenStyles.modalButton, { backgroundColor: colors.saleButton }]}
                  onPress={() => handleUpdateStatus('delivered')}
                >
                  <Text style={[HomeScreenStyles.modalButtonText, { color: colors.saleButtonText }]}>Mark as Delivered</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[HomeScreenStyles.modalButton, { backgroundColor: '#C0392B' }]}
                  onPress={() => handleUpdateStatus('canceled')}
                >
                  <Text style={[HomeScreenStyles.modalButtonText, { color: '#FFF' }]}>Mark as Canceled</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[HomeScreenStyles.modalButton, { backgroundColor: '#3498DB' }]}
                  onPress={handleCallCustomer}
                >
                  <Text style={[HomeScreenStyles.modalButtonText, { color: '#FFF' }]}>Call Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[HomeScreenStyles.modalButton, { backgroundColor: '#25D366' }]}
                  onPress={handleWhatsAppCustomer}
                >
                  <Text style={[HomeScreenStyles.modalButtonText, { color: '#FFF' }]}>Call on WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[HomeScreenStyles.modalButton, { backgroundColor: colors.button }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[HomeScreenStyles.modalButtonText, { color: colors.buttonText }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  // Edit Menu Modal
  if (editMenuModalVisible) {
    return (
      <Modal
        visible={editMenuModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditMenuModalVisible(false)}
      >
        <View style={HomeScreenStyles.modalOverlay}>
          <View style={[HomeScreenStyles.modalBox, { backgroundColor: colors.panel, borderColor: colors.orderItem }]}> 
            <Text style={[HomeScreenStyles.modalTitle, { color: colors.title }]}>Edit Menu</Text>
            <TouchableOpacity
              style={[HomeScreenStyles.modalButton, { backgroundColor: colors.button }]}
              onPress={() => handleEditMenuOption('add')}
            >
              <Text style={[HomeScreenStyles.modalButtonText, { color: colors.buttonText }]}>Add Menu Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[HomeScreenStyles.modalButton, { backgroundColor: colors.button }]}
              onPress={() => handleEditMenuOption('update')}
            >
              <Text style={[HomeScreenStyles.modalButtonText, { color: colors.buttonText }]}>Update Menu Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[HomeScreenStyles.modalButton, { backgroundColor: colors.button }]}
              onPress={() => handleEditMenuOption('delete')}
            >
              <Text style={[HomeScreenStyles.modalButtonText, { color: colors.buttonText }]}>Delete Menu Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[HomeScreenStyles.modalButton, { backgroundColor: '#888' }]}
              onPress={() => setEditMenuModalVisible(false)}
            >
              <Text style={[HomeScreenStyles.modalButtonText, { color: '#FFF' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Add state for Sale Report page
  const handleSaleReportPress = () => {
    setShowSaleReport(true);
    setSaleReportLoading(true);
    setSaleReportError(null);
    generateSaleReport();
  };

  const generateSaleReport = async (period?: 'today' | 'week' | 'month') => {
    try {
      // Use the passed period parameter or fall back to current state
      const currentPeriod = period || saleReportPeriod;
      
      // Clear previous data first to prevent mixing
      setSaleReportData({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalProfit: 0,
        profitMargin: 0,
        topItems: [],
        dailyStats: [],
        weeklyStats: [],
        monthlyStats: [],
        totalItemsSold: 0,
        averageProfitPerOrder: 0,
        topCustomers: [],
      });

      const now = new Date();
      let startDate = new Date();
      
      // Set start date based on period
      if (currentPeriod === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (currentPeriod === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (currentPeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      // Fetch sales data for the period
      const salesSnapshot = await firestore()
        .collection('sales')
        .where('createdAt', '>=', firestore.Timestamp.fromDate(startDate))
        .orderBy('createdAt', 'desc')
        .get();

      const sales = salesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as any[];
      console.log('Sales data loaded for', currentPeriod, ':', sales.length, 'records');
      
      // Calculate statistics from sales data
      const totalSales = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
      const totalOrders = sales.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
      
      // Calculate top selling items from sales data
      const itemSales: { [key: string]: { quantity: number; revenue: number } } = {};
      sales.forEach(sale => {
        if (!itemSales[sale.itemName]) {
          itemSales[sale.itemName] = { quantity: 0, revenue: 0 };
        }
        itemSales[sale.itemName].quantity += sale.quantity || 0;
        itemSales[sale.itemName].revenue += sale.totalPrice || 0;
      });
      
      const topItems = Object.entries(itemSales)
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Calculate daily stats from sales data
      const dailyStats = [];
      const currentDate = new Date(startDate);
      while (currentDate <= now) {
        const daySales = sales.filter(sale => {
          const saleDate = sale.createdAt?.toDate?.() || new Date(sale.createdAt);
          return saleDate.toDateString() === currentDate.toDateString();
        });
        
        const dayTotalSales = daySales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
        const dayTotalOrders = daySales.length;
        
        dailyStats.push({
          date: currentDate.toLocaleDateString(),
          sales: dayTotalSales,
          orders: dayTotalOrders,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Additional analytics from sales data
      const totalItemsSold = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
      const averageProfitPerOrder = totalOrders > 0 ? totalProfit / totalOrders : 0;
      
      // Customer analytics
      const customerStats: { [key: string]: { orders: number; totalSpent: number } } = {};
      sales.forEach(sale => {
        const customerKey = `${sale.customerName} (${sale.customerHostel})`;
        if (!customerStats[customerKey]) {
          customerStats[customerKey] = { orders: 0, totalSpent: 0 };
        }
        customerStats[customerKey].orders += 1;
        customerStats[customerKey].totalSpent += sale.totalPrice || 0;
      });
      
      const topCustomers = Object.entries(customerStats)
        .map(([customer, data]) => ({
          customer,
          orders: data.orders,
          totalSpent: data.totalSpent,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 3);
      
      // Set the new data
      setSaleReportData({
        totalSales,
        totalOrders,
        averageOrderValue,
        totalProfit,
        profitMargin,
        topItems,
        dailyStats,
        weeklyStats: [],
        monthlyStats: [],
        totalItemsSold,
        averageProfitPerOrder,
        topCustomers,
      });
      
      setSaleReportLoading(false);
    } catch (error: any) {
      console.error('Error generating sale report:', error);
      setSaleReportError('Error generating report: ' + error.message);
      setSaleReportLoading(false);
    }
  };

  // Sale Report page
  if (showSaleReport) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8EDE3' }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#8D5524', letterSpacing: 1.2 }}>Sale Report</Text>
            
            {/* Period Selector */}
            <View style={{ flexDirection: 'row', marginTop: 16, backgroundColor: '#FFF', borderRadius: 12, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
              {(['today', 'week', 'month'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => {
                    setSaleReportPeriod(period);
                    setSaleReportLoading(true);
                    setSaleReportError(null);
                    // Generate report immediately after period change with the new period
                    generateSaleReport(period);
                  }}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: saleReportPeriod === period ? '#A67C52' : 'transparent',
                  }}
                >
                  <Text style={{
                    color: saleReportPeriod === period ? '#FFF' : '#8D5524',
                    fontWeight: saleReportPeriod === period ? 'bold' : '500',
                    fontSize: 14,
                  }}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {saleReportLoading ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <ActivityIndicator size="large" color="#A67C52" />
              <Text style={{ marginTop: 16, color: '#7C5E3C' }}>Generating report...</Text>
            </View>
          ) : saleReportError ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>{saleReportError}</Text>
            </View>
          ) : (
            <>
              {/* Key Metrics */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                  <Text style={{ fontSize: 14, color: '#7C5E3C', marginBottom: 4 }}>Total Sales</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#8D5524' }}>Rs {saleReportData.totalSales.toLocaleString()}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginLeft: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                  <Text style={{ fontSize: 14, color: '#7C5E3C', marginBottom: 4 }}>Total Orders</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#8D5524' }}>{saleReportData.totalOrders}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                  <Text style={{ fontSize: 14, color: '#7C5E3C', marginBottom: 4 }}>Avg Order Value</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#8D5524' }}>Rs {saleReportData.averageOrderValue.toFixed(0)}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginLeft: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                  <Text style={{ fontSize: 14, color: '#7C5E3C', marginBottom: 4 }}>Profit Margin</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#388E3C' }}>{saleReportData.profitMargin.toFixed(1)}%</Text>
                </View>
              </View>

              {/* Profit Section */}
              <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', marginBottom: 16 }}>Profit Analysis</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, color: '#7C5E3C' }}>Total Profit:</Text>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#388E3C' }}>Rs {saleReportData.totalProfit.toLocaleString()}</Text>
                </View>
              </View>

              {/* Top Selling Items */}
              <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', marginBottom: 16 }}>Top Selling Items</Text>
                {saleReportData.topItems.length === 0 ? (
                  <Text style={{ color: '#7C5E3C', fontStyle: 'italic', textAlign: 'center' }}>No items sold in this period</Text>
                ) : (
                  saleReportData.topItems.map((item: any, index: number) => (
                    <View key={item.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: index < saleReportData.topItems.length - 1 ? 1 : 0, borderBottomColor: '#F0F0F0' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#8D5524' }}>{item.name}</Text>
                        <Text style={{ fontSize: 14, color: '#7C5E3C' }}>{item.quantity} orders</Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#388E3C' }}>Rs {item.revenue.toLocaleString()}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Daily Stats */}
              {saleReportData.dailyStats.length > 0 && (
                <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', marginBottom: 16 }}>Daily Breakdown</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {saleReportData.dailyStats.map((day: any, index: number) => (
                      <View key={index} style={{ marginRight: 16, alignItems: 'center', minWidth: 80 }}>
                        <Text style={{ fontSize: 12, color: '#7C5E3C', marginBottom: 4 }}>{day.date}</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8D5524' }}>Rs {day.sales.toLocaleString()}</Text>
                        <Text style={{ fontSize: 12, color: '#BCA17A' }}>{day.orders} orders</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}

          {/* Go Back Button */}
          <FuturisticButton 
            onPress={() => setShowSaleReport(false)} 
            style={{ 
              width: '100%', 
              height: 48, 
              backgroundColor: '#888', 
              marginTop: 20, 
              borderRadius: 12, 
              justifyContent: 'center' 
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Go Back</Text>
          </FuturisticButton>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Handle Place Order button press
  const handlePlaceOrderPress = () => {
    setShowPlaceOrderPage(true);
    setPlaceOrderLoading(true);
    setPlaceOrderError(null);
    setPlaceOrderSearch('');
    // Reset form
    setOrderForm({
      customerName: '',
      customerPhone: '',
      customerHostel: '',
      meal: 'Lunch',
      selectedItem: null,
      quantity: 1,
    });
    setOrderFormTouched({
      customerName: false,
      customerPhone: false,
      customerHostel: false,
    });
    setOrderFormError(null);
    setOrderFormSuccess(false);
    
    // Fetch all menu items (same logic as Update Menu Items page)
    firestore()
      .collection('menuItems')
      .orderBy('created_at', 'desc')
      .get()
      .then(snapshot => {
        setPlaceOrderItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        setPlaceOrderLoading(false);
      })
      .catch(err => {
        setPlaceOrderError('Error loading menu items: ' + err.message);
        setPlaceOrderLoading(false);
      });
  };

  // Place Order page
  if (showPlaceOrderPage) {
    // Filter available items by search and availability (client-side filtering)
    const filteredPlaceOrderItems = placeOrderItems.filter(item =>
      item.name && 
      item.name.toLowerCase().includes(placeOrderSearch.toLowerCase()) &&
      item.availability === true
    );

    // If an item is selected, show the order form
    if (orderForm.selectedItem) {
      const isNameInvalid = orderFormTouched.customerName && !orderForm.customerName.trim();
      const isPhoneInvalid = orderFormTouched.customerPhone && !orderForm.customerPhone.trim();
      const isHostelInvalid = orderFormTouched.customerHostel && !orderForm.customerHostel.trim();

      const totalPrice = orderForm.selectedItem.price * orderForm.quantity;
      const totalCost = orderForm.selectedItem.cost * orderForm.quantity;
      const totalMargin = totalPrice - totalCost;

      const handleSubmitOrder = async () => {
        setOrderFormTouched({ customerName: true, customerPhone: true, customerHostel: true });
        setOrderFormError(null);
        setOrderFormSuccess(false);
        
        if (!orderForm.customerName.trim() || !orderForm.customerPhone.trim() || !orderForm.customerHostel.trim()) {
          setOrderFormError('Please fill all customer details.');
          return;
        }
        
        setOrderFormLoading(true);
        try {
          const newOrder = {
            name: orderForm.customerName.trim(),
            phone: orderForm.customerPhone.trim(),
            hostel: orderForm.customerHostel.trim(),
            meal: orderForm.meal,
            item: orderForm.selectedItem.name,
            quantity: orderForm.quantity,
            status: 'pending',
            price: orderForm.selectedItem.price,
            cost: orderForm.selectedItem.cost,
            margin: orderForm.selectedItem.margin,
            createdAt: firestore.FieldValue.serverTimestamp(),
          };
          
          await firestore().collection('orders').add(newOrder);
          setOrderFormSuccess(true);
          setTimeout(() => {
            setShowPlaceOrderPage(false);
            setOrderFormSuccess(false);
          }, 1500);
        } catch (e: any) {
          setOrderFormError('Error placing order: ' + (e.message || e.toString()));
        } finally {
          setOrderFormLoading(false);
        }
      };

      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8EDE3', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: '90%',
            maxWidth: 420,
            backgroundColor: '#FFF',
            borderRadius: 18,
            padding: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
            alignItems: 'center',
            marginTop: 32,
            minHeight: 500,
          }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#8D5524', letterSpacing: 1.1 }}>Place Order</Text>
            
            {/* Selected Item Display */}
            <View style={{
              backgroundColor: '#F8F6F2',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              width: '100%',
              borderWidth: 1,
              borderColor: '#E2B07A',
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', marginBottom: 8, textAlign: 'center' }}>
                {orderForm.selectedItem.name}
              </Text>
              <Text style={{ color: '#7C5E3C', fontSize: 15, textAlign: 'center' }}>
                Price: <Text style={{ fontWeight: 'bold' }}>Rs {orderForm.selectedItem.price}</Text>
              </Text>
            </View>

            {/* Customer Details Form */}
            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Customer Name</Text>
            <TextInput
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: isNameInvalid ? 'red' : '#A67C52',
                borderRadius: 10,
                padding: 12,
                marginBottom: 4,
                backgroundColor: '#F8F6F2',
                fontSize: 16,
              }}
              placeholder="Enter customer name"
              value={orderForm.customerName}
              onChangeText={v => setOrderForm(f => ({ ...f, customerName: v }))}
              onBlur={() => setOrderFormTouched(t => ({ ...t, customerName: true }))}
              placeholderTextColor="#BCA17A"
            />
            {isNameInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Customer name is required.</Text>}

            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Phone Number</Text>
            <TextInput
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: isPhoneInvalid ? 'red' : '#A67C52',
                borderRadius: 10,
                padding: 12,
                marginBottom: 4,
                backgroundColor: '#F8F6F2',
                fontSize: 16,
              }}
              placeholder="Enter phone number"
              value={orderForm.customerPhone}
              onChangeText={v => setOrderForm(f => ({ ...f, customerPhone: v }))}
              onBlur={() => setOrderFormTouched(t => ({ ...t, customerPhone: true }))}
              keyboardType="phone-pad"
              placeholderTextColor="#BCA17A"
            />
            {isPhoneInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Phone number is required.</Text>}

            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Hostel</Text>
            <TextInput
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: isHostelInvalid ? 'red' : '#A67C52',
                borderRadius: 10,
                padding: 12,
                marginBottom: 4,
                backgroundColor: '#F8F6F2',
                fontSize: 16,
              }}
              placeholder="Enter hostel name"
              value={orderForm.customerHostel}
              onChangeText={v => setOrderForm(f => ({ ...f, customerHostel: v }))}
              onBlur={() => setOrderFormTouched(t => ({ ...t, customerHostel: true }))}
              placeholderTextColor="#BCA17A"
            />
            {isHostelInvalid && <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 8 }}>Hostel is required.</Text>}

            {/* Meal Selection */}
            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Meal</Text>
            <View style={{ flexDirection: 'row', marginBottom: 16, width: '100%' }}>
              {['Lunch', 'Dinner'].map((meal) => (
                <TouchableOpacity
                  key={meal}
                  onPress={() => setOrderForm(f => ({ ...f, meal }))}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginHorizontal: 4,
                    borderRadius: 8,
                    backgroundColor: orderForm.meal === meal ? '#A67C52' : '#F8F6F2',
                    borderWidth: 1,
                    borderColor: orderForm.meal === meal ? '#A67C52' : '#E2B07A',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: orderForm.meal === meal ? '#FFF' : '#7C5E3C',
                    fontWeight: orderForm.meal === meal ? 'bold' : '500',
                  }}>
                    {meal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quantity Selection */}
            <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#7C5E3C', fontWeight: '600' }}>Quantity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '100%' }}>
              <TouchableOpacity
                onPress={() => setOrderForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#A67C52',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', marginHorizontal: 20 }}>
                {orderForm.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setOrderForm(f => ({ ...f, quantity: f.quantity + 1 }))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#A67C52',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={{
              backgroundColor: '#F8F6F2',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              width: '100%',
              borderWidth: 1,
              borderColor: '#E2B07A',
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8D5524', marginBottom: 8, textAlign: 'center' }}>
                Order Summary
              </Text>
              <Text style={{ color: '#7C5E3C', fontSize: 14, textAlign: 'center' }}>
                Total Price: <Text style={{ fontWeight: 'bold' }}>Rs {totalPrice}</Text>
              </Text>
              <Text style={{ color: '#7C5E3C', fontSize: 14, textAlign: 'center' }}>
                Total Cost: <Text style={{ fontWeight: 'bold' }}>Rs {totalCost}</Text>
              </Text>
              <Text style={{ color: '#388E3C', fontSize: 14, textAlign: 'center' }}>
                Total Margin: <Text style={{ fontWeight: 'bold' }}>Rs {totalMargin}</Text>
              </Text>
            </View>

            {orderFormError && <Text style={{ color: 'red', marginBottom: 8 }}>{orderFormError}</Text>}
            {orderFormSuccess && <Text style={{ color: 'green', marginBottom: 8 }}>Order placed successfully!</Text>}

            {orderFormLoading ? (
              <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
            ) : (
              <FuturisticButton
                onPress={handleSubmitOrder}
                style={{ width: '100%', height: 48, backgroundColor: '#A67C52', marginBottom: 12, borderRadius: 12, justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Place Order</Text>
              </FuturisticButton>
            )}
            
            <FuturisticButton 
              onPress={() => setOrderForm(f => ({ ...f, selectedItem: null }))} 
              style={{ width: '100%', height: 48, backgroundColor: '#888', marginTop: 4, borderRadius: 12, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Back to Items</Text>
            </FuturisticButton>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8EDE3', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: '90%',
          maxWidth: 600,
          backgroundColor: '#FFF',
          borderRadius: 18,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          alignItems: 'center',
          marginTop: 32,
          minHeight: 520,
        }}>
          {/* Search Bar */}
          <View style={{ width: '100%', marginBottom: 18 }}>
            <TextInput
              value={placeOrderSearch}
              onChangeText={setPlaceOrderSearch}
              placeholder="Search available items..."
              placeholderTextColor="#BCA17A"
              style={{
                width: '100%',
                backgroundColor: '#F8F6F2',
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: '#E2B07A',
                paddingVertical: 12,
                paddingHorizontal: 16,
                fontSize: 16,
                color: '#8D5524',
                fontWeight: '500',
                shadowColor: '#A67C52',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 2,
              }}
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#8D5524', letterSpacing: 1.1 }}>Today's Available Items</Text>
          
          {placeOrderLoading ? (
            <ActivityIndicator size="large" color="#A67C52" style={{ marginBottom: 16 }} />
          ) : placeOrderError ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{placeOrderError}</Text>
          ) : filteredPlaceOrderItems.length === 0 ? (
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <Image source={require('./no-results.png')} style={{ width: 120, height: 120, marginBottom: 10, opacity: 0.5 }} resizeMode="contain" />
              <Text style={{ color: '#7C5E3C', fontStyle: 'italic', fontSize: 16 }}>
                {placeOrderItems.length === 0 ? 'No menu items found.' : 'No available items found. Make sure to mark items as available in the menu.'}
              </Text>
            </View>
          ) : (
            <ScrollView style={{ width: '100%', maxHeight: 500, marginBottom: 8 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredPlaceOrderItems.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setOrderForm(f => ({ ...f, selectedItem: item }));
                  }}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#F8F6F2',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: '#A67C52',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.10,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#E2B07A',
                    alignItems: 'center',
                    width: '48%',
                    marginRight: (idx % 2 === 0) ? '4%' : 0,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8D5524', textAlign: 'center', marginBottom: 8 }}>{item.name}</Text>
                  <Text style={{ color: '#7C5E3C', fontSize: 15, textAlign: 'center' }}>
                    Price: <Text style={{ fontWeight: 'bold' }}>Rs {item.price}</Text>
                  </Text>
                  <Text style={{ color: '#BCA17A', fontSize: 14, textAlign: 'center' }}>
                    Cost: Rs {item.cost} | Margin: Rs {item.margin}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          <FuturisticButton 
            onPress={() => setShowPlaceOrderPage(false)} 
            style={{ width: '100%', height: 48, backgroundColor: '#888', marginTop: 0, borderRadius: 12, justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1.1 }}>Go Back</Text>
          </FuturisticButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={HomeScreenStyles.scrollContainer}>
        <Image source={require('./logo.png')} style={HomeScreenStyles.foodImage} resizeMode="contain" />
        <Text style={[HomeScreenStyles.title, { color: colors.title }]}>Apa Ka Dhaba</Text>
        {error && (
          <Text style={{ color: 'red', marginBottom: 8, textAlign: 'center' }}>{error}</Text>
        )}
        {/* Filtered Pending Orders */}
        <OrdersPanel
          orders={orders
            .filter(order => mealFilter === 'all' || order.meal === mealFilter)
            .map(o => ({
              id: o.order_id,
              name: o.item,
              qty: o.quantity,
              customer: o.name,
              metaRight: `${o.hostel} (${o.meal})`,
            }))}
          panelHeight={320}
          panelColor={'#FFF7ED'}
          textColor={colors.text}
          emptyText={mealFilter === 'all' ? "No orders yet." : `No ${mealFilter} orders yet.`}
          orderItemColor={colors.orderItem}
          orderTextColor={colors.orderText}
          customerTextColor={colors.customerText}
          onOrderPress={handleOrderPress}
          customTitle={`Today's Pending Orders${mealFilter !== 'all' ? ` - ${mealFilter}` : ''}`}
          mealFilter={mealFilter}
          onMealFilterChange={setMealFilter}
        />
        {/* Processed Orders Panel */}
        <OrdersPanel
          orders={processedOrders.map(o => ({
            id: o.order_id,
            name: o.item,
            qty: o.quantity,
            customer: o.name,
            metaRight: `${o.hostel} (${o.meal}) - ${o.status === 'delivered' ? 'Delivered' : 'Canceled'}`,
            status: o.status,
          }))}
          panelHeight={320}
          panelColor={'#F3E1C7'}
          textColor={colors.text}
          emptyText="No processed orders yet."
          orderItemColor={'#E2B07A'}
          orderTextColor={colors.orderText}
          customerTextColor={colors.customerText}
          customTitle="Processed Orders"
          statusColorMap={{ delivered: '#388E3C', canceled: '#C0392B' }}
          borderColor={'#A67C52'}
        />
        <View style={[HomeScreenStyles.buttonRow, { width: '100%' }]}>
          <FuturisticButton style={homeButtonStyle} textStyle={homeButtonTextStyle} onPress={handleShowMenuList}>Today's Menu</FuturisticButton>
          <FuturisticButton style={homeButtonStyle} textStyle={homeButtonTextStyle} onPress={handleEditMenuPress}>Edit Menu</FuturisticButton>
        </View>
        
        {/* Place Order Button - Above Sale Report */}
        <FuturisticButton
          style={{
            backgroundColor: '#C68642',
            borderRadius: 25, // More rounded corners
            paddingVertical: 16, // Adjusted padding
            marginHorizontal: 0,
            marginVertical: 16, // More vertical spacing
            alignItems: 'center',
            justifyContent: 'center', // Ensure text is centered
            shadowColor: '#C68642',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 15,
            elevation: 12,
            borderWidth: 3,
            borderColor: '#A67C52',
            width: '100%',
            height: 70, // Increased height to accommodate text
            flex: undefined,
            flexGrow: undefined
          }}
          textStyle={{
            color: '#FFF',
            fontSize: 20, // Larger text
            fontWeight: 'bold',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
            textAlign: 'center' // Ensure text alignment
          }}
          onPress={handlePlaceOrderPress}
        >
          Place Order
        </FuturisticButton>
        
        {/* Sale Report Button - Below Place Order */}
        <View style={HomeScreenStyles.buttonRow}>
          <FuturisticButton
            style={[homeButtonStyle, { width: '100%', marginHorizontal: 0, backgroundColor: '#8D5524' }]}
            textStyle={homeButtonTextStyle}
            onPress={handleSaleReportPress}
          >
            Sale Report
          </FuturisticButton>
        </View>

        {/* Today's Sales Section */}
        <View style={HomeScreenStyles.todaysSalesContainer}>
          <View style={HomeScreenStyles.todaysSalesHeader}>
            <Text style={[HomeScreenStyles.todaysSalesTitle, { color: colors.title }]}>Today's Sales</Text>
            <TouchableOpacity 
              style={HomeScreenStyles.refreshButton}
              onPress={fetchTodaysSales}
              disabled={todaysSalesLoading}
            >
              <Text style={HomeScreenStyles.refreshButtonText}>
                {todaysSalesLoading ? 'Loading...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {todaysSalesLoading ? (
            <ActivityIndicator size="large" color="#A67C52" style={{ marginVertical: 20 }} />
          ) : (
            <>
              {/* Sales Numbers */}
              <View style={HomeScreenStyles.salesNumbersContainer}>
                <View style={HomeScreenStyles.salesNumberCard}>
                  <Text style={HomeScreenStyles.salesNumberLabel}>Total Sales</Text>
                  <Text style={HomeScreenStyles.salesNumberValue}>Rs {todaysSalesData.totalSales.toFixed(2)}</Text>
                </View>
                <View style={HomeScreenStyles.salesNumberCard}>
                  <Text style={HomeScreenStyles.salesNumberLabel}>Total Orders</Text>
                  <Text style={HomeScreenStyles.salesNumberValue}>{todaysSalesData.totalOrders}</Text>
                </View>
                <View style={HomeScreenStyles.salesNumberCard}>
                  <Text style={HomeScreenStyles.salesNumberLabel}>Total Profit</Text>
                  <Text style={[HomeScreenStyles.salesNumberValue, { color: '#388E3C' }]}>Rs {todaysSalesData.totalProfit.toFixed(2)}</Text>
                </View>
                <View style={HomeScreenStyles.salesNumberCard}>
                  <Text style={HomeScreenStyles.salesNumberLabel}>Total Cost</Text>
                  <Text style={[HomeScreenStyles.salesNumberValue, { color: '#C0392B' }]}>Rs {todaysSalesData.totalCost.toFixed(2)}</Text>
                </View>
                <View style={HomeScreenStyles.salesNumberCard}>
                  <Text style={HomeScreenStyles.salesNumberLabel}>Profit Margin</Text>
                  <Text style={[HomeScreenStyles.salesNumberValue, { color: '#388E3C' }]}>{todaysSalesData.profitMargin.toFixed(1)}%</Text>
                </View>
              </View>

              {/* Chart */}
              {todaysSalesData.pieChartData.length > 0 ? (
                <View style={HomeScreenStyles.chartContainer}>
                  <Text style={[HomeScreenStyles.chartTitle, { color: colors.title }]}>Today's Sales by Item</Text>
                  <PieChart
                    data={todaysSalesData.pieChartData}
                    width={Dimensions.get('window').width - 80}
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.panel,
                      backgroundGradientFrom: colors.panel,
                      backgroundGradientTo: colors.panel,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(92, 64, 50, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(92, 64, 50, ${opacity})`,
                      style: {
                        borderRadius: 16
                      }
                    }}
                    accessor="sales"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
                              ) : (
                  <View style={HomeScreenStyles.noDataContainer}>
                    <Text style={[HomeScreenStyles.noDataText, { color: colors.text }]}>No sales data available for today</Text>
                    <Text style={[HomeScreenStyles.noDataSubtext, { color: '#7C5E3C' }]}>Deliver some orders to see your sales breakdown</Text>
                  </View>
                )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default HomeScreen; 