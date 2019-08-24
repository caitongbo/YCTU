/* run.js - 内网页面皆将引入此文件 */
(function() {
  var mainjs = document.createElement("script");
  mainjs.src = "//cqu.pt/common/main.js";
  mainjs.charset = "utf-8";
  if(self === top){
    document.body.appendChild(mainjs);
  }
})();
