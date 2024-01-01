import TelegramBot, { Message } from "node-telegram-bot-api";

// replace the value below with the Telegram token you receive from @BotFather
const token = '6334819793:AAGAJn3ZRbrgUEhcFU9KQrI_pZFsruOgUek';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

type RefData = {
    referringUserID: string;
    referrals: Array<number>
}

const DB: RefData[] = []

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
})

bot.onText(/\/referrals/, (msg: Message) => {
    if(msg.chat.type !== "private") return
    const chatId = msg.chat.id
    const index = getIndex(chatId.toString())
    const data = DB[index]
    const totalRefs = data ? data.referrals.length : 0
    const message = `<b>Total - ${totalRefs}</b>`
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