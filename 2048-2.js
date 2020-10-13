let byId = function (selector) {
  return document.getElementById(selector);
};

class Game {
  constructor(selector) {
    this.content = byId("content"); // 数字块容器
    this.currentScore = byId("currentScore"); // 当前得分
    this.maxNum = byId("maxNum"); // 最大数字
    this.reset = byId("reset"); // 重置
    this.tip = byId("tip"); // 游戏结束提示信息

    this.arrList = []; // 数字块数组
    this.isFull = false; // 标记格子空间是否被填满，默认false 未填满，空间充足
    this.colorObj = {
      // 数字颜色值
      "": ["rgb(205,193,170)", ""],
      2: ["rgb(238,228,218)", "rgb(119,110,101)"],
      4: ["rgb(237,224,200)", "rgb(119,110,101)"],
      8: ["rgb(242,177,121)", "rgb(249.246.242)"],
      16: ["rgb(246,149,99)", "rgb(249.246.242)"],
      32: ["rgb(246,124,95)", "rgb(249.246.242)"],
      64: ["rgb(246,94,59)", "rgb(249.246.242)"],
      128: ["rgb(237,207,114)", "rgb(249.246.242)"],
      256: ["rgb(237,200,96)", "rgb(249.246.242)"],
      512: ["green", "rgb(249.246.242)"],
      1024: ["pink", "rgb(249.246.242)"],
      2048: ["orange", "rgb(249.246.242)"],
    };
    this.count = 0; // 总分

    // 移动端变量
    this.startX = 0;
    this.startY = 0;
    this.d_code; // 方向码
  }

  // 第一阶段  初始化
  init() {
    this.createNumberBlock();
    const divs = this.content.querySelectorAll("div"); // 获取所有数字块
    this.arrList = Array.prototype.slice.call(divs); // 转换数字块为纯数组
    // 随机生成两个数字
    this.createNum();
    this.createNum();
    this.bindEvent();
  }
  // 生成数字块
  createNumberBlock() {
    let frag = document.createDocumentFragment();
    for (let i = 0; i < 16; i++) {
      const div = document.createElement("div");
      div.className = "item";
      frag.appendChild(div);
    }
    this.content.appendChild(frag);
  }
  // 随机生成数字
  createNum() {
    const random = Math.floor(Math.random() * 16);
    let numBlock = this.arrList[random];
    // 检查当前数字块的数字；没有数字，则赋值；否则重新选择数字块
    if (numBlock.innerHTML === "") {
      numBlock.innerHTML = "2";
      numBlock.style.background = "rgb(238,228,218)";
      numBlock.style.color = "rgb(119,110,101)";
    } else {
      this.createNum();
    }
  }
  // 第二阶段 绑定事件
  bindEvent() {
    let _this = this;
    // 键盘事件
    document.addEventListener("keydown", function (e) {
      // 判断是否填满数字，如果填满了，将不能再触发变化的操作。
      if (_this.isFull) {
        return;
      }
      _this.removeByDirection(e.keyCode);
    });
    // 移动端事件
    this.mobileEvent();
    // 重置游戏
    this.reset.onclick = () => {
      this.handleReset();
    };
  }

  // 通过按键方向，控制数字块移动  --  分组变化
  removeByDirection(numCode) {
    switch (numCode) {
      case 37: // console.log("左");
        this.run([0, 1, 2, 3]);
        this.run([4, 5, 6, 7]);
        this.run([8, 9, 10, 11]);
        this.run([12, 13, 14, 15]);
        this.maxScore();
        this.showBackgroundColor();
        this.gameOver();
        break;
      case 38: // console.log("上");
        this.run([0, 4, 8, 12]);
        this.run([1, 5, 9, 13]);
        this.run([2, 6, 10, 14]);
        this.run([3, 7, 11, 15]);
        this.maxScore();
        this.showBackgroundColor();
        this.gameOver();
        break;
      case 39: // console.log("右");
        this.run([3, 2, 1, 0]);
        this.run([7, 6, 5, 4]);
        this.run([11, 10, 9, 8]);
        this.run([15, 14, 13, 12]);
        this.maxScore();
        this.showBackgroundColor();
        this.gameOver();
        break;
      case 40: // console.log("下");
        this.run([12, 8, 4, 0]);
        this.run([13, 9, 5, 1]);
        this.run([14, 10, 6, 2]);
        this.run([15, 11, 7, 3]);
        this.maxScore();
        this.showBackgroundColor();
        this.gameOver();
        break;
    }
  }
  // 根据传入的每组数字，返回变化后的新数字
  run(arr) {
    // 获取数字块的数字，并将其作为数组参数传给handle2048，由它操作具体变化,返回变化
    const newNumList = this.handleChange2048([
      Number(this.arrList[arr[0]].innerHTML),
      Number(this.arrList[arr[1]].innerHTML),
      Number(this.arrList[arr[2]].innerHTML),
      Number(this.arrList[arr[3]].innerHTML),
    ]);
    // 将返回的数字，按位置填入，并设置背景色。
    for (let i = 0; i < newNumList.length; i++) {
      this.arrList[arr[i]].innerHTML = newNumList[i];
    }
  }
  /**
   * 处理数字变化。
   * [0,2,0,2]=>[4,0,0,0]
   * [2,2,2,2]=>[4,4,0,0]
   * [4,0,2,2]=>[4,4,0,0]
   * 0 代表空
   */
  handleChange2048(arr) {
    let newNumList = []; // 只要数字
    // 比较arr各项的值，从第0项开始
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== 0) {
        // 判断当前位置以后的空值情况,直到不为空的j值
        for (var j = i + 1; j < arr.length; j++) {
          if (arr[j] !== 0) {
            break;
          }
        }
        // 当前值与后面不为空的比较，若相等，乘以二倍放入newNumList，跳
        if (arr[i] === arr[j]) {
          // 合并，计算得分
          newNumList.push(arr[i] * 2);
          this.myScore(arr[i]);
          i = j++; // i 值转到合并数字的下一项
        } else {
          newNumList.push(arr[i]);
        }
      }
    }
    // 填充长度
    while (newNumList.length < 4) {
      newNumList.push("");
    }
    return newNumList;
  }
  // 获取最大分数
  maxScore() {
    let arrScore = this.arrList.map((item) => {
      return Number(item.innerHTML);
    });
    const s = Math.max.apply(null, arrScore);

    this.maxNum.innerHTML = s;
    if(s===2048){
      this.tip.innerHTML = "恭喜你，到达2048";
      this.isFull=true;
    }
  }
  // 总分
  myScore(num) {
    this.count += num;
    this.currentScore.innerHTML = this.count + "分";
  }
  // 显示背景色
  showBackgroundColor() {
    this.arrList.forEach((item) => {
      let key = item.innerHTML;
      item.style.background = this.colorObj[key][0];
      item.style.color = this.colorObj[key][1];
    });
  }
  // 判断是否结束游戏；未结束则增加新的数字块
  gameOver() {
    this.isFull = this.arrList.every((item) => {
      return Number(item.innerHTML) > 0;
    });
    if (this.isFull) {
      this.tip.innerHTML = "空间已满，游戏结束";
      return;
    }
    // 游戏未结束，则继续创建数字块
    this.createNum();
  }
  // 移动端  模拟获取方向
  mobileEvent() {
    let _this=this;
    this.content.addEventListener("touchstart", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (_this.isFull) {
        return;
      }
      _this.startX = e.changedTouches[0].clientX;
      _this.startY = e.changedTouches[0].clientY;
    });

    this.content.addEventListener("touchend", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (_this.isFull) {
        return;
      }
      let endX = e.changedTouches[0].clientX;
      let endY = e.changedTouches[0].clientY;
      // 计算x轴，y轴的差值
      const _X = endX - _this.startX;
      const _Y = endY - _this.startY;
      // 比较数值，得出方向
      if (Math.abs(_X) > Math.abs(_Y)) {
        // 左右方向
        _this.d_code = _X > 0 ? 39 : 37;
      } else {
        // 上下方向
        _this.d_code = _Y > 0 ? 40 : 38;
      }
      // 按数字码，选择方向
      _this.removeByDirection(_this.d_code);
    });
  }

  // 重置
  handleReset() {
    this.arrList.forEach((item) => {
      // 清空数字
      if (item.innerHTML) {
        item.innerHTML = "";
        item.style.background = "rgb(205,193,170)";
      }
    });
    this.count = 0;
    this.currentScore.innerHTML = "0分";
    this.maxNum.innerHTML = "2";
    this.tip.innerHTML = "";
    this.createNum();
    this.createNum();
  }
}

const game = new Game();
game.init();
