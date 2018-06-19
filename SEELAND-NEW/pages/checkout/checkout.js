// pages/checkout/checkout.js
const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.TopTips, app.Methods, {
	data: Object.assign({}, app.Variables, {
		address: null,
		cart: null,
		isShippingPopup: false,
		shipping: null,
		coupons: null
	}),
	// 检查配送方式
	checkShipping() {
		if (app.data.address != '' && app.data.shipping.methods.length > 0) {
			return true;
		}
		else {
			if (app.data.shipping.choosen_method == false && app.data.address != '') {
				wx.showToast({
					title: '当前地址暂无可用配送方式',
					icon: 'none'
				})
			} else {
				wx.showToast({
					title: '请先选择收货地址',
					icon: 'none'
				})
			}
			return false;
		}

	},
	// 打开配送方式弹窗
	openShippingPopup() {
		if (this.checkShipping()) this.setData({ isShippingPopup: true });
	},
	// 关闭配送方式弹窗
	closeShippingPopup() {
		this.setData({ isShippingPopup: false });
	},
	// 选择收货地址
	selectAddress() {

		wx.authorize({
			scope: 'scope.address',
			success: () => {
				this.selectAddressSuccess();
			},
			fail: () => {
				wx.showModal({
					title: '未授权',
					content: '提交订单需要获取通讯地址，请在下一个页面中打开通讯地址授权',
					cancelColor: '#96588a',
					confirmColor: '#96588a',
					confirmText: '设置授权',
					success: res => {
						if (res.confirm) {
							wx.openSetting({
								success: res => {
									if (res.authSetting['scope.address'] == true) {
										this.selectAddressSuccess();
									}
								}
							})
						}
					}
				})
			}
		})
	},
	// 选择收货地址成功
	selectAddressSuccess() {

		wx.chooseAddress({
			success: res => {

				app.data.address = res;
				console.log(res);
				this.setData({ address: res });
				wx.setStorage({
					key: 'address',
					data: res
				})

				this.getShippingMethods();
			}
		})
	},
	// 获取配送方式
	getShippingMethods() {

		var address_param = app.getAddressParam(),
			coupon_param = app.getCouponParam('applied_coupons');

		app.Util.network.GET({
			url: app.API('get_shipping_method'),
			params: Object.assign(
				{},
				address_param,
				coupon_param,
				{ w2w_session: app.data.w2w_session, }
			),
			success: data => {
				app.updateCart(data.cart);
				app.data.shipping = data.shipping;

				this.setData({
					cart: data.cart,
					shipping: data.shipping
				});
			}
		});
	},
	// 选择配送方式
	shippingChange(e) {

		var method = e.currentTarget.dataset.id;
		this.closeShippingPopup();

		var address_param = app.getAddressParam(),
			coupon_param = app.getCouponParam('applied_coupons');

		app.Util.network.POST({
			url: app.API('set_shipping_method'),
			params: Object.assign(
				{},
				address_param,
				coupon_param,
				{
					w2w_session: app.data.w2w_session,
					shipping_method: method
				}
			),
			success: data => {
				app.updateCart(data);
				app.data.shipping.choosen_method = method;
				this.setData({
					cart: data,
					'shipping.choosen_method': method
				});
			}
		});
	},
	goCoupon() {
		wx.navigateTo({
			url: '../../pages/coupon/coupon'
		})
	},
	// 提交订单
	goSubmitOrder(e) {

		if (!this.checkShipping()) return;
		if (app.data.cart.cart_contents_count == 0) return;

		var order_param = app.getOrderParam();

		app.Util.network.POST({
			url: app.API('order'),
			params: Object.assign(
				{},
				order_param,
				{
					w2w_session: app.data.w2w_session,
					order_comments: e.detail.value.comment,
					formId: e.detail.formId
				}
			),
			success: data => {
				console.log(data);

				// 订单提交成功
				if (data.result == 'success') {

					// 需要付费
					if (data.order != undefined) {
						var order_id = data.order.id;

						// 发起支付
						app.requestPayment({
							id: data.order.id,
							total: data.order.total,
							wc_order_key: data.order.order_key,
							success: res => {
								wx.showToast({
									title: '支付成功',
									success: () => {
										setTimeout(() => {
											wx.redirectTo({
												url: '../../pages/order-detail/order-detail?id=' + order_id + '&status=success',
											})
										}, 1500);
									}
								});
							},
							fail: res => {
								if (res.errMsg == 'requestPayment:fail cancel') {
									wx.redirectTo({
										url: '../../pages/order-detail/order-detail?id=' + order_id + '&status=cancel',
									})
								}
								else {
									wx.showToast({
										title: '支付暂时出现问题，请稍候再试',
										icon: 'none',
										success: () => {
											setTimeout(() => {
												wx.redirectTo({
													url: '../../pages/order-detail/order-detail?id=' + order_id + '&status=fail',
												})
											}, 1500);
										}
									});
								}
							},
							complete: res => {
								console.log(res);
								this.emptyCheckoutData();
							}
						});
					}
					// 不需付费
					else {
						var redirect = data.redirect,
							exp = /order\-received\/(\d+)\/\?key\=/g,
							result = exp.exec(redirect);
						if (result != null) {
							wx.showToast({
								title: '订单提交成功',
								success: () => {
									setTimeout(() => {
										wx.redirectTo({
											url: '../../pages/order-detail/order-detail?id=' + result[1] + '&status=success',
										})
									}, 1500);
								}
							});
						}
					}
				}
				// 订单提交失败
				else if (data.result == 'failure') {

					if (data.messages) {
						var exp = /\<li\>(.*?)\<\/li\>/ig,
							result,
							errors = [];
						while ((result = exp.exec(data.messages)) != null) {
							errors.push(result[1]);
						}
						this.showZanTopTips(errors);
					}
					else {
						this.showZanTopTips(['提交失败，请稍候再试']);
					}
				}
			}
		});
	},
	// 清空结算数据
	emptyCheckoutData() {
		app.updateCart({
			cart: null,
			cart_contents_count: 0
		});
		//app.shipping = null;
		app.data.coupons = [];

		this.load();
	},
	load() {
		var data = {
			currency: app.data.currency,
			cart: app.data.cart,
			coupons: app.data.coupons
		};
		if (app.data.address != null) {
			data.address = app.data.address;
		}
		if (app.data.shipping != null) {
			data.shipping = app.data.shipping;
		}
		this.setData(data);
	},
	onLoad(options) {

		this.load();
		this.getShippingMethods();
	},
	onShow() {
		this.load();
	},
	onPullDownRefresh() {
		this.onLoad();
	},
	onReachBottom() {

	}
}))