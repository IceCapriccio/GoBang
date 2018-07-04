// 用来标志一次拖拽时间的起始坐标、中间拖拽坐标、拖拽离开坐标
stX = -1;
stY = -1;
curX = -1;
curY = -1;
endX = -1;
endY = -1;

// 各列占百分比
blankX = 0.04;
blankY = 0.015;
column = 0.0644;
row = 0.0637;

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
    document.getElementById('game').appendChild(img);
    return img;
}

// 从像素的坐标转化成棋盘上的坐标
function convert(x, y) {
    var xx = Math.floor(x / imageW / column);
    var yy = Math.floor(y / imageH / row);
    return [xx, yy];
}

// 游戏逻辑类
function Game() {
    // 玩家为黑棋，AI 为白棋
    this.curPlayer = 'B'; // 黑棋先手

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
    // 落子
    this.robotPlay = function () {
        // 傻子 AI ，待修改
        var x = -1, y = -1;
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++)
                if (this.board[i][j] == -1) {
                    x = i;
                    y = j;
                    break;
                }
                if (x !== -1)
                    break;
        }
        addPieces(this.curPlayer, [x, y], 1);
        this.board[x][y] = 0;
        this.curPlayer = 'B';
        console.log(this.board);
    }

    this.get = function (coordinate) {
        return this.board[coordinate[0]][coordinate[1]];
    }
}

window.onload = function() {
	var game = new Game();

    imageW = document.getElementById('board').width;
    imageH = document.getElementById('board').height;

	/*       用于调试坐标的 js 代码       */
	var stx = document.getElementById('stx');
	var sty = document.getElementById('sty');
	var x = document.getElementById('x');
	var y = document.getElementById('y');
	var endx = document.getElementById('endx');
	var endy = document.getElementById('endy');
	var img;
	window.addEventListener('touchstart', function(e){
		stx.innerHTML = e.changedTouches[0].pageX;
		sty.innerHTML = e.changedTouches[0].pageY;
		stX = e.changedTouches[0].pageX;
		stY = e.changedTouches[0].pageY - 50;
		var coordinate = convert(stX, stY);
		if (game.get(coordinate) !== -1)
		    return;
		img = addPieces('B', coordinate, 0.5);
	});
	window.addEventListener('touchmove', function(e) {
		x.innerHTML = e.changedTouches[0].pageX;
		y.innerHTML = e.changedTouches[0].pageY;
		curX = e.changedTouches[0].pageX;
		curY = e.changedTouches[0].pageY - 50;
        var coordinate = convert(curX, curY);
        if (img.coordinate != coordinate && game.get(coordinate) === -1) {
            img.coordinate = coordinate;
            document.getElementById('game').removeChild(document.getElementById('tmp'));
            addPieces('B', img.coordinate, 0.5);
        }
	});
	window.addEventListener('touchend', function(e) {
		endx.innerHTML = e.changedTouches[0].pageX;
		endy.innerHTML = e.changedTouches[0].pageY;
		endX = e.changedTouches[0].pageX;
		endY = e.changedTouches[0].pageY - 50;
		var tmp = document.getElementById('tmp');
		if (tmp == null)
		    return;
		tmp.style.opacity = 1;
		tmp.id = '';

		var coordinate = convert(endX, endY);
		if (game.get(coordinate) != -1)
		    return;
        game.board[coordinate[0]][coordinate[1]] = 1;
        game.curPlayer = 'W';
        console.log(game.board);
        game.robotPlay();
	});
}

