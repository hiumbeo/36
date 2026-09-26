/**
 * Bộ thư viện 100+ Lệnh Prefix cho Discord Selfbot 24/7
 * Được chia thành 6 danh mục chính:
 * 1. Trạng Thái & Gaming Rich Presence
 * 2. Tiện Ích & Thông Tin Hệ Thống
 * 3. Treo Voice AFK 24/7
 * 4. Hiệu Ứng Chữ & ASCII & Mã Hóa
 * 5. Giải Trí & Minigame & Tương Tác
 * 6. Toán Học & Công Cụ Hữu Ích
 */

export interface CommandContext {
  client: any;
  msg: any;
  command: string;
  args: string[];
  argsString: string;
  prefix: string;
  manager: any;
  sendOrEdit: (channelId: string, messageId: string | null, content: string) => Promise<void>;
  deleteMessage?: (channelId: string, messageId: string) => Promise<boolean>;
  addReaction?: (channelId: string, messageId: string, emoji: string) => Promise<boolean>;
}

// Bảng chuyển đổi chữ hoa thường ngẫu nhiên (Mock)
function mockText(str: string): string {
  return str
    .split('')
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join('');
}

// Bảng chữ dãn cách Vaporwave / Fullwidth
function vaporwaveText(str: string): string {
  return str
    .split('')
    .map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 33 && code <= 126) {
        return String.fromCharCode(code + 65248);
      }
      if (code === 32) return '  ';
      return c;
    })
    .join('');
}

// Bảng chữ lộn ngược Upside Down
const flipMap: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l',
  m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x',
  y: 'ʎ', z: 'z', A: '∀', B: 'q', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I', J: 'ſ',
  K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Q', R: 'ɹ', S: 'S', T: '┴', U: '∩', V: 'Λ',
  W: 'M', X: 'X', Y: '⅄', Z: 'Z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9',
  '7': 'ㄥ', '8': '8', '9': '6', '0': '0', '.': '˙', ',': "'", "'": ',', '"': '„', '!': '¡',
  '?': '¿', '<': '>', '>': '<', '&': '⅋', '_': '‾',
};

function flipText(str: string): string {
  return str
    .split('')
    .reverse()
    .map((c) => flipMap[c] || c)
    .join('');
}

// Bảng mã Morse
const morseMap: Record<string, string> = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..',
  j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.',
  s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
  '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
  ' ': '/',
};

function toMorse(str: string): string {
  return str
    .toLowerCase()
    .split('')
    .map((c) => morseMap[c] || c)
    .join(' ');
}

// Máy tính an toàn không dùng eval
function safeCalc(expr: string): string {
  try {
    const clean = expr.replace(/[^0-9+\-*/().%^]/g, '');
    if (!clean) return 'Biểu thức không hợp lệ!';
    // Hỗ trợ luỹ thừa ^
    const formula = clean.replace(/\^/g, '**');
    // Function constructor an toàn hơn eval thuần, không truy cập context
    const fn = new Function(`return (${formula})`);
    const val = fn();
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return val.toLocaleString('vi-VN');
    }
    return 'Không tính được kết quả hợp lệ!';
  } catch (err: any) {
    return `Lỗi biểu thức: ${err.message}`;
  }
}

// Danh ngôn hay
const quotesList = [
  '“Hành trình vạn dặm bắt đầu từ một bước chân.” – Lão Tử',
  '“Thất bại là mẹ của thành công.” – Ngạn ngữ',
  '“Cách tốt nhất để dự đoán tương lai là tạo ra nó.” – Peter Drucker',
  '“Hãy sống như thể bạn sẽ chết ngày mai. Hãy học như thể bạn sẽ sống mãi mãi.” – Mahatma Gandhi',
  '“Không có áp lực, không có kim cương.” – Thomas Carlyle',
  '“Nếu bạn muốn đi nhanh, hãy đi một mình. Nếu bạn muốn đi xa, hãy đi cùng nhau.” – Ngạn ngữ châu Phi',
  '“Sự kiên trì là chìa khóa mở mọi cánh cửa.” – Khuyết danh',
  '“Đừng đợi thời cơ thuận lợi, hãy tạo ra nó.” – George Bernard Shaw',
];

// Chuyện cười
const jokesList = [
  'Thầy giáo hỏi: "Tại sao Trái Đất lại quay?". Học sinh: "Thưa thầy vì nó chóng mặt quá ạ!"',
  'Bác sĩ: "Anh bị bệnh gì?". Bệnh nhân: "Tôi bị bệnh hay quên ạ". Bác sĩ: "Bị từ bao giờ?". Bệnh nhân: "Ủa ai bị gì cơ?"',
  'Một lập trình viên đi chợ, vợ dặn: "Mua cho em 1 nải chuối, nếu thấy trứng thì mua 10 quả nhé". Lập trình viên quay về với 10 nải chuối vì thấy có bán trứng.',
  'Hai con cá bơi dưới nước, một con đâm vào tường kêu: "Đập m* nó!"',
];

// Sự thật thú vị
const factsList = [
  'Bạch tuộc có tới 3 trái tim và máu của chúng có màu xanh lam.',
  'Mật ong nguyên chất là loại thực phẩm duy nhất trên Trái Đất không bao giờ bị thiu hay hư hỏng theo thời gian.',
  'Dấu vân tay của loài gấu túi Koala giống con người đến mức có thể đánh lừa được nhân viên pháp y tại hiện trường.',
  'Sao Kim là hành tinh duy nhất trong Hệ Mặt Trời quay theo chiều kim đồng hồ.',
  'Mỗi ngày có khoảng 8.6 triệu cú sét đánh xuống bề mặt Trái Đất.',
  'Não bộ con người tạo ra đủ điện năng để thắp sáng một bóng đèn LED nhỏ.',
];

/**
 * Điều phối và thực thi hơn 100 câu lệnh
 */
export async function handleExtensiveCommand(ctx: CommandContext): Promise<boolean> {
  const { client, msg, command, args, argsString, prefix, manager, sendOrEdit } = ctx;
  const p = prefix;

  switch (command) {
    // ==========================================
    // 1. TRẠNG THÁI & GAMING RICH PRESENCE (22 Lệnh)
    // ==========================================
    case 'val':
    case 'valorant': {
      const mode = argsString || 'Competitive (Ascendant 3)';
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'VALORANT',
        type: 0,
        details: `In Match - ${mode}`,
        state: 'Score: 11 - 9 (Ascent)',
        application_id: '700136079562375218',
        assets: {
          large_image: 'https://images.contentstack.io/v3/assets/blt3706121367b58f95/blt0ebffbc004c00030/644a86b1f24d1a49ab500e52/VALORANT_Jett_Red.jpg',
          large_text: 'VALORANT (Riot Games)',
          small_image: 'https://cdn.discordapp.com/app-assets/700136079562375218/700140810141696071.png',
          small_text: 'Ascendant 3',
        },
      }, { text: 'Đang leo rank Valorant 🔥', emojiName: '🎯' });
      await sendOrEdit(msg.channel_id, msg.id, `🎯 Đã đổi sang chơi **VALORANT** 24/7 (Có hình ảnh Rich Presence): \`${mode}\` | \`Ascendant 3 - Score 11:9\``);
      return true;
    }

    case 'lol':
    case 'league': {
      const rank = argsString || 'Challenger Solo/Duo';
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'League of Legends',
        type: 0,
        details: `Ranked Solo (${rank})`,
        state: 'Summoner\'s Rift (24:12)',
        application_id: '356869127241072640',
        assets: {
          large_image: 'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt1259b14b3d1b1f38/5db05fa80cdae30bb7375d34/RiotX_Spellteller_Disclaimer_1920x1080.jpg',
          large_text: 'League of Legends',
          small_image: 'https://cdn.discordapp.com/app-assets/356869127241072640/731174987624349767.png',
          small_text: 'Thách Đấu (Challenger)',
        },
      }, { text: 'Đang leo Thách Đấu LMHT ⚔️', emojiName: '⚔️' });
      await sendOrEdit(msg.channel_id, msg.id, `⚔️ Đã chuyển sang chơi **League of Legends** (Có hình ảnh Rich Presence): \`${rank}\``);
      return true;
    }

    case 'cs2':
    case 'csgo': {
      const map = argsString || 'Mirage (Premier 21,500)';
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'Counter-Strike 2',
        type: 0,
        details: `Premier Match (${map})`,
        state: 'Competitive (Score 12 - 8)',
        application_id: '1016765793448378418',
        assets: {
          large_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
          large_text: 'Counter-Strike 2',
          small_image: 'https://cdn.discordapp.com/app-assets/1016765793448378418/1156994784406208573.png',
          small_text: 'Premier 21,500',
        },
      }, { text: 'CS2 Premier Clutch 🔥', emojiName: '💣' });
      await sendOrEdit(msg.channel_id, msg.id, `💣 Đã chuyển sang chơi **Counter-Strike 2** (Có hình ảnh Rich Presence): \`${map}\``);
      return true;
    }

    case 'mc':
    case 'minecraft': {
      const world = argsString || 'Hardcore Survival World';
      manager.updatePresence(client.session.id, 'online', {
        name: 'Minecraft',
        type: 0,
        details: `Playing ${world}`,
        state: 'Building Mega Base (Day 342)',
        application_id: '432980957394370572',
        assets: {
          large_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/header.jpg',
          large_text: 'Minecraft Java Edition',
        },
      }, { text: 'Minecraft Hardcore ⛏️', emojiName: '⛏️' });
      await sendOrEdit(msg.channel_id, msg.id, `⛏️ Đã chuyển sang chơi **Minecraft** (Có hình ảnh Rich Presence): \`${world}\``);
      return true;
    }

    case 'gta':
    case 'gta5': {
      const server = argsString || 'FiveM Vietnam Roleplay';
      manager.updatePresence(client.session.id, 'online', {
        name: 'Grand Theft Auto V',
        type: 0,
        details: server,
        state: 'Los Santos City (Online)',
        application_id: '356875221078245376',
        assets: {
          large_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
          large_text: 'Grand Theft Auto V',
        },
      }, { text: 'GTA V Roleplay 🚗', emojiName: '🚗' });
      await sendOrEdit(msg.channel_id, msg.id, `🚗 Đã chuyển sang chơi **GTA V** (Có hình ảnh Rich Presence): \`${server}\``);
      return true;
    }

    case 'roblox': {
      const game = argsString || 'Blox Fruits (Sea 3)';
      manager.updatePresence(client.session.id, 'online', {
        name: 'Roblox',
        type: 0,
        details: `Playing ${game}`,
        state: 'In Server (AFK Farming)',
        application_id: '440594246830587904',
        assets: {
          large_image: 'https://images.rbxcdn.com/f9c8bbd02d334dd163c461159828453d.jpg',
          large_text: 'Roblox Blox Fruits',
        },
      }, { text: 'Roblox Grinding 🧱', emojiName: '🧱' });
      await sendOrEdit(msg.channel_id, msg.id, `🧱 Đã chuyển sang chơi **Roblox** (Có hình ảnh Rich Presence): \`${game}\``);
      return true;
    }

    case 'genshin': {
      const ar = argsString || 'AR 60 - Spiral Abyss Floor 12-3';
      manager.updatePresence(client.session.id, 'online', {
        name: 'Genshin Impact',
        type: 0,
        details: ar,
        state: 'Exploring Teyvat',
        application_id: '762434991303950386',
        assets: {
          large_image: 'https://fastcdn.hoyoverse.com/content-v2/hk4e/122049/236166ec7135e5a2db12be21711fbab7_8368565127021482937.png',
          large_text: 'Genshin Impact (miHoYo)',
        },
      }, { text: 'Genshin Impact 🌠', emojiName: '🌠' });
      await sendOrEdit(msg.channel_id, msg.id, `🌠 Đã chuyển sang chơi **Genshin Impact** (Có hình ảnh Rich Presence): \`${ar}\``);
      return true;
    }

    case 'pubg': {
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'PUBG: BATTLEGROUNDS',
        type: 0,
        details: 'Ranked Squad - Erangel',
        state: 'Alive: 14/100 | Kills: 6',
        assets: {
          large_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg',
          large_text: 'PUBG: BATTLEGROUNDS',
        },
      }, { text: 'Winner Winner Chicken Dinner 🍗', emojiName: '🍗' });
      await sendOrEdit(msg.channel_id, msg.id, `🍗 Đã chuyển sang chơi **PUBG: BATTLEGROUNDS** (Có hình ảnh Rich Presence)`);
      return true;
    }

    case 'ff':
    case 'freefire': {
      manager.updatePresence(client.session.id, 'online', {
        name: 'Free Fire',
        type: 0,
        details: 'Tử Chiến Xếp Hạng (Thách Đấu)',
        state: 'Đang gánh team 4v4',
        assets: {
          large_image: 'https://play-lh.googleusercontent.com/I2vFpE45D7c663F1R4Kqf7uS5G6K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z=w512-h250',
          large_text: 'Garena Free Fire',
        },
      }, { text: 'Free Fire Leo Rank 🔥', emojiName: '🔥' });
      await sendOrEdit(msg.channel_id, msg.id, `🔥 Đã chuyển sang chơi **Free Fire** (Có hình ảnh)`);
      return true;
    }

    case 'cod':
    case 'warzone': {
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'Call of Duty: Warzone',
        type: 0,
        details: 'Battle Royale Trios',
        state: 'Verdansk / Urzikstan',
        assets: {
          large_image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg',
          large_text: 'Call of Duty: Warzone',
        },
      }, { text: 'Call of Duty Warzone 🪖', emojiName: '🪖' });
      await sendOrEdit(msg.channel_id, msg.id, `🪖 Đã chuyển sang chơi **Call of Duty: Warzone** (Có hình ảnh)`);
      return true;
    }

    case 'gameimg':
    case 'setgameimg': {
      if (args.length < 2) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Cú pháp: \`${p}gameimg <Tên Game> <URL_Ảnh>\`\nVí dụ: \`${p}gameimg Black Myth Wukong https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg\``);
        return true;
      }
      const imageUrl = args[args.length - 1];
      const gameName = args.slice(0, -1).join(' ').trim();
      manager.updatePresence(client.session.id, client.session.status, {
        name: gameName,
        type: 0,
        details: 'Đang chơi game 24/7',
        state: 'Rich Presence Artwork',
        assets: {
          large_image: imageUrl,
          large_text: gameName,
        },
      });
      await sendOrEdit(msg.channel_id, msg.id, `🎮 Đã đặt trạng thái chơi **${gameName}** kèm ảnh bìa Rich Presence: \`${imageUrl}\``);
      return true;
    }

    case 'fifa':
    case 'fc24': {
      manager.updatePresence(client.session.id, 'online', {
        name: 'EA SPORTS FC 24',
        type: 0,
        details: 'Ultimate Team Champions',
        state: 'Weekend League (14 - 2)',
      }, { text: 'EA Sports FC ⚽', emojiName: '⚽' });
      await sendOrEdit(msg.channel_id, msg.id, `⚽ Đã chuyển sang chơi **EA SPORTS FC 24**`);
      return true;
    }

    case 'amongus': {
      manager.updatePresence(client.session.id, 'online', {
        name: 'Among Us',
        type: 0,
        details: 'In Match (The Skeld)',
        state: 'Impostor: Red sus ඞ',
      }, { text: 'Among Us ඞ', emojiName: 'ඞ' });
      await sendOrEdit(msg.channel_id, msg.id, `ඞ Đã chuyển sang chơi **Among Us**: *There is 1 Impostor among us*`);
      return true;
    }

    case 'osu': {
      manager.updatePresence(client.session.id, 'online', {
        name: 'osu!',
        type: 0,
        details: 'Chiku-Taku [Expert] +HDDT',
        state: 'Accuracy: 99.82% (FC 727pp)',
      }, { text: 'osu! 727pp 🎯', emojiName: '🎯' });
      await sendOrEdit(msg.channel_id, msg.id, `🎯 Đã chuyển sang chơi **osu!** (727pp Blue Zenith)`);
      return true;
    }

    case 'dota':
    case 'dota2': {
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'Dota 2',
        type: 0,
        details: 'Ranked Matchmaking (Immortal)',
        state: 'Playing Invoker (Score: 18/2/14)',
      }, { text: 'Dota 2 Immortal 🛡️', emojiName: '🛡️' });
      await sendOrEdit(msg.channel_id, msg.id, `🛡️ Đã chuyển sang chơi **Dota 2** (Ranked Immortal)`);
      return true;
    }

    case 'stream': {
      const title = argsString || 'Live Streaming 24/7 on Render.com Cloud';
      const url = args[0]?.startsWith('http') ? args[0] : 'https://twitch.tv/discord_live_stream';
      manager.updatePresence(client.session.id, 'online', {
        name: 'Twitch',
        type: 1, // Streaming (Viền tím)
        details: title,
        state: 'Treo Stream 24/7',
        url,
      });
      await sendOrEdit(msg.channel_id, msg.id, `🟣 Đã bật trạng thái **Stream Twitch (Viền Tím)**: \`${title}\` (Link: <${url}>)`);
      return true;
    }

    case 'yt':
    case 'youtube': {
      const title = argsString || 'Live Gaming Stream 24/7';
      manager.updatePresence(client.session.id, 'online', {
        name: 'YouTube',
        type: 1,
        details: title,
        state: 'Streaming on YouTube',
        url: 'https://youtube.com',
      });
      await sendOrEdit(msg.channel_id, msg.id, `🔴 Đã bật trạng thái **Stream YouTube**: \`${title}\``);
      return true;
    }

    case 'watch': {
      const movie = argsString || 'Netflix / Anime Series';
      manager.updatePresence(client.session.id, client.session.status, {
        name: movie,
        type: 3, // Watching
        details: 'Xem phim thư giãn 24/7',
        state: 'Full HD 4K HDR',
      });
      await sendOrEdit(msg.channel_id, msg.id, `📺 Đã chuyển sang trạng thái đang xem: **${movie}**`);
      return true;
    }

    case 'listen':
    case 'spotify': {
      const song = argsString || 'Lofi Hip Hop Radio - Beats to Relax/Study to';
      manager.updatePresence(client.session.id, client.session.status, {
        name: 'Spotify',
        type: 2, // Listening
        details: song,
        state: 'Lofi Girl / Chillhop Music',
      });
      await sendOrEdit(msg.channel_id, msg.id, `🎧 Đã chuyển sang trạng thái đang nghe Spotify: **${song}**`);
      return true;
    }

    case 'sc':
    case 'soundcloud':
    case 'scplay': {
      if (!argsString) {
        const defaultTrack = 'Chillhop / Lofi Beats SoundCloud';
        manager.updatePresence(client.session.id, client.session.status, {
          name: 'SoundCloud',
          type: 2, // Listening
          details: defaultTrack,
          state: 'SoundCloud 24/7 Stream 🎧',
          url: 'https://soundcloud.com',
        });
        await sendOrEdit(msg.channel_id, msg.id, `🎧 Đã bật Rich Presence nghe nhạc **SoundCloud**: **${defaultTrack}**\n• Mẹo: Gõ \`${p}sc <tên bài hát hoặc link>\` để đổi bài!`);
        return true;
      }

      let input = argsString.trim();
      if (input.toLowerCase().startsWith('play ')) {
        input = input.slice(5).trim();
      }

      // Kiểm tra nếu người dùng dán đường dẫn SoundCloud
      const scUrlMatch = input.match(/https?:\/\/(?:www\.)?(?:on\.)?soundcloud\.com\/[^\s>"]+/i);

      if (scUrlMatch) {
        const scUrl = scUrlMatch[0].replace(/>$/, '');
        try {
          const oembedApi = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(scUrl)}`;
          const oembedRes = await fetch(oembedApi, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            },
          });

          if (oembedRes.ok) {
            const data: any = await oembedRes.json();
            const title = data.title || 'SoundCloud Track';
            const artist = data.author_name || 'SoundCloud Artist';
            const thumbnail = data.thumbnail_url || '';

            manager.updatePresence(client.session.id, client.session.status, {
              name: 'SoundCloud',
              type: 2, // Listening
              details: title,
              state: `Nghệ sĩ: ${artist}`,
              url: scUrl,
            });

            const replyLines = [
              `🟠 **ĐANG PHÁT NHẠC SOUNDCLOUD (Rich Presence 24/7):**`,
              `• 🎵 **Bài hát:** **${title}**`,
              `• 👤 **Nghệ sĩ:** ${artist}`,
              `• 🔗 **Link bài:** <${scUrl}>`,
              thumbnail ? thumbnail : '',
            ].filter(Boolean).join('\n');

            await sendOrEdit(msg.channel_id, msg.id, replyLines);
            return true;
          }
        } catch {}

        // Nếu API oembed timeout hoặc link rút gọn, tự bóc tách title từ URL
        const urlClean = scUrl.replace(/https?:\/\/(?:www\.)?(?:on\.)?soundcloud\.com\//i, '');
        const parts = urlClean.split('/');
        const guessedArtist = (parts[0] || 'SoundCloud').replace(/-/g, ' ');
        const guessedTitle = (parts[1] || 'Music Track').replace(/-/g, ' ');

        manager.updatePresence(client.session.id, client.session.status, {
          name: 'SoundCloud',
          type: 2,
          details: guessedTitle,
          state: `Nghệ sĩ: ${guessedArtist}`,
          url: scUrl,
        });

        await sendOrEdit(msg.channel_id, msg.id, `🟠 **ĐANG PHÁT NHẠC SOUNDCLOUD:**\n• 🎵 **Bài hát:** **${guessedTitle}**\n• 👤 **Nghệ sĩ:** ${guessedArtist}\n• 🔗 **Link:** <${scUrl}>`);
        return true;
      }

      // Trường hợp người dùng nhập tên bài hát
      const songTitle = input;
      const searchUrl = `https://soundcloud.com/search?q=${encodeURIComponent(songTitle)}`;

      manager.updatePresence(client.session.id, client.session.status, {
        name: 'SoundCloud',
        type: 2, // Listening
        details: songTitle,
        state: 'SoundCloud Stream 🎧',
        url: searchUrl,
      });

      const reply = [
        `🟠 **ĐANG PHÁT NHẠC SOUNDCLOUD (Rich Presence 24/7):**`,
        `• 🎵 **Bài hát:** **${songTitle}**`,
        `• 🌐 **Nền tảng:** SoundCloud Music Stream`,
        `• 🔗 **Tìm & Nghe:** <${searchUrl}>`,
      ].join('\n');

      await sendOrEdit(msg.channel_id, msg.id, reply);
      return true;
    }

    case 'scstop':
    case 'scpause': {
      manager.updatePresence(client.session.id, client.session.status, null);
      await sendOrEdit(msg.channel_id, msg.id, `⏹️ Đã dừng phát nhạc SoundCloud và xóa trạng thái nghe nhạc.`);
      return true;
    }

    case 'scinfo': {
      if (!argsString) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Vui lòng nhập link bài hát SoundCloud! Ví dụ: \`${p}scinfo https://soundcloud.com/...\``);
        return true;
      }
      const targetUrl = argsString.trim().replace(/^<|>$/g, '');
      try {
        const oembedApi = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(oembedApi);
        if (res.ok) {
          const data: any = await res.json();
          const info = [
            `🎵 **THÔNG TIN BÀI HÁT SOUNDCLOUD:**`,
            `• 🏷️ **Tiêu đề:** **${data.title}**`,
            `• 👤 **Nghệ sĩ:** ${data.author_name} (<${data.author_url}>)`,
            `• 🔗 **Link bài:** <${targetUrl}>`,
            data.thumbnail_url ? data.thumbnail_url : '',
          ].filter(Boolean).join('\n');
          await sendOrEdit(msg.channel_id, msg.id, info);
          return true;
        }
      } catch {}
      await sendOrEdit(msg.channel_id, msg.id, `❌ Không thể lấy thông tin bài hát từ link SoundCloud này.`);
      return true;
    }

    case 'code':
    case 'vscode': {
      const prj = argsString || 'Discord Selfbot Gateway 24/7 (Node.js/TypeScript)';
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'Visual Studio Code',
        type: 0,
        details: `Editing ${prj}`,
        state: 'Workspace: Production Server',
      }, { text: 'Coding 24/7 trên Render Cloud 💻', emojiName: '💻' });
      await sendOrEdit(msg.channel_id, msg.id, `💻 Đã chuyển sang trạng thái lập trình **VS Code**: \`${prj}\``);
      return true;
    }

    case 'custom': {
      if (!argsString) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Vui lòng nhập nội dung custom status! Ví dụ: \`${p}custom Đang học bài 📚\``);
        return true;
      }
      const emoji = args[0]?.length <= 2 ? args[0] : '⚡';
      manager.updatePresence(client.session.id, client.session.status, client.session.activity, {
        text: argsString,
        emojiName: emoji,
      });
      await sendOrEdit(msg.channel_id, msg.id, `✨ Đã cập nhật dòng trạng thái custom: **${argsString}**`);
      return true;
    }

    case 'status': {
      const s = args[0]?.toLowerCase();
      const valid = ['online', 'idle', 'dnd', 'invisible'];
      if (!s || !valid.includes(s)) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Trạng thái không hợp lệ! Hãy chọn: \`online\`, \`idle\`, \`dnd\`, \`invisible\`. Ví dụ: \`${p}status dnd\``);
        return true;
      }
      const customTxt = args.slice(1).join(' ').trim();
      manager.updatePresence(
        client.session.id,
        s as any,
        client.session.activity,
        customTxt ? { text: customTxt } : client.session.customStatus
      );
      const iconMap: Record<string, string> = {
        online: '🟢 Trực tuyến (Online)',
        idle: '🟡 Chờ (Idle)',
        dnd: '🔴 Không làm phiền (Do Not Disturb)',
        invisible: '⚪ Ẩn danh (Invisible)',
      };
      await sendOrEdit(msg.channel_id, msg.id, `⚙️ Đã chuyển trạng thái tài khoản sang: **${iconMap[s]}**`);
      return true;
    }

    case 'clearact':
    case 'stop': {
      manager.updatePresence(client.session.id, client.session.status, {
        name: '',
        type: 0,
        details: '',
        state: '',
      });
      await sendOrEdit(msg.channel_id, msg.id, `🧹 Đã xóa bỏ toàn bộ hoạt động / game đang hiển thị.`);
      return true;
    }

    case 'mobile':
    case 'phone':
    case 'dienthoai':
    case 'pure':
    case 'afk247':
    case 'clean': {
      manager.setPureOnlineMobile(client.session.id);
      await sendOrEdit(
        msg.channel_id,
        msg.id,
        `📱 **ĐÃ BẬT CHẾ ĐỘ TREO ĐIỆN THOẠI TINH KHIẾT 24/7!**\n• 🟢 **Trạng thái:** Trực tuyến liên tục (Online 24/7)\n• 📱 **Biểu tượng Discord:** Cái Điện Thoại xanh lá (Discord Mobile Badge)\n• 🧹 **Không Status & Không Game:** Hoàn toàn tinh khiết theo đúng yêu cầu!`
      );
      return true;
    }

    case 'device':
    case 'thietbi': {
      const type = (args[0] || '').toLowerCase();
      const validTypes = ['mobile', 'phone', 'ios', 'iphone', 'desktop', 'pc', 'web'];
      if (!type || !validTypes.includes(type)) {
        await sendOrEdit(
          msg.channel_id,
          msg.id,
          `❌ Loại thiết bị không hợp lệ! Vui lòng chọn:\n• \`${p}device mobile\` : 📱 Biểu tượng Điện thoại (Android)\n• \`${p}device ios\` : 🍏 Điện thoại iPhone (iOS)\n• \`${p}device desktop\` : 💻 Máy tính (PC Desktop)\n• \`${p}device web\` : 🌐 Trình duyệt Web`
        );
        return true;
      }

      let targetType: 'mobile' | 'ios' | 'desktop' | 'web' = 'mobile';
      if (type === 'mobile' || type === 'phone') targetType = 'mobile';
      else if (type === 'ios' || type === 'iphone') targetType = 'ios';
      else if (type === 'desktop' || type === 'pc') targetType = 'desktop';
      else if (type === 'web') targetType = 'web';

      await manager.updateDeviceType(client.session.id, targetType);
      const icon = targetType === 'mobile' ? '📱 Điện thoại (Android)' : targetType === 'ios' ? '🍏 iPhone (iOS)' : targetType === 'desktop' ? '💻 Máy tính (PC)' : '🌐 Trình duyệt';
      await sendOrEdit(msg.channel_id, msg.id, `✅ Đã chuyển thiết bị sang **${icon}**. Discord đã được cập nhật biểu tượng!`);
      return true;
    }

    // ==========================================
    // LỆNH 1 PHÁT GET ALL STATUS TRONG ACC LUÔN
    // ==========================================
    case 'allstatus':
    case 'getallstatus':
    case 'statusall':
    case 'accstatus':
    case 'fullstatus':
    case 'mystatus': {
      const s = client.session;
      const uptimeSec = s.uptimeStart ? Math.floor((Date.now() - s.uptimeStart) / 1000) : 0;
      const uptimeStr = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`;

      const statusEmoji: Record<string, string> = {
        online: '🟢 Online (Trực tuyến)',
        idle: '🟡 Idle (Chờ vắng mặt)',
        dnd: '🔴 DND (Không làm phiền)',
        invisible: '⚪ Invisible (Ẩn danh)',
      };
      const statusText = statusEmoji[s.status as string] || s.status;

      const deviceLabel: Record<string, string> = {
        mobile: '📱 Điện Thoại (Discord Android)',
        ios: '🍏 iPhone (Discord iOS)',
        desktop: '💻 Máy Tính (PC Desktop)',
        web: '🌐 Trình Duyệt Web',
      };
      const deviceText = deviceLabel[s.deviceType as string] || '📱 Điện Thoại (Android)';

      const customStatusStr = s.customStatus?.text
        ? `${s.customStatus.emojiName ? s.customStatus.emojiName + ' ' : ''}${s.customStatus.text}`
        : 'Chưa đặt';

      const actTypeLabels: Record<number, string> = {
        0: 'Đang chơi game',
        1: 'Đang phát trực tiếp (Stream)',
        2: 'Đang nghe nhạc (Spotify)',
        3: 'Đang xem (Watching)',
        5: 'Đang thi đấu (Competing)',
      };

      const actStr = s.activity?.name
        ? `${actTypeLabels[s.activity.type] || 'Hoạt động'}: **${s.activity.name}**${s.activity.details ? ` - *${s.activity.details}*` : ''}${s.activity.state ? ` (${s.activity.state})` : ''}`
        : 'Không có hoạt động (Chế độ Tinh Khiết)';

      const gameImageStr = s.activity?.assets?.large_image
        ? `\n• 🖼️ **Ảnh Game / Cover:** \`${s.activity.assets.large_image}\`${s.activity.assets.large_text ? ` (*${s.activity.assets.large_text}*)` : ''}`
        : '';

      const voiceStr = s.isVoiceConnected && s.voice.channelId
        ? `🟢 Đang kết nối | Phòng ID: \`${s.voice.channelName || s.voice.channelId}\` | Server: \`${s.voice.guildName || s.voice.guildId}\` | Mic: ${s.voice.selfMute ? 'Tắt 🔇' : 'Bật 🎙️'} | Tai nghe: ${s.voice.selfDeaf ? 'Tắt 🔇' : 'Bật 🎧'}`
        : '⚪ Không vào phòng voice';

      const rotatingStr = s.rotatingStatus?.enabled
        ? `BẬT (${s.rotatingStatus.items.length} trạng thái, chu kỳ ${s.rotatingStatus.intervalSeconds}s)`
        : 'TẮT';

      const afkStr = s.afk?.enabled
        ? `BẬT (*${s.afk.message}*)`
        : 'TẮT';

      const autoReactList = manager.getAutoReactRules(s.id);
      const reactStr = autoReactList.length > 0
        ? autoReactList.map((r: any, idx: number) => `  ${idx + 1}. ${r.emoji} ➔ User: \`${r.targetUsername ? `@${r.targetUsername}` : r.targetUserId}\`${r.guildId ? ` (Server: \`${r.guildId}\`)` : ' (Tất cả Server)'}`).join('\n')
        : '  Chưa đặt mục tiêu nào';

      // Check all sessions in manager
      const allSessions = manager.getSessions();
      let multiAccStr = '';
      if (allSessions.length > 1) {
        multiAccStr = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👥 **TẤT CẢ TÀI KHOẢN ĐANG TREO (${allSessions.length} ACCOUNTS):**\n` +
          allSessions.map((acc: any) => `• **${acc.name}**: ${acc.status.toUpperCase()} (${acc.deviceType === 'mobile' || acc.deviceType === 'ios' ? '📱 Mobile' : '💻 PC'}) | Ping: \`${acc.ping || 25}ms\` | Uptime: \`${acc.uptimeStart ? Math.floor((Date.now() - acc.uptimeStart)/60000) + 'm' : '0m'}\``).join('\n');
      }

      const fullMessage = [
        `📊 **TOÀN BỘ TRẠNG THÁI TÀI KHOẢN (FULL STATUS GET)**`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `👤 **Tài Khoản:** **${s.name}** (@${s.username}#${s.discriminator}) | ID: \`${s.id}\``,
        `📶 **Trạng Thái Gateway:** ${statusText}`,
        `📱 **Biểu Tượng Thiết Bị:** ${deviceText}`,
        `⏱️ **Uptime Gateway:** \`${uptimeStr}\` | Độ trễ (Ping): \`${s.ping || 25}ms\``,
        `💬 **Custom Status:** ${customStatusStr}`,
        `🎮 **Rich Presence:** ${actStr}${gameImageStr}`,
        `🔊 **Treo Voice 24/7:** ${voiceStr}`,
        `🔄 **Tự Động Xoay Status:** ${rotatingStr}`,
        `💤 **Tự Động Trả Lời AFK:** ${afkStr}`,
        `🐶 **Tool Cày OwO Bot 24/7:** ${s.owoConfig?.enabled ? `🟢 ĐANG CÀY tại <#${s.owoConfig.channelId}> (🏹 ${s.owoStats?.huntsCount || 0} hunt | ⚔️ ${s.owoStats?.battlesCount || 0} battle | 🙏 ${s.owoStats?.praysCount || 0} pray)` : '⚪ ĐANG TẮT'}`,
        `🎯 **Mục Tiêu Tự Thả Emoji (Auto-React):**\n${reactStr}${multiAccStr}`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ].join('\n');

      await sendOrEdit(msg.channel_id, msg.id, fullMessage);
      return true;
    }

    // ==========================================
    // LỆNH AUTO REACT EMOJI (ẨN DANH / IM RE / TỰ NHẬN DIỆN SERVER)
    // ==========================================
    case 'autoreact':
    case 'react':
    case 'thaemoji': {
      // 1. IM RE: Luôn xóa tin nhắn lệnh ngay lập tức để ẩn danh hoàn toàn
      if (ctx.deleteMessage) {
        ctx.deleteMessage(msg.channel_id, msg.id).catch(() => {});
      }

      // 2. Tự nhận diện mục tiêu:
      // A. Nếu người dùng reply tin nhắn: lấy author của tin nhắn được reply
      // B. Nếu người dùng mention: lấy mention đầu tiên
      // C. Nếu truyền User ID dạng số: lấy ID đó
      let targetUserId = '';
      let targetUsername = '';
      let emoji = '';

      if (msg.referenced_message?.author) {
        targetUserId = msg.referenced_message.author.id;
        targetUsername = msg.referenced_message.author.username;
        emoji = args[0] || '🔥';
      } else if (msg.mentions && msg.mentions.length > 0) {
        targetUserId = msg.mentions[0].id;
        targetUsername = msg.mentions[0].username;
        emoji = args.find((a: string) => !a.includes(targetUserId) && !a.startsWith('<@')) || '🔥';
      } else if (args[0] && /^\d{16,21}$/.test(args[0])) {
        targetUserId = args[0];
        emoji = args[1] || '🔥';
      }

      if (!targetUserId) {
        manager.addLog('warn', `[Auto-React] Cần tag người dùng (@user), reply tin nhắn của họ hoặc điền User ID. Ví dụ: reply tin nhắn gõ "${prefix}react 🔥" hoặc "${prefix}react @user 🔥"`, client.session.id);
        return true;
      }

      emoji = emoji.trim() || '🔥';

      // Tự nhận diện Server ID hiện tại từ tin nhắn Discord (không cần gõ ra)
      const currentGuildId = msg.guild_id || undefined;

      manager.addAutoReactRule(client.session.id, {
        targetUserId,
        targetUsername,
        emoji,
        guildId: currentGuildId,
      });

      // Nếu đang reply một tin nhắn, thả reaction ngay lập tức vào tin nhắn đó
      if (msg.referenced_message?.id && ctx.addReaction) {
        ctx.addReaction(msg.channel_id, msg.referenced_message.id, emoji).catch(() => {});
      }

      // Tuyệt đối không gửi tin nhắn ra kênh ("im re ko nhan gi")
      manager.addLog('success', `[Auto-React Ẩn Danh] Đã kích hoạt tự động thả emoji "${emoji}" vào tất cả tin nhắn của @${targetUsername || targetUserId} tại server ${currentGuildId ? `(ID: ${currentGuildId})` : 'DM'}. Tin nhắn lệnh đã tự xóa ẩn danh.`, client.session.id);
      return true;
    }

    // ==========================================
    // LỆNH STOP REACT (DỪNG THẢ EMOJI)
    // ==========================================
    case 'stopreact':
    case 'unreact':
    case 'tatreact':
    case 'dungreact': {
      // 1. IM RE: Luôn xóa tin nhắn lệnh ngay lập tức
      if (ctx.deleteMessage) {
        ctx.deleteMessage(msg.channel_id, msg.id).catch(() => {});
      }

      let targetUserId: string | undefined = undefined;
      if (msg.referenced_message?.author) {
        targetUserId = msg.referenced_message.author.id;
      } else if (msg.mentions && msg.mentions.length > 0) {
        targetUserId = msg.mentions[0].id;
      } else if (args[0] && /^\d{16,21}$/.test(args[0])) {
        targetUserId = args[0];
      }

      const currentGuildId = msg.guild_id || undefined;
      const count = manager.removeAutoReactRule(client.session.id, targetUserId, currentGuildId);

      // Tuyệt đối không nhắn gì ra chat
      manager.addLog('info', `[Auto-React] Đã dừng thả emoji (${count} mục tiêu đã gỡ bỏ) tại server ${currentGuildId || 'DM'}. Tin nhắn lệnh đã tự xóa.`, client.session.id);
      return true;
    }

    // ==========================================
    // TOOL CHƠI / CÀY OWO BOT 24/7 (ĐẦY ĐỦ LỆNH & CHỐNG BAN)
    // ==========================================
    case 'owo':
    case 'owofarm':
    case 'owotool': {
      const sub = (args[0] || '').toLowerCase();
      const owoConfig = client.session.owoConfig;
      const owoStats = client.session.owoStats;

      // 1. Bật cày OwO: !owo on [channel_id]
      if (sub === 'on' || sub === 'start' || sub === 'bat') {
        let targetChannel = args[1] || owoConfig?.channelId || msg.channel_id;
        const linkMatch = targetChannel.match(/channels\/[0-9]+\/([0-9]+)/);
        if (linkMatch) {
          targetChannel = linkMatch[1];
        }

        await manager.updateOwOConfig(client.session.id, {
          channelId: targetChannel,
          enabled: true,
        });
        const started = manager.startOwOFarm(client.session.id);

        if (started) {
          const reply = [
            `🚀 **ĐÃ BẬT TOOL CÀY OWO BOT 24/7 THÀNH CÔNG!**`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `📍 **Kênh Cày:** <#${targetChannel}> (ID: \`${targetChannel}\`)`,
            `🏹 **Auto Hunt (owoh):** ${owoConfig?.autoHunt !== false ? 'BẬT ✅' : 'TẮT ❌'}`,
            `⚔️ **Auto Battle (owob):** ${owoConfig?.autoBattle !== false ? 'BẬT ✅' : 'TẮT ❌'}`,
            `🙏 **Auto Pray (owo pray):** ${owoConfig?.autoPray !== false ? 'BẬT ✅' : 'TẮT ❌'}`,
            `🎁 **Auto Daily:** ${owoConfig?.autoDaily !== false ? 'BẬT ✅' : 'TẮT ❌'}`,
            `⏱️ **Chu Kỳ Delay:** ${owoConfig?.minDelay || 15}s - ${owoConfig?.maxDelay || 19}s (+ Jitter ngẫu nhiên)`,
            `🛡️ **Chống Ban:** Tự động phát hiện Captcha & Dừng khẩn cấp, Nghỉ giải lao định kỳ`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `💡 *Gõ \`${p}owo off\` để dừng hoặc \`${p}owo stats\` để xem thống kê cày.*`,
          ].join('\n');
          await sendOrEdit(msg.channel_id, msg.id, reply);
        } else {
          await sendOrEdit(msg.channel_id, msg.id, `⚠️ Không thể khởi chạy cày OwO. Vui lòng kiểm tra kênh hoặc captcha!`);
        }
        return true;
      }

      // 2. Tắt cày OwO: !owo off
      if (sub === 'off' || sub === 'stop' || sub === 'tat') {
        manager.stopOwOFarm(client.session.id);
        await sendOrEdit(msg.channel_id, msg.id, `⏹️ **ĐÃ DỪNG TOOL CÀY OWO BOT!**\n📊 Thống kê phiên cày: **${owoStats?.huntsCount || 0}** hunts | **${owoStats?.battlesCount || 0}** battles | **${owoStats?.praysCount || 0}** prays.`);
        return true;
      }

      // 3. Giải Captcha xong và tiếp tục: !owo resume
      if (sub === 'resume' || sub === 'tieptuc' || sub === 'giaixong') {
        const resumed = manager.resumeOwOFarmAfterCaptcha(client.session.id);
        if (resumed) {
          await sendOrEdit(msg.channel_id, msg.id, `✅ **ĐÃ MỞ KHÓA VÀ TIẾP TỤC CÀY OWO BOT!**\nTrạng thái Captcha đã được làm mới an toàn.`);
        } else {
          await sendOrEdit(msg.channel_id, msg.id, `⚠️ Không thể mở khóa cày OwO. Hãy kiểm tra cấu hình kênh cày!`);
        }
        return true;
      }

      // 4. Chọn kênh cày OwO: !owo channel [channel_id]
      if (sub === 'channel' || sub === 'kenh') {
        let chId = args[1] || msg.channel_id;
        const linkMatch = chId.match(/channels\/[0-9]+\/([0-9]+)/);
        if (linkMatch) chId = linkMatch[1];

        await manager.updateOwOConfig(client.session.id, { channelId: chId });
        await sendOrEdit(msg.channel_id, msg.id, `📍 Đã đặt kênh cày OwO thành: <#${chId}> (ID: \`${chId}\`). Gõ \`${p}owo on\` để bắt đầu cày!`);
        return true;
      }

      // 5. Thống kê cày OwO: !owo stats
      if (sub === 'stats' || sub === 'thongke' || sub === 'info') {
        const uptimeMin = owoStats?.startedAt ? Math.floor((Date.now() - owoStats.startedAt) / 60000) : 0;
        const statusStr = owoConfig?.captchaDetected
          ? '🚨 BỊ KHÓA DO GẶP CAPTCHA (Cần giải)'
          : owoConfig?.enabled
          ? '🟢 Đang chạy cày tự động'
          : '⚪ Đang tạm dừng';

        const statsText = [
          `📊 **BẢNG THỐNG KÊ TOOL CÀY OWO BOT 24/7**`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `⚙️ **Trạng Thái:** ${statusStr}`,
          `📍 **Kênh Đang Cày:** <#${owoConfig?.channelId || msg.channel_id}> (ID: \`${owoConfig?.channelId || 'Chưa đặt'}\`)`,
          `⏱️ **Thời Gian Chạy:** \`${Math.floor(uptimeMin / 60)}h ${uptimeMin % 60}m\``,
          `🏹 **Số Lần Hunt (owoh):** **${owoStats?.huntsCount || 0}** lần`,
          `⚔️ **Số Lần Battle (owob):** **${owoStats?.battlesCount || 0}** lần`,
          `🙏 **Số Lần Pray (owo pray):** **${owoStats?.praysCount || 0}** lần`,
          `🎁 **Số Lần Nhận Daily:** **${owoStats?.dailiesCount || 0}** lần`,
          `🪙 **Số Lần Coinflip / Slots:** **${(owoStats?.coinflipsCount || 0) + (owoStats?.slotsCount || 0)}** lần`,
          `💰 **Cowoncy Thu Được Gần Nhất:** **${owoStats?.cowoncyEarned ? owoStats.cowoncyEarned.toLocaleString() + ' cowoncy' : 'Đang cập nhật'}**`,
          `🛡️ **Chống Ban:** ${owoConfig?.autoSleep ? `Nghỉ ${owoConfig.sleepDurationMinutes || 5}p sau mỗi ${owoConfig.sleepAfterMinutes || 35}p` : 'Tắt'} | Delay: \`${owoConfig?.minDelay || 15}s - ${owoConfig?.maxDelay || 19}s\``,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n');
        await sendOrEdit(msg.channel_id, msg.id, statsText);
        return true;
      }

      // 6. Reset thống kê: !owo reset
      if (sub === 'reset') {
        manager.resetOwOStats(client.session.id);
        await sendOrEdit(msg.channel_id, msg.id, `🔄 Đã đặt lại toàn bộ số liệu thống kê cày OwO về 0!`);
        return true;
      }

      // 7. Gửi lệnh tay ngay lập tức: hunt / battle / pray / daily
      if (sub === 'hunt' || sub === 'h') {
        await manager.sendRawChannelMessage(client, msg.channel_id, 'owoh');
        if (owoStats) owoStats.huntsCount = (owoStats.huntsCount || 0) + 1;
        return true;
      }
      if (sub === 'battle' || sub === 'b') {
        await manager.sendRawChannelMessage(client, msg.channel_id, 'owob');
        if (owoStats) owoStats.battlesCount = (owoStats.battlesCount || 0) + 1;
        return true;
      }
      if (sub === 'pray' || sub === 'p') {
        const prayTarget = args.slice(1).join(' ').trim();
        const cmd = prayTarget ? `owo pray ${prayTarget}` : 'owo pray';
        await manager.sendRawChannelMessage(client, msg.channel_id, cmd);
        if (owoStats) owoStats.praysCount = (owoStats.praysCount || 0) + 1;
        return true;
      }
      if (sub === 'daily') {
        await manager.sendRawChannelMessage(client, msg.channel_id, 'owo daily');
        if (owoStats) owoStats.dailiesCount = (owoStats.dailiesCount || 0) + 1;
        return true;
      }

      // 8. Cấu hình Coinflip / Slots: !owo cf <amount>
      if (sub === 'cf' || sub === 'coinflip') {
        const amt = parseInt(args[1], 10);
        if (args[1] === 'off' || args[1] === 'tat') {
          await manager.updateOwOConfig(client.session.id, { autoCoinflip: false });
          await sendOrEdit(msg.channel_id, msg.id, `🪙 Đã tắt Auto-Coinflip OwO.`);
        } else if (!isNaN(amt) && amt > 0) {
          await manager.updateOwOConfig(client.session.id, { autoCoinflip: true, coinflipAmount: amt });
          await sendOrEdit(msg.channel_id, msg.id, `🪙 Đã bật Auto-Coinflip OwO với số tiền cược: **${amt}** cowoncy mỗi chu kỳ.`);
        } else {
          await sendOrEdit(msg.channel_id, msg.id, `🪙 Cú pháp: \`${p}owo cf <số_tiền>\` hoặc \`${p}owo cf off\``);
        }
        return true;
      }

      // 9. Cấu hình Slots: !owo s <amount>
      if (sub === 's' || sub === 'slots') {
        const amt = parseInt(args[1], 10);
        if (args[1] === 'off' || args[1] === 'tat') {
          await manager.updateOwOConfig(client.session.id, { autoSlots: false });
          await sendOrEdit(msg.channel_id, msg.id, `🎰 Đã tắt Auto-Slots OwO.`);
        } else if (!isNaN(amt) && amt > 0) {
          await manager.updateOwOConfig(client.session.id, { autoSlots: true, slotsAmount: amt });
          await sendOrEdit(msg.channel_id, msg.id, `🎰 Đã bật Auto-Slots OwO với số tiền cược: **${amt}** cowoncy mỗi chu kỳ.`);
        } else {
          await sendOrEdit(msg.channel_id, msg.id, `🎰 Cú pháp: \`${p}owo s <số_tiền>\` hoặc \`${p}owo s off\``);
        }
        return true;
      }

      // 10. Cấu hình độ trễ Delay: !owo delay <min> <max>
      if (sub === 'delay') {
        const min = parseInt(args[1], 10);
        const max = parseInt(args[2], 10);
        if (!isNaN(min) && !isNaN(max) && min >= 13 && max >= min) {
          await manager.updateOwOConfig(client.session.id, { minDelay: min, maxDelay: max });
          await sendOrEdit(msg.channel_id, msg.id, `⏱️ Đã đặt độ trễ cày OwO: **${min}s - ${max}s** (+ ngẫu nhiên chống ban).`);
        } else {
          await sendOrEdit(msg.channel_id, msg.id, `⏱️ Cú pháp: \`${p}owo delay <min_giây> <max_giây>\` (Khuyên dùng: 15 19).`);
        }
        return true;
      }

      // Mặc định hoặc !owo help
      const guideText = [
        `🐶 **HƯỚNG DẪN SỬ DỤNG TOOL CHƠI / CÀY OWO BOT 24/7**`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `• \`${p}owo on [channel_id]\` : Bắt đầu cày tự động tại kênh hiện tại hoặc ID`,
        `• \`${p}owo off\` : Dừng cày OwO ngay lập tức`,
        `• \`${p}owo resume\` : Mở khóa cày tiếp sau khi đã giải Captcha trên Discord`,
        `• \`${p}owo channel [id]\` : Đổi kênh cày OwO`,
        `• \`${p}owo stats\` : Xem chi tiết thống kê Hunts, Battles, Prays, Cowoncy`,
        `• \`${p}owo reset\` : Đặt lại bộ đếm thống kê về 0`,
        `• \`${p}owo cf <tiền>\` : Bật cược Coinflip tự động (\`${p}owo cf off\` để tắt)`,
        `• \`${p}owo s <tiền>\` : Bật cược Slots tự động (\`${p}owo s off\` để tắt)`,
        `• \`${p}owo delay <min> <max>\` : Chỉnh thời gian giãn cách lệnh (ví dụ: \`${p}owo delay 15 20\`)`,
        `• \`${p}owoh\` / \`${p}owob\` / \`${p}owopray\` : Gửi lệnh nhanh ngay lập tức`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `🛡️ **Công Nghệ Chống Ban:** Tự động dừng khẩn cấp khi OwO gửi Captcha, nghỉ giải lao định kỳ và delay ngẫu nhiên giả lập người thật!`,
      ].join('\n');
      await sendOrEdit(msg.channel_id, msg.id, guideText);
      return true;
    }

    // Các alias nhanh cho OwO
    case 'owoh': {
      await manager.sendRawChannelMessage(client, msg.channel_id, 'owoh');
      if (client.session.owoStats) client.session.owoStats.huntsCount = (client.session.owoStats.huntsCount || 0) + 1;
      return true;
    }
    case 'owob': {
      await manager.sendRawChannelMessage(client, msg.channel_id, 'owob');
      if (client.session.owoStats) client.session.owoStats.battlesCount = (client.session.owoStats.battlesCount || 0) + 1;
      return true;
    }
    case 'owopray': {
      const prayTarget = args.join(' ').trim();
      const cmd = prayTarget ? `owo pray ${prayTarget}` : 'owo pray';
      await manager.sendRawChannelMessage(client, msg.channel_id, cmd);
      if (client.session.owoStats) client.session.owoStats.praysCount = (client.session.owoStats.praysCount || 0) + 1;
      return true;
    }
    case 'oworesume': {
      const resumed = manager.resumeOwOFarmAfterCaptcha(client.session.id);
      if (resumed) {
        await sendOrEdit(msg.channel_id, msg.id, `✅ **ĐÃ TIẾP TỤC CÀY OWO BOT!**\nĐã xác nhận giải Captcha xong.`);
      } else {
        await sendOrEdit(msg.channel_id, msg.id, `⚠️ Không thể mở khóa cày OwO. Hãy kiểm tra cấu hình kênh cày!`);
      }
      return true;
    }
    case 'owostats': {
      const owoConfig = client.session.owoConfig;
      const owoStats = client.session.owoStats;
      const uptimeMin = owoStats?.startedAt ? Math.floor((Date.now() - owoStats.startedAt) / 60000) : 0;
      const statsText = [
        `📊 **THỐNG KÊ TOOL CÀY OWO BOT 24/7**`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `⚙️ **Trạng Thái:** ${owoConfig?.captchaDetected ? '🚨 DỪNG (GẶP CAPTCHA)' : owoConfig?.enabled ? '🟢 ĐANG CÀY' : '⚪ ĐÃ DỪNG'}`,
        `📍 **Kênh Cày:** <#${owoConfig?.channelId || msg.channel_id}>`,
        `🏹 **Hunts (owoh):** **${owoStats?.huntsCount || 0}** | ⚔️ **Battles (owob):** **${owoStats?.battlesCount || 0}**`,
        `🙏 **Prays:** **${owoStats?.praysCount || 0}** | 🎁 **Daily:** **${owoStats?.dailiesCount || 0}**`,
        `⏱️ **Thời Gian Chạy:** \`${Math.floor(uptimeMin / 60)}h ${uptimeMin % 60}m\``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ].join('\n');
      await sendOrEdit(msg.channel_id, msg.id, statsText);
      return true;
    }

    // ==========================================
    // 2. TIỆN ÍCH & THÔNG TIN HỆ THỐNG (20 Lệnh)
    // ==========================================
    case 'ping': {
      const ping = client.session.ping || 25;
      const uptime = client.session.uptimeStart
        ? Math.floor((Date.now() - client.session.uptimeStart) / 1000)
        : 0;
      const uptimeMin = Math.floor(uptime / 60);
      const lastAckAgo = Math.floor((Date.now() - (client.session.lastHeartbeatAck || Date.now())) / 1000);
      const reply = `🏓 **Pong!** \`${ping}ms\` | Gateway: \`Hoạt động tốt (ACK: ${lastAckAgo}s trước)\` | Uptime: \`${uptimeMin} phút\` | Host: \`Render 24/7 🚀\``;
      await sendOrEdit(msg.channel_id, msg.id, reply);
      return true;
    }

    case 'reconnect':
    case 'restart': {
      await sendOrEdit(msg.channel_id, msg.id, `🔄 Đang ép tái kết nối Socket Gateway Discord để làm mới hoàn toàn...`);
      manager.forceReconnect(client.session.id);
      return true;
    }

    case 'info':
    case 'stats': {
      const session = client.session;
      const ping = session.ping || 25;
      const uptime = session.uptimeStart
        ? Math.floor((Date.now() - session.uptimeStart) / 1000)
        : 0;
      const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`;
      const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
      const voiceStr = session.isVoiceConnected
        ? `Kênh \`${session.voice.channelId}\` (${session.voice.selfMute ? 'Muted' : 'Mic On'} | ${session.voice.selfDeaf ? 'Deafened' : 'Sound On'})`
        : 'Không kết nối';

      const infoText = [
        `📊 **THÔNG SỐ HOẠT ĐỘNG DISCORD SELFBOT 24/7**`,
        `• Chủ tài khoản: **${session.name}** (@${session.username})`,
        `• ID Người Dùng: \`${session.id}\``,
        `• Tiền Tố (Prefix): \`${p}\``,
        `• Trạng Thái Gateway: **${session.isConnected ? '🟢 Trực tuyến' : '🔴 Mất kết nối'}** (\`${ping}ms\`)`,
        `• Treo Voice AFK: **${voiceStr}**`,
        `• Uptime Liên Tục: \`${uptimeStr}\``,
        `• RAM Tiêu Thụ: \`${memUsage} MB\` | Node.js: \`${process.version}\``,
        `• Chống Sleep Render: **Kích hoạt tự động**`,
      ].join('\n');
      await sendOrEdit(msg.channel_id, msg.id, infoText);
      return true;
    }

    case 'uptime': {
      const uptime = client.session.uptimeStart
        ? Math.floor((Date.now() - client.session.uptimeStart) / 1000)
        : 0;
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = uptime % 60;
      await sendOrEdit(msg.channel_id, msg.id, `⏱️ Bot đã chạy liên tục không nghỉ: **${h} giờ ${m} phút ${s} giây** trên Render Cloud 🚀`);
      return true;
    }

    case 'userinfo':
    case 'whois': {
      const target = msg.mentions?.[0] || msg.author;
      const createdAt = new Date(Number((BigInt(target.id) >> 22n) + 1420070400000n)).toLocaleString('vi-VN');
      const avatarUrl = target.avatar
        ? `https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.png?size=512`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
      const text = [
        `👤 **THÔNG TIN TÀI KHOẢN DISCORD**`,
        `• Tên: **${target.global_name || target.username}** (@${target.username})`,
        `• ID: \`${target.id}\``,
        `• Ngày tạo tài khoản: \`${createdAt}\``,
        `• Bot: \`${target.bot ? 'Có (Bot)' : 'Không (Người thật)'}\``,
        `• Avatar Link: <${avatarUrl}>`,
      ].join('\n');
      await sendOrEdit(msg.channel_id, msg.id, text);
      return true;
    }

    case 'avatar':
    case 'av': {
      const target = msg.mentions?.[0] || msg.author;
      const avatarUrl = target.avatar
        ? `https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.png?size=1024`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
      await sendOrEdit(msg.channel_id, msg.id, `🖼️ **Ảnh đại diện của @${target.username}:**\n${avatarUrl}`);
      return true;
    }

    case 'purge':
    case 'clear': {
      const count = Math.min(100, Math.max(1, parseInt(args[0], 10) || 5));
      await sendOrEdit(msg.channel_id, msg.id, `🧹 Đang bắt đầu dọn ${count} tin nhắn của bạn...`);
      // Lấy các tin nhắn gần đây và xoá tin của chính mình
      try {
        const fetchRes = await fetch(`https://discord.com/api/v9/channels/${msg.channel_id}/messages?limit=100`, {
          headers: { Authorization: client.session.token },
        });
        if (fetchRes.ok) {
          const messages = await fetchRes.json();
          const myMessages = messages.filter((m: any) => m.author.id === client.session.id).slice(0, count);
          let deleted = 0;
          for (const m of myMessages) {
            await fetch(`https://discord.com/api/v9/channels/${msg.channel_id}/messages/${m.id}`, {
              method: 'DELETE',
              headers: { Authorization: client.session.token },
            });
            deleted++;
            await new Promise((r) => setTimeout(r, 400)); // Tránh rate limit
          }
        }
      } catch (err) {
        // ignore
      }
      return true;
    }

    case 'prefix': {
      const newP = args[0]?.trim();
      if (!newP) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Vui lòng nhập tiền tố mới! Ví dụ: \`${p}prefix .\``);
        return true;
      }
      manager.updatePrefix(client.session.id, newP);
      await sendOrEdit(msg.channel_id, msg.id, `⚙️ Đã đổi tiền tố sang: \`${newP}\`! Gõ \`${newP}help\` để xem menu.`);
      return true;
    }

    case 'serverinfo':
    case 'guildinfo': {
      if (!msg.guild_id) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Lệnh này chỉ dùng được bên trong Server (Guild), không hỗ trợ tin nhắn riêng.`);
        return true;
      }
      let gCreatedAt = 'Không xác định';
      try {
        gCreatedAt = new Date(Number((BigInt(msg.guild_id) >> 22n) + 1420070400000n)).toLocaleString('vi-VN');
      } catch {}
      const text = [
        `🏰 **THÔNG TIN MÁY CHỦ (SERVER)**`,
        `• Server ID: \`${msg.guild_id}\``,
        `• Ngày thành lập: \`${gCreatedAt}\``,
        `• Kênh hiện tại: <#${msg.channel_id}> (\`${msg.channel_id}\`)`,
      ].join('\n');
      await sendOrEdit(msg.channel_id, msg.id, text);
      return true;
    }

    case 'firstmsg': {
      await sendOrEdit(msg.channel_id, msg.id, `🔗 Tin nhắn đầu tiên của kênh: https://discord.com/channels/${msg.guild_id || '@me'}/${msg.channel_id}/${msg.channel_id}`);
      return true;
    }

    case 'copyid': {
      const target = msg.mentions?.[0] || msg.author;
      await sendOrEdit(msg.channel_id, msg.id, `🆔 ID: \`${target.id}\``);
      return true;
    }

    case 'channelinfo': {
      await sendOrEdit(msg.channel_id, msg.id, `💬 **Kênh hiện tại:** <#${msg.channel_id}>\n• Channel ID: \`${msg.channel_id}\``);
      return true;
    }

    // ==========================================
    // 3. TREO VOICE AFK 24/7 (8 Lệnh)
    // ==========================================
    case 'join':
    case 'voice': {
      let guildId = '';
      let channelId = '';

      // Trường hợp dán link: https://discord.com/channels/GUILD_ID/CHANNEL_ID
      const linkMatch = argsString.match(/discord\.com\/channels\/([0-9]+)\/([0-9]+)/);
      if (linkMatch) {
        guildId = linkMatch[1];
        channelId = linkMatch[2];
      } else if (args.length >= 2) {
        // Nhập cú pháp: !join <guild_id> <channel_id>
        guildId = args[0].replace(/[^0-9]/g, '');
        channelId = args[1].replace(/[^0-9]/g, '');
      } else if (args.length === 1) {
        // Nhập cú pháp: !join <channel_id>
        channelId = args[0].replace(/[^0-9]/g, '');
        guildId = msg.guild_id || client.session.voice.guildId || '';
      } else {
        channelId = client.session.voice.channelId || '';
        guildId = msg.guild_id || client.session.voice.guildId || '';
      }

      if (!channelId) {
        await sendOrEdit(
          msg.channel_id,
          msg.id,
          `❌ Vui lòng nhập Channel ID phòng Voice!\n• Gõ trong Server: \`${p}join <channel_id>\`\n• Gõ trong DM: \`${p}join <server_id> <channel_id>\`\n• Hoặc dán link: \`${p}join https://discord.com/channels/.../...\``
        );
        return true;
      }

      const ok = await manager.updateVoice(client.session.id, { channelId, guildId });
      if (ok) {
        await sendOrEdit(msg.channel_id, msg.id, `🔊 Đang kết nối vào phòng Voice ID: \`${channelId}\` và giữ kết nối an toàn 24/7.`);
      } else {
        await sendOrEdit(msg.channel_id, msg.id, `⚠️ Không thể vào phòng Voice. Nếu bạn đang gõ trong tin nhắn riêng (DM), vui lòng cung cấp cả Server ID:\n\`${p}join <server_id> <channel_id>\``);
      }
      return true;
    }

    case 'leave': {
      await manager.updateVoice(client.session.id, { channelId: '' });
      await sendOrEdit(msg.channel_id, msg.id, `👋 Đã rời khỏi phòng Voice.`);
      return true;
    }

    case 'mute':
    case 'unmute': {
      const isMute = command === 'mute';
      await manager.updateVoice(client.session.id, { selfMute: isMute });
      await sendOrEdit(msg.channel_id, msg.id, `🎙️ Micro Voice: **${isMute ? 'ĐÃ TẮT MIC (Muted)' : 'ĐÃ BẬT MIC (Unmuted)'}**`);
      return true;
    }

    case 'deaf':
    case 'undeaf': {
      const isDeaf = command === 'deaf';
      await manager.updateVoice(client.session.id, { selfDeaf: isDeaf });
      await sendOrEdit(msg.channel_id, msg.id, `🎧 Tai nghe Voice: **${isDeaf ? 'ĐÃ TẮT TAI NGHE (Deafened)' : 'ĐÃ BẬT TAI NGHE (Undeafened)'}**`);
      return true;
    }

    case 'video': {
      const cur = Boolean(client.session.voice.selfVideo);
      await manager.updateVoice(client.session.id, { selfVideo: !cur });
      await sendOrEdit(msg.channel_id, msg.id, `📹 Camera phòng Voice: **${!cur ? 'ĐÃ BẬT' : 'ĐÃ TẮT'}**`);
      return true;
    }

    case 'afk': {
      const reason = argsString || 'Tôi hiện đang bận / AFK, sẽ trả lời sau!';
      manager.updateAFK(client.session.id, { enabled: true, message: reason });
      await sendOrEdit(msg.channel_id, msg.id, `💤 Chế độ **AFK Auto-Reply** đã BẬT! Lý do: *${reason}*`);
      return true;
    }

    case 'noafk': {
      manager.updateAFK(client.session.id, { enabled: false, message: '' });
      await sendOrEdit(msg.channel_id, msg.id, `👋 Chế độ **AFK Auto-Reply** đã TẮT. Chào mừng bạn đã quay lại!`);
      return true;
    }

    // ==========================================
    // 4. HIỆU ỨNG CHỮ & ASCII & MÃ HÓA (22 Lệnh)
    // ==========================================
    case 'bold': {
      await sendOrEdit(msg.channel_id, msg.id, `**${argsString || 'Không có nội dung'}**`);
      return true;
    }

    case 'italic': {
      await sendOrEdit(msg.channel_id, msg.id, `*${argsString || 'Không có nội dung'}*`);
      return true;
    }

    case 'strike': {
      await sendOrEdit(msg.channel_id, msg.id, `~~${argsString || 'Không có nội dung'}~~`);
      return true;
    }

    case 'spoiler': {
      await sendOrEdit(msg.channel_id, msg.id, `||${argsString || 'Bí mật không tiết lộ'}||`);
      return true;
    }

    case 'codeblock': {
      await sendOrEdit(msg.channel_id, msg.id, `\`\`\`js\n${argsString || '// code here'}\n\`\`\``);
      return true;
    }

    case 'vaporwave':
    case 'wide': {
      await sendOrEdit(msg.channel_id, msg.id, vaporwaveText(argsString || 'VAPORWAVE AESTHETIC'));
      return true;
    }

    case 'reverse': {
      const rev = (argsString || '').split('').reverse().join('');
      await sendOrEdit(msg.channel_id, msg.id, `🔄 ${rev}`);
      return true;
    }

    case 'flip':
    case 'upsidedown': {
      await sendOrEdit(msg.channel_id, msg.id, flipText(argsString || 'Upside Down'));
      return true;
    }

    case 'mock': {
      await sendOrEdit(msg.channel_id, msg.id, mockText(argsString || 'sao ban lai noi nhu the'));
      return true;
    }

    case 'clap': {
      const words = (argsString || 'Discord Selfbot Render 24/7').split(/\s+/);
      await sendOrEdit(msg.channel_id, msg.id, words.join(' 👏 '));
      return true;
    }

    case 'morse': {
      await sendOrEdit(msg.channel_id, msg.id, `📡 **Mã Morse:**\n\`${toMorse(argsString || 'SOS')}\``);
      return true;
    }

    case 'binary': {
      const bin = (argsString || 'Hi')
        .split('')
        .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
      await sendOrEdit(msg.channel_id, msg.id, `💻 **Nhị Phân:**\n\`${bin}\``);
      return true;
    }

    case 'base64':
    case 'b64': {
      const b64 = Buffer.from(argsString || 'Hello Discord').toString('base64');
      await sendOrEdit(msg.channel_id, msg.id, `🔐 **Base64:**\n\`${b64}\``);
      return true;
    }

    case 'unbase64':
    case 'unb64': {
      try {
        const decoded = Buffer.from(argsString, 'base64').toString('utf-8');
        await sendOrEdit(msg.channel_id, msg.id, `🔓 **Giải mã Base64:**\n${decoded}`);
      } catch {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Chuỗi Base64 không hợp lệ!`);
      }
      return true;
    }

    case 'hex': {
      const hex = Buffer.from(argsString || 'Test').toString('hex');
      await sendOrEdit(msg.channel_id, msg.id, `🔢 **Mã Hex:**\n\`${hex}\``);
      return true;
    }

    case 'shrug': {
      await sendOrEdit(msg.channel_id, msg.id, `¯\\_(ツ)_/¯ ${argsString}`);
      return true;
    }

    case 'tableflip': {
      await sendOrEdit(msg.channel_id, msg.id, `(╯°□°)╯︵ ┻━┻ ${argsString}`);
      return true;
    }

    case 'unflip': {
      await sendOrEdit(msg.channel_id, msg.id, `┬─┬ノ( º _ ºノ) ${argsString}`);
      return true;
    }

    case 'lenny': {
      await sendOrEdit(msg.channel_id, msg.id, `( ͡° ͜ʖ ͡°) ${argsString}`);
      return true;
    }

    case 'disapproval': {
      await sendOrEdit(msg.channel_id, msg.id, `ಠ_ಠ ${argsString}`);
      return true;
    }

    case 'sparkles': {
      await sendOrEdit(msg.channel_id, msg.id, `✨ ${argsString || 'Lấp lánh'} ✨`);
      return true;
    }

    case 'rainbow': {
      const colors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
      const rainbow = (argsString || 'Rainbow')
        .split('')
        .map((c, i) => `${colors[i % colors.length]} ${c}`)
        .join(' ');
      await sendOrEdit(msg.channel_id, msg.id, rainbow);
      return true;
    }

    // ==========================================
    // 5. GIẢI TRÍ & MINIGAME & MAY RỦI (20 Lệnh)
    // ==========================================
    case 'coin':
    case 'flipcoin': {
      const flip = Math.random() > 0.5 ? '🪙 **MẶT SẤP (Heads)!**' : '🪙 **MẶT NGỬA (Tails)!**';
      await sendOrEdit(msg.channel_id, msg.id, `🎲 Bạn tung đồng xu... Kết quả là: ${flip}`);
      return true;
    }

    case 'dice': {
      const sides = Math.max(2, parseInt(args[0], 10) || 6);
      const res = Math.floor(Math.random() * sides) + 1;
      await sendOrEdit(msg.channel_id, msg.id, `🎲 Bạn đổ xúc xắc ${sides} mặt... Kết quả ra: **${res}**!`);
      return true;
    }

    case 'roll': {
      const max = Math.max(2, parseInt(args[0], 10) || 100);
      const res = Math.floor(Math.random() * max) + 1;
      await sendOrEdit(msg.channel_id, msg.id, `🎰 Quay số ngẫu nhiên (1 - ${max}): Bạn trúng số **${res}**!`);
      return true;
    }

    case '8ball': {
      if (!argsString) {
        await sendOrEdit(msg.channel_id, msg.id, `🎱 Hãy đặt câu hỏi cho Quả Cầu Ma Thuật! Ví dụ: \`${p}8ball Hôm nay tôi có may mắn không?\``);
        return true;
      }
      const answers = [
        'Chắc chắn là như vậy rồi! ✨',
        'Có thể lắm, hãy tin tưởng vào bản thân.',
        'Triển vọng rất tích cực! 🌟',
        'Rất khó đoán, hãy thử hỏi lại sau.',
        'Hiện tại tôi chưa thể tiết lộ thiên cơ.',
        'Tốt nhất là không nên biết trước.',
        'Không có hy vọng đâu bạn ơi... 🌧️',
        'Câu trả lời là KHÔNG.',
      ];
      const ans = answers[Math.floor(Math.random() * answers.length)];
      await sendOrEdit(msg.channel_id, msg.id, `🎱 **Quả Cầu 8-Ball:**\n❓ Hỏi: *${argsString}*\n🔮 Đáp: **${ans}**`);
      return true;
    }

    case 'rps': {
      const choices = ['kéo', 'búa', 'bao'];
      const user = args[0]?.toLowerCase();
      if (!choices.includes(user)) {
        await sendOrEdit(msg.channel_id, msg.id, `✂️ Hãy chọn: \`${p}rps kéo\`, \`${p}rps búa\`, hoặc \`${p}rps bao\``);
        return true;
      }
      const bot = choices[Math.floor(Math.random() * choices.length)];
      let result = 'Hòa nhau rồi! 🤝';
      if (
        (user === 'kéo' && bot === 'bao') ||
        (user === 'búa' && bot === 'kéo') ||
        (user === 'bao' && bot === 'búa')
      ) {
        result = 'Bạn ĐÃ THẮNG! 🎉';
      } else if (user !== bot) {
        result = 'Bot ĐÃ THẮNG! 😈';
      }
      await sendOrEdit(msg.channel_id, msg.id, `✂️ Bạn ra: **${user.toUpperCase()}** | Bot ra: **${bot.toUpperCase()}** ➔ **${result}**`);
      return true;
    }

    case 'choose': {
      const items = argsString.split('|').map((s) => s.trim()).filter(Boolean);
      if (items.length < 2) {
        await sendOrEdit(msg.channel_id, msg.id, `🤔 Hãy nhập các lựa chọn cách nhau bởi dấu \`|\`. Ví dụ: \`${p}choose Ăn Phở | Ăn Cơm Tấm | Ăn Bún Chả\``);
        return true;
      }
      const chosen = items[Math.floor(Math.random() * items.length)];
      await sendOrEdit(msg.channel_id, msg.id, `🎯 Tôi chọn cho bạn: **${chosen}**!`);
      return true;
    }

    case 'rate': {
      const target = argsString || 'Bạn';
      const pct = Math.floor(Math.random() * 101);
      await sendOrEdit(msg.channel_id, msg.id, `⭐ Chấm điểm cho **${target}**: **${pct}/100** điểm uy tín! ${pct > 80 ? '🔥 Quá đỉnh!' : pct < 30 ? '💀 Hơi non!' : '👍 Tạm ổn!'}`);
      return true;
    }

    case 'love':
    case 'ship': {
      const names = argsString ? argsString.split(/\s+(?:và|va|with|&|\+)\s+|,\s*|\s+/) : ['Bạn', 'Discord'];
      const p1 = names[0] || 'Người thứ nhất';
      const p2 = names[1] || 'Người thứ hai';
      const score = Math.floor(Math.random() * 101);
      const bar = '❤️'.repeat(Math.round(score / 10)) + '🖤'.repeat(10 - Math.round(score / 10));
      await sendOrEdit(msg.channel_id, msg.id, `💘 **BÓI TÌNH YÊU & ĐỘ HỢP NHAU:**\n💑 **${p1}** x **${p2}**\n${bar} **${score}%**\n💬 *${score > 80 ? 'Trời sinh một cặp! Cưới liền đi thôi!' : score > 50 ? 'Khá hợp gu nhau đấy!' : 'Cần cố gắng nhiều hơn mới thành đôi được.'}*`);
      return true;
    }

    case 'iq': {
      const target = argsString || 'bạn';
      const iq = 70 + Math.floor(Math.random() * 90);
      await sendOrEdit(msg.channel_id, msg.id, `🧠 Đo chỉ số IQ của **${target}**: **${iq} IQ** (${iq > 130 ? 'Thiên tài vũ trụ 🌌' : iq > 110 ? 'Rất thông minh 💡' : 'Bình thường vui vẻ 😄'})`);
      return true;
    }

    case 'slap': {
      const target = argsString || 'ai đó';
      await sendOrEdit(msg.channel_id, msg.id, `👋 Bạn vung tay tát bốp một phát vào mặt **${target}** khiến đối phương quay 360 độ!`);
      return true;
    }

    case 'hug': {
      const target = argsString || 'mọi người';
      await sendOrEdit(msg.channel_id, msg.id, `🤗 Bạn ôm chầm lấy **${target}** một cái thật chặt và ấm áp!`);
      return true;
    }

    case 'pat': {
      const target = argsString || 'ai đó';
      await sendOrEdit(msg.channel_id, msg.id, `🐾 Bạn nhẹ nhàng xoa đầu **${target}**: Ngoan ngoãn nào!`);
      return true;
    }

    case 'kiss': {
      const target = argsString || 'người ấy';
      await sendOrEdit(msg.channel_id, msg.id, `💋 Bạn gửi tặng một nụ hôn ngọt ngào đến **${target}**!`);
      return true;
    }

    case 'punch': {
      const target = argsString || 'kẻ thù';
      await sendOrEdit(msg.channel_id, msg.id, `🥊 Bạn tung một cú đấm móc hàm sấm sét vào **${target}** KO đo sàn!`);
      return true;
    }

    case 'roast': {
      const target = argsString || 'bạn';
      const roasts = [
        'Trông bạn như phiên bản thử nghiệm chưa bao giờ được đưa vào sản xuất vậy.',
        'Nếu sự vô dụng là một nghề, chắc chắn bạn là tỷ phú đô la.',
        'Mỗi lần bạn nói, tôi lại thấy tiếc cho công sức tiến hóa hàng triệu năm của nhân loại.',
        'Bạn thông minh y như cách mạng Wi-Fi bị đứt cáp quang biển vậy.',
      ];
      const r = roasts[Math.floor(Math.random() * roasts.length)];
      await sendOrEdit(msg.channel_id, msg.id, `🔥 **Cà khịa ${target}:** *${r}*`);
      return true;
    }

    case 'compliment': {
      const target = argsString || 'bạn';
      const comps = [
        'Năng lượng tích cực của bạn có thể thắp sáng cả một thành phố!',
        'Bạn thông minh và kiên nhẫn hơn những gì bạn nghĩ rất nhiều đấy.',
        'Thế giới này chắc chắn tươi đẹp hơn vì có sự xuất hiện của bạn!',
        'Gu thẩm mỹ và sự chu đáo của bạn luôn khiến người khác nể phục.',
      ];
      const c = comps[Math.floor(Math.random() * comps.length)];
      await sendOrEdit(msg.channel_id, msg.id, `💐 **Gửi lời khen tới ${target}:** *${c}*`);
      return true;
    }

    case 'joke': {
      const j = jokesList[Math.floor(Math.random() * jokesList.length)];
      await sendOrEdit(msg.channel_id, msg.id, `😂 **Chuyện Cười Thư Giãn:**\n${j}`);
      return true;
    }

    case 'quote': {
      const q = quotesList[Math.floor(Math.random() * quotesList.length)];
      await sendOrEdit(msg.channel_id, msg.id, `📜 **Danh Ngôn Truyền Cảm Hứng:**\n${q}`);
      return true;
    }

    case 'fact': {
      const f = factsList[Math.floor(Math.random() * factsList.length)];
      await sendOrEdit(msg.channel_id, msg.id, `💡 **Bạn Có Biết?**\n${f}`);
      return true;
    }

    // ==========================================
    // 6. TOÁN HỌC & CÔNG CỤ TIỆN ÍCH (15 Lệnh)
    // ==========================================
    case 'calc':
    case 'math': {
      if (!argsString) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Vui lòng nhập biểu thức! Ví dụ: \`${p}calc (150 * 4) / 2 + 10^2\``);
        return true;
      }
      const res = safeCalc(argsString);
      await sendOrEdit(msg.channel_id, msg.id, `🧮 **Kết Quả Phép Tính:**\n\`${argsString}\` = **${res}**`);
      return true;
    }

    case 'random': {
      const min = parseInt(args[0], 10) || 1;
      const max = parseInt(args[1], 10) || 100;
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      await sendOrEdit(msg.channel_id, msg.id, `🎲 Số ngẫu nhiên từ **${min}** đến **${max}**: **${num}**`);
      return true;
    }

    case 'time': {
      const now = new Date();
      const vnTime = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        dateStyle: 'full',
        timeStyle: 'medium',
      }).format(now);
      const utcTime = now.toUTCString();
      await sendOrEdit(msg.channel_id, msg.id, `⏰ **THỜI GIAN HIỆN TẠI:**\n• 🇻🇳 Giờ Việt Nam (GMT+7): **${vnTime}**\n• 🌐 Giờ Quốc Tế (UTC): \`${utcTime}\``);
      return true;
    }

    case 'qr':
    case 'qrcode':
    case 'addqr':
    case 'taoqr': {
      if (!argsString) {
        await sendOrEdit(
          msg.channel_id,
          msg.id,
          `❌ Vui lòng nhập link hoặc nội dung muốn tạo mã QR!\n• Ví dụ: \`${p}qr https://facebook.com\`\n• Ví dụ: \`${p}qr add https://youtube.com\``
        );
        return true;
      }

      // Tự động gỡ bỏ các tiền tố người dùng hay gõ thêm như 'add', 'link', 'tao', 'tạo', 'make', 'url'
      let cleanTarget = argsString.trim();
      const prefixWords = ['add', 'link', 'tao', 'tạo', 'make', 'url'];
      for (const pw of prefixWords) {
        if (cleanTarget.toLowerCase().startsWith(pw + ' ')) {
          cleanTarget = cleanTarget.slice(pw.length + 1).trim();
          break;
        }
      }

      // Gỡ bỏ dấu bọc link của Discord <...>, ngoặc kép "...", ngoặc đơn '...'
      cleanTarget = cleanTarget.replace(/^<|>$/g, '').replace(/^["']|["']$/g, '').trim();

      if (!cleanTarget) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Đường dẫn không hợp lệ sau khi lọc! Hãy nhập: \`${p}qr <link>\``);
        return true;
      }

      // Nếu người dùng chỉ gõ domain (vd: google.com, youtube.com) thì tự động gắn https://
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(cleanTarget) && !cleanTarget.startsWith('http://') && !cleanTarget.startsWith('https://')) {
        cleanTarget = 'https://' + cleanTarget;
      }

      const encoded = encodeURIComponent(cleanTarget);
      // QuickChart trả về ảnh .png trực tiếp giúp Discord nhúng ngay lập tức không bị lưu cache link cũ
      const qrImageUrl = `https://quickchart.io/qr.png?text=${encoded}&size=350&margin=1&ecLevel=H`;

      const responseCard = [
        `📱 **MÃ QR CODE CHÍNH XÁC ĐÃ TẠO:**`,
        `• 🔗 **Đường dẫn/Nội dung mã hóa:** <${cleanTarget}>`,
        `• 📸 **Ảnh mã QR trực tiếp (quét ngay):**`,
        qrImageUrl,
      ].join('\n');

      await sendOrEdit(msg.channel_id, msg.id, responseCard);
      return true;
    }

    case 'say': {
      if (!argsString) return true;
      await sendOrEdit(msg.channel_id, msg.id, argsString);
      return true;
    }

    case 'embed': {
      const parts = argsString.split('|').map((s) => s.trim());
      const title = parts[0] || 'Thông Báo';
      const desc = parts.slice(1).join('\n') || 'Nội dung thông báo';
      const card = `>>> **${title}**\n${desc}`;
      await sendOrEdit(msg.channel_id, msg.id, card);
      return true;
    }

    case 'nitro': {
      await sendOrEdit(msg.channel_id, msg.id, `🎁 **Bạn nhận được một món quà Discord Nitro 3 Tháng Miễn Phí!**\nhttps://discord.gift/9842a83f8d9b${Math.random().toString(36).substring(2, 10)} (Troll 😄)`);
      return true;
    }

    case 'fakegift': {
      await sendOrEdit(msg.channel_id, msg.id, `🎉 **Hộp Quà May Mắn Discord x Steam:**\nhttps://discord.gift/cK992xJ2948${Math.random().toString(36).substring(2, 8)}`);
      return true;
    }

    case 'password': {
      const len = Math.min(64, Math.max(8, parseInt(args[0], 10) || 16));
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
      let pass = '';
      for (let i = 0; i < len; i++) {
        pass += chars[Math.floor(Math.random() * chars.length)];
      }
      await sendOrEdit(msg.channel_id, msg.id, `🔑 **Mật Khẩu Tạo Ngẫu Nhiên (${len} ký tự):**\n\`${pass}\``);
      return true;
    }

    // ==========================================
    // MENU TRỢ GIÚP TỔNG HỢP & PHÂN LOẠI
    // ==========================================
    case 'help': {
      const sub = args[0]?.toLowerCase();
      if (sub === 'games' || sub === 'status') {
        const text = [
          `🎮 **LỆNH TRẠNG THÁI & GAME RICH PRESENCE (Tiền tố: \`${p}\`)**`,
          `• \`${p}val [mode]\`: Chơi VALORANT (Competitive, Ascendant 3)`,
          `• \`${p}lol [rank]\`: Chơi League of Legends (Thách Đấu LMHT)`,
          `• \`${p}cs2 [map]\`: Chơi Counter-Strike 2 (Premier 21k)`,
          `• \`${p}mc [thế_giới]\`: Chơi Minecraft Hardcore Survival`,
          `• \`${p}gta [server]\`: Chơi GTA V / FiveM Roleplay`,
          `• \`${p}roblox [game]\`: Chơi Roblox Blox Fruits`,
          `• \`${p}genshin [ar]\`: Chơi Genshin Impact Teyvat`,
          `• \`${p}pubg\`: Chơi PUBG Erangel Battle Royale`,
          `• \`${p}ff\`: Chơi Free Fire leo rank`,
          `• \`${p}cod\`: Chơi Call of Duty Warzone`,
          `• \`${p}fifa\`: Chơi EA Sports FC 24`,
          `• \`${p}amongus\`: Chơi Among Us ඞ`,
          `• \`${p}osu\`: Chơi osu! 727pp`,
          `• \`${p}dota\`: Chơi Dota 2 Ranked`,
          `• \`${p}stream <tiêu_đề> [url]\`: Stream Twitch viền tím Rich Presence`,
          `• \`${p}yt <tiêu_đề>\`: Stream YouTube Gaming`,
          `• \`${p}watch <tên_phim>\`: Giả lập xem phim Netflix/Anime`,
          `• \`${p}listen <bài_hát>\`: Giả lập nghe nhạc Spotify`,
          `• \`${p}sc <bài_hát|link>\`: Phát nhạc SoundCloud Rich Presence 24/7 🎧`,
          `• \`${p}scstop\`: Dừng nghe nhạc SoundCloud`,
          `• \`${p}scinfo <link>\`: Xem thông tin bài hát SoundCloud`,
          `• \`${p}vscode [dự_án]\`: Giả lập đang code Visual Studio Code`,
          `• \`${p}custom <text>\`: Đổi dòng trạng thái tuỳ chỉnh`,
          `• \`${p}status <online|idle|dnd|invisible>\`: Đổi trạng thái chấm màu`,
          `• \`${p}clearact\`: Xóa toàn bộ game/hoạt động đang treo`,
        ].join('\n');
        await sendOrEdit(msg.channel_id, msg.id, text);
        return true;
      }

      if (sub === 'text' || sub === 'chu') {
        const text = [
          `✍️ **LỆNH HIỆU ỨNG CHỮ & MÃ HÓA (Tiền tố: \`${p}\`)**`,
          `• \`${p}bold <text>\`: In đậm chữ`,
          `• \`${p}italic <text>\`: In nghiêng chữ`,
          `• \`${p}strike <text>\`: Gạch ngang chữ`,
          `• \`${p}spoiler <text>\`: Chữ ẩn spoiler ||...||`,
          `• \`${p}codeblock <text>\`: Định dạng khối code`,
          `• \`${p}vaporwave <text>\`: Chữ dãn cách ｔｈｉếｔ ｋế`,
          `• \`${p}reverse <text>\`: Đảo ngược chuỗi chữ`,
          `• \`${p}flip <text>\`: Chữ lộn ngược upside down`,
          `• \`${p}mock <text>\`: Chữ hoa thường cà khịa sO kIeU nAy`,
          `• \`${p}clap <text>\`: Chèn 👏 giữa 👏 từng 👏 từ`,
          `• \`${p}morse <text>\`: Mã hóa sang mã Morse`,
          `• \`${p}binary <text>\`: Chuyển sang nhị phân 010101`,
          `• \`${p}base64 <text>\`: Mã hóa Base64`,
          `• \`${p}unbase64 <b64>\`: Giải mã Base64`,
          `• \`${p}hex <text>\`: Chuyển thành mã Hex`,
          `• \`${p}rainbow <text>\`: Thêm emoji cầu vồng`,
          `• \`${p}shrug\` | \`${p}tableflip\` | \`${p}unflip\` | \`${p}lenny\`: Biểu cảm ASCII`,
        ].join('\n');
        await sendOrEdit(msg.channel_id, msg.id, text);
        return true;
      }

      if (sub === 'fun' || sub === 'game') {
        const text = [
          `🎲 **LỆNH GIẢI TRÍ & MINIGAME & MAY RỦI (Tiền tố: \`${p}\`)**`,
          `• \`${p}coin\`: Tung đồng xu Sấp / Ngửa`,
          `• \`${p}dice [mặt]\`: Lắc xúc xắc ngẫu nhiên`,
          `• \`${p}roll <max>\`: Quay số may mắn 1 - N`,
          `• \`${p}8ball <câu_hỏi>\`: Quả cầu tiên tri ma thuật`,
          `• \`${p}rps <kéo|búa|bao>\`: Oẳn tù tì với bot`,
          `• \`${p}choose <a | b | c>\`: Bot chọn giúp bạn phương án tốt nhất`,
          `• \`${p}rate <tên>\`: Chấm điểm uy tín 0-100%`,
          `• \`${p}love <tên1> và <tên2>\`: Bói tình duyên hợp nhau`,
          `• \`${p}iq [tên]\`: Đo chỉ số IQ hài hước`,
          `• \`${p}slap <tên>\`: Tát ai đó một cái thật đau`,
          `• \`${p}hug <tên>\`: Ôm an ủi ai đó`,
          `• \`${p}kiss <tên>\`: Hôn má ai đó`,
          `• \`${p}punch <tên>\`: Đấm knock out`,
          `• \`${p}roast <tên>\`: Cà khịa đối phương cực gắt`,
          `• \`${p}compliment <tên>\`: Khen ngợi tạo động lực`,
          `• \`${p}joke\`: Kể chuyện cười vui vẻ`,
          `• \`${p}quote\`: Danh ngôn truyền cảm hứng`,
          `• \`${p}fact\`: Sự thật thú vị khoa học`,
        ].join('\n');
        await sendOrEdit(msg.channel_id, msg.id, text);
        return true;
      }

      if (sub === 'voice' || sub === 'thoai') {
        const text = [
          `🔊 **LỆNH TREO VOICE AFK 24/7 (Tiền tố: \`${p}\`)**`,
          `• \`${p}join [channel_id]\`: Vào phòng Voice (trong Server)`,
          `• \`${p}join <guild_id> <channel_id>\`: Vào phòng Voice từ bất kỳ đâu / DM`,
          `• \`${p}voice <link_discord>\`: Dán link phòng thoại trực tiếp để vào`,
          `• \`${p}leave\`: Rời khỏi phòng Voice`,
          `• \`${p}mute\` / \`${p}unmute\`: Tắt / Bật micro`,
          `• \`${p}deaf\` / \`${p}undeaf\`: Tắt / Bật tai nghe`,
          `• \`${p}video\`: Bật / Tắt camera trong phòng Voice`,
          `• \`${p}afk [lý_do]\`: Bật tự động trả lời khi được tag hoặc DM`,
          `• \`${p}noafk\`: Tắt chế độ AFK`,
        ].join('\n');
        await sendOrEdit(msg.channel_id, msg.id, text);
        return true;
      }

      if (sub === 'tools' || sub === 'tienich') {
        const text = [
          `🛠️ **LỆNH CÔNG CỤ & TIỆN ÍCH (Tiền tố: \`${p}\`)**`,
          `• \`${p}calc <phép_tính>\`: Máy tính thông minh an toàn`,
          `• \`${p}random <min> <max>\`: Tạo số ngẫu nhiên`,
          `• \`${p}time\`: Xem ngày giờ Việt Nam & Quốc Tế`,
          `• \`${p}qr <link|nội_dung>\`: Tạo mã QR chính xác (ảnh PNG sắc nét, hỗ trợ quét ngay)`,
          `• \`${p}embed <tiêu_đề> | <nội_dung>\`: Gửi tin nhắn khung viền đẹp`,
          `• \`${p}password [độ_dài]\`: Tạo mật khẩu an toàn`,
          `• \`${p}nitro\`: Fake hộp quà Discord Nitro troll`,
          `• \`${p}ping\`: Đo độ trễ ms Gateway và socket`,
          `• \`${p}reconnect\`: Ép khởi động lại kết nối Gateway nếu lag`,
          `• \`${p}info\`: Thông số bot, RAM, CPU và Uptime`,
          `• \`${p}userinfo [tag]\`: Xem chi tiết thông tin tài khoản`,
          `• \`${p}avatar [tag]\`: Lấy link ảnh đại diện kích thước lớn`,
          `• \`${p}purge <số_lượng>\`: Xóa nhanh N tin nhắn của chính mình`,
          `• \`${p}prefix <tiền_tố_mới>\`: Đổi tiền tố của bot`,
        ].join('\n');
        await sendOrEdit(msg.channel_id, msg.id, text);
        return true;
      }

      // Menu chính tổng quan
      const overview = [
        `⚡ **DISCORD SELFBOT 24/7 - HƠN 100 CÂU LỆNH SẴN SÀNG (Tiền tố: \`${p}\`)**`,
        `👉 Gõ các lệnh dưới đây để xem từng danh mục chi tiết:`,
        `• \`${p}help games\` : 22 lệnh đổi trạng thái chơi VALORANT, LMHT, CS2, Minecraft, Twitch...`,
        `• \`${p}help text\` : 22 lệnh hiệu ứng chữ Vaporwave, Đảo ngược, Mock, Morse, Base64...`,
        `• \`${p}help fun\` : 20 lệnh minigame Oẳn tù tì, Tung xu, Xúc xắc, 8-Ball, Bói tình duyên...`,
        `• \`${p}help voice\` : 8 lệnh treo Voice AFK 24/7, Mute, Deaf, Video, Auto-Reply...`,
        `• \`${p}help tools\` : 15 lệnh máy tính, QR Code, Purge, Userinfo, Avatar, Đổi prefix...`,
        ``,
        `💡 *Lệnh dùng nhanh tiêu biểu: \`${p}val\` | \`${p}ping\` | \`${p}stream\` | \`${p}reconnect\` | \`${p}calc 2+2*10\`*`,
      ].join('\n');
      await sendOrEdit(msg.channel_id, msg.id, overview);
      return true;
    }

    default:
      return false;
  }
}
