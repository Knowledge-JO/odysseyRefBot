import TelegramBot, { KeyboardButton, Message } from "node-telegram-bot-api";
import dotenv from "dotenv"
dotenv.config()
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || "";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

type RefData = {
    referringUserID: string;
    referrals: Array<number>
}

const keyboard: KeyboardButton[][] = [
   [{text: "referrals"}, {text: "referral link"}]
]

const DB: RefData[] = []

bot.onText(/\/start/, (msg: Message) => {
    if(msg.chat.type !== "private") return
    const chatId = msg.chat.id
    bot.sendMessage(chatId, "Welcome to the Odyssey referral bot", {
        reply_markup: {
            keyboard,
            resize_keyboard: true
        }
    })
})

bot.onText(/\/start (.+)/ , (msg: Message, match) => {
    if(msg.chat.type !== "private") return
    const chatId = msg.chat.id
    // Extract referring User ID from the link
    let referringUserId: string
    if(match){
        referringUserId = match[1]
        if(chatId.toString() === referringUserId) return
        updateDB(referringUserId, chatId)
        console.log(DB)
    }
    bot.sendMessage(chatId, "Welcome to the Odyssey referral bot", {
        reply_markup: {
            keyboard,
            resize_keyboard: true
        }
    })
})

bot.onText(/referrals/, (msg: Message) => {
    if(msg.chat.type !== "private") return
    const chatId = msg.chat.id
    const index = getIndex(chatId.toString())
    const data = DB[index]
    const totalRefs = data ? data.referrals.length : 0
    const message = `<b>Total - ${totalRefs}</b>`
    bot.sendMessage(chatId, message, {parse_mode: "HTML"})
})


bot.onText(/referral link/, (msg: Message) => {
    if(msg.chat.type !== "private") return
    const chatId = msg.chat.id
    const message = `<b>Your ref link: https://t.me/odysseyref_bot?start=${chatId}</b>`
    bot.sendMessage(chatId, message, {parse_mode: "HTML"})
})


function updateDB(referringUserId: string, chatId: number) {
    const index = getIndex(referringUserId)
    if(index === -1){
        DB.push({referringUserID: referringUserId, referrals: [chatId]})
    }else{
       if( DB[index].referrals.includes(chatId)) return
       DB[index].referrals.push(chatId)
    }   
}

function getIndex(referringUserId: string): number {
    const index = DB.findIndex(data => {
        return (data.referringUserID === referringUserId) 
    })
    return index
}