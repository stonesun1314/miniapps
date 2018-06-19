/*
 * 
 * WordPres版微信小程序
 */

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();

Page({
  data: {
    title: '文章列表',
    categoriesList: [],
    productsList: [],
    productCount: 0,
    requestComplete: false,
    hidden: false,
    noMoreProduct: false,

    scrollH: 0,
    imgWidth: 0,
    loadingCount: 0,
    images: [],
    col1: [],
    col2: [],
    page: 1,

    //  侧滑菜单
    maskDisplay: 'none',
    slideHeight: 0,
    slideRight: 0,
    slideWidth: 0,
    slideDisplay: 'block',
    screenHeight: 0,
    screenWidth: 0,
    slideAnimation: {},
    
    //控制回到顶部
    scrollTop: 0,
    floorstatus: false,

    //筛选
    fliterDisplay: 'none',
    fliterAnimation: {},

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
      { name: 'pattern2', title: '特殊Special', value: 'special'},
      { name: 'pattern1', title: 'D系列/D-Series\n', value: 'dseries'}, 
      { name: 'pattern1', title: '成品/Finished', value: 'finished'},  
      { name: 'pattern1', title: '树脂/Resin Finishing', value: 'resin'},      
    ],

    
  },

  onShareAppMessage: function () {
    // categorySlug: 0,
    //   queryFliter: 0,
    //     lengthFilter: 0,
    //       widthFilter: 0,
    //         heightFilter: 0,
    //           modelingFilter: 0,
    //             patternFilter: 0,
    // var self = this;
    // var parameters = 'categorySlug=' + this.data.categorySlug + 
    //   '&queryFliter=' + this.data.queryFliter +
    //   '&lengthFilter=' + this.data.lengthFilter +
    //   '&widthFilter=' + this.data.widthFilter +
    //   '&heightFilter=' + this.data.heightFilter +
    //   '&modelingFilter=' + this.data.modelingFilter +
    //   '&patternFilter=' + this.data.patternFilter;
    // console.log('转发参数' + parameters);
    return {
      title: '熙然黑胡桃',
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onLoad: function (options) {
    this.fetchTopicData(options);
    this.fetchCategoriesData();
    this.fetchProductsCount();
    this.fetchProductsData(this.data.page, this.data.categorySlug);
    
    var that = this;
    console.log('onLoad')
    
    //调用应用实例的方法获取全局数据
   /*
 *  app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    }); */
    wx.getSystemInfo({
      success: function (res) {
        //console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight,
          //screenWidth: res.windowWidth,
          slideHeight: res.windowHeight,
          slideRight: res.windowWidth,
          slideWidth: res.windowWidth * 0.90
        });
      }
    });    
  },

  fetchTopicData: function (options) {
    var self = this;

    //获取传参
    var categorySlug = options.categorySlug;
    var queryFliter = options.queryFliter;
    var lengthFilter = options.lengthFilter;
    var widthFilter = options.widthFilter;
    var heightFilter = options.heightFilter;
    var modelingFilter = options.modelingFilter;
    var patternFilter = options.patternFilter;
    self.setData({
      //hidden: false,
      
      page: 1,
      productsList: [],
      categorySlug: categorySlug,
      queryFliter: queryFliter,
      lengthFilter: lengthFilter,
      widthFilter: widthFilter,
      heightFilter: heightFilter,
      modelingFilter: modelingFilter,
      patternFilter: patternFilter,
    });
  },

  matchQueryParameters: function(){
    var self = this;
    var queryParameters;
    //var categoryPara = '&filter[category]=' + '\"美国黑胡桃\"';
    var categoryPara = '&filter[category]=' + '\"blackwalnut\"';
    var lFilter;
    if (self.data.lengthFilter) {
      lFilter = '&filter[pa_length]=' + self.data.lengthFilter;
    } else {
      lFilter = '';
    }
    var wFilter = '&filter[pa_width]=' + self.data.widthFilter;
    if (self.data.widthFilter) {
      wFilter = '&filter[pa_width]=' + self.data.widthFilter;
    } else {
      wFilter = '';
    }
    var hFilter = '&filter[pa_height]=' + self.data.heightFilter;
    if (self.data.heightFilter) {
      hFilter = '&filter[pa_height]=' + self.data.heightFilter;
    } else {
      hFilter = '';
    }
    var mFilter = '&filter[pa_modeling]=' + self.data.modelingFilter;
    if (self.data.modelingFilter) {
      mFilter = '&filter[pa_modeling]=' + self.data.modelingFilter;
    } else {
      mFilter = '';
    }
    var pFilter = '&filter[pa_pattern]=' + self.data.patternFilter;
    if (self.data.patternFilter) {
      pFilter = '&filter[pa_pattern]=' + self.data.patternFilter;
    } else {
      pFilter = '';
    }
    var qFilter = '&filter[q]=' + self.data.queryFliter;
    if (self.data.queryFliter) {
      qFilter = '&filter[q]=' + self.data.queryFliter;
    } else {
      qFilter = '';
    }
    queryParameters = categoryPara + lFilter + wFilter + hFilter + mFilter + pFilter + qFilter;
    return queryParameters;

  },
  
  //获取商品列表
  fetchProductsData: function(page,category){
    var self = this;
    //数据初始化
    if(self.data.page == 1){
        self.setData({
          productsList: [], 
          
          col1: [],
          col2: [],
          noMoreProduct: false
        });
    }else{

      if(self.data.productsList.length == self.data.productCount){
          self.setData({
            noMoreProduct: true
        });
        
          if (self.data.noMoreProduct){
            return;
          }
      }
    }
    var queryPara = self.matchQueryParameters();
    var fullUrl = Api.getProducts() + '&page=' + page + queryPara;
    console.log('请求商品列表'+fullUrl);
    self.setData({
      hidden: false,
    });
    wx.request({
      url: fullUrl,
      success: function (response) {
        var products = response.data.products;
        // var proCol1 = new Array();
        // var proCol2 = new Array();
        // var j = 0;
        // for( var i = 0;i < products.length;i++){
        //   var productDetail = products[i];
        //   //&& productDetail.in_stock
        //   if (productDetail.status == 'publish'){
        //     if (j % 2 == 0) {
        //       proCol1.push(productDetail);
        //     } else {
        //       proCol2.push(productDetail);
        //     }
        //     j++;
        //   }
        // }
        //替换图片CDN
        for (var i = 0; i < products.length;i++){

          var productDetail = products[i];
          var origin_featured_src = productDetail.featured_src;
          //console.log('图片地址是' + origin_featured_src);
          var target_featured_src = Api.replaceMediaServer(origin_featured_src);
          //console.log('转换后的图片地址' + target_featured_src);
          productDetail.featured_src = target_featured_src;
          //console.log('array' + products[i].featured_src);
          
          var desc = Api.replaceMediaServer(productDetail.description);
          productDetail.description = desc;
          //console.log('descrption' + products[i].description);
         }
        // 获取当前数据进行保存
        var list = self.data.productsList;
        // var col1List = self.data.col1;
        // var col2List = self.data.col2;
        self.setData({
          productsList: list.concat(products), 
          
          
          // col1: col1List.concat(proCol1),
          // col2: col2List.concat(proCol2)
        });
        console.log(self.data.productsList);
        console.log('打印结束');
        setTimeout(function () {
          self.setData({
            hidden: true
          });
        }, 1200);
      }
    });
  },
  
  //获取当前一共有多少商品
  fetchProductsCount: function(){
    var self = this;
    var queryPara = self.matchQueryParameters();
    var fullUrl = Api.getProductCount() + queryPara;
    //console.log('请求商品数量' + fullUrl);
    self.setData({
      requestComplete:false
    });
    wx.request({
      url: fullUrl,
      success: function (response) {
        var count = response.data.count
        self.setData({
          productCount: count,
          requestComplete: true
        });
      }
    });

  },

  //获取分类列表
  fetchCategoriesData: function () {
    var self = this;
    wx.request({
      url: Api.getCategories(),
      success: function (response) {
        var list = response.data.product_categories
        self.setData({
          categoriesList: list
        });
        setTimeout(function () {
          self.setData({
            hidden: true
          });
        }, 1200);        
      }
    });
  },

 // 跳转至查看文章详情
  redictDetail: function (e) {
    console.log('查看文章');
    var id = e.currentTarget.dataset.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  //跳转至某分类下的文章列表
  redictIndex: function (e) {
    console.log('查看某类别下的文章');  
    var slug = e.currentTarget.dataset.slug,
      url = '../index/index?categorySlug=' + slug;
    wx.navigateTo({
      url: url
    })
  },

  makePhoneCall: function () {
    var that = this
    wx.makePhoneCall({
      //phoneNumber: this.inputValue,
      phoneNumber: '076983077775',
      success: function () {
        console.log("成功拨打电话")
      }
    })
  },

  //浮动球移动事件
  ballMoveEvent: function (e) {
    var touchs = e.touches[0];
    var pageX = touchs.pageX;
    var pageY = touchs.pageY;
    if (pageX < 25) return;
    if (pageX > this.data.screenWidth - 25) return;
    if (this.data.screenHeight - pageY <= 25) return;
    if (pageY <= 25) return;
    var x = this.data.screenWidth - pageX - 25;
    var y = this.data.screenHeight - pageY - 25;
    this.setData({
      ballBottom: y,
      ballRight: x
    });
  },

  //浮动球点击 侧栏展开
  ballClickEvent: function () {
    slideUp.call(this);
  },

  //遮罩点击  侧栏关闭
  slideCloseEvent: function () {
    slideDown.call(this);
  },

  //点击打开筛选栏
  fliterOpenEvent: function(){
    fliterOpen.call(this);
  },
  //关闭筛选栏
  fliterCloseEvent: function(){
    fliterClose.call(this);
  },

	onReachBottom:function(){
		this.lower()
	},

  //底部刷新
  lower: function (e) {
    var self = this;
    if (!self.data.requestComplete) {
      return;
    }
    console.log('count:' + self.productCount, 'complete:' + self.data.requestComplete);

    if (self.data.productsList.length == self.data.productCount) {
      self.setData({
        noMoreProduct: true
      });
      if (self.data.noMoreProduct) {
        return;
      }
    }
  
    self.setData({
      page: self.data.page + 1
    });
    console.log('当前页' + self.data.page);
    this.fetchProductsData(self.data.page, self.data.categorySlug);
    /*延时 */
    setTimeout(function () {
    }, 5000);
  },


  goTop: function (e) {
    this.setData({
      scrollTop: 0
    })
  },
  scroll: function (e) {
    if (e.detail.scrollTop > 10) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },

  //根据条件筛选
  fliterClick: function (e) {
    slideDown.call(this);
    var self = this;
    self.setData({
      page: 1
    });
    console.log('当前页' + self.data.page);
    this.fetchProductsData(self.data.page, self.data.categorySlug);
    this.fetchProductsCount();
  },

  //清空筛选条件
  fliterClearClick: function(e){
   console.log(e);

  },

  inputquery: function (e){
    console.log('query发生change事件，携带value值为：', e.detail.value);
    var self = this;
    self.setData({
      queryFliter:e.detail.value
    });
    console.log('queryFliter' + self.data.queryFliter);
  },

  queryEvent: function (e) {
    slideDown.call(this);
    var self = this;
    self.setData({
      page: 1
    });
    console.log('当前页' + self.data.page);
    this.fetchProductsData(self.data.page, self.data.categorySlug);
    this.fetchProductsCount();
  },


  lengthcheckboxChange: function(e){
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    var self = this;
    var lengthValues = e.detail.value;
    var lFilter = 0;
    for (var i = 0; i < lengthValues.length; i++) {
      if (i == 0) {
        lFilter = lengthValues[i];
      } else {
        lFilter = lFilter + ',' + lengthValues[i];
      }
    }
    self.setData({
      lengthFilter: lFilter
    });
    console.log(self.data.lengthFilter);
  },

  widthcheckboxChange: function(e){
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    var self = this;
    var widthValues = e.detail.value;
    var wFilter = 0;
    for (var i = 0; i < widthValues.length; i++) {
      if (i == 0) {
        wFilter = widthValues[i];
      } else {
        wFilter = wFilter + ',' + widthValues[i];
      }
    }
    self.setData({
      widthFilter: wFilter
    });
    console.log(self.data.widthFilter);
  },

  heightcheckboxChange: function(e){
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    var self = this;
    var heightValues = e.detail.value;
    var hFilter = 0;
    for (var i = 0; i < heightValues.length; i++) {
      if (i == 0) {
        hFilter = heightValues[i];
      } else {
        hFilter = hFilter + ',' + heightValues[i];
      }
    }
    self.setData({
      heightFilter: hFilter
    });
    console.log(self.data.heightFilter);
  },

  modelingcheckboxChange: function(e){
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    var self = this;
    var modelingValues = e.detail.value;
    var mFilter = 0;
    for (var i = 0; i < modelingValues.length; i++) {
      if (i == 0) {
        mFilter = modelingValues[i];
      } else {
        mFilter = mFilter + ',' + modelingValues[i];
      }
    }
    self.setData({
      modelingFilter: mFilter
    });
    console.log(self.data.modelingFilter);
  },

  patterncheckboxChange: function(e){
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    var self = this;
    var patternValues = e.detail.value;
    var pFilter = 0;
    for (var i = 0; i < patternValues.length; i++) {
      if (i == 0) {
        pFilter = patternValues[i];
      } else {
        pFilter = pFilter + ',' + patternValues[i];
      }
    }
    self.setData({
      patternFilter: pFilter
    });
    console.log(self.data.patternFilter);
  }


})

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

function fliterOpen(){
  var animation = wx.createAnimation({
    duration: 260
  });
  this.setData({ fliterDisplay: 'block' });
  animation.translateY('100%').step();
  this.setData({
    fliterAnimation: animation.export()
  });
}

function fliterClose(){
  var animation = wx.createAnimation({
    duration: 260
  });
  this.setData({ fliterDisplay: 'none' });
  animation.translateX('-100%').step();
  this.setData({
    fliterAnimation: animation.export()
  });

}


