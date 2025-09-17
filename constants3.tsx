// Aspect Ratios for UI
export const ASPECT_RATIOS = ['2:1', '16:9', '3:2', '1:1', '2:3', '9:16', '1:2'] as const;

// Aspect Ratios supported directly by the Imagen API
export const API_SUPPORTED_ASPECT_RATIOS = ["16:9" , "3:2" , "1:1" , "2:3" , "9:16" ];

// --- VEO Constants ---
export const VEO_ASPECT_RATIOS: ReadonlyArray<"16:9" | "1:1" | "9:16"> = ['16:9', '1:1', '9:16'] as const;

export const VEO_MEME_PROMPTS = [
    { label: '一切都很好', prompt: "『This is Fine』迷因裡的柴犬，戴著太陽眼鏡坐在燃燒的沙灘椅上，周圍是海嘯警報，牠啜飲著一杯小雨傘著火的飲料，輕聲說：『沒事的。』" },
    { label: '永恆的節拍', prompt: "薛西弗斯（Sisyphus）在一個地下電音派對上擔任 DJ，音樂是他推著巨石上山的沉重撞擊聲，每當巨石滾落時就是一次『Drop』，台下是面無表情、隨節奏搖擺的殭屍。" },
    { label: '企業塗鴉', prompt: "一位面帶虛偽微笑的人力資源經理，在午夜用過期咖啡和螢光筆，在公司大樓外牆上噴塗『我們是個大家庭』和『提升協同效應』等標語。" },
    { label: '深海瘟疫', prompt: "一位中世紀瘟疫醫生穿著全套鳥嘴面具裝備，在充滿塑膠袋和廢棄物的混濁海底「治療」一隻變異的魚。" },
    { label: '克蘇魯吃播', prompt: "一位美食網紅正直播開箱一本用海草包裹、會蠕動的《死靈之書》，並用叉子戳著書頁上長出的觸手，對著鏡頭說：『嘿，各位粉絲，今天我們來嚐嚐遠古的恐懼！』" },
    { label: '究極鍛鍊', prompt: "『Gigachad』迷因裡的那個男人，在健身房裡不是舉啞鈴，而是用槓鈴舉著自己巨大的下巴，鏡子裡反射出他完美的下顎線。" },
    { label: '末日騎士', prompt: "『分心男友』迷因裡的那個男友，騎著一輛重型機車，回頭看著一個新出現的「災難預兆」（彗星），而他的女友（代表「現有的全球危機」）在他身後憤怒地大喊。" },
    { label: '太空垃圾人', prompt: "一位在太空站工作的清潔工，穿著笨重的太空服，用一支長長的夾子費力地將一個漂浮的披薩盒塞進已經滿出來的太空垃圾桶裡。" },
    { label: '賽博禪修', prompt: "一個有著七彩跑馬燈的電競主機，被放置在日本寺廟的枯山水庭園中央，發出嗡嗡的風扇聲，試圖在數位世界與現實之間尋求內心的平靜。" },
    { label: '地獄廚房', prompt: "一位惡魔在電視廚藝大賽上，用靈魂和悔恨作為調味料，烹煮一道名叫「永恆的折磨」的菜餚，評審嚐了一口後流下了感動（或痛苦）的淚水。" },
    { label: '存在主義偵探', prompt: "一個被畫壞的火柴人偵探，站在一片虛無的白色背景中，對著地上一條鉛筆線索喃喃自語：『這一切的意義是什麼？是誰畫下了我？』" },
    { label: 'NFT農夫', prompt: "一位穿著格子衫的農夫，在他-的虛擬農場裡，驕傲地抱著一顆他剛「挖礦」挖出來、價值三百萬美金的巨大像素化南瓜 JPEG 檔案。" },
    { label: '線上對線', prompt: "一位鍵盤戰士戴著VR頭盔，坐在堆滿能量飲料空罐的電競椅上，正用一套價值不菲的模擬器，與論壇上的另一個網友進行激烈的「真人快打」。" },
    { label: '演算法管理員', prompt: "YouTube 的演算法化身為一個疲憊的圖書館員，面對堆積如山的影片，它隨手拿起一個貓咪影片和一個陰謀論影片，然後把它們一起蓋上「推薦」的印章。" },
    { label: '打卡聖地', prompt: "一位喪屍網紅背著登山包，在傾頹的末日城市廢墟中擺出陽光開朗的姿勢自拍，並在照片下標註：#末日旅行 #廢土風 #活在當下。" },
    { label: '選擇困難症', prompt: "哲學家沙特推著購物車，在宜家（IKEA）面對兩款幾乎一模一樣的置物櫃，陷入了關於「自由選擇的重負」的深度思考，最終癱坐在地上。" },
    { label: '情緒勞動', prompt: "一位微笑面具人（Wojak 迷因）在咖啡店擔任咖啡師，面具上掛著燦爛的笑容，但面具下滴著眼淚，為客人拉花時手微微顫抖。" },
    { label: '精神內耗', prompt: "兩隻正在打架的貓（Cat Fight 迷因），在山頂上試圖一起完成一個雙人瑜珈動作，結果扭打了起來。" },
    { label: '濾鏡人生', prompt: "一位開了十級美顏濾鏡的網路主播，在羅馬競技場前直播，濾鏡嚴重變形，把後面的古蹟都P成了光滑的圓柱體。" },
    { label: '安慰劑市場', prompt: "一位穿著白袍的庸醫，在農夫市集上販售他自己裝瓶的「正能量空氣」和「有機安慰劑藥丸」，生意絡繹不絕。" },
    { label: '知識的詛咒', prompt: "一位剛學會上網的穴居人，在大學講堂裡用石板展示他從網路論壇上學到的「地球是平的」理論，台下學生一片茫然。" },
    { label: '待辦事項', prompt: "死神在他的車庫裡，拿著一把巨大的鐮刀，笨拙地修理一台卡住的印表機，因為「死亡名單」列印不出來，導致他今天的工作嚴重延遲。" },
    { label: '觀景窗悖論', prompt: "薛丁格的貓身穿迷彩服，拿著一台相機，悄悄地拍攝一隻既存在又不存在的獅子。" },
    { label: '資本主義的抉擇', prompt: "一個身穿西裝的華爾街之狼，在超市的冰淇淋區，正在用複雜的股票分析模型，計算哪一種口味的冰淇淋能帶來最高的「幸福感投資報酬率」。" },
    { label: '無盡的循環', prompt: "一隻正在電腦前打字的倉鼠，在地下酒吧擔任鼓手，用牠小小的爪子在一個滾輪改造的鼓上瘋狂奔跑，製造出快速但單調的節奏。" },
    { label: '畫大餅', prompt: "一位新創公司的 CEO，穿著黑色高領毛衣，在空無一物的會議室裡，對著一群想像出來的投資人，激情地介紹他那個能「顛覆人類生活」的共用單車App。" },
    { label: '數位典藏', prompt: "一個病毒（電腦病毒），在博物館裡欣賞著一幅由藍白當機畫面構成的數位藝術品，看得入了迷。" },
    { label: '物理Bug', prompt: "一位遊戲裡的 NPC（非玩家角色），因為程式碼出錯，從飛機上跳下來後卡在了半空中，保持著自由落體的姿勢，表情茫然。" },
    { label: '最後一哩路', prompt: "一位外送平台的外送員，騎著一匹筋疲力盡的殭屍馬，背著外送箱，穿梭在充滿惡靈的街道上，只是為了一單即將超時的訂單。" },
    { label: '資訊繭房', prompt: "一個被演算法餵養大的年輕人，穿著睡衣癱在沙發上，電視、手機、平板同時播放著同一個網紅推薦的同一部劇，爆米花是演算法推薦的口味。" }
];

export const UNIFIED_DIRECTOR_STYLES = [
    { name: '世界知名導演', prompt: '' },
    { name: 'Abbas Kiarostami (阿巴斯·奇亞羅斯塔米)', prompt: '伊朗新浪潮，模糊紀錄片與劇情片的界線，兒童視角，對生命意義的哲學探討，如《橄欖樹下的情人》。' },
    { name: 'Akira Kurosawa (黑澤明)', prompt: '武士精神與榮譽，大氣磅礴的史詩感，運用多機位拍攝和精準的構圖，如《七武士》般古典而永恆。' },
    { name: 'Alfonso Cuarón (阿方索·卡隆)', prompt: '長鏡頭的敘事魔力，如《人類之子》般緊張壓抑的科幻末日，或《羅馬》般細膩的個人史詩，情感豐富。' },
    { name: 'Andrei Tarkovsky (安德烈·塔可夫斯基)', prompt: '詩意的長鏡頭，對記憶、信仰和自然的深刻思考，緩慢而沉靜的節奏，如《潛行者》。' },
    { name: 'Ang Lee (李安)', prompt: '細膩的情感刻畫，東西方文化交融的衝突與和解，如《臥虎藏龍》般詩意與武俠的結合，或《少年Pi的奇幻漂流》般壯麗的視覺史詩。' },
    { name: 'Antoine Fuqua', prompt: 'The scene is directed in the signature style of Antoine Fuqua. The action is visceral and hard-hitting, with a focus on character-driven conflict and the brutal consequences of violence. The visuals are often dark, stylish, and intense.' },
    { name: 'Ava DuVernay (艾娃·杜威內)', prompt: '歷史題材中的種族與正義，強大的情感驅動，如《逐夢大道》般鼓舞人心。' },
    { name: 'Bernardo Bertolucci (貝爾納多·貝托魯奇)', prompt: '史詩般的政治與情慾糾葛，華麗的視覺風格，如《末代皇帝》。' },
    { name: 'Bong Joon-ho (奉俊昊)', prompt: '社會批判與黑色幽默，類型片結構下的階級矛盾，如《寄生上流》般從荒誕走向驚悚的氛圍。' },
    { name: 'Brad Bird', prompt: 'The scene is directed in the signature style of Brad Bird. The action is inventive, beautifully choreographed, and spatially clear, whether in animation or live-action. The sequences are a masterclass in building suspense and excitement through clever staging.' },
    { name: 'Chad Stahelski (John Wick)', prompt: 'The scene is directed in the signature style of Chad Stahelski. Showcase "gun-fu" with clean, wide-angle long takes that emphasize choreography. The lighting is heavily influenced by neon, with deep shadows and a sleek, modern, and brutal aesthetic.' },
    { name: 'Chloé Zhao (趙婷)', prompt: '自然風景中的個人故事，寫實的鏡頭捕捉邊緣人物的生存狀態，如《游牧人生》般詩意而真實。' },
    { name: 'Christopher McQuarrie', prompt: 'The scene is directed in the signature style of Christopher McQuarrie. Feature complex, high-stakes action sequences that are meticulously planned and executed with a focus on practical effects and clear, coherent geography.' },
    { name: 'Christopher Nolan (克里斯多福·諾蘭)', prompt: '燒腦的非線性敘事，時間與記憶的哲學探討，IMAX級的宏大視覺效果，低沉配樂，如《全面啟動》或《星際效應》。' },
    { name: 'Clint Eastwood (克林·伊斯威特)', prompt: '經典的西部片或犯罪片風格，深沉的男性氣概，簡單而有力的敘事，如《不可饒恕》。' },
    { name: 'Coen Brothers (科恩兄弟)', prompt: '黑色幽默與荒誕諷刺，犯罪故事與意外事件，獨特的對白和地域特色，如《冰血暴》。' },
    { name: 'Corey Yuen (元奎)', prompt: 'The scene is directed in the signature style of Corey Yuen. The action is a showcase of high-flying, acrobatic martial arts. The choreography is elegant and powerful, blending traditional kung fu with modern cinematic techniques for maximum visual impact.' },
    { name: 'Daniels - Kwan & Scheinert (丹尼爾·關 & 丹尼爾·舒奈特)', prompt: '瘋狂的創意和天馬行空的敘事，多重宇宙的視覺盛宴，如《媽的多重宇宙》般充滿想像力。' },
    { name: 'David Ayer', prompt: 'The scene is directed in the signature style of David Ayer. The action is gritty, tactical, and grounded in street-level realism. The camera is often in the thick of the fight, capturing the raw and chaotic nature of urban combat.' },
    { name: 'David Fincher (大衛·芬奇)', prompt: '冷峻的藍灰色調，精準的剪輯和鏡頭控制，探討人性的黑暗面，如《社群網戰》或《火線追緝令》般的懸疑與緊張。' },
    { name: 'David Leitch', prompt: 'The scene is directed in the signature style of David Leitch. A former stuntman, the action is clean, creative, and built around incredible stunt work. The choreography is top-notch, with a neon-lit, stylish, and often humorous tone.' },
    { name: 'David Lynch (大衛·林奇)', prompt: '超現實主義，詭異的夢境與潛意識，扭曲的現實和神秘符號，如《穆赫蘭大道》般迷幻。' },
    { name: 'Denis Villeneuve', prompt: 'The scene is directed in the signature style of Denis Villeneuve. The action is tense, brutal, and grounded in a stark reality. Use a muted color palette and immersive sound design to create a sense of overwhelming scale and suspense.' },
    { name: 'Doug Liman', prompt: 'The scene is directed in the signature style of Doug Liman. The action has a sense of grounded, innovative realism. The camera work is often handheld and immersive, creating a feeling of immediacy and clever, on-the-fly problem-solving.' },
    { name: 'Edgar Wright', prompt: 'The scene is directed in the signature style of Edgar Wright. The action is tightly choreographed to the rhythm of the music, with kinetic, whip-pan editing, and a heavy use of visual comedy and creative sound design.' },
    { name: 'Edward Yang (楊德昌)', prompt: '台北都市生活群像，理性而冷靜的鏡頭，對人際關係和現代化的批判，如《牯嶺街少年殺人事件》。' },
    { name: 'F. Gary Gray', prompt: 'The scene is directed in the signature style of F. Gary Gray. Craft slick, large-scale action sequences, especially car chases, with a high-energy, commercial aesthetic. The action is exciting, well-shot, and often has a heist or street-racing flavor.' },
    { name: 'Federico Fellini (費德里柯·費里尼)', prompt: '魔幻現實主義，對社會和人性的諷刺，嘉年華般的熱鬧場景與荒誕元素，如《八又二分之一》。' },
    { name: 'François Truffaut (楚浮)', prompt: '新浪潮的浪漫主義，對童年和愛情的探索，流暢的敘事和人道關懷，如《四百擊》。' },
    { name: 'Gareth Evans', prompt: 'The scene is directed in the signature style of Gareth Evans. Showcase brutal and intricate Silat martial arts with dynamic, flowing camera work that moves with the fighters. The editing is fast-paced, highlighting the raw impact of every blow.' },
    { name: 'George Miller (Mad Max)', prompt: 'The scene is directed in the signature style of George Miller. Create a sense of practical, kinetic chaos. Use tight, center-framed shots on the action, rapid-fire editing, and a vibrant, often monochromatic desert color palette to create relentless forward momentum.' },
    { name: 'Greta Gerwig (葛莉塔·潔薇)', prompt: '女性成長與自我探索，充滿智慧和幽默的對白，如《淑女鳥》或《小婦人》般真誠而生動。' },
    { name: 'Guillermo del Toro (吉勒摩·戴托羅)', prompt: '哥德式奇幻美學，怪物與人性的界線模糊，如《水形物語》般黑暗浪漫的童話故事。' },
    { name: 'Guy Ritchie', prompt: 'The scene is directed in the signature style of Guy Ritchie. Use a frenetic mix of speed-ramping, quick cuts, and gritty, street-level action, often accompanied by witty narration or dialogue and a cool, stylish soundtrack.' },
    { name: 'Hayao Miyazaki (宮崎駿)', prompt: '手繪動畫的奇幻世界，環保與和平的主題，充滿想像力的生物和場景，如《神隱少女》般溫暖而深邃。' },
    { name: 'Hirokazu Kore-eda (是枝裕和)', prompt: '平實細膩的家庭故事，日常對話中的情感流動，呈現《小偷家族》般溫暖而感傷的現實主義。' },
    { name: 'Hou Hsiao-Hsien (侯孝賢)', prompt: '台灣新電影代表，長鏡頭的日常捕捉，對歷史與鄉愁的詩意呈現，如《悲情城市》。' },
    { name: 'Ingmar Bergman (英格瑪·柏格曼)', prompt: '對信仰、死亡和人際關係的哲學探討，黑白影像的強烈對比，特寫鏡頭中的人物內心，如《第七封印》。' },
    { name: 'J.J. Abrams', prompt: 'The scene is directed in the signature style of J.J. Abrams. The action is fast-paced and full of spectacle, characterized by signature lens flares, a constantly moving camera, and a sense of mystery and adventure.' },
    { name: 'James Cameron', prompt: 'The scene is directed in the signature style of James Cameron. Combine high-stakes, technologically advanced action with a strong emotional core. Use a cool, blue-tinted color palette, and depict large-scale, meticulously detailed set pieces.' },
    { name: 'James Wan', prompt: 'The scene is directed in the signature style of James Wan. The camera is incredibly dynamic, moving through environments in long, seemingly impossible takes. The action is a blend of horror kinetics and high-octane spectacle.' },
    { name: 'Jean-Luc Godard (尚盧·高達)', prompt: '法國新浪潮的代表，跳躍剪輯，打破第四道牆，對電影形式的實驗，如《斷了氣》。' },
    { name: 'Jia Zhangke (賈樟柯)', prompt: '中國社會變遷下的個體命運，寫實而沉鬱的風格，大量非專業演員，如《三峽好人》。' },
    { name: 'John Cassavetes (約翰·卡薩維蒂)', prompt: '寫實的即興表演，對人物心理的深入挖掘，獨立電影的粗獷感，如《受影響的女人》。' },
    { name: 'John McTiernan', prompt: 'The scene is directed in the signature style of John McTiernan. Craft suspenseful, spatially aware action sequences. Utilize wide-angle lenses and clever blocking to make the environment a key part of the action, with a focus on a lone, resourceful hero.' },
    { name: 'John Woo (吳宇森)', prompt: 'The scene is directed in the signature style of John Woo. Feature hyper-stylized "heroic bloodshed" gun-fu, with dramatic slow-motion, dynamic dove-like visual motifs, and intense, emotionally charged action.' },
    { name: 'Johnnie To (杜琪峰)', prompt: 'The scene is directed in the signature style of Johnnie To. Feature meticulously staged, static-camera shootouts where positioning and strategy are key. The action is tense, minimalist, and punctuated by sudden bursts of violence.' },
    { name: 'Justin Lin', prompt: 'The scene is directed in the signature style of Justin Lin. Known for large-scale, physics-defying vehicular action. The sequences are elaborate, over-the-top, and executed with a slick, blockbuster sensibility.' },
    { name: 'Kathryn Bigelow', prompt: 'The scene is directed in the signature style of Kathryn Bigelow. Employ a gritty, visceral, and immersive documentary style. Use handheld cameras and long takes to create a sense of chaotic realism and intense, life-or-death tension.' },
    { name: 'Kenji Mizoguchi (溝口健二)', prompt: '對女性悲劇命運的深刻描繪，長鏡頭與精緻的構圖，如《雨月物語》般古典而淒美。' },
    { name: 'Kim Jee-woon (金知雲)', prompt: 'The scene is directed in the signature style of Kim Jee-woon. Blend stylish, genre-inflected action with high-octane energy. The visuals are polished and dynamic, whether in a Western-style shootout, a spy thriller chase, or a tale of brutal revenge.' },
    { name: 'Lars von Trier (拉斯·馮·提爾)', prompt: '極具爭議的實驗性風格，對人性的黑暗面進行極端探索，手持攝影與自然光，如《破浪》。' },
    { name: 'Lena Dunham (莉娜·杜漢)', prompt: '年輕女性在城市中的掙扎與成長，帶有自嘲與真實感的幽默，如《女孩我最大》的坦率。' },
    { name: 'Luc Besson', prompt: 'The scene is directed in the signature style of Luc Besson. The action is slick, highly stylized, and has a European "cinéma du look" sensibility. The visuals are colorful and cool, often centered around a memorable, formidable protagonist.' },
    { name: 'Luis Buñuel (路易斯·布紐爾)', prompt: '超現實主義，對宗教和資產階級的諷刺，夢境與現實的交織，如《中產階級的審慎魅力》。' },
    { name: 'Martin Scorsese (馬丁·史柯西斯)', prompt: '粗獷寫實的城市生活，罪惡與救贖的主題，快速剪輯與獨白，呈現《好傢伙》或《計程車司機》般的黑幫史詩。' },
    { name: 'Matthew Vaughn', prompt: 'The scene is directed in the signature style of Matthew Vaughn. Showcase inventive, hyper-violent, and flawlessly choreographed action set pieces, often set to anachronistic music, with a slick, energetic, and unapologetically stylish flair.' },
    { name: 'Michael Bay', prompt: 'The scene is directed in the signature style of Michael Bay. Incorporate "Bayhem" aesthetics: massive explosions, epic-scale destruction, sweeping low-angle tracking shots, dramatic lens flares, and a high-contrast, saturated color palette.' },
    { name: 'Michael Haneke (麥可·哈內克)', prompt: '對現代社會的冷酷批判，心理驚悚與暴力，長鏡頭和疏離感，如《鋼琴教師》。' },
    { name: 'Neill Blomkamp', prompt: 'The scene is directed in the signature style of Neill Blomkamp. Blend gritty, realistic action with futuristic sci-fi concepts. The visuals have a documentary feel, with realistic VFX and a focus on social commentary within the action.' },
    { name: 'Park Chan-wook (朴贊郁)', prompt: 'The scene is directed in the signature style of Park Chan-wook. The action is a brutal, beautifully composed, and often single-take "hallway fight" sequence. The violence is raw and visceral, framed with a meticulous, almost operatic elegance.' },
    { name: 'Paul Greengrass', prompt: 'The scene is directed in the signature style of Paul Greengrass. Utilize a shaky-cam, documentary-like "cinéma vérité" style. The editing is rapid and disorienting, creating a chaotic and intensely realistic sense of immersion in the action.' },
    { name: 'Paul Thomas Anderson (保羅·湯瑪斯·安德森)', prompt: '複雜的人物心理，社會邊緣人的故事，流暢的攝影機運動，如《黑金企業》般史詩。' },
    { name: 'Paul Verhoeven', prompt: 'The scene is directed in the signature style of Paul Verhoeven. The action is shockingly violent, over-the-top, and often serves as a satirical commentary on society. The visuals are graphic, explosive, and unapologetically brutal.' },
    { name: 'Pedro Almodóvar (佩德羅·阿莫多瓦)', prompt: '鮮豔的色彩與巴洛克風格，複雜的女性視角和情感糾葛，西班牙文化與戲劇性，如《玩美女人》。' },
    { name: 'Peter Berg', prompt: 'The scene is directed in the signature style of Peter Berg. The action is chaotic, intense, and grounded in a sense of patriotic, real-world heroism. The editing is fast and the camera is often right in the middle of the conflict.' },
    { name: 'Prachya Pinkaew', prompt: 'The scene is directed in the signature style of Prachya Pinkaew. The action highlights the raw, bone-crunching power of Muay Thai. The choreography is grounded and brutal, with a focus on practical stunts that showcase the incredible athleticism of the performers.' },
    { name: 'Quentin Tarantino (昆汀·塔倫提諾)', prompt: '非線性敘事，風格化的暴力美學，大量流行文化引用和經典配樂，對白充滿張力，如《黑色追緝令》般獨特。' },
    { name: 'Ridley Scott', prompt: 'The scene is directed in the signature style of Ridley Scott. Create a richly detailed, atmospheric world. The action is often brutal and realistic, framed with a painterly eye for composition and texture, whether in historical epics or sci-fi horror.' },
    { name: 'Ringo Lam (林嶺東)', prompt: 'The scene is directed in the signature style of Ringo Lam. Create a gritty, realistic, and often desperate sense of action. The violence is unglamorous and impactful, with characters pushed to their absolute limits in chaotic urban environments.' },
    { name: 'Sam Peckinpah', prompt: 'The scene is directed in the signature style of Sam Peckinpah. The action is a chaotic, slow-motion ballet of violence. The editing is complex and multi-angled, emphasizing the brutal and tragic consequences of every gunshot.' },
    { name: 'Sarah Polley (莎拉·波利)', prompt: '對家庭關係和記憶的細膩探討，充滿同情心的角色塑造，如《她的時代》般深刻而動人。' },
    { name: 'Sergio Leone (賽吉歐·李昂尼)', prompt: '經典義大利西部片，特寫鏡頭和廣闊的沙漠風景形成對比，沉默與暴力並存，如《黃昏三鏢客》。' },
    { name: 'Shane Black', prompt: 'The scene is directed in the signature style of Shane Black. The action is a subversion of genre tropes, often witty, and punctuated by sharp dialogue. The sequences are typically set against a Christmas backdrop and feature buddy-cop dynamics.' },
    { name: 'Stanley Kubrick (史丹利·庫柏力克)', prompt: '冰冷而精確的攝影，對稱構圖，宏大的哲學命題，如《2001太空漫遊》或《發條橘子》。' },
    { name: 'Steven Spielberg (史蒂芬·史匹柏)', prompt: '宏偉的史詩感，探索人性的善惡與希望，運用經典的攝影機運動和音樂，營造《侏羅紀公園》或《E.T.》般的奇幻與冒險。' },
    { name: 'Takashi Miike (三池崇史)', prompt: 'The scene is directed in the signature style of Takashi Miike. The action is surreal, often absurdly violent, and completely unpredictable. The tone can shift from slapstick comedy to horrifying brutality in an instant.' },
    { name: 'Takeshi Kitano (北野武)', prompt: 'The scene is directed in the signature style of Takeshi Kitano. The action is characterized by minimalist long takes, abrupt and shocking moments of violence, and a detached, almost serene aesthetic that contrasts with the brutality.' },
    { name: 'Terrence Malick (泰倫斯·馬力克)', prompt: '詩意的自然光攝影，旁白與意識流敘事，探索人與自然的關係，如《生命之樹》。' },
    { name: 'The Wachowskis (The Matrix)', prompt: 'The scene is directed in the signature style of The Wachowskis. Utilize iconic "bullet time" slow-motion effects, intricate wire-fu martial arts, a cool green and black color grade, and a sense of reality-bending, high-concept action.' },
    { name: 'Timo Tjahjanto', prompt: 'The scene is directed in the signature style of Timo Tjahjanto. The action is relentlessly brutal, gory, and masterfully choreographed. The violence is extreme and visceral, pushing the boundaries of the action genre with a horror-infused intensity.' },
    { name: 'Timur Bekmambetov', prompt: 'The scene is directed in the signature style of Timur Bekmambetov. The action is defined by a wildly inventive use of extreme slow-motion, physics-bending special effects, and a unique visual flair that often feels like a graphic novel brought to life.' },
    { name: 'Tony Scott', prompt: 'The scene is directed in the signature style of Tony Scott. Use a hyper-kinetic style with rapid-fire editing, saturated colors, and a restless camera. The action is slick, high-energy, and has the feel of a high-budget music video.' },
    { name: 'Tsai Ming-liang (蔡明亮)', prompt: '極簡主義的長鏡頭，城市邊緣人物的疏離與孤寂，少對白，注重環境聲和肢體語言，如《愛情萬歲》。' },
    { name: 'Tsui Hark (徐克)', prompt: 'The scene is directed in the signature style of Tsui Hark. Depict fantastical Wuxia-style action with gravity-defying wire-fu, rapid, almost chaotic editing, and imaginative special effects that create a whirlwind of motion and energy.' },
    { name: 'Vittorio De Sica (維托里奧·德西卡)', prompt: '義大利新現實主義，關注二戰後普通人的掙扎，如《偷自行車的人》般感人。' },
    { name: 'Walter Hill', prompt: 'The scene is directed in the signature style of Walter Hill. The action is tough, masculine, and minimalist, with a cool, almost mythic quality. The visuals are gritty and often have a neo-western or comic book-like simplicity.' },
    { name: 'Wes Anderson (韋斯·安德森)', prompt: '極致對稱的構圖，鮮豔飽和的復古色調，古怪的角色和細膩的道具設計，充滿童話感，如《布達佩斯大飯店》。' },
    { name: 'William Friedkin', prompt: 'The scene is directed in the signature style of William Friedkin. Capture a raw, documentary-level of realism. The action, especially car chases, is visceral, dangerous, and feels completely out of control.' },
    { name: 'Wong Kar-wai (王家衛)', prompt: 'The scene is directed in the signature style of Wong Kar-wai. While not a typical action director, capture the moment with a dreamy, atmospheric quality. Use step-printing for blurred motion, neon-drenched, moody lighting, and tight, intimate framing to create a sense of poetic, fleeting intensity.' },
    { name: 'Woody Allen (伍迪·艾倫)', prompt: '知識分子式的幽默對白，對愛情、生活和死亡的哲學思考，城市背景，如《安妮霍爾》。' },
    { name: 'Yasujirō Ozu (小津安二郎)', prompt: '日常生活的溫馨與感傷，固定機位，低機位視角，家庭關係的細膩觀察，如《東京物語》。' },
    { name: 'Yuen Woo-ping (袁和平)', prompt: 'The scene is directed by the legendary martial arts choreographer Yuen Woo-ping. The focus is on intricate, inventive, and masterfully executed hand-to-hand combat and weapon choreography, captured with clear, dynamic camera work that highlights the skill of the fighters.' },
    { name: 'Zack Snyder', prompt: 'The scene is directed in the signature style of Zack Snyder. Employ dramatic speed ramping (alternating between slow-motion and high-speed), high-contrast "crushed blacks" visuals, and carefully composed shots that resemble epic comic book panels.' },
    { name: 'Zhang Yimou (張藝謀)', prompt: '色彩斑斕的視覺美學，史詩般的歷史背景，對抗強權或命運的主題，如《英雄》般詩意的武俠。' }
];

// Example prompts for the initial screen
export const EXAMPLE_PROMPTS = [
    '一隻可愛的貓咪太空人，漂浮在銀河中',
    '一座未來城市的霓虹燈夜景，賽博龐克風格',
    '一幅梵高風格的向日葵星夜畫',
    '一座維多利亞時代的豪宅，住著傳說中的吸血鬼',
    '一位身穿盔甲的女騎士，站在山頂上',
    '一個廢棄的太空站，被外星人佔領',
    '一片超現實的沙漠景觀，瘋狂麥斯車隊正在追逐',
    '一個舒適的書房，窗外下著雨',
];

// For "Inspire Me" feature
export const SUBJECTS = ['一隻貓', '一位機器人', '一位巫師', '一位太空人', '一條龍', '一位偵探'];
export const BACKGROUNDS = ['一座繁華的未來城市', '一片寧靜的魔法森林', '一個廢棄的太空站', '一座維多利亞時代的豪宅', '一片超現實的沙漠景觀'];
export const ACTIONS_POSES = ['正在閱讀一本古老的書', '正在喝咖啡', '正在凝視遠方', '正在跳舞', '正在修理一個複雜的裝置'];
export const EMOTIONS = ['快樂的', '沉思的', '神秘的', '勇敢的', '悲傷的'];
export const CLOTHING = ['現代時尚服裝', '中世紀盔甲', '賽博龐克外套', '優雅的長袍', '蒸汽龐克風格的服飾'];
export const DETAILS_OBJECTS = ['發光的植物', '漂浮的水晶', '古老的時鐘', '未來派的小工具', '一群蝴蝶'];
export const ART_STYLES = ['梵高風格', '達利超現實主義', '日本浮世繪風格', '賽博龐克藝術', '吉卜力工作室動畫風格'];
export const LIGHTING = ['柔和的晨光', '霓虹燈光', '戲劇性的倫勃朗光', '溫暖的燭光', '月光'];
export const COMPOSITIONS = ['對稱構圖', '黃金比例構圖', '特寫鏡頭', '廣角鏡頭', '鳥瞰視角'];
export const TONES_TEXTURES = ['溫暖的色調', '冷酷的藍色調', '高對比度的黑白', '柔和的粉彩色', '粗糙的油畫質感'];

// Function buttons for quick prompt additions
export const FUNCTION_BUTTONS = [
    { label: '公仔手辦', prompt: '4K, create a 1/7 scale commercialized figure of the character, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork' },
    { label: '三視圖', prompt: 'character design sheet, orthographic view, front view, side view, back view, T-pose, detailed, clean line art, white background' },
    { label: '3D紙雕', prompt: '3D sculpted paper art, layered paper, intricate papercraft, quilling, detailed, delicate lighting' },
    { label: '移除文字', prompt: 'remove all text, subtitles, and logos from the image' },
    { label: '更換背景', prompt: 'change the background to [在此填寫背景], keep the subject' },
    { label: '線稿提取', prompt: 'extract the line art from this image, clean white background' },
    { label: '向量圖標', prompt: 'convert this into a clean, simple, flat 2D vector icon' },
    { label: '黏土模型', prompt: 'claymation style, plasticine model, stop-motion animation look' },
    { label: '像素藝術', prompt: 'pixel art, 16-bit, retro video game style' },
    { label: '雙重曝光', prompt: 'double exposure effect with a silhouette of a person and a forest scene' },
    { label: '低多邊形', prompt: 'low poly art style, geometric, faceted' },
    { label: '黑白素描', prompt: 'black and white pencil sketch, detailed shading' },
    { label: '產品攝影', prompt: 'commercial product photography, clean studio background, professional lighting' },
    { label: '開箱照', prompt: 'Knolling photography, objects arranged neatly at 90-degree angles, flat lay, top-down view, clean studio lighting on a flat surface, organized, hyper-detailed, photorealistic' },
    { label: '等距可愛', prompt: 'Isometric 3D cute art, miniature diorama, soft pastel colors, clay-like texture, clean studio lighting, detailed, high quality' },
    { label: '電影感', prompt: 'cinematic lighting, dramatic, movie still' },
    { label: '吉卜力風格', prompt: 'ghibli studio style, anime, beautiful scenery' },
];

// Art styles for the accordion - Expanded to over 100
export const ART_STYLES_LIST = [
    // --- Modern Art Movements ---
    { en: 'Impressionism', zh: '印象派' },
    { en: 'Post-Impressionism', zh: '後印象派' },
    { en: 'Expressionism', zh: '表現主義' },
    { en: 'Cubism', zh: '立體主義' },
    { en: 'Surrealism', zh: '超現實主義' },
    { en: 'Abs Expressionism', zh: '抽象表現主義' },
    { en: 'Pop Art', zh: '普普藝術' },
    { en: 'Minimalism', zh: '極簡主義' },
    { en: 'Futurism', zh: '未來主義' },
    { en: 'Dadaism', zh: '達達主義' },
    { en: 'Constructivism', zh: '構成主義' },
    { en: 'Fauvism', zh: '野獸派' },
    { en: 'Art Nouveau', zh: '新藝術運動' },
    { en: 'Art Deco', zh: '裝飾藝術' },
    { en: 'Bauhaus', zh: '包浩斯' },
    { en: 'Op Art', zh: '歐普藝術' },
    { en: 'Kinetic Art', zh: '動態藝術' },
    // --- Classical & Historical ---
    { en: 'Renaissance', zh: '文藝復興' },
    { en: 'Baroque', zh: '巴洛克' },
    { en: 'Rococo', zh: '洛可可' },
    { en: 'Neoclassicism', zh: '新古典主義' },
    { en: 'Romanticism', zh: '浪漫主義' },
    { en: 'Realism', zh: '寫實主義' },
    { en: 'Gothic Art', zh: '哥德藝術' },
    { en: 'Byzantine Art', zh: '拜占庭藝術' },
    { en: 'Pre-Raphaelite', zh: '前拉斐爾派' },
    // --- Digital & Contemporary ---
    { en: 'Cyberpunk', zh: '賽博龐克' },
    { en: 'Steampunk', zh: '蒸汽龐克' },
    { en: 'Solarpunk', zh: '太陽龐克' },
    { en: 'Vaporwave', zh: '蒸汽波' },
    { en: 'Glitch Art', zh: '故障藝術' },
    { en: 'Pixel Art', zh: '像素藝術' },
    { en: 'Voxel Art', zh: '體素藝術' },
    { en: 'Low Poly', zh: '低多邊形' },
    { en: 'Fractal Art', zh: '碎形藝術' },
    { en: 'Generative Art', zh: '生成藝術' },
    { en: 'Digital Painting', zh: '數位繪畫' },
    { en: 'Concept Art', zh: '概念藝術' },
    { en: 'Matte Painting', zh: '霧面繪畫' },
    { en: 'Photobashing', zh: '照片拼貼' },
    { en: 'Synthwave', zh: '合成波' },
    { en: 'Holographic', zh: '全息影像' },
    // --- Illustration & Graphic Styles ---
    { en: 'Anime Style', zh: '日本動畫' },
    { en: 'Manga Style', zh: '日本漫畫' },
    { en: 'Ghibli Studio Style', zh: '吉卜力風格' },
    { en: 'Disney Style', zh: '迪士尼風格' },
    { en: 'Cartoon Style', zh: '卡通風格' },
    { en: 'Comic Book Art', zh: '美式漫畫' },
    { en: 'Flat Design', zh: '扁平化設計' },
    { en: 'Vector Art', zh: '向量藝術' },
    { en: 'Infographic Style', zh: '資訊圖表' },
    { en: 'Psychedelic Art', zh: '迷幻藝術' },
    { en: 'Vintage Poster', zh: '復古海報' },
    { en: 'Fantasy Art', zh: '奇幻藝術' },
    { en: 'Sci-Fi Art', zh: '科幻藝術' },
    { en: 'Kids Book Illustration', zh: '童書插畫' },
    // --- Cultural & Regional Styles ---
    { en: 'Ukiyo-e', zh: '浮世繪' },
    { en: 'Ink Wash Painting', zh: '水墨畫' },
    { en: 'Chinese Painting (Guohua)', zh: '國畫' },
    { en: 'Aboriginal Art', zh: '澳洲原住民藝術' },
    { en: 'African Art', zh: '非洲藝術' },
    { en: 'Islamic Art', zh: '伊斯蘭藝術' },
    { en: 'Mandala', zh: '曼陀羅' },
    { en: 'Celtic Knotwork', zh: '凱爾特結' },
    { en: 'Mayan Art', zh: '馬雅藝術' },
    { en: 'Aztec Art', zh: '阿茲特克藝術' },
    { en: 'Indian Mini Painting', zh: '印度細密畫' },
    { en: 'Tibetan Thangka', zh: '西藏唐卡' },
    { en: 'Mexican Muralism', zh: '墨西哥壁畫' },
    // --- Traditional Mediums ---
    { en: 'Oil Painting', zh: '油畫' },
    { en: 'Watercolor Painting', zh: '水彩畫' },
    { en: 'Acrylic Painting', zh: '壓克力畫' },
    { en: 'Gouache Painting', zh: '水粉畫' },
    { en: 'Pencil Sketch', zh: '鉛筆素描' },
    { en: 'Charcoal Drawing', zh: '炭筆素描' },
    { en: 'Ink Drawing', zh: '墨水畫' },
    { en: 'Woodcut Print', zh: '木刻版畫' },
    { en: 'Linocut Print', zh: '油氈版畫' },
    { en: 'Etching', zh: '蝕刻版畫' },
    { en: 'Lithography', zh: '石版畫' },
    { en: 'Collage', zh: '拼貼' },
    { en: 'Mosaic', zh: '馬賽克' },
    { en: 'Stained Glass', zh: '彩繪玻璃' },
    { en: 'Graffiti Art', zh: '塗鴉藝術' },
    { en: 'Street Art', zh: '街頭藝術' },
    { en: 'Calligraphy', zh: '書法' },
    { en: 'Pastel Drawing', zh: '粉彩畫' },
    { en: 'Ballpoint Pen Art', zh: '原子筆藝術' },
    // --- Photographic & Film Styles ---
    { en: 'Cinematic', zh: '電影感' },
    { en: 'Film Noir', zh: '黑色電影' },
    { en: 'Documentary Style', zh: '紀錄片風格' },
    { en: 'Golden Hour Foto', zh: '黃金時刻攝影' },
    { en: 'Blue Hour Foto', zh: '藍色時刻攝影' },
    { en: 'Long Exposure Foto', zh: '長曝光攝影' },
    { en: 'Macro Photography', zh: '微距攝影' },
    { en: 'Double Exposure', zh: '雙重曝光' },
    { en: 'B&W Photography', zh: '黑白攝影' },
    { en: 'Sepia Tone', zh: '棕褐色調' },
    { en: 'Infrared Foto', zh: '紅外線攝影' },
    { en: 'Tilt-Shift Foto', zh: '移軸攝影' },
    { en: 'Lomography', zh: 'LOMO風格' },
    { en: 'Pinhole Photography', zh: '針孔攝影' },
    { en: 'Drone Photography', zh: '空拍攝影' },
    { en: 'Polaroid Photo', zh: '拍立得風格' },
    // --- Unique & Niche ---
    { en: 'Knolling', zh: '擺拍藝術' },
    { en: 'Claymation', zh: '黏土動畫' },
    { en: 'Quilling', zh: '衍紙' },
    { en: 'Origami', zh: '摺紙' },
    { en: 'Tattoo Art', zh: '紋身藝術' },
    { en: 'Body Painting', zh: '人體彩繪' },
    { en: 'Light Painting', zh: '光繪' },
    { en: 'Diorama', zh: '立體透視模型' },
    { en: 'Miniature Faking', zh: '微縮景觀' },
    { en: 'Anamorphic Art', zh: '變形藝術' },
    { en: 'Cross-Stitch', zh: '十字繡' },
    { en: 'Stipple Art', zh: '點畫' },
    { en: 'Knolling Foto', zh: '開箱照' },
];

export const EDITING_EXAMPLES = [
    {
      category: '主體變換',
      examples: [
        { title: '變換材質', prompt: '將 [主體] 的材質變成 [玻璃/木頭/金屬/石頭]' },
        { title: '添加發光效果', prompt: '讓 [主體] 的 [特定部位] 發出 [顏色] 的光芒' },
        { title: '風格化', prompt: '將 [主體] 變成 [像素/卡通/素描] 風格' },
        { title: '擬人化', prompt: '將 [物體] 擬人化，賦予其人類的表情和動作' },
      ]
    },
    {
      category: '背景與環境',
      examples: [
        { title: '更換背景', prompt: '將背景更換為 [未來城市/魔法森林/廢棄工廠]' },
        { title: '改變天氣', prompt: '將天氣變為 [下雨/下雪/起霧/黃昏]' },
        { title: '添加元素', prompt: '在背景中添加 [漂浮的島嶼/巨大的月亮/飛過的龍]' },
        { title: '時間變換', prompt: '將場景的時間變為 [白天/夜晚/黎明]' },
      ]
    },
    {
      category: '構圖與視角',
      examples: [
        { title: '改變視角', prompt: '將視角變為 [鳥瞰/仰視/魚眼]' },
        { title: '聚焦主體', prompt: '使用淺景深效果，模糊背景，突出主體' },
        { title: '延伸畫布 (Outpainting)', prompt: '將畫布向 [上下左右] 延伸，並智慧填充內容' },
        { title: '畫面裁切', prompt: '將畫面裁切為 [16:9/4:3/方形] 比例，重新構圖' },
      ]
    },
    {
      category: '特效與氛圍',
      examples: [
        { title: '添加動態模糊', prompt: '為主體添加運動模糊效果，營造速度感' },
        { title: '電影感色調', prompt: '為整張圖片套上電影感色調，參考 [駭客任務/銀翼殺手] 的風格' },
        { title: '雙重曝光', prompt: '將 [主體輪廓] 與 [另一張圖片，如森林/星空] 進行雙重曝光' },
        { title: '故障藝術', prompt: '為圖片添加 Glitch Art (故障藝術) 效果，如數據錯誤、色彩分離' },
      ]
    },
];

// --- Night City Legends Constants ---

// FIX: The `label` property was missing from several objects within `NCL_OPTIONS`.
// This would cause a runtime error in `InspirationPanel.tsx` where `value.label` is accessed.
// Labels have been added to each category object for proper functionality.
export const NCL_OPTIONS = {
    gender: {
        label: "性別",
        options: ["性別", "男", "女", "非二元性別"] 
    },
    lifePath: {
        label: "身分",
        options: [ "身分", "公司員工", "街頭小子", "流浪者", "網路駭客 (Netrunner)", "技師 (Techie)", "獨武俠 (Solo)", "媒體人 (Media)", "警察 (NCPD Officer)", "黑幫成員", "情報販子 (Fixer)", "叛逃的公司特工", "清道夫 (Scavenger)", "腦舞技師 (Braindance Technician)", "創傷小組成員 (Trauma Team)", "軍用科技士兵 (Militech Soldier)", "荒坂特工 (Arasaka Agent)", "超夢明星 (Braindance Star)", "賞金獵人", "走私客", "非法醫生 (Ripperdoc)", "宗教狂熱份子", "政治家", "地下拳擊手", "藝術家" ]
    },
    expression: {
        label: "表情",
        options: [ "表情", "微笑", "大笑", "自信的 smirk (得意地笑)", "興奮", "滿足", "溫柔", "喜悅", "調情", "頑皮的", "充滿希望的", "自豪的", "憤怒", "悲傷", "恐懼", "厭惡", "驚訝", "輕蔑", "痛苦", "絕望", "嫉妒", "擔憂", "疲憊", "面無表情", "沉思", "專注", "好奇", "懷疑", "冷漠", "諷刺的", "緊張的", "堅定的", "困惑的", "挑釁的", "醉醺醺的", "精神恍惚的 (嗑藥)", "賽博精神病發作的邊緣", "痛苦的", "咬緊牙關的", "喘息的", "嘲諷的", "麻木的", "警惕的", "沉著冷靜的", "遺憾的", "懷舊的", "狡猾的", "傲慢的", "謙卑的", "害羞的", "尷尬的", "著迷的" ]
    },
    hairStyle: {
        label: "髮型",
        options: [ "髮型", "經典短髮", "龐克莫霍克髮型", "高科技感應辮", "霓虹漸層長髮", "剃邊 undercut", "武士髮髻", "凌亂的波波頭", "生化改造光頭", "數據流動的發光髮絲", "不對稱剪裁", "銀色金屬感髮辮", "火焰圖案的剃髮", "盤繞的頂髻", "帶有LED燈飾的髮型", "油頭 all-back", "尖刺髮型", "長直髮，髮尾染色", "捲曲的仿生羊毛髮型", "半邊剃光長髮", "帶有全息投影的髮型", "漂浮的能量髮絲", "水晶體植入的髮型", "光纖辮子", "幾何圖案剃髮", "髒辮 (Dreadlocks)", "雙馬尾", "日式姬髮式", "狼尾頭 (Wolf Cut)", "蘑菇頭", "爆炸頭 (Afro)", "復古波浪捲髮", "賽博丸子頭", "帶有金屬環的髮辮", "濕髮造型", "層次感豐富的羽毛剪", "短劉海", "側分長劉海", "帶有機械部件的髮型", "電路板圖案剃髮", "霧面質感的短髮", "全像顯示的動態髮型", "碳纖維質感的髮型", "發光凝膠固定的髮型", "帶有小型天線的髮飾", "羽毛裝飾的髮型", "彩虹色長髮", "星空圖案染髮", "液態金屬流動感髮型", "碎形圖案的剃髮" ]
    },
    hairColor: {
        label: "髮色",
        options: [ "髮色", "霓虹粉", "電光藍", "酸性綠", "鉻合金銀", "石墨黑", "純淨白", "火焰橙", "深紫色", "黃金黃", "雙色染 (黑與白)", "彩虹漸變", "白金色", "深紅色", "青色", "全息幻彩", "碳纖維黑", "銅鏽綠", "鐵鏽紅", "數據流動的藍綠色", "粉彩漸變 (粉紅/粉藍)", "紫外線反應的隱形染髮", "帶有金屬光澤的棕色", "啞光黑", "陶瓷白", "鈷藍色", "翡翠綠", "紫水晶色", "紅寶石色", "藍寶石色", "熔岩橙紅色", "星雲紫藍色漸變", "極光綠", "電漿粉色", "石英粉", "琥珀色", "瀝青黑", "骨白色", "黃銅色", "鋼鐵灰", "帶有數位雜訊的混合色", "熱感應變色染髮", "夜光綠", "鏡面銀色", "透明質感", "煙燻灰", "玫瑰金", "深海藍", "森林綠", "酒紅色" ]
    },
    headwear: {
        label: "頭部",
        options: ["頭部", "高科技安全帽", "戰術護目鏡", "強化現實(AR)眼罩", "防毒面具", "生化眼", "腦機介面插槽", "霓虹面紋", "金屬面具", "反光飛行員眼鏡", "兜帽", "棒球帽", "針織帽", "頭巾", "防彈面罩", "全罩式戰術頭盔", "附帶呼吸器的頭盔", "全像投影面罩", "數據流動護目鏡", "龐克風鉚釘頭帶", "浪人風格的斗笠", "武士風格的面甲", "惡鬼面具", "醫用級口罩", "技師用放大護目鏡", "網路駭客神經介面頭環", "公司標誌的貝雷帽", "流浪者皮革頭巾", "防沙塵護目鏡", "腦舞花環", "賽博龐克風格皇冠", "發光的貓耳耳機", "附帶探照灯的頭盔", "清道夫風格焊接面罩", "虎鉤眾風格的般若面具", "漩戰幫風格的強化光學鏡", "瓦倫提諾幫風格的頭巾", "飛行員帽", "附天線的通訊耳機", "蕾絲面紗", "附帶小型攝影機的頭盔", "能量護盾產生器頭環", "仿生獸耳", "水晶裝飾的頭飾", "智慧變色兜帽", "運動用智慧頭帶", "強化現實隱形眼鏡", "覆蓋半臉的機械面甲", "遮陽帽", "漁夫帽", "平頂帽", "帶有全息廣告的帽子", "臉部框架", "祭祀用頭冠", "帶有羽毛的裝飾"]
    },
    outerwear: {
        label: "外衣",
        options: ["外衣", "裝甲防彈背心", "經典皮夾克", "高領長版風衣", "公司西裝外套", "LED發光外套", "迷彩派克大衣", "流浪者風格補丁背心", "和服式外套", "機能夾克", "全像投影廣告披風", "厚重的毛領大衣", "防護外套", "無袖背心", "緊身胸衣", "短版騎士皮夾克", "霓虹飾邊飛行員夾克", "不對稱拉鍊機能外套", "科技綢緞和服式夾克", "金屬質感羽絨外套", "肩部裝甲西裝外套", "透明PVC雨衣外套", "仿舊牛仔夾克", "刺繡絲綢飛行夾克（龍/鳳凰）", "LED發光纖維風衣", "漆皮長外套", "無袖長版背心外套", "拼接材質外套", "羊羔毛領飛行員夾克", "戰術斗篷外套", "可拆卸模組化外套", "防彈纖維連帽衫", "緊身馬甲式夾克", "流蘇裝飾皮夾克", "蛇皮紋路長外套", "反光材質運動夾克", "天鵝絨刺繡外套", "戰術多口袋馬甲", "裝甲板緊身胸衣", "皮質馬甲背心", "鋼骨束腰", "鍊條裝飾馬甲", "全像投影馬甲", "鏤空設計皮馬甲", "機能背帶式馬甲", "長版西裝馬甲", "羽絨馬甲", "蕾絲拼接塑身衣", "拉鍊前開襟馬甲", "卯釘裝飾馬甲", "東方風格織錦馬甲", "未來感盔甲式胸衣", "高科技匿蹤斗篷", "連帽長披風", "不對稱剪裁披肩", "透明硬紗披風", "羽毛裝飾披肩", "針織流蘇斗篷", "單肩披風", "帶有LED飾邊的披風", "鎖子甲風格披肩", "防水機能布斗篷", "超短版波麗路外套", "單袖外套", "連身裙式長外套", "多層次披掛式外套", "背部鏤空設計外套", "燈籠袖外套", "高衩長版外套", "可變形模組化外套", "環繞式和服外套", "降落傘繩索裝飾外套", "液態金屬質感外套", "碳纖維紋理外套", "仿生皮膚質地外套", "數位迷彩外套", "螢光壓克力材質外套", "再生塑膠瓶環保外套", "變色龍塗層外套", "絲絨與皮革拼接外套", "數據流圖案發光外套", "磨砂金屬質感夾克", "蕾絲長袍", "短版毛呢外套", "運動風連帽衫", "教練夾克", "斗篷式大衣", "人造皮草大衣", "機車背心", "狩獵背心", "針織開襟衫", "長版針織外套", "運動外套", "風衣", "棒球外套", "皮草披肩", "絲質長袍", "手術袍風格外套"]
    },
    innerwear: {
        label: "內搭",
        options: ["內搭", "緊身機能衣", "網狀上衣", "防彈襯衫", "復古樂團T恤", "破洞背心", "高領毛衣", "公司制服襯衫", "半透明上衣", "運動胸衣", "無袖襯衫", "坦克背心", "有領襯衫", "蕾絲邊飾吊帶背心", "挖空設計短版上衣", "單肩不對稱上衣", "高領無袖緊身衣", "綁帶式露背上衣", "交叉綁帶短上衣", "皮質馬甲式上衣", "金屬環裝飾坦克背心", "絲綢緞面吊帶衫", "魚骨緊身胸衣", "掛脖式上衣", "平口抹胸", "全像投影材質背心", "拉鍊裝飾緊身上衣", "薄紗泡泡袖上衣", "側邊綁帶背心", "V領金屬鍊條上衣", "超短版針織衫", "高衩連體緊身衣", "蕾絲連身衣", "機能布料連身衣", "背部全開連身衣", "不對稱鏤空連身衣", "漁網連身衣", "皮質束帶連身衣", "長袖網紗連身衣", "仿生紋理緊身衣", "螢光條紋緊身衣", "透明硬紗襯衫", "Oversized男友風白襯衫", "綁結式短版襯衫", "立領荷葉邊襯衫", "金屬絲線襯衫", "露肩襯衫", "燈籠袖襯衫", "絲綢睡衣風格襯衫", "背部綁帶襯衫", "不對稱下擺襯衫", "皮革胸衣", "多重綁帶胸衣", "鍊條裝飾胸衣", "運動機能胸衣", "針織短版背心", "羅紋坦克背心", "絲絨吊帶背心", "卯釘裝飾胸衣", "亮片刺繡胸衣", "透視蕾絲胸衣", "液態乳膠上衣", "天鵝絨緊身衣", "反光材質上衣", "蛇皮紋路緊身上衣", "數位印花T恤", "破洞處理龐克T恤", "半透明乳膠上衣", "變色龍塗層上衣", "輕薄羊絨高領衫", "金屬網格上衣", "乳膠連身裙", "緞面連身裙", "針織連身裙", "襯衫式連身裙", "運動內衣", "絲綢襯衣", "絨面緊身衣", "基本款棉質T恤", "POLO衫", "法蘭絨襯衫", "亨利領上衣", "細肩帶背心", "削肩背心", "馬甲", "Bustier胸衣", "Bralette無鋼圈胸衣", "肚兜式上衣", "圍巾式上衣", "緞面馬甲", "天鵝絨連身裙", "鏤空針織衫", "短版帽T", "絲質睡袍式襯衫", "綢緞襯衫"]
    },
    legwear: {
        label: "腿部",
        options: ["腿部", "戰術長褲", "緊身皮褲", "機能緊身褲", "寬鬆工裝褲", "裝甲護腿", "公司西褲", "破洞牛仔褲", "運動短褲", "迷你裙", "長裙", "高腰褲", "連身褲", "多口袋軍規長褲", "抗撕裂機能褲", "生物纖維緊身褲", "附掛模組化口袋的工裝褲", "發光線條裝飾的運動褲", "不對稱設計的解構長褲", "和服式寬褲 (Hakama)", "熱褲", "皮質短褲", "重機騎士皮褲", "內置護膝的戰術褲", "數位迷彩褲", "高科技運動短褲", "全像投影廣告圖案的褲子", "透明PVC材質長褲", "金屬質感緊身褲", "拼接材質長褲", "流蘇皮褲", "側邊綁帶長褲", "高衩長裙", "不規則下擺裙", "戰術短裙", "皮質迷你裙", "百褶裙", "帶有外骨骼結構的長褲", "壓力褲", "瑜珈褲", "寬鬆的垮褲", "燈籠褲", "馬褲", "工作服連身褲", "緊身連身衣 (Catsuit)", "短版連身褲 (Romper)", "防護工作褲", "耐火材質長褲", "防水褲", "隔熱褲", "降落傘褲", "仿舊牛仔褲", "酸洗牛仔褲", "卯釘裝飾龐克褲", "格子褲", "絲質睡褲風格長褲", "天鵝絨寬褲", "蕾絲緊身褲", "漁網襪", "過膝長襪", "帶有發光圖案的絲襪", "盔甲護膝", "護脛甲", "外掛式大腿槍套"]
    },
    footwear: {
        label: "鞋子",
        options: ["鞋子", "重型戰鬥靴", "高筒運動鞋", "金屬護腿靴", "公司皮鞋", "輕便跑鞋", "磁懸浮靴", "西部靴", "過膝長靴", "涼鞋", "高跟鞋", "鋼頭工作靴", "軍用沙漠靴", "高科技潛入靴", "LED發光運動鞋", "厚底鬆糕鞋", "機車靴", "裝甲高跟鞋", "忍者分趾靴 (Tabi Boots)", "磁吸攀爬靴", "動力輔助跳躍靴", "隱形變色靴", "全地形適應靴", "防滑工作鞋", "絕緣靴", "抗衝擊運動鞋", "流線型賽車靴", "優雅的德比鞋", "樂福鞋", "牛津鞋", "鉚釘龐克靴", "帶有金屬扣環的靴子", "蛇皮紋路靴", "透明材質高跟鞋", "發光鞋帶", "自動繫帶運動鞋", "附帶滾輪的鞋子", "靜音潛行鞋", "防水涉水靴", "長筒馬靴", "木屐", "涼拖鞋", "戰術涼鞋", "運動拖鞋", "芭蕾平底鞋", "瑪莉珍鞋", "楔形跟鞋", "踝靴", "切爾西靴", "帆布鞋", "懶人鞋", "豆豆鞋", "過膝襪靴", "帶有小口袋的靴子", "外骨骼輔助靴", "能量回饋跑鞋", "可替換鞋底的模組化鞋", "帶有全像投影的鞋子", "腳踝護甲"]
    },
    faceCyberware: {
        label: "臉部義體",
        options: ["臉部義體", "奇美拉光學儀", "克羅斯尼科夫眼", "面部金屬板", "皮膚下LED發光紋路", "改造下顎", "合成皮膚", "眼部攝影機", "語音合成器格柵", "鼻部過濾器", "多光譜視覺眼", "目標分析儀", "情緒感應器", "臉部 seams (接縫線)", "太陽穴數據端口", "可伸縮的天線", "虹膜變色隱形眼鏡", "全像投影化妝", "皮下通訊植入物", "下顎強化骨骼", "牙齒替換 (鉻合金/黃金)", "人工鰓 (水下呼吸)", "皮膚顯示器 (顯示文字/圖案)", "視網膜投影", "擴增聽覺感應器", "化學分析嗅探器", "微型臉部護盾發射器", "聲音過濾耳塞", "戰術目鏡", "單邊眼鏡式顯示器", "皮膚紋理改造", "防彈皮膚移植", "臉頰儲存囊", "舌頭數據接口", "喉部擴音器", "眼窩攝影機", "電子淚痕 (發光)", "鼻樑數據線", "額頭散熱片", "嘴唇金屬裝飾", "下巴植入物", "臉部骨骼重塑", "皮膚硬化處理", "可伸縮的面具", "生物辨識掃描儀", "臉部全像偽裝", "紅外線視覺", "夜視功能眼", "變焦鏡頭眼", "微型臉部無人機發射器", "臉部表情抑制器", "皮下微型電腦", "腦波讀取器接口", "記憶體擴充插槽", "神經接口"]
    },
    bodyCyberware: {
        label: "身體義體",
        options: ["身體義體", "皮下裝甲", "脊椎外骨骼", "合成肌肉纖維", "生物監測器植入", "胸口發光裝置", "外露的機械關節", "碳纖維骨骼", "肩部植入物", "腹部電鍍", "強化肌腱", "腎上腺素幫浦", "疼痛抑制器", "血液過濾系統", "人工肝臟/腎臟", "第二心臟", "皮膚下武器艙", "可伸縮的爪子", "手臂火箭發射器", "肩膀上的微型飛彈", "背部散熱口", "整合式工具臂", "全息投影儀", "皮膚硬化改造", "反射增強器", "骨骼強化", "毒素過濾器", "體內氧氣瓶", "微型工廠 (體內製造化學品)", "細胞再生器", "皮膚顏色/圖案變換", "磁性皮膚 (可吸附金屬)", "聲音模擬器", "體溫調節器", "輻射偵測器", "GPS追蹤器", "數據儲存硬碟", "可伸縮的翅膀 (滑翔用)", "腳底推進器", "手指上的小工具 (開鎖器/焊接器)", "掌心衝擊波", "電磁脈衝 (EMP) 發生器", "匿蹤皮膚 (光學迷彩)", "能量護盾產生器", "合成神經系統", "觸手附肢", "可分離的肢體", "內部武器架", "液壓增強腿部", "快速凝血系統", "強化感官套件", "生物駭客接口"]
    }
};

export const NIGHT_CITY_WEAPONS = {
    '義體改造 (Cyberware Arms)': [
        'Mantis Blades (螳螂刀)', 'Gorilla Arms (大力拳套)', 'Monowire (單分子線)', 'Projectile Launch System (射彈發射系統)'
    ],
    '不朽武士刀 (Iconic Katanas)': [
        'Jinchu-Maru (盡忠丸)', 'Satori (悟)', 'Scalpel (手術刀)', 'Tsumetogi (爪磨)', 'Byakko (白虎)', 'Nehan (涅槃)', 'Errata (正宗)'
    ],
    '手槍 (Pistols)': [
        'A-22B Chao (超)', 'M-10AF Lexington (列星頓)', 'Slaught-O-Matic (販賣機)', 'Unity (團結)', 'Liberty (自由)', 'Kongou (金剛)', 'La Chingona Dorada (金色狠婆娘)', 'Malorian Arms 3516 (マロリアン・アームズ 3516)', 'nue (鵺)', 'Pride (傲天)', 'Seraph (熾天使)', 'Tamayura (玉響)', 'Dying Night (垂死之夜)', 'Genjiroh (源二郎)', 'JKE-X2 Kenshin (覺)', 'Lexington x-MOD2', 'Her Majesty (女王陛下)', 'Skippy (小嗶)', 'Plan B (B計畫)', 'Apparition (幽靈)', 'Death and Taxes (死亡與稅金)'
    ],
    '左輪手槍 (Revolvers)': [
        'DR-5 Nova (新星)', 'Overture (序曲)', 'RT-46 Burya (風暴)', 'Amnesty (大赦)', "Archangel (大天使)", "Comrade's Hammer (同志的鐵鎚)", "Crash (克拉什)", 'DR12 Quasar (類星體)', 'M-76E Omaha (奧馬哈)', 'Metel (暴雪)', 'Rasetsu (羅剎)', 'Riskit', "Rosco", "Taigan (大我)"
    ],
    '衝鋒槍 (Submachine Guns)': [
        'DS1 Pulsar (脈衝星)', 'M2038 Tactician (戰術家)', 'G-58 Dian (電光)', 'M221 Saratoga (薩拉多加)', 'TKI-20 Shingen (信玄)', 'Buzzsaw (電鋸)', 'Chesapeake', 'Fenrir (芬里爾)', 'Guinevere (桂妮薇兒)', 'Haumea', 'Pizdets (滅 pistola)', 'Problem Solver (問題解決者)', 'Shigure (時雨)', 'Warden (典獄長)', 'Yinglong (應龍)'
    ],
    '突擊步槍 (Assault Rifles)': [
        'D5 Copperhead (銅斑蛇)', 'M251s Ajax (阿賈克斯)', 'MA70 HB (MA70 HB)', 'Nokota D5 Sidewinder', 'HJSH-18 Masamune (正宗)', 'DA8 Umbra (本影)', 'Nowaki (野分)', 'Divided We Stand (團結則存)', 'Hawk', 'Hercules 3AX', 'Kyubi (九尾)', 'Moron Labe (莫倫拉貝)', 'Prejudice (偏見)', 'Psalm 11:6 (詩篇 11:6)', 'Carmen', 'PDR', 'UDA'
    ],
    '步槍 (Rifles)': [
        'Achilles (阿基里斯)', 'SOR-22 (SOR-22)', 'ARASAKA KAGE-BOSHI', 'Overwatch (守望)', 'Widow Maker (寡婦製造者)', 'Tsunami (海嘯)', 'Ashura (阿修羅)', 'Nekomata (貓又)', 'Breakthrough (突破)', "Raiju (雷獸)", "Sparky"
    ],
    '狙擊步槍 (Sniper Rifles)': [
        'SPT32 Grad (冰雹)', 'Nekomata (貓又)', 'O\'Five (零五)', 'Borzaya', "Ilya's SNIPER RIFLE", 'KSR-29', "NDI-46 'Reaper'"
    ],
    '霰彈槍 (Shotguns)': [
        'Carnage (殺戮)', 'DB-2 Satara (薩塔拉)', 'DB-4 Igla (伊格拉)', 'M2038 Tactician (戰術家)', 'VST-37 Pozhar', 'Zhuo Ba-Xing Chong (八星銃)', 'Alabai', "Baobab", "Bloody Maria", "Dezerter", "Guts (腸子)", "Headsman (劊子手)", "Mox", "Rebecca's Shotgun", "Sovereign (元首)", "The Devil"
    ],
    '輕機槍 (Light Machine Guns)': [
        'Defender (防衛者)', 'MA70 HB (MA70 HB)', 'Wild Dog', "MA70 HB X-MOD2", "Nekomata X-MOD2"
    ],
    '重機槍 (Heavy Machine Guns)': [
        'HMG MK.31', 'Budget Arms Carnage'
    ],
    '近戰武器 (Melee Weapons)': [
        'Katana (武士刀)', 'Tanto (短刀)', 'Machete (彎刀)', 'Axe (斧)', 'Baseball Bat (球棒)', 'Crowbar (撬棍)', 'Hammer (錘)', 'Knife (小刀)', 'Pipe Wrench (管鉗)', 'Tire Iron (輪胎扳手)', 'Gold-Plated Baseball Bat (鍍金球棒)', 'Cottonmouth (水蝮蛇)', 'Stinger (毒刺)', "Cocktail Stick (雞尾酒棒)", "Gwynbleidd", "Headhunter (獵頭)", "Ol' Reliable", "Rose"
    ],
};

export const NIGHT_CITY_VEHICLES = {
    '摩托車 (Motorcycles)': [
        'ARCH Nazaré', 'ARCH Nazaré "Itsumade"', 'ARCH Nazaré "Racer"', 'Yaiba Kusanagi CT-3X', 'Brennan Apollo', 'Brennan Apollo "Scorpion"', 'Yaiba Kusanagi "Akira Bike"', 'Yaiba Kusanagi "Jackie\'s Tuned"', 'Yaiba Kusanagi "Tiger Claw"', 'Yaiba Kusanagi "Tyger"', 'Nazare "Racer" Purple', 'Nazare "Malina" Pink'
    ],
    '經濟型汽車 (Economy)': [
        'Thorton Galena G240', 'Thorton Galena "Gecko"', 'Makigai Maimai P126', 'Mahir Supron FS3', 'Thorton Colby C125', 'Thorton Colby "Little Mule"', 'Villefort Alvarado V4F 570 Delegate', 'Archer Quartz "Bandit"', 'Thorton Galena "Rattler"', 'Makigai Maimai "Beast"', 'Villefort Alvarado "Vato"'
    ],
    '行政級轎車 (Executive)': [
        'Villefort Cortes V5000 Valor', 'Chevillon Thrax 388 Jefferson', 'Herrera Outlaw GTS', 'Villefort Alvarado V4F 570 Delegate', 'Roycefleet "Emperor" 620', 'Chevillon Emperor 620 Ragnar', 'Herrera Outlaw "Weiler"'
    ],
    '重型卡車 (Heavy Duty)': [
        'Kaukaz Zeya U420', 'Militech Behemoth', 'Bratsk U-410', 'Kaukaz Bratsk U-410', 'Militech Behemoth "Goliath"', 'Thorton Mackinaw MTL1', 'Thorton Mackinaw "Warhorse"', 'Thorton Mackinaw "Saguaro"'
    ],
    '跑車 (Sports Cars)': [
        'Mizutani Shion MZ2', 'Mizutani Shion "Coyote"', 'Quadra Turbo-R 740', 'Quadra Turbo-R V-Tech', 'Porsche 911 II (930) Turbo', 'Mizutani Shion "Nomad"', 'Quadra Type-66 "Javelina"', 'Quadra Type-66 "Jen Rowley"', 'Quadra Type-66 "Cthulhu"', 'Mizutani Shion "Mizuchi"'
    ],
    '超級跑車 (Hypercars)': [
        'Rayfield Caliburn', 'Rayfield Aerondight S9 "Guinevere"', 'Herrera Outlaw GTS', 'Rayfield Caliburn "Murkmobile"', 'Rayfield Caliburn "CrystalCoat"', 'Herrera Riptide "Terrier"', 'Rayfield "Excalibur"'
    ],
    '飛行器 (AVs - Aerodynes)': [
        'Trauma Team AV-4A', 'Arasaka AV', 'Kang Tao Armored AV', 'Zetatech AV', 'Delamain AV', 'MaxTac AV', 'Trauma Team "Elite" AV', 'Kang Tao "Dragon" AV', 'Zetatech "Sky-Reaper"', 'News Chopper AV'
    ],
};

export const NIGHT_CITY_COMPANIONS = {
    '男性': [
        'Jackie Welles (傑奇·威爾斯)', 'Goro Takemura (竹村五郎)', 'Kerry Eurodyne (凱瑞·歐羅丹)', 'River Ward (瑞佛·沃德)', 'Solomon Reed (索羅門·李德)', 'Viktor Vektor (維克多·Vector)', 'Mitch Anderson (米契·安德森)', 'Saul Bright (索爾·布萊特)', 'Placide (普拉西德)', 'Ozob Bozo (噁心幫·波索)', 'Denny (丹妮)', 'Hideo Kojima (小島秀夫)',
    ],
    '女性': [
        'Judy Alvarez (茱蒂·阿爾瓦雷茲)', 'Panam Palmer (帕娜·帕莫)', 'Rogue Amendiares (蘿格·阿門迪亞雷斯)', 'Meredith Stout (梅瑞德斯·斯托特)', 'Alt Cunningham (奧特·坎寧安)', 'Claire Russell (克萊兒·羅素)', 'Evelyn Parker (艾芙琳·帕克)', 'Hanako Arasaka (荒坂華子)', 'Wakako Okada (岡田和歌子)', 'Mama Welles (威爾斯媽媽)', 'Misty Olszewski (米絲蒂·奧爾謝夫斯基)', 'Blue Moon (藍月)', 'Red Menace (紅禍)', 'Purple Force (紫力)',
    ],
    '其他': [
        'Johnny Silverhand (強尼·銀手)', 'Songbird (鳴鳥)', 'Delamain (德拉曼)', 'Brendan (布蘭登)', 'Skippy (小嗶)', 'Nibbles the Cat (小貓尼波)', 'Granny (老奶奶)', 'Sandra Dorsett (珊卓·多賽特)', 'Regina Jones (芮琪娜·瓊斯)', 'Mr. Hands (手手先生)',
    ]
};

export const NIGHT_CITY_COMPANION_PROMPTS: Record<string, string> = {
    'Johnny Silverhand (強尼·銀手)': "Johnny Silverhand, a digital ghost with the likeness of Keanu Reeves. He has a signature silver cybernetic arm, classic aviator sunglasses, a faded Samurai band tank top, and dog tags. He often appears as a semi-transparent, glitching blue construct, embodying a rebellious rockstar attitude.",
    'Judy Alvarez (茱蒂·阿爾瓦雷茲)': "Judy Alvarez, a skilled braindance technician. She has a distinctive undercut hairstyle, often with green and pink highlights. Her arms are covered in colorful tattoos, including a '13' and Mox-related imagery. Typically wears a tank top and cargo pants, reflecting her practical, tech-focused personality.",
    'Panam Palmer (帕娜·帕莫)': "Panam Palmer, a fiercely independent Nomad from the Aldecaldos clan. She has dark, shoulder-length hair, often wears a worn leather jacket with the Aldecaldos patch on the back, and practical, rugged clothing. Her expression is usually determined and she is often seen with a sniper rifle.",
    'Jackie Welles (傑奇·威爾斯)': "Jackie Welles, a loyal and burly mercenary. He has slicked-back dark hair, a thick mustache, and a muscular build. He favors a Valentino-style leather vest, often worn shirtless, and wields his signature gold-plated pistols. His personality is a mix of tough-guy swagger and genuine warmth.",
    'Rogue Amendiares (蘿格·阿門迪亞雷斯)': "Rogue Amendiares, the legendary queen of the Afterlife. An older, experienced fixer with shoulder-length blonde hair. She dresses in stylish, sharp, and practical all-black outfits, exuding an aura of cool confidence and undisputed authority.",
    'Goro Takemura (竹村五郎)': "Goro Takemura, a former Arasaka bodyguard with a strong sense of honor. An older Japanese man with sharp features and graying hair. He is always impeccably dressed in a high-quality Arasaka suit. His face has subtle cyberware lines, and he carries a stern, deeply serious expression.",
    'Kerry Eurodyne (凱瑞·歐羅丹)': "Kerry Eurodyne, an aging rockstar and former bandmate of Johnny Silverhand. He has a flamboyant style, often wearing gold, leather, and extravagant jackets. His hair is styled, and he often has a guitar nearby. He projects a mix of creative energy and world-weary cynicism.",
    'River Ward (瑞佛·沃德)': "River Ward, a troubled but dedicated NCPD detective. He has a rugged appearance with short brown hair and a tired, concerned expression. His clothing is simple and functional, usually a jacket over a plain shirt and jeans, reflecting his down-to-earth nature.",
    'Songbird (鳴鳥)': "Songbird (So Mi), an exceptionally talented netrunner with a deep connection to the Blackwall. She has a sleek, futuristic appearance with dark hair and extensive, intricate cyberware across her face and body, often glowing with red or orange light. She wears a form-fitting, high-tech black outfit, and her expression is intense and mysterious.",
    'Solomon Reed (索羅門·李德)': "Solomon Reed, a veteran FIA secret agent with the likeness of Idris Elba. He is a tall, imposing figure who dresses in a professional, understated style, often seen in a dark trench coat. He has a stoic, composed demeanor, and his face shows the experience of a seasoned spy.",
    'Red Menace (紅禍)': 'Red Menace is a core member of the pop band Us Cracks, known for her vibrant magenta hair styled in buns, a red outfit with a punk-style choker, and her eyes hidden behind dark, futuristic glasses.',
    'Blue Moon (藍月)': 'Blue Moon is another core member of the band, easily recognized by her bright blue hair in matching buns, a blue and pink outfit, and a distinct yellow collar.',
    'Purple Force (紫力)': 'The third member of the trio, Purple Force stands out with her bright purple hair in high pigtails and large, doll-like cybernetic eyes that cover most of her face.',
};

export const NIGHT_CITY_MISSIONS = [
    { 
        label: '隨機任務',
        options: []
    },
    {
        label: "戰鬥與衝突",
        options: [
            "在一場激烈的槍戰中從掩體後方探出頭來",
            "從高處進行狙擊，瞄準下方的敵人",
            "與一群幫派份子進行白刃戰",
            "在爆炸的火光中衝刺",
            "使用智能武器，子彈在空中轉彎",
            "啟動沙德威斯坦，在子彈時間中閃避攻擊",
            "被NCPD或創傷小組包圍",
            "駭入敵人的義體使其失靈",

            "在高速公路上的飛車追逐戰",
            "從墜毀的飛行器殘骸中爬出",
            "背靠背與夥伴共同抵禦敵人",
            "使用螳螂刀進行殘酷的處決",
            "在煙霧或沙塵暴中作戰",
            "守衛一個重要的據點，抵擋一波波的攻擊",
            "與一個巨大的戰鬥機甲對峙",
            "在狹窄的走廊中進行近距離戰鬥 (CQC)",
            "使用重型武器摧毀敵方載具",
            "在一場黑幫戰爭中衝鋒陷陣",
        ]
    },
    {
        label: "潛入與偵查",
        options: [
            "悄悄地從守衛身後溜過",
            "使用光學迷彩潛入戒備森嚴的設施",
            "從通風管道中窺視下方的會議",
            "駭入監控攝影機以觀察敵情",
            "在雷射網中穿梭",
            "在高樓的窗戶外緣攀爬",
            "在黑暗中無聲地放倒一個敵人",
            "在目標的電腦上安裝竊聽裝置",
            "偽裝成工作人員，混入派對",
            "使用無人機進行遠程偵察",
            "破解一個複雜的電子鎖",
            "在水下潛入一個秘密基地",
        ]
    },
    {
        label: "社交與談判",
        options: [
            "在來生酒吧的吧台與傳奇傭兵交談",
            "與一位公司高管進行緊張的談判",
            "在一個奢華的派對上收集情报",
            "在街頭與線人進行秘密交易",
            "審問一個被捕獲的敵人",
            "向一位重要的客戶簡報任務計畫",
            "在一個搖滾演唱會的後台與樂手見面",
            "說服一個幫派頭目達成協議",
            "在一個黑市上討價-還價",
            "在一個高級餐廳進行一場虛偽的商業晚宴",
            "在法庭上或聽證會上作證",
        ]
    },
    {
        label: "日常生活與情感",
        options: [
            "獨自一人在公寓的窗邊凝視著雨中的城市",
            "在街頭小吃攤吃著合成麵",
            "修理或改造自己的義體或武器",
            "在虛擬實境中放鬆",
            "開車或騎車在夜城的高速公路上兜風",
            "在一個熙熙攘攘的市場中穿梭",
            "探望一位住在超級摩天樓裡的朋友",
            "在惡地的星空下露營",
            "與伴侶在一家隱密的餐廳約會",
            "與伴侶在公寓裡享受寧靜的時光",
            "男友/女友視角下的溫馨互動",
            "一個深情的擁抱或親吻",
            "在雨中激烈地爭吵",
            "因為背叛而心碎，獨自一人流淚",
            "與曾經的夥伴或愛人決裂，分道揚鑣",
            "在戰鬥後互相為對方包紮傷口",
            "在墓地或紀念館悼念逝去的友人",
            "收到一個意想不到的壞消息，表情震驚",
            "在一段超夢中重溫過去的回憶",
            "疲憊地回到家，倒在沙發上",
            "在鏡子前審視自己滿身的傷疤和義體",
        ]
    },
    {
        label: "場面調度與構圖",
        options: [
            "廣角鏡頭下，一個渺小的人影站在巨大的建築前",
            "特寫鏡頭，捕捉角色臉上複雜的表情",
            "從下往上的仰視鏡頭，突顯角色的氣勢",
            "從上往下的俯視鏡頭，展現場景的全貌",
            "荷蘭角（傾斜）鏡頭，營造不安和混亂感",
            "過肩鏡頭，表現兩人之間的對話",
            "剪影效果，角色站在明亮的背景前",
            "角色被霓虹燈的倒影所包圍",
            "在鏡子或水面的反射中看到角色的另一面",
            "角色的一部分被陰影或物體遮擋，製造懸念",
            "使用淺景深，只有角色是清晰的，背景完全模糊",
            "角色處於畫面的黃金分割點上",
            "對稱構圖，角色位於畫面的正中央",
            "框架式構圖，透過門框或窗戶看角色",
            "引導線構圖，利用公路或建築的線條將視線引向角色",
        ]
    }
];

export const DYNAMIC_ACTION_PROMPTS = [
    "從高處跳下，進行英雄式落地",
    "在牆壁上飛簷走壁",
    "滑鏟進入掩體，同時開火",
    "一個帥氣的戰術翻滾來閃避攻擊",
    "踹開一扇門，突襲房間",
    "從一台行駛中的車輛跳到另一台上",
    "與敵人進行激烈的近身格鬥",
    "騎著摩托車翹起前輪",
    "優雅地拔出或收回武士刀",
    "在奔跑中更換彈匣",
    "駭入周遭環境，引發混亂（例如讓灑水器啟動）",
    "靠在一輛跑車上，酷酷地點燃一根菸",
    "在吧台前悠閒地擦拭著自己的手槍",
    "啟動二段跳，越過障礙物",
    "使用射彈發射系統，轟炸一片區域",
    "從敵人手中奪取武器",
    "在空中使用空中衝刺來改變方向",
    "使用單分子線進行悄無聲息的暗殺",
    "撞碎玻璃，破窗而入",
    "在爆炸的衝擊波中站穩腳跟",
];

export const IMMERSIVE_QUALITY_PROMPTS = [
    "電影級光影，體積光，空氣中飄浮著灰塵顆粒",
    "8K超高解析度，銳利的細節，逼真的皮膚紋理",
    "強烈的鏡頭光暈，畫面帶有膠片顆粒感",
    "潮濕的地面反射著霓虹燈光，空氣中有水蒸氣",
    "高動態範圍（HDR），暗部細節豐富，亮部不過曝",
    "寬銀幕電影鏡頭（Anamorphic lens），帶有橢圓形的光斑",
    "使用了移軸鏡頭，營造出微縮模型般的景觀",
    "畫面有輕微的色差（Chromatic Aberration）效果",
    "霧氣或煙霧瀰漫，光線在其中產生丁達爾效應",
    "高對比度的黑白攝影，光影分明，風格強烈",
    "復古的CRT螢幕掃描線效果",
    "長時間曝光攝影效果，光軌拖曳成線",
    "魚眼鏡頭的誇張透視效果",
    "手持攝影機的輕微晃動感，增加真實性",
    "柔焦效果，畫面帶有一種夢幻感",
    "哥德式恐怖氛圍，陰影深邃，色調偏冷",
    "賽博龐克風格的數位雜訊和Glitch效果",
    "背景有動態模糊，突顯主體的移動速度",
    "使用了偏光鏡，色彩飽和度極高，天空湛藍",
];