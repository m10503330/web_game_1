
    var blocks_data = [
        {id:'.block1',name:'1',yell:'1'},
        {id:'.block2',name:'2',yell:'2'},
        {id:'.block3',name:'3',yell:'3'},
        {id:'.block4',name:'4',yell:'4'}
    ]
    var setassign_data =[
        {name:'correct',sets:[1,3,5,8]},
        {name:'wrong',sets:[2,4,5.5,7]}
    ]
    var levelDatas = [
        '1234','1243','21342','42234','41412321','42424213322','1231231231231114','444411112222333321'
    ]



    var Blocks = function(blockassign,setassign){
        this.allon = false;
        this.blocks = blockassign.map((d,i)=>({
            name:d.name,
            el:$(d.id),
            audio: this.getAudioObject(d.yell)
        }))
        this.soundSet = setassign.map((d,i)=>({
            name:d.name,
            sets:d.sets.map((pitch)=>this.getAudioObject(pitch))
        }))

    }
    Blocks.prototype.getAudioObject = function(yell){
        return new Audio('https://awiclass.monoame.com/pianosound/set/'+yell+'.wav');
    }
    Blocks.prototype.flash = function(note){
        let block = this.blocks.find(d=>d.name==note)
        if(block){
            block.audio.currentTime = 0;
            block.el.addClass('active')
            block.audio.play();
            setTimeout(()=>{
                if(this.allon==false){
                block.el.removeClass('active')
                }
            },200)

        }
    }
    Blocks.prototype.turnAllOn = function(){
        this.allon=true;
        this.blocks.forEach( d => { 
            d.el.addClass('active')
            });
    }
    Blocks.prototype.turnAllOff = function(){
        this.allon=false;
        this.blocks.forEach( d => { 
            d.el.removeClass('active')
            });
    }
    Blocks.prototype.playset = function(type){
        this.soundSet.find(set=>set.name==type).sets.forEach((obj)=>{
            obj.currentTime = 0;
            obj.play();
        })
    }
    var Game = function(){
        this.block = new Blocks (blocks_data,setassign_data);
        this.levels = this.loadLevel();
        this.currentLevel=0;
        this.playInterval=400;
        this.mode="waiting";
    }
    Game.prototype.loadLevel=function(){
        let _this=this
        $.ajax({
            url:'https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata',
            success:function(res){
                _this.levels=res
            }

        })
    }
    Game.prototype.startgame = function(ans){
        this.mode="gamePlay";
        this.ans=ans;
        this.block.turnAllOff();
        this.showStatus("");
        let notes = this.ans.split("");
        this.timer = setInterval(() => {
            let char = notes.shift()
            this.playNote(char)
            if(notes.length == 0)
            {
                this.UserInput()
                clearInterval(this.timer);
            }
        }, this.playInterval);
        
    }
    Game.prototype.startLevel = function(){
        this.showMessage('LV: '+this.currentLevel);
        let leveldata = this.levels[this.currentLevel]
        this.startgame(leveldata)
    }
    Game.prototype.playNote = function(char){
        this.block.flash(char);
    }
    Game.prototype.UserInput = function(){
        this.userInput = ""
        this.mode = "UserInput"
    }
    Game.prototype.UserSendInput = function(inputChar){
        if (this.mode == "UserInput")
        {
            let tempString = this.userInput + inputChar;
            this.playNote(inputChar)
            this.showStatus(tempString)
            if (this.ans.indexOf(tempString)==0){
                console.log("good")
                if(this.ans==tempString){
                    this.showMessage("correct")
                    this.currentLevel+=1;
                    this.mode = "waiting"
                    
                    setTimeout(() => {
                        this.startLevel()
                    }, 1000);
                console.log("correct")

                }
            }else{
                console.log("wrong")
                this.showMessage("wrong")
                this.block.playset("wrong")
                this.currentLevel=0;
                this.mode = "waiting"
                setTimeout(() => {
                    this.startLevel()
                }, 1000);

            }

            this.userInput=this.userInput+=inputChar
        }
    }
    Game.prototype.showMessage = function(meg){
        console.log(meg);
        $(".status").text(meg);
    }
    Game.prototype.showStatus = function(tempString) {
        $(".inputStatus").html("")
        this.ans.split("").forEach((d,i)=>{
            var circle = $("<div class='circle'></div>")
            if(i< tempString.length){
                circle.addClass("correct")
            }
            $(".inputStatus").append(circle)
            if(tempString==this.ans){
                $(".inputStatus").addClass("correct")
                setTimeout(() => {
                    this.block.turnAllOn();
                    this.block.playset("correct")
                }, 500);
            }else{
                $(".inputStatus").removeClass("correct")
            }
            if (this.ans.indexOf(tempString)!=0){
                $(".inputStatus").addClass("worng")
                setTimeout(() => {
                    this.block.turnAllOn();
                    this.block.playset("worng")
                }, 500);
            }else{
                $(".inputStatus").removeClass("worng")
            }
        })
    }
    var game=new Game();
    document.querySelector('.strat_btn').addEventListener('click',function(){
        document.querySelector('.loading_page').style.display = "none";
        setTimeout(()=>{game.startLevel()},500);
    })


    


