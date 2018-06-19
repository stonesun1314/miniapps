// pages/category/category.js
const app = getApp();

Page(Object.assign({}, app.Methods, {
	data: Object.assign({}, app.Variables, {
		categories: []
	}),
	goFeatureProducts() {
		wx.navigateTo({
			url: '../../pages/product-list/product-list?mode=featured'
		})
	},
	goOnSaleProducts() {
		wx.navigateTo({
			url: '../../pages/product-list/product-list?mode=sale'
		})
	},
	goCategoryProducts(e) {
		var id = e.currentTarget.dataset.id,
			name = e.currentTarget.dataset.name;
		wx.navigateTo({
			url: '../../pages/product-list/product-list?mode=category&id=' + id + '&name=' + name
		})
	},
	onLoad(options) {
		app.Util.network.GET({
			url: app.API('category'),
			// 2018-03-16 添加 pre_page 参数获取所有分类
			params: {
				per_page: 0
			},
			success: data => {
				this.setData({ 'categories': data });
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