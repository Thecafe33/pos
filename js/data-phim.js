/* =====================================================================
   CHUYÊN ĐỀ PHIM & MẠNG XÃ HỘI — mở sau khi xong chặng Nhập môn (Pinyin)
   scene: cảnh hội thoại ngắn { t: tên cảnh, l: [[vai, câu, pinyin, nghĩa], ...] }
   ===================================================================== */
window.COURSE.push(
/* ───────────── TIÊN HIỆP · HUYỀN HUYỄN ───────────── */
{ id:'sx', zh:'仙侠', name:'Tiên hiệp · Huyền huyễn', short:'Tiên hiệp', color:'lav', track:'fun', requires:'s1',
  desc:'Tu tiên, cảnh giới, sư tôn, thần ma — từ vựng nghe trong mọi bộ tiên hiệp. Hán Việt gần như trùng hết!',
  lessons:[
  { id:'x1', zh:'修仙', title:'Tu tiên nhập môn', sub:'修炼 · 灵气 · 飞升',
    desc:'Bộ từ "nền" xuất hiện trong mọi bộ tiên hiệp.',
    intro:`<p>Mẹo cho người Việt: <b>nhìn âm Hán Việt</b> là đoán được nghĩa — 修炼 = tu luyện, 飞升 = phi thăng, 渡劫 = độ kiếp. Bạn chỉ cần nhớ <b>cách đọc tiếng Trung</b>.</p>`,
    words:[
      ['修仙','xiūxiān','tu tiên','tu tiên'],['修炼','xiūliàn','tu luyện','tu luyện'],['灵气','língqì','linh khí','linh khí'],['灵根','línggēn','linh căn (tư chất tu tiên)','linh căn'],
      ['天赋','tiānfù','thiên phú, năng khiếu','thiên phú'],['丹药','dānyào','đan dược','đan dược'],['法宝','fǎbǎo','pháp bảo','pháp bảo'],['宗门','zōngmén','tông môn','tông môn'],
      ['弟子','dìzǐ','đệ tử','đệ tử'],['突破','tūpò','đột phá','đột phá'],['渡劫','dùjié','độ kiếp','độ kiếp'],['飞升','fēishēng','phi thăng','phi thăng'],
      ['他','tā','anh ấy, ông ấy',''],['恭喜','gōngxǐ','chúc mừng','cung hỷ'],['废物','fèiwù','phế vật, đồ vô dụng','phế vật'],['师兄','shīxiōng','sư huynh','sư huynh'],
      ['准备','zhǔnbèi','chuẩn bị','chuẩn bị'],['此子','cǐ zǐ','đứa trẻ này','']],
    phrases:[
      ['我要修仙！','Wǒ yào xiūxiān!','Ta muốn tu tiên!','Câu mở đầu kinh điển của nhân vật chính "phế vật" trước khi lật kèo.'],
      ['此子天赋异禀。','Cǐ zǐ tiānfù yìbǐng.','Đứa trẻ này thiên phú dị bẩm.','"此子" = đứa này (văn cổ). Trưởng lão hay nói khi phát hiện thiên tài.'],
      ['他没有灵根，是个废物。','Tā méiyǒu línggēn, shì ge fèiwù.','Hắn không có linh căn, là đồ phế vật.','Mở đầu kiểu "bị khinh thường" — vài tập sau sẽ bị vả mặt 😄'],
      ['我要突破了！','Wǒ yào tūpò le!','Ta sắp đột phá rồi!',''],
      ['吃下这颗丹药。','Chī xià zhè kē dānyào.','Uống viên đan dược này đi.','Lượng từ cho viên đan: 颗 (kē).'],
      ['恭喜师兄飞升！','Gōngxǐ shīxiōng fēishēng!','Chúc mừng sư huynh phi thăng!','']],
    scene:{ t:'Ngày nhập môn', l:[
      ['Trưởng lão','测一下你的灵根。','Cè yíxià nǐ de línggēn.','Đo linh căn của ngươi xem.'],
      ['Đệ tử','弟子准备好了！','Dìzǐ zhǔnbèi hǎo le!','Đệ tử đã sẵn sàng!'],
      ['Trưởng lão','天哪……此子天赋异禀！','Tiān na…… cǐ zǐ tiānfù yìbǐng!','Trời ơi… đứa trẻ này thiên phú dị bẩm!'],
      ['Đệ tử','我要修仙，我要飞升！','Wǒ yào xiūxiān, wǒ yào fēishēng!','Ta muốn tu tiên, ta muốn phi thăng!']]},
    chars:'仙:xiān:tiên|修:xiū:tu|灵:líng:linh|丹:dān:đan' },

  { id:'x2', zh:'境界', title:'Cảnh giới tu luyện', sub:'筑基 · 金丹 · 元婴',
    desc:'Các cấp bậc tu vi — nghe là biết ai mạnh hơn ai.',
    intro:`<p>Thứ tự cảnh giới hay gặp (mỗi truyện hơi khác):<br><b>练气 → 筑基 → 金丹 → 元婴 → 化神 → … → 渡劫 → 大乘 → 飞升</b></p><p>Nghe nhân vật nói "金丹期" là biết đang ở <b>kỳ</b> Kim Đan.</p>`,
    words:[
      ['境界','jìngjiè','cảnh giới','cảnh giới'],['修为','xiūwéi','tu vi','tu vi'],['练气','liànqì','luyện khí','luyện khí'],['筑基','zhùjī','trúc cơ','trúc cơ'],
      ['金丹','jīndān','kim đan','kim đan'],['元婴','yuányīng','nguyên anh','nguyên anh'],['化神','huàshén','hóa thần','hóa thần'],['大乘','dàchéng','đại thừa','đại thừa'],
      ['闭关','bìguān','bế quan','bế quan'],['出关','chūguān','xuất quan','xuất quan'],['瓶颈','píngjǐng','bình cảnh, nút thắt','bình cảnh'],['走火入魔','zǒuhuǒ-rùmó','tẩu hỏa nhập ma','tẩu hỏa nhập ma'],
      ['已经','yǐjīng','đã','dĩ kinh'],['卡','kǎ','kẹt; thẻ',''],['低','dī','thấp',''],['期','qī','kỳ',''],
      ['好久','hǎojiǔ','lâu lắm','hảo cửu'],['急','jí','gấp, vội','']],
    phrases:[
      ['我要闭关三年。','Wǒ yào bìguān sān nián.','Ta phải bế quan ba năm.',''],
      ['恭喜师父出关！','Gōngxǐ shīfu chūguān!','Chúc mừng sư phụ xuất quan!',''],
      ['他已经是金丹期了。','Tā yǐjīng shì jīndān qī le.','Hắn đã ở kỳ Kim Đan rồi.','"期" = kỳ, giai đoạn.'],
      ['我卡在瓶颈好久了。','Wǒ kǎ zài píngjǐng hǎojiǔ le.','Ta bị kẹt ở bình cảnh lâu lắm rồi.','Giới trẻ cũng dùng "瓶颈期" khi công việc, học tập bị chững lại.'],
      ['小心走火入魔！','Xiǎoxīn zǒuhuǒ-rùmó!','Cẩn thận tẩu hỏa nhập ma!',''],
      ['你的修为太低了。','Nǐ de xiūwéi tài dī le.','Tu vi của ngươi quá thấp.','']],
    scene:{ t:'Sư phụ xuất quan', l:[
      ['Đệ tử','恭喜师父出关！','Gōngxǐ shīfu chūguān!','Chúc mừng sư phụ xuất quan!'],
      ['Sư phụ','你的修为怎么样了？','Nǐ de xiūwéi zěnmeyàng le?','Tu vi của con thế nào rồi?'],
      ['Đệ tử','弟子刚刚筑基，卡在瓶颈了。','Dìzǐ gānggāng zhùjī, kǎ zài píngjǐng le.','Đệ tử vừa trúc cơ, bị kẹt ở bình cảnh rồi.'],
      ['Sư phụ','别急，小心走火入魔。','Bié jí, xiǎoxīn zǒuhuǒ-rùmó.','Đừng vội, cẩn thận tẩu hỏa nhập ma.']]},
    chars:'金:jīn:vàng; kim|神:shén:thần|关:guān:cửa ải; đóng|魔:mó:ma' },

  { id:'x3', zh:'师门', title:'Môn phái & xưng hô', sub:'师尊 · 师兄 · 道友',
    desc:'Gọi nhau sao cho đúng vai vế trong tông môn.',
    words:[
      ['师尊','shīzūn','sư tôn','sư tôn'],['师姐','shījiě','sư tỷ','sư tỷ'],['师弟','shīdì','sư đệ','sư đệ'],['师妹','shīmèi','sư muội','sư muội'],
      ['掌门','zhǎngmén','chưởng môn','chưởng môn'],['长老','zhǎnglǎo','trưởng lão','trưởng lão'],['宗主','zōngzhǔ','tông chủ','tông chủ'],['前辈','qiánbèi','tiền bối','tiền bối'],
      ['晚辈','wǎnbèi','vãn bối','vãn bối'],['道友','dàoyǒu','đạo hữu','đạo hữu'],['本座','běnzuò','bổn tọa (ta – giọng bề trên)','bổn tọa'],['敢','gǎn','dám',''],
      ['见过','jiànguo','đã gặp; chào',''],['动','dòng','động',''],['位','wèi','vị (lượng từ lịch sự)',''],['留步','liúbù','xin dừng bước',''],
      ['那边','nàbiān','bên kia',''],['拜见','bàijiàn','bái kiến','']],
    phrases:[
      ['弟子拜见师尊。','Dìzǐ bàijiàn shīzūn.','Đệ tử bái kiến sư tôn.','"拜见" = bái kiến, chào người bề trên.'],
      ['师兄，等等我！','Shīxiōng, děngděng wǒ!','Sư huynh, đợi muội với!',''],
      ['这位道友，请留步。','Zhè wèi dàoyǒu, qǐng liúbù.','Vị đạo hữu này, xin dừng bước.','"留步" = dừng bước — câu chặn đường kinh điển.'],
      ['晚辈见过前辈。','Wǎnbèi jiànguo qiánbèi.','Vãn bối ra mắt tiền bối.',''],
      ['本座的徒弟，谁敢动？','Běnzuò de túdì, shéi gǎn dòng?','Đồ đệ của bổn tọa, ai dám động vào?','Sư tôn bảo vệ đồ đệ — cảnh "ngọt" khán giả mê.'],
      ['小师妹又闯祸了。','Xiǎo shīmèi yòu chuǎnghuò le.','Tiểu sư muội lại gây họa rồi.','']],
    scene:{ t:'Gặp người lạ dưới núi', l:[
      ['Sư muội','师兄，你看，那边有人！','Shīxiōng, nǐ kàn, nàbiān yǒu rén!','Sư huynh, huynh xem, đằng kia có người!'],
      ['Sư huynh','这位道友，请留步。','Zhè wèi dàoyǒu, qǐng liúbù.','Vị đạo hữu này, xin dừng bước.'],
      ['Người lạ','叫我前辈。','Jiào wǒ qiánbèi.','Gọi ta là tiền bối.'],
      ['Sư huynh','……晚辈见过前辈。','…… Wǎnbèi jiànguo qiánbèi.','…Vãn bối ra mắt tiền bối.']]},
    chars:'师:shī:thầy, sư|弟:dì:em trai|老:lǎo:già' },

  { id:'x4', zh:'斗法', title:'Chiến đấu & pháp thuật', sub:'剑法 · 阵法 · 结界',
    desc:'Những từ vang lên trong mọi trận đánh.',
    words:[
      ['剑','jiàn','kiếm','kiếm'],['剑法','jiànfǎ','kiếm pháp','kiếm pháp'],['法术','fǎshù','pháp thuật','pháp thuật'],['阵法','zhènfǎ','trận pháp','trận pháp'],
      ['结界','jiéjiè','kết giới','kết giới'],['真气','zhēnqì','chân khí','chân khí'],['内力','nèilì','nội lực','nội lực'],['出手','chūshǒu','ra tay','xuất thủ'],
      ['受伤','shòushāng','bị thương','thụ thương'],['吐血','tùxiě','hộc máu, thổ huyết','thổ huyết'],['杀','shā','giết','sát'],['破','pò','phá, rách',''],
      ['挡','dǎng','cản',''],['哈哈','hāhā','haha',''],['救命','jiùmìng','cứu với (sốc / buồn cười)','cứu mệnh'],['他的','tā de','của anh ấy',''],
      ['手下留情','shǒu xià liú qíng','nương tay','']],
    phrases:[
      ['看剑！','Kàn jiàn!','Xem kiếm đây!','Hô trước khi ra chiêu.'],
      ['快走！我来挡住他！','Kuài zǒu! Wǒ lái dǎngzhù tā!','Đi mau! Để ta cản hắn!',''],
      ['你受伤了？','Nǐ shòushāng le?','Ngươi bị thương rồi?',''],
      ['破了他的阵法！','Pò le tā de zhènfǎ!','Phá trận pháp của hắn!',''],
      ['手下留情！','Shǒuxià liúqíng!','Hạ thủ lưu tình!','Xin nương tay — Hán Việt y hệt.'],
      ['救命啊！','Jiùmìng a!','Cứu mạng với!','Ngoài đời giới trẻ cũng hét "救命" khi thấy gì quá buồn cười hoặc quá sốc.']],
    scene:{ t:'Bị phục kích', l:[
      ['Sư tỷ','小心，有结界！','Xiǎoxīn, yǒu jiéjiè!','Cẩn thận, có kết giới!'],
      ['Ma tu','哈哈，你们走不了了！','Hāhā, nǐmen zǒu bu liǎo le!','Ha ha, các ngươi không đi được nữa rồi!'],
      ['Sư huynh','快走！我来挡住他！','Kuài zǒu! Wǒ lái dǎngzhù tā!','Đi mau! Để ta cản hắn!'],
      ['Sư tỷ','师兄，你受伤了！','Shīxiōng, nǐ shòushāng le!','Sư huynh, huynh bị thương rồi!']]},
    chars:'剑:jiàn:kiếm|力:lì:sức|杀:shā:giết|救:jiù:cứu' },

  { id:'x5', zh:'六界', title:'Thần · Ma · Yêu · Quỷ', sub:'仙界 · 魔界 · 封印',
    desc:'Thế giới quan huyền huyễn: tiên giới, ma giới, chuyển thế.',
    words:[
      ['神','shén','thần','thần'],['魔','mó','ma','ma'],['妖','yāo','yêu (yêu quái)','yêu'],['鬼','guǐ','quỷ','quỷ'],
      ['仙界','xiānjiè','tiên giới','tiên giới'],['魔界','mójiè','ma giới','ma giới'],['凡人','fánrén','phàm nhân','phàm nhân'],['天道','tiāndào','thiên đạo','thiên đạo'],
      ['魂魄','húnpò','hồn phách','hồn phách'],['封印','fēngyìn','phong ấn','phong ấn'],['转世','zhuǎnshì','chuyển thế, đầu thai','chuyển thế'],['天劫','tiānjié','thiên kiếp','thiên kiếp'],
      ['还','huán','trả lại','hoàn'],['她','tā','cô ấy',''],['仙','xiān','tiên',''],['尊','zūn','tôn (bậc cao)',''],
      ['立','lì','đứng; lập',''],['逆天','nìtiān','nghịch thiên','nghịch thiên']],
    phrases:[
      ['魔尊出世了！','Mózūn chūshì le!','Ma tôn xuất thế rồi!',''],
      ['仙魔不两立。','Xiān mó bù liǎng lì.','Tiên ma không đội trời chung.','Mâu thuẫn trung tâm của rất nhiều phim tiên hiệp.'],
      ['你不过是一个凡人。','Nǐ búguò shì yí ge fánrén.','Ngươi chẳng qua chỉ là một phàm nhân.',''],
      ['封印要破了！','Fēngyìn yào pò le!','Phong ấn sắp vỡ rồi!',''],
      ['她是妖，你还爱她吗？','Tā shì yāo, nǐ hái ài tā ma?','Nàng là yêu, ngươi còn yêu nàng không?','Tình yêu người – yêu là đề tài "ngược" quen thuộc.'],
      ['逆天而行','Nì tiān ér xíng','Nghịch thiên mà đi','Chống lại thiên đạo — chất "ngầu" của nam chính.']],
    scene:{ t:'Phong ấn sắp vỡ', l:[
      ['Đệ tử','掌门，封印要破了！','Zhǎngmén, fēngyìn yào pò le!','Chưởng môn, phong ấn sắp vỡ rồi!'],
      ['Chưởng môn','魔尊要出世了……','Mózūn yào chūshì le……','Ma tôn sắp xuất thế rồi…'],
      ['Ma tôn','本座回来了！','Běnzuò huílai le!','Bổn tọa đã trở lại!'],
      ['Chưởng môn','仙魔不两立，杀！','Xiān mó bù liǎng lì, shā!','Tiên ma không đội trời chung, giết!']]},
    chars:'妖:yāo:yêu|鬼:guǐ:quỷ|魂:hún:hồn|界:jiè:giới' },

  { id:'x6', zh:'名台词', title:'Câu thoại tiên hiệp kinh điển', sub:'找死 · 蝼蚁 · 莫欺少年穷',
    desc:'Những câu "ngầu" khiến bạn nổi da gà khi nghe hiểu.',
    words:[
      ['找死','zhǎosǐ','muốn chết, tìm chết','trảo tử'],['蝼蚁','lóuyǐ','sâu kiến (kẻ yếu)','lâu nghĩ'],['区区','qūqū','cỏn con, nhỏ nhoi','khu khu'],['竟敢','jìng gǎn','dám cả','cánh cảm'],
      ['口出狂言','kǒuchū-kuángyán','nói năng ngông cuồng','khẩu xuất cuồng ngôn'],['交出来','jiāo chūlai','giao ra đây',''],['受死','shòusǐ','chịu chết','thụ tử'],['今日','jīnrì','hôm nay (văn cổ)','kim nhật'],
      ['命','mìng','mạng, số mệnh','mệnh'],['天','tiān','trời','thiên'],['后悔','hòuhuǐ','hối hận','hậu hối'],['报仇','bàochóu','báo thù','báo cừu'],
      ['由','yóu','do, bởi',''],['为','wèi','vì, cho',''],['知','zhī','biết',''],['天高地厚','tiān gāo dì hòu','trời cao đất dày',''],
      ['此','cǐ','này (văn cổ)',''],['报','bào','báo (thù)','']],
    phrases:[
      ['你找死！','Nǐ zhǎosǐ!','Ngươi muốn chết!',''],
      ['区区蝼蚁，也敢挡我？','Qūqū lóuyǐ, yě gǎn dǎng wǒ?','Sâu kiến cỏn con mà cũng dám cản ta?',''],
      ['不知天高地厚！','Bù zhī tiān gāo dì hòu!','Không biết trời cao đất dày!','Thành ngữ dùng cả ngoài đời để mắng người tự cao.'],
      ['今日，我便要你的命！','Jīnrì, wǒ biàn yào nǐ de mìng!','Hôm nay ta sẽ lấy mạng ngươi!','"便" = liền (văn cổ, giống 就).'],
      ['我命由我不由天！','Wǒ mìng yóu wǒ bù yóu tiān!','Mệnh ta do ta, không do trời!','Câu "ngầu" nổi tiếng, cực hay gặp trong phim và meme.'],
      ['莫欺少年穷！','Mò qī shàonián qióng!','Chớ khinh thiếu niên nghèo!','Đi kèm "三十年河东，三十年河西" — sông có khúc, người có lúc.'],
      ['此仇不报，誓不为人！','Cǐ chóu bú bào, shì bù wéi rén!','Thù này không báo, thề không làm người!','']],
    scene:{ t:'Bị khinh thường', l:[
      ['Thiếu gia','区区蝼蚁，也敢挡我？','Qūqū lóuyǐ, yě gǎn dǎng wǒ?','Sâu kiến cỏn con mà cũng dám cản ta?'],
      ['Nam chính','三十年河东，三十年河西。','Sānshí nián hé dōng, sānshí nián hé xī.','Ba mươi năm bên đông sông, ba mươi năm bên tây sông.'],
      ['Nam chính','莫欺少年穷！','Mò qī shàonián qióng!','Chớ khinh thiếu niên nghèo!'],
      ['Thiếu gia','不知天高地厚！你找死！','Bù zhī tiān gāo dì hòu! Nǐ zhǎosǐ!','Không biết trời cao đất dày! Ngươi muốn chết!']]},
    chars:'命:mìng:mệnh|仇:chóu:thù|死:sǐ:chết' }
  ]},

/* ───────────── CỔ TRANG TÌNH CẢM & CUNG ĐẤU ───────────── */
{ id:'sg', zh:'古偶', name:'Cổ trang · Ngôn tình & cung đấu', short:'Cổ trang', color:'pink', track:'fun', requires:'s1',
  desc:'Tam sinh tam thế, vương gia – vương phi, hậu cung tranh đấu.',
  lessons:[
  { id:'g1', zh:'三生三世', title:'Tình yêu tiên hiệp', sub:'缘分 · 情劫 · 前世今生',
    desc:'Duyên phận, kiếp trước kiếp này — chất liệu của mọi bộ "ngược luyến".',
    words:[
      ['缘分','yuánfèn','duyên phận','duyên phận'],['命中注定','mìngzhōng zhùdìng','định mệnh, số trời định','mệnh trung chú định'],['前世','qiánshì','kiếp trước','tiền thế'],['今生','jīnshēng','kiếp này','kim sinh'],
      ['三生三世','sānshēng-sānshì','ba kiếp ba đời','tam sinh tam thế'],['情劫','qíngjié','tình kiếp','tình kiếp'],['相思','xiāngsī','tương tư','tương tư'],['千年','qiān nián','nghìn năm','thiên niên'],
      ['忘记','wàngjì','quên','vong ký'],['永远','yǒngyuǎn','mãi mãi','vĩnh viễn'],['生死','shēngsǐ','sống chết','sinh tử'],['心上人','xīnshàngrén','người trong lòng','tâm thượng nhân'],
      ['遇见','yùjiàn','gặp gỡ','ngộ kiến'],['若','ruò','nếu (văn cổ)',''],['来生','láishēng','kiếp sau',''],['生生世世','shēngshēng shìshì','đời đời kiếp kiếp',''],
      ['永','yǒng','mãi mãi',''],['分离','fēnlí','chia lìa','']],
    phrases:[
      ['我等了你三生三世。','Wǒ děng le nǐ sānshēng-sānshì.','Ta đã đợi nàng ba kiếp ba đời.',''],
      ['这是我的情劫。','Zhè shì wǒ de qíngjié.','Đây là tình kiếp của ta.',''],
      ['若有来生，我还要遇见你。','Ruò yǒu láishēng, wǒ hái yào yùjiàn nǐ.','Nếu có kiếp sau, ta vẫn muốn gặp được nàng.','"若" = nếu (văn cổ, giống 如果).'],
      ['你是我的心上人。','Nǐ shì wǒ de xīnshàngrén.','Nàng là người trong lòng ta.',''],
      ['我怎么会忘记你？','Wǒ zěnme huì wàngjì nǐ?','Sao ta có thể quên nàng?',''],
      ['生生世世，永不分离。','Shēngshēng-shìshì, yǒng bù fēnlí.','Đời đời kiếp kiếp, mãi không chia lìa.','']],
    scene:{ t:'Gặp lại sau ngàn năm', l:[
      ['Nàng','你……是谁？','Nǐ…… shì shéi?','Chàng… là ai?'],
      ['Chàng','你忘记我了？','Nǐ wàngjì wǒ le?','Nàng quên ta rồi sao?'],
      ['Chàng','我等了你三生三世。','Wǒ děng le nǐ sānshēng-sānshì.','Ta đã đợi nàng ba kiếp ba đời.'],
      ['Nàng','也许……这就是缘分吧。','Yěxǔ…… zhè jiù shì yuánfèn ba.','Có lẽ… đây chính là duyên phận.']]},
    chars:'缘:yuán:duyên|忘:wàng:quên|情:qíng:tình|世:shì:đời' },

  { id:'g2', zh:'王府', title:'Vương phủ & xuyên không', sub:'王爷 · 夫君 · 娘子',
    desc:'Xưng hô vương gia, phu quân, tiểu thư, nha hoàn.',
    words:[
      ['王爷','wángye','vương gia','vương gia'],['王妃','wángfēi','vương phi','vương phi'],['殿下','diànxià','điện hạ','điện hạ'],['太子','tàizǐ','thái tử','thái tử'],
      ['公主','gōngzhǔ','công chúa','công chúa'],['将军','jiāngjūn','tướng quân','tướng quân'],['夫君','fūjūn','phu quân','phu quân'],['娘子','niángzǐ','nương tử','nương tử'],
      ['小姐','xiǎojiě','tiểu thư','tiểu thư'],['丫鬟','yāhuan','nha hoàn','nha hoàn'],['侍卫','shìwèi','thị vệ','thị vệ'],['属下','shǔxià','thuộc hạ','thuộc hạ'],
      ['跑','pǎo','chạy','bào'],['王','wáng','vua; họ Vương',''],['醒','xǐng','tỉnh',''],['为夫','wéi fū','ta (chồng tự xưng, văn cổ)',''],
      ['参见','cānjiàn','tham kiến (chào bề trên)',''],['查','chá','tra, kiểm tra','']],
    phrases:[
      ['王爷，王妃又跑了！','Wángye, wángfēi yòu pǎo le!','Vương gia, vương phi lại bỏ trốn rồi!','Tình tiết "vương phi bỏ trốn" kinh điển của phim cổ trang hài.'],
      ['属下遵命。','Shǔxià zūnmìng.','Thuộc hạ tuân lệnh.',''],
      ['小姐，你醒了！','Xiǎojiě, nǐ xǐng le!','Tiểu thư, người tỉnh rồi!','Câu mở đầu quen thuộc của phim xuyên không.'],
      ['娘子，为夫错了。','Niángzǐ, wéi fū cuò le.','Nương tử, vi phu sai rồi.','"为夫" = vi phu (chồng tự xưng).'],
      ['参见太子殿下。','Cānjiàn tàizǐ diànxià.','Tham kiến thái tử điện hạ.',''],
      ['给本王查！','Gěi běn wáng chá!','Điều tra cho bổn vương!','"本王" = bổn vương.']],
    scene:{ t:'Xuyên không tỉnh dậy', l:[
      ['Nha hoàn','小姐，你醒了！','Xiǎojiě, nǐ xǐng le!','Tiểu thư, người tỉnh rồi!'],
      ['Nữ chính','这是哪儿？你是谁？','Zhè shì nǎr? Nǐ shì shéi?','Đây là đâu? Cô là ai?'],
      ['Nha hoàn','奴婢是小桃啊！王爷来了！','Núbì shì Xiǎo Táo a! Wángye lái le!','Nô tỳ là Tiểu Đào mà! Vương gia đến rồi!'],
      ['Vương gia','听说你又要跑？','Tīngshuō nǐ yòu yào pǎo?','Nghe nói nàng lại định bỏ trốn?']]},
    chars:'王:wáng:vua|主:zhǔ:chủ|夫:fū:chồng|娘:niáng:nương' },

  { id:'g3', zh:'宫斗', title:'Cung đấu', sub:'陛下 · 圣旨 · 冷宫',
    desc:'Hậu cung, thánh chỉ, vu oan — "thần thiếp oan uổng!"',
    words:[
      ['陛下','bìxià','bệ hạ','bệ hạ'],['皇后','huánghòu','hoàng hậu','hoàng hậu'],['贵妃','guìfēi','quý phi','quý phi'],['臣妾','chénqiè','thần thiếp','thần thiếp'],
      ['太监','tàijiàn','thái giám','thái giám'],['宫女','gōngnǚ','cung nữ','cung nữ'],['后宫','hòugōng','hậu cung','hậu cung'],['圣旨','shèngzhǐ','thánh chỉ','thánh chỉ'],
      ['冷宫','lěnggōng','lãnh cung','lãnh cung'],['陷害','xiànhài','hãm hại','hãm hại'],['冤枉','yuānwang','oan uổng','oan uổng'],['赐死','cìsǐ','ban chết','tứ tử'],
      ['可','kě','có thể; (nhấn mạnh)',''],['入','rù','vào',''],['证据','zhèngjù','chứng cứ','chứng cứ'],['饶','ráo','tha',''],
      ['知罪','zhī zuì','biết tội',''],['狡辩','jiǎobiàn','ngụy biện','']],
    phrases:[
      ['臣妾冤枉啊！','Chénqiè yuānwang a!','Thần thiếp oan uổng mà!','Câu "quốc dân" của phim cung đấu.'],
      ['圣旨到！','Shèngzhǐ dào!','Thánh chỉ đến!',''],
      ['打入冷宫！','Dǎrù lěnggōng!','Đày vào lãnh cung!',''],
      ['臣妾做不到啊！','Chénqiè zuò bu dào a!','Thần thiếp không làm được!','Meme nổi tiếng từ phim Hậu cung Chân Hoàn truyện, dùng khi "bó tay".'],
      ['是谁陷害本宫？','Shì shéi xiànhài běngōng?','Là ai hãm hại bổn cung?',''],
      ['陛下饶命！','Bìxià ráomìng!','Bệ hạ tha mạng!','"饶命" = tha mạng.']],
    scene:{ t:'Bị vu oan', l:[
      ['Hoàng đế','你可知罪？','Nǐ kě zhī zuì?','Ngươi có biết tội không?'],
      ['Phi tần','臣妾冤枉啊！是有人陷害臣妾！','Chénqiè yuānwang a! Shì yǒu rén xiànhài chénqiè!','Thần thiếp oan uổng! Là có người hãm hại thần thiếp!'],
      ['Hoàng hậu','证据都在这儿，还敢狡辩？','Zhèngjù dōu zài zhèr, hái gǎn jiǎobiàn?','Chứng cứ ở cả đây, còn dám chối?'],
      ['Hoàng đế','来人，打入冷宫！','Lái rén, dǎrù lěnggōng!','Người đâu, đày vào lãnh cung!']]},
    chars:'后:hòu:hậu; sau|妃:fēi:phi|旨:zhǐ:chỉ|冤:yuān:oan' }
  ]},

/* ───────────── NGÔN TÌNH HIỆN ĐẠI ───────────── */
{ id:'sr', zh:'言情', name:'Ngôn tình hiện đại', short:'Ngôn tình', color:'peach', track:'fun', requires:'s1',
  desc:'Thả thính, hẹn hò, ghen tuông, chia tay, cầu hôn — thoại phim tình cảm đô thị.',
  lessons:[
  { id:'r1', zh:'心动', title:'Thả thính & tỏ tình', sub:'暗恋 · 撩 · 官宣',
    desc:'Từ yêu thầm đến "官宣" công khai.',
    words:[
      ['暗恋','ànliàn','yêu thầm','ám luyến'],['撩','liáo','thả thính, trêu ghẹo','liêu'],['告白','gàobái','tỏ tình','cáo bạch'],['在一起','zài yìqǐ','ở bên nhau, yêu nhau','tại nhất khởi'],
      ['暧昧','àimèi','mập mờ','ái muội'],['单身','dānshēn','độc thân','đơn thân'],['脱单','tuōdān','thoát ế','thoát đơn'],['好感','hǎogǎn','thiện cảm','hảo cảm'],
      ['官宣','guānxuān','công khai (chuyện yêu)','quan tuyên'],['类型','lèixíng','gu, kiểu người','loại hình'],['备胎','bèitāi','"lốp dự phòng"','bị thai'],['久','jiǔ','lâu','']],
    phrases:[
      ['我喜欢你很久了。','Wǒ xǐhuan nǐ hěn jiǔ le.','Mình thích cậu lâu rồi.',''],
      ['我们在一起吧。','Wǒmen zài yìqǐ ba.','Chúng mình yêu nhau đi.','"在一起" = chính thức thành một cặp.'],
      ['你是我喜欢的类型。','Nǐ shì wǒ xǐhuan de lèixíng.','Cậu đúng gu của mình.',''],
      ['你是不是在撩我？','Nǐ shì bu shì zài liáo wǒ?','Có phải cậu đang thả thính tớ không?',''],
      ['我们只是朋友。','Wǒmen zhǐ shì péngyou.','Chúng ta chỉ là bạn thôi.','Câu "phát thẻ bạn bè" đau lòng 😢'],
      ['终于脱单了！','Zhōngyú tuōdān le!','Cuối cùng cũng thoát ế!',''],
      ['官宣了！','Guānxuān le!','Công khai rồi!','Dùng khi idol / cặp đôi đăng ảnh công khai quan hệ.']],
    scene:{ t:'Tỏ tình dưới mưa', l:[
      ['Cô','你……为什么一直对我这么好？','Nǐ…… wèishénme yìzhí duì wǒ zhème hǎo?','Cậu… sao lúc nào cũng tốt với tớ vậy?'],
      ['Anh','因为我喜欢你很久了。','Yīnwèi wǒ xǐhuan nǐ hěn jiǔ le.','Vì tớ thích cậu lâu rồi.'],
      ['Cô','真的吗？','Zhēn de ma?','Thật không?'],
      ['Anh','我们在一起吧。','Wǒmen zài yìqǐ ba.','Chúng mình yêu nhau đi.']]},
    chars:'恋:liàn:luyến|单:dān:đơn|暗:àn:tối' },

  { id:'r2', zh:'甜', title:'Hẹn hò ngọt ngào', sub:'撒娇 · 抱抱 · 宠',
    desc:'Làm nũng, ôm ấp, "cơm chó" — phim ngọt toàn những câu này.',
    words:[
      ['撒娇','sājiāo','làm nũng','tát kiều'],['抱','bào','ôm','bão'],['牵手','qiānshǒu','nắm tay','khiên thủ'],['乖','guāi','ngoan','quai'],
      ['宠','chǒng','cưng chiều','sủng'],['甜','tián','ngọt','điềm'],['可爱','kě\'ài','dễ thương','khả ái'],['害羞','hàixiū','ngại, xấu hổ','hại tu'],
      ['脸红','liǎnhóng','đỏ mặt','kiểm hồng'],['狗粮','gǒuliáng','"cơm chó" (cảnh tình tứ)','cẩu lương'],['秀恩爱','xiù ēn\'ài','khoe tình cảm','tú ân ái'],['那','nà','kia, đó; vậy thì',''],
      ['话','huà','lời nói',''],['喂','wéi','alô',''],['他们','tāmen','họ',''],['一个人','yí ge rén','một mình',''],
      ['嘴','zuǐ','miệng (khẩu ngữ)','']],
    phrases:[
      ['抱抱～','Bàobao~','Ôm cái nào~','Lặp từ (抱抱, 亲亲) nghe nũng nịu, đáng yêu.'],
      ['想我了没？','Xiǎng wǒ le méi?','Nhớ anh chưa?',''],
      ['乖，听话。','Guāi, tīnghuà.','Ngoan, nghe lời nào.','Câu "nam chính dỗ dành" quen thuộc.'],
      ['你脸红了。','Nǐ liǎnhóng le.','Em đỏ mặt rồi kìa.',''],
      ['我只宠你一个人。','Wǒ zhǐ chǒng nǐ yí ge rén.','Anh chỉ cưng chiều một mình em.',''],
      ['又被喂了一嘴狗粮。','Yòu bèi wèi le yì zuǐ gǒuliáng.','Lại bị "ăn cơm chó" rồi.','Người độc thân than khi thấy cặp đôi tình tứ.'],
      ['他们又在秀恩爱。','Tāmen yòu zài xiù ēn\'ài.','Họ lại khoe tình cảm nữa rồi.','']],
    scene:{ t:'Buổi hẹn đầu', l:[
      ['Anh','想我了没？','Xiǎng wǒ le méi?','Nhớ anh chưa?'],
      ['Em','才没有呢！','Cái méiyǒu ne!','Làm gì có!'],
      ['Anh','那你脸红什么？','Nà nǐ liǎnhóng shénme?','Thế em đỏ mặt cái gì?'],
      ['Em','讨厌～抱抱！','Tǎoyàn~ bàobao!','Ghét ghê~ ôm cái nào!']]},
    chars:'甜:tián:ngọt|抱:bào:ôm|宠:chǒng:sủng' },

  { id:'r3', zh:'吃醋', title:'Ghen & giận dỗi', sub:'哄 · 误会 · 渣男',
    desc:'Màn ghen tuông, hiểu lầm và dỗ dành.',
    words:[
      ['哄','hǒng','dỗ dành','hống'],['误会','wùhuì','hiểu lầm','ngộ hội'],['冷战','lěngzhàn','chiến tranh lạnh','lãnh chiến'],['道歉','dàoqiàn','xin lỗi','đạo khiểm'],
      ['原谅','yuánliàng','tha thứ','nguyên lượng'],['在乎','zàihu','để tâm, quan tâm','tại hồ'],['渣男','zhānán','"trai tồi", tra nam','tra nam'],['绿茶','lǜchá','"trà xanh" (giả nai)','lục trà'],
      ['作','zuō','làm mình làm mẩy',''],['骗','piàn','lừa','biển'],['信任','xìnrèn','tin tưởng','tín nhiệm'],['根本','gēnběn','căn bản (không)','căn bản']],
    phrases:[
      ['她是谁？','Tā shì shéi?','Cô ta là ai?','Câu mở màn mọi màn ghen.'],
      ['你根本不在乎我！','Nǐ gēnběn bú zàihu wǒ!','Anh căn bản chẳng để tâm đến em!',''],
      ['你变了。','Nǐ biàn le.','Anh thay đổi rồi.',''],
      ['别生气了，我错了。','Bié shēngqì le, wǒ cuò le.','Đừng giận nữa, anh sai rồi.',''],
      ['这都是误会！','Zhè dōu shì wùhuì!','Đây đều là hiểu lầm!',''],
      ['他就是个渣男！','Tā jiù shì ge zhānán!','Hắn đúng là trai tồi!',''],
      ['我原谅你了。','Wǒ yuánliàng nǐ le.','Em tha thứ cho anh rồi.','']],
    scene:{ t:'Ghen', l:[
      ['Em','她是谁？','Tā shì shéi?','Cô ta là ai?'],
      ['Anh','这都是误会！你听我解释……','Zhè dōu shì wùhuì! Nǐ tīng wǒ jiěshì……','Đây là hiểu lầm! Em nghe anh giải thích…'],
      ['Em','你变了，你根本不在乎我！','Nǐ biàn le, nǐ gēnběn bú zàihu wǒ!','Anh thay đổi rồi, anh chẳng để tâm đến em!'],
      ['Anh','别生气了，我错了，好不好？','Bié shēngqì le, wǒ cuò le, hǎo bu hǎo?','Đừng giận nữa, anh sai rồi, được không?']]},
    chars:'误:wù:lầm|渣:zhā:cặn|本:běn:quyển' },

  { id:'r4', zh:'虐', title:'Chia tay & phim ngược', sub:'放手 · 前任 · 心疼',
    desc:'Những câu làm khán giả khóc hết khăn giấy.',
    words:[
      ['虐','nüè','ngược (đau lòng)','ngược'],['放手','fàngshǒu','buông tay','phóng thủ'],['前任','qiánrèn','người yêu cũ','tiền nhiệm'],['心疼','xīnténg','xót, thương','tâm đông'],
      ['心碎','xīnsuì','tan nát cõi lòng','tâm toái'],['眼泪','yǎnlèi','nước mắt','nhãn lệ'],['哭','kū','khóc','khốc'],['遗憾','yíhàn','tiếc nuối','di hám'],
      ['回不去','huí bu qù','không quay lại được',''],['放下','fàngxià','buông bỏ','phóng hạ'],['幸福','xìngfú','hạnh phúc','hạnh phúc'],['再见','zàijiàn','tạm biệt','tái kiến'],
      ['部','bù','bộ (lượng từ phim)',''],['自己','zìjǐ','bản thân, tự mình','tự kỷ'],['照顾','zhàogù','chăm sóc','chiếu cố'],['祝','zhù','chúc','']],
    phrases:[
      ['我们回不去了。','Wǒmen huí bu qù le.','Chúng ta không thể quay lại được nữa.',''],
      ['放手吧。','Fàngshǒu ba.','Buông tay đi.',''],
      ['看你哭，我会心疼。','Kàn nǐ kū, wǒ huì xīnténg.','Thấy em khóc, anh sẽ xót.',''],
      ['祝你幸福。','Zhù nǐ xìngfú.','Chúc anh hạnh phúc.','Câu chia tay "đẹp" nhưng đau nhất 💔'],
      ['这部剧太虐了！','Zhè bù jù tài nüè le!','Bộ phim này ngược quá!','Bình luận quen thuộc. Ngược lại: 太甜了 (ngọt quá).'],
      ['我已经放下了。','Wǒ yǐjīng fàngxià le.','Tôi đã buông bỏ rồi.','Thường là… chưa buông được 😅'],
      ['好好照顾自己。','Hǎohāo zhàogù zìjǐ.','Hãy chăm sóc bản thân thật tốt.','']],
    scene:{ t:'Chia tay ở ga tàu', l:[
      ['Cô','我们……回不去了。','Wǒmen…… huí bu qù le.','Chúng ta… không quay lại được nữa.'],
      ['Anh','别哭，看你哭，我会心疼。','Bié kū, kàn nǐ kū, wǒ huì xīnténg.','Đừng khóc, thấy em khóc anh sẽ xót.'],
      ['Cô','好好照顾自己。','Hǎohāo zhàogù zìjǐ.','Hãy chăm sóc bản thân thật tốt.'],
      ['Anh','……祝你幸福。','…… Zhù nǐ xìngfú.','…Chúc em hạnh phúc.']]},
    chars:'泪:lèi:lệ|哭:kū:khóc|疼:téng:đau|福:fú:phúc' },

  { id:'r5', zh:'求婚', title:'Cầu hôn & ra mắt', sub:'嫁给我 · 老公 · 见家长',
    desc:'Cái kết đẹp: cầu hôn, đám cưới, "bà xã ơi".',
    words:[
      ['求婚','qiúhūn','cầu hôn','cầu hôn'],['嫁','jià','gả, lấy chồng','giá'],['娶','qǔ','cưới vợ','thú'],['戒指','jièzhi','nhẫn','giới chỉ'],
      ['婚礼','hūnlǐ','đám cưới','hôn lễ'],['老公','lǎogōng','chồng (ông xã)','lão công'],['老婆','lǎopo','vợ (bà xã)','lão bà'],['见家长','jiàn jiāzhǎng','ra mắt phụ huynh','kiến gia trưởng'],
      ['怀孕','huáiyùn','mang thai','hoài dựng'],['一辈子','yíbèizi','cả đời','nhất bối tử'],['答应','dāying','đồng ý','đáp ứng'],['彩礼','cǎilǐ','sính lễ','thái lễ'],
      ['嫁给','jià gěi','gả cho, lấy (chồng)','giá'],['愿意','yuànyì','bằng lòng','nguyện ý']],
    phrases:[
      ['嫁给我，好吗？','Jià gěi wǒ, hǎo ma?','Lấy anh nhé, được không?',''],
      ['我愿意！','Wǒ yuànyì!','Em đồng ý!','Câu trả lời khi được cầu hôn / trong lễ cưới.'],
      ['我想照顾你一辈子。','Wǒ xiǎng zhàogù nǐ yíbèizi.','Anh muốn chăm sóc em cả đời.',''],
      ['老婆，我回来了！','Lǎopo, wǒ huílai le!','Bà xã ơi, anh về rồi!',''],
      ['周末带你去见家长。','Zhōumò dài nǐ qù jiàn jiāzhǎng.','Cuối tuần dẫn em đi ra mắt bố mẹ.',''],
      ['我怀孕了。','Wǒ huáiyùn le.','Em có thai rồi.','Câu "bom tấn" của phim ngắn và phim gia đình 😄']],
    scene:{ t:'Cầu hôn', l:[
      ['Anh','我想照顾你一辈子。','Wǒ xiǎng zhàogù nǐ yíbèizi.','Anh muốn chăm sóc em cả đời.'],
      ['Anh','嫁给我，好吗？','Jià gěi wǒ, hǎo ma?','Lấy anh nhé, được không?'],
      ['Em','我愿意！','Wǒ yuànyì!','Em đồng ý!'],
      ['Bạn bè','亲一个！亲一个！','Qīn yí ge! Qīn yí ge!','Hôn đi! Hôn đi!']]},
    chars:'婚:hūn:hôn|嫁:jià:gả|娶:qǔ:cưới vợ|戒:jiè:giới' }
  ]},

/* ───────────── DOUYIN ───────────── */
{ id:'st', zh:'抖音', name:'Douyin & mạng xã hội', short:'Douyin', color:'blue', track:'fun', requires:'s1',
  desc:'Câu cửa miệng, bình luận, livestream bán hàng, meme và review quán.',
  lessons:[
  { id:'t1', zh:'家人们', title:'Câu cửa miệng Douyin', sub:'家人们 · 谁懂啊 · 笑死',
    desc:'Những câu mở đầu clip và bình luận gặp mỗi ngày.',
    words:[
      ['家人们','jiārénmen','cả nhà ơi (gọi người xem)','gia nhân môn'],['谁懂啊','shéi dǒng a','ai hiểu không trời',''],['笑死','xiào sǐ','cười chết mất','tiếu tử'],['离谱','lípǔ','vô lý, quá đáng','ly phổ'],
      ['上头','shàngtóu','nghiện, "dính"','thượng đầu'],['好家伙','hǎo jiāhuo','ôi trời, ghê thật',''],['真的会谢','zhēn de huì xiè','cạn lời, chịu luôn',''],['服了','fú le','chịu thua, phục rồi','phục liễu'],
      ['绷不住','bēng bu zhù','không nhịn được (cười / khóc)',''],['太真实了','tài zhēnshí le','quá chân thật','thái chân thực'],['我宣布','wǒ xuānbù','tôi tuyên bố','ngã tuyên bố'],['好看','hǎokàn','đẹp; hay (phim)','hảo khán'],
      ['今年','jīnnián','năm nay','kim niên']],
    phrases:[
      ['家人们，谁懂啊！','Jiārénmen, shéi dǒng a!','Cả nhà ơi, ai hiểu cho không!','Câu mở đầu clip than thở / kể chuyện kinh điển trên Douyin.'],
      ['笑死我了！','Xiào sǐ wǒ le!','Cười chết mất!','Bình luận hay viết tắt: "xswl" (笑死我了).'],
      ['这也太离谱了吧！','Zhè yě tài lípǔ le ba!','Cái này vô lý quá vậy!',''],
      ['真的会谢！','Zhēn de huì xiè!','Chịu thật sự luôn!','Mỉa mai "cảm ơn" = hết nói nổi.'],
      ['我直接绷不住了。','Wǒ zhíjiē bēng bu zhù le.','Tôi không nhịn nổi luôn.',''],
      ['我宣布，这是今年最好看的剧！','Wǒ xuānbù, zhè shì jīnnián zuì hǎokàn de jù!','Tôi tuyên bố, đây là phim hay nhất năm nay!','"我宣布…" là kiểu khen "đu idol" phổ biến.'],
      ['越看越上头。','Yuè kàn yuè shàngtóu.','Càng xem càng nghiện.','"越…越…" = càng… càng…']],
    scene:{ t:'Clip than thở', l:[
      ['Blogger','家人们，谁懂啊！','Jiārénmen, shéi dǒng a!','Cả nhà ơi, ai hiểu không!'],
      ['Blogger','今天老板又让我加班。','Jīntiān lǎobǎn yòu ràng wǒ jiābān.','Hôm nay sếp lại bắt mình tăng ca.'],
      ['Blogger','真的会谢，太离谱了！','Zhēn de huì xiè, tài lípǔ le!','Chịu thật luôn, vô lý quá!'],
      ['Bình luận','笑死，太真实了！','Xiào sǐ, tài zhēnshí le!','Cười chết, chân thật quá!']]},
    chars:'笑:xiào:cười|懂:dǒng:hiểu|谢:xiè:cảm ơn|头:tóu:đầu' },

  { id:'t2', zh:'点赞', title:'Like, follow & bình luận', sub:'点赞 · 关注 · 热搜',
    desc:'Ngôn ngữ của nút bấm và phần bình luận.',
    words:[
      ['点赞','diǎnzàn','thả like','điểm tán'],['关注','guānzhù','theo dõi (follow)','quan chú'],['评论','pínglùn','bình luận','bình luận'],['转发','zhuǎnfā','chia sẻ, đăng lại','chuyển phát'],
      ['收藏','shōucáng','lưu (bookmark)','thu tàng'],['粉丝','fěnsī','fan, người hâm mộ',''],['博主','bózhǔ','blogger, người làm nội dung','bác chủ'],['网红','wǎnghóng','người nổi tiếng trên mạng','võng hồng'],
      ['刷','shuā','lướt (video)','loát'],['热搜','rèsōu','hot search, top tìm kiếm','nhiệt sưu'],['短视频','duǎn shìpín','video ngắn','đoản thị tần'],['直播','zhíbō','livestream','trực bá'],
      ['上','shàng','trên; lên',''],['晚上','wǎnshang','buổi tối','vãn thượng'],['这里','zhèlǐ','ở đây',''],['迷路','mílù','lạc đường','mê lộ'],
      ['评论区','pínglùnqū','khu bình luận','bình luận khu'],['键','jiàn','phím, nút','']],
    phrases:[
      ['点赞关注不迷路！','Diǎnzàn guānzhù bù mílù!','Like và follow để không lạc nhau nhé!','Câu "xin follow" cuối clip quen thuộc.'],
      ['一键三连！','Yí jiàn sān lián!','Like, lưu, chia sẻ một lượt!','Gốc từ Bilibili, giờ dùng khắp nơi.'],
      ['上热搜了！','Shàng rèsōu le!','Lên hot search rồi!',''],
      ['我刷了一晚上抖音。','Wǒ shuā le yì wǎnshang Dǒuyīn.','Tôi lướt Douyin cả tối.',''],
      ['评论区见！','Pínglùn qū jiàn!','Gặp nhau ở phần bình luận!',''],
      ['这个博主好有意思。','Zhège bózhǔ hǎo yǒu yìsi.','Blogger này thú vị ghê.','']],
    scene:{ t:'Cuối clip', l:[
      ['Blogger','今天的视频就到这里。','Jīntiān de shìpín jiù dào zhèlǐ.','Video hôm nay đến đây thôi.'],
      ['Blogger','喜欢的话一键三连！','Xǐhuan de huà yí jiàn sān lián!','Thích thì like, lưu, share nhé!'],
      ['Blogger','点赞关注不迷路，拜拜！','Diǎnzàn guānzhù bù mílù, báibái!','Like follow để không lạc nhau, bye!']]},
    chars:'赞:zàn:khen|注:zhù:chú ý|粉:fěn:bột; fan|刷:shuā:lướt' },

  { id:'t3', zh:'直播带货', title:'Livestream bán hàng', sub:'上链接 · 秒杀 · 买它',
    desc:'Phòng live "chốt đơn" — nghe là hiểu ngay đang giảm giá gì.',
    words:[
      ['宝宝们','bǎobaomen','các bé ơi (gọi khách)',''],['链接','liànjiē','link','liên tiếp'],['秒杀','miǎoshā','flash sale (giành từng giây)','miểu sát'],['下单','xiàdān','đặt hàng','hạ đơn'],
      ['库存','kùcún','hàng tồn kho','khố tồn'],['优惠','yōuhuì','ưu đãi','ưu huệ'],['福利','fúlì','quà, phúc lợi','phúc lợi'],['抢','qiǎng','giành, tranh','thương'],
      ['冲','chōng','xông lên, "chốt"','xung'],['原价','yuánjià','giá gốc','nguyên giá'],['划算','huásuàn','hời, đáng tiền','hoạch toán'],['退货','tuìhuò','trả hàng','thoái hóa'],
      ['它','tā','nó (vật)','']],
    phrases:[
      ['宝宝们，上链接！','Bǎobaomen, shàng liànjiē!','Các bé ơi, lên link!','Câu "hét" đặc trưng của livestream bán hàng.'],
      ['买它！买它！买它！','Mǎi tā! Mǎi tā! Mǎi tā!','Mua nó! Mua nó! Mua nó!','Câu cửa miệng nổi tiếng của các "vua livestream".'],
      ['三、二、一，抢！','Sān, èr, yī, qiǎng!','Ba, hai, một, giành!',''],
      ['原价一百九十九，今天只要九块九！','Yuánjià yìbǎi jiǔshíjiǔ, jīntiān zhǐ yào jiǔ kuài jiǔ!','Giá gốc 199, hôm nay chỉ 9 tệ 9!','"九块九" = 9,9 tệ — mức giá "câu khách" kinh điển.'],
      ['库存不多了，冲！','Kùcún bù duō le, chōng!','Hàng không còn nhiều, chốt nhanh!',''],
      ['太划算了吧！','Tài huásuàn le ba!','Hời quá đi!','']],
    scene:{ t:'Phòng live', l:[
      ['Streamer','宝宝们，今天福利来了！','Bǎobaomen, jīntiān fúlì lái le!','Các bé ơi, hôm nay có quà đây!'],
      ['Streamer','原价一百九十九，今天只要九块九！','Yuánjià yìbǎi jiǔshíjiǔ, jīntiān zhǐ yào jiǔ kuài jiǔ!','Giá gốc 199, hôm nay chỉ 9 tệ 9!'],
      ['Khách','太划算了吧！快上链接！','Tài huásuàn le ba! Kuài shàng liànjiē!','Hời quá! Lên link nhanh!'],
      ['Streamer','三、二、一，抢！','Sān, èr, yī, qiǎng!','Ba, hai, một, giành!']]},
    chars:'抢:qiǎng:giành|冲:chōng:xông|价:jià:giá|单:dān:đơn' },

  { id:'t4', zh:'网络梗', title:'Meme & tiếng lóng hot', sub:'拿捏 · 显眼包 · 搭子',
    desc:'Từ lóng mới của giới trẻ — đọc bình luận không còn "lú".',
    words:[
      ['拿捏','nániē','nắm thóp, "làm chủ"',''],['显眼包','xiǎnyǎnbāo','đứa lố, thích gây chú ý','hiển nhãn bao'],['搭子','dāzi','bạn đồng hành (ăn, gym…)',''],['i人','i rén','người hướng nội',''],
      ['e人','e rén','người hướng ngoại',''],['情绪价值','qíngxù jiàzhí','giá trị cảm xúc','tình tự giá trị'],['松弛感','sōngchígǎn','cảm giác thư thái, "chill"',''],['emo','emo','buồn, tâm trạng',''],
      ['发疯','fāfēng','phát điên (xả stress)','phát phong'],['普信男','pǔxìnnán','trai bình thường mà tự tin thái quá','phổ tín nam'],['小丑','xiǎochǒu','tên hề','tiểu sửu'],['芭比Q了','bābǐ Q le','toang rồi (đọc như "barbecue")',''],
      ['帅','shuài','đẹp trai','soái'],['玩','wán','chơi',''],['饭','fàn','cơm',''],['找','zhǎo','tìm','trảo'],
      ['竟','jìng','lại dám, không ngờ',''],['芭','bā','(芭比: búp bê Barbie)','']],
    phrases:[
      ['被他拿捏了。','Bèi tā nániē le.','Bị anh ta nắm thóp rồi.',''],
      ['你真是个显眼包！','Nǐ zhēn shì ge xiǎnyǎnbāo!','Mày đúng là đứa lố!','Nghĩa trêu đùa, thân mật.'],
      ['找个饭搭子。','Zhǎo ge fàn dāzi.','Tìm một "đồng đội" đi ăn.','Có cả 健身搭子 (bạn gym), 旅游搭子 (bạn du lịch).'],
      ['我是i人，别叫我。','Wǒ shì i rén, bié jiào wǒ.','Tôi hướng nội, đừng gọi tôi.',''],
      ['小丑竟是我自己。','Xiǎochǒu jìng shì wǒ zìjǐ.','Hóa ra tên hề là chính tôi.','Meme tự giễu khi mình là người bị lừa / đơn phương.'],
      ['完了，芭比Q了。','Wán le, bābǐ Q le.','Xong rồi, toang thật rồi.','"芭比Q" đọc giống "barbecue" = "nướng chín" = toang.'],
      ['他给足了情绪价值。','Tā gěi zú le qíngxù jiàzhí.','Anh ấy cho đủ "giá trị cảm xúc".','Hay dùng khi khen người yêu biết quan tâm.']],
    scene:{ t:'Nhắn tin bạn thân', l:[
      ['A','周末出去玩吗？','Zhōumò chūqu wán ma?','Cuối tuần đi chơi không?'],
      ['B','我是i人，别叫我。','Wǒ shì i rén, bié jiào wǒ.','Tao hướng nội, đừng gọi.'],
      ['A','有帅哥哦。','Yǒu shuàigē o.','Có trai đẹp đó.'],
      ['B','……几点？我马上到！','…… Jǐ diǎn? Wǒ mǎshàng dào!','…Mấy giờ? Tao tới liền!']]},
    chars:'丑:chǒu:xấu; hề|疯:fēng:điên|感:gǎn:cảm|眼:yǎn:mắt' },

  { id:'t5', zh:'探店', title:'Review quán & check-in', sub:'探店 · 踩雷 · 性价比',
    desc:'Clip ăn uống: quán hot, xếp hàng, "dính phốt", đáng tiền.',
    words:[
      ['探店','tàndiàn','đi review quán','thám điếm'],['网红店','wǎnghóng diàn','quán "hot" trên mạng','võng hồng điếm'],['踩雷','cǎiléi','"dính phốt", gặp quán dở','thải lôi'],['避雷','bìléi','tránh xa (cảnh báo)','tị lôi'],
      ['性价比','xìngjiàbǐ','đáng tiền (giá trị / giá)','tính giá tỷ'],['拔草','bácǎo','đi thử cho hết thèm','bạt thảo'],['好吃到哭','hǎochī dào kū','ngon phát khóc',''],['回购','huígòu','mua lại lần nữa','hồi cấu'],
      ['必点','bì diǎn','món phải gọi','tất điểm'],['味道','wèidào','hương vị','vị đạo'],['一般','yìbān','bình thường','nhất ban'],['高','gāo','cao','cao'],
      ['大家','dàjiā','mọi người','đại gia'],['小时','xiǎoshí','tiếng (giờ đồng hồ)','tiểu thời'],['排','pái','xếp',''],['队','duì','đội, hàng',''],
      ['道','dào','đạo; món (lượng từ)','']],
    phrases:[
      ['今天带大家来探店！','Jīntiān dài dàjiā lái tàndiàn!','Hôm nay dẫn mọi người đi review quán!',''],
      ['排了两个小时队。','Pái le liǎng ge xiǎoshí duì.','Xếp hàng hai tiếng đồng hồ.',''],
      ['踩雷了，大家避雷！','Cǎiléi le, dàjiā bìléi!','Dính quán dở rồi, mọi người tránh nha!',''],
      ['性价比超高！','Xìngjiàbǐ chāo gāo!','Đáng tiền cực kỳ!',''],
      ['这道菜是必点！','Zhè dào cài shì bì diǎn!','Món này nhất định phải gọi!','"道" là lượng từ cho món ăn.'],
      ['味道一般，不会回购。','Wèidào yìbān, bú huì huígòu.','Vị bình thường, sẽ không quay lại.','']],
    scene:{ t:'Review quán', l:[
      ['Blogger','今天带大家来探店！','Jīntiān dài dàjiā lái tàndiàn!','Hôm nay dẫn mọi người đi review quán!'],
      ['Blogger','这家网红店排了两个小时队。','Zhè jiā wǎnghóng diàn pái le liǎng ge xiǎoshí duì.','Quán hot này xếp hàng hai tiếng.'],
      ['Blogger','嗯……味道一般，性价比不高。','Èn…… wèidào yìbān, xìngjiàbǐ bù gāo.','Ừm… vị bình thường, không đáng tiền.'],
      ['Blogger','家人们，避雷！','Jiārénmen, bìléi!','Cả nhà ơi, tránh xa nhé!']]},
    chars:'雷:léi:sấm|味:wèi:vị|队:duì:đội|店:diàn:tiệm' }
  ]},

/* ───────────── PHIM NGẮN 短剧 ───────────── */
{ id:'sj', zh:'短剧', name:'Phim ngắn · Trọng sinh & vả mặt', short:'Phim ngắn', color:'yellow', track:'fun', requires:'s1',
  desc:'Trọng sinh, thiên kim thật giả, long vương, tổng tài — thoại "sảng văn" của phim ngắn.',
  lessons:[
  { id:'j1', zh:'重生', title:'Trọng sinh & phục thù', sub:'重生 · 逆袭 · 打脸',
    desc:'"Kiếp trước ngươi hại ta…" — mở đầu của 90% phim ngắn.',
    words:[
      ['重生','chóngshēng','trọng sinh (sống lại)','trùng sinh'],['逆袭','nìxí','lội ngược dòng','nghịch tập'],['打脸','dǎliǎn','vả mặt','đả kiểm'],['身份','shēnfèn','thân phận','thân phận'],
      ['隐藏','yǐncáng','che giấu','ẩn tàng'],['真千金','zhēn qiānjīn','thiên kim thật','chân thiên kim'],['假千金','jiǎ qiānjīn','thiên kim giả','giả thiên kim'],['看不起','kànbuqǐ','coi thường','khán bất khởi'],
      ['复仇','fùchóu','phục thù','phục cừu'],['上一世','shàng yí shì','kiếp trước','thượng nhất thế'],['这一世','zhè yí shì','kiếp này','giá nhất thế'],['代价','dàijià','cái giá','đại giá'],
      ['付出','fùchū','bỏ ra, trả (giá)','phó xuất'],['害','hài','hại',''],['亡','wáng','chết, mất',''],['啪','pā','bốp! (tiếng tát)',''],
      ['凭','píng','dựa vào','']],
    phrases:[
      ['我重生了！','Wǒ chóngshēng le!','Ta trọng sinh rồi!','Mở đầu của vô số phim ngắn trọng sinh 😄'],
      ['上一世，你害我家破人亡。','Shàng yí shì, nǐ hài wǒ jiā pò rén wáng.','Kiếp trước, ngươi hại ta nhà tan cửa nát.','"家破人亡" = nhà tan người mất.'],
      ['这一世，我要让你付出代价！','Zhè yí shì, wǒ yào ràng nǐ fùchū dàijià!','Kiếp này, ta sẽ bắt ngươi trả giá!',''],
      ['你们都看不起我？','Nǐmen dōu kànbuqǐ wǒ?','Các người đều coi thường tôi sao?',''],
      ['啪啪打脸！','Pāpā dǎliǎn!','Vả mặt bôm bốp!','"啪啪" = tiếng tát.'],
      ['她才是真千金！','Tā cái shì zhēn qiānjīn!','Cô ấy mới là thiên kim thật!','']],
    scene:{ t:'Tập 1', l:[
      ['Nữ chính','我……我重生了？','Wǒ…… wǒ chóngshēng le?','Ta… ta trọng sinh rồi sao?'],
      ['Nữ chính','上一世，你害我家破人亡。','Shàng yí shì, nǐ hài wǒ jiā pò rén wáng.','Kiếp trước, ngươi hại ta nhà tan cửa nát.'],
      ['Nữ chính','这一世，我要让你付出代价！','Zhè yí shì, wǒ yào ràng nǐ fùchū dàijià!','Kiếp này, ta sẽ bắt ngươi trả giá!'],
      ['Phản diện','就凭你？一个废物？','Jiù píng nǐ? Yí ge fèiwù?','Dựa vào cô? Một phế vật?']]},
    chars:'重:chóng:lại; nặng|脸:liǎn:mặt|袭:xí:tập' },

  { id:'j2', zh:'爽剧', title:'Thoại "sảng văn" vả mặt', sub:'你知道我是谁吗 · 跪下',
    desc:'Long vương, chiến thần, "mày có biết tao là ai không?"',
    words:[
      ['跪下','guìxià','quỳ xuống','quỵ hạ'],['董事长','dǒngshìzhǎng','chủ tịch HĐQT','đổng sự trưởng'],['保安','bǎo\'ān','bảo vệ','bảo an'],['赶出去','gǎn chūqu','đuổi ra ngoài',''],
      ['震惊','zhènjīng','chấn kinh, sốc','chấn kinh'],['配','pèi','xứng','phối'],['求','qiú','cầu xin','cầu'],['有眼无珠','yǒuyǎn-wúzhū','có mắt như mù','hữu nhãn vô châu'],
      ['恭迎','gōngyíng','cung nghênh','cung nghênh'],['战神','zhànshén','chiến thần','chiến thần'],['龙王','lóngwáng','long vương','long vương'],['归来','guīlái','trở về',''],
      ['穷','qióng','nghèo','']],
    phrases:[
      ['你知道我是谁吗？','Nǐ zhīdào wǒ shì shéi ma?','Mày có biết tao là ai không?','Câu "kích hoạt vả mặt" — người nói câu này sắp bị vả.'],
      ['保安！把他赶出去！','Bǎo\'ān! Bǎ tā gǎn chūqu!','Bảo vệ! Đuổi hắn ra ngoài!',''],
      ['你也配？','Nǐ yě pèi?','Mày cũng xứng à?',''],
      ['跪下！','Guìxià!','Quỳ xuống!',''],
      ['恭迎龙王归来！','Gōngyíng Lóngwáng guīlái!','Cung nghênh Long Vương trở về!','Meme "Long Vương ở rể" nổi tiếng của phim ngắn.'],
      ['我错了，求求你原谅我！','Wǒ cuò le, qiúqiu nǐ yuánliàng wǒ!','Tôi sai rồi, xin anh tha thứ cho tôi!',''],
      ['全场震惊！','Quánchǎng zhènjīng!','Cả khán phòng chấn động!','']],
    scene:{ t:'Bữa tiệc', l:[
      ['Phản diện','保安！把这个穷鬼赶出去！','Bǎo\'ān! Bǎ zhège qióngguǐ gǎn chūqu!','Bảo vệ! Đuổi thằng nghèo kiết này ra!'],
      ['Nam chính','你知道我是谁吗？','Nǐ zhīdào wǒ shì shéi ma?','Mày có biết tao là ai không?'],
      ['Mọi người','恭迎龙王归来！','Gōngyíng Lóngwáng guīlái!','Cung nghênh Long Vương trở về!'],
      ['Phản diện','我错了，求求你原谅我！','Wǒ cuò le, qiúqiu nǐ yuánliàng wǒ!','Tôi sai rồi, xin tha thứ cho tôi!']]},
    chars:'跪:guì:quỳ|配:pèi:xứng|龙:lóng:rồng|战:zhàn:chiến' },

  { id:'j3', zh:'豪门', title:'Tổng tài & hào môn', sub:'闪婚 · 契约 · 白月光',
    desc:'Hợp đồng hôn nhân, thế thân, bạch nguyệt quang.',
    words:[
      ['霸道总裁','bàdào zǒngcái','tổng tài bá đạo','bá đạo tổng tài'],['豪门','háomén','hào môn, nhà giàu','hào môn'],['千金','qiānjīn','thiên kim tiểu thư','thiên kim'],['少爷','shàoye','thiếu gia','thiếu gia'],
      ['闪婚','shǎnhūn','cưới chớp nhoáng','thiểm hôn'],['契约','qìyuē','khế ước, hợp đồng','khế ước'],['离婚','líhūn','ly hôn','ly hôn'],['签字','qiānzì','ký tên','thiêm tự'],
      ['白月光','báiyuèguāng','"bạch nguyệt quang" (tình đầu khó quên)','bạch nguyệt quang'],['替身','tìshēn','thế thân','thế thân'],['未婚妻','wèihūnqī','vị hôn thê','vị hôn thê'],['继承人','jìchéngrén','người thừa kế','kế thừa nhân'],
      ['签了','qiān le','đã ký',''],['离婚协议','líhūn xiéyì','thỏa thuận ly hôn',''],['少奶奶','shàonǎinai','mợ chủ, thiếu phu nhân',''],['像','xiàng','giống','']],
    phrases:[
      ['签了这份契约。','Qiān le zhè fèn qìyuē.','Ký bản khế ước này đi.',''],
      ['我们闪婚吧。','Wǒmen shǎnhūn ba.','Chúng ta cưới chớp nhoáng đi.',''],
      ['你只是她的替身。','Nǐ zhǐ shì tā de tìshēn.','Cô chỉ là thế thân của cô ấy.','Trope "ngược" kinh điển.'],
      ['她是我的白月光。','Tā shì wǒ de báiyuèguāng.','Cô ấy là bạch nguyệt quang của tôi.',''],
      ['离婚协议我已经签了。','Líhūn xiéyì wǒ yǐjīng qiān le.','Đơn ly hôn tôi đã ký rồi.',''],
      ['少爷，少奶奶又跑了！','Shàoye, shàonǎinai yòu pǎo le!','Thiếu gia, thiếu phu nhân lại bỏ trốn rồi!','Phiên bản hiện đại của "vương phi lại bỏ trốn" 😄']],
    scene:{ t:'Hợp đồng hôn nhân', l:[
      ['Tổng tài','签了这份契约，我们闪婚。','Qiān le zhè fèn qìyuē, wǒmen shǎnhūn.','Ký khế ước này, chúng ta cưới chớp nhoáng.'],
      ['Nữ chính','为什么是我？','Wèishénme shì wǒ?','Tại sao lại là tôi?'],
      ['Tổng tài','因为你很像她。','Yīnwèi nǐ hěn xiàng tā.','Vì cô rất giống cô ấy.'],
      ['Nữ chính','原来……我只是个替身。','Yuánlái…… wǒ zhǐ shì ge tìshēn.','Hóa ra… tôi chỉ là thế thân.']]},
    chars:'豪:háo:hào|签:qiān:ký|替:tì:thay|约:yuē:ước' }
  ]}
);
