// pages/coupon/coupon.js
const app = getApp();

Page(Object.assign({}, app.Methods, {
	data: Object.assign({}, app.Variables, {
		btnEnabled: false,
		coupons: null
	}),
	couponInput(e) {
		this.setData({ btnEnabled: e.detail.value.length > 0 });
	},
	couponSubmit(e) {
		var coupon = '';
		// 表单提交
		if (typeof e.detail.value == 'object') {
			coupon = e.detail.value.coupon;
		}
		// 输入框完成提交
		else {
			coupon = e.detail.value;
		}

		if (coupon == '') return;

		var address_param = app.getAddressParam(),
			shipping_method_param = app.getShippingMethodParam(),
			applied_coupons = app.getCouponParam('applied_coupons');


		app.Util.network.POST({
			url: app.API('apply_coupon'),
			params: Object.assign(
				{},
				address_param,
				shipping_method_param,
				applied_coupons,
				{
					w2w_session: app.data.w2w_session,
					coupon_code: coupon
				}
			),
			success: data => {
				var toast = {};
				toast.title = data.success ? data.success : data.error;
				toast.icon = 'none';
				wx.showToast(toast);

				if (data.success) {
					app.data.coupons.push(coupon);
					app.data.coupons = app.Util.unique(app.data.coupons);
				}

				app.updateCart(data.cart);
				app.data.shipping = data.shipping;

				this.setData({ coupons: data.coupons });
			}
		});
	},
	onLoad(options) {

		this.setData({ currency: app.data.currency });

		var coupon_param = app.getCouponParam();
		if (coupon_param.length == 0) return;

		app.Util.network.GET({
			url: app.API('get_coupon'),
			params: coupon_param,
			success: data => {
				this.setData({ coupons: data });
			}
		});
	},
	onShow() {

	},
	onPullDownRefresh() {
		this.onLoad();
	},
	onReachBottom() {

	}
}))