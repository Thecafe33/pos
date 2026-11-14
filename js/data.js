/* =====================================================================
   GIÁO TRÌNH Xiǎobù 小步
   ---------------------------------------------------------------------
   Cách thêm bài mới: copy một object bài học và sửa nội dung.
   words:   [chữ Hán, pinyin, nghĩa tiếng Việt, Hán Việt, (câu để đọc - tùy chọn)]
   phrases: [câu, pinyin, nghĩa, ghi chú "người thật nói", (câu để đọc - tùy chọn)]
   chars:   "chữ:pinyin:nghĩa|chữ:pinyin:nghĩa"  → dùng cho bước tập viết
   kind: 'pinyin' → bài luyện thanh điệu (câu hỏi nghe chọn pinyin)
   color của chặng: purple | blue | green | yellow | pink | mint | peach | lav
   track: 'main' (lộ trình chính) | 'fun' (chuyên đề) · requires: id chặng phải xong trước
   ===================================================================== */
window.COURSE = [
/* ───────────────────────── CHẶNG 1 ───────────────────────── */
{ id:'s1', zh:'入门', name:'Nhập môn · Pinyin', short:'Pinyin', color:'purple', track:'main',
  desc:'Thanh điệu, âm khó và biến điệu — nền móng để nghe phim không bị "loạn".',
  lessons:[
  { id:'p1', zh:'声调', title:'Thanh điệu', sub:'mā má mǎ mà', kind:'pinyin',
    desc:'Nghe và phân biệt 4 thanh + thanh nhẹ.',
    intro:`<p>Tiếng Trung có <b>4 thanh + 1 thanh nhẹ</b>. Người Việt có lợi thế vì tiếng mình cũng có thanh!</p>
<ul>
<li><b>Thanh 1 (ā)</b> – ngang, <b>cao</b> và giữ đều. Như thanh ngang nhưng cao hơn.</li>
<li><b>Thanh 2 (á)</b> – đi lên, gần giống <b>dấu sắc</b>.</li>
<li><b>Thanh 3 (ǎ)</b> – xuống thấp rồi lên, gần <b>dấu hỏi</b>. Nói nhanh thường chỉ xuống thấp rồi dừng.</li>
<li><b>Thanh 4 (à)</b> – rơi mạnh từ cao xuống thấp, dứt khoát như đang ra lệnh. <i>Không phải dấu nặng</i>, đừng "nuốt" âm.</li>
<li><b>Thanh nhẹ (a)</b> – ngắn, nhẹ, không dấu.</li>
</ul><p>Chạm vào chữ để nghe. Xem thêm biểu đồ thanh ở mục <b>拼</b> trên thanh công cụ.</p>`,
    words:[
      ['妈妈','māma','mẹ',''],['爸爸','bàba','bố',''],['马','mǎ','con ngựa','mã'],['骂','mà','mắng, chửi','mạ'],
      ['吗','ma','(cuối câu → thành câu hỏi)',''],['八','bā','số 8','bát'],['谢谢','xièxie','cảm ơn','tạ tạ'],['好','hǎo','tốt, khỏe','hảo'],
      ['你','nǐ','bạn, anh, chị','nễ'],['我','wǒ','tôi, mình','ngã'],['好的','hǎo de','được, OK',''],['不客气','bú kèqi','không có gì (đáp lời cảm ơn)','']],
    phrases:[
      ['你好！','Nǐ hǎo!','Xin chào!','Câu chào chuẩn. Bạn bè thân thì người Trung hay gọi tên luôn hoặc nói "嗨" (hāi).'],
      ['谢谢！','Xièxie!','Cảm ơn!','Chữ thứ hai đọc thanh nhẹ: xiè-xie.'],
      ['不客气。','Bú kèqi.','Không có gì.','Đời thường hay nói gọn: "没事" (méi shì) hoặc "不用谢".'],
      ['妈妈，你好吗？','Māma, nǐ hǎo ma?','Mẹ ơi, mẹ khỏe không?','Ghép 3 từ vừa học: 妈妈 + 你好 + 吗 (thêm 吗 cuối câu là thành câu hỏi).'],
      ['好的。','Hǎo de.','Được / OK.','Cực phổ biến khi đồng ý. Nhắn tin hay viết "好滴" hoặc "OK".']],
    chars:'妈:mā:mẹ (妈妈)|马:mǎ:ngựa|好:hǎo:tốt|你:nǐ:bạn' },

  { id:'p2', zh:'发音', title:'Âm khó', sub:'zh ch sh r · j q x · ü', kind:'pinyin',
    desc:'Uốn lưỡi, bật hơi và âm ü — so sánh với tiếng Việt.',
    intro:`<p>So với tiếng Việt (gần đúng):</p><ul>
<li><b>zh</b> ≈ "tr" uốn lưỡi · <b>ch</b> ≈ "tr" + bật hơi · <b>sh</b> ≈ "s" uốn lưỡi · <b>r</b> ≈ "r" nhẹ, gần "gi"</li>
<li><b>z</b> ≈ "ch" đầu lưỡi (ts) · <b>c</b> ≈ "ts" bật hơi · <b>s</b> ≈ "x"</li>
<li><b>j</b> ≈ "ch" (chi) · <b>q</b> ≈ "ch" bật hơi · <b>x</b> ≈ "x" mặt lưỡi</li>
<li><b>b d g</b> ≈ "p t c" (không bật hơi) · <b>p t k</b> = bật mạnh hơi</li>
<li><b>ü</b> ≈ "uy" tròn môi · <b>e</b> ≈ "ưa/ơ" · <b>-i</b> sau zh ch sh r z c s đọc ≈ "ư" (是 ≈ "sư")</li></ul>
<p>👉 Bảng đầy đủ có âm mẫu ở mục <b>拼 Pinyin</b>.</p>`,
    words:[
      ['知道','zhīdào','biết','tri đạo'],['吃','chī','ăn','ngật'],['是','shì','là, đúng','thị'],['热','rè','nóng','nhiệt'],
      ['字','zì','chữ','tự'],['菜','cài','món ăn; rau','thái'],['四','sì','số 4','tứ'],['十','shí','số 10','thập'],
      ['去','qù','đi (đến)','khứ'],['鱼','yú','cá','ngư'],['谁','shéi','ai','thùy'],['人','rén','người','nhân'],
      ['什么','shénme','cái gì','thập ma'],['越南','Yuènán','Việt Nam','Việt Nam'],['还是','háishi','hay là; vẫn','hoàn thị'],['名字','míngzi','tên','danh tự'],
      ['阿明','Ā Míng','Minh (tên)','']],
    phrases:[
      ['我是越南人。','Wǒ shì Yuènán rén.','Mình là người Việt Nam.',''],
      ['你叫什么名字？','Nǐ jiào shénme míngzi?','Bạn tên là gì?','Vẫn dùng được. Lịch sự kiểu người lớn: "怎么称呼？" (Zěnme chēnghu? – Xưng hô thế nào ạ?)'],
      ['我叫阿明。','Wǒ jiào Ā Míng.','Mình tên là Minh.','Thêm "阿" trước tên nghe thân mật, kiểu miền Nam Trung Quốc.'],
      ['你知道吗？','Nǐ zhīdào ma?','Bạn biết không?','Hay dùng để mở đầu kể chuyện, "hóng" chuyện.'],
      ['十四还是四十？','Shísì háishi sìshí?','14 hay 40?','Câu luyện lưỡi kinh điển: sh (uốn lưỡi) khác s (thẳng lưỡi).']],
    chars:'是:shì:là|吃:chī:ăn|十:shí:mười|人:rén:người' },

  { id:'p3', zh:'变调', title:'Biến điệu', sub:'不 · 一 · 3+3', kind:'pinyin',
    desc:'Quy tắc đổi thanh mà phim nói liên tục.',
    intro:`<ul>
<li><b>3 + 3 → 2 + 3</b>: 你好 viết nǐ hǎo nhưng đọc <b>ní hǎo</b>.</li>
<li><b>不 bù</b> trước thanh 4 → <b>bú</b>: 不是 bú shì, 不要 bú yào.</li>
<li><b>一 yī</b> trước thanh 4 → <b>yí</b> (一个 yí ge); trước thanh 1/2/3 → <b>yì</b> (一起 yìqǐ). Đứng một mình hoặc đếm số vẫn là yī.</li>
<li><b>Thanh nhẹ</b>: âm cuối của nhiều từ đọc nhẹ, ngắn: 朋友 péngyou, 东西 dōngxi.</li></ul>
<p>Trong app, pinyin của 不 và 一 được ghi theo cách đọc thực tế.</p>`,
    words:[
      ['不','bù','không','bất'],['不是','bú shì','không phải','bất thị'],['一','yī','số 1','nhất'],['一个','yí ge','một cái','nhất cá'],
      ['一起','yìqǐ','cùng nhau','nhất khởi'],['很好','hěn hǎo','rất tốt','ngận hảo'],['朋友','péngyou','bạn bè','bằng hữu'],['东西','dōngxi','đồ, đồ vật','đông tây'],
      ['没有','méiyǒu','không có; chưa','một hữu'],['吧','ba','nhé, đi (rủ, đoán)',''],['说','shuō','nói',''],['吃饭','chīfàn','ăn cơm','ngật phạn'],
      ['意思','yìsi','ý nghĩa','ý tứ'],['没事儿','méi shìr','không sao đâu','']],
    phrases:[
      ['不是吧？！','Bú shì ba?!','Không phải chứ?! / Thật hả trời?!','Phản ứng ngạc nhiên cực hay gặp trong phim.'],
      ['不好意思。','Bù hǎoyìsi.','Ngại quá / Xin lỗi (nhẹ).','Đời thường dùng nhiều hơn 对不起. Dùng khi chen ngang, nhờ vả, làm phiền.'],
      ['没事儿。','Méi shìr.','Không sao đâu.','"儿" uốn lưỡi kiểu Bắc Kinh. Miền Nam Trung Quốc nói "没事".'],
      ['一起吃饭吧！','Yìqǐ chīfàn ba!','Đi ăn cùng nhau đi!',''],
      ['你说什么？','Nǐ shuō shénme?','Bạn nói gì cơ?','Lên giọng cuối câu khi không nghe rõ; nói gằn giọng thì thành "Mày nói cái gì?!" trong phim.']],
    chars:'不:bù:không|一:yī:một|没:méi:không có' }
  ]},

/* ───────────────────────── CHẶNG 2 ───────────────────────── */
{ id:'s2', zh:'生存', name:'Sơ cấp · Giao tiếp sinh tồn', short:'Sinh tồn', color:'blue', track:'main', requires:'s1',
  desc:'Chào hỏi, tiền bạc, ăn uống, mua sắm, đi lại, hẹn giờ — đủ để sống ở Trung Quốc.',
  lessons:[
  { id:'b1', zh:'打招呼', title:'Chào hỏi', sub:'早 · 吃了吗 · 拜拜',
    desc:'Cách người Trung chào nhau thật sự, không phải "你好吗".',
    words:[
      ['早','zǎo','sớm; chào buổi sáng','tảo'],['早上好','zǎoshang hǎo','chào buổi sáng','tảo thượng hảo'],['嗨','hāi','hi, chào',''],['拜拜','báibái','bye bye',''],
      ['回头见','huítóu jiàn','gặp lại sau','hồi đầu kiến'],['晚安','wǎn\'ān','chúc ngủ ngon','vãn an'],['最近','zuìjìn','dạo này','tối cận'],['怎么样','zěnmeyàng','thế nào','chẩm ma dạng'],
      ['还行','hái xíng','cũng được','hoàn hành'],['忙','máng','bận','mang'],['了','le','rồi (đã xong / đã đổi)',''],['啊','a','à, nhỉ (cảm thán)',''],
      ['儿','r','(âm cuối uốn lưỡi, giọng Bắc Kinh)',''],['死','sǐ','chết','']],
    phrases:[
      ['早啊！','Zǎo a!','Chào buổi sáng!','Người Trung chào sáng thường chỉ nói "早" — "早上好" nghe hơi trang trọng.'],
      ['吃了吗？','Chī le ma?','Ăn cơm chưa?','Lời chào xã giao, không phải hỏi thật. Đáp: "吃了，你呢？"'],
      ['去哪儿啊？','Qù nǎr a?','Đi đâu đấy?','Chào hàng xóm, đồng nghiệp — y như "đi đâu đấy" của mình.'],
      ['最近怎么样？','Zuìjìn zěnmeyàng?','Dạo này sao rồi?','Tự nhiên hơn "你好吗？" (câu sách giáo khoa ít người dùng).'],
      ['还行吧。','Hái xíng ba.','Cũng tạm.','Câu đáp siêu phổ biến thay cho "我很好".'],
      ['忙死了！','Máng sǐ le!','Bận chết đi được!','"…死了" = phóng đại, dùng cực nhiều.'],
      ['拜拜，回头见！','Báibái, huítóu jiàn!','Bye, gặp sau nhé!','']],
    chars:'早:zǎo:sớm|见:jiàn:gặp|安:ān:an|忙:máng:bận' },

  { id:'b2', zh:'数字和钱', title:'Số đếm & tiền', sub:'一二三 · 块 · 多少钱',
    desc:'Đếm số, hỏi giá, trả giá, quét mã thanh toán.',
    intro:`<ul>
<li>1–10: 一 二 三 四 五 六 七 八 九 十 <span class="py">yī èr sān sì wǔ liù qī bā jiǔ shí</span></li>
<li>11 = 十一 · 20 = 二十 · 99 = 九十九</li>
<li>"Hai" + lượng từ dùng <b>两</b>: 两个人, 两块钱 (không nói 二个).</li>
<li>Tiền: <b>块</b> (khẩu ngữ) = 元 (chữ trên bảng giá). 1 块 = 10 <b>毛</b>.</li>
<li><b>万</b> = 10.000 → 十万 = 100.000.</li></ul>`,
    words:[
      ['三','sān','số 3','tam'],['五','wǔ','số 5','ngũ'],['六','liù','số 6','lục'],['九','jiǔ','số 9','cửu'],
      ['两','liǎng','hai (+ lượng từ)','lưỡng'],['百','bǎi','trăm','bách'],['千','qiān','nghìn','thiên'],['万','wàn','vạn (10.000)','vạn'],
      ['块','kuài','đồng (tệ, khẩu ngữ)','khối'],['钱','qián','tiền','tiền'],['多少','duōshao','bao nhiêu','đa thiểu'],['贵','guì','đắt','quý'],
      ['太','tài','quá',''],['点儿','diǎnr','một chút',''],['二','èr','số 2',''],['便宜','piányi','rẻ','tiện nghi'],
      ['杯','bēi','cốc, ly','bôi'],['扫码','sǎomǎ','quét mã','tảo mã']],
    phrases:[
      ['多少钱？','Duōshao qián?','Bao nhiêu tiền?',''],
      ['太贵了吧！','Tài guì le ba!','Đắt quá vậy!','Thêm "吧" nghe như đang mặc cả nhẹ nhàng.'],
      ['便宜点儿呗。','Piányi diǎnr bei.','Bớt chút đi mà.','"呗" làm câu nghe nũng nịu, rất tự nhiên khi trả giá.'],
      ['一共二十八块。','Yígòng èrshíbā kuài.','Tổng cộng 28 tệ.','Người bán nói "块", hiếm khi nói "元".'],
      ['扫码还是现金？','Sǎo mǎ háishi xiànjīn?','Quét mã hay tiền mặt?','Ở Trung Quốc gần như mọi nơi đều quét WeChat / Alipay.'],
      ['两杯奶茶。','Liǎng bēi nǎichá.','Hai ly trà sữa.','Nhớ: 两杯, không phải 二杯.']],
    chars:'钱:qián:tiền|块:kuài:đồng|万:wàn:vạn|两:liǎng:hai' },

  { id:'b3', zh:'吃喝', title:'Ăn uống', sub:'来一份 · 打包 · 买单',
    desc:'Gọi món, dặn không cay, tính tiền, gói mang về.',
    words:[
      ['喝','hē','uống','hát'],['水','shuǐ','nước','thủy'],['米饭','mǐfàn','cơm trắng','mễ phạn'],['面','miàn','mì','miến'],
      ['奶茶','nǎichá','trà sữa','nãi trà'],['好吃','hǎochī','ngon','hảo ngật'],['辣','là','cay','lạt'],['饿','è','đói','ngạ'],
      ['服务员','fúwùyuán','nhân viên phục vụ','phục vụ viên'],['打包','dǎbāo','gói mang về','đả bao'],['老板','lǎobǎn','ông/bà chủ; sếp','lão bản'],['要','yào','muốn, cần','yếu'],
      ['来','lái','đến',''],['这个','zhège','cái này','giá cá'],['买','mǎi','mua','mãi'],['帮','bāng','giúp','bang'],
      ['份','fèn','phần, bản',''],['单','dān','đơn','']],
    phrases:[
      ['来一份这个。','Lái yí fèn zhège.','Cho một phần cái này.','Gọi món người ta dùng "来", không ai nói "我要买…".'],
      ['不要辣，谢谢。','Bú yào là, xièxie.','Không cay nhé, cảm ơn.','Cay nhẹ: 微辣 (wēi là). Cay vừa: 中辣 (zhōng là).'],
      ['老板，买单！','Lǎobǎn, mǎidān!','Chủ quán ơi, tính tiền!','Gọi chủ quán là "老板", gọi nhân viên trẻ là "美女 / 帅哥" rất phổ biến.'],
      ['帮我打包一下。','Bāng wǒ dǎbāo yíxià.','Gói giúp mình nhé.','"一下" làm lời nhờ vả nhẹ nhàng hơn.'],
      ['我快饿死了。','Wǒ kuài è sǐ le.','Mình sắp chết đói rồi.',''],
      ['绝了，太好吃了！','Jué le, tài hǎochī le!','Đỉnh thật, ngon quá!','"绝了" = tuyệt đỉnh, giới trẻ hay dùng.']],
    chars:'吃:chī:ăn|喝:hē:uống|水:shuǐ:nước|饭:fàn:cơm' },

  { id:'b4', zh:'买东西', title:'Mua sắm', sub:'这个 · 试一下 · 算了',
    desc:'Xem đồ, hỏi màu, thử đồ, trả giá, mua online.',
    words:[
      ['卖','mài','bán','mại'],['那个','nàge','cái kia','na cá'],['试','shì','thử','thí'],['大','dà','to, lớn','đại'],
      ['小','xiǎo','nhỏ','tiểu'],['颜色','yánsè','màu sắc','nhan sắc'],['包邮','bāoyóu','miễn phí ship','bao bưu'],['就','jiù','thì, liền','tựu'],
      ['有','yǒu','có',''],['看','kàn','xem, nhìn','khán'],['亲','qīn','hôn','thân'],['别的','bié de','cái khác',''],
      ['算了','suàn le','thôi bỏ đi','toán liễu']],
    phrases:[
      ['我就看看。','Wǒ jiù kànkan.','Mình xem thôi.','Nói khi nhân viên đi theo hỏi han.'],
      ['有别的颜色吗？','Yǒu biéde yánsè ma?','Có màu khác không?',''],
      ['可以试一下吗？','Kěyǐ shì yíxià ma?','Thử được không?',''],
      ['能便宜点儿吗？','Néng piányi diǎnr ma?','Bớt được chút không?',''],
      ['算了，不要了。','Suàn le, bú yào le.','Thôi, không lấy nữa.','"算了" = thôi bỏ đi — xuất hiện cực nhiều trong phim.'],
      ['亲，包邮吗？','Qīn, bāoyóu ma?','Shop ơi, free ship không?','"亲" là cách gọi nhau trên Taobao.']],
    chars:'卖:mài:bán|大:dà:to|小:xiǎo:nhỏ' },

  { id:'b5', zh:'问路', title:'Hỏi đường', sub:'在哪儿 · 左右 · 师傅',
    desc:'Hỏi đường, đi tàu điện, gọi xe, nói chuyện với tài xế.',
    words:[
      ['在哪儿','zài nǎr','ở đâu','tại na nhi'],['这儿','zhèr','ở đây',''],['左边','zuǒbian','bên trái','tả biên'],['右边','yòubian','bên phải','hữu biên'],
      ['往前走','wǎng qián zǒu','đi thẳng','vãng tiền tẩu'],['地铁','dìtiě','tàu điện ngầm','địa thiết'],['打车','dǎchē','gọi xe, bắt taxi','đả xa'],['远','yuǎn','xa','viễn'],
      ['近','jìn','gần','cận'],['到了','dào le','đến rồi','đáo liễu'],['师傅','shīfu','bác tài, thợ','sư phó'],['走','zǒu','đi, rời đi',''],
      ['到','dào','đến',''],['行','xíng','được, ổn','hành'],['开','kāi','mở; bật','khai'],['打','dǎ','đánh','đả'],
      ['站','zhàn','trạm, ga','trạm'],['请问','qǐngwèn','xin hỏi','thỉnh vấn']],
    phrases:[
      ['请问，地铁站怎么走？','Qǐngwèn, dìtiě zhàn zěnme zǒu?','Cho hỏi, ga tàu điện đi thế nào?','"请问" mở đầu lịch sự khi hỏi người lạ.'],
      ['离这儿远吗？','Lí zhèr yuǎn ma?','Cách đây xa không?',''],
      ['师傅，到这儿就行。','Shīfu, dào zhèr jiù xíng.','Bác tài, tới đây được rồi.','Gọi tài xế, thợ sửa… là "师傅".'],
      ['我迷路了。','Wǒ mílù le.','Mình bị lạc đường rồi.',''],
      ['你开个导航吧。','Nǐ kāi ge dǎoháng ba.','Bạn mở bản đồ chỉ đường đi.','"导航" = định vị, GPS.'],
      ['走，打个车吧。','Zǒu, dǎ ge chē ba.','Đi, gọi xe thôi.','Ở Trung Quốc hay dùng app 滴滴 (Dīdī).']],
    chars:'左:zuǒ:trái|右:yòu:phải|走:zǒu:đi|远:yuǎn:xa' },

  { id:'b6', zh:'时间', title:'Thời gian & hẹn', sub:'几点 · 马上 · 改天',
    desc:'Hỏi giờ, hẹn bạn, "tới liền" và từ chối khéo.',
    words:[
      ['现在','xiànzài','bây giờ','hiện tại'],['几点','jǐ diǎn','mấy giờ','kỷ điểm'],['今天','jīntiān','hôm nay','kim thiên'],['明天','míngtiān','ngày mai','minh thiên'],
      ['昨天','zuótiān','hôm qua','tạc thiên'],['周末','zhōumò','cuối tuần','chu mạt'],['半','bàn','rưỡi, một nửa','bán'],['等','děng','đợi','đẳng'],
      ['马上','mǎshàng','ngay lập tức','mã thượng'],['有空','yǒu kòng','rảnh','hữu không'],['出来','chūlai','ra (ngoài)',''],['改天','gǎitiān','hôm khác','cải thiên'],
      ['玩儿','wánr','chơi','ngoạn']],
    phrases:[
      ['你几点有空？','Nǐ jǐ diǎn yǒu kòng?','Mấy giờ bạn rảnh?',''],
      ['周末出来玩儿啊！','Zhōumò chūlai wánr a!','Cuối tuần ra ngoài chơi đi!',''],
      ['我马上到！','Wǒ mǎshàng dào!','Tới liền!','Câu "tới liền" huyền thoại — thường là chưa ra khỏi nhà 😂'],
      ['等我一下。','Děng wǒ yíxià.','Đợi mình chút.',''],
      ['改天吧。','Gǎitiān ba.','Để hôm khác nhé.','Cách từ chối khéo phổ biến.'],
      ['现在几点了？','Xiànzài jǐ diǎn le?','Bây giờ mấy giờ rồi?','']],
    chars:'今:jīn:nay|明:míng:sáng; mai|天:tiān:trời; ngày|点:diǎn:giờ; điểm' }
  ]},

/* ───────────────────────── CHẶNG 3 ───────────────────────── */
{ id:'s3', zh:'日常', name:'Sơ cấp 2 · Đời sống & cảm xúc', short:'Đời sống', color:'green', track:'main', requires:'s2',
  desc:'Gia đình, cảm xúc, WeChat, sức khỏe, sở thích — nói chuyện như bạn bè.',
  lessons:[
  { id:'c1', zh:'家人', title:'Bản thân & gia đình', sub:'你是做什么的？',
    desc:'Hỏi tuổi, nghề nghiệp, quê quán — kể cả câu "có người yêu chưa".',
    words:[
      ['家','jiā','nhà, gia đình','gia'],['父母','fùmǔ','bố mẹ','phụ mẫu'],['孩子','háizi','con, đứa trẻ',''],['哥哥','gēge','anh trai','ca ca'],
      ['姐姐','jiějie','chị gái','tỷ tỷ'],['弟弟','dìdi','em trai','đệ đệ'],['妹妹','mèimei','em gái','muội muội'],['工作','gōngzuò','công việc; làm việc','công tác'],
      ['学生','xuésheng','học sinh, sinh viên','học sinh'],['结婚','jiéhūn','kết hôn','kết hôn'],['对象','duìxiàng','người yêu, đối tượng','đối tượng'],['老家','lǎojiā','quê','lão gia'],
      ['的','de','của; (trợ từ nối)',''],['在','zài','ở, tại; đang',''],['多','duō','nhiều',''],['做','zuò','làm',''],
      ['女','nǚ','nữ','nữ'],['河内','Hénèi','Hà Nội','']],
    phrases:[
      ['你多大了？','Nǐ duō dà le?','Bạn bao nhiêu tuổi?','Hỏi người lớn tuổi lịch sự hơn: "您多大年纪了？"'],
      ['你是做什么的？','Nǐ shì zuò shénme de?','Bạn làm nghề gì?','Tự nhiên hơn "你的工作是什么？".'],
      ['你有对象了吗？','Nǐ yǒu duìxiàng le ma?','Có người yêu chưa?','Câu họ hàng hỏi dịp Tết, y như ở Việt Nam 😅'],
      ['我老家在河内。','Wǒ lǎojiā zài Hénèi.','Quê mình ở Hà Nội.',''],
      ['我是独生女。','Wǒ shì dúshēngnǚ.','Mình là con gái một.','Con trai một: 独生子 (dúshēngzǐ).'],
      ['我家有四口人。','Wǒ jiā yǒu sì kǒu rén.','Nhà mình có 4 người.','Đếm người trong gia đình dùng lượng từ "口".']],
    chars:'家:jiā:nhà|姐:jiě:chị|老:lǎo:già' },

  { id:'c2', zh:'心情', title:'Cảm xúc', sub:'累死了 · 烦死了',
    desc:'Vui, buồn, mệt, bực — kiểu than thở người Trung hay dùng.',
    words:[
      ['开心','kāixīn','vui','khai tâm'],['高兴','gāoxìng','vui mừng','cao hứng'],['累','lèi','mệt','lụy'],['生气','shēngqì','tức giận','sinh khí'],
      ['难过','nánguò','buồn','nan quá'],['害怕','hàipà','sợ','hại phạ'],['无聊','wúliáo','chán','vô liêu'],['烦','fán','phiền, bực','phiền'],
      ['担心','dānxīn','lo lắng','đảm tâm'],['感动','gǎndòng','cảm động','cảm động'],['别','bié','đừng; khác',''],['呢','ne','thì sao; đang…',''],
      ['气死','qìsǐ','tức chết','']],
    phrases:[
      ['累死我了！','Lèi sǐ wǒ le!','Mệt chết mất!',''],
      ['烦死了！','Fán sǐ le!','Bực mình quá!','Hay đi kèm giọng than thở trong phim.'],
      ['气死我了！','Qì sǐ wǒ le!','Tức chết đi được!',''],
      ['别担心，有我呢。','Bié dānxīn, yǒu wǒ ne.','Đừng lo, có anh/em đây.','Câu an ủi kinh điển trong phim tình cảm.'],
      ['我好难过。','Wǒ hǎo nánguò.','Mình buồn lắm.','Khẩu ngữ dùng "好" = "rất" (thay cho 很).'],
      ['太好了！','Tài hǎo le!','Tuyệt quá!',''],
      ['无聊死了。','Wúliáo sǐ le.','Chán chết đi được.','']],
    chars:'开:kāi:mở|心:xīn:tim|累:lèi:mệt|气:qì:khí' },

  { id:'c3', zh:'微信', title:'Điện thoại & WeChat', sub:'加个微信吧',
    desc:'Kết bạn, nhắn tin, gọi video, hỏi mật khẩu WiFi.',
    words:[
      ['手机','shǒujī','điện thoại','thủ cơ'],['微信','Wēixìn','WeChat','vi tín'],['加','jiā','thêm (kết bạn)','gia'],['发','fā','gửi','phát'],
      ['消息','xiāoxi','tin nhắn','tiêu tức'],['打电话','dǎ diànhuà','gọi điện','đả điện thoại'],['视频','shìpín','video','thị tần'],['回','huí','trả lời; về','hồi'],
      ['密码','mìmǎ','mật khẩu','mật mã'],['没电了','méi diàn le','hết pin rồi',''],['给','gěi','cho; đưa',''],['扫','sǎo','quét (mã)',''],
      ['晚点','wǎndiǎn','trễ giờ (tàu, xe)','vãn điểm']],
    phrases:[
      ['加个微信吧。','Jiā ge Wēixìn ba.','Kết bạn WeChat nhé.',''],
      ['我扫你还是你扫我？','Wǒ sǎo nǐ háishi nǐ sǎo wǒ?','Mình quét bạn hay bạn quét mình?','Câu quen thuộc khi kết bạn WeChat bằng mã QR.'],
      ['怎么不回我消息？','Zěnme bù huí wǒ xiāoxi?','Sao không trả lời tin nhắn?',''],
      ['我手机快没电了。','Wǒ shǒujī kuài méi diàn le.','Điện thoại mình sắp hết pin.',''],
      ['WiFi密码是多少？','WiFi mìmǎ shì duōshao?','Mật khẩu WiFi là gì?','Hỏi mật khẩu bằng "多少" vì thường là số.'],
      ['晚点给你打电话。','Wǎn diǎn gěi nǐ dǎ diànhuà.','Lát nữa gọi cho bạn.','']],
    chars:'手:shǒu:tay|机:jī:máy|电:diàn:điện|话:huà:lời nói' },

  { id:'c4', zh:'身体', title:'Thời tiết & sức khỏe', sub:'多喝热水',
    desc:'Nóng lạnh, mưa nắng, ốm đau và câu "thần chú" uống nước ấm.',
    words:[
      ['天气','tiānqì','thời tiết','thiên khí'],['冷','lěng','lạnh','lãnh'],['下雨','xià yǔ','mưa','hạ vũ'],['舒服','shūfu','dễ chịu, khỏe','thư phục'],
      ['感冒','gǎnmào','cảm cúm','cảm mạo'],['发烧','fāshāo','sốt','phát thiêu'],['疼','téng','đau','đông'],['药','yào','thuốc','dược'],
      ['医院','yīyuàn','bệnh viện','y viện'],['休息','xiūxi','nghỉ ngơi','hưu tức'],['带','dài','mang theo','đới'],['头疼','tóuténg','đau đầu','đầu đông'],
      ['热水','rèshuǐ','nước nóng','nhiệt thủy'],['伞','sǎn','ô, dù','']],
    phrases:[
      ['今天好热啊！','Jīntiān hǎo rè a!','Hôm nay nóng quá!',''],
      ['我有点儿不舒服。','Wǒ yǒudiǎnr bù shūfu.','Mình hơi khó chịu trong người.','"有点儿" + điều không tốt = hơi…'],
      ['我头疼。','Wǒ tóu téng.','Mình đau đầu.','Đau bụng: 肚子疼 (dùzi téng).'],
      ['多喝热水。','Duō hē rè shuǐ.','Uống nhiều nước ấm vào.','"Thần chú" người Trung khuyên khi bạn ốm — cũng là meme "bạn trai vô tâm".'],
      ['你好好休息。','Nǐ hǎohāor xiūxi.','Nghỉ ngơi cho khỏe nhé.',''],
      ['要下雨了，带伞吧。','Yào xià yǔ le, dài sǎn ba.','Sắp mưa rồi, mang ô đi.','']],
    chars:'冷:lěng:lạnh|热:rè:nóng|雨:yǔ:mưa|药:yào:thuốc' },

  { id:'c5', zh:'爱好', title:'Sở thích & rủ rê', sub:'追剧 · 我请客',
    desc:'Nói về phim, nhạc, game — rủ đi chơi và mời bao.',
    words:[
      ['喜欢','xǐhuan','thích','hỉ hoan'],['电影','diànyǐng','phim điện ảnh','điện ảnh'],['电视剧','diànshìjù','phim truyền hình','điện thị kịch'],['听','tīng','nghe','thính'],
      ['音乐','yīnyuè','âm nhạc','âm nhạc'],['游戏','yóuxì','trò chơi, game','du hí'],['追剧','zhuījù','cày phim','truy kịch'],['逛街','guàngjiē','dạo phố, shopping','cuống nhai'],
      ['请客','qǐngkè','mời, bao','thỉnh khách'],['剧','jù','phim (bộ)',''],['没','méi','không, chưa',''],['干嘛','gàn má','làm gì; sao thế',''],
      ['追','zhuī','theo đuổi','truy'],['问题','wèntí','câu hỏi; vấn đề','vấn đề'],['平时','píngshí','thường ngày','bình thời'],['下次','xià cì','lần sau','hạ thứ']],
    phrases:[
      ['你平时喜欢干嘛？','Nǐ píngshí xǐhuan gàn má?','Bình thường bạn thích làm gì?','"干嘛" là khẩu ngữ của "做什么".'],
      ['最近在追什么剧？','Zuìjìn zài zhuī shénme jù?','Dạo này đang cày phim gì?',''],
      ['走，一起去！','Zǒu, yìqǐ qù!','Đi, đi cùng luôn!',''],
      ['今天我请客！','Jīntiān wǒ qǐngkè!','Hôm nay mình bao!',''],
      ['好啊，没问题！','Hǎo a, méi wèntí!','Được thôi, không vấn đề!',''],
      ['下次吧。','Xià cì ba.','Lần sau nhé.','Từ chối nhẹ nhàng, giống "改天吧".']],
    chars:'喜:xǐ:vui|听:tīng:nghe|追:zhuī:theo đuổi' }
  ]},

/* ───────────────────────── CHẶNG 4 ───────────────────────── */
{ id:'s4', zh:'追剧', name:'Xem phim · Câu thoại hay gặp', short:'Thoại phim', color:'yellow', track:'fun', requires:'s1',
  desc:'Phản ứng, cãi nhau, ngôn tình, cổ trang, công sở — nghe hiểu phim không cần sub.',
  lessons:[
  { id:'d1', zh:'惊讶', title:'Phản ứng & cảm thán', sub:'真的假的 · 完了',
    desc:'Những tiếng "trời ơi", "toang rồi" nghe trong mọi bộ phim.',
    words:[
      ['真的','zhēn de','thật','chân đích'],['天哪','tiān na','trời ơi','thiên na'],['完了','wán le','xong rồi; toang rồi','hoàn liễu'],['糟糕','zāogāo','hỏng bét, chết rồi','tao cao'],
      ['哎呀','āiyā','ái chà, ôi',''],['可能','kěnéng','có thể','khả năng'],['居然','jūrán','vậy mà, thế mà','cư nhiên'],['厉害','lìhai','giỏi, ghê','lệ hại'],
      ['无语','wúyǔ','cạn lời','vô ngữ'],['奇怪','qíguài','lạ','kỳ quái'],['吓','xià','dọa, làm giật mình','hách'],['也','yě','cũng',''],
      ['假的','jiǎ de','giả, không thật','']],
    phrases:[
      ['真的假的？','Zhēn de jiǎ de?','Thật hay đùa vậy?','Phản ứng hóng chuyện siêu phổ biến.'],
      ['我的天哪！','Wǒ de tiān na!','Trời đất ơi!',''],
      ['完了完了…','Wán le wán le…','Toang rồi toang rồi…','Nhân vật hay nói khi gây họa.'],
      ['怎么可能？！','Zěnme kěnéng?!','Sao có thể chứ?!',''],
      ['你也太厉害了吧！','Nǐ yě tài lìhai le ba!','Bạn cũng giỏi quá đi!',''],
      ['我真的无语了。','Wǒ zhēn de wúyǔ le.','Mình thật sự cạn lời.',''],
      ['吓死我了！','Xià sǐ wǒ le!','Hết hồn!','']],
    chars:'真:zhēn:thật|完:wán:xong|怪:guài:lạ|吓:xià:dọa' },

  { id:'d2', zh:'吵架', title:'Cãi nhau & giận dữ', sub:'凭什么 · 你给我站住',
    desc:'Câu thoại "drama" trong phim tình cảm, gia đình, cung đấu.',
    words:[
      ['凭什么','píng shénme','dựa vào đâu, tại sao chứ','bằng thập ma'],['闭嘴','bì zuǐ','im miệng','bế chủy'],['够了','gòu le','đủ rồi',''],['滚','gǔn','cút','cổn'],
      ['讨厌','tǎoyàn','ghét','thảo yếm'],['骗子','piànzi','kẻ lừa đảo','biển tử'],['疯','fēng','điên','phong'],['解释','jiěshì','giải thích','giải thích'],
      ['分手','fēnshǒu','chia tay','phân thủ'],['管','guǎn','quản, xen vào','quản'],['们','men','(số nhiều: 我们, 你们)',''],['事','shì','việc, chuyện',''],
      ['住','zhù','sống, ở','trú'],['关','guān','đóng; tắt','quan'],['是不是','shì bu shì','có phải… không',''],['少来这套','shǎo lái zhè tào','bớt giở trò đi','']],
    phrases:[
      ['你给我站住！','Nǐ gěi wǒ zhànzhù!','Đứng lại cho tôi!','"给我" làm câu ra lệnh mạnh hơn.'],
      ['关你什么事？','Guān nǐ shénme shì?','Liên quan gì tới anh?',''],
      ['够了！别说了！','Gòu le! Bié shuō le!','Đủ rồi! Đừng nói nữa!',''],
      ['你听我解释！','Nǐ tīng wǒ jiěshì!','Em nghe anh giải thích!','Câu kinh điển của phim ngôn tình khi bị hiểu lầm.'],
      ['你是不是疯了？','Nǐ shì bu shì fēng le?','Anh điên rồi à?',''],
      ['凭什么？','Píng shénme?','Dựa vào đâu chứ?','Nhân vật bị đối xử bất công hay hét câu này.'],
      ['少来这套！','Shǎo lái zhè tào!','Đừng giở trò này!',''],
      ['我们分手吧。','Wǒmen fēnshǒu ba.','Chúng ta chia tay đi.','']],
    chars:'滚:gǔn:cút|够:gòu:đủ|管:guǎn:quản|骗:piàn:lừa' },

  { id:'d3', zh:'恋爱', title:'Tình cảm & ngôn tình', sub:'我想你了 · 吃醋',
    desc:'Lời yêu, ghen tuông, "傻瓜" — đặc sản phim ngôn tình.',
    words:[
      ['爱','ài','yêu','ái'],['宝贝','bǎobèi','cưng, bảo bối','bảo bối'],['亲爱的','qīn\'ài de','anh/em yêu','thân ái đích'],['吃醋','chīcù','ghen','ngật thố'],
      ['表白','biǎobái','tỏ tình','biểu bạch'],['约会','yuēhuì','hẹn hò','ước hội'],['心动','xīndòng','rung động','tâm động'],['傻瓜','shǎguā','đồ ngốc','sỏa qua'],
      ['舍不得','shěbude','không nỡ','xả bất đắc'],['陪','péi','ở bên, đi cùng','bồi'],['都','dōu','đều',''],['着','zhe','đang (kéo dài)','']],
    phrases:[
      ['我想你了。','Wǒ xiǎng nǐ le.','Anh nhớ em rồi.',''],
      ['你吃醋了？','Nǐ chīcù le?','Em ghen à?',''],
      ['傻瓜，我一直都在。','Shǎguā, wǒ yìzhí dōu zài.','Ngốc à, anh luôn ở đây mà.',''],
      ['我会一直陪着你。','Wǒ huì yìzhí péizhe nǐ.','Anh sẽ luôn ở bên em.',''],
      ['做我女朋友吧。','Zuò wǒ nǚpéngyou ba.','Làm bạn gái anh nhé.','Bạn trai: 男朋友 (nánpéngyou).'],
      ['我舍不得你。','Wǒ shěbude nǐ.','Anh không nỡ xa em.',''],
      ['讨厌～','Tǎoyàn~','Ghét ghê~','Con gái nói giọng nũng nịu = không phải ghét thật 😄']],
    chars:'爱:ài:yêu|心:xīn:tim|陪:péi:ở bên' },

  { id:'d4', zh:'古装剧', title:'Phim cổ trang', sub:'皇上 · 本宫 · 放肆',
    desc:'Xưng hô cung đình, tiên hiệp — gần như trùng Hán Việt!',
    intro:`<p>Tin vui: từ cổ trang gần như <b>trùng Hán Việt</b> — 皇上 = hoàng thượng, 本宫 = bổn cung, 在下 = tại hạ. Người Việt học phần này rất nhanh. Bật hiển thị <b>Hán Việt</b> trong Cài đặt để tận dụng.</p>`,
    words:[
      ['皇上','huángshang','hoàng thượng','hoàng thượng'],['娘娘','niángniang','nương nương','nương nương'],['本宫','běngōng','bổn cung','bổn cung'],['奴婢','núbì','nô tỳ','nô tỳ'],
      ['臣','chén','thần (bề tôi)','thần'],['公子','gōngzǐ','công tử','công tử'],['姑娘','gūniang','cô nương','cô nương'],['师父','shīfu','sư phụ','sư phụ'],
      ['在下','zàixià','tại hạ','tại hạ'],['放肆','fàngsì','láo xược','phóng tứ'],['遵命','zūnmìng','tuân lệnh','tuân mệnh'],['大胆','dàdǎn','to gan','đại đảm'],
      ['平身','píngshēn','bình thân','bình thân'],['多谢','duōxiè','đa tạ',''],['救','jiù','cứu','cứu'],['驾到','jiàdào','giá lâm (vua đến)',''],
      ['免礼','miǎnlǐ','miễn lễ',''],['相','xiāng','lẫn nhau','']],
    phrases:[
      ['来人啊！','Lái rén a!','Người đâu!',''],
      ['大胆！','Dàdǎn!','To gan!',''],
      ['放肆！','Fàngsì!','Láo xược!',''],
      ['奴婢遵命。','Núbì zūnmìng.','Nô tỳ tuân lệnh.',''],
      ['皇上驾到！','Huángshang jiàdào!','Hoàng thượng giá đáo!',''],
      ['免礼，平身。','Miǎnlǐ, píngshēn.','Miễn lễ, bình thân.',''],
      ['多谢姑娘相救。','Duōxiè gūniang xiāng jiù.','Đa tạ cô nương cứu giúp.','']],
    chars:'皇:huáng:hoàng|宫:gōng:cung|臣:chén:thần|命:mìng:mệnh' },

  { id:'d5', zh:'都市剧', title:'Phim hiện đại · công sở', sub:'加班 · 搞定 · 靠谱',
    desc:'Tăng ca, sếp, dự án và meme "tổng tài bá đạo".',
    words:[
      ['总裁','zǒngcái','tổng tài, CEO','tổng tài'],['加班','jiābān','tăng ca','gia ban'],['开会','kāihuì','họp','khai hội'],['辞职','cízhí','nghỉ việc','từ chức'],
      ['项目','xiàngmù','dự án','hạng mục'],['客户','kèhù','khách hàng','khách hộ'],['合同','hétong','hợp đồng','hợp đồng'],['搞定','gǎodìng','xử lý xong','cảo định'],
      ['靠谱','kàopǔ','đáng tin, ổn','kháo phổ'],['压力','yālì','áp lực','áp lực'],['摸鱼','mōyú','lười việc, "trốn việc"',''],['上班','shàngbān','đi làm','thượng ban'],
      ['成功','chénggōng','thành công','thành công'],['干','gàn','làm',''],['老子','lǎozi','tao, bố mày (ngông)',''],['发现','fāxiàn','phát hiện','phát hiện'],
      ['引起','yǐnqǐ','gây ra',''],['注意','zhùyì','chú ý','']],
    phrases:[
      ['今天又要加班。','Jīntiān yòu yào jiābān.','Hôm nay lại phải tăng ca.',''],
      ['搞定了！','Gǎodìng le!','Xong rồi! / Xử đẹp rồi!',''],
      ['这人靠谱吗？','Zhè rén kàopǔ ma?','Người này đáng tin không?',''],
      ['老子不干了！','Lǎozi bú gàn le!','Ông đây nghỉ!','"老子" = "ông đây/bố mày" — rất suồng sã, chỉ nên nghe hiểu, đừng nói với sếp!'],
      ['上班摸鱼被老板发现了。','Shàngbān mōyú bèi lǎobǎn fāxiàn le.','Trốn việc bị sếp phát hiện rồi.',''],
      ['女人，你成功引起了我的注意。','Nǚrén, nǐ chénggōng yǐnqǐ le wǒ de zhùyì.','Cô gái, cô đã thành công thu hút sự chú ý của tôi.','Câu "tổng tài bá đạo" huyền thoại, giờ thành meme.'],
      ['压力好大啊。','Yālì hǎo dà a.','Áp lực quá trời.','']],
    chars:'班:bān:ca làm|会:huì:họp|客:kè:khách|定:dìng:định' }
  ]},

/* ───────────────────────── CHẶNG 5 ───────────────────────── */
{ id:'s5', zh:'识字', name:'Đọc chữ đời thường', short:'Đọc chữ', color:'pink', track:'main', requires:'s3',
  desc:'Biển báo, cửa hàng, tàu điện, app và phụ đề — chữ bạn gặp mỗi ngày.',
  lessons:[
  { id:'e1', zh:'标志', title:'Biển báo cơ bản', sub:'出口 · 推 · 拉',
    desc:'Lối ra, đẩy/kéo, nam/nữ, nhà vệ sinh, cấm hút thuốc.',
    words:[
      ['出口','chūkǒu','lối ra','xuất khẩu'],['入口','rùkǒu','lối vào','nhập khẩu'],['推','tuī','đẩy','thôi'],['拉','lā','kéo','lạp'],
      ['男','nán','nam','nam'],['洗手间','xǐshǒujiān','nhà vệ sinh','tẩy thủ gian'],['厕所','cèsuǒ','toilet','xí sở'],['禁止吸烟','jìnzhǐ xīyān','cấm hút thuốc','cấm chỉ hấp yên'],
      ['小心','xiǎoxīn','cẩn thận','tiểu tâm'],['安全出口','ānquán chūkǒu','lối thoát hiểm','an toàn xuất khẩu'],['进','jìn','vào',''],['地','de','một cách (…地 + động từ); đất',''],
      ['排队','páiduì','xếp hàng','bài đội'],['滑','huá','trơn',''],['勿','wù','chớ, cấm',''],['吸烟','xīyān','hút thuốc',''],
      ['闲','xián','rảnh',''],['免','miǎn','miễn','']],
    phrases:[
      ['洗手间在哪儿？','Xǐshǒujiān zài nǎr?','Nhà vệ sinh ở đâu?','Nói "厕所在哪儿？" cũng tự nhiên, không bất lịch sự.'],
      ['小心地滑','Xiǎoxīn dì huá','Cẩn thận sàn trơn','Biển vàng gặp khắp nơi.'],
      ['请勿吸烟','Qǐng wù xīyān','Vui lòng không hút thuốc','"勿" = chớ, đừng (văn viết).'],
      ['闲人免进','Xiánrén miǎn jìn','Người không phận sự miễn vào',''],
      ['请排队','Qǐng páiduì','Vui lòng xếp hàng',''],
      ['小心碰头','Xiǎoxīn pèng tóu','Cẩn thận cụng đầu','']],
    chars:'出:chū:ra|入:rù:vào|男:nán:nam' },

  { id:'e2', zh:'店铺', title:'Cửa hàng & thanh toán', sub:'营业中 · 八折 · 扫码',
    desc:'Đọc bảng giá, khuyến mãi, quét mã gọi món.',
    words:[
      ['营业中','yíngyè zhōng','đang mở cửa','doanh nghiệp trung'],['收银台','shōuyíntái','quầy thu ngân','thu ngân đài'],['支付','zhīfù','thanh toán','chi phó'],['支付宝','Zhīfùbǎo','Alipay','chi phó bảo'],
      ['打折','dǎzhé','giảm giá','đả chiết'],['特价','tèjià','giá đặc biệt','đặc giá'],['外卖','wàimài','đồ ăn giao tận nơi','ngoại mại'],['菜单','càidān','thực đơn','thái đơn'],
      ['免费','miǎnfèi','miễn phí','miễn phí'],['现金','xiànjīn','tiền mặt','hiện kim'],['送','sòng','tặng; tiễn','tống'],['店','diàn','cửa hàng',''],
      ['全','quán','toàn bộ',''],['欢迎','huānyíng','hoan nghênh','hoan nghênh'],['场','chǎng','bãi, sân',''],['折','zhé','giảm giá (打九折 = giảm 10%)',''],
      ['本','běn','quyển','bản'],['点餐','diǎn cān','gọi món','']],
    phrases:[
      ['扫码点餐','Sǎo mǎ diǎn cān','Quét mã để gọi món','Nhiều quán không còn menu giấy.'],
      ['全场八折','Quánchǎng bā zhé','Toàn bộ giảm 20%','⚠️ 八折 = trả 80% giá, KHÔNG phải giảm 80%!'],
      ['买一送一','Mǎi yī sòng yī','Mua 1 tặng 1',''],
      ['本店不收现金','Běn diàn bù shōu xiànjīn','Cửa hàng không nhận tiền mặt',''],
      ['欢迎光临！','Huānyíng guānglín!','Hoan nghênh quý khách!','Nghe khi bước vào cửa hàng.'],
      ['暂停营业','Zàntíng yíngyè','Tạm ngừng kinh doanh','']],
    chars:'折:zhé:giảm giá|免:miǎn:miễn|费:fèi:phí|店:diàn:tiệm' },

  { id:'e3', zh:'交通', title:'Giao thông & thành phố', sub:'东南西北 · 换乘',
    desc:'Đọc bảng tàu điện, tên ga, phương hướng.',
    words:[
      ['公交','gōngjiāo','xe buýt','công giao'],['火车站','huǒchēzhàn','ga tàu hỏa','hỏa xa trạm'],['机场','jīchǎng','sân bay','cơ trường'],['号线','hào xiàn','tuyến số…','hiệu tuyến'],
      ['换乘','huànchéng','chuyển tuyến','hoán thừa'],['东','dōng','đông','đông'],['南','nán','nam (hướng)','nam'],['西','xī','tây','tây'],
      ['北','běi','bắc','bắc'],['路','lù','đường','lộ'],['酒店','jiǔdiàn','khách sạn','tửu điếm'],['下','xià','dưới; xuống',''],
      ['外','wài','ngoài',''],['候','hòu','chờ',''],['北京','Běijīng','Bắc Kinh','Bắc Kinh'],['民','mín','dân',''],
      ['广场','guǎngchǎng','quảng trường',''],['黄线','huáng xiàn','vạch vàng','']],
    phrases:[
      ['下一站：人民广场','Xià yí zhàn: Rénmín Guǎngchǎng','Ga tiếp theo: Quảng trường Nhân Dân','Câu loa trên tàu điện ngầm.'],
      ['请在黄线外等候','Qǐng zài huáng xiàn wài děnghòu','Vui lòng đứng sau vạch vàng',''],
      ['二号线换乘','Èr hào xiàn huànchéng','Chuyển sang tuyến số 2',''],
      ['往北走两百米','Wǎng běi zǒu liǎng bǎi mǐ','Đi về hướng bắc 200 mét',''],
      ['北京南站','Běijīng Nán Zhàn','Ga Nam Bắc Kinh','Tên ga: [thành phố] + 东/南/西/北 + 站.']],
    chars:'东:dōng:đông|南:nán:nam|西:xī:tây|北:běi:bắc' },

  { id:'e4', zh:'屏幕', title:'App & phụ đề', sub:'登录 · 取消 · 字幕',
    desc:'Chữ trên điện thoại, app xem phim và bao bì.',
    words:[
      ['登录','dēnglù','đăng nhập','đăng lục'],['注册','zhùcè','đăng ký','chú sách'],['确定','quèdìng','xác nhận, OK','xác định'],['取消','qǔxiāo','hủy','thủ tiêu'],
      ['设置','shèzhì','cài đặt','thiết trí'],['搜索','sōusuǒ','tìm kiếm','sưu tác'],['下载','xiàzài','tải xuống','hạ tải'],['分享','fēnxiǎng','chia sẻ','phân hưởng'],
      ['字幕','zìmù','phụ đề','tự mạc'],['会员','huìyuán','thành viên VIP','hội viên'],['保质期','bǎozhìqī','hạn sử dụng','bảo chất kỳ'],['弹幕','dànmù','bình luận chạy trên video','đạn mạc'],
      ['中文','Zhōngwén','tiếng Trung','Trung văn'],['见','jiàn','gặp, thấy',''],['第','dì','thứ (第二 = thứ hai)',''],['更新','gēngxīn','cập nhật (tập mới)','canh tân'],
      ['包装','bāozhuāng','đóng gói, bao bì','bao trang'],['输入','shūrù','nhập (dữ liệu)','']],
    phrases:[
      ['请输入密码','Qǐng shūrù mìmǎ','Vui lòng nhập mật khẩu',''],
      ['中文字幕','Zhōngwén zìmù','Phụ đề tiếng Trung','Mẹo: xem phim bật phụ đề Trung để luyện đọc chữ.'],
      ['开启弹幕','Kāiqǐ dànmù','Bật bình luận chạy','Tính năng đặc trưng của Bilibili, iQiyi, Tencent Video.'],
      ['会员专享','Huìyuán zhuānxiǎng','Chỉ dành cho VIP',''],
      ['更新至第20集','Gēngxīn zhì dì èrshí jí','Cập nhật đến tập 20','"集" = tập phim.','更新至第二十集'],
      ['生产日期见包装','Shēngchǎn rìqī jiàn bāozhuāng','Ngày sản xuất xem trên bao bì','']],
    chars:'取:qǔ:lấy|消:xiāo:tiêu|确:què:xác' }
  ]},

/* ───────────────────────── CHẶNG 6 ───────────────────────── */
{ id:'s6', zh:'进阶', name:'Nâng cao · Nói như người bản xứ', short:'Nâng cao', color:'mint', track:'main', requires:'s5',
  desc:'Ngữ khí từ, khẩu ngữ, tiếng lóng mạng, thành ngữ và liên từ để nghe phim trôi chảy.',
  lessons:[
  { id:'f1', zh:'语气词', title:'Ngữ khí từ', sub:'吧 呢 啊 嘛 呗 啦',
    desc:'"Gia vị" cuối câu giúp bạn nghe tự nhiên như người bản xứ.',
    intro:`<ul>
<li><b>吧 ba</b> – rủ rê / đoán: 走吧 (đi thôi), 你是越南人吧？(bạn là người Việt nhỉ?)</li>
<li><b>呢 ne</b> – hỏi lại "còn… thì sao?": 你呢？; hoặc đang làm gì: 我吃饭呢.</li>
<li><b>啊 / 呀 a/ya</b> – cảm thán, làm câu mềm: 好啊！</li>
<li><b>嘛 ma</b> – "mà" (hiển nhiên, nũng nịu): 我就说嘛！</li>
<li><b>呗 bei</b> – "thì… thôi", kiểu bất cần: 不行就算了呗.</li>
<li><b>啦 la</b> – nhẹ nhàng, dỗ dành: 好啦好啦.</li></ul>`,
    words:[
      ['嘛','ma','mà (hiển nhiên)',''],['呗','bei','thì… thôi',''],['啦','la','mà, rồi (mềm mỏng)',''],['哦','ò','ồ, à (hiểu rồi)',''],
      ['嗯','èn','ừ, ừm',''],['原来','yuánlái','hóa ra','nguyên lai'],['挺','tǐng','khá, khá là','đĩnh'],['这样','zhèyàng','như thế này','']],
    phrases:[
      ['走吧！','Zǒu ba!','Đi thôi!',''],
      ['我挺好的，你呢？','Wǒ tǐng hǎo de, nǐ ne?','Mình ổn, còn bạn?',''],
      ['我就说嘛！','Wǒ jiù shuō ma!','Đã bảo mà!',''],
      ['不行就算了呗。','Bù xíng jiù suàn le bei.','Không được thì thôi.',''],
      ['好啦好啦，别生气了。','Hǎo la hǎo la, bié shēngqì le.','Thôi được rồi, đừng giận nữa mà.',''],
      ['哦～原来是这样！','Ò~ yuánlái shì zhèyàng!','À~ hóa ra là vậy!',''],
      ['嗯嗯，知道了。','Èn en, zhīdào le.','Ừ ừ, biết rồi.','Nhắn tin hay gõ "嗯嗯" — chỉ một chữ "嗯" có thể bị coi là lạnh lùng!']],
    chars:'嘛:ma:mà|呗:bei:thì… thôi|啦:la:mà' },

  { id:'f2', zh:'口头禅', title:'Khẩu ngữ hằng ngày', sub:'随便 · 咋了 · 啥意思',
    desc:'Những từ cửa miệng người Trung nói cả trăm lần mỗi ngày.',
    words:[
      ['随便','suíbiàn','tùy','tùy tiện'],['咋','zǎ','sao (khẩu ngữ miền Bắc)',''],['啥','shá','gì (khẩu ngữ)',''],['超','chāo','siêu','siêu'],
      ['其实','qíshí','thật ra','kỳ thực'],['反正','fǎnzhèng','dù sao thì','phản chính'],['得了','dé le','thôi đi, được rồi','đắc liễu'],['这么','zhème','như vậy','giá ma'],
      ['白','bái','trắng','bạch'],['定','dìng','định','']],
    phrases:[
      ['随便，你定吧。','Suíbiàn, nǐ dìng ba.','Tùy, bạn quyết đi.','Câu "ăn gì cũng được" muôn thuở.'],
      ['行，就这么定了！','Xíng, jiù zhème dìng le!','Được, chốt vậy nhé!',''],
      ['你干嘛呢？','Nǐ gàn má ne?','Đang làm gì đó?','Câu mở đầu tin nhắn phổ biến nhất.'],
      ['咋了？','Zǎ le?','Sao thế?','Miền Bắc Trung Quốc, phim Đông Bắc nghe suốt.'],
      ['啥意思？','Shá yìsi?','Ý là sao?',''],
      ['挺好的。','Tǐng hǎo de.','Khá ổn đấy.',''],
      ['得了吧你！','Dé le ba nǐ!','Thôi đi ông!','Khi không tin lời ai đó khoe khoang.'],
      ['说白了，就是没钱。','Shuō bái le, jiù shì méi qián.','Nói thẳng ra là không có tiền.','']],
    chars:'啥:shá:gì|超:chāo:siêu|便:biàn:liền' },

  { id:'f3', zh:'网络用语', title:'Tiếng lóng mạng', sub:'躺平 · 吃瓜 · yyds',
    desc:'Ngôn ngữ Douyin, Weibo, bình luận phim — giới trẻ dùng hằng ngày.',
    words:[
      ['内卷','nèijuǎn','cạnh tranh khốc liệt vô nghĩa','nội quyển'],['躺平','tǎngpíng','nằm im, buông xuôi','thảng bình'],['摆烂','bǎilàn','mặc kệ, buông bỏ luôn','bãi lạn'],['破防','pòfáng','vỡ òa, bị "chạm" cảm xúc','phá phòng'],
      ['社死','shèsǐ','quê độ, "chết" vì xấu hổ','xã tử'],['吃瓜','chīguā','hóng drama','ngật qua'],['打卡','dǎkǎ','check-in',''],['种草','zhòngcǎo','bị "dụ" muốn mua','chủng thảo'],
      ['凡尔赛','Fán\'ěrsài','khoe khéo (giả vờ than)',''],['绝绝子','juéjuézǐ','đỉnh của chóp',''],['yyds','yǒngyuǎn de shén','"thần thánh mãi mãi", đỉnh nhất','vĩnh viễn đích thần','永远的神'],['666','liù liù liù','giỏi quá, pro ghê','','六六六'],
      ['这','zhè','này, đây',''],['想','xiǎng','nhớ; muốn; nghĩ','tưởng'],['直','zhí','thẳng; cứ',''],['只','zhī','con (thú nhỏ)','chích'],
      ['接','jiē','đón','tiếp'],['群','qún','nhóm chat','quần']],
    phrases:[
      ['我只是个吃瓜群众。','Wǒ zhǐ shì ge chīguā qúnzhòng.','Tôi chỉ là quần chúng hóng drama thôi.',''],
      ['这波操作666！','Zhè bō cāozuò liù liù liù!','Pha xử lý này đỉnh quá!','','这波操作六六六'],
      ['看完直接破防了。','Kàn wán zhíjiē pòfáng le.','Xem xong vỡ òa luôn.',''],
      ['大型社死现场','Dàxíng shèsǐ xiànchǎng','Hiện trường quê độ cỡ lớn',''],
      ['卷不动了，躺平吧。','Juǎn bú dòng le, tǎngpíng ba.','Không đua nổi nữa, nằm im thôi.',''],
      ['被种草了，想买！','Bèi zhòngcǎo le, xiǎng mǎi!','Bị dụ rồi, muốn mua quá!',''],
      ['这个剧yyds！','Zhège jù yyds!','Phim này đỉnh nhất!','Đọc là "yǒngyuǎn de shén" hoặc đánh vần y-y-d-s.','这个剧永远的神']],
    chars:'瓜:guā:dưa|卷:juǎn:cuộn|躺:tǎng:nằm|死:sǐ:chết' },

  { id:'f4', zh:'成语', title:'Thành ngữ hay dùng', sub:'好久不见 · 莫名其妙',
    desc:'Thành ngữ, câu chúc — nhiều câu trùng Hán Việt.',
    words:[
      ['好久不见','hǎojiǔ bú jiàn','lâu rồi không gặp','hảo cửu bất kiến'],['加油','jiāyóu','cố lên','gia du'],['马马虎虎','mǎmǎhūhū','tàm tạm; cẩu thả','mã mã hổ hổ'],['一见钟情','yíjiàn-zhōngqíng','yêu từ cái nhìn đầu tiên','nhất kiến chung tình'],
      ['乱七八糟','luànqībāzāo','lộn xộn, bừa bộn','loạn thất bát tao'],['莫名其妙','mòmíng-qímiào','khó hiểu, vô lý','mạc danh kỳ diệu'],['不可思议','bùkě-sīyì','không thể tin nổi','bất khả tư nghị'],['一路顺风','yílù-shùnfēng','thượng lộ bình an','nhất lộ thuận phong'],
      ['心想事成','xīnxiǎng-shìchéng','muốn gì được nấy','tâm tưởng sự thành'],['恭喜发财','gōngxǐ fācái','chúc phát tài','cung hỷ phát tài'],['入乡随俗','rùxiāng-suísú','nhập gia tùy tục','nhập hương tùy tục'],['没办法','méi bànfǎ','hết cách','một biện pháp'],
      ['真','zhēn','thật',''],['新','xīn','mới','tân'],['房间','fángjiān','phòng','phòng gian'],['乐','lè','vui',''],
      ['变','biàn','thay đổi','biến']],
    phrases:[
      ['好久不见！你一点儿没变。','Hǎojiǔ bú jiàn! Nǐ yìdiǎnr méi biàn.','Lâu rồi không gặp! Bạn chẳng thay đổi gì cả.',''],
      ['加油！你可以的！','Jiāyóu! Nǐ kěyǐ de!','Cố lên! Bạn làm được mà!',''],
      ['你这人真莫名其妙！','Nǐ zhè rén zhēn mòmíng-qímiào!','Cái người này thật khó hiểu!',''],
      ['房间乱七八糟的。','Fángjiān luànqībāzāo de.','Phòng bừa bộn quá.',''],
      ['新年快乐，恭喜发财！','Xīnnián kuàilè, gōngxǐ fācái!','Chúc mừng năm mới, phát tài phát lộc!',''],
      ['没办法，只能这样了。','Méi bànfǎ, zhǐ néng zhèyàng le.','Hết cách rồi, đành vậy thôi.','']],
    chars:'加:jiā:thêm|油:yóu:dầu|乱:luàn:loạn|顺:shùn:thuận' },

  { id:'f5', zh:'连接词', title:'Nối câu để nghe phim', sub:'然后呢 · 本来…结果',
    desc:'Liên từ giúp bạn theo kịp mạch thoại dài trong phim.',
    words:[
      ['因为','yīnwèi','bởi vì','nhân vị'],['所以','suǒyǐ','cho nên','sở dĩ'],['但是','dànshì','nhưng','đãn thị'],['不过','búguò','có điều, nhưng','bất quá'],
      ['然后','ránhòu','sau đó','nhiên hậu'],['而且','érqiě','hơn nữa','nhi thả'],['如果','rúguǒ','nếu','như quả'],['虽然','suīrán','tuy','tuy nhiên'],
      ['结果','jiéguǒ','kết quả là, rốt cuộc','kết quả'],['本来','běnlái','vốn dĩ','bổn lai'],['很','hěn','rất','']],
    phrases:[
      ['然后呢？','Ránhòu ne?','Rồi sao nữa?','Câu hóng chuyện thần thánh.'],
      ['我本来想去的，结果下雨了。','Wǒ běnlái xiǎng qù de, jiéguǒ xià yǔ le.','Mình định đi, rốt cuộc trời mưa.',''],
      ['如果你不来，我就生气了。','Rúguǒ nǐ bù lái, wǒ jiù shēngqì le.','Nếu bạn không đến thì mình giận đấy.',''],
      ['虽然很累，但是很开心。','Suīrán hěn lèi, dànshì hěn kāixīn.','Tuy mệt nhưng rất vui.',''],
      ['其实我早就知道了。','Qíshí wǒ zǎo jiù zhīdào le.','Thật ra mình biết từ lâu rồi.',''],
      ['反正我不去。','Fǎnzhèng wǒ bú qù.','Dù sao thì mình cũng không đi.','']],
    chars:'因:yīn:nhân|为:wèi:vì|然:rán:nhiên|果:guǒ:quả' }
  ]}
];

/* Bảng pinyin cho trang 拼 — [âm, chữ mẫu, pinyin chữ mẫu, gợi ý tiếng Việt] */
window.PINYIN = {
  initials:[
    ['b','爸','bà','≈ "p" không bật hơi'],['p','怕','pà','"p" bật mạnh hơi'],['m','妈','mā','như "m"'],['f','发','fā','như "ph"'],
    ['d','大','dà','≈ "t" không bật hơi'],['t','他','tā','≈ "th"'],['n','你','nǐ','như "n"'],['l','来','lái','như "l"'],
    ['g','哥','gē','≈ "c/k"'],['k','可','kě','"k" bật hơi'],['h','好','hǎo','≈ "kh" nhẹ'],
    ['j','鸡','jī','≈ "ch" (chi)'],['q','七','qī','"ch" bật hơi'],['x','西','xī','≈ "x" mặt lưỡi'],
    ['zh','知','zhī','≈ "tr" uốn lưỡi'],['ch','吃','chī','"tr" uốn + bật hơi'],['sh','是','shì','≈ "s" uốn lưỡi'],['r','日','rì','≈ "r" nhẹ / "gi"'],
    ['z','字','zì','≈ "ts" đầu lưỡi'],['c','菜','cài','"ts" bật hơi'],['s','四','sì','≈ "x"'],['y','一','yī','như "d/gi" nhẹ'],['w','我','wǒ','như "u/o"']],
  finals:[
    ['a','啊','a','a'],['o','哦','ò','ô (tròn môi)'],['e','饿','è','ưa / ơ'],['i','衣','yī','i'],['u','五','wǔ','u'],['ü','鱼','yú','uy (tròn môi)'],
    ['ai','爱','ài','ai'],['ei','给','gěi','ây'],['ao','好','hǎo','ao'],['ou','狗','gǒu','âu'],
    ['an','安','ān','an'],['en','门','mén','ân'],['ang','忙','máng','ang'],['eng','冷','lěng','âng'],['ong','红','hóng','ung'],['er','二','èr','ơ + uốn lưỡi'],
    ['ia','家','jiā','i-a'],['ie','谢','xiè','iê'],['iao','小','xiǎo','i-ao'],['iu','六','liù','iêu'],['ian','天','tiān','iên'],['in','心','xīn','in'],
    ['iang','想','xiǎng','i-ang'],['ing','听','tīng','inh'],['iong','熊','xióng','i-ung'],
    ['ua','花','huā','oa'],['uo','多','duō','uô'],['uai','快','kuài','oai'],['ui','对','duì','uây'],['uan','换','huàn','oan'],['un','春','chūn','uân'],['uang','光','guāng','oang'],
    ['üe','学','xué','uê'],['üan','远','yuǎn','uyên'],['ün','云','yún','uyn']],
  toneSets:[
    ['妈麻马骂','mā má mǎ mà'],['八拔把爸','bā bá bǎ bà'],['汤糖躺烫','tāng táng tǎng tàng'],['衣姨椅意','yī yí yǐ yì'],
    ['书熟鼠树','shū shú shǔ shù'],['通同统痛','tōng tóng tǒng tòng'],['呼胡虎户','hū hú hǔ hù'],['飞肥匪费','fēi féi fěi fèi'],
    ['夫福府父','fū fú fǔ fù'],['七骑起气','qī qí qǐ qì']]
};
