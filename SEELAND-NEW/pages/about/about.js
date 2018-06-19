// pages/about/about.js
const app = getApp();

Page(Object.assign({}, app.Methods, {
	data: Object.assign({}, app.Variables, {

	}),
	onLoad(options) {
		this.setData({ version: app.data.version });
	},
	onShow() {

	},
	onPullDownRefresh() {

	},
	onReachBottom() {

	},
	onShareAppMessage() {

	}
}))