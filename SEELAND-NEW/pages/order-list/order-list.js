// pages/order-list/order-list.js
const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.Tab, app.Methods, {
	data: Object.assign({}, app.Variables, {
		orders: [],
		bottomStyle: null,
		tabSelected: 'all',
		tabList: [{
			id: 'all',
			title: '所有订单'
		},
		{
			id: 'pending',
			title: '待付款'
		},
		{
			id: 'processing',
			title: '待发货'
		},
		{
			id: 'shipped',
			title: '已发货'
		},
		{
			id: 'received',
			title: '已签收'
		},
		{
			id: 'completed',
			title: '已完成'
		},
		{
			id: 'cancelled',
			title: '已取消'
		}]
	}),
	page: 1,
	options: null,
	// 选项卡变更
	handleZanTabChange({ componentId, selectedId }) {
		if (componentId == 'order-tab') {
			this.setData({ tabSelected: selectedId });
		}
		this.options.status = selectedId;
		this.onShow(this.options);
	},
	// 取消订单
	cancelOrder(e) {
		var id = e.currentTarget.dataset.id;
		app.cancelOrder({
			id: id,
			success: data => {
				var toast = {};
				if (data.success == true) {
					toast.title = '取消成功';
					this.changeOrderStatus(id, 'cancelled');
				}
				else {
					toast.title = '取消失败，请稍后再试';
					toast.icon = 'none';
				}
				wx.showToast(toast);
			}
		});
	},
	// 发起支付
	makePayment(e) {
		var dataset = e.currentTarget.dataset;
		app.requestPayment({
			id: dataset.id,
			total: dataset.total,
			wc_order_key: dataset.orderKey,
			success: res => {
				wx.showToast({
					title: '支付成功',
					success: () => {
						this.changeOrderStatus(dataset.id, 'processing');
					}
				});
			},
			fail: res => {
				if (res.errMsg != 'requestPayment:fail cancel') {
					wx.showToast({
						title: '支付暂时出现问题，请稍候再试',
						icon: 'none'
					});
				}
			}
		})
	},
	// 改变页面订单状态
	changeOrderStatus(id, status) {
		var orders = this.data.orders;
		for (var i = 0; i < orders.length; i++) {
			if (orders[i].id == id) {
				orders[i].status = status;
				orders[i]['order_status_desc'] = app.Util.getOrderStatus(orders[i].status);
				this.setData({ orders: orders });
				return;
			}
		}
	},
	// 跳转订单详情
	goOrderDetail(e) {
		var id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '../../pages/order-detail/order-detail?id=' + id
		})
	},
	// 跳转物流详情
	goShippingDetail(e) {
		var order_id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '../../pages/shipping-detail/shipping-detail?order_id=' + order_id
		})
	},
	goProductDetail() { },
	loadData(clear) {
		var params = {
			w2w_session: app.data.w2w_session,
			page: this.page
		};
		if (this.options.status != 'all') params.status = this.options.status;
		app.Util.network.GET({
			url: app.API('order_list'),
			params: params,
			success: data => {
				var orders = data;
				for (var i = 0; i < orders.length; i++) {
					orders[i]['order_status_desc'] = app.Util.getOrderStatus(orders[i].status);
				}
				if (clear != true) {
					var orders = this.data.orders;
					for (var i = 0; i < data.length; i++) {
						orders.push(data[i]);
					}
				}

				this.setData({
					currency: app.data.currency,
					orders: orders
				}, () => {
					wx.hideLoading();
				})


				if (data.length == 0 && this.page == 1) {
					this.setData({ bottomStyle: 'empty' });
				}
				else if (data.length < 10) {
					this.setData({ bottomStyle: 'nomore' });
				}
				else {
					this.setData({ bottomStyle: 'loading' });
					this.page++;
				}
			}
		});
	},
	onLoad(options) {
		this.options = options;
		if (this.options.status == undefined) this.options.status = this.data.tabList[0].id;
	},
	onShow() {
		this.page = 1;
		this.setData({ tabSelected: this.options.status });
		this.loadData(true);
	},
	onPullDownRefresh() {
		this.onShow(this.options);
	},
	onReachBottom() {
		if (this.data.bottomStyle != 'nomore') {
			this.loadData(false);
		}
	}
}))