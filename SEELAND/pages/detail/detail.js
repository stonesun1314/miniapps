/*
 * 
 * WordPres版微信小程序
 * 
 */

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    title: '文章内容',
    detail: [],
    hidden: false,
    wxParseData:[],
    volume:0,
    //控制回到顶部
    scrollTop: 0,
    floorstatus: false

  },


  onLoad: function (options) {
    this.fetchDetailData(options.id);
  },

  fetchDetailData: function (id) {
    var self = this;
    self.setData({
      hidden: false

    });
    wx.request({
      url: Api.getProductDetailById(id),
      success: function (response) {
        console.log(response);
        //替换图片CDN
        var productDetail = response.data.product;
        var origin_featured_src = productDetail.featured_src;
        var target_featured_src = Api.replaceMediaServer(origin_featured_src);
        var desc = Api.replaceMediaServer(productDetail.description);
        productDetail.description = desc;
        productDetail.featured_src = target_featured_src;
        self.setData({ 
          detail: response.data.product, 
          volume: 0,      

          // wxParseData: WxParse.wxParse('article', 'html', response.data.product.description, self, 5)
          wxParseData: WxParse.wxParse('article', 'html', productDetail.description, self, 5)
          
       });

        var volumeFixed = (self.data.detail.dimensions.length * self.data.detail.dimensions.width * self.data.detail.dimensions.height).toFixed(4);
        console.log('volume' + volumeFixed);
        self.setData({
          volume: volumeFixed
        });
      
        setTimeout(function () {
          self.setData({
            hidden: true
          });
        }, 300);

        // 调用API从本地缓存中获取阅读记录并记录
        var logs = wx.getStorageSync('readLogs') || [];
        // 过滤重复值
        if (logs.length > 0) {
          logs = logs.filter(function (log) {
            return log[0] !== id;
          });
        }
        // 如果超过指定数量
        if (logs.length > 19) {
          logs.pop();//去除最后一个
        }
        //{{detail.title}} {{detail.categories}}
        //logs.unshift([id, self.data.detail.title + ' - '+ self.data.detail.categories]);
        logs.unshift([id, self.data.detail.featured_src, self.data.detail.title + ' - ' + self.data.detail.categories]);
        wx.setStorageSync('readLogs', logs);
        //end 
      }
    });  
  },

// 这个详细页分享做成动态分享相关链接。

onShareAppMessage: function () {
    return {
      //title: '熙然桌面板' + this.data.detail.categories.rendered,
	  title: '熙然黑胡桃',
      path: 'pages/detail/detail?id=' + this.data.detail.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

copyLink: function () {
  wx.setClipboardData({
    data: this.data.detail.permalink,
    success: function (res) {
      wx.getClipboardData({
        success: function (res) {
          wx.showToast({
            title: '完成复制',
            icon: 'success',
            duration: 2000
          })
        }
      })
    }
  })
},

  fetchCommentData: function (id) {
    var self = this;
    self.setData({
      hidden: false,
      commentsList: []
    });
    wx.request({
      url: Api.getComments(id, { mdrender: false }),
      success: function (response) {
        self.data.commentsList;        
        self.setData({
          //commentsList: response.data,
          commentsList: self.data.commentsList.concat(response.data.map(function (item) {
            var strSummary = util.removeHTML(item.content.rendered);
            var strdate = item.date
            item.summary = strSummary;
            item.date = util.formatDateTime(strdate);
            return item;
          })),
          commentCount: response.data.length
        });
        setTimeout(function () {
          self.setData({
            hidden: true
          });
        }, 300);
      }
    });
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
  

})
