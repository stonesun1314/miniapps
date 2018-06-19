// pages/index/index.js
const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.TopTips, app.Methods, {
	data: Object.assign({}, app.Variables, {
		currency: null,
		banner: null,
		imgHeights: [],
		imgWidth: 750,
		current: 0,
		lastest_products: null,
		clearSearchShow: false,


    //  侧滑菜单
    maskDisplay: 'none',
    slideHeight: 0,
    slideRight: 0,
    slideWidth: 0,
    slideDisplay: 'block',
    screenHeight: 0,
    screenWidth: 0,
    slideAnimation: {},

    //筛选
    fliterDisplay: 'none',
    fliterAnimation: {},

    itemsL: [
      { name: 'Length1', title: '2000以下', value: '2000' },
      { name: 'Length2', title: '2000~3000\n', value: '20003000' },
      { name: 'Length3', title: '3000~4000', value: '30004000' },
      { name: 'Length4', title: '4000以上', value: '4000' },

    ]
    ,
    itemsW: [
      { name: 'wdith1', title: '600以下', value: '600' },
      { name: 'wdith2', title: '600~700', value: '600700' },
      { name: 'wdith3', title: '700~800\n', value: '700800' },
      { name: 'wdith4', title: '800~900', value: '800900' },
      { name: 'wdith5', title: '900~1000', value: '9001000' },
      { name: 'wdith6', title: '1000以上', value: '1000' },

    ]
    ,
    itemsH: [
      { name: 'height1', title: '50以下', value: '50' },
      { name: 'height2', title: '50~70', value: '5070' },
      { name: 'height3', title: '70~100\n', value: '70100' },
      { name: 'height4', title: '100以上', value: '100' },

    ],

    itemsM: [
      { name: 'modeling1', title: '大板Slab', value: 'general' },
      //{ name: 'modeling2', title: '特殊Special\n', value: 'special'},
      { name: 'modeling3', title: '双拼Dual-plank\n', value: 'dualplank' },
      { name: 'modeling4', title: '三拼Triple-plank', value: 'tripleplank' },
      { name: 'modeling4', title: '多拼Multi-plank\n', value: 'multiplank' },
      { name: 'modeling5', title: '树瘤Burl\n', value: 'burl' },

    ],

    itemsP: [
      { name: 'pattern1', title: '普通General', value: 'general' },
      { name: 'pattern3', title: '精品Supreme\n', value: 'supreme' },
      { name: 'pattern2', title: '特殊Special', value: 'special' },
      { name: 'pattern1', title: 'D系列/D-Series\n', value: 'dseries' },
      { name: 'pattern1', title: '成品/Finished', value: 'finished' },
      { name: 'pattern1', title: '树脂/Resin Finishing', value: 'resin' },
    ],
	}),
	addToCart(e) {
		this.doAddToCart(e);
	},
	// 跳转搜索页
	searchSubmit(e) {

		var search = '';
		// 表单提交
		if (typeof e.detail.value == 'object') {
			search = e.detail.value.search;
		}
		// 输入框完成提交
		else {
			search = e.detail.value;
		}

		if (search == '') {
			wx.showToast({
				title: '请输入搜索内容',
				icon: 'none'
			})
		}
		else {
			wx.navigateTo({
				url: '../product-list/product-list?mode=search&search=' + search
			})
			this.clearSearch();
		}

	},
	// 清空搜索
	clearSearch() {
		this.setData({ search: '', clearSearchShow: false });
	},
	// 搜索输入框输入
	searchInput(e) {
		this.setData({ clearSearchShow: e.detail.value != '' })
	},
	imageLoad(e) {
		// 获取图片真实宽度  
		var imgwidth = e.detail.width,
			imgHeight = e.detail.height,
			// 宽高比  
			ratio = imgwidth / imgHeight;
		// 计算的高度值  
		var viewHeight = 750 / ratio;
		var imgHeight = viewHeight;
		var imgHeights = this.data.imgHeights;
		// 把每一张图片的高度记录到数组里  
		imgHeights.push(imgHeight);
		this.setData({
			imgHeights: imgHeights
		})
	},
	imageChange(e) {
		this.setData({ current: e.detail.current });
	},
	// 轮播图点击
	bannerTap(e) {
		var url = e.currentTarget.dataset.url;
		if (url != '') {
			wx.navigateTo({
				url: url
			})
		}
	},
	// 跳转产品详情页
	goProductDetail(e) {
		app.goProductDetail(e);
	},
	// 跳转所有产品页
	goViewAll() {
		wx.navigateTo({
			url: '../../pages/product-list/product-list?mode=all'
		})
	},

  //浮动球点击 侧栏展开
  ballClickEvent: function () {
    slideUp.call(this);
  },

  //点击打开筛选栏
  fliterOpenEvent: function () {
    fliterOpen.call(this);
  },
  //关闭筛选栏
  fliterCloseEvent: function () {
    fliterClose.call(this);
  },

	onLoad() {
		console.log('index onLoad');
    wx.getSystemInfo({
      success: function (res) {
        //console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight,
          screenWidth: res.windowWidth,
          slideHeight: res.windowHeight,
          slideRight: res.windowWidth,
          slideWidth: res.windowWidth * 0.90
        });
      }
    }); 

		this.setData({ currency: app.data.currency,
      
     });
		app.Util.network.GET({
			url: app.API('index'),
			success: data => {
				this.setData({
					banner: data.banner,
					lastest_products: data.products,
					featured_products: data.featured_products
				});
			}
		});
		if (app.data.cart == null) {
			app.checkLogin({
				success: () => {
					app.refreshCart();
				}
			});
		}
	},
	onPullDownRefresh() {
		this.onLoad();
	},
	onShow() {
		if (app.data.cart != null) {
			app.updateCart(app.data.cart);
		}
	},
	onShareAppMessage() {

	}
}))

//侧栏展开
function slideUp() {
  var animation = wx.createAnimation({
    duration: 260
  });
  this.setData({ maskDisplay: 'block' });
  animation.translateX('100%').step();
  this.setData({
    slideAnimation: animation.export()
  });
}

//侧栏关闭
function slideDown() {
  var animation = wx.createAnimation({
    duration: 260
  });
  animation.translateX('-100%').step();
  this.setData({
    slideAnimation: animation.export()
  });
  this.setData({ maskDisplay: 'none' });
}

function fliterOpen() {
  var animation = wx.createAnimation({
    duration: 260
  });
  this.setData({ fliterDisplay: 'block' });
  animation.translateY('100%').step();
  this.setData({
    fliterAnimation: animation.export()
  });
}

function fliterClose() {
  var animation = wx.createAnimation({
    duration: 260
  });
  this.setData({ fliterDisplay: 'none' });
  animation.translateX('-100%').step();
  this.setData({
    fliterAnimation: animation.export()
  });

}