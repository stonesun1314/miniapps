/*
 * 
 * WordPres版微信小程序
 * 
 */

var HOST_URI = 
//'https://wxapp.seeland-wood.com/wc-api/v3/';
'https://www.seeland-wood.com/wc-api/v3/';


var GET_PAGE='pages';

//此处修改秘钥
/*
 * var consumerKeyAndSecrect = 'consumer_key=ck_ccfb62936c5213886a242134a247216d9640ef41&consumer_secret=cs_26bb0d75caf96e39297509368418362771e5dd63';
 *
 */
var consumerKeyAndSecrect = 'consumer_key=ck_e8aa62ada95869e7a0c73b15703d89297904ec01&consumer_secret=cs_58ddaf0cc07bbf220978390d464491b096368ff6';




function obj2uri (obj) {
    return Object.keys(obj).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
    }).join('&');
}

//匹配多媒体文件
function checkSuffix(str) {
  var strRegex = "(.ico|.png|.gif|.jpg|.mp4|.avi|.mkv|.flv)"; //用于验证图片扩展名的正则表达式
  var re = new RegExp(strRegex);
  if (re.test(str.toLowerCase())) {
    return true;
  } else {
    console.log("文件名不合法");
    return false;
  }
}

// function checkSuffix(str) {
//   var strRegex = "(.ico|.png|.gif|.jpg|.mp4|.avi|.mkv|.flv)$"; //用于验证图片扩展名的正则表达式
//   var re = new RegExp(strRegex);
//   if (re.test(str.toLowerCase())) {
//     return true;
//   } else {
//     console.log("文件名不合法");
//     return false;
//   }
// }

// }


module.exports = {
    // 获取文章列表数据
  getTopics: function (obj) {
      if (obj.category !=0)
      {
        return HOST_URI + 'posts?per_page=8&  categories=' + obj.category+'&' + obj2uri(obj);
      }
      else
      {
        return HOST_URI + 'posts?per_page=8&' + obj2uri(obj);
      }  
    },
    
    // 获取内容页数据
    getTopicByID: function (id, obj) {
      return HOST_URI + 'posts/' + id;
    },
    // 获取页面列表数据
    getPages: function (id, obj) {
        return HOST_URI +'pages';
    },  

    //获取商品数据
    getProductDetailById: function(id){
      return HOST_URI + 'products/' +id + '?' +     consumerKeyAndSecrect;
    },

    //获得商品数据
    getProducts: function(){
      return HOST_URI + 'products?' + consumerKeyAndSecrect;
    } ,

    getProductCount: function(){
      return HOST_URI + 'products/count?' + consumerKeyAndSecrect;
    },

    // 获取页面列表数据
    getPageByID: function (id, obj) {
      return HOST_URI + 'pages/' + id;
    },
    //获取分类列表
    getCategories: function () {
      return HOST_URI + 'products/categories?' + consumerKeyAndSecrect;
      //' https://wxapp.seeland-wood.com/wc-api/v2/products/categories?consumer_key=ck_c5288a78989c978efecfa87f14a2453cccb65790&consumer_secret=cs_27b6fec8b9dbec4100ef44793f469e24c2125756';
    },
    //获取评论
    getComments: function (id, obj) {
      return HOST_URI + 'comments?orderby=date&order=asc&post=' + id
    },



  // replaceMediaServer: function (s)
  // {
  //   return s.replace("https://www.seeland-wood.com", "https://cdn.seeland-wood.com");

  // }
  //替换多媒体文件
replaceMediaServer: function(s) {

  if (checkSuffix(s)) {
    return s.replace("https://www.seeland-wood.com", "https://cdn.seeland-wood.com");
  }

  return s;

}

    
};