// pages/product-list/product-list.js
const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.TopTips, app.Methods, {
	data: Object.assign({}, app.Variables, {
		products: null,
		bottomStyle: 'loading',
		/*****************
	     * 备注3
	     * *******************
	    */

	    textFenlei:"#000",
	    textShaixuan: "#000",
	    tabFenlei:"none",
	    tabShaixuan:"none",
	    /********************** */


		categorySlug: 0,
	    queryFliter: 0,
	    lengthFilter: 0,
	    widthFilter: 0,
	    heightFilter: 0,
	    modelingFilter: 0,
	    patternFilter: 0,
	  
	    itemsL: [
	      { name: 'Length1', title: '2000以下', value: '2000'},
	      { name: 'Length2', title: '2000~3000\n', value: '20003000'},
	      { name: 'Length3', title: '3000~4000', value: '30004000'},
	      { name: 'Length4', title: '4000以上', value: '4000' },

	    ]
	    ,
	    itemsW: [
	      { name: 'wdith1', title: '600以下', value: '600'},
	      { name: 'wdith2', title: '600~700', value: '600700'},
	      { name: 'wdith3', title: '700~800\n', value: '700800'},
	      { name: 'wdith4', title: '800~900', value: '800900'},
	      { name: 'wdith5', title: '900~1000', value: '9001000'},
	      { name: 'wdith6', title: '1000以上', value: '1000' },

	    ]
	    ,
	    itemsH: [
	      { name: 'height1', title: '50以下', value: '50'},
	      { name: 'height2', title: '50~70', value: '5070'},
	      { name: 'height3', title: '70~100\n', value: '70100'},
	      { name: 'height4', title: '100以上', value: '100'},

	    ],

	    itemsM: [
	      { name: 'modeling1', title: '大板Slab', value: 'general'},
	      //{ name: 'modeling2', title: '特殊Special\n', value: 'special'},
	      { name: 'modeling3', title: '双拼Dual-plank\n', value: 'dualplank' },
	      { name: 'modeling4', title: '三拼Triple-plank', value: 'tripleplank' },
	      { name: 'modeling4', title: '多拼Multi-plank\n', value: 'multiplank' },
	      { name: 'modeling5', title: '树瘤Burl\n', value: 'burl' },

	    ],

	    itemsP: [
	      { name: 'pattern1', title: '普通General', value: 'general'},
	      { name: 'pattern3', title: '精品Supreme\n', value: 'supreme' },
	      { name: 'pattern2', title: '特殊Special\n', value: 'special'},
	    ],


	}),		
	page: 1,
	title: '',
	url: 'product_list',
	params: {},
	options: null,
	goProductDetail(e) {
		app.goProductDetail(e);
	},
	addToCart(e) {
		this.doAddToCart(e, () => {
			this.setData({ cart_quantity: app.data.cart_quantity });
		});
	},

   // ******************
   // * Begin of 备注4 *
   // ******************
   
  openFenlei: function() {
    this.setData({
      textFenlei: !this.data.textFenlei,
      textShaixuan: "#000",
      tabFenlei: !this.data.tabFenlei,
      tabShaixuan: "none",
    })
  },
  openShaixuan: function () {
    this.setData({
      textFenlei: "#000",
      textShaixuan: !this.data.textShaixuan,
      tabFenlei: "none",
      tabShaixuan: !this.data.tabShaixuan,
    })
  },
  // End of备注4


	goCart: () => {
		wx.switchTab({
			url: '../../pages/cart/cart'
		})
	},
	goTop() {
		wx.pageScrollTo({
			scrollTop: 0
		})
	},
	loadData() {
		var params;
		switch (this.options.mode) {
			case 'all':
				this.title = '所有产品';
				break;
			case 'search':
				this.url = 'product_search';
				this.title = '搜索 "' + this.options.search + '"';
				this.params.term = this.options.search;
				break;
			case 'category':
				this.title = decodeURIComponent(this.options.name);
				this.params.category = this.options.id;
				break;
			case 'featured':
				this.title = '精选产品';
				this.params.featured = true;
				break;
			case 'sale':
				this.title = '促销产品';
				this.params.sale = true;
				break;
		}
		if (this.title != 'undefined') {
			wx.setNavigationBarTitle({
				title: this.title,
			})
		}

		app.Util.network.GET({
			url: app.API(this.url),
			params: this.params,
			success: data => {
				wx.showLoading({
					title: '正在加载',
				})

				var products = this.data.products;
				for (var i = 0; i < data.length; i++) {
					products.push(data[i]);
				}

				this.setData({
					products: products
				}, () => {
					wx.hideLoading();
				});
				if (this.page == 1 && data.length == 0) {
					wx.showToast({
						icon: 'none',
						title: '暂无产品'
					})
				}
				if (data.length > 0) {
					this.page++;
					this.params.page = this.page;
				}
				else {
					this.setData({ bottomStyle: 'nomore' });
				}

			}
		});
	},
	onLoad(options) {

		if (app.data.cart != null) {
			wx.showLoading({
				title: '正在加载',
				mask: true
			})
			this.setData({
				cart: app.data.cart
			}, () => {
				wx.hideLoading();
			});
		}
		else {
			app.checkLogin({
				success: () => {
					app.refreshCart(cart => {
						this.setData({ cart_quantity: app.data.cart_quantity });
					});
				}
			})
		}

		this.options = options;
		this.page = 1;
		this.params = { page: this.page };
		this.setData({
			currency: app.data.currency,
			products: [],
			bottomStyle: 'loading'
		});
		this.loadData();
	},
	onShow() {
		this.setData({ cart_quantity: app.data.cart_quantity });
	},
	onPullDownRefresh() {
		this.onLoad(this.options);
	},
	onReachBottom() {
		if (this.data.bottomStyle != 'nomore') {
			this.loadData();
		}
	},
	onShareAppMessage() {

	}
}))