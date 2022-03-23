/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / Prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')

const songNameHeading = $('header h2')
const songSingerHeading = $('header h4')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs : [
        {
            name: '3107',
            singer: 'Duongg & Nâu',
            path: './assets/songs/3107-WnDuonggNau.mp3',
            image: './assets/imgs/3107.jpg'
        },
        {
            name: '1 Phút',
            singer: 'Andiez',
            path: './assets/songs/1-Phut-Andiez.mp3',
            image: './assets/imgs/1Phut.jpg'
        },
        {
            name: 'Còn thương thì không để em khóc',
            singer: 'Miu Lê & Đạt G',
            path: './assets/songs/ConThuongThiKhongDeEmKhoc-MiuLe.mp3',
            image: './assets/imgs/ConThuongThiKhongDeEmKhoc.jpg'
        },
        {
            name: 'Những Kẻ Mộng Mơ',
            singer: 'Noo Phước Thịnh',
            path: './assets/songs/NhungKeMongMo-NooPhuocThinh.mp3',
            image: './assets/imgs/NhungKeMongMo.jpg'
        },
        {
            name: 'Sinh ra đã là thứ đối lập nhau',
            singer: 'Emcee L (Da LAB) & Badbies',
            path: './assets/songs/SinhRaDaLaThuDoiLapNhau-EmceeLDaLABBadbies.mp3',
            image: './assets/imgs/SinhRaDaLaThuDoiLapNhau.jpg'
        }
    ],

    render: function(){
        const htmls = this.songs.map((song, index) =>{
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })  
    },

    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth

        //Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //Xử lý phóng to / thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause()
            } else{
                audio.play()
            }
        }

        //Khi Song được play
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        //Khi Song bị Pause
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        //Tiến độ bài hát
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }
        //Xử lý khi tua bài hát
        progress.oninput = function(){
            const seekTime = audio.duration * progress.value / 100
            audio.currentTime = seekTime
        }
        //Next Song Function
        nextSong = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            } else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
        }
        //Khi next bài hát
        nextBtn.onclick = function(){
            nextSong()
        }
        //Khi previous bài hát
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            } else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }
        //Random Song
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        //Repeat Song
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        //Xử lý next/repeat Song khi end Song
        audio.onended = function(){
            //repeat
            if(_this.isRepeat){
                audio.play()
            }
            //next Random / next default
            else{
                nextSong()
            }
        }
         //Lắng nghe hành vi click vào playlist
         playList.onclick = function(e){
             const songNode = e.target.closest('.song:not(.active)')
             if( songNode || e.target.closest('.option')){
                 if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index) // đồng nghĩa với Number(songNode.getAttribute('data-index'))
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                 }
                 if(e.target.closest('.option')){
                    //Tự thêm chức năng Song Option
                 }
             }
             
         }
    },

    loadCurrentSong: function(){
        songNameHeading.textContent = this.currentSong.name
        songSingerHeading.textContent = this.currentSong.singer
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function(){

        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        //Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        //Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //Render playlist
        this.render()

        //Hiển thị trạng thái của random & repeat button từ config
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}
app.start()


