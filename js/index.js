var curVersion = '1.0.1', lastestVersion = undefined;
var debugMode = 0;
$(document).ready(function () {
    if (!debugMode) {
        var debugDOMs = document.getElementsByClassName('debug');
        for (var i = 0; i < debugDOMs.length; i++) {
            debugDOMs[i].style.visibility = 'hidden';
        }
    }

    // 检查版本是否需要更新
    $.ajax({
        url: 'http://140.143.195.81/GoBang/version.php',
        type: 'GET',
        dataType: 'jsonp',
        success: function (data) {
            lastestVersion = data['version'];
            console.log('最新版本:', lastestVersion);
            console.log('当前版本:', curVersion);
            if (curVersion !== lastestVersion) {
                var download = confirm('发现新版本，是否下载？');
                if (download)
                    window.location.href = 'http://140.143.195.81/GoBang/GoBang.apk';
            }
        }
    });

})
 