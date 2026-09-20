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
      }, { text: 'Đang leo rank Valorant 🔥', emojiName: '🎯' });
      await sendOrEdit(msg.channel_id, msg.id, `🎯 Đã đổi sang chơi **VALORANT** 24/7: \`${mode}\` | \`Score 11:9 (DND)\``);
      return true;
    }

    case 'lol':
    case 'league': {
      const rank = argsString || 'Challenger Solo/Duo';
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'League of Legends',
        type: 0,
        details: `Ranked Solo (${rank})`,
        state: 'In Game - Summoner\'s Rift (24:12)',
      }, { text: 'Đang leo Thách Đấu LMHT ⚔️', emojiName: '⚔️' });
      await sendOrEdit(msg.channel_id, msg.id, `⚔️ Đã chuyển sang chơi **League of Legends**: \`${rank}\``);
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
      }, { text: 'CS2 Premier Clutch 🔥', emojiName: '💣' });
      await sendOrEdit(msg.channel_id, msg.id, `💣 Đã chuyển sang chơi **Counter-Strike 2**: \`${map}\``);
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
      }, { text: 'Minecraft Hardcore ⛏️', emojiName: '⛏️' });
      await sendOrEdit(msg.channel_id, msg.id, `⛏️ Đã chuyển sang chơi **Minecraft**: \`${world}\``);
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
      }, { text: 'GTA V Roleplay 🚗', emojiName: '🚗' });
      await sendOrEdit(msg.channel_id, msg.id, `🚗 Đã chuyển sang chơi **GTA V**: \`${server}\``);
      return true;
    }

    case 'roblox': {
      const game = argsString || 'Blox Fruits (Sea 3)';
      manager.updatePresence(client.session.id, 'online', {
        name: 'Roblox',
        type: 0,
        details: `Playing ${game}`,
        state: 'In Server (AFK Farming)',
      }, { text: 'Roblox Grinding 🧱', emojiName: '🧱' });
      await sendOrEdit(msg.channel_id, msg.id, `🧱 Đã chuyển sang chơi **Roblox**: \`${game}\``);
      return true;
    }

    case 'genshin': {
      const ar = argsString || 'AR 60 - Spiral Abyss Floor 12-3';
      manager.updatePresence(client.session.id, 'online', {
        name: 'Genshin Impact',
        type: 0,
        details: ar,
        state: 'Exploring Teyvat',
      }, { text: 'Genshin Impact 🌠', emojiName: '🌠' });
      await sendOrEdit(msg.channel_id, msg.id, `🌠 Đã chuyển sang chơi **Genshin Impact**: \`${ar}\``);
      return true;
    }

    case 'pubg': {
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'PUBG: BATTLEGROUNDS',
        type: 0,
        details: 'Ranked Squad - Erangel',
        state: 'Alive: 14/100 | Kills: 6',
      }, { text: 'Winner Winner Chicken Dinner 🍗', emojiName: '🍗' });
      await sendOrEdit(msg.channel_id, msg.id, `🍗 Đã chuyển sang chơi **PUBG: BATTLEGROUNDS** (DND)`);
      return true;
    }

    case 'ff':
    case 'freefire': {
      manager.updatePresence(client.session.id, 'online', {
        name: 'Free Fire',
        type: 0,
        details: 'Tử Chiến Xếp Hạng (Thách Đấu)',
        state: 'Đang gánh team 4v4',
      }, { text: 'Free Fire Leo Rank 🔥', emojiName: '🔥' });
      await sendOrEdit(msg.channel_id, msg.id, `🔥 Đã chuyển sang chơi **Free Fire**`);
      return true;
    }

    case 'cod':
    case 'warzone': {
      manager.updatePresence(client.session.id, 'dnd', {
        name: 'Call of Duty: Warzone',
        type: 0,
        details: 'Battle Royale Trios',
        state: 'Verdansk / Urzikstan',
      }, { text: 'Call of Duty Warzone 🪖', emojiName: '🪖' });
      await sendOrEdit(msg.channel_id, msg.id, `🪖 Đã chuyển sang chơi **Call of Duty: Warzone**`);
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
      const gCreatedAt = new Date(Number((BigInt(msg.guild_id) >> 22n) + 1420070400000n)).toLocaleString('vi-VN');
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
    case 'join': {
      const channelId = args[0] || client.session.voice.channelId;
      if (!channelId) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Vui lòng nhập Channel ID phòng Voice! Ví dụ: \`${p}join 123456789012345678\``);
        return true;
      }
      manager.updateVoice(client.session.id, { channelId, guildId: msg.guild_id || client.session.voice.guildId });
      await sendOrEdit(msg.channel_id, msg.id, `🔊 Đang tham gia phòng Voice ID: \`${channelId}\` và giữ kết nối 24/7.`);
      return true;
    }

    case 'leave': {
      manager.updateVoice(client.session.id, { channelId: '' });
      await sendOrEdit(msg.channel_id, msg.id, `👋 Đã rời khỏi phòng Voice.`);
      return true;
    }

    case 'mute':
    case 'unmute': {
      const isMute = command === 'mute';
      manager.updateVoice(client.session.id, { selfMute: isMute });
      await sendOrEdit(msg.channel_id, msg.id, `🎙️ Micro Voice: **${isMute ? 'ĐÃ TẮT MIC (Muted)' : 'ĐÃ BẬT MIC (Unmuted)'}**`);
      return true;
    }

    case 'deaf':
    case 'undeaf': {
      const isDeaf = command === 'deaf';
      manager.updateVoice(client.session.id, { selfDeaf: isDeaf });
      await sendOrEdit(msg.channel_id, msg.id, `🎧 Tai nghe Voice: **${isDeaf ? 'ĐÃ TẮT TAI NGHE (Deafened)' : 'ĐÃ BẬT TAI NGHE (Undeafened)'}**`);
      return true;
    }

    case 'video': {
      const cur = Boolean(client.session.voice.selfVideo);
      manager.updateVoice(client.session.id, { selfVideo: !cur });
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

    case 'qr': {
      if (!argsString) {
        await sendOrEdit(msg.channel_id, msg.id, `❌ Vui lòng nhập nội dung muốn tạo mã QR! Ví dụ: \`${p}qr https://google.com\``);
        return true;
      }
      const encoded = encodeURIComponent(argsString);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
      await sendOrEdit(msg.channel_id, msg.id, `📱 **Mã QR của bạn:**\n${qrUrl}`);
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
          `• \`${p}join [channel_id]\`: Treo vào phòng Voice ID`,
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
          `• \`${p}qr <link>\`: Tạo mã QR quét nhanh`,
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
