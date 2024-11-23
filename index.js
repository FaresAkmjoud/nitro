const { Client, Intents, Collection } = require("discord.js");
const token =
  "MTMwOTg5NzIzODY1NDIyNjQ5Mw.G6dQZO.VRUuukUrivnLozoAZOyRg3LHWQhn5V51FWTD9c";
const allowedChannelId = "1309899804868083765";//ايدي روم يلي هتولد فيها
const premiumRoleId = "1308759818068299827";// ايدي رول البريميوم
const cooldowns = new  Collection();
const userStats = new Collection();
const maxNormalCount = 50; //اقصى حد توليد يمكن للمستحدم العادي استخدماه
const maxPremiumCount = 200;//اقصى حد توليد يمكن للمستخدم البريميوم استخدماه
const normalDelay = 2000;//فترة بين ارسال كل نيترو للاشخاص العاديين بالميلي سوكوند
const premiumDelay = 200;//فترة بين ارسال كل نيترو للاشخاص البريوميوم بالميلي سوكوند

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!توليد")) {
    if (message.channel.id !== allowedChannelId) {
      return message.reply(
        "** تستطيع استخدام الأمر فقط في الروم المحدد! <#1309899804868083765>**",
      );
    }

    const args = message.content.split(" ");
    const count = parseInt(args[1], 10);

    if (!count || isNaN(count) || count <= 0) {
      return message.reply("**قم بكتابة رقم محصور (بين 0 و 50) من فضلك .‼️**");
    }

    const isPremium = message.member.roles.cache.has(premiumRoleId);
    const maxCount = isPremium ? maxPremiumCount : maxNormalCount;
    const delay = isPremium ? premiumDelay : normalDelay;

    if (count > maxNormalCount && !isPremium) {
      return message.reply(
        "**ليس لديك خطة بريموم للاشتراك في خطة بريميوم يرجى فتح تكت <#1308987911974162453> وشراء الخطة لتستطيع توليد +50 نيترو!**",
      );
    }

    if (count > maxCount) {
      const errorMessage = isPremium
        ? "**قم بكتابة رقم محصور (بين 0 و 200) من فضلك .‼️**"
        : "**قم بكتابة رقم محصور (بين 0 و 50) من فضلك .‼️**";
      return message.reply(errorMessage);
    }

    const userId = message.author.id;
    const now = Date.now();

    if (!cooldowns.has(userId)) {
      cooldowns.set(userId, now - delay);
    }

    const lastUsed = cooldowns.get(userId);
    const timePassed = now - lastUsed;

    if (timePassed < delay) {
      const timeLeft = ((delay - timePassed) / 1000).toFixed(1);
      return message.reply(
        `**يرجى الانتظار ${timeLeft} ثواني قبل استخدام الأمر مرة أخرى.**`,
      );
    }

    cooldowns.set(userId, now);

    if (!userStats.has(userId)) {
      userStats.set(userId, 0);
    }
    userStats.set(userId, userStats.get(userId) + count);

    if (isPremium) {
      await message.reply("**جاري التوليد بالسرعة الفائقة,تحقق من الخاص...💥**");
    } else {
      await message.reply(`**تم إرسال ${count} نيترو جيفت في الخاص😊**`);
    }

    for (let i = 0; i < count; i++) {
      const code = `https://discord.gift/${generateNitroCode()}`;
      await message.author.send(code);
      await new Promise((resolve) => setTimeout(resolve, delay)); // Wait for delay between each message
    }
  }

  if (message.content.startsWith("!احصائيات")) {
    const userId = message.author.id;
    const userGenerated = userStats.get(userId) || 0;
    return message.reply(
      `**لقد قمت بتوليد ${userGenerated} نيترو جيفت حتى الآن.**`,
    );
  }
});

function generateNitroCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

client.login(token);
