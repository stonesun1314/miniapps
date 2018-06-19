// pages/shipping-detail/shipping-detail.js
const app = getApp();

Page(Object.assign({}, app.Methods, {
	data: Object.assign({}, app.Variables, {
		order_id: null,
		order: null
	}),
	// 复制快递单号
	copyShippingCode(e) {
		var code = e.currentTarget.dataset.code;
		app.Util.setClipboard(code);
	},
	onLoad(options) {
		app.Util.network.GET({
			url: app.API('order_detail') + options.order_id,
			params: {
				w2w_session: app.data.w2w_session
			},
			success: data => {
				this.setData({ order_id: options.order_id, order: data });
			}
		});
	},
	onShow() {

	},
	onPullDownRefresh() {
		this.onLoad({ order_id: this.data.order_id });
	},
	onReachBottom() {

	}
}))