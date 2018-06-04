//(function() {

/*
var socket = io.connect('http://www.jcreative.co.kr:1313');
socket.on('chat', function (data) {
	console.log("app : " + data.msg.msgr + " / cmd : " + data.msg.msg);
   // if(data.msg.msgr == "webt"){
		if(data.msg.msg == "start"){
			gameStart();
		}else if(data.msg.msg == "next"){
			_actionRight();
		}else if(data.msg.msg == "prev"){
			_actionLeft();
		}else if(data.msg.msg == "action"){
			_actionUp();
		}else if(data.msg.msg == "down"){
			_actionDown();
		}else if(data.msg.msg == "space"){
			_actionSpace();
		}else if(data.msg.msg == "pause"){
			gamePause();
		}
  //  }
});
*/

	var areaWidth= 12; 			// 영역 너비 

	var areaHeight = 25;			// 영역 높이 



	var areaSQURE = areaWidth*areaHeight;	// 높이*너비



	DOWN = 10;				// 안쓰임

	LEFT = -1;				// ←키를 눌렀을때 내려가는 정도 (-1 : 좌로한칸)

	RIGHT = 1;				// →키를 눌렀을때 내려가는 정도 (1 : 우로한칸)



	KEY_ENTER = 13;

	KEY_SHIFT = 16;		// save

	KEY_RIGHT = 39;		// →키 keyCode	우측이동

	KEY_LEFT = 37;		// ←키 keyCode	좌측이동

	KEY_DOWN = 40;		// ↓키 keyCode	내리기

	KEY_UP = 38;		// ↑키 keyCode	변환

	KEY_RESTART = 116;	// F5키 일시정지/재시작

	KEY_SPACE = 32;		// SPACE키 한번에 내리기

	KEY_CONTROL = 17;



	PATTERN1 = 0;	// └┐		

	PATTERN2 = 1;	//  ┌┘

	PATTERN3 = 2;	// ㅁ

	PATTERN4 = 3;	// ┐

	PATTERN5 = 4;	//  ┌

	PATTERN6 = 5;	// ㅣ

	PATTERN7 = 6;	// ㅗ

	// event pattern

	PATTERN8 = 7;	// .



	var somePTN = '';

	var special_block = 0;



	BLOCK_PATTERN1 = [-26, -16, -15, -5];	

	BLOCK_PATTERN2 = [-25, -16, -15, -6];

	BLOCK_PATTERN3 = [-16, -15, -6, -5];

	BLOCK_PATTERN4 = [-26, -25, -15, -5];

	BLOCK_PATTERN5 = [-25, -26, -16, -6];

	BLOCK_PATTERN6 = [-26, -36, -16, -6];

	BLOCK_PATTERN7 = [-15, -5,  -6, -4];

	// event block

	BLOCK_PATTERN8 = [-15, -15,  -15, -15];



	BLOCK_ARRAY = [BLOCK_PATTERN1,BLOCK_PATTERN2,BLOCK_PATTERN3,BLOCK_PATTERN4,BLOCK_PATTERN5,BLOCK_PATTERN6,BLOCK_PATTERN7,BLOCK_PATTERN8 ];

	BLOCK_COLOR_ARRAY = ["green", "pink", "blue", "silver", "skyblue","red","orange","black"];

	BLOCK_COLOR = "green";

	GV_blockPatternNow = 0;		// 현재 블럭패턴

	GV_blockPatternNext = 0;		// 다음 블럭패턴

	GV_blockPatternSave = 0; 		// 블럭 임시 저장

	GV_direction = false;					// 방향성 (ㅁ : false , other : true)

	GV_level = 150;			// 속도

	GV_scoreTotal = 0;			// 점수 

	GV_position1Now = 0;		// 형태1

	GV_position2Now = 0;		// 형태2

	GV_position3Now = 0;		// 형태3

	GV_position4Now = 0;		// 형태4



	GV_position5Now = 0;		// 형태5 event 블럭 포지션



	var GV_blockStorage = new Array();	// 영역 

	GV_timeID = "";			

	GV_STARTSIGN = false;		// 진행:true 정지:false

	GV_CHANGE_ABLE = false;



	document.onkeydown = action;	// 키가 눌렸을때 동작



	// start

	function gameStartLev(lev, ptn, width, height){	

		areaHeight = height;

		areaWidth = width;		

		somePTN = ptn;
/*
		switch(lev){

			case 1: alert('아득하다...');

			break;

			case 2: alert('ㅋ');

			break;

			case 3: alert('끝날거 같죠? 안끝나요..');

			break;

			case 4: alert('끝인거 같죠? .........');

			break;

			case 5: alert('자동? .........');

			break;

		}
*/
		
		var myNode = document.getElementById("body");
                myNode.innerHTML = '';

		
		gameStart();

	}





	// start

	function gameStart(){



		_drawBlockBody();	



		GV_blockStorage = new Array();

		GV_blockStorage[0] = true;



		// 영역 생성

		for(var i=-areaWidth*4; i<areaWidth*areaHeight ; i++){				

			if((i%areaWidth)==0){					

				GV_blockStorage[i] = true;

			}else if(i>=(areaWidth*areaHeight - areaWidth)){			

				GV_blockStorage[i] = true;

			}else{

				GV_blockStorage[i] = false;

			}

		}

		GV_blockPatternNow = generatePatternNum();	// 현재 블럭 패턴 생성

		GV_blockPatternNext = generatePatternNum();	// 다음 블럭 패턴 생성

		_showDisplay(GV_blockPatternNow);		// 현재 블럭 표시

		_generateBlock();

		//var sign = confirm("근무나 서시죠?");

		//if(sign) 

		runGame();

	}



	//pause

	function gamePause(){

		GV_STARTSIGN = false;

		clearTimeout(GV_timeID);

	}



	//restart

	function reStart(){

		if(!GV_STARTSIGN) {

			runGame();

		}

	}



	//drawBlockBody

	function _drawBlockBody(){	

		drawBlockBody("body",areaHeight-1,areaWidth-1,"p");	

	}



	//rungame

	function runGame(){



		GV_STARTSIGN = true;			//내리는중

		_showDisplay(GV_blockPatternNext);	//다음 블럭 표시 



		if(_endCheck()){			//죽엇으면

			_drawBlock();			//마저 그리고

			alert("end");			//끗

			delete GV_blockStorage;

			var gameover = document.getElementById("mainview");

			var tbl= document.getElementById("body");

		

			//_deleteBlockBody();

			//	

			gameover.removeChild(tbl);

		

			return;			

		}

		if(_downCollisionCheck()){			//더 내려가면 안될경우 
			_decisionBlock();			//

			var score = _blockSuccesCheck();		//점수계산

			GV_scoreTotal = GV_scoreTotal + score;		//점수종합

			_setLevel();					//속도지정

			GV_blockPatternNow = GV_blockPatternNext;

			GV_blockPatternNext = generatePatternNum();

			_generateBlock();

			GV_timeID = setTimeout("runGame()",GV_level);

			GV_CHANGE_ABLE = true;

			return;

		}

		_eraseBlock();		//지우고 

		_blockMoveDown();	//내리고

		_drawBlock();		//그리고



		var score = document.getElementById("score");

		var sb = document.getElementById("special");

		score.innerHTML = "<span>SCORE="+GV_scoreTotal+"</span>";	//점수갱신

		sb.innerHTML = "<span>Special Block =" + special_block +"</span>"; 

		GV_timeID = setTimeout("runGame()", GV_level);		//내리고

	}



	//set level

	function _setLevel() {			// 속도 지정 

		switch (GV_scoreTotal){	



			default : 

				GV_level = 400;	// 속도

				special_block  = 10;

				break;

		/*

			case areaWidth*10:		// 점수

				special_block += 1;

				GV_level = 120;	// 속도

			break;

			case areaWidth*20:

				special_block += 2;

				GV_level = 100;

			break;

			case areaWidth*30:

				special_block += 3;

				GV_level = 80;

			break;

			case areaWidth*40:

				special_block += 4;

				GV_level = 60;

			break;

			case areaWidth*50:

				special_block += 5;

				GV_level = 50;

			break;

			case areaWidth*60:

				special_block += 6;

				GV_level = 40;

			break;

			case areaWidth*70:

				special_block += 7;

				GV_level = 30;

			break;

			case areaWidth*80:

				special_block += 8;

				GV_level = 20;

			break;

			case areaWidth*90:

				special_block += 9;

				GV_level = 10;

			break;

			case areaWidth*100:

				special_block += 10;

				GV_level = 5;

			break;

		*/

			

		}

	}

	//_showDisplay

	function _showDisplay(pattern){

		var block = BLOCK_ARRAY[pattern];



		var block1 = block[0];

		var block2 = block[1];

		var block3 = block[2];

		var block4 = block[3];

		document.getElementById("dis36").style.backgroundColor="white";
		document.getElementById("dis35").style.backgroundColor="white";
		document.getElementById("dis34").style.backgroundColor="white";

		document.getElementById("dis26").style.backgroundColor="white";
		document.getElementById("dis25").style.backgroundColor="white";
		document.getElementById("dis24").style.backgroundColor="white";

		document.getElementById("dis16").style.backgroundColor="white";
		document.getElementById("dis15").style.backgroundColor="white";
		document.getElementById("dis14").style.backgroundColor="white";

		document.getElementById("dis6").style.backgroundColor="white";
		document.getElementById("dis5").style.backgroundColor="white";
		document.getElementById("dis4").style.backgroundColor="white";

		document.getElementById("dis"+Math.abs(block1)).style.backgroundColor = BLOCK_COLOR_ARRAY[pattern];
		document.getElementById("dis"+Math.abs(block2)).style.backgroundColor = BLOCK_COLOR_ARRAY[pattern];
		document.getElementById("dis"+Math.abs(block3)).style.backgroundColor = BLOCK_COLOR_ARRAY[pattern];
		document.getElementById("dis"+Math.abs(block4)).style.backgroundColor = BLOCK_COLOR_ARRAY[pattern];

	}

	//_showDisplay

	function _showDisplaySave(pattern){

		var block = BLOCK_ARRAY[pattern];



		var block1 = block[0];

		var block2 = block[1];

		var block3 = block[2];

		var block4 = block[3];



		document.getElementById("save36").style.backgroundColor="white";

		document.getElementById("save35").style.backgroundColor="white";

		document.getElementById("save34").style.backgroundColor="white";



		document.getElementById("save26").style.backgroundColor="white";

		document.getElementById("save25").style.backgroundColor="white";

		document.getElementById("save24").style.backgroundColor="white";



		document.getElementById("save16").style.backgroundColor="white";

		document.getElementById("save15").style.backgroundColor="white";

		document.getElementById("save14").style.backgroundColor="white";



		document.getElementById("save6").style.backgroundColor="white";

		document.getElementById("save5").style.backgroundColor="white";

		document.getElementById("save4").style.backgroundColor="white";

		

		if(pattern != 0){

			document.getElementById("save"+Math.abs(block1)).style.backgroundColor = BLOCK_COLOR_ARRAY[pattern];

			document.getElementById("save"+Math.abs(block2)).style.backgroundColor = BLOCK_COLOR_ARRAY[pattern];

			document.getElementById("save"+Math.abs(block3)).style.backgroundColor = BLOCK_COLOR_ARRAY[pattern];

			document.getElementById("save"+Math.abs(block4)).style.backgroundColor = BLOCK_COLOR_ARRAY[pattern];

		}

	}

	//_generateBlock()

	function _generateBlock(){

		var center = Math.floor(areaWidth/2)+1;



		var w4 = -areaWidth*4+center;

		var w3 = -areaWidth*3+center;

		var w2 = -areaWidth*2+center;

		var w1 = -areaWidth +center ;



		var block = BLOCK_ARRAY[GV_blockPatternNow];	// 현재 블럭생성

		

		switch(GV_blockPatternNow){	// 2번이 회전 기준	

			case 0:

				GV_position1Now = w3;		//1	

				GV_position2Now = w2+1;		//32

				GV_position3Now = w2;		//  4	

				GV_position4Now = w1+1;			

				break;

			case 1:

				GV_position1Now = w3;		//  1		

				GV_position2Now = w2;		//23	

				GV_position3Now = w2-1;	  	//4		

				GV_position4Now = w1-1;			

				break;

			case 2:

				GV_position1Now = w2;		//12	

				GV_position2Now = w2-1;		//34

				GV_position3Now = w3;			

				GV_position4Now = w3-1;			

				break;

			case 3:

				GV_position1Now = w3;			

				GV_position2Now = w2+1;     		//13		

				GV_position3Now = w3+1;		//  2		

				GV_position4Now = w1+1;		//  4		

				break;

			case 4:

				GV_position1Now = w3;		//13		

				GV_position2Now = w2-1;		//2

				GV_position3Now = w3-1;		//4	

				GV_position4Now = w1-1;		

				break;



			case 5:

				GV_position1Now = w1;		//1	

				GV_position2Now = w2;		//2 

				GV_position3Now = w3;		//3	

				GV_position4Now = w4;		//4	

				break;

			case 6:

				GV_position1Now = w2;		//  1		

				GV_position2Now = w1;		//324	

				GV_position3Now = w1+1;			

				GV_position4Now = w1-1;			

				break;

			case 7:

				GV_position1Now = w1;		//.	

				GV_position2Now = w1;		

				GV_position3Now = w1;			

				GV_position4Now = w1;			

				break;

			}	

	

		BLOCK_COLOR = BLOCK_COLOR_ARRAY[GV_blockPatternNow];	// 색상 지정

		GV_direction = false;

	}

	

	//action

	function action(evnt){

		var theEvent = evnt ? evnt : window.event;

		switch(theEvent.keyCode){



			case KEY_ENTER:

			_actionEnter();

			break;



			case KEY_CONTROL:

			_actionControl();

			break;



			case KEY_SHIFT:

			_actionShift();

			break;	



			case KEY_RIGHT:

			_actionRight();

			break;



			case KEY_LEFT:

			_actionLeft();

			break;		



			case KEY_DOWN:

			_actionDown();

			break;



			case KEY_UP:

			//gamePause();			

			_actionUp();

			break;



			case KEY_SPACE:

			_actionSpace();

			break;			



			case KEY_RESTART:

			GV_blockPatternNow = 7;

			theEvent.keyCode = 0;

			theEvent.returnValue=false;

			//alert("pause");

			break;

		}

	}

	//_actionEnter()

	function _actionEnter(){

		if(special_block == 0) return;

		special_block -= 1;

		_eraseBlock();	

		GV_blockPatternNow = 7;		//special_block

		_generateBlock();				//다음 블럭 생성

		_drawBlock();			

	}



	//_actionControl

	function _actionControl(){

		if(GV_blockPatternNow != 7) return;

		

		 _blockMoveFire();

		

	}



	// _actionShift

	function _actionShift(){

		if(GV_CHANGE_ABLE == false) return;



		if(GV_blockPatternSave  == 0){

			_eraseBlock();					//현재 블럭 지우고

			GV_blockPatternSave  = GV_blockPatternNow;	//저장하고

			_showDisplaySave(GV_blockPatternSave);		//저장 display

			GV_blockPatternNow = GV_blockPatternNext;	//다음 블럭 패턴 생성

			_generateBlock();				//다음 블럭 생성			

			_drawBlock();					//블럭 표시

			GV_CHANGE_ABLE = false;



		}else{

			_eraseBlock();

			GV_blockPatternNow = GV_blockPatternSave ;	//저장된 블럭 패턴

			GV_blockPatternSave = 0;			//저장된 블럭 패턴 초기화

			_showDisplaySave(GV_blockPatternSave);		//저장된 블럭 초기화

			GV_blockPatternNext = generatePatternNum();	//다음 블럭 패턴 생성

			_generateBlock();				//다음 블럭 생성

			_drawBlock();

			GV_CHANGE_ABLE = false;						

		}

		

	}

	// _actionUp

	function _actionUp(){	// 돌리기

		if(GV_blockPatternNow == PATTERN3) return;	// ㅁ 블럭은 그대로

		if(GV_position1Now < 0 || GV_position2Now <0  || GV_position3Now <0  || GV_position4Now < 0) return;

		if(_roteateCollisionCheck()) { 

			if(_rightCollisionCheck()){

				while(_roteateCollisionCheck())

					_actionLeft();			

			} else if(_leftCollisionCheck()){

				while(_roteateCollisionCheck())

					_actionRight();

			}else if(GV_blockPatternNow == 5){	// 긴놈은 제대로 안돌아가네??? 그래서 추가

				if(_collisionCheck(GV_position1Now+LEFT*2,GV_position2Now+LEFT*2,GV_position3Now+LEFT*2,GV_position4Now+LEFT*2))

					_actionRight();

				if(_collisionCheck(GV_position1Now+RIGHT*2,GV_position2Now+RIGHT*2,GV_position3Now+RIGHT*2,GV_position4Now+RIGHT*2))

					_actionLeft();			



			}else

				return;

			

			

		}

		_eraseBlock();

		_blockMoveRotation();

		_drawBlock();

	}



	// _actionDown

	function _actionDown(){

		if(_downCollisionCheck()) return;

		_eraseBlock();		//지우고

		_blockMoveDown();	//아래로

		_drawBlock();		//그린다

	}



	// _actionSpace

	function _actionSpace(){

		if(_downCollisionCheck()) return;

		_eraseBlock();		//지우고

		_blockMoveSpace();	//내리고

		_drawBlock();		//그린다

	}



	// _actionRight

	function _actionRight(){

		if(_rightCollisionCheck()) return;

		_eraseBlock();		//지우고

		_blockMoveRight();	//오른쪽

		_drawBlock();		//그린다

	}



	// _actionLeft

	function _actionLeft(){

		if(_leftCollisionCheck()) return;

		_eraseBlock();		//지우고

		_blockMoveLeft();	//왼쪽

		_drawBlock();		//그린다

	}





	//blockSuccess

	function _blockSuccesCheck(){

		return blockSuccesCheck(GV_blockStorage);

	}	//eraseBlock

	function _eraseBlock(){

		eraseBlock(GV_position1Now,GV_position2Now,GV_position3Now,GV_position4Now);

	}



	//position Up

	function _drawBlock(){

		//alert(GV_position1Now+"/"+GV_position2Now+"/"+GV_position3Now+"/"+GV_position4Now);

		drawBlock(GV_position1Now,GV_position2Now,GV_position3Now,GV_position4Now);

	}



	//change lotation

	function _blockMoveRotation(){

		var direction = true;

		switch(GV_blockPatternNow){

			case PATTERN1:

			case PATTERN2:

			case PATTERN6:

				GV_direction = GV_direction ? false : true;

			case PATTERN4:

			case PATTERN5:

			case PATTERN7:

				GV_direction = true;

				break;

			}

			GV_position1Now = positionRotate(GV_position2Now, GV_position1Now,GV_direction);

			GV_position3Now = positionRotate(GV_position2Now, GV_position3Now,GV_direction);

			GV_position4Now = positionRotate(GV_position2Now, GV_position4Now,GV_direction);

	}

	function _blockMoveFire(){



		GV_position5Now = GV_position4Now;



		while(!GV_blockStorage[GV_position5Now+areaWidth]){			

			GV_position5Now += areaWidth;							

		}				

		GV_blockStorage[GV_position5Now] = true;

		document.getElementById("p"+GV_position5Now).style.backgroundColor = BLOCK_COLOR;	

		_eraseBlock();

		var score = _blockSuccesCheck();		//점수계산

		GV_scoreTotal = GV_scoreTotal + score;		//점수종합

		

		

	}



	//move end

	function _blockMoveSpace(){

		while(!_downCollisionCheck()){

			GV_position1Now += areaWidth ;

			GV_position2Now += areaWidth ;

			GV_position3Now += areaWidth ;

			GV_position4Now += areaWidth ;

		}

	}

	//move down

	function _blockMoveDown(){

		GV_position1Now += areaWidth ;

		GV_position2Now += areaWidth ;

		GV_position3Now += areaWidth ;

		GV_position4Now += areaWidth ;

	}

	//move Right

	function _blockMoveRight(){

		GV_position1Now += RIGHT;

		GV_position2Now += RIGHT;

		GV_position3Now += RIGHT;

		GV_position4Now += RIGHT;

	}

	//move down

	function _blockMoveLeft(){

		GV_position1Now += LEFT;

		GV_position2Now += LEFT;

		GV_position3Now += LEFT;

		GV_position4Now += LEFT;

	}

	//decisionBlock

	function _decisionBlock(){

		GV_blockStorage[GV_position1Now] = true;

		GV_blockStorage[GV_position2Now] = true;

		GV_blockStorage[GV_position3Now] = true;

		GV_blockStorage[GV_position4Now] = true;

	}



	//down collisioncheck

	function _downCollisionCheck(){

		return _collisionCheck(GV_position1Now+areaWidth,GV_position2Now+areaWidth,GV_position3Now+areaWidth,GV_position4Now+areaWidth);

	}



	//right collisioncheck

	function _rightCollisionCheck(){

		return _collisionCheck(GV_position1Now+RIGHT,GV_position2Now+RIGHT,GV_position3Now+RIGHT,GV_position4Now+RIGHT);

	}



	//left collisioncheck

	function _leftCollisionCheck(){

		return _collisionCheck(GV_position1Now+LEFT,GV_position2Now+LEFT,GV_position3Now+LEFT,GV_position4Now+LEFT);

	}



	//roteatecollisioncheck

	function _roteateCollisionCheck(){

		var direction = true;

		switch(GV_blockPatternNow){

			case PATTERN1:

			case PATTERN2:

			case PATTERN6:

				GV_direction = GV_direction ? false : true;

			case PATTERN4:

			case PATTERN5:

			case PATTERN7:

				GV_direction = true;

				break;

		}

		return _collisionCheck(	positionRotate(GV_position2Now, GV_position1Now, direction), 

					GV_position2Now, 

					positionRotate(GV_position2Now, GV_position3Now, direction), 

					positionRotate(GV_position2Now, GV_position4Now, direction));

	}



	//collisioncheck

	function _collisionCheck(p1,p2,p3,p4){

		return collisionCheck(p1, p2, p3, p4, GV_blockStorage);

	}



	//end check

	function _endCheck(){

		var p1_after = GV_position1Now + areaWidth;

		var p2_after = GV_position2Now + areaWidth;

		var p3_after = GV_position3Now + areaWidth;

		var p4_after = GV_position4Now + areaWidth;



		if(!_downCollisionCheck()) return false;

		if(p1_after < 1 || p2_after < 1 || p3_after < 1 || p4_after < 1 ) return true;

		return false;

	}	



	function drawBlockBody(id, rowNum, colNum, createId){

		

		var table = document.getElementById(id);

		

		for(var rowline=0; rowline < rowNum; rowline ++){

			var row = table.insertRow(-1);



			for(var cellNum = 1; cellNum < colNum + 1; cellNum++){

				var cell = row.insertCell(cellNum -1);

				var num = (rowline * (colNum + 1)) + cellNum;

				cell.id = createId + num;

				cell.borderColor = "black";

			}

		}

	}



	function deleteBlockBody(id, rowNum, colNum){

		

		var table = document.getElementById(id);

	

		for(var rowline=0; rowline < rowNum; rowline ++){

			table.deleteRow(rowline);



			//for(var cellNum = 1; cellNum < colNum + 1; cellNum++){

			//	var cell = row.deleteCell(cellNum -1);

			//}

		}

	}



	function eraseBlock(p1, p2, p3, p4) {

  		if(p1>0) document.getElementById("p"+p1).style.backgroundColor = "white";

		if(p2>0) document.getElementById("p"+p2).style.backgroundColor = "white";

		if(p3>0) document.getElementById("p"+p3).style.backgroundColor = "white";

		if(p4>0) document.getElementById("p"+p4).style.backgroundColor = "white";

	}



	function drawBlock(p1, p2, p3, p4) {

		if(p1>0) document.getElementById("p"+p1).style.backgroundColor = BLOCK_COLOR;

		if(p2>0) document.getElementById("p"+p2).style.backgroundColor = BLOCK_COLOR;

		if(p3>0) document.getElementById("p"+p3).style.backgroundColor = BLOCK_COLOR;

		if(p4>0) document.getElementById("p"+p4).style.backgroundColor = BLOCK_COLOR;

	}	



	function positionRotate(center, position, direction){

		

		var _centerAxis = Math.floor(center / areaWidth);	//10);

		var _positionAxis = Math.floor(position / areaWidth);	//10);

		var result = 0;

		var dif = 0;



		if(_centerAxis == _positionAxis){



			if(center < position) {

			dif = position - center;

				if(direction) return (position + ((areaWidth-1)*dif));

				if(!direction) return (position - ((areaWidth+1)*dif));

			}

			if(center > position){

				dif = position - center;

				if(direction) return (position + ((areaWidth-1)*dif));

				if(!direction) return (position - ((areaWidth+1)*dif));

			}

		}

		var _position_Axis_x = position % areaWidth; 	// 10;

		var _center_Axis_x = center % areaWidth;	//10;



		if(_centerAxis < _positionAxis){

			dif = _positionAxis - _centerAxis;

			if(_position_Axis_x > _center_Axis_x ){

				if(direction) return (position - (2*dif));

				if(!direction) return (position - (areaWidth*2*dif));

			}

			if(_position_Axis_x == _center_Axis_x){

				if(direction) return (position - ((areaWidth+1)*dif));

				if(!direction) return (position - ((areaWidth-1)*dif));

			}

			if(_position_Axis_x < _center_Axis_x ){

				if(direction) return (position - (areaWidth*2*dif));

				if(!direction) return (position + (2*dif));

			}

		}

		if(_centerAxis > _positionAxis){

			dif = _centerAxis - _positionAxis;

			if(_position_Axis_x < _center_Axis_x ){

				if(direction) return (position + (2*dif));

				if(!direction) return (position + (areaWidth*2*dif));

			} 

			if(_position_Axis_x == _center_Axis_x){

				if(direction) return (position + ((areaWidth+1)*dif));

				if(!direction) return (position + ((areaWidth-1)*dif));

			}

			if(_position_Axis_x > _center_Axis_x ){

				if(direction) return (position + (areaWidth*2*dif));

				if(!direction) return (position - (2*dif));

			}

		}

	}



	//block pattern

	function generatePatternNum(){		// 블럭 패턴 지정

		if(somePTN != '')

			return somePTN;

		else{

		var random = Math.random();

		return Math.ceil(random*10)%7;

		}

	}



	function blockSuccesCheck(blockArray){

		var score = 0;

		while(_lineCheck(blockArray) != 0){

			_lineBreak(_lineCheck(blockArray), blockArray);

			score = score + areaWidth;

		}

		return score;

	}



	//line check

	function _lineCheck(blockArray){

		for(var length=areaHeight-2; length >=0; length--){

			if(_isAll(length, blockArray)) return length;

		}

		return 0;

	}



	function _lineBreak(lineNum, blockArray){

		for(var length=lineNum; length >0; length--){

			_blockDown(length, blockArray);

		}

		_createNewBlock(0, blockArray);

	}



	function _isAll(lineNum, blockArray){

		for(var i=1; i<areaWidth; i++){			

			var checkNum = (lineNum * areaWidth ) + i;	

			if(!blockArray[checkNum]) return false;

		}

		return true;

	}



	function _createNewBlock(lineNum, blockArray){

		for(var i = 1; i<areaWidth; i++){			

			var _block = (lineNum *areaWidth ) + i;	//10) + i;

			blockArray[_block] = false;

			document.getElementById("p" + _block).style.backgroundColor = "white";

		}

	}

	function _blockDown(lineNum, blockArray){

		var line_now = lineNum;

		var line_Up = lineNum - 1;

		for(var i = 1; i<areaWidth; i++){			

			var now_block = line_now*areaWidth + i;	//10 + i;

			var up_block = line_Up*areaWidth + i;	//10 + i;

			var positionObj_now = document.getElementById("p"+now_block);

			var positionObj_up = document.getElementById("p"+up_block);

			blockArray[now_block] = blockArray[up_block];			

			positionObj_now.style.backgroundColor = positionObj_up.style.backgroundColor;

		}

	}



	function collisionCheck(p1, p2, p3, p4, blockArray){

		return (blockArray[p1] || blockArray[p2] || blockArray[p3] || blockArray[p4]);

	}	



	function reSet(){

		location.reload();

		//delete GV_blockStorage;

		//var gameover = document.getElementById("mainview");

		//var tbl= document.getElementById("body");

		

		//_deleteBlockBody();

		//	

		//gameover.removeChild(tbl);

	}

//})();
