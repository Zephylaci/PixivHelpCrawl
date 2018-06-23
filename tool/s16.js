
//字符串转16进制
function strToHexCharCode(str) {
  　　if(str === "")
  　　　　return "";
  　　var hexCharCode = [];
  　　hexCharCode.push("0x"); 
  　　for(var i = 0; i < str.length; i++) {
  　　　　hexCharCode.push((str.charCodeAt(i)).toString(16));
  　　}
  　　return hexCharCode.join("");
  }
//16进制转字符串
  function hexCharCodeToStr(hexCharCodeStr) {
    　　var trimedStr = hexCharCodeStr.trim();
    　　var rawStr = 
    　　trimedStr.substr(0,2).toLowerCase() === "0x"
    　　? 
    　　trimedStr.substr(2) 
    　　: 
    　　trimedStr;
    　　var len = rawStr.length;
    　　if(len % 2 !== 0) {
    　　　　alert("Illegal Format ASCII Code!");
    　　　　return "";
    　　}
    　　var curCharCode;
    　　var resultStr = [];
    　　for(var i = 0; i < len;i = i + 2) {
    　　　　curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    　　　　resultStr.push(String.fromCharCode(curCharCode));
    　　}
    　　return resultStr.join("");
    }

  module.exports={
    strToHexCharCode,
    hexCharCodeToStr
  }