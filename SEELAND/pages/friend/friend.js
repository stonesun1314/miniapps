/*
 * 
 * WordPres版微信小程序
 * author: jianbo
 * organization: 守望轩  www.watch-life.net
 * github:    https://github.com/iamxjb/winxin-app-watch-life.net
 * 技术支持微信号：iamxjb
 * 开源协议：MIT
 * 
 *  *Copyright (c) 2017 https://www.watch-life.net All rights reserved.
 */

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp()
var html2json = require('../../wxParse/html2json.js');

Page({
  data: {
    title: '文章列表',
    postsList: {},
    pagesList: {},
    categoriesList: {},
    postsShowSwiperList: {},
    lastLoadTime: 0,
    isLastPage: false,
    userInfo: {},
    page: 1,
    search: '',
    categories: "96",


    scrollHeight: 0,
    imageHeight: 0,

    displaySwiper: "block",
    floatDisplay: "none",

    listHeader: "",




    //  侧滑菜单
    maskDisplay: 'none',
    slideHeight: 0,
    slideRight: 0,
    slideWidth: 0,
    slideDisplay: 'block',
    screenHeight: 0,
    screenWidth: 0,
    slideAnimation: {}


  },
  formSubmit: function (e) {
    var url = '../list/list'
    if (e.detail.value.input != '') {
      url = url + '?search=' + e.detail.value.input;
    }
    wx.navigateTo({
      url: url
    })
  },
  play: function (e) {
    var id = e.currentTarget.id;
    var videourl = e.currentTarget.dataset.url;
    var url = '../video/video?id=' + id+'&url='+videourl;
    wx.navigateTo({
      url: url
    })

  },
  post: function () {
    var url = '../comment/comment';
    wx.navigateTo({
      url: url
    })
  },

  previewImg: function (e) {
    console.log(e);
    wx.previewImage({
      current: e.currentTarget.dataset.imgurl,
      urls: e.currentTarget.dataset.imgurl,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '“超有味儿-精彩短视频”',
      path: 'pages/friend/friend',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /*点赞功能 */
  iLike: function (e) {

    var that = this;
    var id = e.currentTarget.id;
    wx.getUserInfo({
      success: function (res) {
        console.log(res);
        that.setData({
          userInfo: res.userInfo,
        })
      }
    })
    console.log(that.data.userInfo)
    wx.request({
      url: "https://www.isuperfm.com/wp-admin/admin-ajax.php",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        action: "like",
        um_id: id,
        um_action: "hasLike",
        userurl: that.data.userInfo.nickName,
      },
      success: function (res) {
        console.log('点赞量记录成功');
        wx.showToast({
          title: '已点赞',
          icon: 'success',
          duration: 2000
        });
        that.setData({
          zanstyle: 'zangreen',
          zantxt: '您已赞',
        });

      },
      fail: function (res) {
        console.log('点赞量记录失败');
      },
      complete: function (res) {
        console.log('点赞量记录完成');
      }
    });
  },
  /*点赞功能结束 */

  lower: function (e) {
     console.log("1");
    var curTime = e.timeStamp;
    var lastTime = this.data.lastLoadTime;
    if (curTime - lastTime < 500) {
      console.log('晚点加载');
      return;
    }
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
    this.setData(
      {
        lastLoadTime: curTime
      }
    );
  },
  onLoad: function (options) {
    var self = this;

    if (options.categoryID && options.categoryID != 0) {
      self.setData({
        categories: options.categoryID,
        listHeader: "分类：'" + options.categoryName + "'的文章"
      })
    }
    self.fetchPostsData(self.data);
    wx.login({
      success: function (res) {
        console.log(res);
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://www.isuperfm.com/code.php',
            data: {
              code: res.code
            },
            success: function (res) {
              self.setData({
                openid: res.data.openid,
              })
            }
          })
        }
        wx.getUserInfo({
          success: function (res) {
            console.log(res);
            self.setData({
              userInfo: res.userInfo,
            })
            console.log(self.data.openid);
          }
        })
      }
    })

    wx.getSystemInfo({
      success: function (res) {
        //console.info(res.windowHeight);
        self.setData({
          scrollHeight: res.windowHeight,
          screenWidth: res.windowWidth,
          slideHeight: res.windowHeight,
          slideRight: res.windowWidth,
          slideWidth: res.windowWidth * 0.7
        });
      }
    });
  },
  //获取文章列表数据
  fetchPostsData: function (data) {
    var self = this;


    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = '190';
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };



    wx.showLoading({
      title: '加载中',
    })

    wx.request({
      url: Api.getfriend(data),
      success: function (response) {
        if (response.statusCode === 200) {

          console.log(response);
          self.setData({
            //postsList: response.data

            floatDisplay: "block",
            postsList: self.data.postsList.concat(response.data.posts.map(function (item) {
              //var strSummary = util.removeHTML(item.content.rendered);
              // item.summary = util.cutstr(strSummary, 200, 0);
              var that = this;
              var strdate = item.date

              if (item.category_name != null) {

                item.categoryImage = "../../images/topic.png";
              }
              else {
                item.categoryImage = "";
              }
              if (item.custom_fields.useruserurl) {
                var useurl = item.custom_fields.useruserurl[0];
                item.userurl = useurl.split(",");
              }

              item.userurl = true;

              if (item.custom_fields.useruserurl) {
                item.userurl = false;

                item.url = util.cutstr(item.custom_fields.useruserurl.toString(), 40, 1) + '...'
              }



              item.post_thumbnail_image = Api.getContentFirstImage(item.content);

              item.images = html2json.html2json(item.content).imageUrls;
              item.count = item.images.length;
              item.imagecount = 1;
              item.imageHeight = (self.data.screenWidth - 20) / 3;
              if (item.images.length == 1) {
                item.imagecount = 0;
                item.imageHeight = (self.data.screenWidth - 20) / 2;
              }
              if (item.images.length > 6 && item.images.length < 9) {
                item.images = item.images.slice(0, 6);
              }
              if (item.images.length > 3 && item.images.length < 6) {
                item.images = item.images.slice(0, 3);
              }
              if (item.images.length > 9) {
                item.images = item.images.slice(0, 9);
              }
              if (!item.custom_fields.like) {
                item.custom_fields.like = 0;
              }
              var strSummary = util.removeHTML(item.content);
              item.short = util.cutstr(strSummary, 65, 0);
              item.date = util.cutstr(strdate, 10, 1);
              return item;
            })),

          });

          if (data.page == 1) {
            self.fetchCategoriesData();
          }

          setTimeout(function () {
            wx.hideLoading();
            wx.showToast({
              title: '加载完毕',
              icon: 'success',
              duration: 900
            })
          }, 900);

        }
        else {
          if (response.data.code == "rest_post_invalid_page_number") {

            self.setData({
              isLastPage: true
            });
            wx.showToast({
              title: '没有更多内容',
              mask: false,
              duration: 1500
            });
          }
          else {
            wx.showToast({
              title: response.data.message,
              duration: 1500
            })
          }
        }


      }
    });
  },

  redictDetail: function (e) {
    console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  //获取页面列表
  fetchPagesData: function () {
    var self = this;
    wx.request({
      url: Api.getPages(),
      success: function (response) {
        self.setData({
          pagesList: response.data
        });
      }
    });
  },

  fresh: function () {
    this.setData({
      postsList: {},
      page:1,
    });
    this.fetchPostsData(this.data);
  },
  //获取分类列表
  fetchCategoriesData: function () {
    var self = this;
    wx.request({
      url: Api.getCategories(),
      success: function (response) {
        self.setData({
          categoriesList: response.data
        });
      }
    });
  },


  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  onShow: function () {
  },

  //跳转至某分类下的文章列表
  redictIndex: function (e) {
    //console.log('查看某类别下的文章');  
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.item;
    var url = '../list/list?categoryID=' + id + '&categoryName=' + name;
    wx.navigateTo({
      url: url
    });
  },

  //跳转至某分类下的文章列表
  redictHome: function (e) {
    //console.log('查看某类别下的文章');  
    var id = e.currentTarget.dataset.id,
      url = '/pages/index/index';

    wx.switchTab({
      url: url
    });
  },



})


4