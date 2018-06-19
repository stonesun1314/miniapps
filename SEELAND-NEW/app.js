// app.js

App({
	data: {
		version: '1.2.0',
		versionDate: '20180506',
		siteURL: 'https://www.seeland-wood.com/',
		apiPath: 'wp-json/w2w/v1/',
		apiList: {
			login: 'customers/login/',
			session: 'customers/session',
			home: 'store/home/',
			index: 'store/index/',
			currency: 'store/currency/',
			banner: 'store/banner/',
			product: 'products/',
			product_list: 'products/',
			product_search: 'products/search/',
			category: 'products/categories/',
			get_cart: 'cart/',
			add_to_cart: 'cart/add/',
			update_cart: 'cart/update_quantity/',
			delete_cart: 'cart/delete/',
			set_address: 'cart/address/',
			get_shipping_method: 'cart/shipping/',
			set_shipping_method: 'cart/shipping/',
			get_coupon: 'cart/coupon/',
			apply_coupon: 'cart/coupon/',
			order: 'orders/',
			cancel_order: 'orders/cancel/',
			order_detail: 'orders/',
			order_list: 'orders/',
			shipping_detail: 'orders/shipping_detail/',
			payment: 'payment/'
		},
		js_code: null,
		w2w_session: null,
		currency: '¥',
		cart: null,
		cart_quantity: 0,
		country_id: 'CN',
		address: null,
		shipping: null,
		coupons: [],
		payment_method: 'wxpay',
		userInfo: null,
	},
	Util: require('utils/util.js'),
	Methods: require('utils/methods.js'),
	Variables: require('utils/variables.js'),
	// 获取API地址
	API(apiName) {
		return this.data.siteURL + this.data.apiPath + this.data.apiList[apiName];
	},
	// 获取地址参数
	getAddressParam() {
		var address = this.data.address;
		var address_param = {};
		if (address != '') {
			address_param = {
				country_id: this.data.country_id,
				state: this.Util.getStateCode(address.provinceName),
				city: address.cityName,
				postcode: address.postalCode
			};
		}
		return address_param;
	},
	// 获取配送方式参数
	getShippingMethodParam() {
		var shipping_method_param = {};
		if (this.data.shipping != null) {
			shipping_method_param = {
				shipping_method: this.data.shipping.choosen_method
			}
		}
		return shipping_method_param;
	},
	// 获取优惠券参数
	getCouponParam(field = 'coupon_code') {
		var coupons = this.data.coupons;
		var coupon_param = {};
		for (var i = 0; i < coupons.length; i++) {
			coupon_param[field + '[' + i + ']'] = coupons[i];
		}
		return coupon_param;
	},
	// 获取结算参数
	getCheckoutParam() {

		var address_param = this.getAddressParam(),
			shipping_method_param = this.getShippingMethodParam(),
			coupon_param = this.getCouponParam('applied_coupons');

		return Object.assign(
			{},
			address_param,
			shipping_method_param,
			coupon_param,
		)
	},
	// 获取订单参数
	getOrderParam() {
		var address = this.data.address,
			coupon_param = this.getCouponParam('applied_coupons');

		return Object.assign(
			{},
			coupon_param,
			{
				payment_method: this.data.payment_method,
				shipping_method: this.data.shipping.choosen_method,
				billing_first_name: address.userName,
				billing_phone: address.telNumber,
				billing_country: this.data.country_id,
				billing_state: this.Util.getStateCode(address.provinceName),
				billing_city: address.cityName,
				billing_address_1: address.countyName + address.detailInfo,
				billing_postcode: address.postalCode,
				// 2018-03-16 添加同意服务条款参数
				terms: true,
				_wpnonce: this.data.cart._wpnonce
			}
		)
	},
	// 刷新购物车
	refreshCart(callback = function () { }) {

		var checkout_params = this.getCheckoutParam();

		// 整合参数
		var params = Object.assign(
			{},
			checkout_params,
			{
				w2w_session: this.data.w2w_session,
				check_cart_items: true
			}
		);

		this.Util.network.GET({
			url: this.API('get_cart'),
			params: params,
			success: data => {
				this.updateCart(data);
				callback(data);
			}
		});
	},
	// 更新购物车
	updateCart(cart) {
		this.data.cart = cart;
		this.data.cart_quantity = cart == null ? 0 : cart.cart_contents_count;

		if (this.data.cart_quantity != 0) {
			wx.setTabBarBadge({
				index: 3,
				text: this.data.cart_quantity.toString()
			})
		}
		else {
			wx.hideTabBarRedDot({
				index: 3
			});
		}
	},
	// 检查App是否登录
	checkLogin(callback) {

		if (!(this.data.userInfo == '' || this.data.userInfo == null || this.data.w2w_session == '' || this.data.w2w_session == null)) {
			if (callback.success) callback.success();
		}
		else {
			if (callback.fail) {
				wx.login({
					success: res => {
						this.data.js_code = res.code;
						callback.fail();
					},
					fail: res => {
						console.error('wx.login失败', res);
					}
				});
			}
		}

		/*
				if (this.data.userInfo != '') {
					if (this.data.w2w_session == '' || this.data.w2w_session == null) {
						callback({ result: false });
					}
					else {
						callback({ result: true });
					}
					return;
				}
		
				wx.login({
					success: res => {
		
						var js_code = res.code;
						wx.getUserInfo({
							success: res => {
								console.log('获取用户信息成功', res);
								// 存储用户信息
								this.data.userInfo = res.userInfo;
								wx.setStorageSync('userInfo', res.userInfo);
								callback({
									result: true,
									res: {
										js_code: js_code,
										encryptedData: encryptedData,
										iv: iv
									}
								});
							},
							fail: res => {
								console.log('获取用户信息失败', res);
								callback({ result: false });
							}
						})
					}
				})*/
	},
	// 登录
	login(userRes, callback = function () { }) {

		this.Util.network.POST({
			url: this.API('login'),
			params: {
				js_code: this.data.js_code,
				encryptedData: userRes.encryptedData,
				iv: encodeURIComponent(userRes.iv)
			},
			success: data => {
				if (data.w2w_session != undefined) {
					console.log('登录成功', data.w2w_session);
					// 存储Session
					this.data.w2w_session = data.w2w_session;
					wx.setStorageSync('w2w_session', data.w2w_session);
					callback(data.w2w_session);
				}
				else {
					console.error('登录失败', data.code + ': ' + data.message);
				}
			},
			loadingTitle: '正在登录'
		});
	},
	// 按钮点击获取用户信息
	buttonGetUserInfo(e, callback) {

		var userRes = e.detail;

		if (userRes.errMsg == 'getUserInfo:ok') {
			console.log('获取用户信息成功', userRes);
			this.data.userInfo = userRes.userInfo;
			wx.setStorageSync('userInfo', userRes.userInfo);

			this.login(userRes, (w2w_session) => {
				this.refreshCart(cart => {
					if (callback.success) {
						callback.success({
							userInfo: userRes.userInfo,
							cart: cart
						});
					}
				});
			});
		}
		else {
			console.error('获取用户信息失败', userRes);
			if (callback.fail) callback.fail();
		}
	},
	// 登出
	logout() {
		this.data.w2w_session = null;
		this.data.userInfo = null;
		this.updateCart(null);
		wx.removeStorageSync('w2w_session');
		wx.removeStorageSync('userInfo');
		wx.reLaunch({
			url: '../../pages/index/index'
		})
	},
	// 微信支付
	requestPayment(paymentData) {
		// 获取支付参数
		this.Util.network.GET({
			url: this.API('payment'),
			params: {
				id: paymentData.id,
				wc_order_key: paymentData.wc_order_key,
				order_total: this.Util.mul(paymentData.total, 100),
				w2w_session: this.data.w2w_session
			},
			success: data => {
				console.log('支付参数', data);

				// 发起微信支付
				wx.requestPayment({
					timeStamp: data.timeStamp,
					nonceStr: data.nonceStr,
					package: data.package,
					signType: 'MD5',
					paySign: data.paySign,
					success: res => {
						if (paymentData.success) paymentData.success(res);
					},
					fail: res => {
						if (paymentData.fail) paymentData.fail(res);
					},
					complete: res => {
						console.log('wx.requestPayment回调', res);
						if (paymentData.complete) paymentData.complete(res);
					}
				});
			}
		});
	},
	// 取消订单
	cancelOrder(data) {
		wx.showModal({
			title: '请确认',
			content: '确定取消订单吗？此操作不可撤销',
			cancelColor: '#96588a',
			confirmColor: '#96588a',
			success: res => {
				if (res.confirm) {
					this.Util.network.POST({
						url: this.API('cancel_order'),
						params: {
							w2w_session: this.data.w2w_session,
							id: data.id
						},
						success: data => {
							if (data.success) {
								data.success(data);
							}
						}
					});
				}
			}
		})
	},
	// 跳转产品详情页
	goProductDetail(e, newPage = true) {
		var id = e.currentTarget.dataset.id,
			name = e.currentTarget.dataset.name;
		if (newPage) {
			wx.navigateTo({
				url: '../../pages/product-detail/product-detail?id=' + id + '&name=' + name + '&popup=false'
			})
		}
		else {
			wx.redirectTo({
				url: '../../pages/product-detail/product-detail?id=' + id + '&name=' + name + '&popup=false'
			})
		}

	},
	onLaunch() {
		console.log('App onLaunch');
		// 取出Session 收货地址 用户信息
		this.data.w2w_session = wx.getStorageSync('w2w_session');
		this.data.address = wx.getStorageSync('address');
		this.data.userInfo = wx.getStorageSync('userInfo');
	}
})