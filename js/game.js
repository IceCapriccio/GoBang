debugMode = 1;

// 用来标志一次拖拽时间的起始坐标、中间拖拽坐标、最后一次有效的（能落子）坐标
stX = -1;
stY = -1;
curX = -1;
curY = -1;
lastValidX = -1;
lastValidY = -1;
// 方向数组
dirx = [0, -1, -1, -1];
diry = [-1, 1, 0, -1];

// 各列占百分比
blankX = 0.04;
blankY = 0.015;
column = 0.0644;
row = 0.0637;

// 调试 bug 用
function showBoard(board) {
    s = ''
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            if (board[j][i] == -1)
                s += '*';
            else if (board[j][i] == 0)
                s += 'W';
            else if (board[j][i]  == 1)
                s += 'B';
        }
        s += '\n';
    }
    console.log(s);
}

/*  落子函数
* :x: 棋子在棋盘中从上数第几行 (0 <= x <= 14)
* :y: 棋子在棋盘中从左数第几列 (0 <= y <= 14)
* 只负责 UI 部分，游戏的逻辑部分不涉及
*/
function addPieces(color, coordinate, opacity) {
    document.getElementById('board').style.height = imageW;
    document.getElementById('board').style.width = imageW;

    var x = coordinate[0], y = coordinate[1];
    var img = document.createElement('img');
    img.src = './images/' + (color === 'B' ? 'black.png' : 'white.png');
    img.style.position = 'fixed';
    img.style.left = ((blankX + column * x) * imageW) + 'px';
    img.style.top = ((blankY + row * y) * imageH) + 'px';
    img.style.width = '17px';
    img.style.height = '17px';
    img.style.opacity = opacity;
    img.id = color === 'B' ? 'tmp' : '';
    img.x = x;
    img.y = y;
    img.coordinate = coordinate;
    if (opacity === 1)
        img.className = 'piece';
    document.getElementById('game').appendChild(img);
    return img;
}

// 从像素的坐标转化成棋盘上的坐标
function convert(x, y) {
    var xx = Math.floor(x / imageW / column);
    var yy = Math.floor(y / imageH / row);
    return [xx, yy];
}

// Game 类需要用到的三个函数
function touchstart(e){
    stx.innerHTML = e.changedTouches[0].pageX;
    sty.innerHTML = e.changedTouches[0].pageY;
    stX = e.changedTouches[0].pageX;
    stY = e.changedTouches[0].pageY - 50;
    var coordinate = convert(stX, stY);
    if (game.get(coordinate) !== -1)
        return;
    lastValidX = stX;
    lastValidY = stY;
    img = addPieces('B', coordinate, 0.5);
}
function touchmove(e) {
    x.innerHTML = e.changedTouches[0].pageX;
    y.innerHTML = e.changedTouches[0].pageY;
    curX = e.changedTouches[0].pageX;
    curY = e.changedTouches[0].pageY - 50;
    var coordinate = convert(curX, curY);
    if (img.coordinate !== coordinate && game.get(coordinate) === -1) {
        lastValidX = curX;
        lastValidY = curY;
        img.coordinate = coordinate;
        if (document.getElementById('tmp'))
            document.getElementById('game').removeChild(document.getElementById('tmp'));
        addPieces('B', img.coordinate, 0.5);
    }
}
function touchend(e) {
    endx.innerHTML = e.changedTouches[0].pageX;
    endy.innerHTML = e.changedTouches[0].pageY;
    endX = e.changedTouches[0].pageX;
    endY = e.changedTouches[0].pageY - 70;
    var tmp = document.getElementById('tmp');
    if (tmp == null) {
        console.log('没有找到 #tmp');
        return;
    }
    tmp.style.opacity = 1;
    tmp.id = '';
    tmp.className = 'piece';

    var coordinate = convert(lastValidX, lastValidY);
    if (game.get(coordinate) != -1) {
        console.log('所移动位置有棋子');
        return;
    }
    game.board[coordinate[0]][coordinate[1]] = 1;
    var result = game.judge(); // 下完子判断是否连成 5 子
    var dic = ['not end', 'AI', 'Player'];
    document.getElementById('result').innerHTML = dic[result + 1];
    if (result !== -1) {
        console.log('游戏结束');
        game.winner = result;
        game.gameover(1);
        return; // 分出胜负则退出游戏
    }
    game.curPlayer = 'W';
    game.robotPlay();
    game.last = coordinate;
}

// 游戏逻辑类
function Game() {
    // 玩家为黑棋，AI 为白棋
    this.curPlayer = 'B'; // 黑棋先手
    this.robot = new Robot();

    /*
    关于 board 二维数组，约定：
    -1 为空， 0 为白棋， 1 为黑棋
     */
    this.board = new Array(15);
    for (var i = 0; i < 15; i++) {
        this.board[i] = new Array(15);
        for (var j = 0; j < 15; j++)
            this.board[i][j] = -1;
    }

    // 获取一个坐标上落子的情况
    this.get = function (coordinate) {
        return this.board[coordinate[0]][coordinate[1]];
    }

    this.clear = function () {
        // 清空逻辑上的二维数组
        for (var i = 0; i < 15; i++)
            for (var j = 0; j < 15; j++)
                this.board[i][j] = -1;

        // 清除 UI 上的所有棋子
        var pieces = document.getElementsByClassName('piece');
        var gameDiv = document.getElementById('game');
        for (i = pieces.length - 1; i >= 0; i--) {
            gameDiv.removeChild(pieces[i]);
        }
    }

    /*       用于调试坐标的 js 代码       */
	var stx = document.getElementById('stx');
	var sty = document.getElementById('sty');
	var x = document.getElementById('x');
	var y = document.getElementById('y');
	var endx = document.getElementById('endx');
	var endy = document.getElementById('endy');
	var img;

	window.addEventListener('touchstart', touchstart);
	window.addEventListener('touchmove', touchmove);
	window.addEventListener('touchend', touchend);

    // 机器人落子
    this.robotPlay = function () {
        // 由 Robot 类计算出当前棋盘状况最优的落子点及获得的分数
        var info = this.robot.play(this.board);
        var x = info[0], y = info[1], score = info[2];
        addPieces(this.curPlayer, [x, y], 1);
        this.board[x][y] = 0;
        this.curPlayer = 'B';
        this.last = [x, y];

        console.log('第' + ccc++ + '次落子');
        showBoard(this.board);

        var result = this.judge();
        var dic = ['not end', 'AI', 'Player'];
        document.getElementById('result').innerHTML = dic[result + 1];
        if (result !== -1) {
            this.winner = result;
            this.gameover(0);
        }
    }

    // 判断游戏是否结束
    // 如果结束，则返回棋子黑白色对应的数字（0 或 1）,如果未结束，则返回 -1
    this.judge = function () {
        var x, y = this.last;
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                for (var k = 0; k < 4; k++) {
                    var flag = true;
                    for (var l = 1; l < 5; l++) {
                        var unvalid = x => (x >= 0 && x <= 14) ? false : true;
                        if (unvalid(i + l * dirx[k]) || unvalid(j + l * diry[k]) || (this.get([i, j]) === -1 || this.get([i + l * dirx[k], j + l * diry[k]]) != this.get([i, j]))) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        return this.get(this.last);
                    }
                }
            }
        }
        return -1;
    }

    this.gameover = function (winner) {
        if (winner == 1)
            mui.alert('恭喜你打败了我的 贝塔Go~！');
        else
            mui.alert('输了吧小辣鸡~');
        window.removeEventListener('touchstart', touchstart);
        window.removeEventListener('touchmove', touchmove);
        window.removeEventListener('touchend', touchend);
    }

    this.restart = function () {
        game.clear();
        window.addEventListener('touchstart', touchstart);
        window.addEventListener('touchmove', touchmove);
        window.addEventListener('touchend', touchend);
    }
}

ccc = 0;

// AI 类
function Robot() {
    this.win = new Array(15);
    for (var i = 0; i < 15; i++) {
        this.win[i] = new Array(15);
        for (var j = 0; j < 15; j++) {
            this.win[i][j] = new Array(15);
        }
    }

    var cnt = 0;
    for (i = 0; i < 15; i++) {
        for (j = 0; j < 15; j++) {
            for (var k = 0; k < 4; k++) {
                if (i + dirx[k] * 4 > 14 || i + dirx[k] * 4 < 0 || j + diry[k] * 4 < 0 || j + diry[k] * 4 > 14) {
                    continue;
                }
                for (var l = 0; l < 5; l++) {
                    this.win[i + dirx[k] * l][j + diry[k] * l][cnt] = true;
                }
                cnt++;
            }
        }
    }

    // 输入棋盘情况，输出落子位置
    // Robot 是白子 -- 0
    this.play = function (board) {
        var cnt = 0;
        var AI = new Array(572), player = new Array(572);
        for (i = 0; i < 572; i++) {
            AI[i] = player[i] = 0;
        }
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                for (var k = 0; k < 4; k++) {
                    if (i + dirx[k] * 4 > 14 || i + dirx[k] * 4 < 0 || j + diry[k] * 4 < 0 || j + diry[k] * 4 > 14) {
                        AI[cnt] = player[cnt] = 0;
                        continue;
                    }
                    for (var l = 0; l < 5; l++) {
                        // 计算每种赢法的 5 个位置上黑白子各有几个，存到 player 和AI 数组中
                        if (board[i + dirx[k] * l][j + diry[k] * l] === 1) {// 黑子，玩家赢法棋子数量 + 1
                            player[cnt]++;
                        }
                        if (board[i + dirx[k] * l][j + diry[k] * l] === 0) { // 白子，机器人赢法棋子数量 + 1
                            AI[cnt]++;
                        }
                    }
                    if (player[cnt] && AI[cnt])
                        player[cnt] = AI[cnt] = 0;
                    cnt++;
                }
            }
        }

        var score = new Array(15);
        for (i = 0; i < 15; i++) {
            score[i] = new Array(15);
            for (j = 0; j < 15; j++)
                score[i][j] = 0;
        }
        for (i = 0; i < 15; i++) {
            for (j = 0; j < 15; j++) {
                if (board[i][j] == -1) { // 这里没有棋子
                    for (k = 0; k < 572; k++) {
                        if (this.win[i][j][k]) {
                            switch (player[k]) {
                                case 1:
                                    score[i][j] += 6;
                                    break;
                                case 2:
                                    score[i][j] += 52;
                                    break;
                                case 3:
                                    score[i][j] += 130;
                                    break;
                                case 4:
                                    score[i][j] += 400;
                                    break;
                            }
                            switch (AI[k]) {
                                case 1:
                                    score[i][j] += 5;
                                    break;
                                case 2:
                                    score[i][j] += 50;
                                    break;
                                case 3:
                                    score[i][j] += 180;
                                    break;
                                case 4:
                                    score[i][j] += 10000;
                                    break;
                            }
                        }
                    }
                }
            }
        }
        var maxScore = -1, x = -1, y = -1;
        for (i = 0; i < 15; i++)
            for (j = 0; j < 15; j++)
                if (score[i][j] > maxScore) {
                    maxScore = score[i][j];
                    x = i;
                    y = j;
                }
        return [x, y, maxScore];
    }
}

new Robot();

window.onload = function() {
	game = new Game();
    imageW = document.getElementById('board').width;
    imageH = document.getElementById('board').height;
    if (!debugMode) {
        var debugDOMs = document.getElementsByClassName('debug');
        for (var i = 0; i < debugDOMs.length; i++) {
            debugDOMs[i].style.visibility = 'hidden';
        }
    }
}

