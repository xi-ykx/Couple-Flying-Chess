const gameState = {
    players:[
        { id: 1,name:"甜蜜恋人",position:0, icon:"❤️",color:"#ff6b6b"},
        { id: 2,name:"浪漫伴侣",position:0, icon:"⭐",color:"#5c7cfa"}
    ],
    currentPlayer: 0,
    gameBoard: [],
    gameStarted: false,
    gameTime:0,
    timerInterval:null,
    isMoving: false,
    gameOver:false,
    specialEvents: [
        "回忆第一次约会，心情愉悦前进2格",
        "为对方准备惊喜，获得额外一次掷骰子机会",
        "分享一个小秘密，停留一轮互相倾听",
        "爱的抱抱！双方各前进1格",
        "互送小礼物，心情愉悦前进3格",
        "深情对视10秒，下一轮掷骰子点数+1",
        "写下对方三个优点，直接到达下一个特殊格子",
    ]
};


const Modal = {
    show: (message, callback) => {
        const modal = document.getElementById('event-modal');
        const text = document.getElementById('modal-text');
        text.textContent = message;
        modal.style.display = 'block';

        document.getElementById('modal-confirm').onclick = () => {
            modal.style.display = 'none';
            if (callback) callback();
        };
    }
};

function initBoard(){
    const board = [];
    const boardSize = 64;
    const specialPositions = {
        5: "special",   
        10: "special",
        15: "event",     
        20: "special",
        25: "event",
        30: "special",
        35: "event",
        40: "special",
        45: "event",
        50: "special",
        55: "event",
        60: "special",
        63: "end" 
    };
    for (let i =0; i<boardSize;i++){
        if(i===0){
            board.push({type:"start",index:i});
        }else if(i in specialPositions){
            board.push({type: specialPositions[i],index:i});
        }else{
            board.push({type:"normal",index:i});
        }
    }
    return board;
}

function renderBoard(){
    const boardContainer = document.querySelector('.game-board');
    boardContainer.innerHTML = '';

    gameState.gameBoard.forEach(cell =>{
        const cellElement = document.createElement('div');
        cellElement.className = `cell ${cell.type}-cell`;
        cellElement.dataset.index = cell.index;

        if (cell.type === 'start'){
            cellElement.textContent = '起点';
        }else if(cell.type === 'end'){
            cellElement.textContent = '终点';
        }else if (cell.type === 'event') {
            cellElement.textContent = '事件格';
            cellElement.style.fontSize = '10px'; // 小字体显示
        } else if (cell.type === 'special') {
            cellElement.textContent = '幸运格';
            cellElement.style.fontSize = '10px';
        }else{
            cellElement.textContent = cell.index + 1;
        }
        boardContainer.appendChild(cellElement);
    });
    placePlayers();
}


function placePlayers() {
    gameState.players.forEach(player => {
        const cell = document.querySelector(`.cell[data-index="${player.position}"]`);
        if (cell) {
            // 清除该格子的已有棋子
            const existing = cell.querySelector('.player');
            if (existing) existing.remove();
            
            const playerElement = document.createElement('div');
            playerElement.className = `player player${player.id}`;
            playerElement.textContent = player.icon;
            playerElement.title = player.name;
            playerElement.style.backgroundColor = player.color;
            cell.appendChild(playerElement);
        }
    });
}


function rollDice(){
    if (!gameState.gameStarted){
        gameState.gameStarted = true;
        const startTime= Date.now();
    }
    const rollBtn = document.getElementById('roll-btn');
    rollBtn.disabled = true;
    const diceResult = document.getElementById('dice-result');
    let rolls = 0;
    const rollInterval = setInterval(()=>{
        const randomValue = Math.floor(Math.random()*6)+1;
        diceResult.textContent = getDiceFace(randomValue);
        rolls++;

        if (rolls>10){
            clearInterval(rollInterval);
            const finalValue = Math.floor(Math.random()*6)+1;
            diceResult.textContent = getDiceFace(finalValue);
            movePlayer(finalValue);
            rollBtn.disabled = false;
        }
    },100);
}


function getDiceFace(value){
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
}


function movePlayer(steps){

    const player = gameState.players[gameState.currentPlayer];
    const newPosition = player.position +steps;
    const maxPosition = gameState.gameBoard.length - 1;
    if(newPosition>maxPosition){
        player.position = maxPosition - (newPosition - maxPosition);
    }else {
        player.position = newPosition;
    }
    document.getElementById(`player${player.id}-pos`).textContent = `${player.position+1}`;
    applyCellEffect(player.position);
    renderBoard();
    if (player.position === gameState.gameBoard.length - 1){
        endGame();
        return;
    }
    setTimeout(()=>{
        document.querySelectorAll('.player-info').forEach(el => el.classList.remove('active'));
        gameState.currentPlayer = (gameState.currentPlayer+1) % gameState.players.length;
        document.getElementById(`player${gameState.currentPlayer + 1}-info`).classList.add('active');
        const currentPlayer = gameState.players[gameState.currentPlayer];
        displayEvent(`${currentPlayer.name}的回合，准备掷骰子`);
    },1500);
}


function applyCellEffect(position){
    const cell = gameState.gameBoard[position];
    const player = gameState.players[gameState.currentPlayer];
    switch(cell.type){
        case "special":
            const bonus = Math.floor(Math.random()*3)+1;
            displayEvent(`${player.name}遇到了幸运格子，前进${bonus}步！`);
            Modal.show(`${player.name}遇到了幸运格子，前进${bonus}步！`,()=>{
                movePlayer(bonus);
            });
            break;
        case "event":
            const eventIndex = Math.floor(Math.random() * gameState.specialEvents.length);
            const event = gameState.specialEvents[eventIndex];
            Modal.show(`${player.name}触发事件：[${event}]`,()=>{
                                if (event.includes("前进")) {
                    const steps = parseInt(event.match(/前进(\d+)格/)[1]);
                    movePlayer(steps);
                } else if (event.includes("停留")) {
                    endTurn(true); // 跳过当前回合
                } else if (event.includes("额外一次")) {
                    rollDice(); // 立即触发掷骰子
                } else {
                    endTurn(); // 正常结束回合
                }
            });
            break;
    }
}


function displayEvent(message) {
    const eventLog = document.getElementById('event-log');
    eventLog.innerHTML = `<div class="event-message">💌 ${message}</div>`;
}

function endGame() {
    clearInterval(gameState.timerInterval);
    const winner = gameState.players.find(p => p.position === gameState.gameBoard.length - 1);
    displayEvent(`🏆 ${winner.name}抵达终点！爱情胜利！`);
    document.getElementById('roll-btn').disabled = true;
    const gameBoard = document.querySelector('.game-board');
    gameBoard.innerHTML = `<div class="game-over">
        <h2>🎉 游戏结束 🎉</h2>
        <p>${winner.name}赢得胜利！</p >
        <button id="restart-btn">重新开始</button>
    </div>`;
    gameState.gameOver = true;
        document.getElementById('restart-btn').onclick = () => {
        location.reload();  // 简单重新加载页面
    };
}
document.addEventListener('DOMContentLoaded',function(){
    gameState.gameBoard = initBoard();
    renderBoard();
});