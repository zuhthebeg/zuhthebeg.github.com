let currentLevel = 3;
let moves = 0;
let timer = 0;
let timerInterval;
let tiles = [];
const board = document.getElementById('puzzle-board');
let isAnimating = false;
let isGameStarted = false;
let isGameWon = false;
let backgroundImage = null;
let resetClickCount = 0;
let lastClickTime = 0;
let fileInput = null;

// 게임 초기화
function initGame(level) {
    currentLevel = level;
    resetGame();
    generateBoard(level);
    addEventListeners();
    addResetButton();
    updateHighScores();
    // 팝업 강제 숨김
    document.getElementById('win-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';

    if (backgroundImage) {
        const tileSize = 100 / level;
        tiles.forEach((tile, index) => {
            if (!tile.classList.contains('empty')) {
                const originalValue = parseInt(tile.dataset.value) - 1;
                const row = Math.floor(originalValue / level);
                const col = originalValue % level;
                
                tile.style.backgroundImage = `url(${backgroundImage})`;
                tile.style.backgroundSize = `${level * 100}%`;
                tile.style.backgroundPosition = 
                    `${(col * 100) / (level - 1)}% ${(row * 100) / (level - 1)}%`;
            } else {
                tile.style.backgroundImage = '';
            }
        });

        // 타일을 정답 상태로 초기화
        updateBoardPositions();
    } else {
        tiles.forEach(tile => {
            tile.style.backgroundImage = '';
        });
    }
}

// 보드 생성
function generateBoard(size) {
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    board.innerHTML = '';
    tiles = [];
    
    // 타일 생성 및 배치
    for(let i = 0; i < size * size; i++) {
        const tile = document.createElement('div');
        tile.style.width = `calc(${100/size}% - 2px)`;
        tile.style.height = `calc(${100/size}% - 2px)`;
        
        if(i === size * size - 1) {
            // 마지막 위치에 빈 칸 생성
            tile.className = 'tile empty';
        } else {
            tile.className = 'tile';
            tile.textContent = i + 1;
            tile.dataset.value = i + 1;
        }
        
        // 초기 위치 설정
        const x = (i % size) * 100;
        const y = Math.floor(i / size) * 100;
        tile.style.transform = `translate(${x}%, ${y}%)`;
        
        board.appendChild(tile);
        tiles.push(tile);
    }
    
    // 타일 섞기 전에 잠시 대기
    setTimeout(() => {
       shuffleTiles();
    }, 100);
}

function shuffleTiles() {
    const size = currentLevel;
    const lastIndex = size * size - 1;

    let solvable = false;
    let indices;
    
    while (!solvable) {
        // 빈 칸을 제외한 타일들의 인덱스만 섞기
        indices = Array.from({ length: lastIndex }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // 전환 수(inversions) 계산
        let inversions = 0;
        for (let i = 0; i < indices.length - 1; i++) {
            for (let j = i + 1; j < indices.length; j++) {
                if (indices[i] > indices[j]) inversions++;
            }
        }

        // 퍼즐 해결 가능 여부 판단
        solvable = size % 2 === 1
            ? inversions % 2 === 0
            : (inversions % 2) === 0;
    }

    // 섞인 인덱스에 따라 타일 재배치
    const newTiles = [];
    for (let i = 0; i < lastIndex; i++) {
        const tile = tiles[indices[i]];
        const x = (i % size) * 100;
        const y = Math.floor(i / size) * 100;
        tile.style.transform = `translate(${x}%, ${y}%)`;
        newTiles.push(tile);
    }

    // 빈 칸을 항상 마지막 위치에 배치
    const emptyTile = tiles[lastIndex];
    const x = (lastIndex % size) * 100;
    const y = Math.floor(lastIndex / size) * 100;
    emptyTile.style.transform = `translate(${x}%, ${y}%)`;
    newTiles.push(emptyTile);

    tiles = newTiles;
}


// 타일 이동 처리
async function handleMove(clickedTile) {
    if(isAnimating || isGameWon) return;  // 승리 상태일 때는 이동 불가
    if(!isGameStarted) isGameStarted = true;
    
    const emptyTile = tiles.find(t => t.classList.contains('empty'));
    const clickedIndex = tiles.indexOf(clickedTile);
    const emptyIndex = tiles.indexOf(emptyTile);

    const {direction, distance} = getSlideDirection(clickedIndex, emptyIndex);
    if(!direction) return;

    const movePath = getMovePath(clickedIndex, emptyIndex, direction);
    if(movePath.length === 0) return;

    isAnimating = true;
    
    // 타일 배열 업데이트
    for(const {from, to} of movePath) {
        [tiles[from], tiles[to]] = [tiles[to], tiles[from]];
    }
    
    // 시각적 위치 업데이트
    tiles.forEach((tile, index) => {
        const x = (index % currentLevel) * 100;
        const y = Math.floor(index / currentLevel) * 100;
        tile.style.transform = `translate(${x}%, ${y}%)`;
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    
    moves++;
    document.getElementById('moves').textContent = moves;
    updateTileStates();
    checkWin();
    isAnimating = false;
}

// 슬라이드 방향 및 거리 계산
function getSlideDirection(clickedIndex, emptyIndex) {
    const clickedRow = Math.floor(clickedIndex / currentLevel);
    const clickedCol = clickedIndex % currentLevel;
    const emptyRow = Math.floor(emptyIndex / currentLevel);
    const emptyCol = emptyIndex % currentLevel;

    if(clickedRow === emptyRow) {
        return {
            direction: 'horizontal',
            distance: clickedCol - emptyCol
        };
    }
    if(clickedCol === emptyCol) {
        return {
            direction: 'vertical',
            distance: clickedRow - emptyRow
        };
    }
    return {direction: null};
}

// 이동 경로 생성
function getMovePath(clickedIndex, emptyIndex, direction) {
    const path = [];
    const step = direction === 'horizontal' 
        ? (clickedIndex > emptyIndex ? 1 : -1)
        : (clickedIndex > emptyIndex ? currentLevel : -currentLevel);
    
    // 시작 위치부터 클릭한 타일까지의 모든 타일을 이동 경로에 추가
    for (let current = emptyIndex; 
         direction === 'horizontal' 
            ? (step > 0 ? current < clickedIndex : current > clickedIndex)
            : (step > 0 ? current < clickedIndex : current > clickedIndex); 
         current += step) {
        path.push({
            from: current + step,
            to: current
        });
    }
    
    return path;
}

// 애니메이션 수행
function performSlideAnimation(movePath) {
    return new Promise(resolve => {
        // 타일 배열 업데이트
        for(const {from, to} of movePath) {
            [tiles[from], tiles[to]] = [tiles[to], tiles[from]];
        }
        
        // 시각적 위치 업데이트
        tiles.forEach((tile, index) => {
            const x = (index % currentLevel) * 100;
            const y = Math.floor(index / currentLevel) * 100;
            tile.style.transform = `translate(${x}%, ${y}%)`;
        });

        setTimeout(resolve, 200);
    });
}

// 보드 위치 업데이트
function updateBoardPositions(shuffle = false) {
    tiles.forEach((tile, index) => {
        const x = (index % currentLevel) * 100;
        const y = Math.floor(index / currentLevel) * 100;
        if(shuffle) {
            tile.style.transition = 'none';
        }
        tile.style.transform = `translate(${x}%, ${y}%)`;
    });
    
    if(shuffle) {
        setTimeout(() => {
            tiles.forEach(tile => {
                tile.style.transition = 'transform 0.2s ease';
            });
        }, 10);
    }
}

// 타일 상태 업데이트
function updateTileStates() {
    tiles.forEach((tile, index) => {
        if(tile.classList.contains('empty')) return;
        const correctPos = parseInt(tile.dataset.value) === index + 1;
        tile.classList.toggle('correct', correctPos);
    });
}

// 승리 조건 확인
function checkWin() {
    const isWin = tiles.every((tile, index) => 
        index === tiles.length - 1 || 
        (tile && parseInt(tile.dataset.value) === index + 1)
    );
    
    if(isWin) {
        isGameWon = true;
        clearInterval(timerInterval);
        saveScore();
        updateHighScores();
        
        // CLEAR 메시지 생성
        const clearEffect = document.createElement('div');
        clearEffect.className = 'clear-effect';
        clearEffect.innerHTML = `
            <div class="clear-text">CLEAR!</div>
            <div class="particles"></div>
        `;
        document.body.appendChild(clearEffect);
        
        // 모바일 감지
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        // 모바일 환경별 애니메이션 조정
        clearEffect.style.transform = isMobile 
            ? 'translate(-50%, -50%) scale(1.2)' 
            : 'translate(-50%, -50%)';
        
        setTimeout(() => {
            clearEffect.remove();
        }, isMobile ? 1500 : 1000);
    }
}

// 게임 리셋
function resetGame() {
    moves = 0;
    timer = 0;
    isGameStarted = false;
    isGameWon = false;  // 게임 리셋 시 승리 플래그 초기화
    clearInterval(timerInterval);
    document.getElementById('moves').textContent = '0';
    document.getElementById('timer').textContent = '0';
    
    timerInterval = setInterval(() => {
        if(isGameStarted) {
            timer++;
            document.getElementById('timer').textContent = timer;
        }
    }, 1000);
}

// 이벤트 리스너
function addEventListeners() {
    document.getElementById('level-select').addEventListener('change', (e) => {
        currentLevel = parseInt(e.target.value);
        initGame(currentLevel);
        updateHighScores();
        document.getElementById('puzzle-board').focus();
    });

    // 랜덤 이미지 버튼 이벤트
    document.getElementById('random-image-btn').addEventListener('click', () => {
        backgroundImage = `https://picsum.photos/460?random=${Date.now()}`;
        startNewGame();
    });

    // 파일 입력 초기화 함수
    initFileUpload();

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    // 터치 이벤트 처리
    board.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        e.preventDefault();
    }, {passive: false});

    board.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const duration = touchEndTime - touchStartTime;
        
        // 빠른 탭 동작 처리 (200ms 미만)
        if (duration < 200 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            const target = document.elementFromPoint(touchEndX, touchEndY);
            if(target?.classList.contains('tile') && !target.classList.contains('empty')) {
                handleMove(target);
            }
            e.preventDefault();
            return;
        }

        // 슬라이드 동작 처리
        const minSwipeDistance = 30; // 최소 슬라이드 거리
        if (Math.abs(dx) > minSwipeDistance || Math.abs(dy) > minSwipeDistance) {
            const emptyTile = tiles.find(t => t.classList.contains('empty'));
            const emptyIndex = tiles.indexOf(emptyTile);
            const emptyRow = Math.floor(emptyIndex / currentLevel);
            const emptyCol = emptyIndex % currentLevel;
            
            // 슬라이드 방향 결정
            let targetIndex = -1;
            if (Math.abs(dx) > Math.abs(dy)) {
                // 수평 슬라이드
                if (dx > 0 && emptyCol > 0) { // 오른쪽으로 슬라이드
                    targetIndex = emptyIndex - 1;
                } else if (dx < 0 && emptyCol < currentLevel - 1) { // 왼쪽으로 슬라이드
                    targetIndex = emptyIndex + 1;
                }
            } else {
                // 수직 슬라이드
                if (dy > 0 && emptyRow > 0) { // 아래로 슬라이드
                    targetIndex = emptyIndex - currentLevel;
                } else if (dy < 0 && emptyRow < currentLevel - 1) { // 위로 슬라이드
                    targetIndex = emptyIndex + currentLevel;
                }
            }
            
            // 유효한 이동이면 처리
            if (targetIndex >= 0 && targetIndex < tiles.length) {
                handleMove(tiles[targetIndex]);
            }
        }
        e.preventDefault();
    }, {passive: false});

    // 마우스 이벤트 처리
    board.addEventListener('click', e => {
        const target = e.target;
        if(target.classList.contains('tile') && !target.classList.contains('empty')) {
            handleMove(target);
        }
    });

    // 키보드 이벤트 추가
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            startNewGame();
        } else if (e.key === 'Escape') {
            closeWinPopup();
        } else if (isAnimating || isGameWon) return;

        const emptyTile = tiles.find(t => t.classList.contains('empty'));
        const emptyIndex = tiles.indexOf(emptyTile);
        const emptyRow = Math.floor(emptyIndex / currentLevel);
        const emptyCol = emptyIndex % currentLevel;

        let targetIndex = -1;

        switch (e.key) {
            case 'ArrowUp':
                if (emptyRow > 0) targetIndex = emptyIndex - currentLevel;
                break;
            case 'ArrowDown':
                if (emptyRow < currentLevel - 1) targetIndex = emptyIndex + currentLevel;
                break;
            case 'ArrowLeft':
                if (emptyCol > 0) targetIndex = emptyIndex - 1;
                break;
            case 'ArrowRight':
                if (emptyCol < currentLevel - 1) targetIndex = emptyIndex + 1;
                break;
        }

        if (targetIndex >= 0 && targetIndex < tiles.length) {
            handleMove(tiles[targetIndex]);
        }
    });

    // 게임 보드에 tabindex 추가하여 포커스 가능하게 설정
    board.setAttribute('tabindex', '0');
    board.focus();
}

function startNewGameWithBlank(){
    backgroundImage = null; // 배경 이미지 변수 초기화
    document.querySelectorAll('.tile').forEach(tile => {
        tile.style.backgroundImage = '';
    });
    startNewGame()
}
// 새 게임 시작
function startNewGame() {
    initGame(currentLevel);
}

// 점수 저장 함수
function saveScore() {
    const now = new Date();
    const scoreEntry = {
        date: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        moves: moves,
        seconds: timer,
        level: currentLevel
    };

    const storageKey = `puzzleScores-level${currentLevel}`;
    const scores = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // 중복 기록 방지
    const isDuplicate = scores.some(entry => 
        entry.moves === moves && entry.seconds === timer
    );
    
    if (!isDuplicate) {
        scores.push(scoreEntry);
        scores.sort((a, b) => a.moves - b.moves || a.seconds - b.seconds);
        
        // 최고 기록인지 확인
        if (scores[0] === scoreEntry) {
            showHighScoreAnimation();
        }
        
        localStorage.setItem(storageKey, JSON.stringify(scores.slice(0, 5)));
    }
}

function showHighScoreAnimation() {
    // 컨페티 효과
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDelay = `${Math.random() * 1}s`;
        document.body.appendChild(confetti);
        
        // 컨페티 제거
        setTimeout(() => {
            confetti.remove();
        }, 2000);
    }
}

function updateHighScores() {
    const storageKey = `puzzleScores-level${currentLevel}`;
    const scores = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const list = document.getElementById('high-scores');
    list.innerHTML = '';

    if(scores.length === 0) {
        list.innerHTML = `<li>🗑️</li>`;
        return;
    }

    scores.slice(0, 3).forEach((entry, index) => {
        const li = document.createElement('li');
        if (index === 0) {
            li.classList.add('high-score-entry');
        }
        li.innerHTML = `
            <span>${entry.date} ${entry.time}</span>
            <span>↔️${entry.moves}  ⏱${entry.seconds}</span>
        `;
        list.appendChild(li);
    });
}

// 팝업 닫기 함수 보강
function closeWinPopup() {
    const popup = document.getElementById('win-popup');
    const overlay = document.getElementById('overlay');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    
    // 팝업 닫힌 후 스코어보드 애니메이션 실행
    setTimeout(() => {
        const storageKey = `puzzleScores-level${currentLevel}`;
        const scores = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (scores.length > 0 && scores[0].moves === moves && scores[0].seconds === timer) {
            showHighScoreAnimation();
            // 스코어보드 업데이트 및 애니메이션
            updateHighScores();
            const highScoreList = document.getElementById('high-scores');
            highScoreList.classList.add('high-score-entry');
            setTimeout(() => {
                highScoreList.classList.remove('high-score-entry');
            }, 1000);
        }
    }, 100); // 100ms 지연 추가
}

document.getElementById('overlay').addEventListener('click', closeWinPopup);
// 초기화 버튼 추가
function addResetButton() {
    const title = document.querySelector('#score-board h3');
    if (!title.querySelector('.reset-scores')) {
        const resetBtn = document.createElement('span');
        resetBtn.className = 'reset-scores';
        resetBtn.title = '기록 초기화';
        resetBtn.addEventListener('click', resetHighScores);
        title.appendChild(resetBtn);
    }
}

// 기록 초기화 함수
function resetHighScores() {
    if (confirm('모든 기록을 초기화하시겠습니까?')) {
        const storageKey = `puzzleScores-level${currentLevel}`;
        localStorage.removeItem(storageKey);
        updateHighScores();
    }
}

// 로딩 표시기 생성 함수
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-spinner';
    document.body.appendChild(loading);
    return loading;
}

// 파일 입력 초기화 함수
function initFileUpload() {
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'global-file-input';
        fileInput.style.display = 'none';
        fileInput.accept = 'image/*';
        fileInput.onchange = handleImageUpload; // onclick → onchange로 변경
        document.body.appendChild(fileInput);
    }
}

// 이미지 업로드 버튼 이벤트
document.getElementById('image-upload-btn').onclick = function() {
    initFileUpload();
    fileInput.value = ''; // 이전 선택 초기화
    fileInput.click();
};

// 이미지 업로드 핸들러 수정
async function handleImageUpload(e) {
    const loading = showLoading();
    try {
        const file = e.target.files[0];
        if (!file) return;

        // 이미지 로드 타임아웃 설정 (5초)
        const img = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            setTimeout(() => reject(new Error('이미지 로드 시간 초과')), 5000);
            reader.readAsDataURL(file);
        });
        
        backgroundImage = img;
        startNewGame();
    } catch (error) {
        showErrorToast('⚠️ 이미지 로드 실패: ' + error.message);
    } finally {
        loading.remove();
    }
}

// 스코어보드 초기화 함수 추가
function initializeScoreBoard() {
    const title = document.querySelector('#score-board h3');
    title.innerHTML = '🏆';  // 제목 설정
    title.addEventListener('click', handleTrophyClick);
}

function handleTrophyClick() {
    const now = Date.now();
    if (now - lastClickTime < 1000) { // 1초 내 클릭
        resetClickCount++;
        if (resetClickCount === 5) {
            resetHighScores();
            resetClickCount = 0;
        }
    } else {
        resetClickCount = 1;
    }
    lastClickTime = now;
}

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    initGame(3);
    initializeScoreBoard();
    initFileUpload();
});

// PWA 서비스 워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker 등록 성공:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker 등록 실패:', error);
            });
    });
}