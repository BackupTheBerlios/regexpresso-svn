/* This script and many more are available free online at
The JavaScript Source!! http://javascript.internet.com
Created by: Ultimater | http://webdeveloper.com/forum/member.php?u=30185 */
function html_entity_decode(str) {
  var ta=document.createElement("textarea");
  ta.innerHTML=str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return ta.value;
}
