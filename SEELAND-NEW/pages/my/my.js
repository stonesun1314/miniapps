// pages/my.js

/*
谷歌地图：23.0268144428, 114.0554356392
百度地图：23.0324929505, 114.0620077273
腾讯高德：23.0268200000, 114.0554500000
图吧地图：23.0254013900, 114.0492026200
谷歌地球：23.0294013900, 114.0503126200
北纬N23°01′45.85″ 东经E114°03′1.13″
*/

const app = getApp();

Page(Object.assign({}, app.Methods, {
	data: Object.assign({}, app.Variables, {
		userInfo: null,
		link: 'https://www.seeland-wood.com',
        weixin: 'xiranmuye',
        email: 'info@seeland-wood.com'
	}),
	  onClickGps: function () {
    wx.openLocation({
      type: 'gcj02',
      success: function (res) {
        //var latitude = res.latitude;
        //var longitude = res.longitude;
        wx.openLocation({
          name: '熙然木业',
          address: '东莞市桥头镇大洲社区园禾岭198号',
          latitude: '23.0268200000',
          longitude: '114.0554500000',
          //scale: 17,
          //latitude: latitude,
          //longitude: longitude,
          scale: 18
        })
      },
    })

  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    var animation = wx.createAnimation({
      duration: 300,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
    this.animation = animation;
    animation.opacity(0).rotateX(-100).step();
    this.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.opacity(1).rotateX(0).step();
      this.setData({
        animationData: animation
      })

      //关闭  
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示  
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
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

  copyLink: function () {
    wx.setClipboardData({
      data: this.data.link,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '网址已复制',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  },
  copygzh: function () {
    wx.setClipboardData({
      data: this.data.weixin,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '公众号已复制',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  },
  copyEmail: function () {
    wx.setClipboardData({
      data: this.data.email,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '邮箱已复制',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  },
	goOrderList() {
		wx.navigateTo({
			url: '../../pages/order-list/order-list?status=all',
		})
	},
  goOrderListPanding() {
    wx.navigateTo({
      url: '../../pages/order-list/order-list?status=pending',
    })
  },
  goOrderListProcessing() {
    wx.navigateTo({
      url: '../../pages/order-list/order-list?status=processing',
    })
  },
  goOrderListCompleted() {
    wx.navigateTo({
      url: '../../pages/order-list/order-list?status=completed',
    })
  },
  goOrderListCancelled() {
    wx.navigateTo({
      url: '../../pages/order-list/order-list?status=cancelled',
    })
  },
	goAbout() {
		wx.navigateTo({
			url: '../../pages/about/about',
		})
	},
	onLoad(options) {
		this.setData({ userInfo: app.data.userInfo,
			           version: app.data.version,
		 });
		app.checkLogin({
			fail: () => {
				wx.login({
					success:(res)=>{
						app.data.js_code=res.code
					}
				})
			}
		});
	},
	onShow() {

	},
	onPullDownRefresh() {

	},
	onReachBottom() {

	}
}))