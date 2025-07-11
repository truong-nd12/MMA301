const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'fullName email')
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name price images'
                }
            })
            .sort('-createdAt');

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'fullName email')
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name price images'
                }
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is admin or order owner
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, deliveryMethod, notes } = req.body;

        // Calculate totals
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.product} not found`
                });
            }

            const itemPrice = product.price * item.quantity;
            totalAmount += itemPrice;

            // Create order item
            const orderItem = await OrderItem.create({
                product: item.product,
                quantity: item.quantity,
                itemPrice: product.price,
                size: item.size,
                addOns: item.addOns,
                sugarLevel: item.sugarLevel,
                iceLevel: item.iceLevel
            });

            orderItems.push(orderItem._id);
        }

        const shippingFee = deliveryMethod === 'delivery' ? 5000 : 0;
        const tax = totalAmount * 0.1; // 10% tax
        const finalAmount = totalAmount + shippingFee + tax;

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            totalAmount,
            shippingFee,
            tax,
            finalAmount,
            paymentMethod,
            deliveryMethod,
            shippingAddress,
            notes
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'fullName email')
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name price images'
                }
            });

        res.status(201).json({
            success: true,
            order: populatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'fullName email')
         .populate({
             path: 'items',
             populate: {
                 path: 'product',
                 select: 'name price images'
             }
         });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Get total orders and revenue
        const orders = await Order.find(dateFilter);
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get orders by day
        const ordersByDay = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$finalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get orders by hour
        const ordersByHour = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get peak hour
        const peakHourData = ordersByHour.reduce((max, current) => 
            current.count > max.count ? current : max, { count: 0 }
        );
        const peakHour = peakHourData.count > 0 ? `${peakHourData._id}:00` : 'N/A';

        // Get status breakdown
        const statusBreakdown = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusBreakdownWithPercentage = statusBreakdown.map(status => ({
            status: status._id,
            count: status.count,
            percentage: totalOrders > 0 ? (status.count / totalOrders) * 100 : 0
        }));

        // Get top selling items
        const topSellingItems = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product._id',
                    productName: { $first: '$product.name' },
                    quantity: { $sum: '$quantity' },
                    revenue: { $sum: { $multiply: ['$itemPrice', '$quantity'] } }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalRevenue,
                averageOrderValue,
                peakHour,
                ordersByDay: ordersByDay.map(day => ({
                    day: day._id,
                    count: day.count,
                    revenue: day.revenue
                })),
                ordersByHour: ordersByHour.map(hour => ({
                    hour: `${hour._id}:00`,
                    count: hour.count
                })),
                topSellingItems: topSellingItems.map(item => ({
                    productId: item._id,
                    productName: item.productName,
                    quantity: item.quantity,
                    revenue: item.revenue
                })),
                statusBreakdown: statusBreakdownWithPercentage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get orders by date range (Admin)
// @route   GET /api/orders/date-range
// @access  Private/Admin
const getOrdersByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const orders = await Order.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
        .populate('user', 'fullName email')
        .populate({
            path: 'items',
            populate: {
                path: 'product',
                select: 'name price images'
            }
        })
        .sort('-createdAt');

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get top selling items (Admin)
// @route   GET /api/orders/top-selling
// @access  Private/Admin
const getTopSellingItems = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topItems = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product._id',
                    productName: { $first: '$product.name' },
                    quantity: { $sum: '$quantity' },
                    revenue: { $sum: { $multiply: ['$itemPrice', '$quantity'] } }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: parseInt(limit) }
        ]);

        res.json({
            success: true,
            items: topItems.map(item => ({
                productId: item._id,
                productName: item.productName,
                quantity: item.quantity,
                revenue: item.revenue
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    getOrderStats,
    getOrdersByDateRange,
    getTopSellingItems
}; 