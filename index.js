const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const token = '6849448961:AAEKt8I1uZCI41ZIha1Vj2VOkT9W5-ip3eU';
const bot = new TelegramBot(token, {polling: true});
const { telegrap } = require('./views/function/telegrap.js')
const { getKuis } = require('./views/function/kuis.js')
const { menu } = require('./views/admin/menu.js')

const { addUsers, cekUsers, setUsers, searchUsers, allUsers, bannedUsers, cekKuisG, setKuis } = require('./views/database/all.js')

const start = async () => { require('./views/database/connection.js')
bot.on('message', async (msg) => {   
  const from = msg.chat.id;
  const user = msg.from.id;
  
  function cmdLog(cmdName){
    bot.getChatMember(from, user).then(function(data) {
      console.log(`[ CMD ] > ${data.user.first_name} - ${cmdName}`)
      if (cmdName == "start"){
         bot.sendMessage("6528518111", `User @${data.user.first_name} Bergabung di bot`)
      }
    });
  }   
  
  function Button(data){
    var result1 = []
    if (data[0].b.includes("kuis")){
      data = data.sort(() => Math.random() - 0.5);
    }
    for (let i = 0; i < data.length; i++) {
      result1.push([{
        text: data[i].a,
        callback_data: data[i].b
      }])          
    }         
    var result2 = { 
      reply_markup: JSON.stringify({
        inline_keyboard: result1
      })
    }
    return result2
  }
  
  function cekKuis(data){
    var kuisArray = ["/asahotak","/siapaaku","/tebakbendera","/tebakhewan","/tebakkalimat","/tebakkata","/tebaklirik","/tebaksurah","/tebaktebakan"]
    var result = "false"    
    for (let i = 0; i < kuisArray.length; i++) {
      if (kuisArray[i] == data){
        result = "true"
      }
    }       
    return result
  }
  
  var users = await cekUsers(user)    
  const command = msg.text ? msg.text.split(" ")[0].substring(1) : '';  
  if (msg.chat.type == "private" && users.banned == "true") return bot.sendMessage(from, "Kamu di banned karena melakukan kesalahan")
  
  if (msg.text){ 
    
    switch (command) {  
       
    case 'menu': case 'help': cmdLog(command)
      if (msg.chat.type !== "private") return
      console.log(msg.chat.type)
      if (msg.chat.type !== "private") {
        bot.sendMessage(from, `List kuis\n - asahotak\n - siapaaku\n - tebakbendera\n - tebakhewan\n - tebakkalimat\n - tebakkata\n - tebaklirik\n - tebaksurah\n - tebaktebakan`)
      } else {
        bot.sendMessage(from, menu()) 
      }             
    break   
    
    case 'start': cmdLog(command) 
      if (msg.chat.type !== "private") return 
      if (users == "false"){
        bot.sendMessage(from, 'Terima kasih telah menggunakan MdXyzBot. Sebelum kita mulai, bisakah Kamu memberi tahu saya Gender Kamu? :', Button([
          { a: "🧑 Cowok", b: "cowok" },
          { a: "👧 Cewek", b: "cewek" },
        ]))
      } else {            
        bot.sendMessage(from, `Kamu sudah terdaftar di bot, jadi sekarang kamu bisa mencari teman random dengan mengetik /search. Selamat bersenang-senang!`)
      }
    break
    
    case 'search': cmdLog(command) 
      if (msg.chat.type !== "private") return 
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)
      if (users.start == "berteman") return bot.sendMessage(from, `Kamu sudah mendapatkan teman sebelumnya, Coba katakan Hai.\n/next -- Cari teman lain\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis.`)
      if (users.start == "true") return bot.sendMessage(from, `Kami dari tadi mencoba mencarikan anda teman. Tetapi dikarenakan user kami sedikit jadi sangat susah mencari pasangan.\n\nBantu kami share bot ini ke temen teman kamu agar user nya lebih banyak. Cwiww`)       
      setUsers(from, "start", "true")
      bot.sendMessage(from, `Sedang Mencari temen untuk kamu...`)
      setTimeout(() => {
        searchUsers(from).then(teman => {
          if (teman == "false"){
            return bot.sendMessage(from, `Teman sedang padat silahkan menunggu beberapa menit lagi sampai ada yang memulai .\n\nSambil menunggu, Ayo gabung grub bot yuk, Link di bio bot.`)
          } else {
            bot.sendMessage(from, `Sukses menemukan teman coba katakan hai.\n/next -- Cari teman lain\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis.`)            
            bot.sendMessage(teman.id, `Sukses menemukan teman coba katakan hai.\n/next -- Cari teman lain\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis.`)
          }
        })        
      }, 3000)    
    break  
    
    case 'next': cmdLog(command)
      if (msg.chat.type !== "private") return
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)    
      if (users.start == "true") return bot.sendMessage(from, `Kami dari tadi mencoba mencarikan anda teman. Tetapi dikarenakan user kami sedikit jadi sangat susah mencari pasangan.\n\nBantu kami share bot ini ke temen teman kamu agar user nya lebih banyak. Cwiww`)
      if (users.start == "false") {             
        setUsers(from, "start", "false")       
        setUsers(from, "teman", "false")
        setTimeout(() => {
          searchUsers(from).then(teman => {
            if (teman == "false"){
              return bot.sendMessage(from, `Teman sedang padat silahkan menunggu beberapa menit lagi sampai ada yang memulai .\n\nSambil menunggu, Ayo gabung grub bot yuk, Link di bio bot.`)
            } else {
              bot.sendMessage(from, `Sukses menemukan teman coba katakan hai.\n/next -- Mencari teman baru\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis`)            
              bot.sendMessage(teman.id, `Sukses menemukan teman coba katakan hai.\n/next -- Mencari teman baru\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis`)
            }
          })        
        }, 3000)   
        return bot.sendMessage(from, `Sebenarnya kamu tidak berteman dengan siapapun sebelumnya. Tapi sedang mencari teman untuk kamu...`)
      } else if (users.start == "berteman") {         
        bot.sendMessage(users.teman, `Temanmu menutus hubungan dengan mu\n/search -- Mencari teman baru`)          
          setUsers(users.teman, "kuisName", "false")
          setUsers(users.teman, "kuisSoal", 0)
          setUsers(users.teman, "kuisJawaban", "false") 
          setUsers(from, "kuisName", "false")
          setUsers(from, "kuisSoal", 0)
          setUsers(from, "kuisJawaban", "false")         
          setUsers(users.teman, "start", "false")       
          setUsers(users.teman, "teman", "false")
          setUsers(from, "start", "false")       
          setUsers(from, "teman", "false")
          setTimeout(() => {
           searchUsers(from).then(teman => {
             if (teman == "false"){
               return bot.sendMessage(from, `Teman sedang padat silahkan menunggu beberapa menit lagi sampai ada yang memulai .\n\nSambil menunggu, Ayo gabung grub bot yuk, Link di bio bot.`)
             } else {
               bot.sendMessage(from, `Sukses menemukan teman coba katakan hai.\n/next -- Mencari teman baru\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis`)            
               bot.sendMessage(teman.id, `Sukses menemukan teman coba katakan hai.\n/next -- Mencari teman baru\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis`)
             }
           })        
        }, 3000)   
        return bot.sendMessage(from, `Sedang mencari teman baru untuk kamu...`)      
      }
    break
    
    case 'stop': cmdLog(command)
      if (msg.chat.type !== "private") return 
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)    
      if (users.teman == "false"){ 
        bot.sendMessage(from, `Kamu sebenarnya belum menemukan teman! Tidak ada alasan untuk berhenti.`)     
      } else {      
        bot.sendMessage(users.teman, `Temanmu menutus hubungan dengan mu\n/search -- Mencari teman baru`)                               
        setUsers(users.teman, "kuisName", "false")
        setUsers(users.teman, "kuisSoal", 0)
        setUsers(users.teman, "kuisJawaban", "false") 
        setUsers(from, "kuisName", "false")
        setUsers(from, "kuisSoal", 0)
        setUsers(from, "kuisJawaban", "false")          
        setUsers(users.teman, "start", "false")       
        setUsers(users.teman, "teman", "false")
        setUsers(from, "start", "false")       
        setUsers(from, "teman", "false") 
        bot.sendMessage(from, `Sukses menghapus teman kamu\n/search -- Mencari teman baru`)
      }
    break
    
    case 'kuis': cmdLog(command)     
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)
      bot.sendMessage(from, `List kuis\n/asahotak\n/siapaaku\n/tebakbendera\n/tebakhewan\n/tebakkalimat\n/tebakkata\n/tebaklirik\n/tebaksurah\n/tebaktebakan`)
    break
    
    case 'searchgender': cmdLog(command)
      if (msg.chat.type !== "private") return
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)
      if (users.premium == "false") return bot.sendMessage(from, `Maaf fitur ini hanya bisa di gunakan oleh user premium,\n\n/getpremium -- Mendapatkan premium`)
      bot.sendMessage(from, 'Kamu ingin mencari teman berdasarkan gender apa?', Button([
        { a: "🧑 Cowok", b: "c-cowok" },
        { a: "👧 Cewek", b: "c-cewek" },
      ]))
    break
    
    case 'getpremium': cmdLog(command)
      bot.sendMessage(from, `Ingin mendapatkan premium dan mengetahui apa aja sih yang dapat di lakukan jika menjadi premium Silahkan hubungi t.me/mdmdxyz`)        
    break
    
    case 'my': cmdLog(command) 
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)
      bot.sendMessage(from, `Berikut adalah data kamu\n`
        + `> Id : ${users.id}\n`
        + `> Gender : ${users.gender}\n`
        + `> Premium : ${users.premium}\n`
        + `> Status : ${users.start}\n`
        + `> Banned : ${users.banned}\n`
        + `> Mendali Kuis : ${users.kuis.win}\n`)
    break
    case 'usertotal': cmdLog(command)   
      var allUsers1 = await allUsers();
      bot.sendMessage(from, allUsers1.length)
    break
    case 'bc': cmdLog(command)
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)
      if (users.premium !== "developer") return bot.sendMessage(from, `Maaf fitur ini hanya bisa di gunakan oleh developer bot`)            
      var allUsers1 = await allUsers();
      var query = msg.text.split(" ").slice(1).join(" ");
      for (let i = 0; i < allUsers1.length; i++) { 
        bot.sendMessage(allUsers1[i].id, `[ SIARAN CHAT ]\n`
          + `\n> Dari : Developer`
          + `\n> Pesan : ${query}`)            
      }
    break   
    case 'ban': cmdLog(command)
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)
      if (users.premium !== "developer") return bot.sendMessage(from, `Maaf fitur ini hanya bisa di gunakan oleh developer bot`)                        
      var query = msg.text.split(" ").slice(1).join(" ");
      setUsers(query, "banned", "true")
      /*var usersBan = await cekUsers(query)     
      if (usersBan.teman !== "false"){
        bot.sendMessage(usersBan.teman, "Kami mendeteksi teman kamu melanggar peraturan, Kami telah memberikan hukuman untuk nya, Maaf atas ketidaknyamanan nya\n/next -- Cari teman baru")
      }*/
      bot.sendMessage(from, "Sukses")
    break   
    case 'asahotak': case 'siapaaku': case 'tebakbendera': case 'tebakhewan': case 'tebakkalimat': case 'tebakkata': case 'tebaklirik': case 'tebaksurah': case 'tebaktebakan':
      cmdLog(command)      
      if (msg.chat.type !== "private") return
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start\n\n> Note : Chat bot di pesan pribadi`)
      if (msg.chat.type == "private"){
        if (users.teman == "false") return bot.sendMessage(from, `Hanya bisa digunakan jika memiliki teman\n/search -- Mencari teman`)
        const kuis = require(_ + '/views/kuis/' + command + '.json')
        const kuisR = getKuis(users, command)       
        if (kuisR == "false") return bot.sendMessage(from, `Kamu sudah bermain kuis sebelum nya!`)         
        bot.sendMessage(from, `> Kuis : ${command}\n> Soal : ${kuis[kuisR].soal}\nSilahkan pilih jawaban yang menurut kamu benar, Ayo rebutan!`, Button([
          { a: `${kuis[kuisR].pilihanJawaban[0]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[0]}` },
          { a: `${kuis[kuisR].pilihanJawaban[1]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[1]}` },
          { a: `${kuis[kuisR].pilihanJawaban[2]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[2]}` },
          { a: `${kuis[kuisR].pilihanJawaban[3]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[3]}` },
          { a: `${kuis[kuisR].pilihanJawaban[4]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[4]}` }         
        ]))
        return bot.sendMessage(users.teman, `Teman kamu menantang untuk bermain kuis ${command},\n\n> Soal : ${kuis[kuisR].soal}\nSilahkan pilih jawaban yang menurut kamu benar, Ayo rebutan!`, Button([
          { a: `${kuis[kuisR].pilihanJawaban[0]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[0]}` },
          { a: `${kuis[kuisR].pilihanJawaban[1]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[1]}` },
          { a: `${kuis[kuisR].pilihanJawaban[2]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[2]}` },
          { a: `${kuis[kuisR].pilihanJawaban[3]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[3]}` },
          { a: `${kuis[kuisR].pilihanJawaban[4]}`, b: `kuis-${kuis[kuisR].pilihanJawaban[4]}` }         
        ])) 
      } else {
        var dataKuis = await cekKuisG(from)          
        if (dataKuis.name !== "false") return bot.sendMessage(from, `Kuis ${dataKuis.name} sedang berlangsung. Silahkan selesaikan terlebih dahulu`)
        const kuis = require(_ + '/views/kuis/' + command + '.json')
        var numberRandom = Math.floor(Math.random() * 200) + 1;                  
        setTimeout(() => {
          setKuis(from, "name", command)
          setKuis(from, "soal", numberRandom)
          setKuis(from, "jawaban", kuis[numberRandom].jawaban)                         
          bot.sendMessage(from, `Seorang menantang untuk bermain kuis ${command},\n\n> Soal : ${kuis[numberRandom].soal}\n\nSilahkan pilih jawaban yang menurut kamu benar, Ayo rebutan!`, Button([
            { a: `${kuis[numberRandom].pilihanJawaban[0]}`, b: `kuis-${kuis[numberRandom].pilihanJawaban[0]}` },
            { a: `${kuis[numberRandom].pilihanJawaban[1]}`, b: `kuis-${kuis[numberRandom].pilihanJawaban[1]}` },
            { a: `${kuis[numberRandom].pilihanJawaban[2]}`, b: `kuis-${kuis[numberRandom].pilihanJawaban[2]}` },
            { a: `${kuis[numberRandom].pilihanJawaban[3]}`, b: `kuis-${kuis[numberRandom].pilihanJawaban[3]}` },
            { a: `${kuis[numberRandom].pilihanJawaban[4]}`, b: `kuis-${kuis[numberRandom].pilihanJawaban[4]}` }  
          ]))
        }, 1000)               
      }                        
    break 
    
    }
  } 
   
  if (msg.text !== "/" + command){   
    if (msg.chat.type !== "private") return
    if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start`)  
    if (users.start !== "berteman") return bot.sendMessage(from, `Sepertinya kamu belum memiliki teman\n/search -- Mulai Mencari teman`)                
    if (users.start == "berteman") {     
      if (msg.text){
        bot.getChatMember(from, from).then(function(data) {
          console.log(`[ ${from} ] > ${data.user.first_name} - ${msg.text}`)            
          const stringSimilarity = require('string-similarity');
          const arrayTxc = ['sange','tt'];
          const matchesTxc = stringSimilarity.findBestMatch(msg.text, arrayTxc);
          if (matchesTxc.bestMatch.rating !== 0) {
            //bot.sendMessage(from, "kamu terdeteksi mengirim hal tidak pantas😡, Pesan ini tidak terkirim ke teman.") 
            bot.sendMessage("6528518111", `[ DETEKSI TEXT ]\n`
              + `> User : @${data.user.first_name}\n`
              + `> User : ${users.id}\n`
              + `> Pesan : ${msg.text}\n`
              + `> Target : ${matchesTxc.bestMatch.target}\n`)           
          }           
          bot.sendMessage(users.teman, msg.text)  
        })       
      } else if (msg.photo) {
        bot.sendPhoto(users.teman, msg.photo[msg.photo.length - 1].file_id, { caption: msg.caption }) 
      } else if (msg.audio) {
        bot.sendAudio(users.teman, msg.audio.file_id)
      } else if (msg.animation) {
        bot.sendAnimation(users.teman, msg.animation.file_id)
      } else if (msg.document) {
        bot.sendDocument(users.teman, msg.document.file_id)
      } else if (msg.sticker) {
        bot.sendSticker(users.teman, msg.sticker.file_id)
      } else if (msg.video) {
        bot.sendVideo(users.teman, msg.video.file_id, { caption: msg.caption})
      } else if (msg.voice) {
        bot.sendVoice(users.teman, msg.voice.file_id)
      } else {
        bot.sendMessage(from, "Type pesan tidak di ketahui")
      }
    }  
  }
  
});

bot.on('callback_query', async (callbackQuery) => {
  const from = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data; 
  var users = await cekUsers(callbackQuery.from.id)
  
  function resetKuis(){
    setUsers(users.teman, "kuisName", "false")
    setUsers(users.teman, "kuisSoal", 0)
    setUsers(users.teman, "kuisJawaban", "false") 
    setUsers(from, "kuisName", "false")
    setUsers(from, "kuisSoal", 0)
    setUsers(from, "kuisJawaban", "false")  
  }  
   
  if (data == "cowok" || data == "cewek"){  
    if (users !== "false") return bot.sendMessage(from, "Kamu sudah memasukkan gender sebelumnya, sayang sekali tidak dapat di ubah") 
    bot.editMessageText('Sukses bergabung, Selanjutnya silahkan baca peraturan dan ketentuan bot yaa\n\n[1/7] > Pesan berikutnya dalam 3 detik', { chat_id: from, message_id: messageId });    
    setTimeout(() => {
      bot.editMessageText('Jangan memberikan informasi pribadi seperti nama, alamat, nomor telepon, atau media sosial kepada orang yang tidak Anda kenal.\n\n[2/7] > Pesan berikutnya dalam 3 detik', { chat_id: from, message_id: messageId });
    }, 3000)
    setTimeout(() => {
      bot.editMessageText('Jangan mengirim atau meminta foto, video, atau konten yang tidak pantas, melanggar hukum, atau mengandung unsur kekerasan, pornografi, atau diskriminasi.\n\n[3/7] > Pesan berikutnya dalam 3 detik', { chat_id: from, message_id: messageId });
    }, 6000)
    setTimeout(() => {
      bot.editMessageText('Jangan mengancam, menghina, atau melecehkan lawan bicara Anda. Hormati pendapat, kepercayaan, dan budaya orang lain.\n\n[4/7] > Pesan berikutnya dalam 3 detik', { chat_id: from, message_id: messageId });
    }, 9000)
    setTimeout(() => {
      bot.editMessageText('Jangan melakukan spam, iklan, atau promosi yang tidak diinginkan. Gunakan bot ini hanya untuk tujuan bersosialisasi dan berbagi informasi yang bermanfaat.\n\n[5/7] > Pesan berikutnya dalam 3 detik', { chat_id: from, message_id: messageId });
    }, 12000)
    setTimeout(() => {
      bot.editMessageText('Jangan menyalahgunakan fitur bot ini untuk tujuan yang merugikan diri sendiri atau orang lain. Gunakan bot ini dengan bertanggung jawab dan bijak.\n\n[6/7] > Pesan berikutnya dalam 3 detik', { chat_id: from, message_id: messageId });
    }, 15000)
    setTimeout(() => {
      bot.editMessageText('Jika Anda merasa tidak nyaman, tidak tertarik, atau tidak aman dengan lawan bicara Anda, Anda bisa menghentikan obrolan dengan mengetik /stop atau /next. Anda juga bisa melaporkan pengguna yang melanggar peraturan dengan mengetik /report.\n\n[7/7] > Pesan berikutnya dalam 3 detik', { chat_id: from, message_id: messageId });
    }, 18000)    
    setTimeout(() => {
      bot.editMessageText('Selesai, Sekarang kamu bisa mencari teman random dengan mengetik /search. Selamat bersenang-senang!', { chat_id: from, message_id: messageId });
    }, 21000)  
    return addUsers({
      id: from,
      gender: data,
      premium: "false",
      teman: "false",
      start: "false",
      banned: "false",
      kuis: {
        name: "false",
        soal: 0,
        jawaban: "false",
        win: 0
      }
    })      
  }
  
  if (users.premium !== "false"){
    if (data == "c-cowok" || data == "c-cewek"){
      
      if (users.teman !== "false"){
        if (users.start == "berteman"){
          bot.sendMessage(users.teman, `Temanmu menutus hubungan dengan mu\n/search -- Mencari teman baru`)                               
        } 
        setUsers(users.teman, "kuisName", "false")
        setUsers(users.teman, "kuisSoal", 0)
        setUsers(users.teman, "kuisJawaban", "false") 
        setUsers(from, "kuisName", "false")
        setUsers(from, "kuisSoal", 0)
        setUsers(from, "kuisJawaban", "false")          
        setUsers(users.teman, "start", "false")       
        setUsers(users.teman, "teman", "false")
        setUsers(from, "start", "false")       
        setUsers(from, "teman", "false") 
      }
      
      bot.sendMessage(from, `Sedang Mencari temen ${data.split("-")[1]} Buat kamu...`)
      setTimeout(() => {
        searchUsers(from, data.split("-")[1]).then(teman => {
          if (teman == "false"){
            return bot.sendMessage(from, `Teman ${data.split("-")[1]} sedang padat silahkan menunggu beberapa menit lagi sampai ada yang memulai .\n\nSambil menunggu, Ayo gabung grub bot yuk, Link di bio bot.`)
          } else {
            bot.sendMessage(from, `Sukses menemukan teman ${data.split("-")[1]} coba katakan hai.\n/searchgender -- Cari teman lain\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis.`)            
            bot.sendMessage(teman.id, `Sukses menemukan teman coba katakan hai.\n/next -- Cari teman lain\n/stop -- Berhenti berteman\n/kuis -- Bermain kuis.`)
          }
        })        
      }, 3000)      
    }
  }
  if (callbackQuery.message.chat.type == "private"){
    if (data.split("-")[0] == "kuis" && users.kuis.name !== "false"){
      if (data.split("-")[1] == users.kuis.jawaban){
        bot.sendMessage(users.teman, `Teman kamu telah menjawab dan hasil nya benar, 1 Medali telah ia Dapatkan! Kuis Berakhir\n\n/${users.kuis.name} -- Bermain lagi\n/kuis -- Bermain kuis lainnya`)
        bot.sendMessage(from, `Jawaban kamu benar, Kamu memang hebat, 1 Medali didapatkan, Kuis Berakhir.\n\n/${users.kuis.name} -- Bermain lagi\n/kuis -- Bermain kuis lainnya`)   
        setUsers(from, "kuisWin", 1)
        return resetKuis() 
      } else {
        const userss = await cekUsers(users.teman)
        if (userss.kuis.name == "false") {
          bot.sendMessage(from, `Jawaban kamu juga salah, Tidak ada yang menjawab benar, Kuis berakhir.\n\n/${users.kuis.name} -- Bermain lagi\n/kuis -- Bermain kuis lainnya`)          
          bot.sendMessage(users.teman, `Tidak ada yang menjawab benar, Kuis berakhir.\n\n/${users.kuis.name} -- Bermain lagi\n/kuis -- Bermain kuis lainnya`)
          setUsers(from, "kuisName", "false")
          setUsers(from, "kuisSoal", 0)
          return setUsers(from, "kuisJawaban", "false")  
        } 
        bot.sendMessage(users.teman, `Teman kamu telah menjawab dan hasil nya salah, Hahaha, Ayo Pilih jawaban kamu!`)        
        bot.sendMessage(from, `Jawaban kamu salah Silahkan tunggu jawaban teman kamu...`)                                
        setUsers(from, "kuisName", "false")
        setUsers(from, "kuisSoal", 0)
        return setUsers(from, "kuisJawaban", "false")         
      }
    } else {  
      return bot.sendMessage(from, `Tidak dapat memilih lagi! Kamu sudah menjawaban sebelum nya. atau Kuis ini telah berakhir`)      
    }
  } else {    
    var dataKuis = await cekKuisG(from)
    if (data.split("-")[0] == "kuis" && dataKuis.name !== "false"){      
      if (users == "false") return bot.sendMessage(from, `Sepertinya kamu belum terdaftar di database bot, silahkan gunakan command /start\n\n> Note : Chat bot di pesan pribadi`)
      if (dataKuis.menjawab.includes(callbackQuery.from.id)) return bot.sendMessage(from, `Kamu sudah menjawab sebelum nya, Tidak dapat menjawab lagi!`)
      if (data.split("-")[1] == dataKuis.jawaban){        
        bot.getChatMember(from, callbackQuery.from.id).then(function(data) {
          bot.sendMessage(from, `Jawaban benar, Pemenang nya adalah ${data.user.first_name}, Mendapatkan 1 Medali.\n\nAyo main lagi?`)          
          
        })        
        
      } else {
        bot.sendMessage(from, `Jawaban kamu salah!, `)
        setKuis(from, "menjawab", callbackQuery.from.id)
        
      }
    } else {  
      return bot.sendMessage(from, `Tidak dapat memilih lagi! Kamu sudah menjawaban sebelum nya. atau Kuis ini telah berakhir`)      
    }
  }
});

  
}
start()